import { DataTypes } from 'sequelize'
// import { MigrationFn } from 'umzug';
import { Migration } from '../umzug'

export const up: Migration = async ({ context: queryIterface }) => {
  // reference table for drivers on a trip
  await queryIterface.createTable('DeliveryItems', {
    id: {
      type: DataTypes.INTEGER,
      unique: true,
      autoIncrement: true,
      primaryKey: true,
    },
    qty: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // foreign keys:
    // configurationId
    // deliveryId
    configurationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ProductConfigurations',
        key: 'id',
      },
      // do not allow to delete productConfigurations if delivery items are associated with it
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
    deliveryId: {
      type: DataTypes.INTEGER,
      allowNull: false, // delivery items are always associated with a delivery
      references: {
        model: 'Deliveries',
        key: 'id',
      },
      // clean up delivery items if delivery is deleted
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    // timestamps:
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  })
}

export const down: Migration = async ({ context: queryIterface }) => {
  await queryIterface.dropTable('DeliveryItems')
}
