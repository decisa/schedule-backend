import {
  Association,
  CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, NonAttribute, Sequelize,
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
import type { Product } from '../Product/product'

export class Brand extends Model<InferAttributes<Brand>, InferCreationAttributes<Brand>> {
  declare id: CreationOptional<number>

  declare name: string

  declare externalId?: number

  // associations
  declare products?: NonAttribute<Product>

  declare public static associations: {
    products: Association<Brand, Product>,
  }

  // MIXINS
  // products:
  declare createProduct: HasManyCreateAssociationMixin<Product, 'brandId'>

  declare getProducts: HasManyGetAssociationsMixin<Product>

  declare countProducts: HasManyCountAssociationsMixin

  declare hasProduct: HasManyHasAssociationMixin<Product, number>

  declare hasProducts: HasManyHasAssociationsMixin<Product, number>

  declare setProducts: HasManySetAssociationsMixin<Product, number>

  declare addProduct: HasManyAddAssociationMixin<Product, number>

  declare addProducts: HasManyAddAssociationsMixin<Product, number>

  declare removeProduct: HasManyRemoveAssociationMixin<Product, number>

  declare removeProducts: HasManyRemoveAssociationsMixin<Product, number>
}

export function initBrands(db: Sequelize) {
  Brand.init(
    {
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
    },
    {
      sequelize: db,
      indexes: [
        {
          unique: true,
          fields: ['externalId'],
        },
      ],
    },
  )
}
