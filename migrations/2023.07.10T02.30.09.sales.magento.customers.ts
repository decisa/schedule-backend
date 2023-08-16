import { DataTypes } from 'sequelize'
import { Migration } from '../umzug'

export const up: Migration = async ({ context: queryIterface }) => {
  await queryIterface.createTable('MagentoCustomers', {
    externalGroupId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    isGuest: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    externalCustomerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    // foreign keys:
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Customers',
        key: 'email',
      },
      // if customer is deleted, delete this record too
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    // timestamps: - no timestamps
    // createdAt: {
    //   type: DataTypes.DATE,
    //   defaultValue: DataTypes.NOW,
    // },
    // updatedAt: {
    //   type: DataTypes.DATE,
    //   defaultValue: DataTypes.NOW,
    // },
  })

  await queryIterface.addIndex('MagentoCustomers', {
    fields: ['email'],
    unique: true,
  })

  await queryIterface.addIndex('MagentoCustomers', {
    fields: ['externalCustomerId'],
    unique: true,
  })
}

export const down: Migration = async ({ context: queryIterface }) => {
  await queryIterface.dropTable('MagentoCustomers')
}
