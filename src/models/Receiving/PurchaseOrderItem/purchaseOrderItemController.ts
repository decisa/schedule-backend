import * as yup from 'yup'
import { Transaction } from 'sequelize'
import { PurchaseOrderItem } from './purchaseOrderItem'
import { isId, useTransaction } from '../../../utils/utils'
import { ProductConfiguration } from '../../Sales/ProductConfiguration/productConfiguration'
import { PurchaseOrder } from '../PurchaseOrder/purchaseOrder'

// building elements of the PurchaseOrderItem type
type PurchaseOrderItemCreational = {
  id: number
}

type PurchaseOrderItemRequired = {
  qtyOrdered: number
}

// type PurchaseOrderItemOptional = {
//   qtyReceived?: number
// }

type PurchaseOrderItemTimeStamps = {
  createdAt: Date
  updatedAt: Date
}

type PurchaseOrderItemFK = {
  purchaseOrderId: number
  configurationId: number
}

// type PurchaseOrderItemAssociations = {
//   order?: Order
//   brand?: Brand
//   purchaseOrderItemItems?: PurchaseOrderItemItem[]
// }

// Note: DATA TYPES
export type PurchaseOrderItemCreate =
Partial<PurchaseOrderItemCreational>
& Required<PurchaseOrderItemRequired>
// & Partial<PurchaseOrderItemOptional>
& Partial<PurchaseOrderItemTimeStamps>
& Partial<PurchaseOrderItemFK>

export type PurchaseOrderItemRead = Required<PurchaseOrderItemCreate>

const purchaseOrderItemSchemaCreate: yup.ObjectSchema<PurchaseOrderItemCreate> = yup.object({
  // PurchaseOrderItemFK
  // purchaseOrderId: number
  // configurationId: number
  purchaseOrderId: yup.number()
    .integer()
    .positive()
    .nonNullable()
    .required()
    .label('Malformed data: purchase order item purchaseOrderId'),
  configurationId: yup.number()
    .integer()
    .positive()
    .nonNullable()
    .required()
    .label('Malformed data: purchase order item configurationId'),
  // PurchaseOrderItemRequired
  // qtyOrdered: number
  qtyOrdered: yup.number()
    .integer()
    .positive()
    .nonNullable()
    .required()
    .label('Malformed data: purchase order item qtyOrdered'),
  // PurchaseOrderItemCreational
  // id: number
  id: yup.number()
    .integer()
    .positive()
    .nonNullable()
    .label('Malformed data: purchase order item id'),
  // timestamps
  createdAt: yup.date().nonNullable().label('Malformed data: purchase order item createdAt'),
  updatedAt: yup.date().nonNullable().label('Malformed data: purchase order item updatedAt'),
})

const purchaseOrderItemSchemaUpdate = purchaseOrderItemSchemaCreate.clone()
  .shape({
    purchaseOrderId: yup.number()
      .integer()
      .positive()
      .nonNullable()
      .label('Malformed data: purchase order item purchaseOrderId'),
    configurationId: yup.number()
      .integer()
      .positive()
      .nonNullable()
      .label('Malformed data: purchase order item configurationId'),
    qtyOrdered: yup.number()
      .integer()
      .positive()
      .nonNullable()
      .label('Malformed data: purchase order item qtyOrdered'),
  })

export function validatePurchaseOrderItemCreate(object: unknown): PurchaseOrderItemCreate {
  const purchaseOrderItem = purchaseOrderItemSchemaCreate.validateSync(object, {
    stripUnknown: true,
    abortEarly: false,
  }) satisfies PurchaseOrderItemCreate

  return purchaseOrderItem
}

export function validatePurchaseOrderItemUpdate(object: unknown): Partial<PurchaseOrderItemCreate> {
  // restrict update of id, and creation or modification dates
  const purchaseOrderItem = purchaseOrderItemSchemaUpdate.omit(['createdAt', 'updatedAt', 'id']).validateSync(object, {
    stripUnknown: true,
    abortEarly: false,
  }) satisfies Partial<PurchaseOrderItemCreate>

  return purchaseOrderItem
}

