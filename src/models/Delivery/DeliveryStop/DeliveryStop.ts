// TODO: how do you track which items and quantities from the order are being delivered? how do you check if there are any outstanding items on the order?

// done: One-to-many relationship between TripRoute and DeliveryStops.
// done: One-to-many relationship between Orders and DeliveryStops.
// done: One-to-many relationship between OrderAddresses and DeliveryStops. (nullable)
// done: many-to-many relationship between DeliveryStops and ProductConfigurations through DeliveryStopItems

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

import type { OrderAddress } from '../../Sales/OrderAddress/orderAddress'
import type { Trip } from '../Trip/Trip'
import type { Delivery } from '../Delivery/Delivery'

type StopType = 'break' | 'hotel' | 'delivery'

export class DeliveryStop extends Model<InferAttributes<DeliveryStop>, InferCreationAttributes<DeliveryStop>> {
  declare id: CreationOptional<number>

  declare stopType: StopType

  declare stopNumber: number

  declare estimatedDurationString: string | null

  declare estimatedDuration: CreationOptional<[number, number]>

  declare notes: string | null

  // timestamps
  declare createdAt: CreationOptional<Date>

  declare updatedAt: CreationOptional<Date>

  // associations

  declare tripId: ForeignKey<Trip['id']>

  declare trip?: NonAttribute<Trip>

  declare shippingAddressId: ForeignKey<OrderAddress['id']> | null

  declare shippingAddress?: NonAttribute<OrderAddress>

  declare deliveries?: NonAttribute<Delivery[]>

  declare public static associations: {
    trip: Association<DeliveryStop, Trip>,
    shippingAddress: Association<DeliveryStop, OrderAddress>,
    deliveries: Association<DeliveryStop, Delivery>,
  }

  // MIXINS
  // done: one-to-many relationship between Trip and DeliveryStops
  // trip:
  declare getTrip: BelongsToGetAssociationMixin<Trip>

  declare setTrip: BelongsToSetAssociationMixin<Trip, number>

  declare createTrip: BelongsToCreateAssociationMixin<Trip>

  // done: one-to-many relationship between OrderAddress and DeliveryStops
  // shippingAddress:
  declare getShippingAddress: BelongsToGetAssociationMixin<OrderAddress>

  declare setShippingAddress: BelongsToSetAssociationMixin<OrderAddress, number>

  declare createShippingAddress: BelongsToCreateAssociationMixin<OrderAddress>

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
          const rawValue = this.getDataValue('estimatedDurationString') // as unknown as string
          const result = (rawValue || '0.0').split(',').map(parseInt)
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
