import express from 'express'
import { handleError, handleResponse } from '../routeUtils'
import PurchaseOrderController from '../../models/Receiving/PurchaseOrder/purchaseOrderController'
import PurchaseOrderItemController from '../../models/Receiving/PurchaseOrderItem/purchaseOrderItemController'
import { printYellowLine } from '../../utils/utils'
import { DBError } from '../../ErrorManagement/errors'

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

// add new purchase order item:
purchaseOrderRouter.delete('/:id', (req, res) => {
  try {
    // const purchaseOrderItem = req.body as unknown
    PurchaseOrderController.delete(req.params.id)
      .then((result) => {
        // const purchaseOrderItemResult = PurchaseOrderItemController.toJSON(result)
        handleResponse(res, result)
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
        handleResponse(res, result)
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
