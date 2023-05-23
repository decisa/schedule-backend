import express from 'express'
import commentRouter from './comments/commentRoutes'
import customerRouter from './customers/customerRoutes'
import addressRouter from './addresses/addressRoutes'
import brandRouter from './brands/brandRoutes'
import productRouter from './products/productRoutes'

const rootRouter = express.Router()

rootRouter.get('/', (req, res) => {
  res.send('hi')
})

rootRouter.use('/comment', commentRouter)
rootRouter.use('/customer', customerRouter)
rootRouter.use('/address', addressRouter)
rootRouter.use('/brand', brandRouter)
rootRouter.use('/product', productRouter)

export default rootRouter
