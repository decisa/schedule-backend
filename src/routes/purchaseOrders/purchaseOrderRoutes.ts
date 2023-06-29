import express from 'express'
import { handleError, handleResponse } from '../routeUtils'
import PurchaseOrderController from '../../models/Receiving/PurchaseOrder/purchaseOrderController'

const purchaseOrderRouter = express.Router()

// create DeliveryMethod record
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

purchaseOrderRouter.get('/number/:poNumber', (req, res) => {
  try {
    PurchaseOrderController.getByPoNumber(req.params.poNumber)
      .then((result) => {
        const purchaseOrderResult = PurchaseOrderController.toJSON(result)
        handleResponse(res, purchaseOrderResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

export default purchaseOrderRouter
