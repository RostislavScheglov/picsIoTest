import jwt from 'jsonwebtoken'
import { NextFunction, Response } from 'express'
import { CustomRequest, secret } from './jwtInjection'

export function jwtAuthorization(
  req: CustomRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.token
    if (token) {
      const decoded = jwt.verify(token, secret)
      next()
    } else {
      return res.status(403).json([{ msg: 'No token' }])
    }
  } catch (err) {
    return res.status(403).json([{ msg: 'Bad session' }])
  }
}
