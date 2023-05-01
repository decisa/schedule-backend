import { Transaction, or } from 'sequelize'
import db from '../..'
import { OrderComment } from './orderComment'
import type { CommentType } from './orderComment'
import { Order } from '../Order/order'
import type { OrderStatus } from '../MagentoOrder/magentoOrder'
import { getDate, getOrderStatus } from '../../../utils/utils'

// import { printYellowLine } from '../../../utils/utils'

type CommentShape = {
  id?: number
  comment: string
  createdAt?: Date | string
  externalId: number
  externalParentId: number
  status: OrderStatus
  type: CommentType
  customerNotified?: boolean | null
  orderId?: number
  visibleOnFront?: boolean | null
}

export type CommentJSON = {
  id?: number
  comment: string
  createdAt: Date
  externalId?: number
  externalParentId?: number
  customerNotified?: boolean | null
  visibleOnFront?: boolean | null
  type: CommentType
  status: OrderStatus
  // order?: NonAttribute<Order>
  // orderId: ForeignKey<Order['id']>
  // ASSOCIATIONS:
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
        createdAt: getDate(magentoComment.createdAt || new Date()),
        status: getOrderStatus(magentoComment.status),
      }

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
