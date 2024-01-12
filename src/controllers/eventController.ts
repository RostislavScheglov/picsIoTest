import { RequestHandler, Response } from 'express'
import { CustomRequest } from '../middleware/jwtInjection'
import destinationsConfig from '../config/destinationsConfig.json'

type Destination = { [name: string]: boolean }
type PosibleDestinations = Array<Destination>

interface CustomRequestHandler extends RequestHandler {
  (req: CustomRequest, res: any): any
}
type HardcodedStrategys = 'ALL' | 'ANY'
type StrategyFunction = (destinations: PosibleDestinations) => boolean

export type Event = {
  payload: any
  possibleDestinations: PosibleDestinations[]
  // strategy?: HardcodedStrategys | String
  strategy?: HardcodedStrategys | StrategyFunction
}

const defaultStrategy = 'ALL'

const strategies = {
  //Strategy functions
  ALL: (destinations: PosibleDestinations) => {
    const filteredDestinations = destinations.filter(
      (intent) => intent !== undefined
    )
    return filteredDestinations.every((intent) => intent)
  },
  ANY: (destinations: PosibleDestinations) =>
    destinations.some((intent) => intent),
}

export const eventController: CustomRequestHandler = async (req, res) => {
  const event: Event = req.body.event
  const strategy = event.strategy || defaultStrategy
  let strategyFunction: any

  if (strategy === 'ALL' || strategy === 'ANY') {
    strategyFunction = strategies[strategy]
  } else {
    const customClientSrategy: StrategyFunction = new Function( //This is not safe, but we should make function from client string
      'posibleDestinations',
      ('return ' + strategy) as any
    ) as StrategyFunction
    strategyFunction = customClientSrategy //Additional check on function is needed
  }
  // Get all unique keys from destinations
  const uniqueKeys = event.possibleDestinations.reduce(
    (keys: string[], obj: Destination[]) => {
      Object.keys(obj).forEach((key) => {
        if (!keys.includes(key)) {
          keys.push(key)
        }
      })
      return keys
    },
    []
  )

  const destinationResults = uniqueKeys.map((key: any) => {
    const destinationsForKey = event.possibleDestinations.map(
      (destination) => destination[key]
    )
    let result = strategyFunction(destinationsForKey)
    // If strategy is custom function additional check is needed
    if (typeof result === 'function') {
      result = result(destinationsForKey)
    }
    return { [key]: result }
  })
  const config = destinationsConfig
  return res.status(200).send('Payload not sent due to routing strategy.')
}
