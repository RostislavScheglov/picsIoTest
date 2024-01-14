import { Request, RequestHandler, Response } from 'express'
import destinationsConfig from '../config/destinationsConfig.json'
import { TransactionSchema } from '../dbmodels/loggingModels'
import {
  formatDestinations,
  getFilteredKeys,
  getUniqueKeys,
} from '../helpers/helperFunctions'
import {
  applyStrategies,
  consoleActions,
  defaultStrategy,
  destinationsCheck,
  getStrategy,
} from '../mainLogic/mainLogicFunctions'
import {
  CustomRequestHandler,
  Event,
  StrategyFunction,
} from '../types/mainTypes'

export const eventController: CustomRequestHandler = async (req, res) => {
  const event: Event = req.body.event

  const strategy = event.strategy || defaultStrategy
  //Get needeble strategy
  const strategyFunction: StrategyFunction = getStrategy(strategy)

  // Get all unique keys from possibleDestinations
  const uniqueDestinations = getUniqueKeys(event.possibleDestinations)

  //Check if uniqueDestinations are in destinationConfig
  destinationsCheck(uniqueDestinations)

  //Apply strategys to destinations and return array of objects with boolean results
  const destinationResults = applyStrategies(
    uniqueDestinations,
    event,
    strategyFunction
  )

  //Merge all objects in 1 to send in response
  const mergedObject = formatDestinations(destinationResults)

  // Filter out false values and get only keys
  const filteredKeys = getFilteredKeys(destinationResults)

  //Make actions from destinationConing with filteredKeys (destination names)
  filteredKeys.forEach(async (key: string) => {
    try {
      const destination = destinationsConfig.find(
        (destination) => destination.name === key
      )
      //if destination doesnt have url we will make console actions
      if (destination && !destination.url) {
        consoleActions(destination, event)
      }
      //if destination has url we will make request
      if (destination && destination.url) {
        const method = destination.transport.split('.')[1].toUpperCase() //We can use regex here but it`s more readable
        const headers = {
          'Content-Type': 'application/json',
        }
        const body: any = JSON.stringify(event.payload)
        const options = {
          method: method,
          headers: headers,
          body: body,
        }
        //If method is GET or DELETE we need to send payload in url
        if (method === 'GET' || method === 'DELETE') {
          options.body = null
          const encodedBody = encodeURIComponent(body) //safety encoding
          destination.url += `?data=${encodedBody}`
        }
        //Request to destination
        await fetch(destination.url, options)
          .then(async (response) => {
            const res = await response.json()
            const log = new TransactionSchema({
              request: {
                url: destination.url,
                method: options.method,
                query: destination.url.split('?')[1],
                body: options.body,
                headers: options.headers,
              },
              response: {
                status: response.status,
                headers: res.headers,
                body: res.json, //this way postman-echo api returns body
              },
            })
            await log.save()
          })
          .catch((error) => {
            console.error(
              `Cant fetch url: ${destination.url}; with method ${method}`,
              error
            )
          })
      }
    } catch (error) {
      console.error(`Error processing key ${key}:`, error)
    }
  })

  const log = new TransactionSchema({
    //Dont know if it was necessary to log additional info about transaction
    request: {
      url: req.url,
      method: req.method,
      body: req.body,
      headers: req.headers,
    },
    response: {
      status: res.statusCode,
      headers: res.getHeaders(),
      body: mergedObject,
    },
  })
  await log.save()
  return res.status(200).send(mergedObject)
}

//Get all logs from DB
export const getAllLogs = async (req: Request, res: Response) => {
  try {
    const logs = await TransactionSchema.find()
    console.log(logs)
    res.status(200).send(JSON.stringify(logs))
  } catch (err) {
    console.log(err)
    res.status(400).json({ msg: 'Error while getting logs' })
  }
}
