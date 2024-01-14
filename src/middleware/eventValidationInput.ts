import { Request, Response, NextFunction } from 'express'

export function validateEventInput(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { possibleDestinations, payload } = req.body.event

  if (!possibleDestinations || !payload) {
    return res
      .status(400)
      .json({ error: 'Missing required fields: possibleDestinations, payload' })
  }

  next()
}
