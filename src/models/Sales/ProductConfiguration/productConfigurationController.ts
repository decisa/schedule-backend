import * as yup from 'yup'
import { Transaction } from 'sequelize'
import {
  isId, useTransaction, isObjectWithExternalId, printYellowLine,
} from '../../../utils/utils'
import { ProductConfiguration } from './productConfiguration'
import ProductController, { ProductRead } from '../Product/productController'
import ProductOptionController from '../ProductOption/productOptionController'
import type { ProductOptionRead } from '../ProductOption/productOptionController'
import { ProductOption } from '../ProductOption/productOption'

type ProductConfigurationCreational = {
  id: number
}

type ProductConfigurationRequired = {
  qtyOrdered: number
  qtyRefunded: number // has default value
  // qtyShipped: number // has default value
}

type ProductConfigurationOptional = {
  qtyShippedExternal: number | null
  sku: string | null
  externalId: number | null
  volume: number | null
  price: number | null
  totalTax: number | null
  totalDiscount: number | null
}

type ProductConfigurationTimeStamps = {
  createdAt: Date
  updatedAt: Date
}

type ProductConfigurationFK = {
  productId: number
  orderId: number
}

// type ProductConfigurationAssociations = {
// product?: NonAttribute<Product>
// order?: NonAttribute<Order>
// options?: NonAttribute<ProductOption[]>
// routeStops?: NonAttribute<RouteStop[]>
// purchaseOrderItems?: NonAttribute<PurchaseOrderItem[]>
// }

// Note: DATA TYPES
export type ProductConfigurationCreate =
  Partial<ProductConfigurationCreational>
  & Required<ProductConfigurationRequired>
  & Partial<ProductConfigurationOptional>
  & Partial<ProductConfigurationTimeStamps>
  & Required<ProductConfigurationFK>
  // & Partial<ProductConfigurationAssociations>

export type ProductConfigurationRead = Omit<Required<ProductConfigurationCreate>, 'productId'> & {
  product?: ProductRead,
  options?: ProductOptionRead[] | null,
}

export type ConfigurationAsProductRead = Omit<ProductRead, 'id'> & {
  id: number
  orderId: number
  configuration: Omit<Required<ProductConfigurationCreate>, 'productId' | 'id' | 'orderId'>
  mainProductId: number
}

export const productConfigurationSchemaCreate: yup.ObjectSchema<ProductConfigurationCreate> = yup.object({
  // FK
  // productId: number
  // orderId: number
  productId: yup.number()
    .integer()
    .positive()
    .nonNullable()
    .required()
    .label('Malformed data: productId'),
  orderId: yup.number()
    .integer()
    .positive()
    .nonNullable()
    .required()
    .label('Malformed data: orderId'),
  // required
  // qtyOrdered: number
  // qtyRefunded: number // has default value
  // qtyShipped: number // has default value
  qtyOrdered: yup.number()
    .integer()
    .positive()
    .nonNullable()
    .required()
    .label('Malformed data: qtyOrdered'),
  qtyRefunded: yup.number()
    .integer()
    .default(0)
    .nonNullable()
    .label('Malformed data: qtyRefunded'),
  // qtyShipped: yup.number()
  //   .integer()
  //   .default(0)
  //   .nonNullable()
  //   .label('Malformed data: qtyShipped'),

  // optional
  // qtyShippedExternal: number | null
  // sku: string | null
  // externalId: number | null
  // volume: number | null
  // price: number | null
  // totalTax: number | null
  // totalDiscount: number | null
  qtyShippedExternal: yup.number()
    .integer()
    .default(null)
    .nullable()
    .label('Malformed data: qtyShippedExternal'),
  sku: yup.string()
    .label('Malformed data: sku')
    .nullable(),
  externalId: yup.number()
    .integer()
    .positive()
    .nullable()
    .label('Malformed data: externalId'),
  volume: yup
    .number()
    .positive()
    .nullable()
    .label('Malformed data: volume'),
  price: yup.number()
    .min(0)
    .label('Malformed data: price')
    .nullable(),
  totalTax: yup.number()
    .min(0)
    .label('Malformed data: totalTax')
    .nullable(),
  totalDiscount: yup.number()
    .min(0)
    .label('Malformed data: totalDiscount')
    .nullable(),
  // id: number
  id: yup
    .number()
    .integer()
    .positive()
    .nonNullable()
    .label('Malformed data: id'),
  // createdAt: Date
  // updatedAt: Date
  createdAt: yup.date().nonNullable().label('Malformed data: createdAt'),
  updatedAt: yup.date().nonNullable().label('Malformed data: updatedAt'),
})

