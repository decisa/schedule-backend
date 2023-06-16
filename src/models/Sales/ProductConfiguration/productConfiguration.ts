// done: One-to-many relationship between ProductConfigurations and PurchaseOrderItems.
// done: many-to-many relationship between RouteStops and ProductConfigurations through RouteStopItems
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
  BelongsToManyAddAssociationMixin,
  BelongsToManyAddAssociationsMixin,
  BelongsToManyCountAssociationsMixin,
  BelongsToManyCreateAssociationMixin,
  BelongsToManyGetAssociationsMixin,
  BelongsToManyHasAssociationMixin,
  BelongsToManyHasAssociationsMixin,
  BelongsToManyRemoveAssociationMixin,
  BelongsToManyRemoveAssociationsMixin,
  BelongsToManySetAssociationsMixin,
} from 'sequelize'
import type { Product } from '../Product/product'
import type { Order } from '../Order/order'
import type { ProductOption } from '../ProductOption/productOption'
import type { RouteStop } from '../../Delivery/RouteStop/routeStop'
import { PurchaseOrderItem } from '../../Receiving/PurchaseOrderItem/purchaseOrderItem'

export class ProductConfiguration extends Model<InferAttributes<ProductConfiguration>, InferCreationAttributes<ProductConfiguration>> {
  declare id: CreationOptional<number>

  declare createdAt: CreationOptional<Date>

  declare updatedAt: CreationOptional<Date>

  declare sku: string | null

  declare externalId: number | null

  declare volume: number | null

  declare price: number | null

  declare totalTax: number | null

  declare totalDiscount: number | null

  declare qtyOrdered: number

  declare qtyRefunded: number

  declare qtyShipped: number

  // associations

  declare productId?: ForeignKey<Product['id']>

  declare orderId: ForeignKey<Order['id']>

  declare product?: NonAttribute<Product>

  declare order?: NonAttribute<Order>

  declare options?: NonAttribute<ProductOption[]>

  declare routeStops?: NonAttribute<RouteStop[]>

  declare purchaseOrderItems?: NonAttribute<PurchaseOrderItem[]>

  declare public static associations: {
    product: Association<ProductConfiguration, Product>,
    order: Association<ProductConfiguration, Order>,
    options: Association<ProductConfiguration, ProductOption>,
    routeStops: Association<ProductConfiguration, RouteStop>,
    purchaseOrderItems: Association<ProductConfiguration, PurchaseOrderItem>,
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

  // routeStops:
  declare createRouteStop: BelongsToManyCreateAssociationMixin<RouteStop>

  declare setRouteStops: BelongsToManySetAssociationsMixin<RouteStop, number>

  declare removeRouteStop: BelongsToManyRemoveAssociationMixin<RouteStop, number>

  declare removeRouteStops: BelongsToManyRemoveAssociationsMixin<RouteStop, number>

  declare hasRouteStops: BelongsToManyHasAssociationsMixin<RouteStop, number>

  declare hasRouteStop: BelongsToManyHasAssociationMixin<RouteStop, number>

  declare getRouteStops: BelongsToManyGetAssociationsMixin<RouteStop>

  declare countRouteStops: BelongsToManyCountAssociationsMixin

  declare addRouteStops: BelongsToManyAddAssociationsMixin<RouteStop, number>

  declare addRouteStop: BelongsToManyAddAssociationMixin<RouteStop, number>

  // purchaseOrderItems:
  declare createPurchaseOrderItem: HasManyCreateAssociationMixin<PurchaseOrderItem, 'productConfigurationId'>

  declare getPurchaseOrderItems: HasManyGetAssociationsMixin<PurchaseOrderItem>

  declare countPurchaseOrderItems: HasManyCountAssociationsMixin

  declare hasPurchaseOrderItem: HasManyHasAssociationMixin<PurchaseOrderItem, number>

  declare hasPurchaseOrderItems: HasManyHasAssociationsMixin<PurchaseOrderItem, number>

  declare setPurchaseOrderItems: HasManySetAssociationsMixin<PurchaseOrderItem, number>

  declare addPurchaseOrderItem: HasManyAddAssociationMixin<PurchaseOrderItem, number>

  declare addPurchaseOrderItems: HasManyAddAssociationsMixin<PurchaseOrderItem, number>

  declare removePurchaseOrderItem: HasManyRemoveAssociationMixin<PurchaseOrderItem, number>

  declare removePurchaseOrderItems: HasManyRemoveAssociationsMixin<PurchaseOrderItem, number>
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
      price: {
        type: DataTypes.DECIMAL(8, 2),
        get() {
          const rawValue = this.getDataValue('price')
          return Number(rawValue)
        },
      },
      totalTax: {
        type: DataTypes.DECIMAL(8, 2),
        get() {
          const rawValue = this.getDataValue('totalTax')
          return Number(rawValue)
        },
      },
      totalDiscount: {
        type: DataTypes.DECIMAL(8, 2),
        get() {
          const rawValue = this.getDataValue('totalDiscount')
          return Number(rawValue)
        },
      },
      qtyOrdered: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      qtyRefunded: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      qtyShipped: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
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
      ],
    },
  )
}
