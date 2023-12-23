import * as yup from 'yup'
import { Transaction } from 'sequelize'
import {
  isId, isString, useTransaction,
} from '../../../utils/utils'

import { Shipment } from './shipment'
import { DBError } from '../../../ErrorManagement/errors'

// building elements of the Shipment type
type ShipmentCreational = {
  id: number
}

type ShipmentRequired = {
  dateShipped: Date // default value: DataTypes.NOW
}

type ShipmentOptional = {
  trackingNumber: string | null
  eta: Date | null
}

type ShipmentTimeStamps = {
  createdAt: Date
  updatedAt: Date
}

type ShipmentFK = {
  carrierId: number
}

// type ShipmentAssociations = {
// carrier?: OrderRead
// shipmentItems?: BrandRead
// receivedItems?: ShipmentItemRead[]
// }

// Note: DATA TYPES
export type ShipmentCreate =
Partial<ShipmentCreational>
& Required<ShipmentRequired>
& Partial<ShipmentOptional>
& Partial<ShipmentTimeStamps>
& Partial<ShipmentFK>

export type ShipmentRead = Required<ShipmentCreate>
// & ShipmentAssociations

const shipmentSchemaCreate: yup.ObjectSchema<ShipmentCreate> = yup.object({
  // ShipmentFK
  // carrierId: number
  carrierId: yup.number()
    .integer()
    .positive()
    .nonNullable()
    .required()
    .label('Shipment malformed data: carrierId'),
  // ShipmentRequired
  // none
  // ShipmentOptional
  // trackingNumber: string | null
  // eta: Date | null
  // dateShipped: Date | null
  trackingNumber: yup.string()
    .nullable()
    .label('Shipment malformed data: trackingNumber'),
  eta: yup.date().nullable().label('Shipment malformed data: eta'),
  dateShipped: yup.date()
    .default(() => new Date())
    .label('Shipment malformed data: dateShipped'),
  // ShipmentCreational
  // id: number
  id: yup.number()
    .integer()
    .positive()
    .nonNullable()
    .label('Shipment malformed data: id'),
  // timestamps
  createdAt: yup.date().nonNullable().label('Shipment malformed data: createdAt'),
  updatedAt: yup.date().nonNullable().label('Shipment malformed data: updatedAt'),
})

const shipmentSchemaUpdate = shipmentSchemaCreate.clone()
  .shape({
    carrierId: yup.number()
      .integer()
      .positive()
      .nonNullable()
      .label('Shipment malformed data: carrierId'),
    dateShipped: yup.date()
      .nonNullable()
      .label('Shipment malformed data: dateShipped'),
  })

export function validateShipmentCreate(object: unknown): ShipmentCreate {
  const shipment = shipmentSchemaCreate.validateSync(object, {
    stripUnknown: true,
    abortEarly: false,
  }) satisfies ShipmentCreate

  return shipment
}

export function validateShipmentUpdate(object: unknown): Partial<ShipmentCreate> {
  // restrict update of id, and creation or modification dates
  const shipment = shipmentSchemaUpdate.omit(['createdAt', 'updatedAt', 'id']).validateSync(object, {
    stripUnknown: true,
    abortEarly: false,
  }) satisfies Partial<ShipmentCreate>

  return shipment
}

// type ShipmentRequest = {
//   orderId: number
//   brandId: number
//   status: POStatus
//   dateSubmitted: Date
//   poNumber: string
//   items: unknown[]
// }

// const shipmentRequestCreate: yup.ObjectSchema<ShipmentRequest> = yup.object({
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

function shipmentToJson(shipmentRaw: Shipment): ShipmentRead {
  const shipmentData: ShipmentRead = shipmentRaw.toJSON()
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

export default class ShipmentController {
  /**
   * convert Shipment Instance or array of instances to a regular JSON object.
   * @param {Shipment | Shipment[] | null} data - shipment, array of shipments or null
   * @returns {ShipmentRead | ShipmentRead[] | null} JSON format nullable.
   */
  static toJSON(data: Shipment): ShipmentRead
  static toJSON(data: Shipment | null): ShipmentRead | null
  static toJSON(data: Shipment[]): ShipmentRead[]
  static toJSON(data: Shipment[] | null): ShipmentRead[] | null
  static toJSON(data: null): null
  static toJSON(data: Shipment | Shipment[] | null): ShipmentRead | ShipmentRead[] | null {
    try {
      if (data instanceof Shipment) {
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
   * get Shipment record by id from DB.
   * @param {unknown} id - shipmentId
   * @returns {Shipment}
   * @throws {DBError} DBError - NotFoundError if no record found
   */
  static async get(id: number | unknown, t?: Transaction): Promise<Shipment> {
    const shipmentId = isId.validateSync(id)
    const final = await Shipment.findByPk(shipmentId, {
      transaction: t,
    })

    if (!final) {
      throw DBError.notFound(new Error(`Shipment with id ${shipmentId} was not found`))
    }
    return final
  }

  /**
   * get Shipment record by trackingNumber.
   * @param {string | unknown} trackingNumber - shipment tracking number
   * @returns {Shipment} Shipment object or null
   */
  static async getByTracking(trackingNumber: string | unknown, t?: Transaction): Promise<Shipment | null> {
    const tracking = isString.validateSync(trackingNumber)
    let final = await Shipment.findOne({
      where: {
        trackingNumber: tracking,
      },
      transaction: t,
    })
    if (!final) {
      return null
    }
    final = await ShipmentController.get(final.id, t)
    return final
  }

  /**
   * insert Shipment record to DB. carrierId is required.
   * @param {ShipmentCreate | unknown} shipmentData - Shipment data to insert to DB
   * @returns {Shipment} newly created Shipment object or throws error
   */
  static async create(shipmentData: ShipmentCreate | unknown, t?: Transaction): Promise<Shipment> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const parsedShipment = validateShipmentCreate(shipmentData)

      const result = await Shipment.create(parsedShipment, {
        transaction,
      })

      const final = await this.get(result.id, transaction)
      if (!final) {
        throw new Error('Internal Error: Shipment was not created')
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
  static async update(shipmentId: number | unknown, shipmentData: unknown, t?: Transaction): Promise<Shipment> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const parsedShipmentUpdate = validateShipmentUpdate(shipmentData)

      const id = isId.validateSync(shipmentId)
      const shipmentRecord = await Shipment.findByPk(id, { transaction })
      if (!shipmentRecord) {
        throw DBError.notFound(new Error('shipment does not exist'))
        // Error('shipment does not exist')
      }

      await shipmentRecord.update(parsedShipmentUpdate, { transaction })
      await commit()
      return shipmentRecord
    } catch (error) {
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }

  /**
   * delete Shipment record with a given id from DB.
   * @param {unknown} id - shipmentId
   * @returns {Shipment} deleted shipment record or throws error
   */
  static async delete(id: number | unknown, t?: Transaction): Promise<Shipment> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const shipmentId = isId.validateSync(id)
      // TODO: check if shipment has any items
      const shipmentRecord = await this.get(shipmentId, transaction)

      if (!shipmentRecord) {
        throw DBError.notFound(new Error(`Shipment with id ${shipmentId} was not found`))
      }
      await Shipment.destroy({
        where: {
          id: shipmentId,
        },
        transaction,
      })
      await commit()
      return shipmentRecord
    } catch (error) {
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }
}