const productConfigurationSchemaUpdate: yup.ObjectSchema<Partial<ProductConfigurationCreate>> = productConfigurationSchemaCreate
  .clone()
  .shape({
    productId: yup.number()
      .integer()
      .positive()
      .nonNullable()
      .label('Malformed data: productId'),
    orderId: yup.number()
      .integer()
      .positive()
      .nonNullable()
      .label('Malformed data: orderId'),
    qtyOrdered: yup.number()
      .integer()
      .positive()
      .nonNullable()
      .label('Malformed data: qtyOrdered'),
    qtyShippedExternal: yup.number()
      .integer()
      .nullable()
      .label('Malformed data: qtyShippedExternal'),
  })

// type RequiredExceptFor<T, K extends keyof T> = Omit<T, K> & {
//   [P in K]+?: T[P]
// };

export function validateProductConfigurationCreate(object: unknown): ProductConfigurationCreate {
  const product = productConfigurationSchemaCreate.validateSync(object, {
    stripUnknown: true,
    abortEarly: false,
  }) satisfies ProductConfigurationCreate
  return product
}

export function validateProductConfigurationUpdate(object: unknown): Omit<Partial<ProductConfigurationCreate>, 'createdAt' | 'updatedAt' | 'id'> {
  // restrict update of id, and creation or modification dates
  const productConfiguration = productConfigurationSchemaUpdate.omit(['createdAt', 'updatedAt', 'id']).validateSync(object, {
    stripUnknown: true,
    abortEarly: false,
  }) satisfies Partial<ProductConfigurationCreate>

  return productConfiguration
}

/**
   * convert ProductConfigurationInstance to a regular JSON object. Keeps product data as inner field if provided
   * @param {ProductConfiguration }data - ProductConfiguration instance
   * @returns {ProductConfigurationRead } JSON format .
   */
function configurationToJson(configuration: ProductConfiguration): ProductConfigurationRead {
  // FIXME: CHECK IF OPTIONS ARE PROPERLY FETCHED WHEN IMPLEMENTED
  const productConfigurationJson = configuration.toJSON()
  let productJson: ProductRead | undefined
  if (configuration.product) {
    productJson = ProductController.toJSON(configuration.product) // configuration.product.toJSON()
  }
  let optionsJson: ProductOptionRead[] | undefined
  if (configuration.options) {
    optionsJson = ProductOptionController.toJSON(configuration.options) // configuration.product.toJSON()
  }
  // remove brandId and add brand name as a string
  const result: ProductConfigurationRead & {
    productId?: number
  } = {
    ...productConfigurationJson,
    product: productJson,
    options: optionsJson,
  }
  delete result.productId

  return result
}

/**
   * convert ProductConfigurationInstance to a reversed JSON object where top level info is about the main product and all
   * configuration data is inside
   * @param {ProductConfiguration} configuration - ProductConfiguration instance
   * @returns {ProductConfigurationRead } JSON format .
   */
function configurationToJsonAsProduct(configuration: ProductConfiguration): ConfigurationAsProductRead {
  const {
    product,
    id,
    orderId,
    ...configurationJson
  } = configurationToJson(configuration)
  if (!product) {
    throw new Error('Product information is missing')
  }

  const {
    id: mainProductId,
    ...productJson
  } = product

  const result = {
    id,
    orderId,
    ...productJson,
    configuration: configurationJson,
    mainProductId,
  }

  return result
}

export default class ProductConfigurationController {
  /**
   * convert ProductConfiguration Instance or array of instances to a regular JSON object. Keeps product data as inner field if provided
   * @param data - configuration, array of configurations or null
   * @returns {AddressMagentoRead | AddressMagentoRead[] | null} JSON format nullable.
   */
  static toJSON(data: ProductConfiguration): ProductConfigurationRead
  static toJSON(data: ProductConfiguration | null): ProductConfigurationRead | null
  static toJSON(data: ProductConfiguration[]): ProductConfigurationRead[]
  static toJSON(data: ProductConfiguration[] | null): ProductConfigurationRead[] | null
  static toJSON(data: null): null
  static toJSON(data: ProductConfiguration | ProductConfiguration[] | null): ProductConfigurationRead | ProductConfigurationRead[] | null {
    try {
      if (data instanceof ProductConfiguration) {
        return configurationToJson(data)
      }
      if (Array.isArray(data)) {
        return data.map(configurationToJson)
      }
      return null
    } catch (error) {
      return null
    }
  }

