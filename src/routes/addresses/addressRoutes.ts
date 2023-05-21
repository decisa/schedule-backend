import express from 'express'
import { handleError, handleResponse } from '../routeUtils'
import AddressController from '../../models/Sales/Address/addressController'

const addressRouter = express.Router()

// create address record including magento, if provided
addressRouter.post('/', (req, res) => {
  try {
    // const id = 1
    // console.log('params', req.params)
    const address = req.body as unknown
    AddressController.create(address)
      .then((result) => {
        // const addressResult = AddressController.toJSON(result)
        handleResponse(res, result)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// // upsert customer record including magento, if provided. email required
// addressRouter.put('/', (req, res) => {
//   try {
//     // const id = 1
//     // console.log('params', req.params)
//     const customer = req.body as unknown
//     CustomerController.upsert(customer)
//       .then((result) => {
//         const customerResult = CustomerController.toJSON(result)
//         handleResponse(res, customerResult)
//       })
//       .catch((err) => handleError(res, err))
//   } catch (error) {
//     handleError(res, error)
//   }
// })

// get address by id, will include Magento record if exists
addressRouter.get('/:id', (req, res) => {
  try {
    AddressController.get(req.params.id)
      .then((result) => {
        const addressResult = AddressController.toJSON(result)
        handleResponse(res, addressResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// addressRouter.delete('/magento', (req, res) => {
//   try {
//     const email = req.body as unknown
//     CustomerController.deleteMagento(email)
//       .then((deletedRecord) => {
//         handleResponse(res, deletedRecord)
//       })
//       .catch((err) => handleError(res, err))
//   } catch (error) {
//     handleError(res, error)
//   }
// })

// addressRouter.post('/magento', (req, res) => {
//   try {
//     const magentoData = req.body as unknown
//     CustomerController.createMagento(magentoData)
//       .then((magentoRecord) => {
//         handleResponse(res, magentoRecord)
//       })
//       .catch((err) => handleError(res, err))
//   } catch (error) {
//     handleError(res, error)
//   }
// })

// addressRouter.delete('/:id', (req, res) => {
//   try {
//     CustomerController.delete(req.params.id)
//       .then((numberOfItemsDeleted) => {
//         handleResponse(res, numberOfItemsDeleted)
//       })
//       .catch((err) => handleError(res, err))
//   } catch (error) {
//     handleError(res, error)
//   }
// })

// update magento record
addressRouter.patch('/:id', (req, res) => {
  try {
    const addressUpdate = req.body as unknown
    AddressController.update(req.params.id, addressUpdate)
      .then((result) => {
        const addressResult = AddressController.toJSON(result)
        handleResponse(res, addressResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

export default addressRouter
