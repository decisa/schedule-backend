import * as yup from 'yup'
import { Transaction } from 'sequelize'
import {
  isId, useTransaction,
} from '../../../utils/utils'

import { DBError } from '../../../ErrorManagement/errors'
import { ReceivedItem } from './receivedItems'

// building elements of the ReceivedItem type
type ReceivedItemCreational = {
  id: number
}

type ReceivedItemRequired = {
  receivedDate: Date
  qtyReceived: number
}

// received date is optional because it has a default value of now
type ReceivedItemOptional = {

  notes: string | null
}

type ReceivedItemTimeStamps = {
  createdAt: Date
  updatedAt: Date
}

type ReceivedItemFK = {
  shipmentItemId: number
}

// type ReceivedItemAssociations = {
// shipmentItem?:
// }

// Note: DATA TYPES
export type ReceivedItemCreate =
Partial<ReceivedItemCreational>
& Required<ReceivedItemRequired>
& Partial<ReceivedItemOptional>
& Partial<ReceivedItemTimeStamps>
& Required<ReceivedItemFK>

export type ReceivedItemRead = Required<ReceivedItemCreate>
// & ReceivedItemAssociations

const receivedItemSchemaCreate: yup.ObjectSchema<ReceivedItemCreate> = yup.object({
  // ReceivedItemFK
  // shipmentItemId: number
  shipmentItemId: yup.number()
    .integer()
    .positive()
    .nonNullable()
    .required()
    .label('ReceivedItem malformed data: shipmentItemId'),
  // ReceivedItemRequired
  // qtyReceived: number
  // receivedDate: Date
  qtyReceived: yup.number()
    .integer()
    .positive()
    .nonNullable()
    .required()
    .label('ReceivedItem malformed data: qtyReceived'),
  receivedDate: yup.date()
    .default(new Date())
    .nonNullable()
    .required()
    .label('ReceivedItem malformed data: receivedDate'),
  // ReceivedItemOptional
  // notes: string | null
  notes: yup.string()
    .nullable()
    .label('ReceivedItem malformed data: notes'),
  // ReceivedItemCreational
  // id: number
  id: yup.number()
    .integer()
    .positive()
    .nonNullable()
    .label('ReceivedItem malformed data: id'),
  // timestamps
  createdAt: yup.date().nonNullable().label('ReceivedItem malformed data: createdAt'),
  updatedAt: yup.date().nonNullable().label('ReceivedItem malformed data: updatedAt'),
})

const receivedItemSchemaUpdate = receivedItemSchemaCreate.clone()
  .shape({
    shipmentItemId: yup.number()
      .integer()
      .positive()
      .nonNullable()
      .label('ReceivedItem malformed data: shipmentItemId'),
    qtyReceived: yup.number()
      .integer()
      .positive()
      .nonNullable()
      .label('ReceivedItem malformed data: qtyReceived'),
    receivedDate: yup.date()
      .nonNullable()
      .label('ReceivedItem malformed data: receivedDate'),
  })

export function validateReceivedItemCreate(object: unknown): ReceivedItemCreate {
  const receivedItem = receivedItemSchemaCreate.validateSync(object, {
    stripUnknown: true,
    abortEarly: false,
  }) satisfies ReceivedItemCreate

  return receivedItem
}

export function validateReceivedItemUpdate(object: unknown): Partial<ReceivedItemCreate> {
  // restrict update of id, and creation or modification dates
  const receivedItem = receivedItemSchemaUpdate.omit(['createdAt', 'updatedAt', 'id']).validateSync(object, {
    stripUnknown: true,
    abortEarly: false,
  }) satisfies Partial<ReceivedItemCreate>

  return receivedItem
}

function receivedItemToJson(receivedItemRaw: ReceivedItem): ReceivedItemRead {
  const shipmentData: ReceivedItemRead = receivedItemRaw.toJSON()
  return shipmentData
}

