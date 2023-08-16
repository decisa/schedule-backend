import { DataTypes } from 'sequelize'
import { Migration } from '../umzug'

export const up: Migration = async ({ context: queryIterface }) => {
  await queryIterface.createTable('MagentoOrders', {
    externalId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    externalQuoteId: {
      type: DataTypes.INTEGER,
    },
    state: {
      type: DataTypes.STRING(64),
    },
    status: {
      type: DataTypes.STRING(64),
    },
    // foreign keys:
    orderId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'Orders',
        key: 'id',
      },
      // if order is deleted, delete this record too
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    // timestamps: - just updated at
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  })
}

export const down: Migration = async ({ context: queryIterface }) => {
  await queryIterface.dropTable('MagentoOrders')
}
