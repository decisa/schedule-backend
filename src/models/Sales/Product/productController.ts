import * as yup from 'yup'
import { Transaction } from 'sequelize'
import { isId, useTransaction, isObjectWithExternalId } from '../../../utils/utils'
// import { ProductConfiguration } from '../ProductConfiguration/productConfiguration'
// import { BrandRead } from '../../Brand/brandController'
import { Product, ProductType, productTypes } from './product'

type ProductCreational = {
  id: number
}

type ProductRequired = {
  type: ProductType
  name: string
}

type ProductOptional = {
  image: string | null
  url: string | null
  productSpecs: string | null
  assemblyInstructions: string | null
  volume: number | null
  sku: string | null
  externalId: number | null
}

type ProductTimeStamps = {
  createdAt: Date
  updatedAt: Date
}

// type ProductFK = {
//   brandId: number
// }

// type ProductAssociations = {
//   brand?: BrandRead
//   // or should it be just
//   // brand: string
//   configurations?: ProductConfiguration[] | null
// }

// Note: DATA TYPES
export type ProductCreate =
  Partial<ProductCreational>
  & Required<ProductRequired>
  & Partial<ProductOptional>
  & Partial<ProductTimeStamps>
  // & Partial<ProductAssociations>

export type ProductRead = Omit<Required<ProductCreate>, 'brandId'> & {
  brand: string | null
}

