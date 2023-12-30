import {
  Association, CreationOptional, InferAttributes, InferCreationAttributes, Model, NonAttribute, Sequelize, DataTypes,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  BelongsToCreateAssociationMixin,
  ForeignKey,
} from 'sequelize'

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

  declare public static associations: {
    shipmentItem: Association<ReceivedItem, ShipmentItem>,
  }

  // MIXINS
  // shipmentItem:
  declare getShipmentItem: BelongsToGetAssociationMixin<ShipmentItem>

  declare setShipmentItem: BelongsToSetAssociationMixin<ShipmentItem, number>

  declare createShipmentItem: BelongsToCreateAssociationMixin<ShipmentItem>
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
