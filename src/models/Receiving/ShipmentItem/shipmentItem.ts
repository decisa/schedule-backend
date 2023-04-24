// 12. ShipmentItems:
// id (PK)
// shipment_id (FK from Shipments)
// purchase_order_item_id (FK from PurchaseOrderItems)
// qtyShipped
// created_at
// updated_at

// done - One-to-many relationship between Shipments and ShipmentItems.
// done - One-to-many relationship between PurchaseOrderItems and ShipmentItems.
import {
  Association, CreationOptional, InferAttributes, InferCreationAttributes, Model, NonAttribute, Sequelize, DataTypes, ForeignKey,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  BelongsToCreateAssociationMixin,
} from 'sequelize'
import type { Shipment } from '../Shipment/shipment'
import type { PurchaseOrderItem } from '../PurchaseOrderItem/purchaseOrderItem'

export class ShipmentItem extends Model<InferAttributes<ShipmentItem>, InferCreationAttributes<ShipmentItem>> {
  declare id: CreationOptional<number>

  declare qtyShipped: number
  // shipment_id (FK from Shipments)
  // purchase_order_item_id (FK from PurchaseOrderItems)

  // associations

  declare shipment?: NonAttribute<Shipment>

  declare shipmentId: ForeignKey<Shipment['id']>

  declare purchaseOrderItem?: NonAttribute<PurchaseOrderItem>

  declare purchaseOrderItemId: ForeignKey<PurchaseOrderItem['id']>

  declare public static associations: {
    shipment: Association<ShipmentItem, Shipment>,
    purchaseOrderItem: Association<ShipmentItem, PurchaseOrderItem>,
  }

  // MIXINS
  // shipment:
  declare getShipment: BelongsToGetAssociationMixin<Shipment>

  declare setShipment: BelongsToSetAssociationMixin<Shipment, number>

  declare createShipment: BelongsToCreateAssociationMixin<Shipment>

  // purchaseOrderItem:
  declare getPurchaseOrderItem: BelongsToGetAssociationMixin<PurchaseOrderItem>

  declare setPurchaseOrderItem: BelongsToSetAssociationMixin<PurchaseOrderItem, number>

  declare createPurchaseOrderItem: BelongsToCreateAssociationMixin<PurchaseOrderItem>
}

export function initShipmentItem(db: Sequelize) {
  ShipmentItem.init(
    {
      id: {
        type: DataTypes.INTEGER,
        unique: true,
        autoIncrement: true,
        primaryKey: true,
      },
      qtyShipped: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize: db,
    },
  )
}
