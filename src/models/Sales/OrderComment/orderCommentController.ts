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
    // .nullable()
    .ensure()
    .label('Comment malformed data: comment field (create)'),
  // .defined(),
  type: yup
    .mixed<CommentType>()
    .oneOf(commentTypes)
    .label('Comment malformed data: type field')
    .required(),
  id: yup.number().integer(),
  orderId: yup.number()
    .integer()
    .positive()
    .required()
    .label('Comment malformed data: orderId field'),
  status: yup
    .mixed<OrderStatus>()
    .oneOf(orderStatuses)
    .nullable()
    .label('Comment malformed data: status field'),
  externalId: yup.number()
    .integer()
    .nullable()
    .label('Comment malformed data: externalId field'),
  externalParentId: yup.number()
    .integer()
    .nullable()
    .label('Comment malformed data: externalParentId field'),
  customerNotified: yup.boolean()
    .nullable()
    .label('Comment malformed data: customerNotified field'),
  visibleOnFront: yup.boolean()
    .nullable()
    .label('Comment malformed data: visibleOnFront field'),
  createdAt: yup.date().label('Comment malformed data: createdAt field'),
  updatedAt: yup.date().label('Comment malformed data: updatedAt field'),
})

const commentSchemaUpdate = commentSchemaCreate.clone().shape({
  comment: yup.string()
    .ensure()
    .label('Comment malformed data: type comment (update)'),
  // .nonNullable(),
  type: yup
    .mixed<CommentType>()
    .oneOf(commentTypes)
    .nonNullable()
    .label('Comment malformed data: type field'),
  orderId: yup.number()
    .integer()
    .positive()
    .nonNullable()
    .label('Comment malformed data: orderId field'),
})

const commentSchemaMagentoCreate: yup.ObjectSchema<OrderCommentMagentoCreate> = commentSchemaCreate
  .clone()
  .shape({
    type: yup
      .mixed<CommentType>()
      .oneOf(commentTypes)
      .label('Comment malformed data: type field')
      .default('order'),
    status: yup
      .mixed<OrderStatus>()
      .oneOf(orderStatuses)
      .required()
      .label('Comment malformed data: status field'),
    externalId: yup.number().integer().required().label('Comment malformed data: externalId field'),
    externalParentId: yup.number().integer().nullable().label('Comment malformed data: externalParentId field'),
    customerNotified: yup.boolean().required().label('Comment malformed data: customerNotified field'),
    visibleOnFront: yup.boolean().required().label('Comment malformed data: visibleOnFront field'),
  })

const commentSchemaMagentoUpsert: yup.ObjectSchema<OrderCommentMagentoUpsert> = yup.object({
  comment: yup.string()
    .label('Comment malformed data: comment field (magento upsert)'),
  // .nonNullable(),
  type: yup
    .mixed<CommentType>()
    .oneOf(commentTypes)
    .nonNullable()
    .label('Comment malformed data: type field'),
  id: yup.number().nonNullable().integer(),
  orderId: yup.number().integer().nonNullable().label('Comment malformed data: orderId field'),
  status: yup
    .mixed<OrderStatus>()
    .oneOf(orderStatuses)
    .nonNullable()
    .label('Comment malformed data: status field'),
  externalId: yup.number().integer().required().label('Comment malformed data: externalId field'),
  externalParentId: yup.number().integer().nullable().label('Comment malformed data: externalParentId field'),
  customerNotified: yup.boolean().nonNullable().label('Comment malformed data: customerNotified field'),
  visibleOnFront: yup.boolean().nonNullable().label('Comment malformed data: visibleOnFront field'),
  createdAt: yup.date().label('Comment malformed data: createdAt field'),
  updatedAt: yup.date().label('Comment malformed data: updatedAt field'),
})

const hasExternalId = yup.object({
  externalId: yup.number().integer().required().label('Comment malformed data: externalId field'),
})

export function validateCommentCreate(object: unknown): OrderCommentCreate {
  const comment = commentSchemaCreate.validateSync(object, {
    stripUnknown: true,
  }) satisfies OrderCommentCreate
  return comment
}

