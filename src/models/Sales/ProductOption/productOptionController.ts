import * as yup from 'yup'
import { Transaction } from 'sequelize'
import type { ProductConfigurationRead } from '../ProductConfiguration/productConfigurationController'
import { ProductOption } from './productOption'
// import ProductConfigurationController from '../ProductConfiguration/productConfigurationController'
import {
  isId, isObjectWithExternalIdandConfigId, useTransaction,
} from '../../../utils/utils'

type ProductOptionCreational = {
  id: number
}

type ProductOptionRequired = {
  label: string
  value: string
  sortOrder: number // has default value
}

type ProductOptionOptional = {
  externalId: number | null
  externalValue: string | null
}

type ProductOptionTimeStamps = {
  createdAt: Date
  updatedAt: Date
}

type ProductOptionFK = {
  configId: number
}

// type ProductOptionAssociations = {
// configuration?: NonAttribute<ProductConfiguration>
// }

// Note: DATA TYPES
export type ProductOptionCreate =
  Partial<ProductOptionCreational>
  & Required<ProductOptionRequired>
  & Partial<ProductOptionOptional>
  & Partial<ProductOptionTimeStamps>
  & Required<ProductOptionFK>
  // & Partial<ProductOptionAssociations>

export type ProductOptionRead = Omit<Required<ProductOptionCreate>, 'configId'> & {
  configuration?: ProductConfigurationRead,
}

const productOptionSchemaCreate: yup.ObjectSchema<ProductOptionCreate> = yup.object({
  // FK
  // configId: number
  configId: yup.number()
    .integer()
    .positive()
    .nonNullable()
    .required()
    .label('Comment malformed data: configId'),
  // required
  // label: string
  // value: string
  // sortOrder: number // has default value
  label: yup.string()
    .required()
    .label('Comment malformed data: label'),
  value: yup.string()
    .required()
    .label('Comment malformed data: value'),
  sortOrder: yup.number()
    .integer()
    .default(-1) // to ease logic.
    .min(-1)
    .nonNullable()
    .label('Comment malformed data: sortOrder'),
  // optional
  // externalId: number | null
  // externalValue: string | null
  externalId: yup.number()
    .integer()
    .min(0)
    .nullable()
    .label('Comment malformed data: option externalId'),
  externalValue: yup.string(),
  // id: number
  id: yup
    .number()
    .integer()
    .positive()
    .nonNullable()
    .label('Comment malformed data: id'),
  // createdAt: Date
  // updatedAt: Date
  createdAt: yup.date().nonNullable().label('Comment malformed data: createdAt'),
  updatedAt: yup.date().nonNullable().label('Comment malformed data: updatedAt'),
})

const productOptionSchemaUpdate: yup.ObjectSchema<Partial<ProductOptionCreate>> = productOptionSchemaCreate
  .clone()
  .shape({
    configId: yup.number()
      .integer()
      .positive()
      .nonNullable()
      .label('Comment malformed data: configId'),
    label: yup.string()
      .nonNullable()
      .label('Comment malformed data: label'),
    value: yup.string()
      .nonNullable()
      .label('Comment malformed data: value'),
    sortOrder: yup.number()
      .integer()
      .min(0)
      .nonNullable()
      .label('Comment malformed data: sortOrder'),
  })

// type RequiredExceptFor<T, K extends keyof T> = Omit<T, K> & {
//   [P in K]+?: T[P]
// };

export function validateProductOptionCreate(object: unknown): ProductOptionCreate {
  const product = productOptionSchemaCreate.validateSync(object, {
    stripUnknown: true,
    abortEarly: false,
  }) satisfies ProductOptionCreate
  return product
}

export function validateProductOptionUpdate(object: unknown): Omit<Partial<ProductOptionCreate>, 'createdAt' | 'updatedAt' | 'id'> {
  // restrict update of id, and creation or modification dates
  const productOption = productOptionSchemaUpdate.omit(['createdAt', 'updatedAt', 'id']).validateSync(object, {
    stripUnknown: true,
    abortEarly: false,
  }) satisfies Partial<ProductOptionCreate>

  return productOption
}

/**
   * convert ProductOptionInstance to a regular JSON object.
   * @param {ProductOption } option - ProductOption instance
   * @returns {ProductOptionRead } JSON format .
   */
