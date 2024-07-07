import * as yup from 'yup'
import { Transaction } from 'sequelize'
import {
  isId, printRedLine, printYellowLine, useTransaction,
} from '../../../utils/utils'
import { MagentoAddress, MagentoAddressType, magentoAddressTypes } from '../MagentoAddress/magentoAddress'
import { Address } from './Address'
import { DBError } from '../../../ErrorManagement/errors'

const addressTypes = ['order', 'customer'] as const
export type AddressType = typeof addressTypes[number]

type AddressCreational = {
  id: number
}

// street1 is required but will be addressed later
type AddressRequired = {
  type: AddressType
  firstName: string
  lastName: string
  city: string
  state: string
  zipCode: string
  country: string
  phone: string
}

type AddressOptional = {
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

type AddressTimeStamps = {
  createdAt: Date
  updatedAt: Date
}

type AddressFK = {
  customerId: number | null
  orderId: number | null
  customerAddressId: number | null
}

type AddressMagentoRecord = {
  externalId: string | number
  addressType: MagentoAddressType
  addressId: number
}

type AddressMagentoRecordRead = Omit<Required<AddressMagentoRecord>, 'externalId'> & {
  externalId: string
}

// type AddressAssociations = {
//   customer?: Customer
//   magento?: AddressMagentoRecord | null
// }

// Note: DATA TYPES
export type AddressCreate =
  Partial<AddressCreational>
  & Required<AddressRequired>
  & Partial<AddressOptional>
  & Partial<AddressTimeStamps>
  & AddressFK
  // & Partial<AddressAssociations>
export type AddressRead = Required<AddressCreate> // & AddressFK

export type AddressMagentoRead = Omit<AddressRead, 'latitude' | 'longitude' | 'street1' | 'street2'> & {
  magento?: AddressMagentoRecordRead
}

const addressMagentoSchema: yup.ObjectSchema<AddressMagentoRecord> = yup.object({
  // externalId: number
  // addressType: MagentoAddressType
  // addressId: number
  externalId: yup.lazy((value) => {
    if (typeof value === 'number') {
      return yup.number()
        .integer()
        .positive()
        .nonNullable()
        .required()
        .label('Malformed data: magento > externalId')
    }
    return yup.string()
      .nonNullable()
      .required()
      .label('Malformed data: magento > externalId')
  }),
  addressType: yup
    .mixed<MagentoAddressType>()
    .oneOf(magentoAddressTypes)
    .label('Malformed data: magento > addressType')
    .required(),
  addressId: yup.number()
    .integer()
    .positive()
    .nonNullable()
    .required()
    .label('Malformed data: magento > addressId'),
})

const addressMagentoUpdateSchema: yup.ObjectSchema<Partial<Omit<AddressMagentoRecord, 'addressId'>>> = yup.object({
  // externalId: number
  // addressType: MagentoAddressType
  // addressId: number
  externalId: yup.lazy((value) => {
    if (typeof value === 'number') {
      return yup.number()
        .integer()
        .positive()
        .nonNullable()
        .label('Malformed data: magento > externalId')
    }
    return yup.string()
      .nonNullable()
      .label('Malformed data: magento > externalId')
  }),
  addressType: yup
    .mixed<MagentoAddressType>()
    .oneOf(magentoAddressTypes)
    .label('Malformed data: magento > addressType')
    .nonNullable(),
  addressId: yup.number()
    .integer()
    .positive()
    .nonNullable()
    .label('Malformed data: magento > addressId'),
})

// when data is sent to DB, all virtual fields like street[] and coordinates, should be converted
// to their respective street1 & street2 and latitude & longitude
const addressSchemaCreate: yup.ObjectSchema<AddressCreate> = yup.object({
  // AddressFK
  // customerId: number
  customerId: yup
    .number()
    .integer()
    .positive()
    .nullable()
    .default(null)
    .label('Malformed data: customerId'),
  orderId: yup
    .number()
    .integer()
    .positive()
    .nullable()
    .default(null)
    .label('Malformed data: orderId'),
  customerAddressId: yup
    .number()
    .integer()
    .positive()
    .nullable()
    .default(null)
    .label('Malformed data: customerAddressId'),
  // required
  // type: AddressType
  // firstName: string
  // lastName: string
  // phone: string
  // street1: string
  // street: string[]
  // city: string
  // state: string
  // zipCode: string
  // country: string
  type: yup
    .mixed<AddressType>()
    .oneOf(addressTypes)
    .label('Malformed data: address type')
    .required(),
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
  street2: yup.string().nullable(),
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

const addressSchemaUpdate: yup.ObjectSchema<Partial<AddressCreate>> = addressSchemaCreate.clone()
  .shape({
    type: yup
      .mixed<AddressType>()
      .oneOf(addressTypes)
      .label('Malformed data: address type')
      .nonNullable(),
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
  })

// type RequiredExceptFor<T, K extends keyof T> = Omit<T, K> & {
//   [P in K]+?: T[P]
// };

function extractAddressType(address: unknown): AddressType {
  const { type } = addressSchemaCreate.pick(['type']).validateSync(address, {
    stripUnknown: true,
    abortEarly: true,
  }) satisfies { type: AddressType }
  return type
}

export function validateAddressCreate(object: unknown): Omit<AddressCreate, 'street' | 'coordinates' | 'street1' | 'id'> & { street1: string } {
  const address = addressSchemaCreate.omit(['id']).validateSync(object, {
    stripUnknown: true,
    abortEarly: false,
  }) satisfies AddressCreate

  // check type: customer vs order
  if (address.type === 'order') {
    if (!address.orderId) {
      throw new Error('Malformed data: orderId is required for order address')
    }
    address.customerId = null
  }

  if (address.type === 'customer') {
    if (!address.customerId) {
      throw new Error('Malformed data: customerId is required for customer address')
    }
    address.orderId = null
    address.customerAddressId = null
  }

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

export function validateAddressUpdate(object: unknown): Omit<Partial<AddressCreate>, 'createdAt' | 'updatedAt' | 'id' | 'street' | 'coordinates'> {
  // restrict update of id, and creation or modification dates
  const address = addressSchemaUpdate.omit(['createdAt', 'updatedAt', 'id']).validateSync(object, {
    stripUnknown: true,
    abortEarly: false,
  }) satisfies Partial<AddressCreate>

  // check type: customer vs order
  if (address.type === 'order') {
    if (!address.orderId) {
      throw new Error('Malformed data: orderId is required for order address')
    }
    address.customerId = null
  }

  if (address.type === 'customer') {
    if (!address.customerId) {
      throw new Error('Malformed data: customerId is required for customer address')
    }
    address.orderId = null
    address.customerAddressId = null
  }

  // if type is not provided, cannot update FKs
  if (!address.type) {
    delete address.customerId
    delete address.orderId
    delete address.customerAddressId
  }

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

export function validateAddressMagento(object: unknown): Omit<AddressMagentoRecord, 'addressId'> {
  const magento = addressMagentoSchema.omit(['addressId'])
    .validateSync(object, {
      stripUnknown: true,
      abortEarly: false,
    }) satisfies Omit<AddressMagentoRecord, 'addressId'>
  return magento
}

export function validateAddressMagentoUpdate(object: unknown): Partial<Omit<AddressMagentoRecord, 'addressId'>> {
  const magento = addressMagentoUpdateSchema.validateSync(object, {
    stripUnknown: true,
    abortEarly: false,
  }) satisfies Partial<Omit<AddressMagentoRecord, 'addressId'>>
  return magento
}

function getExternalIdString(externalId: string | number, type: AddressType): string {
  if (typeof externalId === 'number') {
    return `${type}.${externalId}`
  }
  return externalId
}

function addressToJson(address: Address): AddressMagentoRead {
  let magento: AddressMagentoRecordRead | undefined
  if (address.magento && address.magento instanceof MagentoAddress) {
    magento = address.magento.toJSON()
    // delete magento.addressId
  }
  const addressData = address.toJSON()
  const result: AddressMagentoRead & {
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
   * @param {Address} currentAddress - current instance of the Address
   * @param {Partial<AddressCreate>} updatedAddress - object that will act as address update
   * @returns {boolean} true if coordinates need an update
   */
function shouldCoordinatesUpdate(currentAddress: Address, updatedAddress: Partial<AddressCreate>): boolean {
  const fieldsThatChangeCoordinates: (keyof AddressCreate)[] = ['street1', 'city', 'state', 'zipCode', 'country']

  const possiblyChangedFields = fieldsThatChangeCoordinates.filter((fieldName) => updatedAddress[fieldName])

  const changedFields = possiblyChangedFields.filter((fieldName) => currentAddress[fieldName] !== updatedAddress[fieldName])

  printYellowLine()
  console.log('changed fields:', changedFields)

  return changedFields.length > 0
}

export default class AddressController {
  /**
   * convert AddressInstance to a regular JSON object
   * @param data - Addresss, array of Addresses or null
   * @returns {AddressMagentoRead | AddressMagentoRead[] | null} JSON format nullable.
   */
  static toJSON(data: Address): AddressMagentoRead
  static toJSON(data: Address | null): AddressMagentoRead | null
  static toJSON(data: Address[]): AddressMagentoRead[]
  static toJSON(data: Address[] | null): AddressMagentoRead[] | null
  static toJSON(data: null): null
  static toJSON(data: Address | Address[] | null): AddressMagentoRead | AddressMagentoRead[] | null {
    try {
      if (data instanceof Address) {
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
   * get address record by id from DB. Will include magento record if available
   * @param {unknown} id - addressId
   * @returns {Address} Address object or null
   */
  static async get(id: number | unknown, t?: Transaction): Promise<Address | null> {
    const addressId = isId.validateSync(id)
    const final = await Address.findByPk(addressId, { include: 'magento', transaction: t })
    return final
  }

  /**
   * get all addresses associated with a given customerId. Will include magento record if available
   * @param {unknown} id - customerId
   * @returns {Address[]} Address[]
   */
  static async getByCustomerId(customerId: number | unknown, t?: Transaction): Promise<Address[]> {
    const id = isId.validateSync(customerId)
    const final = await Address.findAll({
      where: {
        customerId: id,
        type: 'customer',
      },
      include: 'magento',
      transaction: t,
    })
    return final
  }

  /**
   * get all addresses associated with a given orderId. Will include magento record if available
   * @param {unknown} orderId - orderId
   * @returns {Address[]} Address object or null
   */
  static async getByOrderId(orderId: number | unknown, t?: Transaction): Promise<Address[]> {
    const id = isId.validateSync(orderId)
    const final = await Address.findAll({
      where: {
        orderId: id,
        type: 'order',
      },
      include: 'magento',
      transaction: t,
    })
    return final
  }

  /**
   * insert address record to DB. Will include magento record if provided. address type is required (customer or order)
   * FK addressId will be ignored on magento record and generated automatically.
   * @param {unknown} address - customer address record to insert to DB
   * @returns {Address} Address object or throws error
   */
  static async create(address: unknown, t?: Transaction): Promise<Address> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      // consoleLogBlue('start new address')
      let magento: unknown
      if (address && typeof address === 'object' && 'magento' in address) {
        magento = address.magento
      }
      // console.log('validating address')
      const parsedAddress = validateAddressCreate(address)

      // console.log('creating address', parsedAddress)
      const result: Address | null = await Address.create(parsedAddress, {
        transaction,
      })

      console.log('address created. creating magento')
      if (result && magento) {
        result.magento = await this.createMagento(result.id, magento, transaction)
      }

      if (!result) {
        throw new Error('Internal Error: Address was not created')
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
   * update address record in DB. Will update magento record if provided.If magento record does not exist in DB, it will be created
   * @param {number | unknown} addressId - id of the address record to update in DB
   * @param {unknown} address - update data for address record
   * @returns {address} complete Updated address object or throws error
   */
  static async update(addressId: number | unknown, address: unknown, t?: Transaction): Promise<Address> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      let magento: Partial<AddressMagentoRecord> | undefined
      if (address && typeof address === 'object' && 'magento' in address) {
        magento = validateAddressMagentoUpdate(address.magento)
        // console.log('magento record to update: ', magento)
      }
      const parsedAddressUpdate = validateAddressUpdate(address)

      // console.log('parsed address', parsedaddress)
      const id = isId.validateSync(addressId)
      const addressRecord = await Address.findByPk(id, { include: 'magento', transaction })
      if (!addressRecord) {
        throw new Error('address does not exist')
      }

      if (parsedAddressUpdate.latitude === undefined && addressRecord.latitude) {
        // if new coordinates are not provided and current address has defined coordinates:
        // check if update requires new coordinates:
        if (shouldCoordinatesUpdate(addressRecord, parsedAddressUpdate)) {
          if (parsedAddressUpdate.latitude !== null) {
            throw new Error('Significant change to address requires coordinates')
          }
        }
      }

      await addressRecord.update(parsedAddressUpdate, { transaction })

      if (magento) {
        if (addressRecord.magento) {
          addressRecord.magento = await this.updateMagento(addressRecord.id, magento, transaction)
        } else {
          addressRecord.magento = await this.createMagento(addressRecord.id, magento, transaction)
        }
      }
      await commit()
      return addressRecord
    } catch (error) {
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }

  /**
   * upsert(insert or create) address record in DB. Will update/create magento record if provided. magento address externalId is required
   * @param {unknown} addressData - update data for address record
   * @returns {Address} updated or created Address object with Magento Record if available
   */
  static async upsert(addressData: unknown, t?: Transaction): Promise<Address> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      let magento: Omit<AddressMagentoRecord, 'addressId'> | undefined
      if (addressData && typeof addressData === 'object' && 'magento' in addressData) {
        magento = validateAddressMagento(addressData.magento)
      }
      if (!magento) {
        throw new Error('Magento record is required for upsert')
      }

      const type = extractAddressType(addressData)

      const addressRecord = await Address.findOne({
        include: [{
          model: MagentoAddress,
          as: 'magento',
          where: {
            externalId: getExternalIdString(magento.externalId, type),
          },
        }],
        transaction,
      })

      let result: Address
      if (!addressRecord) {
        printRedLine('create address')
        result = await this.create(addressData, transaction)
      } else {
        printRedLine('update address')
        result = await this.update(addressRecord.id, addressData, transaction)
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
   * delete Address record with a given id from DB.
   * @param {Object} options - The options for deleting an Address record.
   * @param {(number|unknown)} options.id - The ID of the Delivery to delete.
   * @param {string} [options.reason] - (optional) The reason for deleting the Address record.
   * @param {Transaction} [options.transaction] - (optional) The transaction within which to perform the deletion.
   * @returns {Address} Address record that was deleted
   */
  static async delete({
    id,
    reason,
    transaction: t,
  }: {
    id: number | unknown
    reason?: string
    transaction?: Transaction
  }): Promise<Address> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const addressId = isId.validateSync(id)
      const addressRecord = await this.get(addressId, transaction)
      if (!addressRecord) {
        throw DBError.notFound(new Error(`Address with id ${addressId} was not found`))
      }
      printRedLine(`delete address${reason ? `: ${reason}` : ''}`)
      await Address.destroy({
        where: {
          id: addressId,
        },
        transaction,
      })
      await commit()
      return addressRecord
    } catch (error) {
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }

  /**
   * delete Magento record of the address with a given id from DB.
   * @param {Object} options - The options for deleting a Magento address record.
   * @param {(number|unknown)} options.addressId - The ID of the address for which Magento record needs to be deleted.
   * @param {string} [options.reason] - (optional) The reason for deleting the Magento address record.
   * @param {Transaction} [options.transaction] - (optional) The transaction within which to perform the deletion.
   * @returns {AddressMagentoRecordRead} Magento address record that was deleted
   * @throws {DBError} If the address with the given ID does not exist or does not have a Magento record.
   */
  static async deleteMagentoRecord({
    addressId,
    reason,
    transaction: t,
  }:{
    addressId: number | unknown,
    reason?: string,
    transaction?: Transaction
  }): Promise<AddressMagentoRecordRead> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const id = isId.validateSync(addressId)
      const record = await this.get(id, transaction)

      if (!record) {
        throw DBError.notFound(new Error(`Address with id ${id} does not exist`))
      }

      if (!record.magento) {
        throw DBError.notFound(new Error(`Address with id ${id} does not have a Magento record`))
      }
      printRedLine(`delete magento record for address id=${id}${reason ? `: ${reason}` : ''}`)
      const deletedMagentoRecord = record.magento.toJSON()
      await record.magento.destroy({ transaction })

      await commit()
      return deletedMagentoRecord
    } catch (error) {
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }

  /**
   * create address Magento record for the given ID.
   * @param {number | unknown} addressId id of the address that needs magento data inserted
   * @param {AddressMagentoRecord | unknown} magentoData magento record to add
   * @returns {MagentoAddress} MagentoAddress instance that was created
   */
  static async createMagento(addressId: number | unknown, addressMagentoData: AddressMagentoRecord | unknown, t?: Transaction): Promise<MagentoAddress> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const id = isId.validateSync(addressId)
      const magento = validateAddressMagento(addressMagentoData)

      // find the address record
      const addressRecord = await this.get(id, transaction)
      if (!addressRecord) {
        throw DBError.notFound(new Error(`Address with id ${id} does not exist`))
      }
      if (addressRecord.magento) {
        throw DBError.badData(new Error(`Address with id ${id} already has a Magento record`))
      }

      const parsedMagentoRecord = {
        ...magento,
        addressId: id,
        externalId: getExternalIdString(magento.externalId, addressRecord.type),
      }

      const record = await MagentoAddress.create(parsedMagentoRecord, { transaction })
      await commit()
      return record
    } catch (error) {
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }

  /**
   * update address Magento record for the given ID.
   * @param {number | unknown} addressId id of the address that needs magento data updated
   * @param {AddressMagentoRecord | unknown} addressMagentoData magento record to update
   * @returns {MagentoAddress} MagentoAddress instance that was created
   */
  static async updateMagento(addressId: number | unknown, addressMagentoData: AddressMagentoRecord | unknown, t?: Transaction): Promise<MagentoAddress> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const id = isId.validateSync(addressId)
      const currentMagentoRecord = await MagentoAddress.findOne({
        where: {
          addressId: id,
        },
        transaction,
      })
      if (!currentMagentoRecord) {
        throw new Error(`Address with id ${id} does not have a Magento record. Nothing to update`)
      }

      const addressRecord = await this.get(id, transaction)
      if (!addressRecord) {
        throw DBError.notFound(new Error(`Address with id ${id} does not exist`))
      }

      const { type } = addressRecord
      const magento = validateAddressMagento(addressMagentoData)

      const parsedMagentoRecord = {
        ...magento,
        addressId: id,
        externalId: getExternalIdString(magento.externalId, type),
      }
      await currentMagentoRecord.update(parsedMagentoRecord, { transaction })
      await currentMagentoRecord.reload({ transaction }) // MagentoAddress.create(parsedMagentoRecord, { transaction })
      await commit()
      return currentMagentoRecord
    } catch (error) {
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }
}

// done: get address (by id)
// done: create address
// done: update address
// done: delete address

// done: delete magento record
// done: create magento record

// done: upsert address (magento record with externalID is required)
