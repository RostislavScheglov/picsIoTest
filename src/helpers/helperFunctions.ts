import { Destination, PosibleDestinations } from '../types/mainTypes'

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
export const formatDestinations = (destinationResults: Destination[]) => {
  return destinationResults.reduce((prev: Destination, curr: Destination) => {
    return { ...prev, ...curr }
  }, {})
}

// Filter out false values and get only keys
export const getFilteredKeys = (destinationResults: Destination[]) => {
  const filteredResults = destinationResults.filter((result: Destination) => {
    return Object.values(result).every((value) => value !== false)
  })
  return filteredResults.reduce((keys: string[], result: Destination) => {
    Object.entries(result).forEach(([key, value]) => {
      if (value !== false) {
        keys.push(key)
      }
    })
    return keys
  }, [])
}
