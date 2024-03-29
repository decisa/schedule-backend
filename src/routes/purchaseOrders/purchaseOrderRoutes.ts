import express from 'express'
import { handleError, handleResponse } from '../routeUtils'
import PurchaseOrderController from '../../models/Receiving/PurchaseOrder/purchaseOrderController'
import PurchaseOrderItemController from '../../models/Receiving/PurchaseOrderItem/purchaseOrderItemController'
import { printYellowLine } from '../../utils/utils'
import { DBError } from '../../ErrorManagement/errors'
import { Shipment } from '../../models/Receiving/Shipment/shipment'
import ShipmentController from '../../models/Receiving/Shipment/shipmentController'

const purchaseOrderRouter = express.Router()

// get all purchase orders
purchaseOrderRouter.get('/all', (req, res) => {
  try {
    PurchaseOrderController.getAll()
      .then((result) => {
        const purchaseOrderResult = PurchaseOrderController.fullPOtoJSON(result)
        handleResponse(res, purchaseOrderResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// create new purchase order
purchaseOrderRouter.post('/', (req, res) => {
  try {
    printYellowLine('purchaseOrderRouter.post')
    console.log('req.body', req.body)
    console.log('req.headers', req.headers)
    const purchaseOrder = req.body as unknown
    PurchaseOrderController.createPurchaseOrder(purchaseOrder)
      .then((result) => {
        const purchaseOrderResult = PurchaseOrderController.toJSON(result)
        handleResponse(res, purchaseOrderResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// add new purchase order item:
purchaseOrderRouter.post('/item', (req, res) => {
  try {
    const purchaseOrderItem = req.body as unknown
    PurchaseOrderItemController.create(purchaseOrderItem)
      .then((result) => {
        const purchaseOrderItemResult = PurchaseOrderItemController.toJSON(result)
        handleResponse(res, purchaseOrderItemResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// delete purchase order:
purchaseOrderRouter.delete('/:id', (req, res) => {
  try {
    // const purchaseOrderItem = req.body as unknown
    PurchaseOrderController.delete(req.params.id)
      .then((result) => {
        const deletedPurchaseOrder = PurchaseOrderController.toJSON(result)
        handleResponse(res, deletedPurchaseOrder)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// get purchase order by id:
purchaseOrderRouter.get('/:id', (req, res) => {
  try {
    // const purchaseOrderItem = req.body as unknown
    PurchaseOrderController.getFullPO(req.params.id)
      .then((result) => {
        // const purchaseOrderItemResult = PurchaseOrderItemController.toJSON(result)
        if (result === null) {
          handleError(res, DBError.notFound(new Error(`Purchase Order with id ${req.params.id} was not found`)))
          return
        }
        const purchaseOrderResult = PurchaseOrderController.fullPOtoJSON(result)
        handleResponse(res, purchaseOrderResult)
        // handleResponse(res, result)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// update purchase order
purchaseOrderRouter.put('/:id', (req, res) => {
  try {
    const purchaseOrder = req.body as unknown
    PurchaseOrderController.update(req.params.id, purchaseOrder)
      .then((result) => {
        const purchaseOrderResult = PurchaseOrderController.toJSON(result)
        handleResponse(res, purchaseOrderResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// get purchase order by shipments:
purchaseOrderRouter.get('/:poId/shipments', (req, res) => {
  try {
    PurchaseOrderController.getPOShipments(req.params.poId)
      .then((shipments) => {
        const purchaseOrderShipments = ShipmentController.toJSON(shipments)
        handleResponse(res, shipments)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

purchaseOrderRouter.get('/number/:poNumber', (req, res) => {
  try {
    PurchaseOrderController.getByPoNumber(req.params.poNumber)
      .then((result) => {
        const purchaseOrderResult = PurchaseOrderController.fullPOtoJSON(result)
        handleResponse(res, purchaseOrderResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

export default purchaseOrderRouter
