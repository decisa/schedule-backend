import * as yup from 'yup'
import { InferAttributes, Transaction } from 'sequelize'
import { MagentoCustomer } from '../MagentoCustomer/magentoCustomer'
import { Customer } from './customer'
import {
  isEmail, isId, isObjectWithEmail, printYellowLine, useTransaction,
} from '../../../utils/utils'

type CustomerCreational = {
  id: number
}

type CustomerRequired = {
  firstName: string
  lastName: string
  phone: string
}

type CustomerOptional = {
  company: string | null
  altPhone: string | null
  email: string | null
  defaultShippingId: number | null
}

type CustomerTimeStamps = {
  createdAt: Date
  updatedAt: Date
}

type CustomerAssociations = {
  magento?: CustomerMagentoRecord | null
  // orders?: Order[]
  // addresses?: Address[]
}

type CustomerMagentoRecord = {
  externalGroupId: number | null
  isGuest: boolean
  email: string
  externalCustomerId: number | null
}

// Note: DATA TYPES
export type CustomerCreate =
  Partial<CustomerCreational>
  & Required<CustomerRequired>
  & Partial<CustomerOptional>
  & Partial<CustomerTimeStamps>
  // & Partial<CustomerAssociations>

const customerMagentoSchema: yup.ObjectSchema<CustomerMagentoRecord> = yup.object({
  externalGroupId: yup
    .number()
    .integer()
    .nullable()
    .required()
    .label('Malformed data: magento > externalGroupId'),
  isGuest: yup.boolean().required().label('Malformed data: magento > isGuest'),
  email: yup.string()
    .email()
    .required()
    .label('Malformed data: magento > email '),
  externalCustomerId: yup
    .number()
    .nullable()
    .when('isGuest', {
      is: true,
      then: (schema) => schema.default(null).oneOf([null]).label('Malformed data: magento > externalCustomerId for guests must be null'),
      otherwise: (schema) => schema.integer().required().label('Malformed data: magento > externalCustomerId for non guests'),
    })
    .defined()
    // .integer()
    // .nullable()
    // .default(null)
  ,
})

const customerMagentoUpdateSchema: yup.ObjectSchema<Partial<CustomerMagentoRecord>> = yup.object({
  externalGroupId: yup.number().integer().nullable().label('Malformed data: magento > externalGroupId'),
  isGuest: yup.boolean().nonNullable().label('Malformed data: magento > isGuest'),
  email: yup.string()
    .email()
    .nonNullable()
    .label('Malformed data: magento > email '),
  externalCustomerId: yup
    .number()
    .nullable()
    // .when('isGuest', {
    //   is: true,
    //   then: (schema) => schema.default(null).oneOf([null]).label('Malformed data: magento > externalCustomerId for guests must be null'),
    //   otherwise: (schema) => schema.integer().required().label('Malformed data: magento > externalCustomerId for non guests'),
    // })
    // .defined()
    // .integer()
    // .nullable()
    // .default(null)
  ,
})

const customerSchemaCreate: yup.ObjectSchema<CustomerCreate> = yup.object({
  // firstName: string
  // lastName: string
  // phone: string
  firstName: yup.string()
    .label('Malformed data: firstName')
    .required(),
  lastName: yup.string()
    .label('Malformed data: lastName')
    .defined(),
  phone: yup.string()
    .min(10)
    .label('Malformed data: phone')
    .required(),
  // company: string | null
  // altPhone: string | null
  // email: string | null
  // defaultShippingId: number | null
  company: yup.string()
    .nullable()
    .label('Malformed data: company'),
  altPhone: yup.string()
    .min(10)
    .nullable()
    .label('Malformed data: altPhone'),
  email: yup.string()
    .email()
    .nullable()
    .label('Malformed data: email'),
  defaultShippingId: yup.number().integer().nullable().label('Malformed data: defaultShippingId'),
  // id: number
  id: yup.number().integer(),
  // createdAt: Date
  // updatedAt: Date
  createdAt: yup.date().label('Malformed data: createdAt'),
  updatedAt: yup.date().label('Malformed data: updatedAt'),
})

