// TODO: One-to-many relationship between Order and PurchaseOrders.
// TODO: One-to-many relationship between Order and RouteStops. (nullable)
// DONE: One-to-many relationship between Orders and OrderAvailability.
// TODO: One-to-many relationship between DeliveryMethod and Orders

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
import type { MagentoOrder } from '../MagentoOrder/magentoOrder'
import type { Customer } from '../Customer/customer'
import type { OrderComment } from '../OrderComment/orderComment'
import type { ProductConfiguration } from '../ProductConfiguration/productConfiguration'
import type { OrderAvailability } from '../../Delivery/OrderAvailability/orderAvailability'
import type { DeliveryMethod } from '../DeliveryMethod/deliveryMethod'
import type { Delivery } from '../../Delivery/Delivery/Delivery'
import type { Address } from '../Address/Address'

export class Order extends Model<InferAttributes<Order>, InferCreationAttributes<Order>> {
  // id can be undefined during creation when using `autoIncrement`
  declare id: CreationOptional<number>

  declare createdAt: CreationOptional<Date>

  declare updatedAt: CreationOptional<Date>

  declare orderNumber: string

  declare orderDate: Date // default now

  declare shippingCost: number // default 0

  declare taxRate: number // default 0

  declare paymentMethod: string | null

  // ASSOCIATIONS:

  declare customerId: ForeignKey<Customer['id']>

  declare deliveryMethodId: ForeignKey<DeliveryMethod['id']> | null

  declare shippingAddressId: ForeignKey<Address['id']> | null

  declare shippingAddressIdNew: ForeignKey<Address['id']> | null

  declare billingAddressId: ForeignKey<Address['id']> | null

  declare billingAddressIdNew: ForeignKey<Address['id']> | null

  declare customer?: NonAttribute<Customer>

  declare deliveryMethod?: NonAttribute<DeliveryMethod>

  declare shippingAddress?: NonAttribute<Address>

  declare billingAddress?: NonAttribute<Address>

  declare shippingAddress2?: NonAttribute<Address>

  declare billingAddress2?: NonAttribute<Address>

  declare magento?: NonAttribute<MagentoOrder>

  declare addresses?: NonAttribute<Address[]>

  declare comments?: NonAttribute<OrderComment[]>

  declare products?: NonAttribute<ProductConfiguration[]>

  declare orderAvailabilities?: NonAttribute<OrderAvailability[]>

  declare deliveries?: NonAttribute<Delivery[]>

  declare public static associations: {
    magento: Association<Order, MagentoOrder>,
    customer: Association<Order, Customer>,
    addresses: Association<Order, Address>,
    comments: Association<Order, OrderComment>,
    billingAddress: Association<Order, Address>,
    shippingAddress: Association<Order, Address>,
    products: Association<Order, ProductConfiguration>,
    orderAvailabilities: Association<Order, OrderAvailability>,
    deliveryMethod: Association<Order, DeliveryMethod>,
    deliveries: Association<Order, Delivery>,
  }

  // MIXINS

  // done: one-to-many relationship between Order and Delivery
  // Deliveries:
  declare createDelivery: HasManyCreateAssociationMixin<Delivery, 'orderId'>

  declare getDeliveries: HasManyGetAssociationsMixin<Delivery>

  declare countDeliveries: HasManyCountAssociationsMixin

  declare hasDelivery: HasManyHasAssociationMixin<Delivery, number>

  declare hasDeliveries: HasManyHasAssociationsMixin<Delivery, number>

  declare setDeliveries: HasManySetAssociationsMixin<Delivery, number>

  declare addDelivery: HasManyAddAssociationMixin<Delivery, number>

  declare addDeliveries: HasManyAddAssociationsMixin<Delivery, number>

  declare removeDelivery: HasManyRemoveAssociationMixin<Delivery, number>

  declare removeDeliveries: HasManyRemoveAssociationsMixin<Delivery, number>

  // magento record:
  declare getMagento: HasOneGetAssociationMixin<MagentoOrder>

  declare createMagento: HasOneCreateAssociationMixin<MagentoOrder>

  declare setMagento: HasOneSetAssociationMixin<MagentoOrder, number>

  // customer record:
  declare getCustomer: BelongsToGetAssociationMixin<Customer>

  declare setCustomer: BelongsToSetAssociationMixin<Customer, number>

  declare createCustomer: BelongsToCreateAssociationMixin<Customer>

  // deliveryMethod record:
  declare getDeliveryMethod: BelongsToGetAssociationMixin<DeliveryMethod>

  declare setDeliveryMethod: BelongsToSetAssociationMixin<DeliveryMethod, number>

  // declare createDeliveryMethod: BelongsToCreateAssociationMixin<DeliveryMethod>

  // addresses:
  declare createAddress: HasManyCreateAssociationMixin<Address, 'orderId'>

  declare getAddresses: HasManyGetAssociationsMixin<Address>

  declare countAddresses: HasManyCountAssociationsMixin

  declare hasAddress: HasManyHasAssociationMixin<Address, number>

  declare hasAddresses: HasManyHasAssociationsMixin<Address, number>

  declare setAddresses: HasManySetAssociationsMixin<Address, number>

  declare addAddress: HasManyAddAssociationMixin<Address, number>

  declare addAddresses: HasManyAddAssociationsMixin<Address, number>

  declare removeAddress: HasManyRemoveAssociationMixin<Address, number>

  declare removeAddresses: HasManyRemoveAssociationsMixin<Address, number>

  // billingAddress:
  declare getBillingAddress: BelongsToGetAssociationMixin<Address>

  declare setBillingAddress: BelongsToSetAssociationMixin<Address, number>

  // disable createBillingAddress, since sequelize could not create proper foreign key constraint:

  // shippingAddress:
  declare getShippingAddress: BelongsToGetAssociationMixin<Address>

  declare setShippingAddress: BelongsToSetAssociationMixin<Address, number>

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
        defaultValue: DataTypes.NOW,
        allowNull: false,
      },
      taxRate: {
        type: DataTypes.DECIMAL(5, 3), // max 99.999%
        defaultValue: 0,
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
