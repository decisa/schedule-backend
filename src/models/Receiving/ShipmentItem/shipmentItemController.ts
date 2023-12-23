import * as yup from 'yup'
import { Transaction } from 'sequelize'
import {
  isId, useTransaction,
} from '../../../utils/utils'

import { DBError } from '../../../ErrorManagement/errors'
import { ShipmentItem } from './shipmentItem'

// building elements of the ShipmentItem type
type ShipmentItemCreational = {
  id: number
}

type ShipmentItemRequired = {
  qtyShipped: number
}

// no optional fields for shipment items
// type ShipmentItemOptional = {
// }

type ShipmentItemTimeStamps = {
  createdAt: Date
  updatedAt: Date
}

type ShipmentItemFK = {
  shipmentId: number
  purchaseOrderItemId: number
}

// type ShipmentItemAssociations = {
// shipment?:
// purchaseOrderItem?:
// }

// Note: DATA TYPES
export type ShipmentItemCreate =
Partial<ShipmentItemCreational>
& Required<ShipmentItemRequired>
// & Partial<ShipmentItemOptional>
& Partial<ShipmentItemTimeStamps>
& Required<ShipmentItemFK>

export type ShipmentItemRead = Required<ShipmentItemCreate>
// & ShipmentItemAssociations

const shipmentItemSchemaCreate: yup.ObjectSchema<ShipmentItemCreate> = yup.object({
  // ShipmentItemFK
  // shipmentId: number
  // purchaseOrderItemId: number
  shipmentId: yup.number()
    .integer()
    .positive()
    .nonNullable()
    .required()
    .label('ShipmentItem malformed data: shipmentId'),
  purchaseOrderItemId: yup.number()
    .integer()
    .positive()
    .nonNullable()
    .required()
    .label('ShipmentItem malformed data: purchaseOrderItemId'),
  // ShipmentItemRequired
  // qtyShipped: number
  qtyShipped: yup.number()
    .integer()
    .positive()
    .nonNullable()
    .required()
    .label('ShipmentItem malformed data: qtyShipped'),
  // ShipmentItemOptional
  // none
  // ShipmentItemCreational
  // id: number
  id: yup.number()
    .integer()
    .positive()
    .nonNullable()
    .label('ShipmentItem malformed data: id'),
  // timestamps
  createdAt: yup.date().nonNullable().label('ShipmentItem malformed data: createdAt'),
  updatedAt: yup.date().nonNullable().label('ShipmentItem malformed data: updatedAt'),
})

const shipmentItemSchemaUpdate = shipmentItemSchemaCreate.clone()
  .shape({
    shipmentId: yup.number()
      .integer()
      .positive()
      .nonNullable()
      .label('ShipmentItem malformed data: shipmentId'),
    purchaseOrderItemId: yup.number()
      .integer()
      .positive()
      .nonNullable()
      .label('ShipmentItem malformed data: purchaseOrderItemId'),
    // ShipmentItemRequired
    // qtyShipped: number
    qtyShipped: yup.number()
      .integer()
      .positive()
      .nonNullable()
      .label('ShipmentItem malformed data: qtyShipped'),
  })

export function validateShipmentItemCreate(object: unknown): ShipmentItemCreate {
  const shipmentItem = shipmentItemSchemaCreate.validateSync(object, {
    stripUnknown: true,
    abortEarly: false,
  }) satisfies ShipmentItemCreate

  return shipmentItem
}

export function validateShipmentItemUpdate(object: unknown): Partial<ShipmentItemCreate> {
  // restrict update of id, and creation or modification dates
  const shipmentItem = shipmentItemSchemaUpdate.omit(['createdAt', 'updatedAt', 'id']).validateSync(object, {
    stripUnknown: true,
    abortEarly: false,
  }) satisfies Partial<ShipmentItemCreate>

  return shipmentItem
}

function shipmentItemToJson(shipmentItemRaw: ShipmentItem): ShipmentItemRead {
  const shipmentData: ShipmentItemRead = shipmentItemRaw.toJSON()
  return shipmentData
}

