import { DataTypes } from 'sequelize'
// import { MigrationFn } from 'umzug';
import { Migration } from '../umzug'

export const up: Migration = async ({ context: queryIterface }) => {
  await queryIterface.createTable('ReceivedItems', {
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
    // foreign keys:
    shipmentItemId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'ShipmentItems',
        key: 'id',
      },
      // if items were received, don't allow to delete the shipment items
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
    // timestamps:
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  })
}

export const down: Migration = async ({ context: queryIterface }) => {
  await queryIterface.dropTable('ReceivedItems')
}
