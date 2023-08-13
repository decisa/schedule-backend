import { DataTypes } from 'sequelize'
import { Migration } from '../umzug'

export const up: Migration = async ({ context: queryIterface }) => {
  await queryIterface.createTable('MagentoAddresses', {
    externalId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    addressType: {
      type: DataTypes.STRING,
    },
    // foreign keys:
    addressId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Addresses',
        key: 'id',
      },
      // if original address is deleted, delete this record too
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

  // only one magento address record per addressId
  await queryIterface.addIndex('MagentoAddresses', {
    fields: ['addressId'],
    unique: true,
  })
}

export const down: Migration = async ({ context: queryIterface }) => {
  await queryIterface.dropTable('MagentoAddresses')
}
