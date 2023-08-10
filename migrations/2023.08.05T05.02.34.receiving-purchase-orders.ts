import { DataTypes } from 'sequelize'
// import { MigrationFn } from 'umzug';
import { Migration } from '../umzug'

export const up: Migration = async ({ context: queryIterface }) => {
  await queryIterface.createTable('PurchaseOrders', {
    id: {
      type: DataTypes.INTEGER,
      unique: true,
      autoIncrement: true,
      primaryKey: true,
    },
    poNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      // uniqueness is handled by index
    },
    dateSubmitted: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    productionWeeks: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // timestamps:
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,

    // foreign keys:
    orderId: {
      type: DataTypes.INTEGER.UNSIGNED,
      references: {
        model: 'Orders',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    brandId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Brands',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  })

  await queryIterface.addIndex('PurchaseOrders', {
    unique: true,
    fields: ['poNumber'],
  })
}

export const down: Migration = async ({ context: queryIterface }) => {
  await queryIterface.dropTable('PurchaseOrders')
}