const productSchemaCreate: yup.ObjectSchema<ProductCreate> = yup.object({
  // AddressFK
  // brandId: number
  brandId: yup.number()
    .integer()
    .positive()
    .nullable()
    .label('Malformed data: brandId'),
  // required
  // type: string
  // name: string
  type: yup.mixed<ProductType>()
    .nonNullable()
    // .default('custom')
    .oneOf(productTypes)
    .label('Malformed data: type')
    .required(),
  name: yup.string()
    .label('Malformed data: name')
    .nonNullable()
    .required(),

  // optional
  // image: string | null
  // url: string | null
  // productSpecs: string | null
  // assemblyInstructions: string | null
  // volume: number | null
  // sku: string | null
  // externalId: number | null
  image: yup.string()
    // .url()
    .label('Malformed data: image')
    .nullable(),
  url: yup.string()
    // .url()
    .label('Malformed data: url')
    .nullable(),
  productSpecs: yup.string()
    // .url()
    .label('Malformed data: productSpecs')
    .nullable(),
  assemblyInstructions: yup.string()
    // .url()
    .label('Malformed data: assemblyInstructions')
    .nullable(),
  volume: yup
    .number()
    .positive()
    .nullable()
    .label('Malformed data: volume'),
  sku: yup.string()
    .label('Malformed data: sku')
    .nullable(),
  externalId: yup
    .number()
    .integer()
    .positive()
    .nullable()
    .label('Malformed data: externalId'),
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

const productSchemaUpdate: yup.ObjectSchema<Partial<ProductCreate>> = productSchemaCreate
  .clone()
  .shape({
    name: yup.string()
      .label('Malformed data: name')
      .nonNullable(),
    type: yup.mixed<ProductType>()
      .nonNullable()
      // .default('custom')
      .oneOf(productTypes)
      .label('Malformed data: type'),
  })

// // type RequiredExceptFor<T, K extends keyof T> = Omit<T, K> & {
// //   [P in K]+?: T[P]
// // };

export function validateProductCreate(object: unknown): ProductCreate {
  const product = productSchemaCreate.validateSync(object, {
    stripUnknown: true,
    abortEarly: false,
  }) satisfies ProductCreate
  return product
}

export function validateProductUpdate(object: unknown): Omit<Partial<ProductCreate>, 'createdAt' | 'updatedAt' | 'id'> {
  // restrict update of id, and creation or modification dates
  const product = productSchemaUpdate.omit(['createdAt', 'updatedAt', 'id']).validateSync(object, {
    stripUnknown: true,
    abortEarly: false,
  }) satisfies Partial<ProductCreate>

  console.log('verification complete:', product)
  return product
}

// export function validateAddressMagento(object: unknown): AddressMagentoRecord {
//   const magento = addressMagentoSchema.validateSync(object, {
//     stripUnknown: true,
//     abortEarly: false,
//   }) satisfies AddressMagentoRecord
//   return magento
// }

// export function validateAddressMagentoUpdate(object: unknown): Partial<Omit<AddressMagentoRecord, 'addressId'>> {
//   const magento = addressMagentoUpdateSchema.validateSync(object, {
//     stripUnknown: true,
//     abortEarly: false,
//   }) satisfies Partial<Omit<AddressMagentoRecord, 'addressId'>>
//   return magento
// }

function productToJson(product: Product): ProductRead {
  const productData = product.toJSON()

  // remove brandId and add brand name as a string
  const result: ProductRead & {
    brandId?: number
  } = {
    ...productData,
    brand: null,
  }
  if (product.brand) {
    const brandData = product.brand.toJSON()
    result.brand = brandData.name
  }
  delete result.brandId

  return result
}

// /**
//    * compare existing address in DB to new values and decide whether coordintates of the address
//    * should update.
//    * @param {Address} currentAddress - current instance of the Address
//    * @param {Partial<AddressCreate>} updatedAddress - object that will act as address update
//    * @returns {boolean} true if coordinates need an update
//    */
// function shouldCoordinatesUpdate(currentAddress: Address, updatedAddress: Partial<AddressCreate>): boolean {
//   const fieldsThatChangeCoordinates: (keyof AddressCreate)[] = ['street1', 'city', 'state', 'zipCode', 'country']

//   const possiblyChangedFields = fieldsThatChangeCoordinates.filter((fieldName) => updatedAddress[fieldName])

//   const changedFields = possiblyChangedFields.filter((fieldName) => currentAddress[fieldName] !== updatedAddress[fieldName])

//   printYellowLine()
//   console.log('changed fields:', changedFields)

//   return changedFields.length > 0
// }

export default class ProductController {
  /**
   * convert AddressInstance to a regular JSON object
   * @param data - Addresss, array of Addresses or null
   * @returns {AddressMagentoRead | AddressMagentoRead[] | null} JSON format nullable.
   */
  static toJSON(data: Product): ProductRead
  static toJSON(data: Product | null): ProductRead | null
  static toJSON(data: Product[]): ProductRead[]
  static toJSON(data: Product[] | null): ProductRead[] | null
  static toJSON(data: null): null
  static toJSON(data: Product | Product[] | null): ProductRead | ProductRead[] | null {
    try {
      if (data instanceof Product) {
        return productToJson(data)
      }
      if (Array.isArray(data)) {
        return data.map(productToJson)
      }
      return null
    } catch (error) {
      return null
    }
  }

  /**
   * get Product record by id from DB. Will include Brand name if available
   * @param {unknown} id - productId
   * @returns {Product} Product object or null
   */
  static async get(id: number | unknown, t?: Transaction): Promise<Product | null> {
    const productId = isId.validateSync(id)
    const final = await Product.findByPk(productId, { include: 'brand', transaction: t })
    return final
  }

  // /**
  //  * get all addresses associated with a given customerId. Will include magento record if available
  //  * @param {unknown} id - customerId
  //  * @returns {Address | Address[] | null} Address object or null
  //  */
  // static async getByCustomerId(id: number | unknown, t?: Transaction): Promise<Address | Address[] | null> {
  //   const customerId = isId.validateSync(id)
  //   const final = await Address.findAll({
  //     where: {
  //       customerId,
  //     },
  //     include: 'magento',
  //     transaction: t,
  //   })
  //   return final
  // }

  /**
   * insert Product record to DB. Will include magento record if provided.
   * FK ProductId will be ignored on magento record and generated automatically.
   * @param {unknown | ProductCreate} product - customer Product record to insert to DB
   * @returns {Product} Product object or throws error
   */
  static async create(product: unknown | ProductCreate, t?: Transaction): Promise<Product> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const parsedProduct = validateProductCreate(product)
      const { id } = await Product.create(parsedProduct, { transaction })
      const result = await this.get(id, transaction)
      if (!result) {
        throw new Error('error creating the product')
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
   * update Product record in DB. Will update magento record if provided.If magento record does not exist in DB, it will be created
   * @param {number | unknown} productId - id of the Product record to update in DB
   * @param {unknown | Partial<ProductCreate>} productData - update data for Product record
   * @returns {Product} complete Updated Product object or throws error
   */
  static async update(productId: number | unknown, productData: Partial<ProductCreate> | unknown, t?: Transaction): Promise<Product> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const parsedProductUpdate = validateProductUpdate(productData)

      const id = isId.validateSync(productId)
      const productRecord = await this.get(id, transaction)
      if (!productRecord) {
        throw new Error('Product does not exist')
      }

      await productRecord.update(parsedProductUpdate, { transaction })
      const result = await this.get(productRecord.id, transaction)
      if (!result) {
        throw new Error('error updating the product')
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
   * upsert(insert or create) product record in DB. magento product externalId is required
   * @param {unknown} productData - update/create data for product record
   * @returns {product} updated or created product object with Brand Record if available
   */
  static async upsert(productData: unknown, t?: Transaction): Promise<Product> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const { externalId } = isObjectWithExternalId.validateSync(productData)
      const productRecord = await Product.findOne({
        where: {
          externalId,
        },
        transaction,
      })

      let result: Product | null
      if (!productRecord) {
        result = await this.create(productData, transaction)
      } else {
        result = await this.update(productRecord.id, productData, transaction)
      }

      result = await this.get(result.id, transaction)

      if (!result) {
        throw new Error('Unknown error upserting Product')
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
   * delete Product record with a given id from DB.
   * @param {unknown} id - productId
   * @returns {number} number of objects deleted.
   */
  static async delete(id: number | unknown, t?: Transaction): Promise<boolean> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const productId = isId.validateSync(id)
      const final = await Product.destroy({
        where: {
          id: productId,
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
// done: toJSON
// done: get product (by id)
// done: create product
// done: update product
// done: delete product
// done: upsert product (externalId is required)
