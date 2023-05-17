import { Response } from 'express'
import { ValidationError } from 'sequelize'
import { printYellowLine } from '../utils/utils'

export const handleResponse = (res: Response, data: unknown) => res.status(200).send(data)
export const handleError = (res: Response, err: unknown) => {
  printYellowLine()
  if (err instanceof Error) {
    // err.errors
    console.log(err, Object.keys(err))
    if (err instanceof ValidationError) {
      const errMessage = err.errors.map((error) => error.message).join(', ')
      res.status(400).json({ error: `SQL validation error: ${errMessage}` })
      return
    }
    res.status(400).json({ error: err.message })
  } else {
    res.status(500).send({ error: 'unknown error' })
  }
}
