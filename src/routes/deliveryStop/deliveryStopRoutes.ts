import express from 'express'
import { handleError, handleResponse } from '../routeUtils'
import DeliveryStopController from '../../models/Delivery/DeliveryStop/deliveryStopController'

const deliveryStopRouter = express.Router()

// create Brand record
deliveryStopRouter.post('/', (req, res) => {
  try {
    const deliveryStop = req.body as unknown
    DeliveryStopController.create(deliveryStop)
      .then((result) => {
        const deliveryStopResult = DeliveryStopController.toJSON(result)
        handleResponse(res, deliveryStopResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// get deliveryStop by id
deliveryStopRouter.get('/:id', (req, res) => {
  try {
    DeliveryStopController.getFull(req.params.id)
      .then((result) => {
        const deliveryStopResult = DeliveryStopController.toJSON(result)
        handleResponse(res, deliveryStopResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// delete deliveryStop by id
deliveryStopRouter.delete('/:id', (req, res) => {
  try {
    DeliveryStopController.delete(req.params.id)
      .then((result) => {
        const deletedDeliveryStop = DeliveryStopController.toJSON(result)
        handleResponse(res, deletedDeliveryStop)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// update deliveryStop
deliveryStopRouter.patch('/:id', (req, res) => {
  try {
    const deliveryStopUpdate = req.body as unknown
    DeliveryStopController.update(req.params.id, deliveryStopUpdate)
      .then((result) => {
        const deliveryStopResult = DeliveryStopController.toJSON(result)
        handleResponse(res, deliveryStopResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

export default deliveryStopRouter
