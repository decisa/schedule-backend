import {
  Association,
  BelongsToCreateAssociationMixin,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  CreationOptional, DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model, NonAttribute, Sequelize,
} from 'sequelize'
import { Order } from '../Order/order'
import type { OrderStatus } from '../MagentoOrder/magentoOrder'

export const commentTypes = [
  'order',
  'shipping',
  'invoice',
  'shipment',
  'creditmemo',
] as const

export type CommentType = typeof commentTypes[number]

// Creational
type OrderCommentCreational = {
  id: number
}
// required
type OrderCommentRequired = {
  comment: string
}
// optional
type OrderCommentOptional = {
  externalId: number | null
  externalParentId: number | null
  customerNotified: boolean | null
  visibleOnFront: boolean | null
  type: CommentType // has default value
  status: OrderStatus | null
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
  & Partial<OrderCommentFK> // or should it be required?
  & Partial<OrderCommentTimeStamps>

export class OrderComment extends Model<InferAttributes<OrderComment>, InferCreationAttributes<OrderComment>> {
  declare id: CreationOptional<number>

  declare comment: string

  declare createdAt: CreationOptional<Date>

  declare updatedAt: CreationOptional<Date>

  declare externalId: number | null

  declare externalParentId: number | null

  declare customerNotified: boolean | null

  declare visibleOnFront: boolean | null

  declare type: CommentType // has default value

  declare status: OrderStatus | null

  // ASSOCIATIONS:

  declare orderId: ForeignKey<Order['id']>

  declare order?: NonAttribute<Order>

  declare public static associations: {
    order: Association<OrderComment, Order>,
  }

  // MIXINS
  // order record:
  declare getOrder: BelongsToGetAssociationMixin<Order>

  declare setOrder: BelongsToSetAssociationMixin<Order, number>

  declare createOrder: BelongsToCreateAssociationMixin<Order>
}

export function initOrderComment(db: Sequelize) {
  OrderComment.init({
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    externalId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    externalParentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    customerNotified: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    visibleOnFront: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    type: {
      type: DataTypes.STRING(12),
      allowNull: false,
      defaultValue: 'order' satisfies CommentType,
    },
    status: DataTypes.STRING(64),
  }, {
    sequelize: db,
    indexes: [
      {
        unique: true,
        fields: ['externalId'],
      },
    ],
  })
}
