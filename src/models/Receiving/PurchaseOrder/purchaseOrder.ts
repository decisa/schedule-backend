// PurchaseOrders:
// id (PK)
// order_id (FK from Orders)
// brand_id (FK from Brands)
// status (e.g. 'Pending', 'In Production', 'Shipped', 'Received')
// submitted-date
// created_at
// updated_at

// done - One-to-many relationship between Orders and PurchaseOrders.
// done - One-to-many relationship between PurchaseOrders and PurchaseOrderItems.
// done - One-to-many relationship between Brands and PurchaseOrders.
import {
  Association, CreationOptional, InferAttributes, InferCreationAttributes, Model, NonAttribute, Sequelize, DataTypes, ForeignKey,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  BelongsToCreateAssociationMixin,
  HasManyCreateAssociationMixin,
  HasManyGetAssociationsMixin,
  HasManyCountAssociationsMixin,
  HasManyHasAssociationMixin,
  HasManyHasAssociationsMixin,
  HasManySetAssociationsMixin,
  HasManyAddAssociationMixin,
  HasManyAddAssociationsMixin,
  HasManyRemoveAssociationMixin,
  HasManyRemoveAssociationsMixin,
} from 'sequelize'
import type { Order } from '../../Sales/Order/order'
import type { Brand } from '../../Brand/brand'
import type { PurchaseOrderItem } from '../PurchaseOrderItem/purchaseOrderItem'

export const poStatuses = ['pending', 'in production', 'shipped', 'received'] as const

export type POStatus = typeof poStatuses[number]

export class PurchaseOrder extends Model<InferAttributes<PurchaseOrder>, InferCreationAttributes<PurchaseOrder>> {
  declare id: CreationOptional<number>

  declare poNumber: string

  declare status: POStatus

  declare dateSubmitted: Date

  declare productionWeeks: number | null

  declare createdAt: CreationOptional<Date>

  declare updatedAt: CreationOptional<Date>

  // declare productionDate?: Date

  // declare turnaround?: number

  // associations
  declare order?: NonAttribute<Order>

  declare brand: NonAttribute<Brand>

  declare orderId: ForeignKey<Order['id']>

  declare brandId: ForeignKey<Brand['id']>

  declare items: NonAttribute<PurchaseOrderItem[]>

  declare public static associations: {
    order: Association<PurchaseOrder, Order>,
    brand: Association<PurchaseOrder, Brand>,
    items: Association<PurchaseOrder, PurchaseOrderItem>,
  }

  // MIXINS
  // order:
  declare getOrder: BelongsToGetAssociationMixin<Order>

  declare setOrder: BelongsToSetAssociationMixin<Order, number>

  declare createOrder: BelongsToCreateAssociationMixin<Order>

  // Brand:
  declare getBrand: BelongsToGetAssociationMixin<Brand>

  declare setBrand: BelongsToSetAssociationMixin<Brand, number>

  declare createBrand: BelongsToCreateAssociationMixin<Brand>

  // PurchaseOrderItems:
  declare createItem: HasManyCreateAssociationMixin<PurchaseOrderItem, 'purchaseOrderId'>

  declare getItems: HasManyGetAssociationsMixin<PurchaseOrderItem>

  declare countItems: HasManyCountAssociationsMixin

  declare hasItem: HasManyHasAssociationMixin<PurchaseOrderItem, number>

  declare hasItems: HasManyHasAssociationsMixin<PurchaseOrderItem, number>

  declare setItems: HasManySetAssociationsMixin<PurchaseOrderItem, number>

  declare addItem: HasManyAddAssociationMixin<PurchaseOrderItem, number>

  declare addItems: HasManyAddAssociationsMixin<PurchaseOrderItem, number>

  declare removeItem: HasManyRemoveAssociationMixin<PurchaseOrderItem, number>

  declare removeItems: HasManyRemoveAssociationsMixin<PurchaseOrderItem, number>
}

export function initPurchaseOrder(db: Sequelize) {
  PurchaseOrder.init(
    {
      id: {
        type: DataTypes.INTEGER,
        unique: true,
        autoIncrement: true,
        primaryKey: true,
      },
      poNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        // uniqueness is handled by index
      },
      dateSubmitted: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      productionWeeks: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING,
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
    },
    {
      sequelize: db,
      indexes: [
        {
          unique: true,
          fields: ['poNumber'],
        },
      ],
    },
  )
}
