import { DataTypes } from 'sequelize'
import { Migration } from '../umzug'

export const up: Migration = async ({ context: queryIterface }) => {
  await queryIterface.createTable('MagentoOrderAddresses', {
    externalId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    externalCustomerAddressId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    externalOrderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    addressType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // foreign keys:
    orderAddressId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'OrderAddresses',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    // timestamps: - none
    // createdAt: {
    //   type: DataTypes.DATE,
    //   defaultValue: DataTypes.NOW,
    // },
    // updatedAt: {
    //   type: DataTypes.DATE,
    //   defaultValue: DataTypes.NOW,
    // },
  })

  // only one MagentoOrderAddress record per orderAddressId
  await queryIterface.addIndex('MagentoOrderAddresses', {
    fields: ['orderAddressId'],
    unique: true,
  })
}

export const down: Migration = async ({ context: queryIterface }) => {
  await queryIterface.dropTable('MagentoOrderAddresses')
}
