import {
  InferAttributes,
  Model,
  InferCreationAttributes,
  CreationOptional,
  DataTypes,
  Sequelize,
  NonAttribute,
  Association,
  HasOneGetAssociationMixin,
  HasOneCreateAssociationMixin,
  HasOneSetAssociationMixin,
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
  // ForeignKey,
  // BelongsToGetAssociationMixin,
  // BelongsToSetAssociationMixin,
  // BelongsToCreateAssociationMixin,
} from 'sequelize'
import type { MagentoCustomer } from '../MagentoCustomer/magentoCustomer'
import type { Order } from '../Order/order'
import type { Address } from '../Address/address'

console.log('running customers model module')

// TODO: Add constraint to customer > defaultShippingId?

export class Customer extends Model<InferAttributes<Customer>,
InferCreationAttributes<Customer>> {
  declare id: CreationOptional<number>

  declare firstName: string

  declare lastName: string

  declare company?: string

  declare phone: string

  declare altPhone: string | undefined

  declare email: string | null

  declare defaultShippingId?: number

  // ASSOCIATIONS:

  declare magento?: NonAttribute<MagentoCustomer>

  declare orders?: NonAttribute<Order[]>

  declare addresses?: NonAttribute<Address[]>

  declare public static associations: {
    magento: Association<Customer, MagentoCustomer>,
    orders: Association<Customer, Order>
    addresses: Association<Customer, Address>,
  }

  // MIXINS:
  // magento record:
  declare getMagento: HasOneGetAssociationMixin<MagentoCustomer>

  declare createMagento: HasOneCreateAssociationMixin<MagentoCustomer>

  declare setMagento: HasOneSetAssociationMixin<MagentoCustomer, number>

  // orders:
  declare createOrder: HasManyCreateAssociationMixin<Order, 'customerId'>

  declare getOrders: HasManyGetAssociationsMixin<Order>

  declare countOrders: HasManyCountAssociationsMixin

  declare hasOrder: HasManyHasAssociationMixin<Order, number>

  declare hasOrders: HasManyHasAssociationsMixin<Order, number>

  declare setOrders: HasManySetAssociationsMixin<Order, number>

  declare addOrder: HasManyAddAssociationMixin<Order, number>

  declare addOrders: HasManyAddAssociationsMixin<Order, number>

  declare removeOrder: HasManyRemoveAssociationMixin<Order, number>

  declare removeOrders: HasManyRemoveAssociationsMixin<Order, number>

  // addresses:
  declare createAddress: HasManyCreateAssociationMixin<Address, 'customerId'>

  declare getAddresses: HasManyGetAssociationsMixin<Address>

  declare countAddresses: HasManyCountAssociationsMixin

  declare hasAddress: HasManyHasAssociationMixin<Address, number>

  declare hasAddresses: HasManyHasAssociationsMixin<Address, number>

  declare setAddresses: HasManySetAssociationsMixin<Address, number>

  declare addAddress: HasManyAddAssociationMixin<Address, number>

  declare addAddresses: HasManyAddAssociationsMixin<Address, number>

  declare removeAddress: HasManyRemoveAssociationMixin<Address, number>

  declare removeAddresses: HasManyRemoveAssociationsMixin<Address, number>
}

export function initCustomer(db: Sequelize) {
  Customer.init({
    id: {
      type: DataTypes.INTEGER,
      unique: true,
      autoIncrement: true,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    company: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: DataTypes.STRING,
    altPhone: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: {
          msg: 'Please provide either valid email address or omit it altogether',
        },
      },
    },
    defaultShippingId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  }, {
    sequelize: db,
    indexes: [
      {
        unique: true,
        fields: ['email'],
      },
    ],
  })
}
