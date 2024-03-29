import { DataTypes } from 'sequelize'
// import { MigrationFn } from 'umzug';
import { Migration } from '../umzug'

export const up: Migration = async ({ context: queryIterface }) => {
  await queryIterface.createTable('ShipmentItems', {
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

    // foreign keys:
    shipmentId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Shipments',
        key: 'id',
      },
      // if shipment is deleted, delete these records too
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    purchaseOrderItemId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'PurchaseOrderItems',
        key: 'id',
      },
      // restrict deletion of purchaseOrderItem if shipments exist
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },

    // timestamps:
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  })
}

export const down: Migration = async ({ context: queryIterface }) => {
  await queryIterface.dropTable('ShipmentItems')
}