  /**
   * convert ProductConfiguration Instance or array of instances to a reversed JSON object
   * where top level info is about the main product and all configuration data is inside
   * @param data - configuration, array of configurations or null
   * @returns {ConfigurationAsProductRead | ConfigurationAsProductRead[] | null} JSON format nullable.
   */
  static toJsonAsProduct(data: ProductConfiguration): ConfigurationAsProductRead
  static toJsonAsProduct(data: ProductConfiguration | null): ConfigurationAsProductRead | null
  static toJsonAsProduct(data: ProductConfiguration[]): ConfigurationAsProductRead[]
  static toJsonAsProduct(data: ProductConfiguration[] | null): ConfigurationAsProductRead[] | null
  static toJsonAsProduct(data: null): null
  static toJsonAsProduct(data: ProductConfiguration | ProductConfiguration[] | null): ConfigurationAsProductRead | ConfigurationAsProductRead[] | null {
    try {
      if (data instanceof ProductConfiguration) {
        return configurationToJsonAsProduct(data)
      }
      if (Array.isArray(data)) {
        return data.map(configurationToJsonAsProduct)
      }
      return null
    } catch (error) {
      return null
    }
  }

  /**
   * get ProductConfiguration record by id from DB. Will include Product info
   * @param {unknown} id - productConfigurationId
   * @returns {Product} ProductConfiguration object or null
   */
  static async get(id: number | unknown, t?: Transaction): Promise<ProductConfiguration | null> {
    const productConfigurationId = isId.validateSync(id)
    const final = await ProductConfiguration.findByPk(productConfigurationId, {
      include: [{
        association: 'product',
        include: [{
          association: 'brand',
        }],
      }],
      transaction: t,
    })
    return final
  }

  /**
   * get ProductConfiguration record by id from DB. Will include Product info
   * @param {unknown} id - productConfigurationId
   * @returns {Product} ProductConfiguration object or null
   */
  static async getWithOptions(id: number | unknown, t?: Transaction): Promise<ProductConfiguration | null> {
    const productConfigurationId = isId.validateSync(id)
    const final = await ProductConfiguration.findByPk(productConfigurationId, {
      include: [{
        association: 'product',
        include: [{
          association: 'brand',
        }],
      }, {
        association: 'options',
      }],
      order: [
        [
          { model: ProductOption, as: 'options' },
          'sortOrder', 'ASC',
        ],
      ],
      transaction: t,
    })
    return final
  }

  /**
   * get all product configurations associated with a given orderId. Will include brand record if available and sorted options
   * @param {number | unknown} id - orderId
   * @returns {ProductConfiguration | ProductConfiguration[] | null} ProductConfiguration object, array of objects or null
   */
  static async getAllByOrderId(id: number | unknown, t?: Transaction): Promise<ProductConfiguration[] | null> {
    const orderId = isId.validateSync(id)
    const final = await ProductConfiguration.findAll({
      where: {
        orderId,
      },
      include: [{
        association: 'product',
        include: [{
          association: 'brand',
        }],
      }, {
        association: 'options',
      }],
      order: [
        [
          { model: ProductOption, as: 'options' },
          'sortOrder', 'ASC',
        ],
      ],
      transaction: t,
    })
    return final
  }

  /**
   * insert ProductConfiguration record to DB. productId and orderId are required
   * @param {unknown | ProductConfigurationCreate} productConfiguration - customer ProductConfiguration record to insert to DB
   * @returns {ProductConfiguration} ProductConfiguration object or throws error
   */
  static async create(productConfiguration: unknown | ProductConfigurationCreate, t?: Transaction): Promise<ProductConfiguration> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const parsedProductConfiguration = validateProductConfigurationCreate(productConfiguration)
      // await ProductConfiguration.create(parsedProductConfiguration, { transaction })
      const { id } = await ProductConfiguration.create(parsedProductConfiguration, { transaction })

