// 11 Shipments:

// id (PK)
// shipment_number
// shipper_id (FK from Carriers)
// eta (nullable)
// actual_arrival_date (nullable)
// created_at
// updated_at

// done - One-to-many relationship between Carriers and Shipments.
// done - One-to-many relationship between Shipments and ShipmentItems.
// done - One-to-many relationship between Shipments and ReceivedItems (nullable).
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
import type { Carrier } from '../Carrier/carrier'
import type { ShipmentItem } from '../ShipmentItem/shipmentItem'
import type { ReceivedItem } from '../ReceivedItems/receivedItems'

export class Shipment extends Model<InferAttributes<Shipment>, InferCreationAttributes<Shipment>> {
  declare id: CreationOptional<number>

  declare trackingNumber: string | null

  declare eta: Date | null

  declare dateShipped: Date

  declare createdAt: CreationOptional<Date>

  declare updatedAt: CreationOptional<Date>

  // associations

  declare carrier?: NonAttribute<Carrier>

  declare carrierId: ForeignKey<Carrier['id']>

  declare items?: NonAttribute<ShipmentItem[]>

  // fixme: receivedItems should be on the ShipmentItem model
  // declare receivedItems?: NonAttribute<ReceivedItem[]>

  declare public static associations: {
    carrier: Association<Shipment, Carrier>,
    items: Association<Shipment, ShipmentItem>,
    // receivedItems: Association<Shipment, ReceivedItem>,
  }

  // MIXINS
  // carrier:
  declare getCarrier: BelongsToGetAssociationMixin<Carrier>

  declare setCarrier: BelongsToSetAssociationMixin<Carrier, number>

  declare createCarrier: BelongsToCreateAssociationMixin<Carrier>

  // items:
  declare createShipmentItem: HasManyCreateAssociationMixin<ShipmentItem, 'shipmentId'>

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
  // declare createReceivedItem: HasManyCreateAssociationMixin<ReceivedItem, 'shipmentId'>

  // declare getReceivedItems: HasManyGetAssociationsMixin<ReceivedItem>

  // declare countReceivedItems: HasManyCountAssociationsMixin

  // declare hasReceivedItem: HasManyHasAssociationMixin<ReceivedItem, number>

  // declare hasReceivedItems: HasManyHasAssociationsMixin<ReceivedItem, number>

  // declare setReceivedItems: HasManySetAssociationsMixin<ReceivedItem, number>

  // declare addReceivedItem: HasManyAddAssociationMixin<ReceivedItem, number>

  // declare addReceivedItems: HasManyAddAssociationsMixin<ReceivedItem, number>

  // declare removeReceivedItem: HasManyRemoveAssociationMixin<ReceivedItem, number>

  // declare removeReceivedItems: HasManyRemoveAssociationsMixin<ReceivedItem, number>
}

export function initShipment(db: Sequelize) {
  Shipment.init(
    {
      id: {
        type: DataTypes.INTEGER,
        unique: true,
        autoIncrement: true,
        primaryKey: true,
      },
      // fixme: trackingNumber should be unique per carrier ID
      trackingNumber: DataTypes.STRING,
      eta: DataTypes.DATE,
      dateShipped: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
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
    },
  )
}
