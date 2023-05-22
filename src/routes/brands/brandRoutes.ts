import express from 'express'
import { handleError, handleResponse } from '../routeUtils'
import BrandController from '../../models/Brand/brandController'

const brandRouter = express.Router()

// // create address record including magento, if provided
// brandRouter.post('/', (req, res) => {
//   try {
//     const address = req.body as unknown
//     AddressController.create(address)
//       .then((result) => {
//         const addressResult = AddressController.toJSON(result)
//         handleResponse(res, addressResult)
//       })
//       .catch((err) => handleError(res, err))
//   } catch (error) {
//     handleError(res, error)
//   }
// })

// // upsert address record including magento. magento externalId is required
// brandRouter.put('/', (req, res) => {
//   try {
//     const address = req.body as unknown
//     AddressController.upsert(address)
//       .then((result) => {
//         const addressResult = AddressController.toJSON(result)
//         handleResponse(res, addressResult)
//       })
//       .catch((err) => handleError(res, err))
//   } catch (error) {
//     handleError(res, error)
//   }
// })

// get brand by externalId
brandRouter.get('/magento/:externalId', (req, res) => {
  try {
    BrandController.getByExternalId(req.params.externalId)
      .then((result) => {
        // const addressResult = AddressController.toJSON(result)
        // FIXME: replace with to JSON controller
        if (result) {
          handleResponse(res, result.toJSON())
          return
        }
        handleResponse(res, 'brand not found')
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// get brand by id
brandRouter.get('/:id', (req, res) => {
  try {
    BrandController.get(req.params.id)
      .then((result) => {
        // const addressResult = AddressController.toJSON(result)
        // FIXME: replace with to JSON controller
        if (result) {
          handleResponse(res, result.toJSON())
          return
        }
        handleResponse(res, 'brand not found')
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// brandRouter.delete('/:addressId/magento', (req, res) => {
//   try {
//     const id = req.params.addressId
//     AddressController.deleteMagento(id)
//       .then((deletedRecord) => {
//         handleResponse(res, deletedRecord)
//       })
//       .catch((err) => handleError(res, err))
//   } catch (error) {
//     handleError(res, error)
//   }
// })

// brandRouter.post('/:addressId/magento', (req, res) => {
//   try {
//     const id = req.params.addressId
//     const magentoData = req.body as unknown
//     AddressController.createMagento(id, magentoData)
//       .then((magentoRecord) => {
//         handleResponse(res, magentoRecord)
//       })
//       .catch((err) => handleError(res, err))
//   } catch (error) {
//     handleError(res, error)
//   }
// })

// brandRouter.delete('/:id', (req, res) => {
//   try {
//     AddressController.delete(req.params.id)
//       .then((numberOfItemsDeleted) => {
//         handleResponse(res, numberOfItemsDeleted)
//       })
//       .catch((err) => handleError(res, err))
//   } catch (error) {
//     handleError(res, error)
//   }
// })

// // update magento record
// brandRouter.patch('/:id', (req, res) => {
//   try {
//     const addressUpdate = req.body as unknown
//     AddressController.update(req.params.id, addressUpdate)
//       .then((result) => {
//         const addressResult = AddressController.toJSON(result)
//         handleResponse(res, addressResult)
//       })
//       .catch((err) => handleError(res, err))
//   } catch (error) {
//     handleError(res, error)
//   }
// })

export default brandRouter