export default class ReceivedItemController {
  /**
   * convert ReceivedItem Instance or array of instances to a regular JSON object.
   * @param {ReceivedItem | ReceivedItem[] | null} data - shipment, array of shipments or null
   * @returns {ReceivedItemRead | ReceivedItemRead[] | null} JSON format nullable.
   */
  static toJSON(data: ReceivedItem): ReceivedItemRead
  static toJSON(data: ReceivedItem | null): ReceivedItemRead | null
  static toJSON(data: ReceivedItem[]): ReceivedItemRead[]
  static toJSON(data: ReceivedItem[] | null): ReceivedItemRead[] | null
  static toJSON(data: null): null
  static toJSON(data: ReceivedItem | ReceivedItem[] | null): ReceivedItemRead | ReceivedItemRead[] | null {
    try {
      if (data instanceof ReceivedItem) {
        return receivedItemToJson(data)
      }
      if (Array.isArray(data)) {
        return data.map(receivedItemToJson)
      }
      return null
    } catch (error) {
      return null
    }
  }

  /**
   * get ReceivedItem record by id from DB.
   * @param {unknown} id - shipmentId
   * @returns {ReceivedItem}
   * @throws {DBError} DBError - NotFoundError if no record found
   */
  static async get(id: number | unknown, t?: Transaction): Promise<ReceivedItem> {
    const shipmentId = isId.validateSync(id)
    const final = await ReceivedItem.findByPk(shipmentId, {
      transaction: t,
    })

    if (!final) {
      throw DBError.notFound(new Error(`ReceivedItem with id ${shipmentId} was not found`))
    }
    return final
  }

  /**
   * insert ReceivedItem record to DB. shippedItemId and qtyReceived are required.
   * @param {ReceivedItemCreate | unknown} shipmentData - ReceivedItem data to insert to DB
   * @returns {ReceivedItem} newly created ReceivedItem object or throws error
   */
  static async create(shipmentData: ReceivedItemCreate | unknown, t?: Transaction): Promise<ReceivedItem> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const parsedReceivedItem = validateReceivedItemCreate(shipmentData)

      const result = await ReceivedItem.create(parsedReceivedItem, {
        transaction,
      })

      await commit()
      return result
    } catch (error) {
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }

  /**
   * bulk insert ReceivedItem records to DB. shippedItemId and qtyReceived are required for each item.
   * @param {ReceivedItemCreate[] | unknown[]} receivedItems - array of ReceivedItem records to insert to DB
   * @returns {ReceivedItem[]} array of created ReceivedItems or throws error
   */
  static async bulkCreate(receivedItems: ReceivedItemCreate[] | unknown[], t?: Transaction): Promise<ReceivedItem[]> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const result: ReceivedItem[] = []
      for (let i = 0; i < receivedItems.length; i += 1) {
        const parsedReceivedItem = receivedItemSchemaCreate.validateSync(receivedItems[i], {
          stripUnknown: true,
          abortEarly: false,
        })

        const receivedItem = await this.create(parsedReceivedItem, transaction)
        result.push(receivedItem)
      }

      await commit()
      return result
    } catch (error) {
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }

  /**
     * update receivedItem record in DB.
     * @param {number | unknown} receivedItemId - id of the receivedItem record to update in DB
     * @param {unknown} receivedItemData - update data for receivedItem record
     * @returns {ReceivedItem} updated ReceivedItem record
     */
  static async update(receivedItemId: number | unknown, receivedItemData: unknown, t?: Transaction): Promise<ReceivedItem> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const parsedReceivedItemUpdate = validateReceivedItemUpdate(receivedItemData)

      const id = isId.validateSync(receivedItemId)
      const receivedItemRecord = await ReceivedItem.findByPk(id, { transaction })
      if (!receivedItemRecord) {
        throw DBError.notFound(new Error('shipment item does not exist'))
      }

      await receivedItemRecord.update(parsedReceivedItemUpdate, { transaction })
      await commit()
      return receivedItemRecord
    } catch (error) {
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }

  /**
   * delete ReceivedItem record with a given id from DB.
   * @param {unknown} id - receivedItemId
   * @returns {ReceivedItemRead} returns ReceivedItem that was deleted or throws not found error
   */
  static async delete(id: number | unknown, t?: Transaction): Promise<ReceivedItemRead> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const receivedItemId = isId.validateSync(id)
      const receivedItemRecord = await this.get(receivedItemId, transaction)
      if (!receivedItemRecord) {
        throw DBError.notFound(new Error(`ReceivedItem with id ${receivedItemId} was not found`))
      }
      await ReceivedItem.destroy({
        where: {
          id: receivedItemId,
        },
        transaction,
      })
      await commit()
      return receivedItemRecord
    } catch (error) {
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }
}
