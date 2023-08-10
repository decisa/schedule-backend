import fs from 'fs'
import * as yup from 'yup'
import { parseISO } from 'date-fns'
import { Transaction } from 'sequelize'
import { OrderStatus } from '../models/Sales/MagentoOrder/magentoOrder'
import { BrandShape } from '../models/models'
import db from '../models'

type EmptyObject = null | undefined | 0 | '' | never[] | Record<string, never>
type NotEmptyObject = Record<string, unknown> | string | number | Date

/**
 * Check if an object is empty.
 * @param obj - The object to check.
 * @returns true if the object is empty, false otherwise.
 */
export function isEmptyObject(obj: unknown): obj is EmptyObject {
  if (obj === null || obj === undefined || obj === '' || obj === 0) {
    return true
  }
  if (typeof obj !== 'object') {
    return false
  }

  if (obj instanceof Date) {
    return false
  }
  return Object.keys(obj).length === 0
}

export function isNotEmptyObject(obj: unknown): obj is NotEmptyObject {
  return !isEmptyObject(obj)
}

export function printYellowLine(str = '') {
  console.log('\x1b[43m%s\x1b[0m', `                                 ${str.split('').join(' ')}                                 `)
}

/**
 * Typeguard that ensures a valid date. Will try to convert a ISO format string to Date.
 * Will automatically add Z to the end if it's missing.
 * Will throw an exception if fails
 * @param {unknown} possiblyDate - unknown type to be converted to Date
 * @param [errMsgStart = ''] - optional string to start error message with
 * @returns {Date} Date object
 */
export function getDateCanThrow(possiblyDate: unknown, errMsgStart = ''): Date {
  if (possiblyDate instanceof Date) {
    return possiblyDate
  }
  if (typeof possiblyDate !== 'string') {
    throw new Error(`${errMsgStart}not a date`)
  }
  let stringDate = possiblyDate
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?(\+00:00|Z)?$/.test(stringDate)) {
    console.log('trying to convert:', stringDate, typeof stringDate)
    throw new Error(`${errMsgStart}Invalid ISO date format`)
  }
  // Check if the string ends with "Z", and add it if it's missing
  if (!stringDate.endsWith('Z')) {
    stringDate += 'Z'
  }
  return parseISO(stringDate)
}

/**
 * Typeguard that ensures a valid finite number. Will try to convert a string to number.
 * Will throw an exception if not a finite number.
 * @param {unknown} value - value to ensure to be a number
 * @param [errMsgStart = ''] - optional string to start error message with
 * @returns {number} if successful - returns a number
 */
export function getFiniteNumberCanThrow(value: unknown, errMsgStart = ''): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  if (typeof value === 'string') {
    // try to convert string to number:
    const converted = Number(value)
    if (Number.isFinite(converted)) {
      return converted
    }
  }
  throw new Error(`${errMsgStart}is not a number`)
}

/**
 * Typeguard that ensures a boolean value. Will try to convert a number 0 or 1.
 * Will throw an exception otherwise
 * @param {unknown} value - value to ensure to be a boolean
 * @param [errMsgStart = ''] - optional string to start error message with
 * @returns {boolean} if successful - returns a boolean
 */
export function getBooleanCanThrow(value: unknown, errMsgStart = ''): boolean {
  if (typeof value === 'boolean') {
    return value
  }
  if (typeof value === 'number') {
    if (value === 0) {
      return false
    }
    if (value === 1) {
      return true
    }
  }
  throw new Error(`${errMsgStart}is not a boolean`)
}

/**
 * Typeguard function that takes status string and returns proper order status or 'unknown'
 * @param {string} status - order status string
 * @returns {string} valid order status or 'unknown'
 */
export function getOrderStatus(status: string): OrderStatus {
  // const orderStatusValues = Object.values(OrderStatus) // Get all enum values
  // if (orderStatusValues.includes(status as OrderStatus)) {
  //   return status as OrderStatus // Use 'as' to assert that status is of type OrderStatus
  // }

  // throw new Error('not an order status')
  if (
    status === 'pending'
    || status === 'processing'
    || status === 'in_production'
    || status === 'in_transit'
    || status === 'preparing_shipment'
    || status === 'complete'
    || status === 'closed'
  ) {
    return status
  }
  return 'unknown'
}

export function parseBrandObject(obj: Record<string, string | number | undefined> | undefined): BrandShape | null {
  let result: BrandShape
  if (obj?.name) {
    result = {
      name: String(obj.name),
    }
    if (typeof obj?.externalId === 'string') {
      const externalId = parseInt(obj.externalId, 10)
      if (Number.isFinite(externalId)) {
        result.externalId = externalId
      }
    }
    if (typeof obj?.externalId === 'number') {
      if (Number.isFinite(obj.externalId)) {
        result.externalId = obj.externalId
      }
    }
    return result
  }
  return null
}

export function parseMagentoBrand(obj: Record<string, string | number | undefined> | undefined): { name: string, externalId: number } | null {
  let brandName: string | null = null
  let externalId: number | null = null
  if (obj?.name) {
    brandName = String(obj.name)

    if (typeof obj?.externalId === 'string') {
      externalId = parseInt(obj.externalId, 10)
    }
    if (typeof obj?.externalId === 'number') {
      externalId = obj.externalId
    }
  }
  if (brandName && externalId && Number.isFinite(externalId)) {
    return {
      name: brandName,
      externalId,
    }
  }
  return null
}

/**
 * helper function to take care of transaction commit and rollback handling
 * @param t - transaction. If transaction is not provided, method will create its own transaction for this operation
 * @returns [transaction, handleCommit, handleRollbackAndRethrow] returns a tuple with existing or new transaction, as well as methods to commit and rollback the transaction
 */
export async function useTransaction(t?: Transaction): Promise<[transaction: Transaction, handleCommit: () => Promise<void>, handleRollback: () => Promise<void>]> {
  let transaction: Transaction
  if (t) {
    // use existing transaction
    transaction = t
  } else {
    // create new transaction
    transaction = await db.transaction()
  }
  const handleRollbackAndRethrow = async () => {
    if (!t) {
      // if transaction was not initiated locally, process rollback right away
      // console.log('error occured: ', error, 'rolling back transaction')
      await transaction.rollback()
    }
  }
  const handleCommit = async () => {
    if (!t) {
      // if no transaction was provided, commit the local transaction:
      await transaction.commit()
    }
  }
  return [transaction, handleCommit, handleRollbackAndRethrow]
}

export const isId = yup.number().integer().required()
export const isString = yup.string().required()
export const isEmail = yup.string().email().required()
export const isObjectWithEmail = yup.object({
  email: yup.string().email().required(),
})

export const isObjectWithExternalId = yup.object({
  externalId: yup.number().min(0).integer().required()
    .label('check for externalId:'),
})

export const isObjectWithExternalIdandConfigId = yup.object({
  externalId: yup.number().min(0).integer().required(),
  configId: yup.number().positive().integer().required(),
})

export function readJsonFromFile<T>(filePath: string):T {
  const fileContent = fs.readFileSync(filePath, 'utf8')
  return JSON.parse(fileContent) as T
}
