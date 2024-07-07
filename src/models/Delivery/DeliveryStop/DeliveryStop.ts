import {
  Association, CreationOptional, InferAttributes, InferCreationAttributes, Model, NonAttribute, Sequelize, DataTypes, ForeignKey,
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
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  BelongsToCreateAssociationMixin,
} from 'sequelize'
import type { Trip } from '../Trip/Trip'
import type { Delivery } from '../Delivery/Delivery'
import { Address } from '../../Sales/Address/Address'

export const stopTypes = ['break', 'hotel', 'delivery'] as const
export type StopType = typeof stopTypes[number]

export class DeliveryStop extends Model<InferAttributes<DeliveryStop>, InferCreationAttributes<DeliveryStop>> {
  declare id: CreationOptional<number>

  declare stopType: StopType

  declare stopNumber: number

  declare estimatedDurationString: CreationOptional<string | null>

  declare estimatedDuration: CreationOptional<[number, number] | null>

  declare notes: CreationOptional<string | null>

  // timestamps
  declare createdAt: CreationOptional<Date>

  declare updatedAt: CreationOptional<Date>

  // associations

  declare tripId: ForeignKey<Trip['id']> | null

  declare trip?: NonAttribute<Trip>

  // shippingAddressId can be null
  declare shippingAddressId: ForeignKey<Address['id']> | null

  declare shippingAddress?: NonAttribute<Address>

  declare deliveries?: NonAttribute<Delivery[]>

  declare public static associations: {
    trip: Association<DeliveryStop, Trip>,
    shippingAddress: Association<DeliveryStop, Address>,
    deliveries: Association<DeliveryStop, Delivery>,
  }

  // MIXINS
  // done: one-to-many relationship between Trip and DeliveryStops
  // trip:
  declare getTrip: BelongsToGetAssociationMixin<Trip>

  declare setTrip: BelongsToSetAssociationMixin<Trip, number>

  declare createTrip: BelongsToCreateAssociationMixin<Trip>

  // done: one-to-many relationship between Address and DeliveryStops
  // shippingAddress:
  declare getShippingAddress: BelongsToGetAssociationMixin<Address>

  declare setShippingAddress: BelongsToSetAssociationMixin<Address, number>

  declare createShippingAddress: BelongsToCreateAssociationMixin<Address>

  // done: one-to-many relationship between DeliveryStop and Delivery
  // deliveries:
  declare createDelivery: HasManyCreateAssociationMixin<Delivery, 'deliveryStopId'>

  declare getDeliveries: HasManyGetAssociationsMixin<Delivery>

  declare countDeliveries: HasManyCountAssociationsMixin

  declare hasDelivery: HasManyHasAssociationMixin<Delivery, number>

  declare hasDeliveries: HasManyHasAssociationsMixin<Delivery, number>

  declare setDeliveries: HasManySetAssociationsMixin<Delivery, number>

  declare addDelivery: HasManyAddAssociationMixin<Delivery, number>

  declare addDeliveries: HasManyAddAssociationsMixin<Delivery, number>

  declare removeDelivery: HasManyRemoveAssociationMixin<Delivery, number>

  declare removeDeliveries: HasManyRemoveAssociationsMixin<Delivery, number>
}

export function initDeliveryStop(db: Sequelize) {
  DeliveryStop.init(
    {
      id: {
        type: DataTypes.INTEGER,
        unique: true,
        autoIncrement: true,
        primaryKey: true,
      },
      stopType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      stopNumber: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      estimatedDurationString: DataTypes.STRING,

      estimatedDuration: {
        type: DataTypes.VIRTUAL,
        defaultValue: '0,0',
        get() {
          console.log('get estimatedDuration:', this.getDataValue('estimatedDurationString'))
          const rawValue = this.getDataValue('estimatedDurationString') // as unknown as string
          const result = (rawValue || '0,0').split(',').map(Number)
          return result
        },
        set(val: [number, number]) {
          this.setDataValue('estimatedDurationString', val.join(','))
        },
      },
      notes: DataTypes.STRING,
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
      sequelize: db,
    },
  )
}
