import express from 'express'
import OrderCommentController from '../../models/Sales/OrderComment/orderCommentController'
import { handleError, handleResponse } from '../routeUtils'

const commentRouter = express.Router()

commentRouter.get('/:id', (req, res) => {
  try {
    // const id = 1
    // console.log('params', req.params)
    OrderCommentController.get(req.params.id)
      .then((result) => {
        const commentResult = OrderCommentController.toJSON(result)
        handleResponse(res, commentResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

commentRouter.post('/', (req, res) => {
  try {
    const comment = req.body as unknown
    OrderCommentController.create(comment)
      .then((result) => handleResponse(res, result))
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

commentRouter.put('/magento/upsert', (req, res) => {
  try {
    const comment = req.body as unknown
    OrderCommentController.upsert(comment)
      .then((result) => handleResponse(res, result))
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

commentRouter.get('/magento/:id', (req, res) => {
  try {
    OrderCommentController.getCommentByMagentoId(req.params.id)
      .then((result) => {
        const commentResult = OrderCommentController.toJSON(result)
        handleResponse(res, commentResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

commentRouter.get('/order/:orderId', (req, res) => {
  try {
    OrderCommentController.getCommentsByOrderId(req.params.orderId)
      .then((result) => {
        const commentResult = OrderCommentController.toJSON(result)
        handleResponse(res, commentResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// fixme: all typescript any hacks
commentRouter.get('/orderNumber/:orderNumber', (req, res) => {
  try {
    // const id = 1
    // console.log('params', req.params)
    OrderCommentController.getCommentsByOrderNumber(req.params.orderNumber)
      .then((result) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
        const commentResult = OrderCommentController.toJSON(result) as any
        if (Array.isArray(commentResult)) {
          // eslint-disable-next-line @typescript-eslint/no-shadow
          commentResult.forEach((result) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, no-param-reassign, @typescript-eslint/no-unsafe-assignment
            result.orderNumber = result.order.orderNumber
            // eslint-disable-next-line no-param-reassign, @typescript-eslint/no-unsafe-member-access
            delete result.order
          })
        }
        handleResponse(res, commentResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

export default commentRouter
