import { Address } from './Sales/Address/address'
import { Brand } from './Brand/brand'
import { Customer } from './Sales/Customer/customer'
import { MagentoAddress } from './Sales/MagentoAddress/magentoAddress'
import { MagentoCustomer } from './Sales/MagentoCustomer/magentoCustomer'
import { MagentoOrder } from './Sales/MagentoOrder/magentoOrder'
import { MagentoOrderAddress } from './Sales/MagentoOrderAddress/magentoOrderAddress'
import { Order } from './Sales/Order/order'
import { OrderAddress } from './Sales/OrderAddress/orderAddress'
import { OrderComment } from './Sales/OrderComment/orderComment'
import { Product } from './Sales/Product/product'
import { ProductConfiguration } from './Sales/ProductConfiguration/productConfiguration'
import { ProductOption } from './Sales/ProductOption/productOption'

function createAssociations() {
  // some orders have a magento record
  Order.hasOne(MagentoOrder, {
    as: 'magento',
    sourceKey: 'id',
    foreignKey: {
      name: 'orderId',
      allowNull: false,
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  MagentoOrder.belongsTo(Order, {
    as: 'order',
    foreignKey: 'orderId',
  })

  // some customers will have a magento record:
  Customer.hasOne(MagentoCustomer, {
    as: 'magento',
    sourceKey: 'email',
    foreignKey: 'email',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  MagentoCustomer.belongsTo(Customer, {
    as: 'customer',
    foreignKey: 'email',
  })

  // every order belongs to a customer
  Order.belongsTo(Customer, {
    as: 'customer',
    foreignKey: {
      name: 'customerId',
      allowNull: false,
    },
    onDelete: 'NO ACTION',
  })
  Customer.hasMany(Order, {
    as: 'orders',
    foreignKey: 'customerId',
    sourceKey: 'id',
  })

  Order.belongsTo(OrderAddress, {
    as: 'shippingAddress',
    targetKey: 'id',
    foreignKey: 'shipId',
    // onDelete: 'NO ACTION',
    constraints: false,
  })

  // BILLING ADDRESS FOR ORDER:
  Order.belongsTo(OrderAddress, {
    as: 'billingAddress',
    foreignKey: 'billId',
    // onDelete: 'NO ACTION',
    constraints: false,
  })

  OrderAddress.belongsTo(Order, {
    as: 'order',
    targetKey: 'id',
    foreignKey: 'orderId',
  })

  Order.hasMany(OrderAddress, {
    as: 'addresses',
    sourceKey: 'id',
    foreignKey: 'orderId',
  })

  // some addresses have a magento record:
  OrderAddress.hasOne(MagentoOrderAddress, {
    as: 'magento',
    sourceKey: 'id',
    foreignKey: 'orderAddressId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  MagentoOrderAddress.belongsTo(OrderAddress, {
    as: 'orderAddress',
    foreignKey: 'orderAddressId',
  })

  // Customer has many Addresses
  Customer.hasMany(Address, {
    as: 'addresses',
    foreignKey: 'customerId',
  })
  Address.belongsTo(Customer, {
    as: 'customer',
    foreignKey: 'customerId',
  })

  // some addresses have a magento record:
  Address.hasOne(MagentoAddress, {
    as: 'magento',
    sourceKey: 'id',
    foreignKey: 'addressId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  MagentoAddress.belongsTo(Address, {
    as: 'address',
    foreignKey: 'addressId',
  })

  // ORDER COMMENTS
  Order.hasMany(OrderComment, {
    as: 'comments',
    foreignKey: 'orderId',
  })
  OrderComment.belongsTo(Order, {
    as: 'order',
    foreignKey: 'orderId',
  })

  // Each product has a brand
  Brand.hasMany(Product, {
    as: 'prdoducts',
    foreignKey: 'brandId',
  })
  Product.belongsTo(Brand, {
    as: 'brand',
    foreignKey: 'brandId',
  })

  // PRODUCT CONFIGURATIONS:
  /**
   * belongsTo:
   * 'foreignKey' << added to SOURCE object
   * 'as' - how the target will be called on source object
   */

  /**
   * hasMany:
   * 'foreignKey' >> added to TARGET object
   * 'as' - how the target will be called on source in PLURAL form
   */
  Product.hasMany(ProductConfiguration, {
    as: 'configurations',
    foreignKey: 'productId',
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE',
  })
  ProductConfiguration.belongsTo(Product, {
    foreignKey: 'productId',
    as: 'product',
  })

  // Every order consists of product configurations
  Order.hasMany(ProductConfiguration, {
    as: 'products',
    foreignKey: 'orderId',
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE',
  })
  ProductConfiguration.belongsTo(Order, {
    as: 'order',
    foreignKey: 'orderId',
  })

  // Every product configuration has options
  ProductConfiguration.hasMany(ProductOption, {
    as: 'options',
    foreignKey: 'configId',
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE',
  })
  ProductOption.belongsTo(ProductConfiguration, {
    as: 'product',
    foreignKey: 'configId',
  })
}

export default createAssociations
