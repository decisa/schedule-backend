import {
  Association,
  BelongsToCreateAssociationMixin,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model, NonAttribute, Sequelize,
} from 'sequelize'
import type { OrderAddress } from '../OrderAddress/orderAddress'

export class MagentoOrderAddress extends Model<InferAttributes<MagentoOrderAddress>, InferCreationAttributes<MagentoOrderAddress>> {
  declare externalId: number

  declare externalCustomerAddressId?: number

  declare externalOrderId: number

  declare addressType: string

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
