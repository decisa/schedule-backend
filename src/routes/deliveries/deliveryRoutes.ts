import express from 'express'
import { handleError, handleResponse } from '../routeUtils'
import DeliveryController from '../../models/Delivery/Delivery/DeliveryController'
import DeliveryItemController from '../../models/Delivery/DeliveryItem/DeliveryItemController'
import DriverController from '../../models/Delivery/Driver/driverController'

const deliveryRouter = express.Router()

// note: DeliveryItems:
// fixme: why is delivery item not linked to 'id' of delivery?
// create delivery item record
deliveryRouter.post('/item', (req, res) => {
  try {
    // const id = 1
    // console.log('params', req.params)
    const deliveryItemData = req.body as unknown
    DeliveryItemController.create(deliveryItemData)
      .then((result) => {
        const deliveryItemResult = DeliveryItemController.toJSON(result)
        handleResponse(res, deliveryItemResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// note: is this method needed? why whould you access the item by ID without delivery id?
// get deliveryItem record by id
deliveryRouter.get('/item/:id', (req, res) => {
  try {
    DeliveryItemController.get(req.params.id)
      .then((result) => {
        const deliveryItemResult = DeliveryItemController.toJSON(result)
        if (!deliveryItemResult) {
          res.status(404).json({ message: 'DeliveryItem id was not found' })
          return
        }
        handleResponse(res, deliveryItemResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

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

// delete delivery record by id
deliveryRouter.delete('/:id', (req, res) => {
  try {
    DeliveryController.delete(req.params.id)
      .then((deleted) => {
        if (!deleted) {
          res.status(404).json({ message: 'Delivery id was not found' })
          return
        }
        handleResponse(res, deleted)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// update delivery record
deliveryRouter.patch('/:id', (req, res) => {
  try {
    // const id = 1
    // console.log('params', req.params)
    const deliveryData = req.body as unknown
    DeliveryController.update(req.params.id, deliveryData)
      .then((result) => {
        const deliveryResult = DeliveryController.toJSON(result)
        handleResponse(res, deliveryResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// note: manage Drivers
// get all drivers for the delivery
deliveryRouter.get('/:deliveryId/drivers', (req, res) => {
  console.log('get drivers')
  try {
    DriverController.getDeliveryDrivers(req.params.deliveryId)
      .then((result) => {
        const deliveryResult = DriverController.toJSON(result)
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
    DeliveryController.createWithItems(deliveryData)
      .then((result) => {
        const deliveryResult = DeliveryController.toJSON(result)
        handleResponse(res, deliveryResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

export default deliveryRouter