function purchaseOrderItemToJson(purchaseOrderItem: PurchaseOrderItem): PurchaseOrderItemRead {
  // TODO: possibly will need to rewrite based on functionality
  const purchaseOrderItemData = purchaseOrderItem.toJSON()
  return purchaseOrderItemData
}

export default class PurchaseOrderItemController {
  /**
   * convert PurchaseOrderItem Instance or array of instances to a regular JSON object.
   * @param {PurchaseOrderItem | PurchaseOrderItem[] | null} data - purchase order, array of purchase orders or null
   * @returns {PurchaseOrderItemMagentoRecord | PurchaseOrderItemMagentoRecord[] | null} JSON format nullable.
   */
  static toJSON(data: PurchaseOrderItem): PurchaseOrderItemRead
  static toJSON(data: PurchaseOrderItem | null): PurchaseOrderItemRead | null
  static toJSON(data: PurchaseOrderItem[]): PurchaseOrderItemRead[]
  static toJSON(data: PurchaseOrderItem[] | null): PurchaseOrderItemRead[] | null
  static toJSON(data: null): null
  static toJSON(data: PurchaseOrderItem | PurchaseOrderItem[] | null): PurchaseOrderItemRead | PurchaseOrderItemRead[] | null {
    try {
      if (data instanceof PurchaseOrderItem) {
        return purchaseOrderItemToJson(data)
      }
      if (Array.isArray(data)) {
        return data.map(purchaseOrderItemToJson)
      }
      return null
    } catch (error) {
      return null
    }
  }

  /**
   * get PurchaseOrderItem record by id from DB.
   * @param {unknown} id - purchaseOrderItemId
   * @returns {PurchaseOrderItem} PurchaseOrderItem object or null
   */
  static async get(id: number | unknown, t?: Transaction): Promise<PurchaseOrderItem | null> {
    const purchaseOrderItemId = isId.validateSync(id)
    const final = await PurchaseOrderItem.findByPk(purchaseOrderItemId, {
      transaction: t,
    })
    return final
  }

  /**
   * get full PurchaseOrderItem data by id from DB. Will include Purchase Order Items, order id and brand object
   * @param {unknown} id - purchaseOrderItemId
   * @returns {PurchaseOrderItem} PurchaseOrderItem object with all relevant data, like po items, brand and order id or null
   */
  // FIXME: this needs to be adjusted based on the functionality
  static async getFullPurchaseOrderItemInfo(id: number | unknown, t?: Transaction): Promise<PurchaseOrderItem | null> {
    const purchaseOrderItemId = isId.validateSync(id)
    const purchaseOrderItem = await PurchaseOrderItem.findOne({
      where: {
        id: purchaseOrderItemId,
      },
      include: [
        {
          model: ProductConfiguration,
          as: 'productConfiguration',
        },
      ],
      transaction: t,
    })
    return purchaseOrderItem
  }

  /**
   * get all purchaseOrderItems by purchaseOrderId.
   * @param {number | unknown} purchaseOrderId - purchaseOrderItem number
   * @returns {PurchaseOrderItem[] } PurchaseOrderItem[] object
   */
  static async getAllByPurchaseOrderId(purchaseOrderId: number | unknown, t?: Transaction): Promise<PurchaseOrderItem[]> {
    const poId = isId.validateSync(purchaseOrderId)
    const purchaseOrderItemRecords = await PurchaseOrderItem.findAll({
      where: {
        purchaseOrderId: poId,
      },
      transaction: t,
    })
    return purchaseOrderItemRecords
  }

  /**
   * insert PurchaseOrderItem record to DB. brandId and orderId are required.
   * @param {PurchaseOrderItemCreate | unknown} purchaseOrderItemData - customer PurchaseOrderItem record to insert to DB
   * @returns {PurchaseOrderItem} PurchaseOrderItem object or throws error
   */
  static async create(purchaseOrderItemData: PurchaseOrderItemCreate | unknown, t?: Transaction): Promise<PurchaseOrderItem> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const parsedPurchaseOrderItem = validatePurchaseOrderItemCreate(purchaseOrderItemData)

