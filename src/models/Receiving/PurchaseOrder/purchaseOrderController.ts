import * as yup from 'yup'
import { Transaction } from 'sequelize'
import { POStatus, PurchaseOrder, poStatuses } from './purchaseOrder'
import {
  isId, isString, printYellowLine, useTransaction,
} from '../../../utils/utils'
import { Brand } from '../../Brand/brand'
import { PurchaseOrderItem } from '../PurchaseOrderItem/purchaseOrderItem'
import PurchaseOrderItemController from '../PurchaseOrderItem/purchaseOrderItemController'
import { Order } from '../../Sales/Order/order'
import { Customer } from '../../Sales/Customer/customer'
import { ProductConfiguration } from '../../Sales/ProductConfiguration/productConfiguration'
import { Product } from '../../Sales/Product/product'
import { ProductOption } from '../../Sales/ProductOption/productOption'
import ProductConfigurationController from '../../Sales/ProductConfiguration/productConfigurationController'

// building elements of the PurchaseOrder type
type PurchaseOrderCreational = {
  id: number
}

type PurchaseOrderRequired = {
  status: POStatus
  dateSubmitted: Date
  poNumber: string
}

type PurchaseOrderOptional = {
  productionWeeks: number | null
}
type PurchaseOrderTimeStamps = {
  createdAt: Date
  updatedAt: Date
}

type PurchaseOrderFK = {
  orderId: number
  brandId: number
}

type PurchaseOrderAssociations = {
  order?: Order
  brand?: Brand
  purchaseOrderItems?: PurchaseOrderItem[]
  items?: unknown
}

// Note: DATA TYPES
export type PurchaseOrderCreate =
Partial<PurchaseOrderCreational>
& Required<PurchaseOrderRequired>
& Partial<PurchaseOrderOptional>
& Partial<PurchaseOrderTimeStamps>
& Partial<PurchaseOrderFK>

export type PurchaseOrderRead = Required<PurchaseOrderCreate> & PurchaseOrderAssociations

