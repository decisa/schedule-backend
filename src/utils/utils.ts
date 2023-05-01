import { parseISO } from 'date-fns'
import { OrderStatus } from '../models/Sales/MagentoOrder/magentoOrder'
import { BrandShape } from '../models/models'

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
 * Helper function that takes date string in ISO format or Date object and returns DateObject.
 * Will throw an exception if string is not in ISO format.
 * Will automatically add Z to the end if it's missing.
 * @param {string | Date} stringOrDate - date in string format or date object
 * @returns {Date} Date object
 */
export function getDate(stringOrDate: string | Date): Date {
  if (stringOrDate instanceof Date) {
    return stringOrDate
  }
  let stringDate = stringOrDate
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?(\+00:00|Z)?$/.test(stringDate)) {
    console.log('trying to convert:', stringDate, typeof stringDate)
    throw new Error('Invalid ISO date format')
  }
  // Check if the string ends with "Z", and add it if it's missing
  if (!stringDate.endsWith('Z')) {
    stringDate += 'Z'
  }
  return parseISO(stringDate)
}

/**
 * Typeguard function that takes status string and returns proper order status or 'unknown'
 * @param {string} status - order status string
 * @returns {string} valid order status or 'unknown'
 */
export function getOrderStatus(status: string): OrderStatus {
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
