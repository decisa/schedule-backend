import * as yup from 'yup'
import { ForeignKeyConstraintError, Transaction, ValidationError } from 'sequelize'
import {
  isId, printRedLine, printYellowLine, useTransaction,
} from '../../../utils/utils'

import type { ConfigurationAsProductRead } from '../../Sales/ProductConfiguration/productConfigurationController'
import type { DeliveryRead } from '../Delivery/DeliveryController'
import { DeliveryItem } from './DeliveryItem'
import ProductConfigurationController from '../../Sales/ProductConfiguration/productConfigurationController'
import { ProductOption } from '../../Sales/ProductOption/productOption'
import { ProductConfiguration } from '../../Sales/ProductConfiguration/productConfiguration'
import { deliveryItemConstraintName } from '../../../../migrations/2024.02.08T02.04.54.delivery-items-add-constraint'
import { DBError } from '../../../ErrorManagement/errors'
import { Delivery } from '../Delivery/Delivery'

export const deliveryStatuses = ['pending', 'scheduled', 'confirmed'] as const
export type DeliveryStatus = typeof deliveryStatuses[number]

const CANNOTBEZEROERROR = 'DeliveryItem cannot have qty=0'

type DeliveryItemCreational = {
  id: number
}

type DeliveryItemRequired = {
  qty: number
}

type DeliveryItemOptional = {
  // no optional fields
}

type DeliveryItemTimeStamps = {
  createdAt: Date
  updatedAt: Date
}

type DeliveryItemFK = {
  configurationId: number
  deliveryId: number
}

type DeliveryItemAssociations = {
  product: ConfigurationAsProductRead
  delivery: DeliveryRead
}

// Note: DATA TYPES
export type DeliveryItemCreate =
  Partial<DeliveryItemCreational>
  & Required<DeliveryItemRequired>
  & Partial<DeliveryItemOptional>
  & Partial<DeliveryItemTimeStamps>
  & Required<DeliveryItemFK>
  // & Partial<DeliveryItemAssociations>

// export type DeliveryItemUpdate = Partial<DeliveryItemCreate>

export type DeliveryItemRead = Required<DeliveryItemCreate> & Partial<DeliveryItemAssociations>
// todo: add logic to control qty update

// forbid id, createdAt, updatedAt updates through API
export type DeliveryItemUpdate = Omit<Partial<DeliveryItemCreate>, 'id' | 'createdAt' | 'updatedAt'>

const deliveryItemSchemaCreate: yup.ObjectSchema<DeliveryItemCreate> = yup.object({
  // FK
  // configurationId: number
  // deliveryId: number
  configurationId: yup.number()
    .integer()
    .positive()
    .nonNullable()
    .required()
    .label('DeliveryItem malformed data: configurationId'),
  deliveryId: yup.number()
    .integer()
    .positive()
    .nonNullable()
    .required()
    .label('DeliveryItem malformed data: deliveryId'),
  // required
  qty: yup.number()
    .min(0)
    .nonNullable()
    .required()
    .label('DeliveryItem malformed data: qty'),
  // optional
  // id: number
  id: yup
    .number()
    .integer()
    .positive()
    .nonNullable()
    .label('DeliveryItem malformed data: id'),
  // createdAt: Date
  // updatedAt: Date
  createdAt: yup.date().nonNullable().label('DeliveryItem malformed data: createdAt'),
  updatedAt: yup.date().nonNullable().label('DeliveryItem malformed data: updatedAt'),
})

// create a copy and remove required fields for update operations.
const deliveryItemSchemaUpdate: yup.ObjectSchema<DeliveryItemUpdate> = deliveryItemSchemaCreate.clone()
  .shape({
    configurationId: yup.number()
      .integer()
      .positive()
      .nonNullable()
      .label('DeliveryItem malformed data: configurationId'),
    deliveryId: yup.number()
      .integer()
      .positive()
      .nonNullable()
      .label('DeliveryItem malformed data: deliveryId'),
    qty: yup.number()
      .min(0) // allow zero for updates, so we can auto-delete items with qty=0 in controller
      .nonNullable()
      .label('DeliveryItem malformed data: qty'),
  })

export function validateDeliveryItemCreate(object: unknown): DeliveryItemCreate {
  const deliveryItem = deliveryItemSchemaCreate.validateSync(object, {
    stripUnknown: true,
    abortEarly: false,
  }) satisfies DeliveryItemCreate

  return deliveryItem
}

