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
import type { ReceivedItem } from '../ReceivedItems/receivedItems'

export class PurchaseOrderItem extends Model<InferAttributes<PurchaseOrderItem>, InferCreationAttributes<PurchaseOrderItem>> {
  declare id: CreationOptional<number>

  declare qtyOrdered: number

  declare qtyReceived?: number

  // purchase_order_id (FK from PurchaseOrders)
  // product_configuration_id (FK from ProductConfigurations)

  // associations
  declare purchaseOrder?: NonAttribute<PurchaseOrder>

  declare productConfiguration?: NonAttribute<ProductConfiguration>

  declare shipmentItems?: NonAttribute<ShipmentItem[]>

  declare receivedItems?: NonAttribute<ReceivedItem[]>

  declare purchaseOrderId: ForeignKey<PurchaseOrder['id']>

  declare productConfigurationId: ForeignKey<ProductConfiguration['id']>

  // declare products?: NonAttribute<Products>

  declare public static associations: {
    purchaseOrder: Association<PurchaseOrderItem, PurchaseOrder>,
    productConfiguration: Association<PurchaseOrderItem, ProductConfiguration>,
    shipmentItems: Association<PurchaseOrderItem, ShipmentItem>,
    receivedItems: Association<PurchaseOrderItem, ReceivedItem>,
  }

  // MIXINS
  // purchaseOrder:
  declare getPurchaseOrder: BelongsToGetAssociationMixin<PurchaseOrder>

  declare setPurchaseOrder: BelongsToSetAssociationMixin<PurchaseOrder, number>

  declare createPurchaseOrder: BelongsToCreateAssociationMixin<PurchaseOrder>

  // ProductConfiguration:
  declare getProductConfiguration: BelongsToGetAssociationMixin<ProductConfiguration>

  declare setProductConfiguration: BelongsToSetAssociationMixin<ProductConfiguration, number>

  declare createProductConfiguration: BelongsToCreateAssociationMixin<ProductConfiguration>

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

  // ReceivedItems:
  declare createReceivedItem: HasManyCreateAssociationMixin<ReceivedItem, 'purchaseOrderItemId'>

  declare getReceivedItems: HasManyGetAssociationsMixin<ReceivedItem>

  declare countReceivedItems: HasManyCountAssociationsMixin

  declare hasReceivedItem: HasManyHasAssociationMixin<ReceivedItem, number>

  declare hasReceivedItems: HasManyHasAssociationsMixin<ReceivedItem, number>

  declare setReceivedItems: HasManySetAssociationsMixin<ReceivedItem, number>

  declare addReceivedItem: HasManyAddAssociationMixin<ReceivedItem, number>

  declare addReceivedItems: HasManyAddAssociationsMixin<ReceivedItem, number>

  declare removeReceivedItem: HasManyRemoveAssociationMixin<ReceivedItem, number>

  declare removeReceivedItems: HasManyRemoveAssociationsMixin<ReceivedItem, number>
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
      qtyOrdered: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      qtyReceived: DataTypes.INTEGER,
    },
    {
      sequelize: db,
    },
  )
}
