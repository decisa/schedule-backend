import {
  Association,
  BelongsToCreateAssociationMixin,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  CreationOptional, DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model, NonAttribute, Sequelize,
  HasManyCreateAssociationMixin,
  HasManyGetAssociationsMixin,
  HasManyCountAssociationsMixin,
  HasManyHasAssociationMixin,
  HasManyHasAssociationsMixin,
  HasManySetAssociationsMixin,
  HasManyAddAssociationMixin,
  HasManyAddAssociationsMixin,
  HasManyRemoveAssociationMixin,
  HasManyRemoveAssociationsMixin,
} from 'sequelize'
import type { Brand } from '../../Brand/brand'
import type { ProductConfiguration } from '../ProductConfiguration/productConfiguration'

export const productTypes = ['simple', 'configurable', 'custom'] as const

export type ProductType = typeof productTypes[number]

export class Product extends Model<InferAttributes<Product>, InferCreationAttributes<Product>> {
  declare id: CreationOptional<number>

  declare createdAt: CreationOptional<Date>

  declare updatedAt: CreationOptional<Date>

  declare type: ProductType

  declare name: string

  declare url: string | null

  declare image: string | null

  // declare brandId:

  declare productSpecs: string | null

  declare assemblyInstructions: string | null

  declare volume: number | null

  declare sku: string | null

  declare externalId: number | null

  // associations

  declare brandId: ForeignKey<Brand['id']>

  declare brand: NonAttribute<Brand>

  declare configurations?: NonAttribute<ProductConfiguration[]>

  declare public static associations: {
    brand: Association<Product, Brand>,
    configurations: Association<Product, ProductConfiguration>,
  }

  // MIXINS
  // brand:
  declare getBrand: BelongsToGetAssociationMixin<Brand>

  declare setBrand: BelongsToSetAssociationMixin<Brand, number>

  declare createBrand: BelongsToCreateAssociationMixin<Brand>

  // configurations:
  declare createProductConfiguration: HasManyCreateAssociationMixin<ProductConfiguration, 'productId'>

  declare getProductConfigurations: HasManyGetAssociationsMixin<ProductConfiguration>

  declare countProductConfigurations: HasManyCountAssociationsMixin

  declare hasProductConfiguration: HasManyHasAssociationMixin<ProductConfiguration, number>

  declare hasProductConfigurations: HasManyHasAssociationsMixin<ProductConfiguration, number>

  declare setProductConfigurations: HasManySetAssociationsMixin<ProductConfiguration, number>

  declare addProductConfiguration: HasManyAddAssociationMixin<ProductConfiguration, number>

  declare addProductConfigurations: HasManyAddAssociationsMixin<ProductConfiguration, number>

  declare removeProductConfiguration: HasManyRemoveAssociationMixin<ProductConfiguration, number>

  declare removeProductConfigurations: HasManyRemoveAssociationsMixin<ProductConfiguration, number>
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
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
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
