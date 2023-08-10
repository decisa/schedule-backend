import { DataTypes } from 'sequelize'
import { Migration } from '../umzug'

export const up: Migration = async ({ context: queryIterface }) => {
  await queryIterface.createTable('Brands', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(64),
    },
    externalId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    // foreign keys: - no fk
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

  await queryIterface.addIndex('Brands', {
    fields: ['externalId'],
    unique: true,
  })
}

export const down: Migration = async ({ context: queryIterface }) => {
  await queryIterface.dropTable('Brands')
}
