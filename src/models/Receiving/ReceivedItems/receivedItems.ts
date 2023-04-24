// ReceivedItems/receivedItems.ts
// 13. ReceivedItems:
// id (PK)
// purchase_order_item_id (FK from PurchaseOrderItems)
// shipment_id (FK from Shipments, nullable)
// quantity_received
// received_date
// created_at
// updated_at

// done - One-to-many relationship between PurchaseOrderItems and ReceivedItems.
// done - One-to-many relationship between Shipments and ReceivedItems (nullable).
import {
  Association, CreationOptional, InferAttributes, InferCreationAttributes, Model, NonAttribute, Sequelize, DataTypes,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  BelongsToCreateAssociationMixin,
  ForeignKey,
} from 'sequelize'
import type { PurchaseOrderItem } from '../PurchaseOrderItem/purchaseOrderItem'
import type { Shipment } from '../Shipment/shipment'

export class ReceivedItem extends Model<InferAttributes<ReceivedItem>, InferCreationAttributes<ReceivedItem>> {
  declare id: CreationOptional<number>

  declare qtyReceived: number

  declare receivedDate: Date

  declare auto: boolean

  // associations

  declare purchaseOrderItemId: ForeignKey<PurchaseOrderItem['id']>

  declare purchaseOrderItem?: NonAttribute<PurchaseOrderItem>

  declare shipmentId?: ForeignKey<Shipment['id']>

  declare shipment?: NonAttribute<Shipment>

  declare public static associations: {
    purchaseOrderItem: Association<ReceivedItem, PurchaseOrderItem>,
    shipment: Association<ReceivedItem, Shipment>,
  }

  // MIXINS
  // purchaseOrderItem:
  declare getPurchaseOrderItem: BelongsToGetAssociationMixin<PurchaseOrderItem>

  declare setPurchaseOrderItem: BelongsToSetAssociationMixin<PurchaseOrderItem, number>

  declare createPurchaseOrderItem: BelongsToCreateAssociationMixin<PurchaseOrderItem>

  // shipment:
  declare getShipment: BelongsToGetAssociationMixin<Shipment>

  declare setShipment: BelongsToSetAssociationMixin<Shipment, number>

  declare createShipment: BelongsToCreateAssociationMixin<Shipment>
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
      auto: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      qtyReceived: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      receivedDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize: db,
    },
  )
}
