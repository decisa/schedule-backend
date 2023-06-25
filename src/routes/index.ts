import express from 'express'
import { PassThrough } from 'stream'
import { createProxyMiddleware, responseInterceptor } from 'http-proxy-middleware'
import commentRouter from './comments/commentRoutes'
import customerRouter from './customers/customerRoutes'
import addressRouter from './addresses/addressRoutes'
import brandRouter from './brands/brandRoutes'
import productRouter from './products/productRoutes'
import productConfigurationRouter from './productConfigurations/productConfigurationRoutes'
import productOptionRouter from './options/optionRoutes'
import orderAddressRouter from './orderAddresses/orderAddressRoutes'
import orderRouter from './orders/orderRoutes'
import deliveryMethodRouter from './deliveryMethods/deliveryMethodRoutes'

const rootRouter = express.Router()
// rootRouter.use((req, res, next) => {
//   console.log(`Received ${req.method} request for ${req.url}`)
//   next()
// })

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
rootRouter.use('/deliverymethod', deliveryMethodRouter)

// create proxy to forward requests to magento
rootRouter.use('/2031360', (req, res, next) => {
  // Set CORS headers
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // Respond to preflight requests
  if (req.method === 'OPTIONS') {
    // console.log('sending 200 for options request')
    res.sendStatus(200)
  } else {
    next()
  }
}, createProxyMiddleware({
  target: 'https://www.roomservice360.com', // the target host
  changeOrigin: true, // needed for virtual hosted sites
  secure: true,
  pathRewrite: {
    '^/2031360': '', // rewrite path
  },
  logLevel: 'info',
}))

export default rootRouter