export function validateDeliveryItemUpdate(object: unknown): DeliveryItemUpdate {
  const deliveryItem = deliveryItemSchemaUpdate
    // .omit(['createdAt', 'updatedAt', 'id'])>
    .validateSync(object, {
      stripUnknown: true,
      abortEarly: false,
    }) satisfies DeliveryItemUpdate

  return deliveryItem
}

function deliveryItemToJson(deliveryItemRaw: DeliveryItem): DeliveryItemRead {
  const deliveryItemData = deliveryItemRaw.toJSON()
  const result: DeliveryItemRead = {
    ...deliveryItemData,
  }
  // if "configuration as product" record is present in model instance, convert it to JSON using proper controller
  if (deliveryItemRaw.product) {
    result.product = ProductConfigurationController.toJsonAsProduct(deliveryItemRaw.product)
  }

  return result
}

export default class DeliveryItemController {
  /**
   * convert DeliveryItem Instance or array of instances to a regular JSON object.
   * @param {DeliveryItem | DeliveryItem[] | null} data - purchase order, array of purchase orders or null
   * @returns {DeliveryItemMagentoRecord | DeliveryItemMagentoRecord[] | null} JSON format nullable.
   */
  static toJSON(data: DeliveryItem): DeliveryItemRead
  static toJSON(data: DeliveryItem | null): DeliveryItemRead | null
  static toJSON(data: DeliveryItem[]): DeliveryItemRead[]
  static toJSON(data: DeliveryItem[] | null): DeliveryItemRead[] | null
  static toJSON(data: null): null
  static toJSON(data: DeliveryItem | DeliveryItem[] | null): DeliveryItemRead | DeliveryItemRead[] | null {
    try {
      if (data instanceof DeliveryItem) {
        return deliveryItemToJson(data)
      }
      if (Array.isArray(data)) {
        return data.map(deliveryItemToJson)
      }
      return null
    } catch (error) {
      return null
    }
  }

  /**
   * get DeliveryItem record by id from DB.
   * @param {unknown} id - deliveryItemId
   * @param {Transaction} [t] - (optional) The transaction within which to get the record.
   * @returns {DeliveryItem} DeliveryItem object or null
   */
  static async get(id: number | unknown, t?: Transaction): Promise<DeliveryItem> {
    const deliveryItemId = isId.validateSync(id)
    const final = await DeliveryItem.findByPk(deliveryItemId, {
      include: [
        {
          association: 'product',
          include: [
            {
              association: 'product',
              include: [{
                association: 'brand',
              }],
            },
            {
              model: ProductOption,
              as: 'options',
            },
          ],
        },
      ],
      order: [
        [
          { model: ProductConfiguration, as: 'product' },
          { model: ProductOption, as: 'options' },
          'sortOrder', 'ASC',
        ],
      ],
      // attributes: {
      //   exclude: ['orderId', 'shippingAddressId', 'deliveryItemStopId'],
      // },
      transaction: t,
    })
    if (!final) {
      throw DBError.notFound(new Error(`DeliveryItem with id#${deliveryItemId} was not found`))
    }
    return final
  }

  /**
   * insert Delivery record to DB. orderId and orderId are required.
   * @param {DeliveryCreate | unknown} deliveryItemData -  Delivery record to insert to DB
   * @param {Transaction} [t] - (optional) The transaction within which to create.
   * @returns {Delivery} Delivery object or throws error
   */
  static async create(deliveryId: number, deliveryItemData: DeliveryItemCreate | unknown, t?: Transaction): Promise<DeliveryItem> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const parsedDeliveryItem = deliveryItemSchemaCreate.omit(['deliveryId']).validateSync(deliveryItemData, {
        stripUnknown: true,
        abortEarly: false,
      })

      if (parsedDeliveryItem.qty === 0) {
        throw DBError.badData(new Error(CANNOTBEZEROERROR))
      }

      const result = await DeliveryItem.create({ ...parsedDeliveryItem, deliveryId }, {
        transaction,
      })

      // refetch the record to get all fields (including virtuals)
      const final = await this.get(result.id, transaction)
      if (!final) {
        throw DBError.unknown(new Error('Internal Error: Delivery was not created'))
      }

      // check if delivery item belongs to the same order as delivery
      const deliveryItemIsLegit = await this.checkOrderIntegrity(final, transaction)
      if (!deliveryItemIsLegit) {
        // if delivery item does not belong to the same order as delivery, throw an error
        throw DBError.badData(new Error('DeliveryItem does not belong to the same order as delivery'))
      }

