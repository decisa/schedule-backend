import express from 'express'
import { handleError, handleResponse } from '../routeUtils'
import AddressController from '../../models/Sales/Address/addressController'

const addressRouter = express.Router()

// create address record including magento, if provided
addressRouter.post('/', (req, res) => {
  try {
    const address = req.body as unknown
    AddressController.create(address)
      .then((result) => {
        const addressResult = AddressController.toJSON(result)
        handleResponse(res, addressResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// upsert address record including magento. magento externalId is required
addressRouter.put('/', (req, res) => {
  try {
    const address = req.body as unknown
    AddressController.upsert(address)
      .then((result) => {
        const addressResult = AddressController.toJSON(result)
        handleResponse(res, addressResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// get address by id, will include Magento record if exists
addressRouter.get('/:id', (req, res) => {
  try {
    AddressController.get(req.params.id)
      .then((result) => {
        const addressResult = AddressController.toJSON(result)
        handleResponse(res, addressResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

addressRouter.delete('/:addressId/magento', (req, res) => {
  try {
    const id = req.params.addressId
    AddressController.deleteMagento(id)
      .then((deletedRecord) => {
        handleResponse(res, deletedRecord)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

addressRouter.post('/:addressId/magento', (req, res) => {
  try {
    const id = req.params.addressId
    const magentoData = req.body as unknown
    AddressController.createMagento(id, magentoData)
      .then((magentoRecord) => {
        handleResponse(res, magentoRecord)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

addressRouter.delete('/:id', (req, res) => {
  try {
    AddressController.delete(req.params.id)
      .then((numberOfItemsDeleted) => {
        handleResponse(res, numberOfItemsDeleted)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// update magento record
addressRouter.patch('/:id', (req, res) => {
  try {
    const addressUpdate = req.body as unknown
    AddressController.update(req.params.id, addressUpdate)
      .then((result) => {
        const addressResult = AddressController.toJSON(result)
        handleResponse(res, addressResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

export default addressRouter
