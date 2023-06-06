import * as yup from 'yup'
import { Transaction } from 'sequelize'
import {
  isId, printYellowLine, useTransaction,
} from '../../../utils/utils'
import { MagentoAddressType, MagentoOrderAddress, magentoAddressTypes } from '../MagentoOrderAddress/magentoOrderAddress'
import { OrderAddress } from './orderAddress'

type OrderAddressCreational = {
  id: number
}

// street1 is required but will be OrderAddressed later
type OrderAddressRequired = {
  firstName: string
  lastName: string
  city: string
  state: string
  zipCode: string
  country: string
  phone: string
}

type OrderAddressOptional = {
  company: string | null
  street1?: string
  street2: string | null
  street?: string[]
  altPhone: string | null
  notes: string | null
  longitude: number | null
  latitude: number | null
  coordinates: [number, number] | null
}

type OrderAddressTimeStamps = {
  createdAt: Date
  updatedAt: Date
}

type OrderAddressFK = {
  orderId: number
  customerAddressId: number | null
}

export type OrderAddressMagentoRecord = {
  externalId: number
  externalOrderId: number
  addressType: MagentoAddressType
  externalCustomerAddressId: number | null
  orderAddressId?: number
}

// type OrderAddressAssociations = {
//  order?: NonAttribute<Order>
//  magento?: NonAttribute<MagentoOrderAddress>
//  routeStops?: NonAttribute<RouteStop[]>
// }

// Note: DATA TYPES
export type OrderAddressCreate =
  Partial<OrderAddressCreational>
  & Required<OrderAddressRequired>
  & Partial<OrderAddressOptional>
  & Partial<OrderAddressTimeStamps>
  & Partial<OrderAddressFK>
  // & Partial<OrderAddressAssociations>

export type OrderAddressRead = Required<OrderAddressCreate>

export type OrderAddressMagentoRead = Omit<OrderAddressRead, 'latitude' | 'longitude' | 'street1' | 'street2'> & {
  magento?: Omit<OrderAddressMagentoRecord, 'orderAddressId'>
}

const orderAddressMagentoSchema: yup.ObjectSchema<OrderAddressMagentoRecord> = yup.object({
  // externalId: number
  // externalOrderId: number
  // addressType: MagentoAddressType
  // externalCustomerAddressId: number | null
  // orderAddressId?: number
  externalId: yup.number()
    .integer()
    .positive()
    .nonNullable()
    .required()
    .label('Malformed data: magento > externalId'),
  externalOrderId: yup.number()
    .integer()
    .positive()
    .nonNullable()
    .required()
    .label('Malformed data: magento > externalOrderId'),
  addressType: yup.mixed<MagentoAddressType>()
    .oneOf(magentoAddressTypes)
    .label('Malformed data: magento > addressType')
    .required(),
  externalCustomerAddressId: yup.number()
    .integer()
    .positive()
    .default(null)
    .nullable()
    .label('Malformed data: magento > externalCustomerAddressId'),
  orderAddressId: yup.number()
    .integer()
    .positive()
    .nonNullable()
    .label('Malformed data: magento > orderAddressId'),
})

const orderAddressMagentoUpdateSchema: yup.ObjectSchema<Partial<Omit<OrderAddressMagentoRecord, 'orderAddressId'>>> = yup.object({
  // externalId: number
  // addressType: MagentoAddressType
  // addressId: number
  externalId: yup.number()
    .integer()
    .positive()
    .nonNullable()
    .label('Malformed data: magento > externalId'),
  externalOrderId: yup.number()
    .integer()
    .positive()
    .nonNullable()
    .label('Malformed data: magento > externalOrderId'),
  addressType: yup.mixed<MagentoAddressType>()
    .oneOf(magentoAddressTypes)
    .label('Malformed data: magento > addressType')
    .nonNullable(),
  externalCustomerAddressId: yup.number()
    .integer()
    .positive()
    .nullable()
    .label('Malformed data: magento > externalCustomerAddressId'),
})

