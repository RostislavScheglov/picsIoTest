import destinationsConfig from '../config/destinationsConfig.json'
import {
  Destination,
  Event,
  PosibleDestinations,
  Strategy,
  StrategyFunction,
  confingDestination,
} from '../types/mainTypes'

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
//Get needeble strategy
export const getStrategy = (strategy: Strategy) => {
  if (strategy === 'ALL' || strategy === 'ANY') {
    return strategies[strategy]
  } else {
    const customClientSrategy: StrategyFunction = new Function( //This is not safe, but we should make function from client string
      'posibleDestinations',
      ('return ' + strategy) as any
    ) as StrategyFunction
    return customClientSrategy //Additional check on function is needed
  }
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
//Make console actions
export const consoleActions = (
  destination: confingDestination,
  event: Event
) => {
  const action = destination.transport.split('.')[1]
  const consoleActions: { [key: string]: () => void } = {
    log: () => {
      console.log({ payload: event.payload, action: 'Log' })
    },
    warn: () => {
      console.warn({ payload: event.payload, action: 'Warn' })
    },
    error: () => {
      console.error({ payload: event.payload, action: 'Error' })
    },
  }
  consoleActions[action]()
}
