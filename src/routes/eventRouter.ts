import express, { RequestHandler } from 'express'
import { jwtInjection } from '../middleware/jwtInjection'
import { jwtAuthorization } from '../middleware/jwtAuthorization'
import { eventController, getAllLogs } from '../controllers/eventController'
import { validateEventInput } from '../middleware/eventValidationInput'

const eventRouter = express.Router()
//don`t know if it was neccessary to make like this
eventRouter.post(
  '/',
  validateEventInput as RequestHandler,
  jwtInjection as RequestHandler,
  jwtAuthorization as RequestHandler,
  eventController
)
eventRouter.put(
  '/',
  validateEventInput as RequestHandler,
  jwtInjection as RequestHandler,
  jwtAuthorization as RequestHandler,
  eventController
)
eventRouter.patch(
  '/',
  validateEventInput as RequestHandler,
  jwtInjection as RequestHandler,
  jwtAuthorization as RequestHandler,
  eventController
)
eventRouter.get('/logs', getAllLogs)

export default eventRouter
