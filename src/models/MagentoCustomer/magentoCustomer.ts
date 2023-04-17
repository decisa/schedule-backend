import {
  InferAttributes,
  Model,
  InferCreationAttributes,
  // CreationOptional,
  DataTypes,
  Sequelize,
  ForeignKey,
  NonAttribute,
  Association,
  // NonAttribute,
  // Association,
  // HasOneGetAssociationMixin,
  // HasOneCreateAssociationMixin,
  // HasOneSetAssociationMixin,
  BelongsToCreateAssociationMixin,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
} from 'sequelize'
import type { Customer } from '../Customer/customer'

// import db from '..'

export class MagentoCustomer extends Model<InferAttributes<MagentoCustomer>,
InferCreationAttributes<MagentoCustomer>> {
  declare externalGroupId: number

  declare isGuest: boolean

  declare email: ForeignKey<Customer['email']>

  declare externalCustomerId: number | null

  declare customer?: NonAttribute<Customer>

  // declare orders?: NonAttribute<Order[]>

  declare public static associations: { customer: Association<MagentoCustomer, Customer> }

  declare getCustomer: BelongsToGetAssociationMixin<Customer>

  declare setCustomer: BelongsToSetAssociationMixin<Customer, number>

  declare createCustomer: BelongsToCreateAssociationMixin<Customer>
}

export function initMagentoCustomer(db: Sequelize) {
  MagentoCustomer.init({
    externalGroupId: DataTypes.INTEGER,
    isGuest: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      // unique: true,
      primaryKey: true,
    },
    externalCustomerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      // unique: true,
    },
  }, {
    sequelize: db,
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['email'],
      },
      {
        unique: true,
        fields: ['externalCustomerId'],
      },
    ],
    validate: {
      guestVerification() {
        if (this.isGuest && this.externalCustomerId) {
          throw new Error('guest cannot have a customerId')
        }
        if (!this.isGuest && !this.externalCustomerId) {
          throw new Error(
            'registered Magento user should have a customerId defined',
          )
        }
      },
    },
  })
}
