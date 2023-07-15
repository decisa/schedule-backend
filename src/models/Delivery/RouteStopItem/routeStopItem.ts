// RouteStopItem/routeStopItem.ts
// 22. RouteStopItems:
// id (PK)
// route_stop_id (FK from RouteStops)
// product_configuration_id (FK from ProductConfigurations)
// quantity
// created_at
// updated_at

// note: for "super M:N relationship" need to add:
// note: one-to-many between RouteStops and RouteStopItems
// note: one-to-many between ProductConfigurations and RouteStopItems"

import {
  Association, CreationOptional, InferAttributes, InferCreationAttributes, Model, NonAttribute, Sequelize, DataTypes, ForeignKey,
} from 'sequelize'
import { RouteStop } from '../RouteStop/routeStop'
import { ProductConfiguration } from '../../Sales/ProductConfiguration/productConfiguration'

export class RouteStopItem extends Model<InferAttributes<RouteStopItem>, InferCreationAttributes<RouteStopItem>> {
  declare id: CreationOptional<number>

  declare qty: number

  declare confirmed: boolean

  // associations
  declare routeStopId: ForeignKey<RouteStop['id']>

  // fixme: rename to configurationId to be consistent with ProductSummaryView
  declare productConfigurationId: ForeignKey<ProductConfiguration['id']>

  declare routeStop?: NonAttribute<RouteStop>

  declare productConfiguration?: NonAttribute<ProductConfiguration>

  declare public static associations: {
    routeStop: Association<RouteStopItem, RouteStop>,
    productConfiguration: Association<RouteStopItem, ProductConfiguration>,
  }

  // MIXINS
  // products:
}

export function initRouteStopItem(db: Sequelize) {
  RouteStopItem.init(
    {
      id: {
        type: DataTypes.INTEGER,
        unique: true,
        autoIncrement: true,
        primaryKey: true,
      },
      qty: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      // fixme: should confirm be moved to ROUTE_STOP?
      confirmed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize: db,
      timestamps: false,
    },
  )
}
