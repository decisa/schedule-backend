import {
  Association,
  BelongsToCreateAssociationMixin,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model, NonAttribute, Sequelize,
} from 'sequelize'
import type { OrderAddress } from '../OrderAddress/orderAddress'

export const magentoAddressTypes = ['billing', 'shipping'] as const

export type MagentoAddressType = typeof magentoAddressTypes[number]

export class MagentoOrderAddress extends Model<InferAttributes<MagentoOrderAddress>, InferCreationAttributes<MagentoOrderAddress>> {
  declare externalId: number

  declare externalCustomerAddressId?: number | null

  declare externalOrderId: number

  declare addressType: MagentoAddressType

  // ASSOCIATIONS:
  declare orderAddressId: ForeignKey<OrderAddress['id']>

  declare orderAddress?: NonAttribute<OrderAddress>

  declare public static associations: { orderAddress: Association<MagentoOrderAddress, OrderAddress> }

  // MIXINS:
  declare getOrderAddress: BelongsToGetAssociationMixin<OrderAddress>

  declare setOrderAddress: BelongsToSetAssociationMixin<OrderAddress, number>

  declare createOrderAddress: BelongsToCreateAssociationMixin<OrderAddress>
}

export function initMagentoOrderAddress(db: Sequelize) {
  MagentoOrderAddress.init(
    {
      externalId: {
        type: DataTypes.INTEGER,
        // unique: true, // defined in indexes
        primaryKey: true,
      },
      externalCustomerAddressId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      externalOrderId: DataTypes.INTEGER,

      addressType: {
        type: DataTypes.STRING,
      },

    },
    {
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