const customerSchemaUpdate: yup.ObjectSchema<Partial<CustomerCreate>> = yup.object({
  // firstName: string
  // lastName: string
  // phone: string
  firstName: yup.string()
    .label('Malformed data: first name field')
    .nonNullable(),
  lastName: yup.string()
    .label('Malformed data: last name field')
    .nonNullable(),
  phone: yup.string()
    .min(10)
    .label('Malformed data: phone field')
    .nonNullable(),
  // company: string | null
  // altPhone: string | null
  // email: string | null
  // defaultShippingId: number | null
  company: yup.string()
    .nullable()
    .label('Malformed data: company field'),
  altPhone: yup.string()
    .min(10)
    .nullable()
    .label('Malformed data: altPhone field'),
  email: yup.string()
    .email()
    .nullable()
    .label('Malformed data: email field'),
  defaultShippingId: yup.number().integer().nullable().label('Malformed data: defaultShippingId field'),
  // id: number
  id: yup.number().integer().nonNullable(),
  // createdAt: Date
  // updatedAt: Date
  createdAt: yup.date().label('Malformed data: createdAt field').nonNullable(),
  updatedAt: yup.date().label('Malformed data: updatedAt field').nonNullable(),
})

// type RequiredExceptFor<T, K extends keyof T> = Omit<T, K> & {
//   [P in K]+?: T[P]
// };

export type CustomerRead = Required<CustomerCreate>

export type CustomerMagentoRead = CustomerRead & {
  magento?: CustomerMagentoRecord
}

export function validateCustomerCreate(object: unknown): CustomerCreate {
  const customer = customerSchemaCreate.validateSync(object, {
    stripUnknown: true,
    abortEarly: false,
  }) satisfies CustomerCreate
  return customer
}

export function validateCustomerUpdate(object: unknown): Partial<CustomerCreate> {
  // restrict update of id, and creation or modification dates
  const customer = customerSchemaUpdate.omit(['createdAt', 'updatedAt', 'id']).validateSync(object, {
    stripUnknown: true,
    abortEarly: false,
  }) satisfies Partial<CustomerCreate>
  return customer
}

export function validateCustomerMagento(object: unknown): CustomerMagentoRecord {
  const magento = customerMagentoSchema.validateSync(object, {
    stripUnknown: true,
    abortEarly: false,
  }) satisfies CustomerMagentoRecord
  return magento
}

export function validateCustomerMagentoUpdate(object: unknown): Partial<CustomerMagentoRecord> {
  const magento = customerMagentoUpdateSchema.validateSync(object, {
    stripUnknown: true,
    abortEarly: false,
  }) satisfies Partial<CustomerMagentoRecord>
  return magento
}

function customerToJson(customer: Customer): CustomerMagentoRead {
  let magento: CustomerMagentoRecord | undefined // InferAttributes<MagentoCustomer, { omit: never }> | undefined
  if (customer.magento && customer.magento instanceof MagentoCustomer) {
    magento = customer.magento.toJSON()
  }
  const customerData = customer.toJSON()
  const result = {
    ...customerData,
    magento,
  }
  return result
}
export default class CustomerController {
  /**
   * convert CustomerInstance to a regular JSON object
   * @param data - Customer, array of order Comments or null
   * @returns {CustomerRead | CustomerRead[] | null} JSON format nullable.
   */
  static toJSON(data: Customer | Customer[] | null): CustomerMagentoRead | CustomerMagentoRead[] | null {
    try {
      if (data instanceof Customer) {
        return customerToJson(data)
      }
      if (Array.isArray(data)) {
        return data.map(customerToJson)
      }
      return null
    } catch (error) {
      return null
    }
  }

  /**
   * get customer record by id from DB. Will include magento record if available
   * @param {unknown} id - customerId
   * @returns {Customer} Customer object or null
   */
  static async get(id: number | unknown, t?: Transaction): Promise<Customer | null> {
    const customerId = isId.validateSync(id)
    const final = await Customer.findByPk(customerId, { include: 'magento', transaction: t })
    return final
  }

  /**
   * get customer record by email from DB. Will include magento record if available
   * @param {unknown} params - object with email field
   * @returns {Customer} Customer object or null
   */
  static async getByEmail(params: string | unknown, t?: Transaction): Promise<Customer | null> {
    const { email } = isObjectWithEmail.validateSync(params)
    const customerRecord = await Customer.findOne({
      where: {
        email,
      },
      include: 'magento',
      transaction: t,
    })
    return customerRecord
  }

  /**
   * insert customer record to DB. Will include magento record if provided.
   * @param {unknown} customer - customer record to insert to DB
   * @returns {Customer} Customer object or throws error
   */
  static async create(customer: unknown, t?: Transaction): Promise<Customer> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      let magento: CustomerMagentoRecord | undefined
      if (customer && typeof customer === 'object' && 'magento' in customer) {
        magento = validateCustomerMagento(customer.magento)
      }
      const parsedCustomer = validateCustomerCreate(customer)

