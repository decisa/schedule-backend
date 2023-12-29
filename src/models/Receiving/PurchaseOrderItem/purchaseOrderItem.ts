// 10. PurchaseOrderItems:

// id (PK)
// purchase_order_id (FK from PurchaseOrders)
// product_configuration_id (FK from ProductConfigurations)
// quantity_ordered
// quantity_received
// created_at
// updated_at

// done: - One-to-many relationship between PurchaseOrders and PurchaseOrderItems.
// done: - One-to-many relationship between ProductConfigurations and PurchaseOrderItems.
// done: - One-to-many relationship between PurchaseOrderItems and ShipmentItems.
// done: - One-to-many relationship between PurchaseOrderItems and ReceivedItems.
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
import type { ProductConfiguration } from '../../Sales/ProductConfiguration/productConfiguration'
import type { PurchaseOrder } from '../PurchaseOrder/purchaseOrder'
import type { ShipmentItem } from '../ShipmentItem/shipmentItem'
// import type { ReceivedItem } from '../ReceivedItems/receivedItems'

export class PurchaseOrderItem extends Model<InferAttributes<PurchaseOrderItem>, InferCreationAttributes<PurchaseOrderItem>> {
  declare id: CreationOptional<number>

  declare qtyPurchased: number

  // declare qtyReceived?: number
  // timestamps
  declare createdAt: CreationOptional<Date>

  declare updatedAt: CreationOptional<Date>

  // foreign keys
  declare purchaseOrderId: ForeignKey<PurchaseOrder['id']>

  declare configurationId: ForeignKey<ProductConfiguration['id']>

  // associations
  declare purchaseOrder?: NonAttribute<PurchaseOrder>

  declare product?: NonAttribute<ProductConfiguration>

  declare shipmentItems?: NonAttribute<ShipmentItem[]>

  // declare receivedItems?: NonAttribute<ReceivedItem[]>

  declare public static associations: {
    purchaseOrder: Association<PurchaseOrderItem, PurchaseOrder>,
    product: Association<PurchaseOrderItem, ProductConfiguration>,
    shipmentItems: Association<PurchaseOrderItem, ShipmentItem>,
    // receivedItems: Association<PurchaseOrderItem, ReceivedItem>,
  }

  // MIXINS
  // purchaseOrder:
  declare getPurchaseOrder: BelongsToGetAssociationMixin<PurchaseOrder>

  declare setPurchaseOrder: BelongsToSetAssociationMixin<PurchaseOrder, number>

  declare createPurchaseOrder: BelongsToCreateAssociationMixin<PurchaseOrder>

  // ProductConfiguration:
  declare getProduct: BelongsToGetAssociationMixin<ProductConfiguration>

  declare setProduct: BelongsToSetAssociationMixin<ProductConfiguration, number>

  declare createProduct: BelongsToCreateAssociationMixin<ProductConfiguration>

  // shipmentItems:
  declare createShipmentItem: HasManyCreateAssociationMixin<ShipmentItem, 'purchaseOrderItemId'>

  declare getShipmentItems: HasManyGetAssociationsMixin<ShipmentItem>

  declare countShipmentItems: HasManyCountAssociationsMixin

  declare hasShipmentItem: HasManyHasAssociationMixin<ShipmentItem, number>

  declare hasShipmentItems: HasManyHasAssociationsMixin<ShipmentItem, number>

  declare setShipmentItems: HasManySetAssociationsMixin<ShipmentItem, number>

  declare addShipmentItem: HasManyAddAssociationMixin<ShipmentItem, number>

  declare addShipmentItems: HasManyAddAssociationsMixin<ShipmentItem, number>

  declare removeShipmentItem: HasManyRemoveAssociationMixin<ShipmentItem, number>

  declare removeShipmentItems: HasManyRemoveAssociationsMixin<ShipmentItem, number>
}

export function initPurchaseOrderItem(db: Sequelize) {
  PurchaseOrderItem.init(
    {
      id: {
        type: DataTypes.INTEGER,
        unique: true,
        autoIncrement: true,
        primaryKey: true,
      },
      qtyPurchased: {
        type: DataTypes.INTEGER,
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
      purchaseOrderId: {
        type: DataTypes.INTEGER,
        unique: 'poid_configid_constraint',
      },
      configurationId: {
        type: DataTypes.INTEGER,
        unique: 'poid_configid_constraint',
      },
      // qtyReceived: DataTypes.INTEGER,
    },
    {
      sequelize: db,
    },
  )
}
