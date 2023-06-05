import * as yup from 'yup'
import {
  Op, Transaction,
} from 'sequelize'
import { OrderComment, CommentType, commentTypes } from './orderComment'
import { OrderStatus, orderStatuses } from '../MagentoOrder/magentoOrder'
import {
  isId,
  isString,
  printYellowLine,
  useTransaction,
} from '../../../utils/utils'
import { Order } from '../Order/order'

// export type CommentShape = {
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

type OrderCommentCreational = {
  id: number
}
// required
type OrderCommentRequired = {
  comment: string
  type: CommentType // has default value
}
// optional
type OrderCommentOptional = {
  externalId: number | null
  externalParentId: number | null
  customerNotified: boolean | null
  visibleOnFront: boolean | null
  status: OrderStatus | null
}

type OrderCommentMagento = {
  externalId: number
  externalParentId?: number | null
  customerNotified: boolean
  visibleOnFront: boolean
  // type: CommentType // has default value
  status: OrderStatus
}
// Associations
// type OrderCommentAssociatios = {
//   order?: NonAttribute<Order>
// }

// Foreign Keys
type OrderCommentFK = {
  orderId: number
}
// Timestamps
type OrderCommentTimeStamps = {
  createdAt: Date
  updatedAt: Date
}

// Note: DATA TYPES
export type OrderCommentCreate =
  Partial<OrderCommentCreational>
  & Required<OrderCommentRequired>
  & Partial<OrderCommentOptional>
  & Required<OrderCommentFK>
  & Partial<OrderCommentTimeStamps>

// for upsert, only externalId is required
export type OrderCommentMagentoUpsert = Pick<OrderCommentCreate, 'externalId'> & Partial<Omit<OrderCommentCreate, 'externalId'>>

export type OrderCommentMagentoCreate =
  Partial<OrderCommentCreational>
  & Required<OrderCommentRequired>
  & OrderCommentMagento
  & Required<OrderCommentFK>
  & Partial<OrderCommentTimeStamps>

export type OrderCommentRead = Required<OrderCommentCreate>

export const commentSchemaCreate: yup.ObjectSchema<OrderCommentCreate> = yup.object({
  comment: yup.string()
    .label('Malformed data: comment field')
    .defined(),
  type: yup
    .mixed<CommentType>()
    .oneOf(commentTypes)
    .label('Malformed data: type field')
    .required(),
  id: yup.number().integer(),
  orderId: yup.number().integer().required().label('Malformed data: orderId field'),
  status: yup
    .mixed<OrderStatus>()
    .oneOf(orderStatuses)
    .nullable()
    .default(null)
    .label('Malformed data: status field'),
  externalId: yup.number().integer().nullable().label('Malformed data: externalId field'),
  externalParentId: yup.number().integer().nullable().label('Malformed data: externalParentId field'),
  customerNotified: yup.boolean().nullable().label('Malformed data: customerNotified field'),
  visibleOnFront: yup.boolean().nullable().label('Malformed data: visibleOnFront field'),
  createdAt: yup.date().label('Malformed data: createdAt field'),
  updatedAt: yup.date().label('Malformed data: updatedAt field'),
})

const commentSchemaMagentoCreate: yup.ObjectSchema<OrderCommentMagentoCreate> = commentSchemaCreate
  .clone()
  .shape({
    type: yup
      .mixed<CommentType>()
      .oneOf(commentTypes)
      .label('Malformed data: type field')
      .default('order'),
    status: yup
      .mixed<OrderStatus>()
      .oneOf(orderStatuses)
      .required()
      .label('Malformed data: status field'),
    externalId: yup.number().integer().required().label('Malformed data: externalId field'),
    externalParentId: yup.number().integer().nullable().label('Malformed data: externalParentId field'),
    customerNotified: yup.boolean().required().label('Malformed data: customerNotified field'),
    visibleOnFront: yup.boolean().required().label('Malformed data: visibleOnFront field'),
  })

const commentSchemaMagentoUpsert: yup.ObjectSchema<OrderCommentMagentoUpsert> = yup.object({
  comment: yup.string()
    .label('Malformed data: comment field')
    .nonNullable(),
  type: yup
    .mixed<CommentType>()
    .oneOf(commentTypes)
    .nonNullable()
    .label('Malformed data: type field'),
  id: yup.number().nonNullable().integer(),
  orderId: yup.number().integer().nonNullable().label('Malformed data: orderId field'),
  status: yup
    .mixed<OrderStatus>()
    .oneOf(orderStatuses)
    .nonNullable()
    .label('Malformed data: status field'),
  externalId: yup.number().integer().required().label('Malformed data: externalId field'),
  externalParentId: yup.number().integer().nullable().label('Malformed data: externalParentId field'),
  customerNotified: yup.boolean().nonNullable().label('Malformed data: customerNotified field'),
  visibleOnFront: yup.boolean().nonNullable().label('Malformed data: visibleOnFront field'),
  createdAt: yup.date().label('Malformed data: createdAt field'),
  updatedAt: yup.date().label('Malformed data: updatedAt field'),
})

const hasExternalId = yup.object({
  externalId: yup.number().integer().required().label('Malformed data: externalId field'),
})

export function validateCommentCreate(object: unknown): OrderCommentCreate {
  const comment = commentSchemaCreate.validateSync(object, {
    stripUnknown: true,
  }) satisfies OrderCommentCreate
  return comment
}

export function validateCommentMagentoUpsert(object: unknown): OrderCommentMagentoUpsert {
  const comment = commentSchemaMagentoUpsert.validateSync(object, {
    stripUnknown: true,
  }) satisfies OrderCommentMagentoUpsert
  return comment
}

