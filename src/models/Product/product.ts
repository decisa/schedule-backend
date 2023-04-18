import {
  Association,
  BelongsToCreateAssociationMixin,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  CreationOptional, DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model, Sequelize,
} from 'sequelize'
import type { Brand } from '../Brand/brand'

export class Product extends Model<InferAttributes<Product>, InferCreationAttributes<Product>> {
  declare id: CreationOptional<number>

  declare type: string

  declare name: string

  declare url?: string

  declare image?: string

  // declare brandId:

  declare productSpecs?: string

  declare assemblyInstructions?: string

  declare volume?: number

  declare sku?: string

  declare externalId?: number

  // associations

  declare brandId: ForeignKey<Brand['id']>

  declare public static associations: {
    products: Association<Product, Brand>,
  }

  // MIXINS
  // brand:
  declare getBrand: BelongsToGetAssociationMixin<Brand>

  declare setBrand: BelongsToSetAssociationMixin<Brand, number>

  declare createBrand: BelongsToCreateAssociationMixin<Brand>
}

export function initProducts(db: Sequelize) {
  Product.init(
    {
      id: {
        type: DataTypes.INTEGER,
        unique: true,
        autoIncrement: true,
        primaryKey: true,
      },
      type: DataTypes.STRING,
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
    },
    {
      sequelize: db,
      indexes: [
        {
          unique: true,
          fields: ['externalId'],
        },
        {
          unique: true,
          fields: ['sku'],
        },
      ],
    },
  )
}
