import express from 'express'
import { handleError, handleResponse } from '../routeUtils'
import OrderController from '../../models/Sales/Order/orderController'
import { DBError } from '../../ErrorManagement/errors'
import AddressController from '../../models/Sales/Address/addressController'

const orderRouter = express.Router()

// search for Order records
orderRouter.get('/', (req, res) => {
  try {
    const searchTerm = req.query.search || ''
    console.log('query', searchTerm)

    if (typeof searchTerm !== 'string') {
      throw new Error('search term must be a string')
    }
    OrderController.searchOrders(searchTerm)
      .then((result) => {
        handleResponse(res, { count: result.length, results: result })
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// get all Order records (hard limit 1000)
orderRouter.get('/all', (req, res) => {
  try {
    OrderController.getAll({ limit: 1000 })
      .then((result) => {
        const parsedResult = {
          ...result,
          results: OrderController.toJSON(result.results),
        }
        // handleResponse(res, { count: result.length, results: result })
        handleResponse(res, parsedResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// import magento Order record
orderRouter.put('/magento', (req, res) => {
  try {
    const orderData = req.body as unknown
    OrderController.importMagentoOrder(orderData)
      .then((result) => {
        const orderResult = OrderController.toJSON(result)
        handleResponse(res, orderResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

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

// get data required for delivery creation
orderRouter.get('/:orderId/deliverycreate', (req, res) => {
  try {
    OrderController.getEditFormData(req.params.orderId)
      .then((result) => {
        handleResponse(res, result)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// get all addresses of the order by orderId
orderRouter.get('/:orderId/address/all', (req, res) => {
  try {
    AddressController.getByOrderId(req.params.orderId)
      .then((result) => {
        const brandResult = AddressController.toJSON(result)
        handleResponse(res, brandResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// get all addresses of the order by orderId
orderRouter.post('/:orderId/address', (req, res) => {
  try {
    const addressData = req.body as unknown
    if (!addressData || typeof addressData !== 'object') {
      throw DBError.badData(new Error('order address data is missing'))
    }
    AddressController.create({
      ...addressData,
      type: 'order',
      orderId: req.params.orderId,
    })
      .then((result) => {
        const addressResult = AddressController.toJSON(result)
        handleResponse(res, addressResult)
      })
      .catch((err) => {
        console.log('error', err)
        handleError(res, err)
      })
  } catch (error) {
    handleError(res, error)
  }
})

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
