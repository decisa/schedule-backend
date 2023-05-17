import express from 'express'
import type { Request, Response, NextFunction } from 'express'
import { ValidationError } from 'sequelize'
import OrderCommentController from './models/Sales/OrderComment/orderCommentController'
import { printYellowLine } from './utils/utils'
import { Order } from './models/Sales/Order/order'
import { OrderComment } from './models/Sales/OrderComment/orderComment'

console.log('running app')
const app = express()
app.use(express.json())

app.get('/', (req, res) => {
  res.send('hi')
})

const handleResponse = (res: Response, data: unknown) => res.status(200).send(data)
const handleError = (res: Response, err: unknown) => {
  printYellowLine()
  if (err instanceof Error) {
    // err.errors
    console.log(err, Object.keys(err))
    if (err instanceof ValidationError) {
      const errMessage = err.errors.map((error) => error.message).join(', ')
      res.status(400).json({ error: `SQL validation error: ${errMessage}` })
      return
    }
    res.status(400).json({ error: err.message })
  } else {
    res.status(500).send({ error: 'unknown error' })
  }
}

app.get('/order/comment/:id', (req, res) => {
  try {
    // const id = 1
    // console.log('params', req.params)
    OrderCommentController.getCommentById(req.params.id)
      .then((result) => {
        const commentResult = OrderCommentController.toJSON(result)
        handleResponse(res, commentResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

app.get('/order/comment/magento/:id', (req, res) => {
  try {
    // const id = 1
    // console.log('params', req.params)
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

app.post('/order/comment', (req, res) => {
  try {
    const comment = req.body as unknown
    OrderCommentController.insertOrderComment(comment)
      .then((result) => handleResponse(res, result))
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

app.post('/order/comment/upsert', (req, res) => {
  try {
    const comment = req.body as unknown
    OrderCommentController.upsertOrderCommentMagento(comment)
      .then((result) => handleResponse(res, result))
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

app.get('/order/:orderId/comments', (req, res) => {
  try {
    // const id = 1
    // console.log('params', req.params)
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

app.get('/comments/:orderNumber', (req, res) => {
  try {
    // const id = 1
    // console.log('params', req.params)
    OrderCommentController.getCommentsByOrderNumber(req.params.orderNumber)
      .then((result) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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

// app.post('/search', (req, res) => {
//   res.send(req.body)
// })

// any uncaught errors handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof Error) {
    res.status(400).json({ error: `uncaught error: ${err.message}` })
  } else {
    res.status(500).json({ error: 'Unhandled Internal server error' })
  }
})

export default app
