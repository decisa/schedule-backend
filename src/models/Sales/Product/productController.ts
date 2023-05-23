import * as yup from 'yup'
import { Transaction } from 'sequelize'
import {
  isId, printYellowLine, useTransaction,
} from '../../../utils/utils'
import { Brand } from '../../Brand/brand'
import { ProductConfiguration } from '../ProductConfiguration/productConfiguration'
import { BrandRead } from '../../Brand/brandController'
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

type ProductFK = {
  brandId: number
}

type ProductAssociations = {
  brand?: BrandRead
  // or should it be just
  // brand: string
  configurations?: ProductConfiguration[] | null
}

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

  // /**
  //  * upsert(insert or create) address record in DB. Will update/create magento record if provided. magento address externalId is required
  //  * @param {unknown} addressData - update data for address record
  //  * @returns {Address} updated or created Address object with Magento Record if available
  //  */
  // static async upsert(addressData: unknown, t?: Transaction): Promise<Address> {
  //   const [transaction, commit, rollback] = await useTransaction(t)
  //   try {
  //     let magento: AddressMagentoRecord | undefined
  //     if (addressData && typeof addressData === 'object' && 'magento' in addressData) {
  //       magento = validateAddressMagento(addressData.magento)
  //     }
  //     if (!magento) {
  //       throw new Error('Magento record is required for upsert')
  //     }
  //     const addressRecord = await Address.findOne({
  //       include: [{
  //         association: 'magento',
  //         where: {
  //           externalId: magento.externalId,
  //         },
  //       }],
  //       transaction,
  //     })

  //     let result: Address
  //     if (!addressRecord) {
  //       result = await this.create(addressData, transaction)
  //     } else {
  //       result = await this.update(addressRecord.id, addressData, transaction)
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
  //  * delete address record with a given id from DB.
  //  * @param {unknown} id - addressId
  //  * @returns {number} number of objects deleted.
  //  */
  // static async delete(id: number | unknown, t?: Transaction): Promise<boolean> {
  //   const [transaction, commit, rollback] = await useTransaction(t)
  //   try {
  //     const addressId = isId.validateSync(id)
  //     const final = await Address.destroy({
  //       where: {
  //         id: addressId,
  //       },
  //       transaction,
  //     })
  //     console.log('deletion result: ', final)
  //     await commit()
  //     return final === 1
  //   } catch (error) {
  //     await rollback()
  //     // rethrow the error for further handling
  //     throw error
  //   }
  // }

  // /**
  //  * delete corresponding address Magento record with a given addressID from DB.
  //  * @param {unknown} addressId - addressId to delete
  //  * @returns {AddressMagentoRecord | null} AddressMagentoRecord that was deleted or null if record did not exist.
  //  */
  // static async deleteMagento(addressId: number | unknown, t?: Transaction): Promise<AddressMagentoRecord | null> {
  //   const [transaction, commit, rollback] = await useTransaction(t)
  //   try {
  //     const id = isId.validateSync(addressId)
  //     const record = await this.get(id, transaction)
  //     let magento: AddressMagentoRecord | null = null

  //     if (record && record.magento) {
  //       magento = record.magento.toJSON()
  //       await record.magento.destroy({ transaction })
  //     }
  //     await commit()
  //     return magento
  //   } catch (error) {
  //     await rollback()
  //     // rethrow the error for further handling
  //     throw error
  //   }
  // }

  // /**
  //  * create address Magento record for the given ID.
  //  * @param {number | unknown} addressId id of the address that needs magento data inserted
  //  * @param {AddressMagentoRecord | unknown} magentoData magento record to add
  //  * @returns {MagentoAddress} MagentoAddress instance that was created
  //  */
  // static async createMagento(addressId: number | unknown, addressMagentoData: AddressMagentoRecord | unknown, t?: Transaction): Promise<MagentoAddress> {
  //   const [transaction, commit, rollback] = await useTransaction(t)
  //   try {
  //     const magento = validateAddressMagento(addressMagentoData)
  //     const id = isId.validateSync(addressId)
  //     magento.addressId = id
  //     const record = await MagentoAddress.create(magento, { transaction })
  //     await commit()
  //     return record
  //   } catch (error) {
  //     await rollback()
  //     // rethrow the error for further handling
  //     throw error
  //   }
  // }
}
// done: toJSON
// done: get product (by id)
// done: create product
// done: update product
// delete product

// delete magento record
// create magento record

// upsert product (externalId is required)
