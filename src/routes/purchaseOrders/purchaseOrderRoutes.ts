import express from 'express'
import { handleError, handleResponse } from '../routeUtils'
import PurchaseOrderController from '../../models/Receiving/PurchaseOrder/purchaseOrderController'
import PurchaseOrderItemController from '../../models/Receiving/PurchaseOrderItem/purchaseOrderItemController'

const purchaseOrderRouter = express.Router()

// create new purchase order
purchaseOrderRouter.post('/', (req, res) => {
  try {
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
