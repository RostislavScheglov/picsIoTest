import { Request, Response } from 'express'
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
  try {
    const event: Event = req.body.event
    const strategy = event.strategy || defaultStrategy

    //Get needeble strategy
    const strategyFunction: StrategyFunction = getStrategy(strategy)

    // Get all unique keys from possibleDestinations
    const uniqueDestinations = getUniqueKeys(event.possibleDestinations)

    //Check if uniqueDestinations are in config if not log error
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

    //Go through all filteredKeys and make actions from destinationsConfig
    for (const key of filteredKeys) {
      try {
        const destination = destinationsConfig.find(
          (destination) => destination.name === key
        )

        if (destination) {
          if (!destination.url) {
            consoleActions(destination, event)
          } else {
            const method = destination.transport.split('.')[1].toUpperCase()
            const headers = {
              'Content-Type': 'application/json',
            }
            const body = event.payload
            const options = {
              method: method,
              headers: headers,
              body: body,
            }
            //If method is GET or DELETE we should send payload in query
            if (method === 'GET' || method === 'DELETE') {
              options.body = null
              const encodedBody = encodeURIComponent(body) //encode payload to safety send in query
              destination.url += `?data=${encodedBody}`
            }
            //Send request to destinations
            try {
              const response = await fetch(destination.url, options)
              const responseBody = await response.json()
              //Save logs from fetch requests
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
                  headers: responseBody.headers,
                  body: responseBody.json,
                },
              })

              await log.save()
            } catch (error) {
              console.error(
                `Error fetching data from ${destination.url}:`,
                error
              )
            }
          }
        }
      } catch (error) {
        console.error(`Error processing key ${key}:`, error)
      }
    }
    //Save logs from main request
    const log = new TransactionSchema({
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
  } catch (error) {
    return res.status(400).json({ msg: 'Error while processing event' })
  }
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
