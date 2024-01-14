import { RequestHandler, Response } from 'express'
import { CustomRequest } from '../middleware/jwtInjection'
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
  strategies,
} from '../mainLogic/mainLogicFunctions'

export type Destination = { [name: string]: boolean }
export type PosibleDestinations = Array<Destination>

interface CustomRequestHandler extends RequestHandler {
  (req: CustomRequest, res: any): any
}
type HardcodedStrategys = 'ALL' | 'ANY'
export type StrategyFunction = (
  destinations: PosibleDestinations
) => boolean | any

export type Event = {
  payload: any
  possibleDestinations: PosibleDestinations[]
  // strategy?: HardcodedStrategys | String
  strategy?: HardcodedStrategys | StrategyFunction
}

export const eventController: CustomRequestHandler = async (req, res) => {
  const event: Event = req.body.event
  const strategy = event.strategy || defaultStrategy
  let strategyFunction: StrategyFunction

  if (strategy === 'ALL' || strategy === 'ANY') {
    strategyFunction = strategies[strategy]
  } else {
    const customClientSrategy: StrategyFunction = new Function( //This is not safe, but we should make function from client string
      'posibleDestinations',
      ('return ' + strategy) as any
    ) as StrategyFunction
    strategyFunction = customClientSrategy //Additional check on function is needed
  }

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

  //Make actions from destinationConing with filteredKeys
  filteredKeys.forEach(async (key: any) => {
    try {
      const destination = destinationsConfig.find(
        (destination) => destination.name === key
      )
      if (destination && !destination.url) {
        consoleActions(destination, event)
      }
      if (destination && destination.url) {
        const method = destination.transport.split('.')[1].toUpperCase() //We can use regex here but it`s more readable
        const headers = {
          'Content-Type': 'application/json',
        }
        //Requests to destination
        await fetch(destination.url, {
          //Problems with GET
          method: method,
          headers: headers,
          body: JSON.stringify(event.payload), // Stringify payload to be sured that it`s valid json
        })
          .then(async (response) => {
            const res = await response.json()
            const log = new TransactionSchema({
              request: {
                url: destination.url,
                method: method,
                body: event.payload,
                headers: headers,
              },
              response: {
                status: response.status,
                headers: res.headers,
                body: res.json, //this way postman api returns body
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

export const getAllLogs = async (req: any, res: any) => {
  try {
    const logs = await TransactionSchema.find()
    res.status(200).send(JSON.stringify(logs))
  } catch (err) {
    console.log(err)
    res.status(400).json({ msg: 'Error while getting logs' })
  }
}
