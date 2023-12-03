import * as yup from 'yup'
import { Transaction } from 'sequelize'
import {
  isId, isString, useTransaction,
} from '../../../utils/utils'

import { DBError } from '../../../ErrorManagement/errors'

// building elements of the ShipmentItem type
type ShipmentItemCreational = {
  id: number
}

type ShipmentItemRequired = {
  qtyShipped: number
}

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
  // ShipmentItemRequired
  // none
  // ShipmentItemOptional
  // trackingNumber: string | null
  // eta: Date | null
  // dateShipped: Date | null
  trackingNumber: yup.string()
    .nullable()
    .label('ShipmentItem malformed data: trackingNumber'),
  eta: yup.date().nullable().label('ShipmentItem malformed data: eta'),
  dateShipped: yup.date()
    .default(() => new Date())
    .label('ShipmentItem malformed data: dateShipped'),
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

const shipmentSchemaUpdate = shipmentSchemaCreate.clone()
  .shape({
    carrierId: yup.number()
      .integer()
      .positive()
      .nonNullable()
      .label('ShipmentItem malformed data: carrierId'),
    dateShipped: yup.date()
      .nonNullable()
      .label('ShipmentItem malformed data: dateShipped'),
  })

export function validateShipmentItemCreate(object: unknown): ShipmentItemCreate {
  const shipment = shipmentSchemaCreate.validateSync(object, {
    stripUnknown: true,
    abortEarly: false,
  }) satisfies ShipmentItemCreate

  return shipment
}

export function validateShipmentItemUpdate(object: unknown): Partial<ShipmentItemCreate> {
  // restrict update of id, and creation or modification dates
  const shipment = shipmentSchemaUpdate.omit(['createdAt', 'updatedAt', 'id']).validateSync(object, {
    stripUnknown: true,
    abortEarly: false,
  }) satisfies Partial<ShipmentItemCreate>

  return shipment
}

// type ShipmentItemRequest = {
//   orderId: number
//   brandId: number
//   status: POStatus
//   dateSubmitted: Date
//   poNumber: string
//   items: unknown[]
// }

// const shipmentRequestCreate: yup.ObjectSchema<ShipmentItemRequest> = yup.object({
//   orderId: yup.number()
//     .integer()
//     .positive()
//     .nonNullable()
//     .required()
//     .label('Malformed data: purchase order orderId'),
//   brandId: yup.number()
//     .integer()
//     .positive()
//     .nonNullable()
//     .required()
//     .label('Malformed data: purchase order brandId'),
//   status: yup.mixed<POStatus>()
//     .oneOf(poStatuses)
//     .nonNullable()
//     .default('in production')
//     .required()
//     .label('Malformed data: purchase order status'),
//   dateSubmitted: yup.date()
//     .default(new Date())
//     .nonNullable()
//     .required()
//     .label('Malformed data: purchase order dateSubmitted'),
//   poNumber: yup.string()
//     .required()
//     .nonNullable()
//     .label('Malformed data: purchase order poNumber'),
//   items: yup.array(yup.mixed().required())
//     .min(1)
//     .required()
//     .label('Malformed data: purchase order items'),
// })

function shipmentToJson(shipmentRaw: ShipmentItem): ShipmentItemRead {
  const shipmentData: ShipmentItemRead = shipmentRaw.toJSON()
  // const result = {
  //   ...shipmentData,
  //   products,
  //   magento,
  // }
  // return result
  // if (shipmentRaw.items) {
  //   const poItems = shipmentRaw.items.map((item) => {
  //     const itemData = item.toJSON()
  //     const product = ProductConfigurationController.toJsonAsProduct(item.product || null)
  //     return {
  //       ...itemData, // will keep origninal po item data
  //       product: product || undefined, // converted db product configuration to ConfigurationAsProduct or remove if null
  //     }
  //   })
  //   shipmentData.items = poItems
  // }
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
        return shipmentToJson(data)
      }
      if (Array.isArray(data)) {
        return data.map(shipmentToJson)
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
   * get ShipmentItem record by trackingNumber.
   * @param {string | unknown} trackingNumber - shipment tracking number
   * @returns {ShipmentItem} ShipmentItem object or null
   */
  static async getByTracking(trackingNumber: string | unknown, t?: Transaction): Promise<ShipmentItem | null> {
    const tracking = isString.validateSync(trackingNumber)
    let final = await ShipmentItem.findOne({
      where: {
        trackingNumber: tracking,
      },
      transaction: t,
    })
    if (!final) {
      return null
    }
    final = await ShipmentItemController.get(final.id, t)
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

      const final = await this.get(result.id, transaction)
      if (!final) {
        throw new Error('Internal Error: ShipmentItem was not created')
      }
      await commit()
      return final
    } catch (error) {
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }

  /**
     * update shipment record in DB.
     * @param {number | unknown} shipmentId - id of the shipment record to update in DB
     * @param {unknown} shipmentData - update data for purchase order record
     * @returns {address} complete Updated purchasde order object or throws error
     */
  static async update(shipmentId: number | unknown, shipmentData: unknown, t?: Transaction): Promise<ShipmentItem> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const parsedShipmentItemUpdate = validateShipmentItemUpdate(shipmentData)

      const id = isId.validateSync(shipmentId)
      const shipmentRecord = await ShipmentItem.findByPk(id, { transaction })
      if (!shipmentRecord) {
        throw DBError.notFound(new Error('shipment does not exist'))
        // Error('shipment does not exist')
      }

      await shipmentRecord.update(parsedShipmentItemUpdate, { transaction })
      await commit()
      return shipmentRecord
    } catch (error) {
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }

  /**
   * delete ShipmentItem record with a given id from DB.
   * @param {unknown} id - shipmentId
   * @returns {boolean} true if ShipmentItem was deleted
   */
  static async delete(id: number | unknown, t?: Transaction): Promise<boolean> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const shipmentId = isId.validateSync(id)
      const final = await ShipmentItem.destroy({
        where: {
          id: shipmentId,
        },
        transaction,
      })
      await commit()
      return final === 1
    } catch (error) {
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }
}
