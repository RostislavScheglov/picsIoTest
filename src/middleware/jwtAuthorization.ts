import jwt from 'jsonwebtoken'
import { NextFunction, Response } from 'express'
import { CustomRequest } from './jwtInjection'
import { Secret } from '../config/appConfing'

export function jwtAuthorization(
  req: CustomRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.token
    if (!token) return res.status(403).json([{ msg: 'No token' }])
    const decoded: jwt.JwtPayload = jwt.verify(token, Secret) as jwt.JwtPayload
    req.auth = decoded._id //Authorizied request
    next()
  } catch (err) {
    return res.status(403).json([{ msg: 'Bad authorization token' }])
  }
}
