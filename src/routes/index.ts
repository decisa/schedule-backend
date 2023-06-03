import express from 'express'
import commentRouter from './comments/commentRoutes'
import customerRouter from './customers/customerRoutes'
import addressRouter from './addresses/addressRoutes'
import brandRouter from './brands/brandRoutes'
import productRouter from './products/productRoutes'
import productConfigurationRouter from './productConfigurations/productConfigurationRoutes'
import productOptionRouter from './options/optionRoutes'
import orderAddressRouter from './orderAddresses/orderAddressRoutes'

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

export default rootRouter
