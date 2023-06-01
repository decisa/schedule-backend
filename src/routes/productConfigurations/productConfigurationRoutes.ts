import express from 'express'
import { handleError, handleResponse } from '../routeUtils'
import ProductConfigurationController from '../../models/Sales/ProductConfiguration/productConfigurationController'

const productConfigurationRouter = express.Router()

// create product configuration record
productConfigurationRouter.post('/', (req, res) => {
  try {
    const productConfiguration = req.body as unknown
    ProductConfigurationController.create(productConfiguration)
      .then((result) => {
        const productConfigurationResult = ProductConfigurationController.toJSON(result)
        handleResponse(res, productConfigurationResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// upsert product configuration record. magento externalId is required
productConfigurationRouter.put('/', (req, res) => {
  try {
    const productConfiguration = req.body as unknown
    ProductConfigurationController.upsert(productConfiguration)
      .then((result) => {
        const productConfigurationResult = ProductConfigurationController.toJSON(result)
        handleResponse(res, productConfigurationResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// // // get brand by externalId
// // productRouter.get('/magento/:externalId', (req, res) => {
// //   try {
// //     ProductController.getByExternalId(req.params.externalId)
// //       .then((result) => {
// //         const brandResult = ProductController.toJSON(result)
// //         handleResponse(res, brandResult)
// //       })
// //       .catch((err) => handleError(res, err))
// //   } catch (error) {
// //     handleError(res, error)
// //   }
// // })

// get all configuratios for the orderdbrands
productConfigurationRouter.get('/order/:id', (req, res) => {
  try {
    ProductConfigurationController.getAllByOrderId(req.params.id)
      .then((result) => {
        const products = ProductConfigurationController.toJsonAsProduct(result)
        handleResponse(res, products)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// get productConfiguration by id
productConfigurationRouter.get('/:id', (req, res) => {
  try {
    ProductConfigurationController.get(req.params.id)
      .then((result) => {
        const productResult = ProductConfigurationController.toJSON(result)
        handleResponse(res, productResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// // // brandRouter.delete('/:addressId/magento', (req, res) => {
// // //   try {
// // //     const id = req.params.addressId
// // //     AddressController.deleteMagento(id)
// // //       .then((deletedRecord) => {
// // //         handleResponse(res, deletedRecord)
// // //       })
// // //       .catch((err) => handleError(res, err))
// // //   } catch (error) {
// // //     handleError(res, error)
// // //   }
// // // })

// // // brandRouter.post('/:addressId/magento', (req, res) => {
// // //   try {
// // //     const id = req.params.addressId
// // //     const magentoData = req.body as unknown
// // //     AddressController.createMagento(id, magentoData)
// // //       .then((magentoRecord) => {
// // //         handleResponse(res, magentoRecord)
// // //       })
// // //       .catch((err) => handleError(res, err))
// // //   } catch (error) {
// // //     handleError(res, error)
// // //   }
// // // })

productConfigurationRouter.delete('/:id', (req, res) => {
  try {
    ProductConfigurationController.delete(req.params.id)
      .then((productConfigurationIsDeleted) => {
        handleResponse(res, productConfigurationIsDeleted)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// update product configuratio
productConfigurationRouter.patch('/:id', (req, res) => {
  try {
    const productUpdate = req.body as unknown
    ProductConfigurationController.update(req.params.id, productUpdate)
      .then((result) => {
        const productResult = ProductConfigurationController.toJSON(result)
        handleResponse(res, productResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

export default productConfigurationRouter
