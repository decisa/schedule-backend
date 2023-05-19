import * as yup from 'yup'
import { Response } from 'express'
import { ValidationError } from 'sequelize'
import { printYellowLine } from '../utils/utils'

export const handleResponse = (res: Response, data: unknown) => res.sendStatus(200).send(data)
export const handleError = (res: Response, err: unknown) => {
  printYellowLine()
  if (err instanceof Error) {
    // err.errors
    console.log(err, Object.keys(err))
    if (err instanceof yup.ValidationError) {
      console.log('this is a validation error! ', err.errors)
      // const errMessage = err.errors.join(',')
      res.sendStatus(400).json({ error: 'Data validation error', errors: err.errors })
      return
    }
    if (err instanceof ValidationError) {
      const errMessage = err.errors.map((error) => error.message).join(', ')
      res.sendStatus(400).json({ error: `SQL validation error: ${errMessage}` })
      return
    }
    res.sendStatus(400).json({ error: err.message })
  } else {
    res.sendStatus(500).send({ error: 'unknown error' })
  }
}
