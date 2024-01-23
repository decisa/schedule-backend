import express from 'express'
import { handleError, handleResponse } from '../routeUtils'
import ShipmentController from '../../models/Receiving/Shipment/shipmentController'
import ShipmentItemController from '../../models/Receiving/ShipmentItem/shipmentItemController'

const shipmentRouter = express.Router()

// get Shipment Item record
shipmentRouter.get('/item/:itemId', (req, res) => {
  try {
    const { itemId } = req.params
    ShipmentItemController.get(itemId)
      .then((result) => {
        // const shipmentResult = ShipmentController.toJSON(result)
        const shipmentResult = ShipmentItemController.toJSON(result)
        handleResponse(res, shipmentResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// create Shipment record
shipmentRouter.post('/', (req, res) => {
  try {
    const shipmentData = req.body as unknown
    ShipmentController.createShipment(shipmentData)
      .then((result) => {
        const shipmentResult = ShipmentController.toFullJSON(result)
        handleResponse(res, shipmentResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// get Shipment record
shipmentRouter.get('/:id', (req, res) => {
  try {
    const { id } = req.params
    ShipmentController.getFullShipment(id)
      .then((result) => {
        // const shipmentResult = ShipmentController.toJSON(result)
        const shipmentResult = ShipmentController.toFullJSON(result)
        handleResponse(res, shipmentResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// update Shipment record
shipmentRouter.patch('/:id', (req, res) => {
  try {
    const { id } = req.params
    const shipmentUpdateData = req.body as unknown
    ShipmentController.update(id, shipmentUpdateData)
      .then((result) => {
        const shipmentResult = ShipmentController.toJSON(result)
        handleResponse(res, shipmentResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// delete Shipment record
shipmentRouter.delete('/:id', (req, res) => {
  try {
    const { id } = req.params
    ShipmentController.delete(id)
      .then((result) => {
        const shipmentResult = ShipmentController.toJSON(result)
        handleResponse(res, shipmentResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

export default shipmentRouter