function optionToJson(option: ProductOption): ProductOptionRead {
  const productOptionJson = option.toJSON()
  // let productConfigurationJson: ProductConfigurationRead | undefined
  // if (option.configuration && option.configuration instanceof ProductConfiguration) {
  //   productConfigurationJson = ProductConfigurationController.toJSON(option.configuration) // Option.product.toJSON()
  // }
  // remove brandId and add brand name as a string
  const result: ProductOptionRead & {
    configId?: number
  } = {
    ...productOptionJson,
    // configuration: productConfigurationJson,
  }
  delete result.configId

  return result
}

export default class ProductOptionController {
  /**
   * convert ProductOption Instance or array of instances to a regular JSON object. Keeps product data as inner field if provided
   * @param data - configuration, array of configurations or null
   * @returns {AddressMagentoRead | AddressMagentoRead[] | null} JSON format nullable.
   */
  static toJSON(data: ProductOption): ProductOptionRead
  static toJSON(data: ProductOption | null): ProductOptionRead | null
  static toJSON(data: ProductOption[]): ProductOptionRead[]
  static toJSON(data: ProductOption[] | null): ProductOptionRead[] | null
  static toJSON(data: null): null
  static toJSON(data: ProductOption | ProductOption[] | null): ProductOptionRead | ProductOptionRead[] | null {
    try {
      if (data instanceof ProductOption) {
        return optionToJson(data)
      }
      if (Array.isArray(data)) {
        return data.map(optionToJson)
      }
      return null
    } catch (error) {
      return null
    }
  }

  /**
   * get ProductOption record by id from DB. Will NOT include configuration info
   * @param {number | unknown} id - productOptionId
   * @returns {ProductOption} ProductOption object or null
   */
  static async get(id: number | unknown, t?: Transaction): Promise<ProductOption | null> {
    const productOptionId = isId.validateSync(id)
    const final = await ProductOption.findByPk(productOptionId, {
      transaction: t,
    })
    return final
  }

  /**
   * get all product options associated for a given configurationId. Will sort.
   * @param {number | unknown} id - configurationId
   * @returns {ProductOption[] | null} ProductOption object, array of objects or null
   */
  static async getAllByConfigId(id: number | unknown, t?: Transaction): Promise<ProductOption[] | null> {
    const configId = isId.validateSync(id)
    const final = await ProductOption.findAll({
      where: {
        configId,
      },
      order: [['sortOrder', 'ASC']],
      transaction: t,
    })
    return final
  }

  /**
   * get highest sort order of all options with a given configID
   * @param {number | unknown} configurationId - which config ID to check for sort order highest value
   * @returns {ProductOption} ProductOption object or throws error
   */
  static async highestSortOrder(configurationId: number | unknown, t?: Transaction): Promise<number> {
    const configId = isId.validateSync(configurationId)
    const max = await ProductOption.max('sortOrder', {
      where: {
        configId,
      },
      transaction: t,
    })
    // console.log('MAX = ', max)
    return Number(max) || 0
  }

  /**
   * insert ProductOption record to DB. configId is required
   * @param {unknown | ProductOptionCreate} productOption - ProductOption record to insert to DB
   * @returns {ProductOption} ProductOption object or throws error
   */
  static async create(productOption: unknown | ProductOptionCreate, t?: Transaction): Promise<ProductOption> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const parsedProductOption = validateProductOptionCreate(productOption)
      if (parsedProductOption.sortOrder === -1) {
        // if sort order was not provided, i.e. defaulted to -1
        parsedProductOption.sortOrder = await this.highestSortOrder(parsedProductOption.configId, transaction) + 1
      }
      const { id } = await ProductOption.create(parsedProductOption, { transaction })

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
   * update Product Option record in DB.
   * @param {number | unknown} productOptionId - id of the Product Option record to update in DB
   * @param {unknown | Partial<ProductOptionCreate>} productOptionData - update data for Product record
   * @returns {ProductOption} Updated Option object or throws error
   */
  static async update(productOptionId: number | unknown, productOptionData: Partial<ProductOptionCreate> | unknown, t?: Transaction): Promise<ProductOption> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const parsedProductUpdate = validateProductOptionUpdate(productOptionData)

      const id = isId.validateSync(productOptionId)
      const productOptionRecord = await this.get(id, transaction)
      if (!productOptionRecord) {
        throw new Error('Product Option does not exist')
      }

      await productOptionRecord.update(parsedProductUpdate, { transaction })
      const result = await this.get(productOptionRecord.id, transaction)
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
   * upsert(insert or create) productOption record in DB. magento productOption externalId is required
   * @param {unknown} productOptionData - update/create data for productOption record
   * @returns {productOption} updated or created productOption object with Brand Record if available
   */
  static async upsert(productOptionData: unknown, t?: Transaction): Promise<ProductOption> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const { externalId, configId } = isObjectWithExternalIdandConfigId.validateSync(productOptionData)
      const productOptionRecord = await ProductOption.findOne({
        where: {
          externalId,
          configId,
        },
        transaction,
      })

