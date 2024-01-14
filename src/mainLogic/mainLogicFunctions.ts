import {
  Destination,
  Event,
  PosibleDestinations,
} from '../controllers/eventController'
import destinationsConfig from '../config/destinationsConfig.json'
import { StrategyFunction } from '../controllers/eventController'

//Strategies
export const defaultStrategy = 'ALL'
export const strategies = {
  ALL: (destinations: PosibleDestinations) => {
    const filteredDestinations = destinations.filter(
      (intent) => intent !== undefined
    )
    return filteredDestinations.every((intent) => intent)
  },
  ANY: (destinations: PosibleDestinations) =>
    destinations.some((intent) => intent),
}

//Apply strategys to destinations and return array of objects with boolean results
export const applyStrategies = (
  uniqueDestinations: string[],
  event: Event,
  strategyFunction: StrategyFunction
) => {
  return uniqueDestinations.map((key: any) => {
    const destinationsForKey = event.possibleDestinations.map(
      (destination: Destination[]) => destination[key]
    )
    let result = strategyFunction(destinationsForKey)
    // If strategy is custom function additional check is needed
    if (typeof result === 'function') {
      result = result(destinationsForKey)
    }
    return { [key]: result }
  })
}

//Check if uniqueDestinations are in config if not log error
export const destinationsCheck = (uniqueDestinations: string[]) => {
  uniqueDestinations.forEach((key: string) => {
    if (!destinationsConfig.some((config) => config.name === key)) {
      console.error(`Error: unknown destination ${key}`)
    }
  })
}

export const consoleActions = (destination: any, event: Event) => {
  const action = destination.transport.split('.')[1]
  console.log(action)
  const consoleActions: { [key: string]: () => void } = {
    log: () => {
      console.log(event.payload)
    },
    warn: () => {
      console.warn(event.payload)
    },
    error: () => {
      console.error(event.payload)
    },
  }
  consoleActions[action]()
}
