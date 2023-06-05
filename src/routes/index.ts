import express from 'express'
import commentRouter from './comments/commentRoutes'
import customerRouter from './customers/customerRoutes'
import addressRouter from './addresses/addressRoutes'
import brandRouter from './brands/brandRoutes'
import productRouter from './products/productRoutes'
import productConfigurationRouter from './productConfigurations/productConfigurationRoutes'
import productOptionRouter from './options/optionRoutes'
import orderAddressRouter from './orderAddresses/orderAddressRoutes'
import orderRouter from './orders/orderRoutes'

const rootRouter = express.Router()

rootRouter.get('/', (req, res) => {
  res.send('hi')
})

rootRouter.use('/comment', commentRouter)
rootRouter.use('/customer', customerRouter)
rootRouter.use('/address', addressRouter)
rootRouter.use('/brand', brandRouter)
rootRouter.use('/product', productRouter)
rootRouter.use('/configuration', productConfigurationRouter)
rootRouter.use('/option', productOptionRouter)
rootRouter.use('/orderaddress', orderAddressRouter)
rootRouter.use('/order', orderRouter)

export default rootRouter
