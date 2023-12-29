// ReceivedItems/receivedItems.ts
// 13. ReceivedItems:
// id (PK)
// purchase_order_item_id (FK from PurchaseOrderItems)
// shipment_id (FK from Shipments, nullable)
// quantity_received
// received_date
// created_at
// updated_at

// todo: - One-to-many relationship between ShipmentsItems and ReceivedItems (nullable).
import {
  Association, CreationOptional, InferAttributes, InferCreationAttributes, Model, NonAttribute, Sequelize, DataTypes,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  BelongsToCreateAssociationMixin,
  ForeignKey,
} from 'sequelize'
import type { PurchaseOrderItem } from '../PurchaseOrderItem/purchaseOrderItem'
import type { Shipment } from '../Shipment/shipment'
import { ShipmentItem } from '../ShipmentItem/shipmentItem'

export class ReceivedItem extends Model<InferAttributes<ReceivedItem>, InferCreationAttributes<ReceivedItem>> {
  declare id: CreationOptional<number>

  declare qtyReceived: number

  declare receivedDate: Date

  declare notes: string | null

  // timestamps
  declare createdAt: CreationOptional<Date>

  declare updatedAt: CreationOptional<Date>

  // associations

  declare shipmentItemId: ForeignKey<ShipmentItem['id']>

  declare shipmentItem?: NonAttribute<ShipmentItem>

  // declare purchaseOrderItemId: ForeignKey<PurchaseOrderItem['id']>

  // declare purchaseOrderItem?: NonAttribute<PurchaseOrderItem>

  // declare shipmentId: ForeignKey<Shipment['id']>

  // declare shipment?: NonAttribute<Shipment>

  declare public static associations: {
    shipmentItem: Association<ReceivedItem, ShipmentItem>,
    // purchaseOrderItem: Association<ReceivedItem, PurchaseOrderItem>,
    // shipment: Association<ReceivedItem, Shipment>,
  }

  // MIXINS
  // shipmentItem:
  declare getShipmentItem: BelongsToGetAssociationMixin<ShipmentItem>

  declare setShipmentItem: BelongsToSetAssociationMixin<ShipmentItem, number>

  declare createShipmentItem: BelongsToCreateAssociationMixin<ShipmentItem>

  // purchaseOrderItem:
  // declare getPurchaseOrderItem: BelongsToGetAssociationMixin<PurchaseOrderItem>

  // declare setPurchaseOrderItem: BelongsToSetAssociationMixin<PurchaseOrderItem, number>

  // declare createPurchaseOrderItem: BelongsToCreateAssociationMixin<PurchaseOrderItem>

  // shipment:
  // declare getShipment: BelongsToGetAssociationMixin<Shipment>

  // declare setShipment: BelongsToSetAssociationMixin<Shipment, number>

  // declare createShipment: BelongsToCreateAssociationMixin<Shipment>
}

export function initReceivedItem(db: Sequelize) {
  ReceivedItem.init(
    {
      id: {
        type: DataTypes.INTEGER,
        unique: true,
        autoIncrement: true,
        primaryKey: true,
      },
      qtyReceived: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      notes: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      receivedDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      sequelize: db,
    },
  )
}
