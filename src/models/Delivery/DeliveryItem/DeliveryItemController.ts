import * as yup from 'yup'
import { ForeignKeyConstraintError, Transaction } from 'sequelize'
import { isId, useTransaction } from '../../../utils/utils'

import type { ConfigurationAsProductRead } from '../../Sales/ProductConfiguration/productConfigurationController'
import type { DeliveryRead } from '../Delivery/DeliveryController'
import { DeliveryItem } from './DeliveryItem'
import ProductConfigurationController from '../../Sales/ProductConfiguration/productConfigurationController'
import DeliveryController from '../Delivery/DeliveryController'
import { ProductOption } from '../../Sales/ProductOption/productOption'
import { ProductSummaryView } from '../../../views/ProductSummary/productSummary'
import { ProductConfiguration } from '../../Sales/ProductConfiguration/productConfiguration'

export const deliveryStatuses = ['pending', 'scheduled', 'confirmed'] as const
export type DeliveryStatus = typeof deliveryStatuses[number]

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
    .min(1)
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

  // if delivery record is present in model instance, convert it to JSON using proper controller
  if (deliveryItemRaw.delivery) {
    result.delivery = DeliveryController.toJSON(deliveryItemRaw.delivery)
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
   * @returns {DeliveryItem} DeliveryItem object or null
   */
  static async get(id: number | unknown, t?: Transaction): Promise<DeliveryItem | null> {
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
    return final
  }

  // /**
  //  * get PurchaseOrder record by id from DB.
  //  * @param {unknown} id - purchaseOrderId
  //  * @returns {PurchaseOrder} PurchaseOrder object or null
  //  */
  // static async getFullPO(id: number | unknown, t?: Transaction): Promise<PurchaseOrder | null> {
  //   const purchaseOrderId = isId.validateSync(id)
  //   const final = await PurchaseOrder.findByPk(purchaseOrderId, {
  //     attributes: ['id', 'poNumber', 'dateSubmitted', 'productionWeeks', 'status', 'createdAt', 'updatedAt'],
  //     include: [
  //       {
  //         model: Brand,
  //         as: 'brand',
  //       },
  //       {
  //         model: PurchaseOrderItem,
  //         as: 'items',
  //         attributes: {
  //           exclude: ['purchaseOrderId', 'createdAt', 'updatedAt'],
  //         },
  //         include: [
  //           {
  //             model: ProductConfiguration,
  //             as: 'product',
  //             attributes: ['qtyOrdered', 'qtyRefunded', 'qtyShippedExternal', 'sku'],
  //             include: [
  //               {
  //                 model: Product,
  //                 as: 'product',
  //                 attributes: ['name', 'sku'],
  //               },
  //               {
  //                 model: ProductOption,
  //                 as: 'options',
  //                 attributes: ['label', 'value'],
  //               },
  //             ],
  //           },
  //         ],
  //       },
  //       {
  //         model: Order,
  //         as: 'order',
  //         attributes: ['orderNumber', 'id'],
  //         include: [{
  //           model: Customer,
  //           as: 'customer',
  //           attributes: {
  //             exclude: ['defaultShippingId', 'createdAt', 'updatedAt'],
  //           },
  //         },
  //         ],
  //       },
  //     ],
  //     transaction: t,
  //   })
  //   return final
  // }

  /**
   * insert Delivery record to DB. orderId and orderId are required.
   * @param {DeliveryCreate | unknown} deliveryItemData -  Delivery record to insert to DB
   * @returns {Delivery} Delivery object or throws error
   */
  static async create(deliveryItemData: DeliveryItemCreate | unknown, t?: Transaction): Promise<DeliveryItem> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const parsedDeliveryItem = validateDeliveryItemCreate(deliveryItemData)

      const result = await DeliveryItem.create(parsedDeliveryItem, {
        transaction,
      })

      // refetch the record to get all fields (including virtuals)
      const final = await this.get(result.id, transaction)
      if (!final) {
        throw new Error('Internal Error: Delivery was not created')
      }
      await commit()
      return final
    } catch (error) {
      let errorMsg = ''
      if (error instanceof ForeignKeyConstraintError && error.name === 'SequelizeForeignKeyConstraintError') {
        errorMsg = `DeliveryItem malformed data: constraint violation error: ${error?.fields?.toString() || ''}`
      }
      // console.log('error', error.name)
      await rollback()
      // rethrow the error for further handling
      if (errorMsg) {
        throw Error(errorMsg)
      }
      throw error
    }
  }

  /**
   * insert multiple deliveryItem records to DB. deliveryId is required.
   * @param {number} deliveryId - id of delivery where to add the items
   * @param {DeliveryItemCreate[] | unknown[]} deliveryItems - an array of deliveryItems to insert to DB
   * @returns {DeliveryItem[]} array of created deliveryItems or throws error
   */
  static async bulkCreate(deliveryId: number, deliveryItems: DeliveryItemCreate[] | unknown[], t?: Transaction): Promise<DeliveryItem[]> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const result: DeliveryItem[] = []
      for (let i = 0; i < deliveryItems.length; i += 1) {
        const item = deliveryItems[i]
        if (typeof item !== 'object' || item === null) {
          throw new Error('DeliveryItem malformed data: every item should be an object')
        }
        // create method will take care of all validations:
        const deliveryItem = await this.create({
          ...item,
          deliveryId,
        }, transaction)
        result.push(deliveryItem)
      }

      await commit()
      return result
    } catch (error) {
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }

  // /**
  //  * create a PurchaseOrder with PurchaseOrderItems
  //  * @param {PurchaseOrderCreate | unknown} purchaseOrderData - purchaseOrder data along with purchaseOrderItems
  //  * @returns {PurchaseOrder} PurchaseOrder object or throws error
  //  */
  // static async createPurchaseOrder(purchaseOrderData: PurchaseOrderCreate | unknown, t?: Transaction): Promise<PurchaseOrder> {
  //   const [transaction, commit, rollback] = await useTransaction(t)
  //   try {
  //     const parsedPurchaseOrder = purchaseOrderRequestCreate.validateSync(purchaseOrderData, {
  //       stripUnknown: true,
  //       abortEarly: false,
  //     }) satisfies PurchaseOrderRequest

  //     const newPurchaseOrderRecord = await PurchaseOrder.create(parsedPurchaseOrder, {
  //       transaction,
  //     })

  //     const items = await PurchaseOrderItemController.bulkCreate(newPurchaseOrderRecord.id, parsedPurchaseOrder.items, transaction)

  //     newPurchaseOrderRecord.items = items
  //     if (!newPurchaseOrderRecord) {
  //       throw new Error('Internal Error: PurchaseOrder was not created')
  //     }
  //     await commit()
  //     return newPurchaseOrderRecord
  //   } catch (error) {
  //     await rollback()
  //     // rethrow the error for further handling
  //     throw error
  //   }
  // }

  // /**
  //    * update Delivery record in DB.
  //    * @param {number | unknown} deliveryId - id of the Delivery record to update in DB
  //    * @param {unknown} deliveryData - update data for delivery record
  //    * @returns {Delivery}  updated delivery object or throws error
  //    */
  // static async update(deliveryId: number | unknown, deliveryData: unknown, t?: Transaction): Promise<Delivery> {
  //   const [transaction, commit, rollback] = await useTransaction(t)
  //   try {
  //     const parsedDeliveryUpdate = validateDeliveryUpdate(deliveryData)

  //     const id = isId.validateSync(deliveryId)
  //     const deliveryRecord = await Delivery.findByPk(id, { transaction })
  //     if (!deliveryRecord) {
  //       throw new Error('Delivery does not exist')
  //     }

  //     await deliveryRecord.update(parsedDeliveryUpdate, { transaction })

  //     await commit()
  //     return deliveryRecord
  //   } catch (error) {
  //     await rollback()
  //     // rethrow the error for further handling
  //     throw error
  //   }
  // }

  // /**
  //  * upsert(insert or create) purchaseOrder record in DB. poNumber is required
  //  * @param {unknown} purchaseOrderData - update/create data for productConfiguration record
  //  * @returns {productConfiguration} updated or created productConfiguration object with Brand Record if available
  //  */
  // static async upsert(purchaseOrderData: unknown, t?: Transaction): Promise<PurchaseOrder> {
  //   const [transaction, commit, rollback] = await useTransaction(t)
  //   try {
  //     const parsedPurchaseOrder = validatePurchaseOrderCreate(purchaseOrderData)
  //     const purchaseOrderRecord = await PurchaseOrder.findOne({
  //       where: {
  //         poNumber: parsedPurchaseOrder.poNumber,
  //       },
  //       transaction,
  //     })

  //     let result: PurchaseOrder
  //     if (!purchaseOrderRecord) {
  //       result = await this.create(purchaseOrderData, transaction)
  //     } else {
  //       result = await this.update(purchaseOrderRecord.id, purchaseOrderData, transaction)
  //     }

  //     await commit()
  //     return result
  //   } catch (error) {
  //     await rollback()
  //     // rethrow the error for further handling
  //     throw error
  //   }
  // }

  // /**
  //  * delete Delivery record with a given id from DB.
  //  * @param {unknown} id - deliveryId
  //  * @returns {boolean} true if Delivery was deleted
  //  */
  // static async delete(id: number | unknown, t?: Transaction): Promise<boolean> {
  //   const [transaction, commit, rollback] = await useTransaction(t)
  //   try {
  //     const deliveryId = isId.validateSync(id)
  //     const final = await Delivery.destroy({
  //       where: {
  //         id: deliveryId,
  //       },
  //       transaction,
  //     })
  //     await commit()
  //     return final === 1
  //   } catch (error) {
  //     await rollback()
  //     // rethrow the error for further handling
  //     throw error
  //   }
  // }

  // static async searchPurchaseOrders(term: string, t?: Transaction) {
  //   const wildCardTerm = `%${term}%`
  //   const purchaseOrders = await PurchaseOrder.findAll({
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
  //         attributes: ['qtyPurchaseOrdered', 'qtyRefunded', 'qtyShippedExternal'],
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
  //           purchaseOrderNumber: {
  //             [Op.like]: wildCardTerm,
  //           },
  //         },
  //       ],
  //     },
  //     attributes: ['id', 'purchaseOrderNumber'],
  //     transaction: t,
  //   })
  //   return purchaseOrders.map((purchaseOrder) => this.toJSON(purchaseOrder)).filter((x) => x)
  // }
}
