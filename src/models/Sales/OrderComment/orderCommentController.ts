import { Transaction, or } from 'sequelize'
import db from '../..'
import { OrderComment, getCommentType } from './orderComment'
import type { CommentType } from './orderComment'
import { Order } from '../Order/order'
import type { OrderStatus } from '../MagentoOrder/magentoOrder'
import {
  getBooleanCanThrow, getDateCanThrow, getFiniteNumberCanThrow, getOrderStatus,
} from '../../../utils/utils'

// import { printYellowLine } from '../../../utils/utils'

// type CommentShape = {
//   id?: number
//   comment: string
//   createdAt?: Date | string
//   externalId: number
//   externalParentId: number
//   status: OrderStatus
//   type: CommentType
//   customerNotified?: boolean | null
//   orderId?: number
//   visibleOnFront?: boolean | null
// }

type CommentRequired = {
  comment: string
  type: CommentType
}

type CommentCreational = {
  id?: number
  orderId?: number
  createdAt?: Date
}

type CommentOptional = {
  status?: OrderStatus
  externalId?: number
  externalParentId?: number
  customerNotified?: boolean | null
  visibleOnFront?: boolean | null
  // order?: NonAttribute<Order>
  // orderId: ForeignKey<Order['id']>
  // ASSOCIATIONS:
}

export type CommentShape = CommentRequired & CommentCreational & CommentOptional

export type CommentJSON = CommentRequired & Required<CommentCreational> & CommentOptional

export type CommentUpdate = Partial<CommentShape>

// export type CommentJSON = {
//   id?: number
//   comment: string
//   createdAt: Date
//   externalId?: number
//   externalParentId?: number
//   customerNotified?: boolean | null
//   visibleOnFront?: boolean | null
//   type: CommentType
//   status: OrderStatus
//   // order?: NonAttribute<Order>
//   // orderId: ForeignKey<Order['id']>
//   // ASSOCIATIONS:
// }

export function parseCommentShape(object: unknown): CommentShape {
  if (typeof object !== 'object' || !object) {
    throw new Error('malformed data: comment is not an object')
    // return false
  }

  const possbleCommentShape = object as Record<string, unknown>

  // required fields:
  if (!('comment' in possbleCommentShape)) {
    throw new Error('Comment malformed data: comment field is required')
  }
  if (!('type' in possbleCommentShape)) {
    throw new Error('Comment malformed data: type field is required')
  }

  // type checking required fields:
  const { comment, type } = possbleCommentShape
  if (typeof comment !== 'string') {
    throw new Error('Comment malformed data: comment field must be string')
  }
  const parsedCommentType = getCommentType(String(type))
  if (parsedCommentType === 'unknown') {
    throw new Error('Comment malformed data: unknown comment type')
  }

  // optionals:

  let parsedCreatedAt: Date | undefined
  if ('createdAt' in possbleCommentShape && possbleCommentShape.createdAt) {
    parsedCreatedAt = getDateCanThrow(possbleCommentShape.createdAt, 'Comment malformed data: createdAt ')
  }

  let parsedOrderStatus: OrderStatus | undefined
  if ('status' in possbleCommentShape) {
    parsedOrderStatus = getOrderStatus(String(possbleCommentShape.status))
    if (parsedOrderStatus === 'unknown') {
      throw new Error('Comment malformed data: unknown order status')
    }
  }

  let parsedOrderId: number | undefined
  if ('orderId' in possbleCommentShape && possbleCommentShape.orderId) {
    parsedOrderId = getFiniteNumberCanThrow(possbleCommentShape.orderId, 'Comment malformed data: orderId ')
  }

  let parsedId: number | undefined
  if ('id' in possbleCommentShape && possbleCommentShape.id) {
    parsedId = getFiniteNumberCanThrow(possbleCommentShape.id, 'Comment malformed data: id ')
  }

  let parsedExternalId: number | undefined
  if ('externalId' in possbleCommentShape && possbleCommentShape.externalId) {
    parsedExternalId = getFiniteNumberCanThrow(possbleCommentShape.externalId, 'Comment malformed data: externalId ')
  }

  let parsedExternalParentId: number | undefined
  if ('externalParentId' in possbleCommentShape && possbleCommentShape.externalParentId) {
    parsedExternalParentId = getFiniteNumberCanThrow(possbleCommentShape.externalParentId, 'Comment malformed data: externalParentId ')
  }

  let parsedVisibleOnFront: boolean | null | undefined
  if (('visibleOnFront' in possbleCommentShape)) {
    if (possbleCommentShape.visibleOnFront === null) {
      parsedVisibleOnFront = null
    } else {
      parsedVisibleOnFront = getBooleanCanThrow(possbleCommentShape.visibleOnFront, 'Comment malformed data: visibleOnFront ')
    }
  }

  let parsedCustomerNotified: boolean | null | undefined
  if (('customerNotified' in possbleCommentShape)) {
    if (possbleCommentShape.customerNotified === null) {
      parsedCustomerNotified = null
    } else {
      parsedCustomerNotified = getBooleanCanThrow(possbleCommentShape.customerNotified, 'Comment malformed data: customerNotified ')
    }
  }

  if (('createdAt' in possbleCommentShape)) {
    console.log('createdAt = ', possbleCommentShape.createdAt, typeof possbleCommentShape.createdAt)
  }

  const result: CommentShape = { comment, type: parsedCommentType }
  if (parsedCreatedAt !== undefined) {
    result.createdAt = parsedCreatedAt
  }
  if (parsedOrderStatus !== undefined) {
    result.status = parsedOrderStatus
  }
  if (parsedId !== undefined) {
    result.id = Math.floor(parsedId) // convert to integer
  }
  if (parsedOrderId !== undefined) {
    result.orderId = Math.floor(parsedOrderId) // convert to integer
  }
  if (parsedExternalParentId !== undefined) {
    result.externalParentId = Math.floor(parsedExternalParentId) // convert to integer
  }
  if (parsedExternalId !== undefined) {
    result.externalId = Math.floor(parsedExternalId) // convert to integer
  }
  if (parsedCustomerNotified !== undefined) {
    result.customerNotified = parsedCustomerNotified
  }
  if (parsedVisibleOnFront !== undefined) {
    result.visibleOnFront = parsedVisibleOnFront
  }
  return result
}