      await commit()
      return final
    } catch (error) {
      let errorMsg = ''
      if (error instanceof ForeignKeyConstraintError && error.name === 'SequelizeForeignKeyConstraintError') {
        errorMsg = `DeliveryItem malformed data: constraint violation error: ${error?.fields?.toString() || ''}`
        await rollback()
        throw DBError.badData(new Error(errorMsg))
      }
      // console.log('error', error.name)
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }

  /**
   * insert multiple deliveryItem records to DB. deliveryId is required.will combine delivery items with the same configurationId
   * @param {number} deliveryId - id of delivery where to add the items
   * @param {DeliveryItemCreate[] | unknown[]} deliveryItems - an array of deliveryItems to insert to DB
   * @param {Transaction} [t] - (optional) The transaction within which to perform the bulk create.
   * @returns {DeliveryItem[]} array of created deliveryItems or throws error
   */
  static async bulkCreate(deliveryId: number, deliveryItems: DeliveryItemCreate[] | unknown[], t?: Transaction): Promise<DeliveryItem[]> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const result: DeliveryItem[] = []
      for (let i = 0; i < deliveryItems.length; i += 1) {
        const item = deliveryItems[i]

        const parsedDeliveryItem = deliveryItemSchemaCreate.omit(['deliveryId']).validateSync(item, {
          stripUnknown: true,
          abortEarly: false,
        })
        // try to create.
        try {
          // do not create records with qty=0
          if (parsedDeliveryItem.qty !== 0) {
            const deliveryItem = await this.create(deliveryId, parsedDeliveryItem, transaction)
            result.push(deliveryItem)
          }
        } catch (error) {
          // if this is not a validation error, re-throw it
          if (!(error instanceof ValidationError)) {
            throw error
          }

          // if there are more than one errors, re-throw them
          if (error.errors.length > 1) {
            throw error
          }

          const {
            path,
            validatorKey,
          } = error.errors[0]
          if (path === deliveryItemConstraintName && validatorKey === 'not_unique') {
            // if this is a duplicate entry error, find the existing shipment item and update it:
            const {
              configurationId,
            } = parsedDeliveryItem

            const existingDeliveryItem = result.find((deliveryItem) => deliveryItem.configurationId === configurationId)
            if (!existingDeliveryItem) {
              // if the existing shipment item is not found in current bulk batch, re-throw the error
              throw error
            }
            // update the existing shipment item
            existingDeliveryItem.qty += parsedDeliveryItem.qty
            await existingDeliveryItem.save({ transaction })
          } else {
            // otherwise re-thow the error
            throw error
          }
        }
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
   * upsert(insert or create) DeliveryItem record in DB.
   * @param {number} deliveryId - delivery ID
   * @param {DeliveryItemCreate | unknown} deliveryItem - update/create data for deliveryItem record
   * @param {Transaction} [t] - (optional) The transaction within which to perform the upsert.
   * @returns {DeliveryItem} updated or created deliveryItem object
   */
  static async upsert(deliveryId: number, deliveryItem: DeliveryItemCreate | unknown, t?: Transaction): Promise<DeliveryItem | null> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const deliveryItemParsed = deliveryItemSchemaCreate.omit(['deliveryId']).validateSync(deliveryItem, {
        stripUnknown: true,
        abortEarly: false,
      })

      // check if the record already exists:
      const deliveryItemRecord = await DeliveryItem.findOne({
        where: {
          deliveryId,
          configurationId: deliveryItemParsed.configurationId,
        },
        transaction,
      })

      let result: DeliveryItem | null = null

      if (!deliveryItemRecord) {
        // create new record if it does not exist
        printYellowLine('create new delivery item')
        // do not create records with qty=0
        if (deliveryItemParsed.qty === 0) {
          await commit()
          return null
        }
        result = await this.create(deliveryId, deliveryItemParsed, transaction)
      } else {
        // if updated qty is 0, then delete the record
        printYellowLine('update existing delivery item')
        if (deliveryItemParsed.qty === 0) {
          await this.delete({
            id: deliveryItemRecord.id,
            reason: 'qty = 0',
            transaction,
          })
          // exit early if qty is 0
          await commit()
          return null
        }

        await deliveryItemRecord.update(deliveryItemParsed, { transaction })
        result = await this.get(deliveryItemRecord.id, transaction)
      }

      const deliveryItemIsLegit = await this.checkOrderIntegrity(result, transaction)
      if (!deliveryItemIsLegit) {
        // if delivery item does not belong to the same order as delivery, delete it
        // if delivery new qty is 0, delete it
        await this.delete({
          id: result.id,
          reason: 'order integrity check failed',
          transaction,
        })
        result = null
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
   * checks if the delivery item belongs to the same order as the delivery itself.
   * @param {DeliveryItem} fullDeliveryItemRecord - delivery item record
   * @returns {boolean} true if delivery item belongs to the same order as the delivery itself
   */
  static async checkOrderIntegrity(fullDeliveryItemRecord: DeliveryItem, t?: Transaction) {
    // delivery item record and delivery record should belong to the same order id
    // find orderId from delivery record
    const deliveryRecord = await Delivery.findByPk(fullDeliveryItemRecord.deliveryId, {
      attributes: ['orderId'],
      transaction: t,
    })
    if (!deliveryRecord) {
      return false
    }
    let deliveryItemOrderId = 0
    if (fullDeliveryItemRecord.product) {
      deliveryItemOrderId = fullDeliveryItemRecord.product.orderId
    } else {
      // if product record is not present, get it
      const productRecord = await ProductConfiguration.findByPk(fullDeliveryItemRecord.configurationId, {
        attributes: ['orderId'],
        transaction: t,
      })
      if (!productRecord) {
        return false
      }
      deliveryItemOrderId = productRecord.orderId
    }
    // const deliveryItemOrderId = fullDeliveryItemRecord?.product?.orderId || 0
    return deliveryRecord.orderId === deliveryItemOrderId
  }

  /**
   * delete DeliveryItem record with a given id from DB.
   * @param {Object} options - The options for deleting a DeliveryItem.
   * @param {(number|unknown)} options.id - The ID of the DeliveryItem to delete.
   * @param {string} [options.reason] - (optional) The reason for deleting the DeliveryItem .
   * @param {Transaction} [options.transaction] - (optional) The transaction within which to perform the deletion.
   * @returns {DeliveryItem} DeliveryItem that was deleted
   */
  static async delete({
    id,
    reason,
    transaction: t,
  }: {
    id: number | unknown
    reason?: string
    transaction?: Transaction
  }): Promise<DeliveryItem> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const deliveryItemId = isId.validateSync(id)
      const deliveryItemRecord = await DeliveryItem.findByPk(deliveryItemId, { transaction })

      if (!deliveryItemRecord) {
        throw DBError.notFound(new Error(`DeliveryItem with id ${deliveryItemId} was not found`))
      }
      // delete the Delivery Item record
      printRedLine(`delete delivery item${reason ? `: ${reason}` : ''}`)
      await DeliveryItem.destroy({
        where: {
          id: deliveryItemId,
        },
        transaction,
      })

      // // check validity of the delivery after deletion. delivery should not be empty
      // const deliveryRecord = await Delivery.findByPk(deliveryItemRecord.deliveryId, { transaction, include: ['items'] })
      // if (deliveryRecord && deliveryRecord.items && deliveryRecord.items.length === 0) {
      //   printRedLine('delete delivery record: no items left')
      //   await deliveryRecord.destroy({ transaction })
      // }

      await commit()
      return deliveryItemRecord
    } catch (error) {
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }

  /**
   * bulkUpsert(insert or create) DeliveryItem records to DB.
   * !!! WARNING: items with qty=0 will be deleted.
   * @param {number} deliveryId - delivery ID
   * @param {DeliveryItemCreate[] | unknown[]} deliveryItems - update/create data for deliveryItem record
   * @param {Transaction} [t] - (optional) The transaction within which to perform the bulk upsert.
   * @returns {DeliveryItem[]} array of updated or created deliveryItem objects (all items with qty=0 are deleted)
   */
  static async bulkUpsert(deliveryId: number, deliveryItems: DeliveryItemCreate[] | unknown[], t?: Transaction): Promise<DeliveryItem[]> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const result: DeliveryItem[] = []
      for (let i = 0; i < deliveryItems.length; i += 1) {
        const item = deliveryItems[i]

        const parsedDeliveryItem = deliveryItemSchemaCreate.omit(['deliveryId']).validateSync(item, {
          stripUnknown: true,
          abortEarly: false,
        })

        const deliveryItemRecord = await this.upsert(deliveryId, parsedDeliveryItem, transaction)

        if (deliveryItemRecord) {
          result.push(deliveryItemRecord)
        }
      }
      await commit()
      return result
    } catch (error) {
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }
}
