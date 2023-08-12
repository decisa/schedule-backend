import { DataTypes } from 'sequelize'
import { Migration } from '../umzug'

export const up: Migration = async ({ context: queryIterface }) => {
  await queryIterface.createTable('Customers', {
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
    company: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: DataTypes.STRING,
    altPhone: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // will add after addresses are created:
    // defaultShippingId: {
    //   type: DataTypes.INTEGER,
    //   allowNull: true,
    // },
    // foreign keys: - no fk
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

  await queryIterface.addIndex('Customers', {
    fields: ['email'],
    unique: true,
  })
}

export const down: Migration = async ({ context: queryIterface }) => {
  await queryIterface.dropTable('Customers')
}
