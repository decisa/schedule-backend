import express from 'express'
import { handleError, handleResponse } from '../routeUtils'
import ProductOptionController from '../../models/Sales/ProductOption/productOptionController'

const productOptionRouter = express.Router()

// create Option record
productOptionRouter.post('/', (req, res) => {
  try {
    const option = req.body as unknown
    ProductOptionController.create(option)
      .then((result) => {
        const optionResult = ProductOptionController.toJSON(result)
        handleResponse(res, optionResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// upsert option record. magento externalId is required
productOptionRouter.put('/', (req, res) => {
  try {
    const option = req.body as unknown
    ProductOptionController.upsert(option)
      .then((result) => {
        const optionResult = ProductOptionController.toJSON(result)
        handleResponse(res, optionResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// // get brand by externalId
// productOptionRouter.get('/magento/:externalId', (req, res) => {
//   try {
//     ProductOptionController.getByExternalId(req.params.externalId)
//       .then((result) => {
//         const brandResult = ProductOptionController.toJSON(result)
//         handleResponse(res, brandResult)
//       })
//       .catch((err) => handleError(res, err))
//   } catch (error) {
//     handleError(res, error)
//   }
// })

// get all productOptions by configurationId
productOptionRouter.get('/configuration/:id', (req, res) => {
  try {
    ProductOptionController.getAllByConfigId(req.params.id)
      .then((result) => {
        const optionsResult = ProductOptionController.toJSON(result)
        handleResponse(res, optionsResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// get all productOptions by configurationId
productOptionRouter.delete('/configuration/:id', (req, res) => {
  try {
    ProductOptionController.deleteConfigurationOptions(req.params.id)
      .then((result) => {
        handleResponse(res, {
          optionsDeleted: result,
        })
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// get all productOptions by configurationId
productOptionRouter.get('/max/:id', (req, res) => {
  try {
    ProductOptionController.highestSortOrder(req.params.id)
      .then((result) => {
        handleResponse(res, {
          sortOrder: result,
        })
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// get productOption by id
productOptionRouter.get('/:id', (req, res) => {
  try {
    ProductOptionController.get(req.params.id)
      .then((result) => {
        const brandResult = ProductOptionController.toJSON(result)
        handleResponse(res, brandResult)
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

// delete option with a given ID
productOptionRouter.delete('/:id', (req, res) => {
  try {
    ProductOptionController.delete(req.params.id)
      .then((optionIsDeleted) => {
        handleResponse(res, optionIsDeleted)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// update product option
productOptionRouter.patch('/:id', (req, res) => {
  try {
    const optionUpdate = req.body as unknown
    ProductOptionController.update(req.params.id, optionUpdate)
      .then((result) => {
        const optionResult = ProductOptionController.toJSON(result)
        handleResponse(res, optionResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

export default productOptionRouter
