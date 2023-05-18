import * as yup from 'yup'
import { InferAttributes, Transaction } from 'sequelize'
import { MagentoCustomer } from '../MagentoCustomer/magentoCustomer'
import { Customer } from './customer'
import { printYellowLine, useTransaction } from '../../../utils/utils'

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
  externalGroupId: number
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
  externalGroupId: yup.number().integer().required().label('Malformed data: magento > externalGroupId field'),
  isGuest: yup.boolean().required().label('Malformed data: magento > isGuest field'),
  email: yup.string()
    .email()
    .required()
    .label('Malformed data: magento > email field'),
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

const customerSchemaCreate: yup.ObjectSchema<CustomerCreate> = yup.object({
  // firstName: string
  // lastName: string
  // phone: string
  firstName: yup.string()
    .label('Malformed data: first name field')
    .required(),
  lastName: yup.string()
    .label('Malformed data: last name field')
    .defined(),
  phone: yup.string()
    .min(10)
    .label('Malformed data: phone field')
    .required(),

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
  id: yup.number().integer(),
  // createdAt: Date
  // updatedAt: Date
  createdAt: yup.date().label('Malformed data: createdAt field'),
  updatedAt: yup.date().label('Malformed data: updatedAt field'),
  // magento: yup.lazy((value: CustomerMagentoRecord | undefined) => {
  //   if (value) {
  //     // If the magento field exists, validate its structure
  //     return customerMagentoSchema
  //   }
  //   // If the magento field is not provided, ignore it
  //   return yup.mixed().notRequired()
  // }),
})

type RequiredExceptFor<T, K extends keyof T> = Omit<T, K> & {
  [P in K]+?: T[P]
};

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

export function validateCustomerMagento(object: unknown): CustomerMagentoRecord {
  const magento = customerMagentoSchema.validateSync(object, {
    stripUnknown: true,
    abortEarly: false,
  }) satisfies CustomerMagentoRecord
  return magento
}

function customerToJson(customer: Customer): CustomerMagentoRead {
  let magento: InferAttributes<MagentoCustomer, { omit: never }> | undefined
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

  static async insertCustomer(customer: unknown, t?: Transaction): Promise<Customer> {
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
        return result
      }
      throw new Error('Internal Error: customer was not created')
    } catch (error) {
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }
}
