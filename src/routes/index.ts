import express from 'express'
import commentRouter from './comments/commentRoutes'
import customerRouter from './customers/customerRoutes'

const rootRouter = express.Router()

rootRouter.get('/', (req, res) => {
  res.send('hi')
})

rootRouter.use('/comment', commentRouter)
rootRouter.use('/customer', customerRouter)

export default rootRouter
