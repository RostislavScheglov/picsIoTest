import express, { RequestHandler } from 'express'
import { jwtInjection } from '../middleware/jwtInjection'
import { jwtAuthorization } from '../middleware/jwtAuthorization'
import { eventController } from '../controllers/eventController'

const eventRouter = express.Router()

eventRouter.get(
  '/',
  jwtInjection as RequestHandler,
  jwtAuthorization as RequestHandler,
  eventController
)
eventRouter.post(
  '/',
  jwtInjection as RequestHandler,
  jwtAuthorization as RequestHandler,
  eventController
)
eventRouter.put(
  '/',
  jwtInjection as RequestHandler,
  jwtAuthorization as RequestHandler,
  eventController
)
eventRouter.delete(
  '/',
  jwtInjection as RequestHandler,
  jwtAuthorization as RequestHandler,
  eventController
)

export default eventRouter
