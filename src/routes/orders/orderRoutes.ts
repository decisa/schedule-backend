import express from 'express'
import { handleError, handleResponse } from '../routeUtils'
import OrderController from '../../models/Sales/Order/orderController'

const orderRouter = express.Router()

// create Order record (with magento if included)
orderRouter.post('/', (req, res) => {
  try {
    const orderData = req.body as unknown
    OrderController.create(orderData)
      .then((result) => {
        const orderResult = OrderController.toJSON(result)
        handleResponse(res, orderResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// upsert order record including magento. magento externalId is required
orderRouter.put('/', (req, res) => {
  try {
    const orderData = req.body as unknown
    OrderController.upsert(orderData)
      .then((result) => {
        const orderResult = OrderController.toJSON(result)
        handleResponse(res, orderResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// // get brand by externalId
// orderRouter.get('/magento/:externalId', (req, res) => {
//   try {
//     OrderController.getByExternalId(req.params.externalId)
//       .then((result) => {
//         const brandResult = OrderController.toJSON(result)
//         handleResponse(res, brandResult)
//       })
//       .catch((err) => handleError(res, err))
//   } catch (error) {
//     handleError(res, error)
//   }
// })

// get order by order number
orderRouter.get('/number/:orderNumber', (req, res) => {
  try {
    OrderController.getByOrderNumber(req.params.orderNumber)
      .then((result) => {
        const orderResult = OrderController.toJSON(result)
        handleResponse(res, orderResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// get order by id
orderRouter.get('/:id', (req, res) => {
  try {
    OrderController.get(req.params.id)
      .then((result) => {
        const brandResult = OrderController.toJSON(result)
        handleResponse(res, brandResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// // get full order info by id
// orderRouter.get('/:id', (req, res) => {
//   try {
//     OrderController.get(req.params.id)
//       .then((result) => {
//         const brandResult = OrderController.toJSON(result)
//         handleResponse(res, brandResult)
//       })
//       .catch((err) => handleError(res, err))
//   } catch (error) {
//     handleError(res, error)
//   }
// })

// delete magento record of the given orderId
// returns the deleted record or null if it did not exist
orderRouter.delete('/:orderId/magento', (req, res) => {
  try {
    const id = req.params.orderId
    OrderController.deleteMagento(id)
      .then((deletedRecord) => {
        handleResponse(res, deletedRecord)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// brandRouter.post('/:addressId/magento', (req, res) => {
//   try {
//     const id = req.params.addressId
//     const magentoData = req.body as unknown
//     AddressController.createMagento(id, magentoData)
//       .then((magentoRecord) => {
//         handleResponse(res, magentoRecord)
//       })
//       .catch((err) => handleError(res, err))
//   } catch (error) {
//     handleError(res, error)
//   }
// })

orderRouter.delete('/:id', (req, res) => {
  try {
    OrderController.delete(req.params.id)
      .then((orderIsDeleted) => {
        handleResponse(res, orderIsDeleted)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// update order. will create Magento record if provided and does not exist in DB
orderRouter.patch('/:id', (req, res) => {
  try {
    const orderUpdate = req.body as unknown
    OrderController.update(req.params.id, orderUpdate)
      .then((result) => {
        const orderResult = OrderController.toJSON(result)
        handleResponse(res, orderResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

export default orderRouter
