import express from 'express'
import { handleError, handleResponse } from '../routeUtils'
import ProductController, { ProductRead } from '../../models/Sales/Product/productController'

const productRouter = express.Router()

// create product record
productRouter.post('/', (req, res) => {
  try {
    const product = req.body as unknown
    ProductController.create(product)
      .then((result) => {
        const productResult = ProductController.toJSON(result)
        handleResponse(res, productResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// upsert product record. magento externalId is required
productRouter.put('/', (req, res) => {
  try {
    const product = req.body as unknown
    ProductController.upsert(product)
      .then((result) => {
        const productResult = ProductController.toJSON(result)
        handleResponse(res, productResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// // get brand by externalId
// productRouter.get('/magento/:externalId', (req, res) => {
//   try {
//     ProductController.getByExternalId(req.params.externalId)
//       .then((result) => {
//         const brandResult = ProductController.toJSON(result)
//         handleResponse(res, brandResult)
//       })
//       .catch((err) => handleError(res, err))
//   } catch (error) {
//     handleError(res, error)
//   }
// })

// // get all brands
// productRouter.get('/all', (req, res) => {
//   try {
//     ProductController.getAll()
//       .then((result) => {
//         const brandResult = ProductController.toJSON(result)
//         handleResponse(res, brandResult)
//       })
//       .catch((err) => handleError(res, err))
//   } catch (error) {
//     handleError(res, error)
//   }
// })

// get product by id
productRouter.get('/:id', (req, res) => {
  try {
    ProductController.get(req.params.id)
      .then((result) => {
        const productResult = ProductController.toJSON(result)
        handleResponse(res, productResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// // brandRouter.delete('/:addressId/magento', (req, res) => {
// //   try {
// //     const id = req.params.addressId
// //     AddressController.deleteMagento(id)
// //       .then((deletedRecord) => {
// //         handleResponse(res, deletedRecord)
// //       })
// //       .catch((err) => handleError(res, err))
// //   } catch (error) {
// //     handleError(res, error)
// //   }
// // })

// // brandRouter.post('/:addressId/magento', (req, res) => {
// //   try {
// //     const id = req.params.addressId
// //     const magentoData = req.body as unknown
// //     AddressController.createMagento(id, magentoData)
// //       .then((magentoRecord) => {
// //         handleResponse(res, magentoRecord)
// //       })
// //       .catch((err) => handleError(res, err))
// //   } catch (error) {
// //     handleError(res, error)
// //   }
// // })

productRouter.delete('/:id', (req, res) => {
  try {
    ProductController.delete(req.params.id)
      .then((productIsDeleted) => {
        handleResponse(res, productIsDeleted)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// update product
productRouter.patch('/:id', (req, res) => {
  try {
    const productUpdate = req.body as unknown
    ProductController.update(req.params.id, productUpdate)
      .then((result) => {
        const productResult = ProductController.toJSON(result)
        handleResponse(res, productResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

export default productRouter
