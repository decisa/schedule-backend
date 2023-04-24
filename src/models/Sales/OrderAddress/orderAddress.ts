// TODO: ??? One-to-one relationship between RouteStops and OrderAddresses. (nullable) IS IT ? one-to-MANY between orderAddress and Route Stops. Order can be delivered multiple attempts
import {
  Association,
  BelongsToCreateAssociationMixin,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  CreationOptional, DataTypes, ForeignKey, HasOneCreateAssociationMixin, HasOneGetAssociationMixin, HasOneSetAssociationMixin, InferAttributes, InferCreationAttributes, Model, NonAttribute, Sequelize,
} from 'sequelize'
import type { Order } from '../Order/order'
import type { Address } from '../Address/address'
import { MagentoOrderAddress } from '../MagentoOrderAddress/magentoOrderAddress'
// import type { Customer } from '../Customer/customer'
// import type { MagentoAddress } from '../MagentoAddress/magentoAddress'

export class OrderAddress extends Model<InferAttributes<OrderAddress>, InferCreationAttributes<OrderAddress>> {
  declare id: CreationOptional<number>

  declare firstName: string

  declare lastName: string

  declare company?: string | null

  declare street1?: string

  declare street2?: string | null

  declare city: string

  declare state: string

  declare zipCode: string

  declare country: string

  declare phone: string

  declare altPhone?: string | null

  declare notes?: string | null

  declare longitude?: number | null

  declare latitude?: number | null

  declare coordinates?: [number, number] | null

  declare street?: string[]

  // ASSOCIATIONS:
  declare orderId?: ForeignKey<Order['id']>

  // foreign key to keep record which address it was copied from.
  declare customerAddressId?: ForeignKey<Address['id']>

  declare order?: NonAttribute<Order>

  declare magento?: NonAttribute<MagentoOrderAddress>

  declare public static associations: {
    order: Association<OrderAddress, Order>,
    magento: Association<OrderAddress, MagentoOrderAddress>,
  }

  // MIXINS:
  // order:
  declare getOrder: BelongsToGetAssociationMixin<Order>

  declare setOrder: BelongsToSetAssociationMixin<Order, number>

  declare createOrder: BelongsToCreateAssociationMixin<Order>

  // magento record:
  declare getMagento: HasOneGetAssociationMixin<MagentoOrderAddress>

  declare createMagento: HasOneCreateAssociationMixin<MagentoOrderAddress>

  declare setMagento: HasOneSetAssociationMixin<MagentoOrderAddress, number>
}

export function initOrderAddress(db: Sequelize) {
  OrderAddress.init(
    {
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
      company: DataTypes.STRING,
      street1: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      street2: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      state: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      zipCode: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      country: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      altPhone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      customerAddressId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      notes: DataTypes.STRING,
      latitude: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: true,
        validate: {
          min: {
            args: [-90],
            msg: 'Invalid latitude. Latitude should be between -90 and 90.',
          },
          max: {
            args: [90],
            msg: 'Invalid latitude. Latitude should be between -90 and 90.',
          },
        },
        get() {
          const rawValue = this.getDataValue('latitude')
          return rawValue !== null ? Number(rawValue) : null
        },
      },
      longitude: {
        type: DataTypes.DECIMAL(11, 7),
        allowNull: true,
        validate: {
          min: {
            args: [-180],
            msg: 'Invalid longitude. Longitude should be between -180 and 180.',
          },
          max: {
            args: [180],
            msg: 'Invalid longitude. Longitude should be between -180 and 180.',
          },
        },
        get() {
          const rawValue = this.getDataValue('longitude')
          return rawValue !== null ? Number(rawValue) : null
        },
      },
      orderId: DataTypes.INTEGER.UNSIGNED,
      coordinates: {
        type: DataTypes.VIRTUAL,
        get() {
          if (
            this.longitude === null
          || this.latitude === null
          || this.longitude === undefined
          || this.latitude === undefined
          ) {
            return null
          }
          return [this.latitude, this.longitude]
        },

        set(value: [number, number]) {
          const [lat, lon] = value || []
          if (
            lat === null
          || lat === undefined
          || lon === null
          || lon === undefined
          ) {
            this.setDataValue('latitude', null)
            this.setDataValue('longitude', null)
          } else {
            this.setDataValue('latitude', lat)
            this.setDataValue('longitude', lon)
          }
        },
      },
      street: {
        type: DataTypes.VIRTUAL,
        get() {
          const result: string[] = []
          if (this.street1 !== null && this.street1 !== undefined) {
            result.push(this.street1)
          }
          if (this.street2 !== null && this.street2 !== undefined) {
            result.push(this.street2)
          }
          return result
        },

        set(value: string[]) {
          const [street1, street2] = value
          if (street1 !== undefined) {
            this.setDataValue('street1', street1)
          }
          if (street2 !== undefined) {
            this.setDataValue('street2', street2)
          }
        },
      },
    },
    {
      sequelize: db,
    },
  )
}
