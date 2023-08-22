import { DataTypes } from 'sequelize'
// import { MigrationFn } from 'umzug';
import { Migration } from '../umzug'

export const up: Migration = async ({ context: queryIterface }) => {
  // reference table for drivers on a trip
  await queryIterface.createTable('Deliveries', {
    id: {
      type: DataTypes.INTEGER,
      unique: true,
      autoIncrement: true,
      primaryKey: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    estimatedDurationString: DataTypes.STRING,
    notes: DataTypes.STRING,

    // foreign keys:
    // orderId
    // shippingAddressId
    // deliveryStopId
    orderId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'Orders',
        key: 'id',
      },
      // do not allow to delete order if delivery is associated with it
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
    shippingAddressId: {
      type: DataTypes.INTEGER,
      allowNull: false, // there should allways be a shipping address
      references: {
        model: 'OrderAddresses',
        key: 'id',
      },
      // do not allow to delete address if delivery is associated with it
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
    deliveryStopId: {
      type: DataTypes.INTEGER,
      allowNull: true, // delivery can be created before trip is created
      references: {
        model: 'DeliveryStops',
        key: 'id',
      },
      // set to null if delivery stop is deleted
      onDelete: 'SET NULL',
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

  await queryIterface.addIndex('OrderAddresses', {
    fields: ['id', 'orderId'],
    unique: true,
    name: 'unique_shippingAddressId_orderId',
  })

  // add constraint on shippingAddressId and orderId to match
  await queryIterface.addConstraint('Deliveries', {
    fields: ['shippingAddressId', 'orderId'],
    type: 'foreign key',
    references: {
      table: 'OrderAddresses',
      // field: 'id',
      fields: ['id', 'orderId'],
    },
    name: 'unique_shippingAddressId_orderId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
}

export const down: Migration = async ({ context: queryIterface }) => {
  await queryIterface.removeConstraint('Deliveries', 'unique_shippingAddressId_orderId')
  await queryIterface.removeIndex('OrderAddresses', 'unique_shippingAddressId_orderId')
  await queryIterface.dropTable('Deliveries')
}
