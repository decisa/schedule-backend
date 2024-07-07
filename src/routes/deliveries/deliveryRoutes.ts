import express from 'express'
import { handleError, handleResponse } from '../routeUtils'
import DeliveryController from '../../models/Delivery/Delivery/DeliveryController'
import DeliveryItemController from '../../models/Delivery/DeliveryItem/DeliveryItemController'
import DriverController from '../../models/Delivery/Driver/driverController'

const deliveryRouter = express.Router()

// note: DeliveryItems:

// create delivery item record
deliveryRouter.post('/:deliveryId/item', (req, res) => {
  const deliveryId = Number(req.params.deliveryId)
  try {
    // const id = 1
    // console.log('params', req.params)
    const deliveryItemData = req.body as unknown
    DeliveryItemController.create(deliveryId, deliveryItemData)
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

// get all delivery records
deliveryRouter.get('/all', (req, res) => {
  try {
    DeliveryController.getAll()
      .then((result) => {
        const deliveryItems = DeliveryController.toJSON(result.items)
        // if (!deliveryResult) {
        //   res.status(404).json({ message: 'No deliveries found' })
        //   return
        // }
        handleResponse(res, {
          ...result,
          items: deliveryItems,
        })
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
    DeliveryController.delete({
      id: req.params.id,
      reason: 'deleted by user',
    })
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
deliveryRouter.patch('/:deliveryId', (req, res) => {
  try {
    // const deliveryId = 1
    // console.log('params', req.params)
    const deliveryData = req.body as unknown
    DeliveryController.updateWithItems(req.params.deliveryId, deliveryData)
      .then((result) => {
        const deliveryResult = DeliveryController.toJSON(result)
        handleResponse(res, deliveryResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// create delivery item record
deliveryRouter.post('/:deliveryId/item', (req, res) => {
  const deliveryId = Number(req.params.deliveryId)
  try {
    // const id = 1
    // console.log('params', req.params)
    const deliveryItemData = req.body as unknown
    DeliveryItemController.create(deliveryId, deliveryItemData)
      .then((result) => {
        const deliveryItemResult = DeliveryItemController.toJSON(result)
        handleResponse(res, deliveryItemResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// upsert delivery item record
deliveryRouter.put('/:deliveryId/item', (req, res) => {
  const deliveryId = Number(req.params.deliveryId)
  try {
    // const id = 1
    // console.log('params', req.params)
    const deliveryItemData = req.body as unknown
    DeliveryItemController.upsert(deliveryId, deliveryItemData)
      .then((result) => {
        const deliveryItemResult = DeliveryItemController.toJSON(result)
        handleResponse(res, deliveryItemResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// get delivery record edit form data: order, delivery, addresses

// todo: fixme when deliveryController is updated
deliveryRouter.get('/:deliveryId/edit', (req, res) => {
  try {
    DeliveryController.getEditFormData(req.params.deliveryId)
      .then((result) => {
        // const deliveryResult = DeliveryController.toJSON(result)
        handleResponse(res, result)
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
