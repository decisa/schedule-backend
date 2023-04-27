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
