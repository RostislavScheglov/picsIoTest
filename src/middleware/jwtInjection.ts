import jwt from 'jsonwebtoken'
import { NextFunction, Response } from 'express'
import { Secret } from '../config/appConfing'
import { CustomRequest } from '../types/mainTypes'

export function jwtInjection( // Made this function beacuse there are no information about tokens in requests,
  req: CustomRequest, //but we should make jwt authorization
  res: Response,
  next: NextFunction
) {
  try {
    const token = jwt.sign(
      {
        _id: Math.floor(100000 + Math.random() * 900000), //Random id for authorization
      },
      Secret,
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
