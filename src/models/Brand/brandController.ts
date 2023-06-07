import * as yup from 'yup'
import { Transaction } from 'sequelize'
import { Brand } from './brand'
import { isId, useTransaction } from '../../utils/utils'

type BrandCreational = {
  id: number
}

type BrandRequired = {
  name: string
}

type BrandOptional = {
  externalId: number | null
}

// type BrandAssociations = {
//   purchaseOrders?: purchaseOrder[] | null
//   products?: Product[] | null
// }

// Note: DATA TYPES
export type BrandCreate =
  Partial<BrandCreational>
  & Required<BrandRequired>
  & Partial<BrandOptional>
  // & Partial<BrandAssociations>

export type BrandRead = Required<BrandCreate>

const brandSchemaCreate: yup.ObjectSchema<BrandCreate> = yup.object({
  // required
  // name: string
  name: yup.string()
    .label('Brand malformed data: name')
    .nonNullable()
    .required(),
  // optional
  // externalId: number | null
  externalId: yup
    .number()
    .integer()
    .positive()
    .nullable()
    .label('Brand malformed data: externalId'),
  // id: number
  id: yup
    .number()
    .integer()
    .positive()
    .nonNullable()
    .label('Brand malformed data: id'),
})

const brandSchemaUpdate: yup.ObjectSchema<Partial<BrandCreate>> = yup.object({
  // required
  // name: string
  name: yup.string()
    .label('Brand malformed data: name')
    .nonNullable(),
  // optional
  // externalId: number | null
  externalId: yup
    .number()
    .integer()
    .positive()
    .nullable()
    .label('Brand malformed data: externalId'),
  // id: number
  id: yup
    .number()
    .integer()
    .positive()
    .nonNullable()
    .label('Brand malformed data: id'),
})

// // type RequiredExceptFor<T, K extends keyof T> = Omit<T, K> & {
// //   [P in K]+?: T[P]
// // };

export function validateBrandCreate(object: unknown): BrandCreate {
  const brand = brandSchemaCreate.validateSync(object, {
    stripUnknown: true,
    abortEarly: false,
  }) satisfies BrandCreate
  return brand
}

export function validateBrandUpdate(object: unknown): Omit<Partial<BrandCreate>, 'id'> {
  // restrict update of id, and creation or modification dates
  const brand = brandSchemaUpdate.omit(['id']).validateSync(object, {
    stripUnknown: true,
    abortEarly: false,
  }) satisfies Partial<BrandCreate>

  return brand
}

function brandToJson(brand: Brand): BrandRead {
  const result = brand.toJSON()
  return result
}

export default class BrandController {
  /**
   * convert BrandInstance(s) to a regular JSON object
   * @param data - Brand, array of Brands or null
   * @returns {BrandRead | BrandRead[] | null} JSON format nullable.
   */
  static toJSON(data: Brand | Brand[] | null): BrandRead | BrandRead[] | null {
    try {
      if (data instanceof Brand) {
        return brandToJson(data)
      }
      if (Array.isArray(data)) {
        return data.map(brandToJson)
      }
      return null
    } catch (error) {
      return null
    }
  }

  /**
   * get Brand record by id from DB. Will include magento record if available
   * @param {unknown} id - brandId
   * @returns {Brand} Brand object or null
   */
  static async get(id: number | unknown, t?: Transaction): Promise<Brand | null> {
    const brandId = isId.validateSync(id)
    const final = await Brand.findByPk(brandId, {
      // include: 'magento',
      transaction: t,
    })
    return final
  }

  static async getByExternalId(id: number | unknown, t?: Transaction): Promise<Brand | null> {
    const externalId = isId.validateSync(id)
    const final = await Brand.findOne({
      where: {
        externalId,
      },
      transaction: t,
    })
    return final
  }

  /**
   * get all brands   *
   * @returns {Address | Address[] | null} All brands
   */
  static async getAll(t?: Transaction): Promise<Brand[] | null> {
    const final = await Brand.findAll({
      transaction: t,
    })
    return final
  }

  /**
   * insert brand record to DB.
   * @param {unknown} Brand - Brand record to insert to DB
   * @returns {Brand} Brand object or throws error
   */
  static async create(brand: unknown, t?: Transaction): Promise<Brand> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const parsedBrand = validateBrandCreate(brand)
      const brandRecord = await Brand.create(parsedBrand, {
        transaction,
      })

      await commit()
      return brandRecord
    } catch (error) {
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }

  /**
   * update brand record in DB. Will update magento record if provided.If magento record does not exist in DB, it will be created
   * @param {number | unknown} brandId - id of the brand record to update in DB
   * @param {unknown} brand - update data for brand record
   * @returns {Brand} updated Brand object or throws error
   */
  static async update(brandId: number | unknown, brand: unknown, t?: Transaction): Promise<Brand> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const parsedBrandUpdate = validateBrandUpdate(brand)

      const id = isId.validateSync(brandId)
      const brandRecord = await Brand.findByPk(id, { transaction })
      if (!brandRecord) {
        throw new Error('Brand does not exist')
      }

      await brandRecord.update(parsedBrandUpdate, { transaction })

      await commit()
      return brandRecord
    } catch (error) {
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }

  /**
   * upsert(insert or create) Brand record in DB. magento Brand externalId is required
   * @param {unknown | BrandCreate} brandData - update data for Brand record
   * @returns {Brand} updated or created Brand object with Magento Record if available
   */
  static async upsert(brandData: unknown, t?: Transaction): Promise<Brand> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const parsedBrand = validateBrandCreate(brandData)
      if (!parsedBrand.externalId) {
        throw new Error('externalId is required for upsert')
      }
      const brandRecord = await Brand.findOne({
        where: {
          externalId: parsedBrand.externalId,
        },
        transaction,
      })

      let result: Brand
      if (!brandRecord) {
        result = await this.create(brandData, transaction)
      } else {
        result = await this.update(brandRecord.id, brandData, transaction)
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
   * delete Brand record with a given id from DB.
   * @param {unknown} id - brandId
   * @returns {boolean} true if object was deleted.
   */
  static async delete(id: number | unknown, t?: Transaction): Promise<boolean> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const brandId = isId.validateSync(id)
      const final = await Brand.destroy({
        where: {
          id: brandId,
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
// done: get brand (by id)
// done: get by magento id
// done: get all
// done: create brand
// done: update brand
// done: delete brand

// done: upsert brand (externalID is required)
