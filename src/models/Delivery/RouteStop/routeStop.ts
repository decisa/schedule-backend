// TODO: how do you track which items and quantities from the order are being delivered? how do you check if there are any outstanding items on the order?
// planning to have a pool of routeStops that are pending to be scheduled (i.e added to the TripRoute)

// RouteStop/routeStop.ts
// 15-2 RouteStops:
// id (PK)
// trip_route_id (FK from TripRoute)
// order_id (FK from Orders, nullable for non-delivery stops)
// address_id (FK from OrderAddresses, nullable)
// status (e.g., 'Scheduled', 'In Progress', 'Completed', 'Cancelled' , 'Pending')

// stop_type (e.g., 'break', 'hotel', 'delivery', etc.)
// stop_number nullable
// estimated_arrival_time
// estimated_duration
// actual_arrival_time (nullable)
// notes
// created_at
// updated_at

// done: One-to-many relationship between TripRoute and RouteStops.
// done: One-to-many relationship between Orders and RouteStops.
// done: One-to-many relationship between OrderAddresses and RouteStops. (nullable)
// done: many-to-many relationship between RouteStops and ProductConfigurations through RouteStopItems

import {
  Association, CreationOptional, InferAttributes, InferCreationAttributes, Model, NonAttribute, Sequelize, DataTypes, ForeignKey,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  BelongsToCreateAssociationMixin,
  BelongsToManyAddAssociationMixin,
  BelongsToManyAddAssociationsMixin,
  BelongsToManyCountAssociationsMixin,
  BelongsToManyCreateAssociationMixin,
  BelongsToManyGetAssociationsMixin,
  BelongsToManyHasAssociationMixin,
  BelongsToManyHasAssociationsMixin,
  BelongsToManyRemoveAssociationMixin,
  BelongsToManyRemoveAssociationsMixin,
  BelongsToManySetAssociationsMixin,
} from 'sequelize'
import type { TripRoute } from '../TripRoute/tripRoute'
import type { OrderAddress } from '../../Sales/OrderAddress/orderAddress'
import type { Order } from '../../Sales/Order/order'
import { ProductConfiguration } from '../../Sales/ProductConfiguration/productConfiguration'

type StopType = 'break' | 'hotel' | 'delivery'
type StopStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled' | 'Pending' | 'Confirmed'

export class RouteStop extends Model<InferAttributes<RouteStop>, InferCreationAttributes<RouteStop>> {
  declare id: CreationOptional<number>

  declare status: StopStatus

  declare stopType: StopType

  declare stopNumber: number

  declare estimatedDurationString?: string

  declare estimatedDuration: number[]

  declare notes: string | null

  // associations

  declare tripRouteId: ForeignKey<TripRoute['id']>

  declare orderAddressId: ForeignKey<OrderAddress['id']> | null

  declare orderId: ForeignKey<Order['id']> | null

  declare trip?: NonAttribute<TripRoute>

  declare orderAddress?: NonAttribute<OrderAddress>

  declare order?: NonAttribute<Order>

  declare productConfigurations?: NonAttribute<ProductConfiguration[]>

  //  (FK from TripRoute)
  // order_id (FK from Orders, nullable for non-delivery stops)
  // address_id (FK from OrderAddresses, nullable)
  // declare order?: NonAttribute<Order>
  // declare orderId: ForeignKey<Order['id']>
  declare public static associations: {
    trip: Association<RouteStop, TripRoute>,
    orderAddress: Association<RouteStop, OrderAddress>,
    order: Association<RouteStop, Order>,
    productConfigurations: Association<RouteStop, ProductConfiguration>,
  }

  // MIXINS
  // tripRoute:
  declare getTripRoute: BelongsToGetAssociationMixin<TripRoute>

  declare setTripRoute: BelongsToSetAssociationMixin<TripRoute, number>

  declare createTripRoute: BelongsToCreateAssociationMixin<TripRoute>

  // orderAddress:
  declare getOrderAddress: BelongsToGetAssociationMixin<OrderAddress>

  declare setOrderAddress: BelongsToSetAssociationMixin<OrderAddress, number>

  declare createOrderAddress: BelongsToCreateAssociationMixin<OrderAddress>

  // order:
  declare getOrder: BelongsToGetAssociationMixin<Order>

  declare setOrder: BelongsToSetAssociationMixin<Order, number>

  declare createOrder: BelongsToCreateAssociationMixin<Order>

  // productConfigurations:
  declare createProductConfiguration: BelongsToManyCreateAssociationMixin<ProductConfiguration>

  declare setProductConfigurations: BelongsToManySetAssociationsMixin<ProductConfiguration, number>

  declare removeProductConfiguration: BelongsToManyRemoveAssociationMixin<ProductConfiguration, number>

  declare removeProductConfigurations: BelongsToManyRemoveAssociationsMixin<ProductConfiguration, number>

  declare hasProductConfigurations: BelongsToManyHasAssociationsMixin<ProductConfiguration, number>

  declare hasProductConfiguration: BelongsToManyHasAssociationMixin<ProductConfiguration, number>

  declare getProductConfigurations: BelongsToManyGetAssociationsMixin<ProductConfiguration>

  declare countProductConfigurations: BelongsToManyCountAssociationsMixin

  declare addProductConfigurations: BelongsToManyAddAssociationsMixin<ProductConfiguration, number>

  declare addProductConfiguration: BelongsToManyAddAssociationMixin<ProductConfiguration, number>
}

export function initRouteStop(db: Sequelize) {
  RouteStop.init(
    {
      id: {
        type: DataTypes.INTEGER,
        unique: true,
        autoIncrement: true,
        primaryKey: true,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
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
        // done: should this be a coma delimited string with custom getter and setter?
        type: DataTypes.VIRTUAL,
        defaultValue: '0,0',
        get() {
          const rawValue = this.getDataValue('estimatedDurationString') // as unknown as string
          const result = (rawValue || '0.0').split(',').map(parseInt)
          return result
        },
        set(val: number[]) {
          this.setDataValue('estimatedDurationString', val.join(','))
        },
      },
      notes: DataTypes.STRING,
    },
    {
      sequelize: db,
    },
  )
}
