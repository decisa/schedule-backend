import {
  Association,
  BelongsToCreateAssociationMixin,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  CreationOptional, DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model, NonAttribute, Sequelize,
} from 'sequelize'
import { Order } from '../Order/order'
import type { OrderStatus } from '../MagentoOrder/magentoOrder'

export type CommentType = 'order' | 'shipping' | 'invoice' | 'unknown' // TODO: credit memo?

export function getCommentType(commentType: string):CommentType {
  if (
    commentType === 'order'
    || commentType === 'shipping'
    || commentType === 'invoice'
  ) {
    return commentType
  }
  return 'unknown'
}

export class OrderComment extends Model<InferAttributes<OrderComment>, InferCreationAttributes<OrderComment>> {
  declare id: CreationOptional<number>

  declare comment: string

  declare createdAt: CreationOptional<Date>

  declare type: CommentType

  declare externalId?: number | null

  declare externalParentId?: number | null

  declare customerNotified?: boolean | null

  declare visibleOnFront?: boolean | null

  declare status?: OrderStatus | null

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
    comment: DataTypes.TEXT,

    createdAt: {
      type: DataTypes.DATE,
      // allowNull: true,
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
    type: DataTypes.STRING(12),
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