export default class ShipmentItemController {
  /**
   * convert ShipmentItem Instance or array of instances to a regular JSON object.
   * @param {ShipmentItem | ShipmentItem[] | null} data - shipment, array of shipments or null
   * @returns {ShipmentItemRead | ShipmentItemRead[] | null} JSON format nullable.
   */
  static toJSON(data: ShipmentItem): ShipmentItemRead
  static toJSON(data: ShipmentItem | null): ShipmentItemRead | null
  static toJSON(data: ShipmentItem[]): ShipmentItemRead[]
  static toJSON(data: ShipmentItem[] | null): ShipmentItemRead[] | null
  static toJSON(data: null): null
  static toJSON(data: ShipmentItem | ShipmentItem[] | null): ShipmentItemRead | ShipmentItemRead[] | null {
    try {
      if (data instanceof ShipmentItem) {
        return shipmentItemToJson(data)
      }
      if (Array.isArray(data)) {
        return data.map(shipmentItemToJson)
      }
      return null
    } catch (error) {
      return null
    }
  }

  /**
   * get ShipmentItem record by id from DB.
   * @param {unknown} id - shipmentId
   * @returns {ShipmentItem}
   * @throws {DBError} DBError - NotFoundError if no record found
   */
  static async get(id: number | unknown, t?: Transaction): Promise<ShipmentItem> {
    const shipmentId = isId.validateSync(id)
    const final = await ShipmentItem.findByPk(shipmentId, {
      transaction: t,
    })

    if (!final) {
      throw DBError.notFound(new Error(`ShipmentItem with id ${shipmentId} was not found`))
    }
    return final
  }

  /**
   * insert ShipmentItem record to DB. carrierId is required.
   * @param {ShipmentItemCreate | unknown} shipmentData - ShipmentItem data to insert to DB
   * @returns {ShipmentItem} newly created ShipmentItem object or throws error
   */
  static async create(shipmentData: ShipmentItemCreate | unknown, t?: Transaction): Promise<ShipmentItem> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const parsedShipmentItem = validateShipmentItemCreate(shipmentData)

      const result = await ShipmentItem.create(parsedShipmentItem, {
        transaction,
      })

      // code below is in case the get method needs to be customized, otherwise redundant
      // const final = await this.get(result.id, transaction)
      // if (!final) {
      //   throw new Error('Internal Error: ShipmentItem was not created')
      // }
      // await commit()
      // return final

      await commit()
      return result
    } catch (error) {
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }

  /**
     * update shipmentItem record in DB.
     * @param {number | unknown} shipmentItemId - id of the shipmentItem record to update in DB
     * @param {unknown} shipmentItemData - update data for shipmentItem record
     * @returns {ShipmentItem} updated ShipmentItem record
     */
  static async update(shipmentItemId: number | unknown, shipmentItemData: unknown, t?: Transaction): Promise<ShipmentItem> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const parsedShipmentItemUpdate = validateShipmentItemUpdate(shipmentItemData)

      const id = isId.validateSync(shipmentItemId)
      const shipmentItemRecord = await ShipmentItem.findByPk(id, { transaction })
      if (!shipmentItemRecord) {
        throw DBError.notFound(new Error('shipment item does not exist'))
        // Error('shipment does not exist')
      }

      await shipmentItemRecord.update(parsedShipmentItemUpdate, { transaction })
      await commit()
      return shipmentItemRecord
    } catch (error) {
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }

  /**
   * delete ShipmentItem record with a given id from DB.
   * @param {unknown} id - shipmentId
   * @returns {ShipmentItemRead} returns  ShipmentItem was deleted or throws error
   */
  static async delete(id: number | unknown, t?: Transaction): Promise<ShipmentItemRead> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const shipmentId = isId.validateSync(id)
      const shipmentRecord = await this.get(shipmentId, transaction)
      if (!shipmentRecord) {
        throw DBError.notFound(new Error(`ShipmentItem with id ${shipmentId} was not found`))
      }
      await ShipmentItem.destroy({
        where: {
          id: shipmentId,
        },
        transaction,
      })
      await commit()
      return shipmentRecord.toJSON()
    } catch (error) {
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }
}
