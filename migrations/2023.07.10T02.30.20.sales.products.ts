import { DataTypes } from 'sequelize'
import { Migration } from '../umzug'
import { ProductType } from '../src/models/Sales/Product/product'

export const up: Migration = async ({ context: queryIterface }) => {
  await queryIterface.createTable('Products', {
    id: {
      type: DataTypes.INTEGER,
      unique: true,
      autoIncrement: true,
      primaryKey: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'custom' satisfies ProductType,
    },
    name: DataTypes.STRING,
    url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    productSpecs: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    assemblyInstructions: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    volume: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    sku: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    externalId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    // foreign keys:
    // declare brandId: ForeignKey<Brand['id']> | null
    brandId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Brands',
        key: 'id',
      },
      // set to NULL if brand is deleted
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

  await queryIterface.addIndex('Products', {
    fields: ['externalId'],
    unique: true,
  })

  await queryIterface.addIndex('Products', {
    fields: ['sku'],
    unique: true,
  })
}

export const down: Migration = async ({ context: queryIterface }) => {
  await queryIterface.dropTable('Products')
}
