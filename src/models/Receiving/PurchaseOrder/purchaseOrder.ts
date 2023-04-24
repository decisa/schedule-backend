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

type POStatus = 'pending' | 'in production' | 'shipped' | 'received'
export class PurchaseOrder extends Model<InferAttributes<PurchaseOrder>, InferCreationAttributes<PurchaseOrder>> {
  declare id: CreationOptional<number>

  declare status: POStatus

  declare dateSubmitted: Date

  // declare productionDate?: Date

  // declare turnaround?: number

  // associations
  declare order?: NonAttribute<Order>

  declare brand: NonAttribute<Brand>

  declare orderId: ForeignKey<Order['id']>

  declare brandId: ForeignKey<Brand['id']>

  declare purchaseOrderItems: NonAttribute<PurchaseOrderItem[]>

  declare public static associations: {
    order: Association<PurchaseOrder, Order>,
    brand: Association<PurchaseOrder, Brand>,
    purchaseOrderItems: Association<PurchaseOrder, PurchaseOrderItem>,
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
  declare createPurchaseOrderItem: HasManyCreateAssociationMixin<PurchaseOrderItem, 'purchaseOrderId'>

  declare getPurchaseOrderItems: HasManyGetAssociationsMixin<PurchaseOrderItem>

  declare countPurchaseOrderItems: HasManyCountAssociationsMixin

  declare hasPurchaseOrderItem: HasManyHasAssociationMixin<PurchaseOrderItem, number>

  declare hasPurchaseOrderItems: HasManyHasAssociationsMixin<PurchaseOrderItem, number>

  declare setPurchaseOrderItems: HasManySetAssociationsMixin<PurchaseOrderItem, number>

  declare addPurchaseOrderItem: HasManyAddAssociationMixin<PurchaseOrderItem, number>

  declare addPurchaseOrderItems: HasManyAddAssociationsMixin<PurchaseOrderItem, number>

  declare removePurchaseOrderItem: HasManyRemoveAssociationMixin<PurchaseOrderItem, number>

  declare removePurchaseOrderItems: HasManyRemoveAssociationsMixin<PurchaseOrderItem, number>
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
      dateSubmitted: DataTypes.DATE,
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize: db,
    },
  )
}
