import {
  Association,
  BelongsToCreateAssociationMixin,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model, NonAttribute, Sequelize,
} from 'sequelize'
import type { Address } from '../Address/address'
import { MagentoAddressType } from '../MagentoOrderAddress/magentoOrderAddress'

export class MagentoAddress extends Model<InferAttributes<MagentoAddress>, InferCreationAttributes<MagentoAddress>> {
  declare externalId: number

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
        type: DataTypes.INTEGER,
        // unique: true, // defined in indexes
        primaryKey: true,
      },
      // externalCustomerAddressId: DataTypes.INTEGER,
      // externalOrderId: DataTypes.INTEGER,
      addressType: {
        type: DataTypes.STRING,
      },
      addressId: DataTypes.INTEGER,
    // FK addressId - id of internal address record
    },
    {
      timestamps: false,
      sequelize: db,
      indexes: [
        {
          unique: true,
          fields: ['addressId'],
        },
      ],
    },
  )
}
