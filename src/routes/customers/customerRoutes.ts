import express from 'express'
import { handleError, handleResponse } from '../routeUtils'
import CustomerController from '../../models/Sales/Customer/customerController'

const customerRouter = express.Router()

customerRouter.post('/', (req, res) => {
  try {
    // const id = 1
    // console.log('params', req.params)
    const customer = req.body as unknown
    CustomerController.create(customer)
      .then((result) => {
        const customerResult = CustomerController.toJSON(result)
        handleResponse(res, customerResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

customerRouter.get('/:id', (req, res) => {
  try {
    CustomerController.get(req.params.id)
      .then((result) => {
        const customerResult = CustomerController.toJSON(result)
        handleResponse(res, customerResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

customerRouter.put('/:id', (req, res) => {
  try {
    const customer = req.body as unknown
    CustomerController.update(req.params.id, customer)
      .then((result) => {
        const customerResult = CustomerController.toJSON(result)
        handleResponse(res, customerResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

export default customerRouter
