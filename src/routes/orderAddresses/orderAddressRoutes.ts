import express from 'express'
import { handleError, handleResponse } from '../routeUtils'
import OrderAddressController from '../../models/Sales/OrderAddress/orderAddressContoller'

const orderAddressRouter = express.Router()

// create address record including magento, if provided
orderAddressRouter.post('/', (req, res) => {
  try {
    const address = req.body as unknown
    OrderAddressController.create(address)
      .then((result) => {
        const addressResult = OrderAddressController.toJSON(result)
        handleResponse(res, addressResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// upsert orderAddress record including magento. magento externalId is required
orderAddressRouter.put('/', (req, res) => {
  try {
    const orderAddress = req.body as unknown
    OrderAddressController.upsert(orderAddress)
      .then((result) => {
        const orderAddressResult = OrderAddressController.toJSON(result)
        handleResponse(res, orderAddressResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// get order address by id, will include Magento record if exists
orderAddressRouter.get('/:id', (req, res) => {
  try {
    OrderAddressController.get(req.params.id)
      .then((result) => {
        const orderAddressResult = OrderAddressController.toJSON(result)
        handleResponse(res, orderAddressResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// delete magento record of the given orderAddressId
// returns the deleted record or null if it did not exist
orderAddressRouter.delete('/:orderAddressId/magento', (req, res) => {
  try {
    const id = req.params.orderAddressId
    OrderAddressController.deleteMagento(id)
      .then((deletedRecord) => {
        handleResponse(res, deletedRecord)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// create magento record for a given orderAddressId
orderAddressRouter.post('/:orderAddressId/magento', (req, res) => {
  try {
    const id = req.params.orderAddressId
    const magentoData = req.body as unknown
    OrderAddressController.createMagento(id, magentoData)
      .then((magentoRecord) => {
        handleResponse(res, magentoRecord)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// delete orderAddress with a given ID
// returns true if deleted
orderAddressRouter.delete('/:id', (req, res) => {
  try {
    OrderAddressController.delete(req.params.id)
      .then((recordIsDeleted) => {
        handleResponse(res, recordIsDeleted)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// update order address record
orderAddressRouter.patch('/:id', (req, res) => {
  try {
    const orderAddressUpdate = req.body as unknown
    OrderAddressController.update(req.params.id, orderAddressUpdate)
      .then((result) => {
        const addressResult = OrderAddressController.toJSON(result)
        handleResponse(res, addressResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

export default orderAddressRouter