const purchaseOrderSchemaCreate: yup.ObjectSchema<PurchaseOrderCreate> = yup.object({
  // PurchaseOrderFK
  // orderId: number
  // brandId: number
  orderId: yup.number()
    .integer()
    .positive()
    .nonNullable()
    .required()
    .label('Malformed data: orderId'),
  brandId: yup.number()
    .integer()
    .positive()
    .nonNullable()
    .required()
    .label('Malformed data: brandId'),
  // PurchaseOrderRequired
  // status: POStatus
  // dateSubmitted: Date
  // poNumber: string
  status: yup.mixed<POStatus>()
    .oneOf(poStatuses)
    .nonNullable()
    .default('in production')
    .required()
    .label('Malformed data: status'),
  dateSubmitted: yup.date()
    .default(new Date())
    .nonNullable()
    .required()
    .label('Malformed data: dateSubmitted'),
  poNumber: yup.string()
    .required()
    .nonNullable()
    .label('Malformed data: poNumber'),
  // PurchaseOrderOptional
  // productionWeeks: number | null
  productionWeeks: yup.number()
    .integer()
    .nullable()
    .default(null)
    .min(0)
    .max(52)
    .label('Malformed data: productionWeeks'),
  // PurchaseOrderCreational
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

const purchaseOrderSchemaUpdate = purchaseOrderSchemaCreate.clone()
  .shape({
    orderId: yup.number()
      .integer()
      .positive()
      .nonNullable()
      .label('Malformed data: orderId'),
    brandId: yup.number()
      .integer()
      .positive()
      .nonNullable()
      .label('Malformed data: brandId'),
    // PurchaseOrderRequired
    // status: POStatus
    // dateSubmitted: Date
    // poNumber: string
    poNumber: yup.string()
      .nonNullable()
      .label('Malformed data: poNumber'),
    status: yup.mixed<POStatus>()
      .oneOf(poStatuses)
      .nonNullable()
      .label('Malformed data: status'),
    dateSubmitted: yup.date()
      .nonNullable()
      .label('Malformed data: dateSubmitted'),
    // PurchaseOrderOptional
    // productionWeeks: number | null
    productionWeeks: yup.number()
      .integer()
      .nullable()
      .min(0)
      .max(52)
      .label('Malformed data: productionWeeks'),
  })

export function validatePurchaseOrderCreate(object: unknown): PurchaseOrderCreate {
  const purchaseOrder = purchaseOrderSchemaCreate.validateSync(object, {
    stripUnknown: true,
    abortEarly: false,
  }) satisfies PurchaseOrderCreate

  return purchaseOrder
}

export function validatePurchaseOrderUpdate(object: unknown): Partial<PurchaseOrderCreate> {
  // restrict update of id, and creation or modification dates
  const purchaseOrder = purchaseOrderSchemaUpdate.omit(['createdAt', 'updatedAt', 'id']).validateSync(object, {
    stripUnknown: true,
    abortEarly: false,
  }) satisfies Partial<PurchaseOrderCreate>

  return purchaseOrder
}

function purchaseOrderToJson(purchaseOrderRaw: PurchaseOrder): PurchaseOrderRead {
  // TODO: take care of purchase order items
  // let products: ConfigurationAsProductRead[] | undefined
  // if (purchaseOrder.products) {
  //   products = ProductConfigurationController.toJsonAsProduct(purchaseOrder.products)
  // }
  const purchaseOrderData: PurchaseOrderRead = purchaseOrderRaw.toJSON()
  // const result = {
  //   ...purchaseOrderData,
  //   products,
  //   magento,
  // }
  // return result
  if (purchaseOrderRaw.items) {
    const poItems = purchaseOrderRaw.items.map((item) => {
      const itemData = item.toJSON()
      const product = ProductConfigurationController.toJsonAsProduct(item.productConfiguration || null)
      return {
        ...itemData,
        product: product || undefined,
      }
    })
    purchaseOrderData.items = poItems
  }
  return purchaseOrderData
}

type PurchaseOrderRequest = {
  orderId: number
  brandId: number
  status: POStatus
  dateSubmitted: Date
  poNumber: string
  items: unknown[]
}

const purchaseOrderRequestCreate: yup.ObjectSchema<PurchaseOrderRequest> = yup.object({
  orderId: yup.number()
    .integer()
    .positive()
    .nonNullable()
    .required()
    .label('Malformed data: purchase order orderId'),
  brandId: yup.number()
    .integer()
    .positive()
    .nonNullable()
    .required()
    .label('Malformed data: purchase order brandId'),
  status: yup.mixed<POStatus>()
    .oneOf(poStatuses)
    .nonNullable()
    .default('in production')
    .required()
    .label('Malformed data: purchase order status'),
  dateSubmitted: yup.date()
    .default(new Date())
    .nonNullable()
    .required()
    .label('Malformed data: purchase order dateSubmitted'),
  poNumber: yup.string()
    .required()
    .nonNullable()
    .label('Malformed data: purchase order poNumber'),
  items: yup.array(yup.mixed().required())
    .min(1)
    .required()
    .label('Malformed data: purchase order items'),
})

export default class PurchaseOrderController {
  /**
   * convert PurchaseOrder Instance or array of instances to a regular JSON object.
   * @param {PurchaseOrder | PurchaseOrder[] | null} data - purchase order, array of purchase orders or null
   * @returns {PurchaseOrderMagentoRecord | PurchaseOrderMagentoRecord[] | null} JSON format nullable.
   */
  static toJSON(data: PurchaseOrder): PurchaseOrderRead
  static toJSON(data: PurchaseOrder | null): PurchaseOrderRead | null
  static toJSON(data: PurchaseOrder[]): PurchaseOrderRead[]
  static toJSON(data: PurchaseOrder[] | null): PurchaseOrderRead[] | null
  static toJSON(data: null): null
  static toJSON(data: PurchaseOrder | PurchaseOrder[] | null): PurchaseOrderRead | PurchaseOrderRead[] | null {
    try {
      if (data instanceof PurchaseOrder) {
        return purchaseOrderToJson(data)
      }
      if (Array.isArray(data)) {
        return data.map(purchaseOrderToJson)
      }
      return null
    } catch (error) {
      return null
    }
  }

  /**
   * get PurchaseOrder record by id from DB.
   * @param {unknown} id - purchaseOrderId
   * @returns {PurchaseOrder} PurchaseOrder object or null
   */
  static async get(id: number | unknown, t?: Transaction): Promise<PurchaseOrder | null> {
    const purchaseOrderId = isId.validateSync(id)
    const final = await PurchaseOrder.findByPk(purchaseOrderId, {
      transaction: t,
    })
    return final
  }

  /**
   * get PurchaseOrder record by id from DB.
   * @param {unknown} id - purchaseOrderId
   * @returns {PurchaseOrder} PurchaseOrder object or null
   */
  static async getFullPO(id: number | unknown, t?: Transaction): Promise<PurchaseOrder | null> {
    const purchaseOrderId = isId.validateSync(id)
    const final = await PurchaseOrder.findByPk(purchaseOrderId, {
      include: [
        {
          model: PurchaseOrderItem,
          as: 'items',
          attributes: {
            exclude: ['purchaseOrderId', 'createdAt', 'updatedAt'],
          },
          include: [
            {
              model: ProductConfiguration,
              as: 'productConfiguration',
              include: [
                {
                  model: Product,
                  as: 'product',
                  include: [
                    {
                      model: Brand,
                      as: 'brand',
                    },
                  ],
                },
                {
                  model: ProductOption,
                  as: 'options',
                  attributes: ['label', 'value'],
                },
              ],
            },
          ],
        },
        {
          model: Order,
          as: 'order',
          attributes: ['orderNumber'],
          include: [{
            model: Customer,
            as: 'customer',
            attributes: {
              exclude: ['defaultShippingId', 'createdAt', 'updatedAt'],
            },
          },
          ],
        },
      ],
      transaction: t,
    })
    return final
  }

  /**
   * get PurchaseOrder record by po number from DB.
   * @param {string | unknown} poNumber - purchaseOrder number
   * @returns {PurchaseOrder} PurchaseOrder object or null
   */
  static async getByPoNumber(poNumber: string | unknown, t?: Transaction): Promise<PurchaseOrder | null> {
    const purchaseOrderNumber = isString.validateSync(poNumber)
    let final = await PurchaseOrder.findOne({
      where: {
        poNumber: purchaseOrderNumber,
      },
      transaction: t,
    })
    if (!final) {
      return null
    }
    final = await PurchaseOrderController.getFullPO(final.id, t)
    printYellowLine()
    console.log('final', final)
    return final
  }

  /**
   * get full PurchaseOrder data by id from DB. Will include Purchase Order Items, order id and brand object
   * @param {unknown} id - purchaseOrderId
   * @returns {PurchaseOrder} PurchaseOrder object with all relevant data, like po items, brand and order id or null
   */
  static async getFullPurchaseOrderInfo(id: number | unknown, t?: Transaction): Promise<PurchaseOrder | null> {
    const purchaseOrderId = isId.validateSync(id)
    const purchaseOrder = await PurchaseOrder.findOne({
      where: {
        id: purchaseOrderId,
      },
      include: [
        {
          model: Brand,
          as: 'brand',
        },
        {
          model: PurchaseOrderItem,
          as: 'purchaseOrderItems',
        },
      ],
      transaction: t,
    })
    return purchaseOrder
  }

  /**
   * get purchaseOrder by purchaseOrder number.
   * @param {string | unknown} purchaseOrderNumber - purchaseOrder number
   * @returns {PurchaseOrder | null} PurchaseOrder object or null
   */
  static async getByPurchaseOrderNumber(purchaseOrderNum: string | unknown, t?: Transaction): Promise<PurchaseOrder | null> {
    const purchaseOrderNumber = isString.validateSync(purchaseOrderNum)
    const purchaseOrderRecord = await PurchaseOrder.findOne({
      where: {
        poNumber: purchaseOrderNumber,
      },
      transaction: t,
    })
    if (!purchaseOrderRecord) {
      return null
    }
    return this.getFullPurchaseOrderInfo(purchaseOrderRecord.id, t)
  }

  /**
   * insert PurchaseOrder record to DB. brandId and orderId are required.
   * @param {PurchaseOrderCreate | unknown} purchaseOrderData - customer PurchaseOrder record to insert to DB
   * @returns {PurchaseOrder} PurchaseOrder object or throws error
   */
  static async create(purchaseOrderData: PurchaseOrderCreate | unknown, t?: Transaction): Promise<PurchaseOrder> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const parsedPurchaseOrder = validatePurchaseOrderCreate(purchaseOrderData)

      const result = await PurchaseOrder.create(parsedPurchaseOrder, {
        transaction,
      })

      const final = await this.get(result.id, transaction)
      if (!final) {
        throw new Error('Internal Error: PurchaseOrder was not created')
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
   * create a PurchaseOrder with PurchaseOrderItems
   * @param {PurchaseOrderCreate | unknown} purchaseOrderData - purchaseOrder data along with purchaseOrderItems
   * @returns {PurchaseOrder} PurchaseOrder object or throws error
   */
  static async createPurchaseOrder(purchaseOrderData: PurchaseOrderCreate | unknown, t?: Transaction): Promise<PurchaseOrder> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const parsedPurchaseOrder = purchaseOrderRequestCreate.validateSync(purchaseOrderData, {
        stripUnknown: true,
        abortEarly: false,
      }) satisfies PurchaseOrderRequest

      const newPurchaseOrderRecord = await PurchaseOrder.create(parsedPurchaseOrder, {
        transaction,
      })

      const items = await PurchaseOrderItemController.bulkCreate(newPurchaseOrderRecord.id, parsedPurchaseOrder.items, transaction)

      newPurchaseOrderRecord.items = items
      if (!newPurchaseOrderRecord) {
        throw new Error('Internal Error: PurchaseOrder was not created')
      }
      await commit()
      return newPurchaseOrderRecord
    } catch (error) {
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }

  /**
     * update purchaseOrder record in DB.
     * @param {number | unknown} purchaseOrderId - id of the purchaseOrder record to update in DB
     * @param {unknown} purchaseOrderData - update data for purchase order record
     * @returns {address} complete Updated purchasde order object or throws error
     */
  static async update(purchaseOrderId: number | unknown, purchaseOrderData: unknown, t?: Transaction): Promise<PurchaseOrder> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const parsedPurchaseOrderUpdate = validatePurchaseOrderUpdate(purchaseOrderData)

      const id = isId.validateSync(purchaseOrderId)
      const purchaseOrderRecord = await PurchaseOrder.findByPk(id, { transaction })
      if (!purchaseOrderRecord) {
        throw new Error('purchaseOrder does not exist')
      }

      await purchaseOrderRecord.update(parsedPurchaseOrderUpdate, { transaction })

      await commit()
      return purchaseOrderRecord
    } catch (error) {
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }

  /**
   * upsert(insert or create) purchaseOrder record in DB. poNumber is required
   * @param {unknown} purchaseOrderData - update/create data for productConfiguration record
   * @returns {productConfiguration} updated or created productConfiguration object with Brand Record if available
   */
  static async upsert(purchaseOrderData: unknown, t?: Transaction): Promise<PurchaseOrder> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const parsedPurchaseOrder = validatePurchaseOrderCreate(purchaseOrderData)
      const purchaseOrderRecord = await PurchaseOrder.findOne({
        where: {
          poNumber: parsedPurchaseOrder.poNumber,
        },
        transaction,
      })

      let result: PurchaseOrder
      if (!purchaseOrderRecord) {
        result = await this.create(purchaseOrderData, transaction)
      } else {
        result = await this.update(purchaseOrderRecord.id, purchaseOrderData, transaction)
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
   * delete PurchaseOrder record with a given id from DB.
   * @param {unknown} id - purchaseOrderId
   * @returns {boolean} true if PurchaseOrder was deleted
   */
  static async delete(id: number | unknown, t?: Transaction): Promise<boolean> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const purchaseOrderId = isId.validateSync(id)
      const final = await PurchaseOrder.destroy({
        where: {
          id: purchaseOrderId,
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