      const result: Customer | null = await Customer.create(parsedCustomer, {
        transaction,
      })

      if (result && magento) {
        const x = await result.createMagento(magento, { transaction })
        result.magento = x
      }
      if (result) {
        await commit()
        // return result
        const final = await this.get(result.id, transaction) // Customer.findByPk(result.id, { include: 'magento', transaction })
        if (final) {
          return final
        }
      }
      throw new Error('Internal Error: customer was not created')
    } catch (error) {
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }

  /**
   * update customer record in DB. Will update magento record if provided.If magento record does not exist in DB, it will be created
   * @param {number | unknown} customerId - id of the customer record to update in DB
   * @param {unknown} customer - update data for customer record
   * @returns {Customer} Updated Customer object or throws error
   */
  static async update(customerId: number | unknown, customer: unknown, t?: Transaction): Promise<Customer> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      let magento: Partial<CustomerMagentoRecord> | undefined
      if (customer && typeof customer === 'object' && 'magento' in customer) {
        magento = validateCustomerMagentoUpdate(customer.magento)
        // console.log('magento record to update: ', magento)
      }
      const parsedCustomer = validateCustomerUpdate(customer)

      // console.log('parsed customer', parsedCustomer)
      const id = isId.validateSync(customerId)
      const customerRecord = await Customer.findByPk(id, { include: 'magento', transaction })
      if (!customerRecord) {
        throw new Error('customer does not exist')
      }

      await customerRecord.update(parsedCustomer, { transaction })

      if (magento) {
        if (customerRecord.magento) {
          await customerRecord.magento.update(magento, { transaction })
        } else {
          // if magento record did not exist prior to update - create one
          if (customerRecord.email !== magento.email) {
            throw new Error('Magento email record should match the customer')
          }
          customerRecord.magento = await this.createMagento(magento, transaction)
        }
      }
      await commit()
      return customerRecord
    } catch (error) {
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }

  /**
   * upsert(insert or create) customer record in DB. Will update/create magento record if provided. email is required
   * @param {unknown} customerData - update data for customer record
   * @returns {Customer} Updated Or Created Customer object with Magento Record if available
   */
  static async upsert(customerData: unknown, t?: Transaction): Promise<Customer> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const customerRecord = await this.getByEmail(customerData, transaction)

      let result: Customer
      if (!customerRecord) {
        result = await this.create(customerData, transaction)
      } else {
        result = await this.update(customerRecord.id, customerData, transaction)
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
   * delete customer record with a given id from DB.
   * @param {unknown} id - customerId
   * @returns {number} number of objects deleted.
   */
  static async delete(id: number | unknown, t?: Transaction): Promise<boolean> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const customerId = isId.validateSync(id)
      const final = await Customer.destroy({
        where: {
          id: customerId,
        },
        transaction,
      })
      console.log('deletion result: ', final)
      await commit()
      return final === 1
    } catch (error) {
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }

  /**
   * delete customer Magento record with a given email from DB.
   * @param {unknown} email - customer's email
   * @returns {CustomerMagentoRecord | null} CustomerMagentoRecord that was deleted or null if record did not exist.
   */
  static async deleteMagento(customerEmail: string | unknown, t?: Transaction): Promise<CustomerMagentoRecord | null> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const { email } = isObjectWithEmail.validateSync(customerEmail)
      const record = await MagentoCustomer.findByPk(email, { transaction })
      let final = 0

      if (record) {
        final = await MagentoCustomer.destroy({
          where: {
            email,
          },
          transaction,
        })
      }
      await commit()
      return final === 1 ? record : null
    } catch (error) {
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }

  /**
   * create customer Magento record with a given email.
   * @param {unknown} magentoData magento record to add
   * @returns {MagentoCustomer} MagentoCustomer instance that was created
   */
  static async createMagento(magentoData: CustomerMagentoRecord | unknown, t?: Transaction): Promise<MagentoCustomer> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const magento = validateCustomerMagento(magentoData)
      const record = await MagentoCustomer.create(magento, { transaction })
      await commit()
      return record
    } catch (error) {
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }

  // done: get customer
  // done: create customer
  // done: update customer
  // done: delete customer
  // done: delete magento record
  // done: create magento record
  // done: upsert customer (email required)
  // add address
  // get all addresses
}
