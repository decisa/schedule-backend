// TODO: One-to-many relationship between Order and PurchaseOrders.
// TODO: One-to-many relationship between Order and RouteStops. (nullable)
// DONE: One-to-many relationship between Orders and OrderAvailability.

import {
  InferAttributes,
  Model,
  InferCreationAttributes,
  CreationOptional,
  DataTypes,
  NonAttribute,
  Association,
  HasOneGetAssociationMixin,
  HasOneCreateAssociationMixin,
  HasOneSetAssociationMixin,
  Sequelize,
  ForeignKey,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  BelongsToCreateAssociationMixin,
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

// import db from '..'
import type { MagentoOrder } from '../MagentoOrder/magentoOrder'
import type { Customer } from '../Customer/customer'
import type { OrderAddress } from '../OrderAddress/orderAddress'
import type { OrderComment } from '../OrderComment/orderComment'
import type { ProductConfiguration } from '../ProductConfiguration/productConfiguration'
import type { OrderAvailability } from '../../Delivery/OrderAvailability/orderAvailability'

console.log('running model module')

export class Order extends Model<InferAttributes<Order>, InferCreationAttributes<Order>> {
  // id can be undefined during creation when using `autoIncrement`
  declare id: CreationOptional<number>

  declare orderNumber: string

  declare shippingCost: number

  declare paymentMethod: string

  declare taxRate: number

  declare orderDate: Date

  declare createdAt: CreationOptional<Date>

  // updatedAt can be undefined during creation
  declare updatedAt: CreationOptional<Date>

  // ASSOCIATIONS:

  declare customerId: ForeignKey<Customer['id']>

  declare customer?: NonAttribute<Customer>

  declare shippingAddressId?: ForeignKey<OrderAddress['id']>

  declare shippingAddress?: NonAttribute<OrderAddress>

  declare billingAddressId?: ForeignKey<OrderAddress['id']>

  declare billingAddress?: NonAttribute<OrderAddress>

  declare magento?: NonAttribute<MagentoOrder>

  declare addresses?: NonAttribute<OrderAddress[]>

  declare comments?: NonAttribute<OrderComment[]>

  declare products?: NonAttribute<ProductConfiguration[]>

  declare orderAvailabilities?: NonAttribute<OrderAvailability[]>

  declare public static associations: {
    magento: Association<Order, MagentoOrder>,
    customer: Association<Order, Customer>,
    addresses: Association<Order, OrderAddress>,
    comments: Association<Order, OrderComment>,
    billingAddress: Association<Order, OrderAddress>,
    shippingAddress: Association<Order, OrderAddress>,
    products: Association<Order, ProductConfiguration>,
    orderAvailabilities: Association<Order, OrderAvailability>,
  }

  // MIXINS
  // magento record:
  declare getMagento: HasOneGetAssociationMixin<MagentoOrder>

  declare createMagento: HasOneCreateAssociationMixin<MagentoOrder>

  declare setMagento: HasOneSetAssociationMixin<MagentoOrder, number>

  // customer record:
  declare getCustomer: BelongsToGetAssociationMixin<Customer>

  declare setCustomer: BelongsToSetAssociationMixin<Customer, number>

  declare createCustomer: BelongsToCreateAssociationMixin<Customer>

  // addresses:
  declare createAddress: HasManyCreateAssociationMixin<OrderAddress, 'orderId'>

  declare getAddresses: HasManyGetAssociationsMixin<OrderAddress>

  declare countAddresses: HasManyCountAssociationsMixin

  declare hasAddress: HasManyHasAssociationMixin<OrderAddress, number>

  declare hasAddresses: HasManyHasAssociationsMixin<OrderAddress, number>

  declare setAddresses: HasManySetAssociationsMixin<OrderAddress, number>

  declare addAddress: HasManyAddAssociationMixin<OrderAddress, number>

  declare addAddresses: HasManyAddAssociationsMixin<OrderAddress, number>

  declare removeAddress: HasManyRemoveAssociationMixin<OrderAddress, number>

  declare removeAddresses: HasManyRemoveAssociationsMixin<OrderAddress, number>

  // billingAddress:
  declare getBillingAddress: BelongsToGetAssociationMixin<OrderAddress>

  declare setBillingAddress: BelongsToSetAssociationMixin<OrderAddress, number>

  // disable createBillingAddress, since sequelize could not create proper foreign key constraint:
  // declare createBillingAddress: BelongsToCreateAssociationMixin<OrderAddress>

  // shippingAddress:
  declare getShippingAddress: BelongsToGetAssociationMixin<OrderAddress>

  declare setShippingAddress: BelongsToSetAssociationMixin<OrderAddress, number>

  declare createShippingAddress: BelongsToCreateAssociationMixin<OrderAddress>

  // comments:
  declare createComment: HasManyCreateAssociationMixin<OrderComment, 'orderId'>

  declare getComments: HasManyGetAssociationsMixin<OrderComment>

  declare countComments: HasManyCountAssociationsMixin

  declare hasComment: HasManyHasAssociationMixin<OrderComment, number>

  declare hasComments: HasManyHasAssociationsMixin<OrderComment, number>

  declare setComments: HasManySetAssociationsMixin<OrderComment, number>

  declare addComment: HasManyAddAssociationMixin<OrderComment, number>

  declare addComments: HasManyAddAssociationsMixin<OrderComment, number>

  declare removeComment: HasManyRemoveAssociationMixin<OrderComment, number>

  declare removeComments: HasManyRemoveAssociationsMixin<OrderComment, number>

  // productConfigurations:
  declare createProductConfiguration: HasManyCreateAssociationMixin<ProductConfiguration, 'orderId'>

  declare getProductConfigurations: HasManyGetAssociationsMixin<ProductConfiguration>

  declare countProductConfigurations: HasManyCountAssociationsMixin

  declare hasProductConfiguration: HasManyHasAssociationMixin<ProductConfiguration, number>

  declare hasProductConfigurations: HasManyHasAssociationsMixin<ProductConfiguration, number>

  declare setProductConfigurations: HasManySetAssociationsMixin<ProductConfiguration, number>

  declare addProductConfiguration: HasManyAddAssociationMixin<ProductConfiguration, number>

  declare addProductConfigurations: HasManyAddAssociationsMixin<ProductConfiguration, number>

  declare removeProductConfiguration: HasManyRemoveAssociationMixin<ProductConfiguration, number>

  declare removeProductConfigurations: HasManyRemoveAssociationsMixin<ProductConfiguration, number>

  // orderAvailabilities:
  declare createOrderAvailability: HasManyCreateAssociationMixin<OrderAvailability, 'orderId'>

  declare getOrderAvailabilities: HasManyGetAssociationsMixin<OrderAvailability>

  declare countOrderAvailabilities: HasManyCountAssociationsMixin

  declare hasOrderAvailability: HasManyHasAssociationMixin<OrderAvailability, number>

  declare hasOrderAvailabilities: HasManyHasAssociationsMixin<OrderAvailability, number>

  declare setOrderAvailabilities: HasManySetAssociationsMixin<OrderAvailability, number>

  declare addOrderAvailability: HasManyAddAssociationMixin<OrderAvailability, number>

  declare addOrderAvailabilities: HasManyAddAssociationsMixin<OrderAvailability, number>

  declare removeOrderAvailability: HasManyRemoveAssociationMixin<OrderAvailability, number>

  declare removeOrderAvailabilities: HasManyRemoveAssociationsMixin<OrderAvailability, number>
}

export function initOrder(db: Sequelize) {
  Order.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      orderNumber: {
        type: DataTypes.STRING(64),
      },
      orderDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      taxRate: {
        type: DataTypes.DECIMAL(5, 3), // max 99.999%
        get() {
          const rawValue = this.getDataValue('taxRate')
          return Number(rawValue)
        },
      },
      paymentMethod: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      shippingCost: {
        type: DataTypes.DECIMAL(8, 2), // max $999,999.99
        defaultValue: 0,
        get() {
          const rawValue = this.getDataValue('shippingCost')
          return Number(rawValue)
        },
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      indexes: [
        {
          unique: true,
          fields: ['orderNumber'],
        },
      ],
      // tableName: 'users',
      sequelize: db, // passing the `sequelize` instance is required
    },
  )
}

// Order.hasOne(MagentoOrder, {
//   as: 'magento',
//   sourceKey: 'id',
//   foreignKey: {
//     name: 'orderId',
//     allowNull: false,
//   },
//   onDelete: 'CASCADE',
//   onUpdate: 'CASCADE',
// })
