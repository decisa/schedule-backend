import { DataTypes } from 'sequelize'
import { Migration } from '../umzug'

export const up: Migration = async ({ context: queryIterface }) => {
  await queryIterface.createTable('Orders', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    orderNumber: {
      type: DataTypes.STRING(64),
    },
    orderDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    taxRate: {
      type: DataTypes.DECIMAL(5, 3), // max 99.999%
      defaultValue: 0,
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    shippingCost: {
      type: DataTypes.DECIMAL(8, 2), // max $999,999.99
      defaultValue: 0,
    },
    // foreign keys:
    // declare customerId: ForeignKey<Customer['id']>
    // declare deliveryMethodId: ForeignKey<DeliveryMethod['id']> | null
    // declare shippingAddressId: ForeignKey<OrderAddress['id']> | null
    // declare billingAddressId: ForeignKey<OrderAddress['id']> | null
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Customers',
        key: 'id',
      },
      // restrict deletion of Customer if it is used in an Order
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
    deliveryMethodId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'DeliveryMethods',
        key: 'id',
      },
      // restrict deletion of DeliveryMethod if it is used in an Order
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
    shippingAddressId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'OrderAddresses',
        key: 'id',
      },
      // set to NULL if address is deleted
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    },
    billingAddressId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'OrderAddresses',
        key: 'id',
      },
      // set to NULL if address is deleted
      onDelete: 'SET NULL',
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

  await queryIterface.addIndex('Orders', {
    fields: ['orderNumber'],
    unique: true,
  })
}

export const down: Migration = async ({ context: queryIterface }) => {
  await queryIterface.dropTable('Orders')
}
