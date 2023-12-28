import * as yup from 'yup'
import { Transaction } from 'sequelize'
import {
  isId, isString, useTransaction,
} from '../../../utils/utils'

import { Shipment } from './shipment'
import { DBError } from '../../../ErrorManagement/errors'
import ShipmentItemController from '../ShipmentItem/shipmentItemController'
import { ShipmentItem } from '../ShipmentItem/shipmentItem'
import { PurchaseOrderItem } from '../PurchaseOrderItem/purchaseOrderItem'
import { ProductConfiguration } from '../../Sales/ProductConfiguration/productConfiguration'
import { Product } from '../../Sales/Product/product'
import { CarrierRead } from '../Carrier/carrierController'

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
// items?: ShipmentItem[]
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

function shipmentToJson(shipmentRaw: Shipment): ShipmentRead {
  const shipmentData: ShipmentRead = shipmentRaw.toJSON()

  return shipmentData
}

type ShipmentCreateRequest = ShipmentCreate & {
  items: unknown[] // items must be an array, which will be validated later by ShipmentItemController
}

const shipmentCreateRequestSchema: yup.ObjectSchema<ShipmentCreateRequest> = shipmentSchemaCreate.clone()
  .shape({
    items: yup.array(yup.mixed().required())
      .min(1)
      .required()
      .label('Shipment malformed data: shipment items'),
  })

type ShipmentItemResponse = {
  id: number
  qtyShipped: number
  // qtyReceived: number
  qtyPurchased?: number
  qtyOrdered?: number
  qtyRefunded?: number
  qtyShippedExternal?: number | null
  purchaseOrderItemId: number
  productId?: number
  configurationId?: number
  orderId?: number
  name?: string
  url?: string | null
  image?: string | null
  sku?: string | null
  brandId?: number | null
  brand?: {
    id?: number
    name?: string
  }
  purchaseOrderId?: number
  purchaseOrder?: {
    id?: number
    poNumber?: string
  }
}

type FullShipmentResponse = {
  id: number
  trackingNumber: string | null
  eta: Date | null
  dateShipped: Date
  carrierId: number
  carrier?: CarrierRead
  items: ShipmentItemResponse[]
  createdAt: Date
  updatedAt: Date
}

function fullShipmentToJson(shipmentRaw: Shipment): FullShipmentResponse {
  const shipmentData: ShipmentRead = shipmentRaw.toJSON()

  const {
    id,
    trackingNumber,
    eta,
    dateShipped,
    carrierId,
    createdAt,
    updatedAt,
  } = shipmentData

  const shipmentItemsRaw = shipmentRaw.items || []

  const items: ShipmentItemResponse[] = shipmentItemsRaw.map((item) => {
    const {
      id: shipmentItemId,
      qtyShipped,
      purchaseOrderItemId,
    } = item.toJSON()

    const purchaseOrderItem = item?.purchaseOrderItem?.toJSON()
    const {
      qtyPurchased,
      purchaseOrderId,
      configurationId,
    } = purchaseOrderItem || {}

    const productConfiguration = item?.purchaseOrderItem?.product?.toJSON()
    const {
      qtyOrdered,
      qtyRefunded,
      qtyShippedExternal,
      orderId,
      productId,
    } = productConfiguration || {}

    const mainProduct = item?.purchaseOrderItem?.product?.product?.toJSON()
    const {
      name,
      url,
      image,
      sku,
      brandId,
    } = mainProduct || {}

    const brand = item?.purchaseOrderItem?.product?.product?.brand?.toJSON()
    const {
      name: brandName,
    } = brand || {}

    const purchaseOrder = item.purchaseOrderItem?.purchaseOrder?.toJSON()
    const {
      poNumber,
    } = purchaseOrder || {}

    return {
      id: shipmentItemId,
      qtyShipped,
      qtyPurchased,
      qtyOrdered,
      qtyRefunded,
      qtyShippedExternal,
      purchaseOrderItemId,
      productId,
      configurationId,
      orderId,
      name,
      url,
      image,
      sku,
      brandId,
      brand: brandId && brandName ? {
        id: brandId,
        name: brandName,
      } : undefined,
      purchaseOrderId,
      purchaseOrder: purchaseOrderId && poNumber ? {
        id: purchaseOrderId,
        poNumber,
      } : undefined,
    }
  })

  return {
    id,
    trackingNumber,
    eta,
    dateShipped,
    carrierId,
    carrier: shipmentRaw?.carrier?.toJSON(),
    items,
    createdAt,
    updatedAt,
  }
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
   * convert Full Shipment Instance or array of instances to a regular JSON object.
   * @param {Shipment | Shipment[] | null} data - shipment, array of shipments or null
   * @returns {FullShipmentResponse | FullShipmentResponse[] | null} JSON format nullable.
   */
  static toFullJSON(data: Shipment): FullShipmentResponse
  static toFullJSON(data: Shipment | null): FullShipmentResponse | null
  static toFullJSON(data: Shipment[]): FullShipmentResponse[]
  static toFullJSON(data: Shipment[] | null): FullShipmentResponse[] | null
  static toFullJSON(data: null): null
  static toFullJSON(data: Shipment | Shipment[] | null): FullShipmentResponse | FullShipmentResponse[] | null {
    try {
      if (data instanceof Shipment) {
        return fullShipmentToJson(data)
      }
      if (Array.isArray(data)) {
        return data.map(fullShipmentToJson)
      }
      return null
    } catch (error) {
      return null
    }
  }

  /**
   * get plain Shipment record by id from DB.
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
   * get Shipment record by id from DB.
   * @param {unknown} id - shipmentId
   * @returns {Shipment}
   * @throws {DBError} DBError - NotFoundError if no record found
   */
  static async getFullShipment(id: number | unknown, t?: Transaction): Promise<Shipment> {
    const shipmentId = isId.validateSync(id)
    const final = await Shipment.findByPk(shipmentId, {
      transaction: t,
      include: [
        {
          association: Shipment.associations.carrier,
        },
        {
          association: Shipment.associations.items,
          include: [
            {
              association: ShipmentItem.associations.purchaseOrderItem,
              include: [
                {
                  association: PurchaseOrderItem.associations.product,
                  include: [
                    {
                      association: ProductConfiguration.associations.product,
                      include: [
                        {
                          association: Product.associations.brand,
                        },
                      ],
                    },
                  ],
                },
                {
                  association: PurchaseOrderItem.associations.purchaseOrder,
                  attributes: ['poNumber'],
                },
              ],
            },
          ],
        },
      ],
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
 * create a Shipment with ShipmentItems
 * @param {ShipmentCreate | unknown} shipmentData - shipment data along with shipmentItems
 * @returns {Shipment} Shipment object or throws error
 */
  static async createShipment(shipmentData: ShipmentCreateRequest | unknown, t?: Transaction): Promise<Shipment> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const parsedShipment = shipmentCreateRequestSchema.validateSync(shipmentData, {
        stripUnknown: true,
        abortEarly: false,
      }) satisfies ShipmentCreateRequest

      const newShipmentRecord = await this.create(parsedShipment, transaction)
      if (!newShipmentRecord) {
        throw new Error('Internal Error: PurchaseOrder was not created')
      }

      const items = await ShipmentItemController.bulkCreate(newShipmentRecord.id, parsedShipment.items, transaction)

      newShipmentRecord.items = items
      await commit()
      return newShipmentRecord
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
