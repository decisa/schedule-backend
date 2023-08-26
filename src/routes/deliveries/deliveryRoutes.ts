import express from 'express'
import { handleError, handleResponse } from '../routeUtils'
import DeliveryController from '../../models/Delivery/Delivery/DeliveryController'

const deliveryRouter = express.Router()

// get delivery record by id
deliveryRouter.get('/:id', (req, res) => {
  try {
    DeliveryController.get(req.params.id)
      .then((result) => {
        const deliveryResult = DeliveryController.toJSON(result)
        if (!deliveryResult) {
          res.status(404).json({ message: 'Delivery id was not found' })
          return
        }
        handleResponse(res, deliveryResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// create delivery record
deliveryRouter.post('/', (req, res) => {
  try {
    // const id = 1
    // console.log('params', req.params)
    const deliveryData = req.body as unknown
    DeliveryController.create(deliveryData)
      .then((result) => {
        const customerResult = DeliveryController.toJSON(result)
        handleResponse(res, customerResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

export default deliveryRouter