export default class OrderCommentController {
/**
 * create or update Order Address Record (must have Magento info).
 * @param magentoAddress - Address
 * @param orderInstanceOrId - orderId or Order instance to which to assign the address
 * @param t - transaction. If transaction is not provided, method will create its own transaction for this operation
 * @returns Order Address Instance with Magento record or null if there was a rollback and no transaction provided.
 */
  static async upsertMagentoComment(magentoComment: CommentShape, orderInstanceOrId: Order | number, t?: Transaction): Promise<OrderComment | null> {
    let transaction: Transaction
    if (t) {
      transaction = t
    } else {
      transaction = await db.transaction()
    }

    // extract orderId if it was provided
    let orderId: number | undefined
    if (orderInstanceOrId instanceof Order) {
      orderId = orderInstanceOrId.id
    }
    if (typeof orderInstanceOrId === 'number' && Number.isFinite(orderInstanceOrId)) {
      orderId = orderInstanceOrId
    }

    // externalId: 53383,
    //   externalParentId: 4379,
    //   comment: 'Thank you for your business.',
    //   createdAt: '2022-01-05T23:25:10.000Z',
    //   type: 'order',
    //   customerNotified: true,
    //   visibleOnFront: true,
    //   status: 'in_production',
    try {
      if (!magentoComment.externalId) {
        throw new Error('comment magento id was not provided')
      }
      const parsedComment = {
        ...magentoComment,
        createdAt: getDateCanThrow(magentoComment.createdAt || new Date()),
        status: getOrderStatus(magentoComment.status || 'unknown'),
        externalId: magentoComment.externalId,
      } satisfies CommentShape

      if (orderId) {
        parsedComment.orderId = orderId
      }

      await OrderComment.upsert(parsedComment, {
        transaction,
      })

      const result = await OrderComment.findOne({
        transaction,
        where: {
          externalId: magentoComment.externalId,
        },
      })
      if (!t) {
        // if no transaction was provided, commit the local transaction:
        await transaction.commit()
      }
      return result
    } catch (error) {
      // if the t transaction was passed to the method, throw error again
      // to be processed by another
      if (t) {
        throw error
      }
      console.log('error occured: ', error, 'rolling back transaction')
      await transaction.rollback()
      return null
    }
  }
}
