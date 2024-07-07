import express from 'express'
import { handleError, handleResponse } from '../routeUtils'
import CustomerController from '../../models/Sales/Customer/customerController'
import AddressController from '../../models/Sales/Address/addressController'
import addressRouter from '../addresses/addressRoutes'

const customerRouter = express.Router()

// get customer record by email, will include Magento record if exists
customerRouter.get('/', (req, res) => {
  try {
    CustomerController.getByEmail({
      email: req.query.email as string,
    })
      .then((result) => {
        if (!result) {
          res.status(404).json({ message: `Customer with email ${String(req.query.email)} does not exist` })
          return
        }
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

customerRouter.get('/all', (req, res) => {
  try {
    CustomerController.getAll()
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
        if (!result) {
          res.status(404).json({ message: `Customer id "${req.params.id}" was not found` })
          return
        }
        const customerResult = CustomerController.toJSON(result)
        handleResponse(res, customerResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// get all addresses associated with a given customer ID
customerRouter.get('/:id/addresses', (req, res) => {
  try {
    AddressController.getByCustomerId(req.params.id)
      .then((result) => {
        const addresses = AddressController.toJSON(result)
        handleResponse(res, addresses)
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

// routes to work with addresses
customerRouter.use('/address', addressRouter)

export default customerRouter
