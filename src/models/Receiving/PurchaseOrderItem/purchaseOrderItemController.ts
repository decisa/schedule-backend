import * as yup from 'yup'
import { Transaction } from 'sequelize'
import { PurchaseOrderItem } from './purchaseOrderItem'
import { isId, isString, useTransaction } from '../../../utils/utils'
import { Brand } from '../../Brand/brand'
import { Product } from '../../Sales/Product/product'
import { ProductConfiguration } from '../../Sales/ProductConfiguration/productConfiguration'

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
  productConfigurationId: number
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
  // productConfigurationId: number
  purchaseOrderId: yup.number()
    .integer()
    .positive()
    .nonNullable()
    .required()
    .label('Malformed data: purchaseOrderId'),
  productConfigurationId: yup.number()
    .integer()
    .positive()
    .nonNullable()
    .required()
    .label('Malformed data: productConfigurationId'),
  // PurchaseOrderItemRequired
  // qtyOrdered: number
  qtyOrdered: yup.number()
    .integer()
    .positive()
    .nonNullable()
    .required()
    .label('Malformed data: qtyOrdered'),
  // PurchaseOrderItemCreational
  // id: number
  id: yup.number()
    .integer()
    .positive()
    .nonNullable()
    .label('Comment malformed data: id'),
  // timestamps
  createdAt: yup.date().nonNullable().label('Comment malformed data: createdAt'),
  updatedAt: yup.date().nonNullable().label('Comment malformed data: updatedAt'),
})

const purchaseOrderItemSchemaUpdate = purchaseOrderItemSchemaCreate.clone()
  .shape({
    purchaseOrderId: yup.number()
      .integer()
      .positive()
      .nonNullable()
      .label('Malformed data: purchaseOrderId'),
    productConfigurationId: yup.number()
      .integer()
      .positive()
      .nonNullable()
      .label('Malformed data: productConfigurationId'),
    qtyOrdered: yup.number()
      .integer()
      .positive()
      .nonNullable()
      .label('Malformed data: qtyOrdered'),
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

      const result = await PurchaseOrderItem.create(parsedPurchaseOrderItem, {
        transaction,
      })

      const final = await this.get(result.id, transaction)
      if (!final) {
        throw new Error('Internal Error: PurchaseOrderItem was not created')
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
   * upsert(insert or create) purchaseOrderItem record in DB. poNumber is required
   * @param {unknown} purchaseOrderItemData - update/create data for productConfiguration record
   * @returns {productConfiguration} updated or created productConfiguration object with Brand Record if available
   */
  static async upsert(purchaseOrderItemData: unknown, t?: Transaction): Promise<PurchaseOrderItem> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const parsedPurchaseOrderItem = validatePurchaseOrderItemCreate(purchaseOrderItemData)
      const purchaseOrderItemRecord = await PurchaseOrderItem.findOne({
        where: {
          poNumber: parsedPurchaseOrderItem.poNumber,
        },
        transaction,
      })

      let result: PurchaseOrderItem
      if (!purchaseOrderItemRecord) {
        result = await this.create(purchaseOrderItemData, transaction)
      } else {
        result = await this.update(purchaseOrderItemRecord.id, purchaseOrderItemData, transaction)
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

  // static async searchPurchaseOrderItems(term: string, t?: Transaction) {
  //   const wildCardTerm = `%${term}%`
  //   const purchaseOrderItems = await PurchaseOrderItem.findAll({
  //     include: [
  //       {
  //         association: 'customer',
  //         attributes: ['email', 'firstName', 'lastName'],
  //       },
  //       {
  //         association: 'shippingAddress',
  //         attributes: ['firstName', 'lastName'],
  //       },
  //       {
  //         association: 'billingAddress',
  //         attributes: ['firstName', 'lastName'],
  //       },
  //       {
  //         model: ProductConfiguration,
  //         as: 'products',
  //         attributes: ['qtyPurchaseOrderItemed', 'qtyRefunded', 'qtyShippedExternal'],
  //         include: [
  //           {
  //             model: Product,
  //             as: 'product',
  //             attributes: ['name'],
  //             include: [
  //               {
  //                 model: Brand,
  //                 as: 'brand',
  //                 attributes: ['name'],
  //               },
  //             ],
  //           },
  //         ],

  //         // include: [
  //         //   {
  //         //     association: 'product',
  //         //     attributes: ['name'],
  //         //     include: [
  //         //       {
  //         //         association: 'brand',
  //         //         attributes: ['name'],
  //         //       },
  //         //     ],
  //         //   },
  //         // ],
  //       },
  //     ],
  //     where: {
  //       [Op.or]: [
  //         {
  //           '$customer.firstName$': {
  //             [Op.like]: wildCardTerm,
  //           },
  //         },
  //         {
  //           '$customer.lastName$': {
  //             [Op.like]: wildCardTerm,
  //           },
  //         },
  //         {
  //           '$shippingAddress.firstName$': {
  //             [Op.like]: wildCardTerm,
  //           },
  //         },
  //         {
  //           '$shippingAddress.lastName$': {
  //             [Op.like]: wildCardTerm,
  //           },
  //         },
  //         {
  //           '$billingAddress.firstName$': {
  //             [Op.like]: wildCardTerm,
  //           },
  //         },
  //         {
  //           '$billingAddress.lastName$': {
  //             [Op.like]: wildCardTerm,
  //           },
  //         },
  //         Sequelize.where(
  //           Sequelize.fn('concat', Sequelize.col('customer.firstName'), ' ', Sequelize.col('customer.lastName')),
  //           {
  //             [Op.like]: wildCardTerm,
  //           },
  //         ),
  //         Sequelize.where(
  //           Sequelize.fn('concat', Sequelize.col('billingAddress.firstName'), ' ', Sequelize.col('billingAddress.lastName')),
  //           {
  //             [Op.like]: wildCardTerm,
  //           },
  //         ),
  //         Sequelize.where(
  //           Sequelize.fn('concat', Sequelize.col('shippingAddress.firstName'), ' ', Sequelize.col('shippingAddress.lastName')),
  //           {
  //             [Op.like]: wildCardTerm,
  //           },
  //         ),
  //         {
  //           purchaseOrderItemNumber: {
  //             [Op.like]: wildCardTerm,
  //           },
  //         },
  //       ],
  //     },
  //     attributes: ['id', 'purchaseOrderItemNumber'],
  //     transaction: t,
  //   })
  //   return purchaseOrderItems.map((purchaseOrderItem) => this.toJSON(purchaseOrderItem)).filter((x) => x)
  // }
}
