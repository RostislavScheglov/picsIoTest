import {
  Destination,
  Event,
  PosibleDestinations,
} from '../controllers/eventController'
import destinationsConfig from '../config/destinationsConfig.json'
import { StrategyFunction } from '../controllers/eventController'

// Get all unique keys from possibleDestinations
export const getUniqueKeys = (
  possibleDestinations: PosibleDestinations[]
): string[] => {
  return possibleDestinations.reduce((keys: string[], obj: Destination[]) => {
    Object.keys(obj).forEach((key) => {
      if (!keys.includes(key)) {
        keys.push(key)
      }
    })
    return keys
  }, [])
}

//merge all objects in 1 to send in response
export const formatDestinations = (destinationResults: any) => {
  return destinationResults.reduce((prev: any, curr: any) => {
    return { ...prev, ...curr }
  }, {})
}

// Filter out false values and get only keys
export const getFilteredKeys = (destinationResults: any) => {
  const filteredResults = destinationResults.filter((result: any) => {
    return Object.values(result).every((value) => value !== false)
  })
  return filteredResults.reduce((keys: string[], result: any) => {
    Object.entries(result).forEach(([key, value]) => {
      if (value !== false) {
        keys.push(key)
      }
    })
    return keys
  }, [])
}