// when data is sent to DB, all virtual fields like street[] and coordinates, should be converted
// to their respective street1 & street2 and latitude & longitude
export const orderAddressSchemaCreate: yup.ObjectSchema<OrderAddressCreate> = yup.object({
  // AddressFK
  // orderId: number
  // customerAddressId: number | null
  orderId: yup
    .number()
    .integer()
    .positive()
    .required()
    .label('Malformed data: orderId'),
  customerAddressId: yup
    .number()
    .integer()
    .positive()
    .default(null)
    .nullable()
    .label('Malformed data: customerAddressId'),
  // required
  // firstName: string
  // lastName: string
  // phone: string
  // street1: string
  // street: string[]
  // city: string
  // state: string
  // zipCode: string
  // country: string
  firstName: yup.string()
    .label('Malformed data: firstName')
    .nonNullable()
    .required(),
  lastName: yup.string()
    .label('Malformed data: lastName')
    .nonNullable()
    .defined(),
  phone: yup.string()
    .min(10)
    .label('Malformed data: phone')
    .nonNullable()
    .required(),
  street1: yup.string().nonNullable(),
  // .label('Malformed data: street1'),
  street2: yup.string(),
  // .label('Malformed data: street2'),
  street: yup.array()
    .of(yup.string().required())
    .min(1)
    .nonNullable(),
  // .label('Malformed data: street'),
  city: yup.string()
    .nonNullable()
    .label('Malformed data: city')
    .required(),
  state: yup.string()
    .nonNullable()
    .label('Malformed data: state')
    .required(),
  zipCode: yup.string()
    .nonNullable()
    .label('Malformed data: zipCode')
    .required(),
  country: yup.string()
    .nonNullable()
    .label('Malformed data: country')
    .required(),
  // AddressOptional
  //   company: string | null
  //   altPhone: string | null
  //   notes: string | null
  //   latitude: number | null
  //   longitude: number | null
  //   coordinates: [number, number] | null
  company: yup.string().nullable()
    .label('Malformed data: company'),
  altPhone: yup.string().nullable()
    .label('Malformed data: altPhone'),
  notes: yup.string()
    .nullable()
    .label('Malformed data: notes'),
  latitude: yup.number()
    .min(-90)
    .max(90)
    .nullable()
    .label('Malformed data: latitude'),
  longitude: yup.number()
    .min(-180)
    .max(180)
    .nullable()
    .label('Malformed data: longitude'),
  coordinates: yup.tuple([
    yup.number().min(-90).max(90).required(),
    yup.number().min(-180).max(180).required(),
  ])
    .nullable()
    .label('Malformed data: coordinates'),
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

const orderAddressSchemaUpdate: yup.ObjectSchema<Partial<OrderAddressCreate>> = yup.object({
  // AddressFK
  // customerId: number
  // customerAddressId: number | null
  orderId: yup
    .number()
    .integer()
    .positive()
    .nonNullable()
    .label('Malformed data: orderId'),
  customerAddressId: yup
    .number()
    .integer()
    .positive()
    .nullable()
    .label('Malformed data: customerAddressId'),
  // required
  // firstName: string
  // lastName: string
  // phone: string
  // street1: string
  // street: string[]
  // city: string
  // state: string
  // zipCode: string
  // country: string
  firstName: yup.string()
    .label('Malformed data: firstName')
    .nonNullable(),
  lastName: yup.string()
    .label('Malformed data: lastName')
    .nonNullable(),
  phone: yup.string()
    .min(10)
    .label('Malformed data: phone')
    .nonNullable(),
  street1: yup.string().nonNullable(),
  // .label('Malformed data: street1'),
  street2: yup.string(),
  // .label('Malformed data: street2'),
  street: yup.array()
    .of(yup.string().required())
    .min(1)
    .nonNullable(),
  // .label('Malformed data: street'),
  city: yup.string()
    .nonNullable()
    .label('Malformed data: city'),
  state: yup.string()
    .nonNullable()
    .label('Malformed data: state'),
  zipCode: yup.string()
    .nonNullable()
    .label('Malformed data: zipCode'),
  country: yup.string()
    .nonNullable()
    .label('Malformed data: country'),
  // AddressOptional
  //   company: string | null
  //   altPhone: string | null
  //   notes: string | null
  //   latitude: number | null
  //   longitude: number | null
  //   coordinates: [number, number] | null
  company: yup.string().nullable()
    .label('Malformed data: company'),
  altPhone: yup.string().nullable()
    .label('Malformed data: altPhone'),
  notes: yup.string()
    .nullable()
    .label('Malformed data: notes'),
  latitude: yup.number()
    .min(-90)
    .max(90)
    .nullable()
    .label('Malformed data: latitude'),
  longitude: yup.number()
    .min(-180)
    .max(180)
    .nullable()
    .label('Malformed data: longitude'),
  coordinates: yup.tuple([
    yup.number().min(-90).max(90).required(),
    yup.number().min(-180).max(180).required(),
  ])
    .nullable()
    .label('Malformed data: coordinates'),
  // id: number
  id: yup.number().integer().positive().nonNullable(),
  // createdAt: Date
  // updatedAt: Date
  createdAt: yup.date().nonNullable().label('Malformed data: createdAt'),
  updatedAt: yup.date().nonNullable().label('Malformed data: updatedAt'),
})

// type RequiredExceptFor<T, K extends keyof T> = Omit<T, K> & {
//   [P in K]+?: T[P]
// };

export function validateOrderAddressCreate(object: unknown): Omit<OrderAddressCreate, 'street' | 'coordinates' | 'street1'> & { street1: string } {
  const address = orderAddressSchemaCreate.validateSync(object, {
    stripUnknown: true,
    abortEarly: false,
  }) satisfies OrderAddressCreate

  if (address.street && address.street.length) {
    // if address street array is provided, copy its values to street1 and street2 if those are empty
    // street1 and street2 take priority
    const [str1, str2] = address.street
    if (str1) {
      address.street1 = address.street1 || str1
    }
    if (str2) {
      address.street2 = address.street2 || str2
    }
    delete address.street
  }

  if (!address.street1) {
    throw new Error('Malformed data: at least one line of street address is required')
  }

  // if you want to reset the coordinates
  if (address.coordinates === null) {
    address.latitude = null
    address.longitude = null
    delete address.coordinates
  }

  if (address.coordinates && address.coordinates.length) {
    // if address coordinates array is provided, copy its values to latitude and longitude if those are empty
    // latitude and longitude take priority
    const [lat, lon] = address.coordinates
    if (lat !== undefined) {
      address.latitude = address.latitude || lat
    }
    if (lon !== undefined) {
      address.longitude = address.longitude || lon
    }
    delete address.coordinates
  }
  // if only one of the coordintates is specified - throw an error
  if ((!address.latitude || !address.longitude) && (address.latitude || address.longitude)) {
    // exclude false positive:
    if (address.latitude !== 0 && address.longitude !== 0) {
      throw new Error('Malformed data: bad coordinates. need to specify both')
    }
  }

  // street1 is always defined by this line. could not make typescript not to complain
  // had to add this useless check:
  if (address.street1) {
    return {
      ...address,
      street1: address.street1,
    }
  }
  throw new Error('Malformed data: at least one line of street address is required')
}

export function validateOrderAddressUpdate(object: unknown): Omit<Partial<OrderAddressCreate>, 'createdAt' | 'updatedAt' | 'id' | 'street' | 'coordinates'> {
  // restrict update of id, and creation or modification dates
  const address = orderAddressSchemaUpdate.omit(['createdAt', 'updatedAt', 'id']).validateSync(object, {
    stripUnknown: true,
    abortEarly: false,
  }) satisfies Partial<OrderAddressCreate>

  // check street1,2 []
  if (address.street && address.street.length) {
    // if address street array is provided, copy its values to street1 and street2 if those are empty
    // street1 and street2 take priority
    const [str1, str2 = null] = address.street
    if (str1) {
      address.street1 = address.street1 || str1
      address.street2 = address.street2 || str2
    }
    delete address.street
  }
  // check lat, lon, coord
  // if you want to reset the coordinates
  if (address.coordinates === null) {
    address.latitude = null
    address.longitude = null
    delete address.coordinates
  }

  if (address.coordinates && address.coordinates.length) {
    // if address coordinates array is provided, copy its values to latitude and longitude if those are empty
    // latitude and longitude take priority
    const [lat, lon] = address.coordinates
    if (lat !== undefined) {
      address.latitude = address.latitude || lat
    }
    if (lon !== undefined) {
      address.longitude = address.longitude || lon
    }
    delete address.coordinates
  }
  // if only one of the coordintates is specified - throw an error
  if ((!address.latitude || !address.longitude) && (address.latitude || address.longitude)) {
    // exclude false positive:
    if (address.latitude !== 0 && address.longitude !== 0) {
      throw new Error('Malformed data: bad coordinates. need to specify both')
    }
  }
  // check if update triggers the coord change (afer the fact)
  return address
}

export function validateOrderAddressMagento(object: unknown): OrderAddressMagentoRecord {
  const magento = orderAddressMagentoSchema.validateSync(object, {
    stripUnknown: true,
    abortEarly: false,
  }) satisfies OrderAddressMagentoRecord
  return magento
}

export function validateOrderAddressMagentoUpdate(object: unknown): Partial<Omit<OrderAddressMagentoRecord, 'addressId'>> {
  const magento = orderAddressMagentoUpdateSchema.validateSync(object, {
    stripUnknown: true,
    abortEarly: false,
  }) satisfies Partial<Omit<OrderAddressMagentoRecord, 'addressId'>>
  return magento
}

function addressToJson(address: OrderAddress): OrderAddressMagentoRead {
  let magento: OrderAddressMagentoRecord | undefined
  if (address.magento && address.magento instanceof MagentoOrderAddress) {
    magento = address.magento.toJSON()
    delete magento.orderAddressId
  }
  const addressData = address.toJSON()
  const result: OrderAddressMagentoRead & {
    street1?: string
    street2?: string | null
    latitude?: number | null
    longitude?: number | null
  } = {
    ...addressData,
    magento,
  }
  delete result.street1
  delete result.street2
  delete result.latitude
  delete result.longitude

  return result
}

/**
   * compare existing address in DB to new values and decide whether coordintates of the address
   * should update.
   * @param {OrderAddress} currentAddress - current instance of the OrderAddress
   * @param {Partial<OrderAddressCreate>} updatedAddress - object that will act as address update
   * @returns {boolean} true if coordinates need an update
   */
function shouldCoordinatesUpdate(currentAddress: OrderAddress, updatedAddress: Partial<OrderAddressCreate>): boolean {
  const fieldsThatChangeCoordinates: (keyof OrderAddressCreate)[] = ['street1', 'city', 'state', 'zipCode', 'country']

  const possiblyChangedFields = fieldsThatChangeCoordinates.filter((fieldName) => updatedAddress[fieldName])

  const changedFields = possiblyChangedFields.filter((fieldName) => currentAddress[fieldName] !== updatedAddress[fieldName])

  printYellowLine()
  console.log('changed fields:', changedFields)

  return changedFields.length > 0
}

export default class OrderAddressController {
  /**
   * convert OrderAddressInstance to a regular JSON object
   * @param data - OrderAddresss, array of OrderAddresss or null
   * @returns {OrderAddressMagentoRead | OrderAddressMagentoRead[] | null} JSON format nullable.
   */
  static toJSON(data: OrderAddress): OrderAddressMagentoRead
  static toJSON(data: OrderAddress | null): OrderAddressMagentoRead | null
  static toJSON(data: OrderAddress[]): OrderAddressMagentoRead[]
  static toJSON(data: OrderAddress[] | null): OrderAddressMagentoRead[] | null
  static toJSON(data: null): null
  static toJSON(data: OrderAddress | OrderAddress[] | null): OrderAddressMagentoRead | OrderAddressMagentoRead[] | null {
    try {
      if (data instanceof OrderAddress) {
        return addressToJson(data)
      }
      if (Array.isArray(data)) {
        return data.map(addressToJson)
      }
      return null
    } catch (error) {
      return null
    }
  }

  /**
   * get OrderAddress record by id from DB. Will include magento record if available
   * @param {unknown} id - orderAddressId
   * @returns {OrderAddress} OrderAddress object or null
   */
  static async get(id: number | unknown, t?: Transaction): Promise<OrderAddress | null> {
    const orderAddressId = isId.validateSync(id)
    const final = await OrderAddress.findByPk(orderAddressId, { include: 'magento', transaction: t })
    return final
  }

  /**
   * get all addresses associated with a given orderId. Will include magento record if available
   * @param {unknown} id - orderId
   * @returns {OrderAddress | OrderAddress[] | null} OrderAddress object or null
   */
  // TODO: add this method to orders API
  static async getByOrderId(id: number | unknown, t?: Transaction): Promise<OrderAddress[] | null> {
    const orderId = isId.validateSync(id)
    const final = await OrderAddress.findAll({
      where: {
        orderId,
      },
      include: 'magento',
      transaction: t,
    })
    return final
  }

  /**
   * insert order address record to DB. Will include magento record if provided.
   * FK orderAddressId will be ignored on magento record and generated automatically.
   * @param {unknown} orderAddress - order address record to insert to DB
   * @returns {Address} Address object or throws error
   */
  static async create(address: unknown, t?: Transaction): Promise<OrderAddress> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      let magento: OrderAddressMagentoRecord | undefined
      if (address && typeof address === 'object' && 'magento' in address) {
        magento = validateOrderAddressMagento(address.magento)
      }
      const parsedAddress = validateOrderAddressCreate(address)

      const result: OrderAddress = await OrderAddress.create(parsedAddress, {
        transaction,
      })

      if (magento) {
        const x = await result.createMagento(magento, { transaction })
        result.magento = x
      }

      const final = await this.get(result.id, transaction)
      if (!final) {
        throw new Error('Internal Error: Address was not created')
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
   * update order address record in DB. Will update magento record if provided.If magento record does not exist in DB, it will be created
   * @param {number | unknown} orderAddressId - id of the address record to update in DB
   * @param {unknown} orderAddressData - update data for address record
   * @returns {address} complete Updated address object or throws error
   */
  static async update(addressId: number | unknown, orderAddressData: unknown, t?: Transaction): Promise<OrderAddress> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      let magento: Partial<OrderAddressMagentoRecord> | undefined
      if (orderAddressData && typeof orderAddressData === 'object' && 'magento' in orderAddressData) {
        magento = validateOrderAddressMagentoUpdate(orderAddressData.magento)
        // console.log('magento record to update: ', magento)
      }
      const parsedAddressUpdate = validateOrderAddressUpdate(orderAddressData)

      // console.log('parsed address', parsedaddress)
      const id = isId.validateSync(addressId)
      const orderAddressRecord = await OrderAddress.findByPk(id, { include: 'magento', transaction })
      if (!orderAddressRecord) {
        throw new Error('address does not exist')
      }

      if (parsedAddressUpdate.latitude === undefined && orderAddressRecord.latitude) {
        // if new coordinates are not provided and current address has defined coordinates:
        // check if update requires new coordinates:
        if (shouldCoordinatesUpdate(orderAddressRecord, parsedAddressUpdate)) {
          if (parsedAddressUpdate.latitude !== null) {
            throw new Error('Significant change to address requires coordinates')
          }
        }
      }

      await orderAddressRecord.update(parsedAddressUpdate, { transaction })

      if (magento) {
        if (orderAddressRecord.magento) {
          await orderAddressRecord.magento.update(magento, { transaction })
        } else {
          orderAddressRecord.magento = await this.createMagento(orderAddressRecord.id, magento, transaction)
        }
      }
      await commit()
      return orderAddressRecord
    } catch (error) {
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }

  /**
   * upsert(insert or create) order address record in DB. Will update/create magento record if provided. magento address externalId is required
   * @param {unknown} orderAddressData - update data for orderAddress record
   * @returns {OrderAddress} updated or created OrderAddress object with Magento Record if available
   */
  static async upsert(orderAddressData: unknown, t?: Transaction): Promise<OrderAddress> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      let magento: OrderAddressMagentoRecord | undefined
      if (orderAddressData && typeof orderAddressData === 'object' && 'magento' in orderAddressData) {
        magento = validateOrderAddressMagento(orderAddressData.magento)
      }
      if (!magento) {
        throw new Error('Magento record is required for upsert')
      }
      const addressRecord = await OrderAddress.findOne({
        include: [{
          association: 'magento',
          where: {
            externalId: magento.externalId,
          },
        }],
        transaction,
      })

      let result: OrderAddress & { magento?: MagentoOrderAddress }
      if (!addressRecord) {
        result = await this.create(orderAddressData, transaction)
      } else {
        result = await this.update(addressRecord.id, orderAddressData, transaction)
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
   * delete orderAddress record with a given id from DB.
   * @param {number | unknown} id - orderAddressId
   * @returns {boolean} true if orderAddress was deleted.
   */
  static async delete(id: number | unknown, t?: Transaction): Promise<boolean> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const orderAddressId = isId.validateSync(id)
      const final = await OrderAddress.destroy({
        where: {
          id: orderAddressId,
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
   * delete corresponding orderAddress Magento record with a given orderAddressID from DB.
   * @param {number | unknown} orderAddressId - orderAddressId to delete
   * @returns {OrderAddressMagentoRecord | null} AddressMagentoRecord that was deleted or null if record did not exist.
   */
  static async deleteMagento(orderAddressId: number | unknown, t?: Transaction): Promise<OrderAddressMagentoRecord | null> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const id = isId.validateSync(orderAddressId)
      const record = await this.get(id, transaction)
      let magento: OrderAddressMagentoRecord | null = null

      if (record && record.magento) {
        magento = record.magento.toJSON()
        await record.magento.destroy({ transaction })
      }
      await commit()
      return magento
    } catch (error) {
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }

  /**
   * create address Magento record for the given ID.
   * @param {number | unknown} orderAddressId id of the address that needs magento data inserted
   * @param {OrderAddressMagentoRecord | unknown} addressMagentoData magento record to add
   * @returns {OrderMagentoAddress} OrderMagentoAddress instance that was created
   */
  static async createMagento(orderAddressId: number | unknown, addressMagentoData: OrderAddressMagentoRecord | unknown, t?: Transaction): Promise<MagentoOrderAddress> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const magento = validateOrderAddressMagento(addressMagentoData)
      const id = isId.validateSync(orderAddressId)
      magento.orderAddressId = id
      const record = await MagentoOrderAddress.create(magento, { transaction })
      await commit()
      return record
    } catch (error) {
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }
}
// done: get address (by id)
// get all address by orderId
// done: create address
// done: update address
// done: delete address

// done: delete magento record
// done: create magento record

// done: upsert address (magento record with externalID is required)

// import * as yup from 'yup'
// import { Transaction } from 'sequelize'
// import db from '../..'
// // import type { OrderAddessShape } from '../../models'
// import { MagentoAddressType, MagentoOrderAddress } from '../MagentoOrderAddress/magentoOrderAddress'
// import { OrderAddress } from './orderAddress'
// import { Order } from '../Order/order'
// // import { printYellowLine } from '../../../utils/utils'

// type MagentoOrderAddressRequired = {
//   externalId: number
//   externalOrderId: number
//   addressType: MagentoAddressType
// }

// type MagentoOrderAddressOptional = {
//   externalCustomerAddressId?: number | null
// }

// type MagentoOrderAddressShape = MagentoOrderAddressRequired & MagentoOrderAddressOptional

// type OrderAddressCreate = {
//   id?: number
// }

// type OrderAddressRequired = {
//   firstName: string
//   lastName: string
//   city: string
//   state: string
//   zipCode: string
//   country: string
//   phone: string
// }

// type OrderAddressOptional = {
//   altPhone?: string | null
//   notes?: string | null
//   company?: string | null
//   coordinates?: [number, number] | null
//   street?: string[]
//   street1?: string
//   street2?: string | null
//   longitude?: number | null
//   latitude?: number | null
//   // foreign key to order
//   orderId?: number
//   // foreign key to keep record which address it was copied from.
//   customerAddressId?: number | null
//   magento?: MagentoOrderAddressShape
// }

// export type OrderAddressShape = OrderAddressCreate & OrderAddressRequired & OrderAddressOptional

// const magentoOrderAddressSchema: yup.ObjectSchema<MagentoOrderAddressShape> = yup.object({
//   // required
//   externalId: yup.number().integer().required(),
//   externalOrderId: yup.number().integer().required(),
//   addressType: yup
//     .string<MagentoAddressType>()
//     .oneOf(['shipping', 'billing'])
//     .label('Malformed data: type addressType')
//     .required(),
//   // optionals
//   externalCustomerAddressId: yup.number().integer().nullable(),
// })

// const orderAddressSchema: yup.ObjectSchema<OrderAddressShape> = yup.object({
//   // required
//   firstName: yup.string().required(),
//   lastName: yup.string().defined(),
//   city: yup.string().required(),
//   state: yup.string().required(),
//   zipCode: yup.string().required(),
//   country: yup.string().required(),
//   phone: yup.string().required(),
//   // optionals
//   altPhone: yup.string().nullable(),
//   notes: yup.string().nullable(),
//   company: yup.string().nullable(),
//   street: yup.array().min(1).max(2).of(yup.string().required()),
//   street1: yup.string(),
//   street2: yup.string().nullable(),
//   longitude: yup.number().nullable(),
//   latitude: yup.number().nullable(),
//   coordinates: yup.tuple([yup.number().required(), yup.number().required()]).nullable(),
//   orderId: yup.number().integer(),
//   customerAddressId: yup.number().integer(),
//   id: yup.number().integer().nonNullable(),
//   magento: magentoOrderAddressSchema,
// })

// export function validateOrderAddress(maybeAddress: unknown): OrderAddressShape {
//   const address = orderAddressSchema.validateSync(maybeAddress, {
//     stripUnknown: true,
//   }) satisfies OrderAddressShape
//   return address
// }

// type OrderAddressJSON =
// {
//   id?: number
//   firstName: string
//   lastName: string
//   company?: string | null
//   street?: string[]
//   city: string
//   state: string
//   zipCode: string
//   country: string
//   phone: string
//   altPhone?: string | null
//   notes?: string | null
//   coordinates?: [number, number] | null
//   magento?: MagentoOrderAddressShape
//   // ASSOCIATIONS:
//   // orderId?:
//   // order?: NonAttribute<Order>
//   // foreign key to keep record which address it was copied from.
//   // customerAddressId?:
//   // routeStops?: NonAttribute<RouteStop[]>
// }

// function cleanUpAddress(address: OrderAddressShape | OrderAddress): OrderAddressJSON {
//   let result: OrderAddressShape
//   if (address instanceof OrderAddress) {
//     result = address.toJSON() satisfies OrderAddressShape
//   } else {
//     result = address
//   }
//   delete result.longitude
//   delete result.latitude
//   delete result.street1
//   delete result.street2
//   // delete result.orderId
//   // delete result.customerAddressId
//   const streetAddress = result.street || []
//   const coordinates = result.coordinates || null
//   let magento: MagentoOrderAddressShape | undefined
//   if (result.magento && result.magento?.externalId) {
//     // if externalId exists - it's a valid magento object
//     const temp = { ...result.magento }
//     // delete temp.orderAddressId
//     magento = temp
//   } else {
//     magento = undefined
//   }

//   const finalAddress: OrderAddressJSON = {
//     ...result,
//     street: streetAddress,
//     coordinates,
//     magento,
//   }
//   return finalAddress
// }

// export default class OrderAddressController {
// /**
//  * create or update Order Address Record (must have Magento info).
//  * @param magentoAddress - Address
//  * @param orderInstanceOrId - orderId or Order instance to which to assign the address
//  * @param t - transaction. If transaction is not provided, method will create its own transaction for this operation
//  * @returns Order Address Instance with Magento record or null if there was a rollback and no transaction provided.
//  */
//   static async upsertMagentoAddress(magentoAddress: OrderAddressShape, orderInstanceOrId?: Order | number, t?: Transaction): Promise<OrderAddress & { magento: MagentoOrderAddress } | null> {
//     let transaction: Transaction
//     if (t) {
//       transaction = t
//     } else {
//       transaction = await db.transaction()
//     }

//     // extract orderId if it was provided
//     let orderId: number | null = null
//     if (orderInstanceOrId instanceof Order) {
//       orderId = orderInstanceOrId.id
//     }
//     if (typeof orderInstanceOrId === 'number' && Number.isFinite(orderInstanceOrId)) {
//       orderId = orderInstanceOrId
//     }

//     try {
//       if (!magentoAddress.magento) {
//         throw new Error('magento record was not provided')
//       }

//       const address: OrderAddressShape = {
//         ...magentoAddress,
//         magento: {
//           ...magentoAddress.magento,
//         },
//       }

//       if (!address.magento) {
//         throw new Error('magento record was not provided')
//       }

//       if (orderId) {
//         address.orderId = orderId
//       }

//       let addressRecord = await OrderAddress.findOne({
//         transaction,
//         include: [{
//           association: 'magento',
//           where: {
//             externalId: address.magento.externalId,
//           },
//         }],
//       })

//       if (addressRecord) {
//         // if the address already existed, update it:
//         // need to provide address id for upsert to update properly
//         address.id = addressRecord.id

//         // update order record
//         await OrderAddress.update(address, {
//           transaction,
//           where: {
//             id: addressRecord.id,
//           },
//           // fields: [
//           //   'id', 'firstName', 'lastName', 'company', 'street1', 'street2',
//           //   'city', 'state', 'zipCode', 'country', 'phone', 'altPhone', 'notes',
//           //   'longitude', 'latitude', 'coordinates', 'street', 'orderId', 'customerAddressId'],
//         })

//         await MagentoOrderAddress.update(address.magento, {
//           transaction,
//           where: {
//             externalId: magentoAddress.magento.externalId,
//           },
//         })
//       } else {
//         // create new address
//         addressRecord = await OrderAddress.create(magentoAddress, {
//           transaction,
//           include: 'magento',
//         })
//         if (!addressRecord) {
//           throw new Error('Error encountered while creating the order address')
//         }
//       }

//       addressRecord = await OrderAddress.findOne({
//         transaction,
//         include: [{
//           association: 'magento',
//           where: {
//             externalId: address.magento.externalId,
//           },
//         }],
//       })

//       if (!t) {
//         // if no transaction was provided, commit the local transaction:
//         await transaction.commit()
//       }
//       return addressRecord as (OrderAddress & { magento: MagentoOrderAddress }) | null
//       // return orderAddressRecord
//     } catch (error) {
//       // if the t transaction was passed to the method, throw error again
//       // to be processed by another
//       if (t) {
//         throw error
//       }
//       console.log('error occured: ', error, 'rolling back transaction')
//       await transaction.rollback()
//       return null
//     }
//   }

//   /**
//    * convert ModelInstance to JSON object and clean up fields
//    * @param address - OrderAddress instance
//    * @returns JSON orderAddress with magento data, if exists
//    */
//   static toJSON(address: OrderAddress | null | undefined) {
//     if (!address) {
//       return null
//     }
//     const addressJson = address.toJSON()
//     return cleanUpAddress(addressJson)
//   }
// }
