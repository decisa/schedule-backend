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
import type { Product } from '../Product/product'
import type { Order } from '../Order/order'
import type { ProductOption } from '../ProductOption/productOption'

export class ProductConfiguration extends Model<InferAttributes<ProductConfiguration>, InferCreationAttributes<ProductConfiguration>> {
  declare id: CreationOptional<number>

  declare sku?: string

  declare externalId?: number

  declare volume?: number

  declare price?: number

  declare totalTax?: number

  declare totalDiscount?: number

  declare qtyOrdered: number

  declare qtyCanceled?: number

  declare qtyRefunded?: number

  declare qtyShipped?: number

  declare qtyInvoiced?: number

  // associations

  declare productId?: ForeignKey<Product['id']>

  declare orderId: ForeignKey<Order['id']>

  declare product?: NonAttribute<Product>

  declare order?: NonAttribute<Order>

  declare options?: NonAttribute<ProductOption[]>

  declare public static associations: {
    product: Association<ProductConfiguration, Product>,
    order: Association<ProductConfiguration, Order>,
    options: Association<ProductConfiguration, ProductOption>,
  }

  // MIXINS
  // product:
  declare getProduct: BelongsToGetAssociationMixin<Product>

  declare setProduct: BelongsToSetAssociationMixin<Product, number>

  declare createProduct: BelongsToCreateAssociationMixin<Product>

  // order:
  declare getOrder: BelongsToGetAssociationMixin<Order>

  declare setOrder: BelongsToSetAssociationMixin<Order, number>

  declare createOrder: BelongsToCreateAssociationMixin<Order>

  // options:
  declare createProductOption: HasManyCreateAssociationMixin<ProductOption, 'configId'>

  declare getProductOptions: HasManyGetAssociationsMixin<ProductOption>

  declare countProductOptions: HasManyCountAssociationsMixin

  declare hasProductOption: HasManyHasAssociationMixin<ProductOption, number>

  declare hasProductOptions: HasManyHasAssociationsMixin<ProductOption, number>

  declare setProductOptions: HasManySetAssociationsMixin<ProductOption, number>

  declare addProductOption: HasManyAddAssociationMixin<ProductOption, number>

  declare addProductOptions: HasManyAddAssociationsMixin<ProductOption, number>

  declare removeProductOption: HasManyRemoveAssociationMixin<ProductOption, number>

  declare removeProductOptions: HasManyRemoveAssociationsMixin<ProductOption, number>
}

export function initProductConfigurations(db: Sequelize) {
  ProductConfiguration.init(
    {
      id: {
        type: DataTypes.INTEGER,
        unique: true,
        autoIncrement: true,
        primaryKey: true,
      },
      sku: DataTypes.STRING,
      externalId: DataTypes.INTEGER,
      volume: DataTypes.FLOAT,
      price: DataTypes.DECIMAL(8, 2),
      totalTax: DataTypes.DECIMAL(8, 2),
      totalDiscount: DataTypes.DECIMAL(8, 2),
      qtyOrdered: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      qtyCanceled: DataTypes.INTEGER,
      qtyRefunded: DataTypes.INTEGER,
      qtyShipped: DataTypes.INTEGER,
      qtyInvoiced: DataTypes.INTEGER,

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
