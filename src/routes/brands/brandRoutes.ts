import express from 'express'
import { handleError, handleResponse } from '../routeUtils'
import BrandController from '../../models/Brand/brandController'

const brandRouter = express.Router()

// create Brand record
brandRouter.post('/', (req, res) => {
  try {
    const brand = req.body as unknown
    BrandController.create(brand)
      .then((result) => {
        const brandResult = BrandController.toJSON(result)
        handleResponse(res, brandResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// upsert address record including magento. magento externalId is required
brandRouter.put('/', (req, res) => {
  try {
    const brand = req.body as unknown
    BrandController.upsert(brand)
      .then((result) => {
        const brandResult = BrandController.toJSON(result)
        handleResponse(res, brandResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// upsert address record including magento. magento externalId is required
brandRouter.put('/bulk', (req, res) => {
  try {
    const brands = req.body as unknown // Brand[]
    BrandController.bulkUpsert(brands)
      .then((result) => {
        const brandResults = BrandController.toJSON(result)
        handleResponse(res, brandResults)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// get brand by externalId
brandRouter.get('/magento/:externalId', (req, res) => {
  try {
    BrandController.getByExternalId(req.params.externalId)
      .then((result) => {
        const brandResult = BrandController.toJSON(result)
        handleResponse(res, brandResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// get all brands
brandRouter.get('/all', (req, res) => {
  try {
    BrandController.getAll()
      .then((result) => {
        const brandResult = BrandController.toJSON(result)
        handleResponse(res, brandResult)
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
        const brandResult = BrandController.toJSON(result)
        handleResponse(res, brandResult)
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

brandRouter.delete('/:id', (req, res) => {
  try {
    BrandController.delete(req.params.id)
      .then((brandIsDeleted) => {
        handleResponse(res, brandIsDeleted)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// update brand
brandRouter.patch('/:id', (req, res) => {
  try {
    const brandUpdate = req.body as unknown
    BrandController.update(req.params.id, brandUpdate)
      .then((result) => {
        const brandResult = BrandController.toJSON(result)
        handleResponse(res, brandResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

export default brandRouter
