import express from 'express'
import { handleError, handleResponse } from '../routeUtils'
import ReceivedItemController from '../../models/Receiving/ReceivedItems/receivedItemController'
import { DBError } from '../../ErrorManagement/errors'

const receivingRouter = express.Router()

// create Receiving Item records
receivingRouter.post('/', (req, res) => {
  try {
    const receivingItems = req.body as unknown
    if (!Array.isArray(receivingItems)) {
      throw DBError.badData(new Error('receivingItems must be an array'))
    }
    ReceivedItemController.bulkCreate(receivingItems)
      .then((result) => {
        const receivedItemsResult = ReceivedItemController.toJSON(result)
        handleResponse(res, receivedItemsResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// delete Receiving Item record
receivingRouter.delete('/:id', (req, res) => {
  try {
    const { id } = req.params
    ReceivedItemController.delete(id)
      .then((result) => {
        const receivedItemResult = ReceivedItemController.toJSON(result)
        handleResponse(res, receivedItemResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// update Receiving Item record
receivingRouter.patch('/:id', (req, res) => {
  try {
    const { id } = req.params
    const receivedItemUpdateData = req.body as unknown
    ReceivedItemController.update(id, receivedItemUpdateData)
      .then((result) => {
        const receivedItemResult = ReceivedItemController.toJSON(result)
        handleResponse(res, receivedItemResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

// get Receiving Item record
receivingRouter.get('/:id', (req, res) => {
  try {
    const { id } = req.params
    ReceivedItemController.get(id)
      .then((result) => {
        const receivedItemResult = ReceivedItemController.toJSON(result)
        handleResponse(res, receivedItemResult)
      })
      .catch((err) => handleError(res, err))
  } catch (error) {
    handleError(res, error)
  }
})

export default receivingRouter
