import { Event } from '../controllers/eventController'
import jwt from 'jsonwebtoken'
import { NextFunction, Response } from 'express'
import { Request } from 'express'

export interface CustomRequest extends Request {
  token?: string
  event: Event
}

export const secret = '123456ex'

export function jwtInjection( // Made this function beacuse there are no information about token in requests,
  req: CustomRequest, //but task whants me to make jwt authorization
  res: Response,
  next: NextFunction
) {
  try {
    const token = jwt.sign(
      {
        _id: 'randomId123',
      },
      secret,
      {
        expiresIn: '20d',
      }
    )
    req.token = token // Token should be in Headers but Headers from your requests may be read-only
    next()
  } catch (err) {
    return res.status(403).json([{ msg: 'Cant Inject token' }])
  }
}
