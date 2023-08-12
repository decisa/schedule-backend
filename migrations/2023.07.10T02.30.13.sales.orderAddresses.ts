import { DataTypes } from 'sequelize'
import { Migration } from '../umzug'

export const up: Migration = async ({ context: queryIterface }) => {
  await queryIterface.createTable('OrderAddresses', {
    id: {
      type: DataTypes.INTEGER,
      unique: true,
      autoIncrement: true,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    company: DataTypes.STRING,
    street1: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    street2: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    zipCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    altPhone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    notes: DataTypes.STRING,
    latitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 7),
      allowNull: true,
    },

    // foreign keys:
    // orderId: DataTypes.INTEGER.UNSIGNED, - will be added later
    customerAddressId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Addresses',
        key: 'id',
      },
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
  await queryIterface.dropTable('OrderAddresses')
}
