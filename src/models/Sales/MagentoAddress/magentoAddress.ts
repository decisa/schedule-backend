import {
  Association,
  BelongsToCreateAssociationMixin,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model, NonAttribute, Sequelize,
} from 'sequelize'
import type { Address } from '../Address/Address'

// export const tableName = 'MagentoAddressesUnified'

export const magentoAddressTypes = ['billing', 'shipping'] as const
export type MagentoAddressType = typeof magentoAddressTypes[number]

export class MagentoAddress extends Model<InferAttributes<MagentoAddress>, InferCreationAttributes<MagentoAddress>> {
  declare externalId: string

  // declare externalCustomerAddressId: number

  declare addressType: MagentoAddressType

  // ASSOCIATIONS:
  declare addressId: ForeignKey<Address['id']>

  declare address?: NonAttribute<Address>

  // TODO: ADD ADDRESS
  declare public static associations: { address: Association<MagentoAddress, Address> }

  // MIXINS:
  declare getAddress: BelongsToGetAssociationMixin<Address>

  declare setAddress: BelongsToSetAssociationMixin<Address, number>

  declare createAddress: BelongsToCreateAssociationMixin<Address>
}

export function initMagentoAddress(db: Sequelize) {
  MagentoAddress.init(
    {
      externalId: {
        type: DataTypes.STRING,
        // unique: true, // defined in indexes
        primaryKey: true,
      },
      // externalCustomerAddressId: DataTypes.INTEGER,
      // externalOrderId: DataTypes.INTEGER,
      addressType: {
        type: DataTypes.STRING,
      },
      addressId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    // FK addressId - id of internal address record
    },
    {
      tableName: 'MagentoAddresses',
      freezeTableName: true,
      timestamps: false,
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
