import express, { RequestHandler } from 'express'
import { jwtInjection } from '../middleware/jwtInjection'
import { jwtAuthorization } from '../middleware/jwtAuthorization'
import { eventController, getAllLogs } from '../controllers/eventController'

const eventRouter = express.Router()
//don`t know if it was neccessary to make like this
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
eventRouter.patch(
  '/',
  jwtInjection as RequestHandler,
  jwtAuthorization as RequestHandler,
  eventController
)
eventRouter.get('/logs', getAllLogs)

export default eventRouter
