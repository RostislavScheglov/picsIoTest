import { Request, RequestHandler, Response } from 'express'

export type Destination = { [name: string]: boolean }
export type PosibleDestinations = Array<Destination>

export interface CustomRequestHandler extends RequestHandler {
  (req: CustomRequest, res: Response): void
}
type HardcodedStrategys = 'ALL' | 'ANY'

export type StrategyFunction = (
  destinations: PosibleDestinations
) => boolean | any

export type Strategy = HardcodedStrategys | StrategyFunction

export type Event = {
  payload: any
  possibleDestinations: PosibleDestinations[]
  strategy?: Strategy
}
export type confingDestination = {
  name: string
  transport: string
  url?: string
}
export interface CustomRequest extends Request {
  token?: string
  auth?: string
  event: Event
}
