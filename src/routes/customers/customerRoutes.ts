import express from 'express'
import { handleError, handleResponse } from '../routeUtils'
import CustomerController from '../../models/Sales/Customer/customerController'

const customerRouter = express.Router()

// create customer record including magento, if provided
customerRouter.get('/', (req, res) => {
  try {
    // const id = 1
    // console.log('params', req.params)
    // const { query } = req// as unknown
    // console.log('query:', query, Object.keys(req))
    // handleResponse(res, query)
    CustomerController.getByEmail(req.query)
      .then((result) => {
        const customerResult = CustomerController.toJSON(result)
        handleResponse(res, customerResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// create customer record including magento, if provided
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

// upsert customer record including magento, if provided. email required
customerRouter.put('/', (req, res) => {
  try {
    // const id = 1
    // console.log('params', req.params)
    const customer = req.body as unknown
    CustomerController.upsert(customer)
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

customerRouter.delete('/magento', (req, res) => {
  try {
    const email = req.body as unknown
    CustomerController.deleteMagento(email)
      .then((deletedRecord) => {
        handleResponse(res, deletedRecord)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

customerRouter.post('/magento', (req, res) => {
  try {
    const magentoData = req.body as unknown
    CustomerController.createMagento(magentoData)
      .then((magentoRecord) => {
        handleResponse(res, magentoRecord)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

customerRouter.delete('/:id', (req, res) => {
  try {
    CustomerController.delete(req.params.id)
      .then((numberOfItemsDeleted) => {
        handleResponse(res, numberOfItemsDeleted)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

customerRouter.patch('/:id', (req, res) => {
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
