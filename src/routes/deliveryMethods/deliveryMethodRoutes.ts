import express from 'express'
import { handleError, handleResponse } from '../routeUtils'
import DeliveryMethodController from '../../models/Sales/DeliveryMethod/deliveryMethodController'

const deliveryMethodRouter = express.Router()

// create DeliveryMethod record
deliveryMethodRouter.post('/', (req, res) => {
  try {
    const deliveryMethod = req.body as unknown
    DeliveryMethodController.create(deliveryMethod)
      .then((result) => {
        const deliveryMethodResult = DeliveryMethodController.toJSON(result)
        handleResponse(res, deliveryMethodResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// get all deliveryMethods
deliveryMethodRouter.get('/all', (req, res) => {
  try {
    DeliveryMethodController.getAll()
      .then((result) => {
        const deliveryMethodResult = DeliveryMethodController.toJSON(result)
        handleResponse(res, deliveryMethodResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// get deliveryMethod by id
deliveryMethodRouter.get('/:id', (req, res) => {
  try {
    DeliveryMethodController.get(req.params.id)
      .then((result) => {
        const deliveryMethodResult = DeliveryMethodController.toJSON(result)
        handleResponse(res, deliveryMethodResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

deliveryMethodRouter.delete('/:id', (req, res) => {
  try {
    DeliveryMethodController.delete(req.params.id)
      .then((deliveryMethodIsDeleted) => {
        handleResponse(res, deliveryMethodIsDeleted)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// update deliveryMethod
deliveryMethodRouter.patch('/:id', (req, res) => {
  try {
    const deliveryMethodUpdate = req.body as unknown
    DeliveryMethodController.update(req.params.id, deliveryMethodUpdate)
      .then((result) => {
        const deliveryMethodResult = DeliveryMethodController.toJSON(result)
        handleResponse(res, deliveryMethodResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

export default deliveryMethodRouter
