import * as yup from 'yup'
import { Response } from 'express'
import { ValidationError } from 'sequelize'
import { printYellowLine } from '../utils/utils'
import { DBError } from '../ErrorManagement/errors'

export const handleResponse = (res: Response, data: unknown) => {
  if (data === null) {
    res.status(204).send()
    return
  }
  res.status(200).send(data)
}
export const handleError = (res: Response, err: unknown) => {
  // printYellowLine()
  if (err instanceof Error) {
    // err.errors
    // console.log(err, Object.keys(err))
    if (err instanceof yup.ValidationError) {
      // console.log('this is a validation error! ', err.errors)
      // const errMessage = err.errors.join(',')
      res.status(400).json({ error: 'Data validation error', errors: err.errors })
      return
    }
    if (err instanceof DBError) {
      res.status(err.code).json({ error: err.message })
      return
    }
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