      // ensure data integrity
      // find which orderId does the purchase order belong to
      const purchaseOrderRecord = await PurchaseOrder.findByPk(parsedPurchaseOrderItem.purchaseOrderId, {
        attributes: ['orderId', 'brandId'],
        transaction,
      })

      // throw an error if purchase order not found
      if (!purchaseOrderRecord) {
        throw new Error('Purchase order not found')
      }

      // find a product configuration that belongs to the same order and has the same configuration id
      // retrieve brandId as well
      const configuration = await ProductConfiguration.findOne({
        where: {
          id: parsedPurchaseOrderItem.configurationId,
          orderId: purchaseOrderRecord.orderId,
        },
        attributes: ['id', 'orderId'],
        include: [
          {
            association: 'product',
            attributes: ['brandId'],
          },
        ],
        // attributes: ['id'],
        transaction,
      })

      // if no such configuration found, throw an error
      if (!configuration) {
        throw new Error('Incompatible purchase order and product configuration. Must belong to the same order.')
      }

      // if brandId of the configuration and purchase order do not match, throw an error
      if (configuration?.product?.brandId !== purchaseOrderRecord.brandId) {
        throw new Error('Incompatible purchase order and product configuration. Must belong to the same brand.')
      }

      // console.log('configuration', configuration.toJSON())

      // let x = 1
      // if (x === 1) throw new Error('hahahahah')
      // x = 2

      // if everything is ok, create a purchase order item
      const result = await PurchaseOrderItem.create(parsedPurchaseOrderItem, {
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
   * insert PurchaseOrderItem record to DB. purchaseOrderId is required.
   * @param {PurchaseOrderItemCreate | unknown} purchaseOrderItems - customer PurchaseOrderItem record to insert to DB
   * @returns {PurchaseOrderItem} PurchaseOrderItem object or throws error
   */
  static async bulkCreate(purchaseOrderId: number, purchaseOrderItems: PurchaseOrderItemCreate[] | unknown[], t?: Transaction): Promise<PurchaseOrderItem[]> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const result: PurchaseOrderItem[] = []
      for (let i = 0; i < purchaseOrderItems.length; i += 1) {
        const parsedPurchaseOrderItem = purchaseOrderItemSchemaCreate.omit(['purchaseOrderId']).validateSync(purchaseOrderItems[i], {
          stripUnknown: true,
          abortEarly: false,
        })
        const purchaseOrderItem = await PurchaseOrderItem.create({
          ...parsedPurchaseOrderItem,
          purchaseOrderId,
        }, {
          transaction,
        })
        result.push(purchaseOrderItem)
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
     * update purchaseOrderItem record in DB.
     * @param {number | unknown} purchaseOrderItemId - id of the purchaseOrderItem record to update in DB
     * @param {unknown} purchaseOrderItemData - update data for purchase order record
     * @returns {address} complete Updated purchasde order object or throws error
     */
  static async update(purchaseOrderItemId: number | unknown, purchaseOrderItemData: unknown, t?: Transaction): Promise<PurchaseOrderItem> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const parsedPurchaseOrderItemUpdate = validatePurchaseOrderItemUpdate(purchaseOrderItemData)

      const id = isId.validateSync(purchaseOrderItemId)
      const purchaseOrderItemRecord = await PurchaseOrderItem.findByPk(id, { transaction })
      if (!purchaseOrderItemRecord) {
        throw new Error('purchaseOrderItem does not exist')
      }

      await purchaseOrderItemRecord.update(parsedPurchaseOrderItemUpdate, { transaction })

      await commit()
      return purchaseOrderItemRecord
    } catch (error) {
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }

  /**
   * delete PurchaseOrderItem record with a given id from DB.
   * @param {unknown} id - purchaseOrderItemId
   * @returns {boolean} true if PurchaseOrderItem was deleted
   */
  static async delete(id: number | unknown, t?: Transaction): Promise<boolean> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const purchaseOrderItemId = isId.validateSync(id)
      const final = await PurchaseOrderItem.destroy({
        where: {
          id: purchaseOrderItemId,
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
