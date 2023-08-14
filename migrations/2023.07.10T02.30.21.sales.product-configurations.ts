import { DataTypes } from 'sequelize'
import { Migration } from '../umzug'

export const up: Migration = async ({ context: queryIterface }) => {
  await queryIterface.createTable('ProductConfigurations', {
    id: {
      type: DataTypes.INTEGER,
      unique: true,
      autoIncrement: true,
      primaryKey: true,
    },
    sku: DataTypes.STRING,
    externalId: DataTypes.INTEGER,
    volume: DataTypes.FLOAT,
    price: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
    },
    totalTax: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
    },
    totalDiscount: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
    },
    qtyOrdered: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    qtyRefunded: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    qtyShippedExternal: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    // foreign keys:
    // declare productId?: ForeignKey<Product['id']>
    // declare orderId: ForeignKey<Order['id']>
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Products',
        key: 'id',
      },
      // if main product is deleted - delete all of its configurations
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    orderId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'Orders',
        key: 'id',
      },
      // if order is deleted - delete all related product configurations
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    // timestamps: - no timestamps
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  })

  await queryIterface.addIndex('ProductConfigurations', {
    fields: ['externalId'],
    unique: true,
  })
}

export const down: Migration = async ({ context: queryIterface }) => {
  await queryIterface.dropTable('ProductConfigurations')
}