      let result: ProductOption | null
      if (!productOptionRecord) {
        result = await this.create(productOptionData, transaction)
      } else {
        result = await this.update(productOptionRecord.id, productOptionData, transaction)
      }

      result = await this.get(result.id, transaction)

      if (!result) {
        throw new Error('Unknown error upserting Product Option')
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
   * Upsert multiple product options at once. Magento productOption externalId is required.
   * @param configId - configuration id
   * @param productOptions - options to upsert
   * @param t - optional transaction
   * @returns - array of upserted options
   */
  static async bulkUpsert(configId:number, productOptions: unknown[], t?: Transaction): Promise<ProductOption[]> {
    if (!Array.isArray(productOptions)) {
      throw new Error('productOptions must be an array')
    }
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const result: ProductOption[] = []
      for (let i = 0; i < productOptions.length; i += 1) {
        const productOption = productOptions[i]
        if (productOption && typeof productOption === 'object') {
          const option = await this.upsert({ ...productOption, configId }, transaction)
          result.push(option)
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
   * delete ProductOption record with a given id from DB.
   * @param {unknown} id - productOptionId
   * @returns {boolean} true if configuration was deleted
   */
  static async delete(id: number | unknown, t?: Transaction): Promise<boolean> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const productOptionId = isId.validateSync(id)
      const final = await ProductOption.destroy({
        where: {
          id: productOptionId,
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
   * delete all ProductOptions of a given configurationID
   * @param {number | unknown} configurationId - productConfigurationId
   * @returns {number} number of deleted options
   */
  static async deleteConfigurationOptions(configurationId: number | unknown, t?: Transaction): Promise<number> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const configId = isId.validateSync(configurationId)
      const final = await ProductOption.destroy({
        where: {
          configId,
        },
        transaction,
      })
      await commit()
      return final
    } catch (error) {
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }

  // static async upsertMagentoProductOptions(
  //   options: ProductOptionShape[],
  //   configInstance: ProductOption,
  //   t?: Transaction,
  // ): Promise<ProductOption[]> {
  //   if (!options.length) {
  //     return []
  //   }
  //   let transaction: Transaction
  //   if (t) {
  //     transaction = t
  //   } else {
  //     transaction = await db.transaction()
  //   }
  //   try {
  //     const result: ProductOption[] = []

  //     for (let i = 0; i < options?.length; i += 1) {
  //       const option = options[i]
  //       if (!option.externalId || !configInstance.id) {
  //         throw new Error('external option id or configuration id is missing')
  //       }

  //       let productOptionRecord: ProductOption | null
  //       productOptionRecord = await ProductOption.findOne({
  //         transaction,
  //         where: {
  //           externalId: option.externalId,
  //           configId: configInstance.id,
  //         },
  //       })
  //       if (!productOptionRecord) {
  //         productOptionRecord = await ProductOption.create({
  //           ...option,
  //           configId: configInstance.id,
  //         }, {
  //           transaction,
  //         })
  //       } else {
  //       // update option record:
  //         const updatedOptionValues: ProductOptionShape = {
  //           sortOrder: option.sortOrder,
  //           externalId: option.externalId,
  //           externalValue: option.externalValue,
  //           label: productOptionRecord.label || option.label,
  //           value: productOptionRecord.value || option.value,
  //           configId: configInstance.id,
  //         }

  //         productOptionRecord.set(updatedOptionValues)
  //         productOptionRecord = await productOptionRecord.save({
  //           transaction,
  //         })
  //       }
  //       result.push(productOptionRecord)
  //     }

  //     if (!t) {
  //     // if no transaction was provided, commit the local transaction:
  //       await transaction.commit()
  //     }
  //     return result
  //   } catch (error) {
  //     // if the t transaction was passed to the method, throw error again
  //     // to be processed by another
  //     if (t) {
  //       throw error
  //     }
  //     console.log('error occured: ', error, 'rolling back transaction')
  //     await transaction.rollback()
  //     return []
  //   }
  // }
}
// done: toJSON
// done: get option (by id)
// done: get option by Config ID
// done: get highest sort order
// done: create product option
// done: update product option
// done: delete product option by id
// done: delete all product options by config ID
// done: upsert product option (configurationId + externalId is required)
