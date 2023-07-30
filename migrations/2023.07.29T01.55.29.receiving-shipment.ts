import { DataTypes } from 'sequelize'
// import { MigrationFn } from 'umzug';
import { Migration } from '../umzug'

export const up: Migration = async ({ context: queryIterface }) => {
  await queryIterface.createTable('Shipments', {
    id: {
      type: DataTypes.INTEGER,
      unique: true,
      autoIncrement: true,
      primaryKey: true,
    },
    trackingNumber: DataTypes.STRING,
    eta: DataTypes.DATE,
    dateShipped: DataTypes.DATE,

    // foreign keys:
    carrierId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Carriers',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },

    // timestamps:
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  })
}

export const down: Migration = async ({ context: queryIterface }) => {
  await queryIterface.dropTable('Shipments')
}
