import * as yup from 'yup'
import { InferAttributes, Transaction } from 'sequelize'
import { MagentoCustomer } from '../MagentoCustomer/magentoCustomer'
import { Customer } from './customer'
import { useTransaction } from '../../../utils/utils'

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
  externalGroupId: yup.number().integer().required().label('Malformed data: externalGroupId field'),
  isGuest: yup.boolean().required().label('Malformed data: isGuest field'),
  email: yup.string()
    .email()
    .required()
    .label('Malformed data: email field'),
  externalCustomerId: yup
    .number()
    .integer()
    .nullable()
    .default(null)
    .label('Malformed data: externalCustomerId field'),
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

export function validateCustomerCreate(object: unknown): CustomerCreate {
  const customer = customerSchemaCreate.validateSync(object, {
    stripUnknown: true,
    abortEarly: false,
  }) satisfies CustomerCreate
  return customer
}

export default class CustomerController {
  /**
   * convert CustomerInstance to a regular JSON object
   * @param data - Customer, array of order Comments or null
   * @returns {CustomerRead | CustomerRead[] | null} JSON format nullable.
   */
  static toJSON(data: Customer | Customer[] | null): CustomerRead | CustomerRead[] | null {
    try {
      if (data instanceof Customer) {
        let magento: InferAttributes<MagentoCustomer, { omit: never }> | undefined
        if (data.magento && data.magento instanceof MagentoCustomer) {
          const magentoInstance = data.magento as MagentoCustomer
          magento = magentoInstance.toJSON()
        }
        const customerData = data.toJSON()
        const result = {
          ...customerData,
          magento,
        }
        return result
      }
      if (Array.isArray(data)) {
        return data.map((comment) => comment.toJSON())
      }
      return null
    } catch (error) {
      return null
    }
  }

  static async insertCustomer(comment: unknown, t?: Transaction): Promise<Customer> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const parsedCustomer = validateCustomerCreate(comment)
      const result = await Customer.create(parsedCustomer, {
        transaction,
      })
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
