/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import express from 'express'
import axios from 'axios'
// import { createProxyMiddleware, responseInterceptor } from 'http-proxy-middleware'
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
import purchaseOrderRouter from './purchaseOrders/purchaseOrderRoutes'
import deliveryRouter from './deliveries/deliveryRoutes'
import shipmentRouter from './shipments/shipmentRoutes'

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
rootRouter.use('/deliverymethod', deliveryMethodRouter)
rootRouter.use('/purchaseorder', purchaseOrderRouter)
rootRouter.use('/delivery', deliveryRouter)
rootRouter.use('/shipment', shipmentRouter)

// create proxy to forward requests to magento:
rootRouter.use('/2031360', (req, res, next) => {
  // Set CORS headers
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,HEAD')
  res.header('Access-Control-Allow-Headers', 'Authorization, Origin, X-Requested-With, Content-Type, Accept')
  if (req.method === 'OPTIONS') {
    // console.log('sending 200 for options request')
    res.sendStatus(200)
    next()
    return
  }

  const newHeaders = {
    ...req.headers,
    // custom user agent
    'user-agent': 'roomservice360/decarea',
  }
  delete newHeaders.host
  delete newHeaders.origin
  delete newHeaders.referer
  // newHeaders['content-length']
  delete newHeaders.cookie
  // console.log('HEADERS:', newHeaders)
  axios({
    method: req.method,
    url: `https://www.roomservice360.com${req.originalUrl.replace('/2031360', '')}`,
    headers: {
      ...newHeaders,
    },
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    data: req.body,
  }).then((response) => {
    const { data } = response
    // console.log('response:', response)
    res.json(data)
  }).catch((error) => {
    console.error('error:', error)
    if (error.response.status === 401) {
      res.status(401).send({
        status: error.response.status,
        statusText: error.response.statusText,
        ...error.response.data,
      })
    } else res.status(500).send('Proxy error')
  })
})

// create proxy to forward requests to magento (using http-proxy-middleware):
// rootRouter.use('/2031360', (req, res, next) => {
//   // Set CORS headers
//   res.header('Access-Control-Allow-Origin', '*')
//   res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,HEAD')
//   res.header('Access-Control-Allow-Headers', 'Authorization, Origin, X-Requested-With, Content-Type, Accept')

//   // Respond to preflight requests
//   if (req.method === 'OPTIONS') {
//     // console.log('sending 200 for options request')
//     res.sendStatus(200)
//   } else {
//     next()
//   }
// }, createProxyMiddleware({
//   target: 'https://www.roomservice360.com', // the target host
//   changeOrigin: true, // needed for virtual hosted sites
//   secure: true,
//   pathRewrite: {
//     '^/2031360': '', // rewrite path
//   },
//   logLevel: 'info',
// }))

export default rootRouter