      // retrieve complete product congiguration data from database
      const result = await this.get(id, transaction)
      if (!result) {
        throw new Error('error creating the product configuration')
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
   * update Product Configuration record in DB.
   * @param {number | unknown} productConfigurationId - id of the Product record to update in DB
   * @param {unknown | Partial<ProductConfigurationCreate>} productData - update data for Product record
   * @returns {Product} complete Updated Product object or throws error
   */
  static async update(productConfigurationId: number | unknown, productData: Partial<ProductConfigurationCreate> | unknown, t?: Transaction): Promise<ProductConfiguration> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const parsedProductUpdate = validateProductConfigurationUpdate(productData)

      const id = isId.validateSync(productConfigurationId)
      const productConfigurationRecord = await this.get(id, transaction)
      if (!productConfigurationRecord) {
        throw new Error('Product Configuration does not exist')
      }

      await productConfigurationRecord.update(parsedProductUpdate, { transaction })
      const result = await this.get(productConfigurationRecord.id, transaction)
      if (!result) {
        throw new Error('error updating the product configuration')
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
   * upsert(insert or create) productConfiguration record in DB. magento productConfiguration externalId is required
   * @param {unknown} productConfigurationData - update/create data for productConfiguration record
   * @returns {productConfiguration} updated or created productConfiguration object with Brand Record if available
   */
  static async upsert(productConfigurationData: unknown, t?: Transaction): Promise<ProductConfiguration> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const { externalId } = isObjectWithExternalId.validateSync(productConfigurationData)
      const productConfigurationRecord = await ProductConfiguration.findOne({
        where: {
          externalId,
        },
        transaction,
      })

      let result: ProductConfiguration | null
      if (!productConfigurationRecord) {
        result = await this.create(productConfigurationData, transaction)
      } else {
        result = await this.update(productConfigurationRecord.id, productConfigurationData, transaction)
      }

      result = await this.get(result.id, transaction)

      if (!result) {
        throw new Error('Unknown error upserting Product Configuration')
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
   * delete ProductConfiguration record with a given id from DB.
   * @param {unknown} id - productConfigurationId
   * @returns {boolean} true if configuration was deleted
   */
  static async delete(id: number | unknown, t?: Transaction): Promise<boolean> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const productConfigurationId = isId.validateSync(id)
      // delete all configuration options first:
      // await ProductOptionController.deleteConfigurationOptions(id, transaction)
      // then delete the configuration itself
      const final = await ProductConfiguration.destroy({
        where: {
          id: productConfigurationId,
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

  /**
   * upsert(insert or create) productConfiguration record in DB. magento productConfiguration externalId is required
   * @param {unknown} productConfigurationData - update/create data for productConfiguration record
   * @returns {productConfiguration} updated or created productConfiguration object with Brand Record if available
   */
  static async bulkUpsertMagentoProducts(orderId:number, products: unknown, t?: Transaction): Promise<ProductConfiguration[]> {
    // product
    // brand
    // configuration
    // > options
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      if (!Array.isArray(products)) {
        throw new Error('Products array was not provided')
      }

      const result: ProductConfiguration[] = []
      for (let i = 0; i < products.length; i += 1) {
        printYellowLine(i.toString())
        // const { externalId } = hasExternalId.validateSync(comments[i])
        const product: unknown = products[i]
        if (!product || typeof product !== 'object') {
          throw new Error('Non object received for product')
        }
        if (!('configuration' in product)) {
          throw new Error('Configuration is missing for product')
        }
        if (typeof product.configuration !== 'object') {
          throw new Error('Configuration is not an object')
        }

        const {
          configuration,
          ...rawProduct
        } = product

        const productRecord = await ProductController.upsert(rawProduct, transaction)

        const configurationRecord = await ProductConfigurationController.upsert({
          ...configuration,
          orderId,
          productId: productRecord.id,
        }, transaction)

        if (configuration && 'options' in configuration && Array.isArray(configuration.options)) {
          const { options } = configuration
          await ProductOptionController.bulkUpsert(configurationRecord.id, options, transaction)
        }

        result.push(configurationRecord)
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
// done: toJSON
// DONE: toProductJSON
// done: get productConfig (by id)
// done: create product configuration
// done: update product configuration
// done: delete product configuration
// done: upsert product (externalId is required)
// done: get all configurations by order ID
