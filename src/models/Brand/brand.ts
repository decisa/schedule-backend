// done - One-to-many relationship between Brands and PurchaseOrders.
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
import type { Product } from '../Sales/Product/product'
import type { PurchaseOrder } from '../Receiving/PurchaseOrder/purchaseOrder'

export class Brand extends Model<InferAttributes<Brand>, InferCreationAttributes<Brand>> {
  declare id: CreationOptional<number>

  declare name: string

  declare externalId?: number

  // associations
  declare products?: NonAttribute<Product[]>

  declare purchaseOrders?: NonAttribute<PurchaseOrder[]>

  declare public static associations: {
    products: Association<Brand, Product>,
    purchaseOrders: Association<Brand, PurchaseOrder>,
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

  // PurchaseOrders:
  declare createPurchaseOrder: HasManyCreateAssociationMixin<PurchaseOrder, 'brandId'>

  declare getPurchaseOrders: HasManyGetAssociationsMixin<PurchaseOrder>

  declare countPurchaseOrders: HasManyCountAssociationsMixin

  declare hasPurchaseOrder: HasManyHasAssociationMixin<PurchaseOrder, number>

  declare hasPurchaseOrders: HasManyHasAssociationsMixin<PurchaseOrder, number>

  declare setPurchaseOrders: HasManySetAssociationsMixin<PurchaseOrder, number>

  declare addPurchaseOrder: HasManyAddAssociationMixin<PurchaseOrder, number>

  declare addPurchaseOrders: HasManyAddAssociationsMixin<PurchaseOrder, number>

  declare removePurchaseOrder: HasManyRemoveAssociationMixin<PurchaseOrder, number>

  declare removePurchaseOrders: HasManyRemoveAssociationsMixin<PurchaseOrder, number>
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