export function validateCommentUpdate(object: unknown): Omit<Partial<OrderCommentCreate>, 'createdAt' | 'updatedAt' | 'id'> {
  // restrict update of id, and creation or modification dates
  const comment = commentSchemaUpdate.omit(['createdAt', 'updatedAt', 'id']).validateSync(object, {
    stripUnknown: true,
    abortEarly: false,
  }) satisfies Partial<OrderCommentCreate>

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
  static async create(comment: unknown, t?: Transaction): Promise<OrderComment> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const parsedComment = validateCommentCreate(comment)
      const result = await OrderComment.create(parsedComment, {
        transaction,
      })

      await commit()
      return result
    } catch (error) {
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }

  /**
   * update Order Comment Record.
  * @param {number | unknown} commentId - id of the Comment record to update in DB
   * @param {unknown | Partial<ProductConfigurationCreate>} productData - update data for Product record
   * @returns {Product} complete Updated Product object or throws error
   */
  static async update(
    commentId: number | unknown,
    comment: Partial<OrderCommentCreate> | unknown,
    t?: Transaction,
  ): Promise<OrderComment> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const parsedComment = validateCommentUpdate(comment)

      const id = isId.validateSync(commentId)
      const commentRecord = await this.get(id, transaction)
      if (!commentRecord) {
        throw new Error('Product Configuration does not exist')
      }

      await commentRecord.update(parsedComment, { transaction })
      const result = await this.get(commentRecord.id, transaction)
      if (!result) {
        throw new Error('error updating the product configuration')
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
   * create Magento Order Comment Record.
   * @param comment - object with comment to be created.
   * @param t - transaction. If transaction is not provided, method will create its own transaction for this operation
   * @returns OrderComment instance.
   */
  static async createMagento(comment: unknown | OrderCommentMagentoCreate, t?: Transaction): Promise<OrderComment> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const parsedComment = validateCommentMagentoCreate(comment)
      const result = await OrderComment.create(parsedComment, {
        transaction,
      })
      await commit()
      return result
    } catch (error) {
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }

  /**
   * upserts (update or insert) Order Comment with Magento Record. externalId is required
   * @param comment - object with comment to be created.
   * @param t - transaction. If transaction is not provided, method will create its own transaction for this operation
   * @returns OrderComment instance.
   */
  static async upsert(comment: unknown, t?: Transaction): Promise<OrderComment> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      const { externalId } = hasExternalId.validateSync(comment)
      const commentRecord = await OrderComment.findOne({
        where: {
          externalId,
        },
        transaction,
      })

      let result: OrderComment

      if (!commentRecord) {
        // create record
        result = await this.createMagento(comment, transaction)
      } else {
        // update record
        result = await this.update(commentRecord.id, comment, transaction)
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
   * upserts (update or insert) Order Comment with Magento Record. incoming comment object will be validated and Error will be thrown if validation fails. Make sure to wrap in try catch.
   * @param comments - object with comment to be created.
   * @param t - transaction. If transaction is not provided, method will create its own transaction for this operation
   * @returns OrderComment instance.
   */
  static async bulkUpsert(comments: unknown, t?: Transaction): Promise<OrderComment[] | null> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      if (!Array.isArray(comments)) {
        return null
      }

      const result: OrderComment[] | null = []
      for (let i = 0; i < comments.length; i += 1) {
        // const { externalId } = hasExternalId.validateSync(comments[i])
        const comment = await this.upsert(comments[i], transaction)
        if (comment) {
          result.push(comment)
        }
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
   * upserts (update or insert) Order Comment with Magento Record. externalId is required
   * @param { number } orderId - orderId for which comment need to be upserted.
   * @param comment - object with comment to be created.
   * @param t - transaction. If transaction is not provided, method will create its own transaction for this operation
   * @returns OrderComment instance.
   */
  static async upsertByOrderId(orderId: number, comment: unknown, t?: Transaction): Promise<OrderComment> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      if (!comment || typeof comment !== 'object') {
        throw new Error('Comment data is missing')
      }
      const result = await this.upsert({
        ...comment,
        orderId,
      }, transaction)

      await commit()
      return result
    } catch (error) {
      await rollback()
      // rethrow the error for further handling
      throw error
    }
  }

  /**
   * upserts (update or insert) Order Comment with Magento Record. externalId is required
   * @param { number } orderId - orderId for which comments need to be upserted.
   * @param comments - object with comments to be created.
   * @param t - transaction. If transaction is not provided, method will create its own transaction for this operation
   * @returns { OrderComment[] | null } OrderComment[] instance.
   */
  static async bulkUpsertByOrderId(orderId: number, comments: unknown, t?: Transaction): Promise<OrderComment[]> {
    const [transaction, commit, rollback] = await useTransaction(t)
    try {
      if (!Array.isArray(comments)) {
        throw new Error('Comments array was not provided')
      }

      const result: OrderComment[] = []
      for (let i = 0; i < comments.length; i += 1) {
        // const { externalId } = hasExternalId.validateSync(comments[i])
        const comment = await this.upsertByOrderId(orderId, comments[i], transaction)
        if (comment) {
          result.push(comment)
        }
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
   * find comment by id.
   * @param id - id of the comment
   * @returns OrderComment instance.
   */
  static async get(id: unknown, t?: Transaction): Promise<OrderComment | null> {
    const commentId = isId.validateSync(id)
    const result = await OrderComment.findByPk(commentId, { transaction: t })
    return result
  }

  /**
   * find comment by magento external id.
   * @param magentoId - id of the comment
   * @returns OrderComment instance.
   */
  static async getCommentByMagentoId(magentoId: unknown, t?: Transaction): Promise<OrderComment | null> {
    const externalId = isId.validateSync(magentoId)
    const result = await OrderComment.findOne({
      where: {
        externalId,
      },
      transaction: t,
    })
    return result
  }

  /**
 * find comments by order id.
 * @param orderId - id of the comment
 * @returns {OrderComment | OrderComment[] | null} OrderComment | OrderComment[] | null instance(s).
 */
  static async getCommentsByOrderId(orderId: unknown, t?: Transaction): Promise<OrderComment | OrderComment[] | null> {
    const id = isId.validateSync(orderId)
    const result = await OrderComment.findAll({
      where: {
        orderId: id,
      },
      transaction: t,
    })
    return result
  }

  /**
 * find comments by order id.
 * @param orderNumber - id of the comment
 * @returns {OrderComment | OrderComment[] | null} OrderComment | OrderComment[] | null instance(s).
 */
  static async getCommentsByOrderNumber(orderNumber: unknown, t?: Transaction): Promise<OrderComment | OrderComment[] | null> {
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
      transaction: t,
    })
    return result
  }
}
