import express from 'express'
import { handleError, handleResponse } from '../routeUtils'
import CustomerController from '../../models/Sales/Customer/customerController'

const customerRouter = express.Router()

customerRouter.post('/', (req, res) => {
  try {
    // const id = 1
    // console.log('params', req.params)
    const customer = req.body as unknown
    CustomerController.insertCustomer(customer)
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