/**
 * Validates unknown object for creation of new comment with Magento related fields.
 * Returns the stripped off commentObject for insertion to DB
 * @param {unknown} object - possibly a comment to be inserted to DB
 * @returns {OrderCommentMagentoCreate} OrderCommentMagentoCreate
 */
export function validateCommentMagentoCreate(object: unknown): OrderCommentMagentoCreate {
  const comment = commentSchemaMagentoCreate.validateSync(object, {
    stripUnknown: true,
  }) satisfies OrderCommentMagentoCreate
  return comment
}

export default class OrderCommentController {
  /**
   * convert OrderCommentInstance to a regular JSON object
   * @param data - OrderComment, array of order Comments or null
   * @returns {OrderCommentRead | OrderCommentRead[] | null} JSON format nullable.
   */
  static toJSON(data: OrderComment | OrderComment[] | null): OrderCommentRead | OrderCommentRead[] | null {
    try {
      if (data instanceof OrderComment) {
        return data.toJSON()
      }
      if (Array.isArray(data)) {
        return data.map((comment) => comment.toJSON())
      }
      return null
    } catch (error) {
      return null
    }
  }

  /**
   * create Order Comment Record. incoming comment object will be validated and Error will be thrown if validation fails. Make sure to wrap in try catch.
   * @param comment - object with comment to be created.
   * @param t - transaction. If transaction is not provided, method will create its own transaction for this operation
   * @returns OrderComment instance.
   */
  static async insertOrderComment(comment: unknown, t?: Transaction): Promise<OrderComment> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const parsedComment = validateCommentCreate(comment)
      const result = await OrderComment.create(parsedComment, {
        transaction,
      })
      if (result) {
        await commit()
        return result
      }
      throw new Error('Internal Error: comment was not created')
    } catch (error) {
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }

  /**
   * create Order Comment Record. incoming comment object will be validated and Error will be thrown if validation fails. Make sure to wrap in try catch.
   * @param comment - object with comment to be created.
   * @param t - transaction. If transaction is not provided, method will create its own transaction for this operation
   * @returns OrderComment instance.
   */
  static async insertOrderCommentMagento(comment: unknown | OrderCommentMagentoCreate, t?: Transaction): Promise<OrderComment> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const parsedComment = validateCommentMagentoCreate(comment)
      const result = await OrderComment.create(parsedComment, {
        transaction,
      })
      if (result) {
        await commit()
        return result
      }
      throw new Error('Internal Error: comment was not created')
    } catch (error) {
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }

  /**
   * upserts (update or insert) Order Comment with Magento Record. incoming comment object will be validated and Error will be thrown if validation fails. Make sure to wrap in try catch.
   * @param comment - object with comment to be created.
   * @param t - transaction. If transaction is not provided, method will create its own transaction for this operation
   * @returns OrderComment instance.
   */
  static async upsertOrderCommentMagento(comment: unknown, t?: Transaction): Promise<OrderComment | null> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const { externalId } = hasExternalId.validateSync(comment)
      const commentRecord = await OrderComment.findOne({
        where: {
          externalId,
        },
        transaction,
      })

      let result: OrderComment | null = null

      if (!commentRecord) {
        // create record
        result = await this.insertOrderCommentMagento(comment, transaction)
        printYellowLine()
        console.log('CREATED !')
      } else {
        // update record
        const parsedComment = validateCommentMagentoUpsert(comment)
        // verify that required fields are not null:

        await OrderComment.update(parsedComment, {
          where: {
            externalId,
          },
          transaction,
        })
        result = await OrderComment.findOne({
          where: {
            externalId,
          },
          transaction,
        })
        console.log('UPDATED !')
      }
      if (result) {
        await commit()
        return result
      }
      throw new Error('Internal Error: comment was not created')
    } catch (error) {
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }

  /**
   * find comment by id.
   * @param id - id of the comment
   * @returns OrderComment instance.
   */
  static async getCommentById(id: unknown): Promise<OrderComment | null> {
    const commentId = isId.validateSync(id)
    const result = await OrderComment.findByPk(commentId)
    return result
  }

  /**
   * find comment by magento external id.
   * @param magentoId - id of the comment
   * @returns OrderComment instance.
   */
  static async getCommentByMagentoId(magentoId: unknown): Promise<OrderComment | null> {
    const externalId = isId.validateSync(magentoId)
    const result = await OrderComment.findOne({
      where: {
        externalId,
      },
    })
    return result
  }

  /**
 * find comments by order id.
 * @param orderId - id of the comment
 * @returns {OrderComment | OrderComment[] | null} OrderComment | OrderComment[] | null instance(s).
 */
  static async getCommentsByOrderId(orderId: unknown): Promise<OrderComment | OrderComment[] | null> {
    const id = isId.validateSync(orderId)
    const result = await OrderComment.findAll({
      where: {
        orderId: id,
      },
    })
    return result
  }

  /**
 * find comments by order id.
 * @param orderNumber - id of the comment
 * @returns {OrderComment | OrderComment[] | null} OrderComment | OrderComment[] | null instance(s).
 */
  static async getCommentsByOrderNumber(orderNumber: unknown): Promise<OrderComment | OrderComment[] | null> {
    const orderNum = isString.validateSync(orderNumber)
    const result = await OrderComment.findAll({
      where: {},
      include: [
        {
          model: Order,
          as: 'order',
          where: {
            orderNumber: {
              [Op.like]: `%${orderNum}`,
            },
          },
          attributes: ['orderNumber'],
        },
      ],
    })
    return result
  }
}
