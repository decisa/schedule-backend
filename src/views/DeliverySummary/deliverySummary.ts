import {
  DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize,
} from 'sequelize'
import { ProductConfiguration } from '../../models/Sales/ProductConfiguration/productConfiguration'

export const qtyPlannedField = 'qtyPlanned'
export const qtyScheduledField = 'qtyScheduled'
export const qtyConfirmedField = 'qtyConfirmed'
export const deliverySummaryViewName = 'DeliverySummaryViews'

// DeliverySummaryView is a view that calculates the total number of units that were planned, scheduled and confirmed for every configurationId
// table views are not directly supported by sequelize, so we have to define the model carefully
// intentionally skipping declaration of all mixins and association fields, so that typescript will complain if we try to use them
// the table view MUST be created AFTER the database is SYNC'ed, so that the table view is not accidentally created as a table
export class DeliverySummaryView extends Model<InferAttributes<DeliverySummaryView>, InferCreationAttributes<DeliverySummaryView>> {
  declare configurationId: number

  declare qtyPlanned: number // delivery created

  declare qtyScheduled: number // delivery added to a schedule

  declare qtyConfirmed: number // delivery confirmed by customer
}

// init function for the view
//
export function initDeliverySummaryView(db: Sequelize, tableViewName = deliverySummaryViewName) {
  DeliverySummaryView.init({
    configurationId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: ProductConfiguration,
        key: 'id',
      },
    },
    qtyPlanned: {
      type: DataTypes.INTEGER,
    },
    qtyScheduled: {
      type: DataTypes.INTEGER,
    },
    qtyConfirmed: {
      type: DataTypes.INTEGER,
    },
  }, {
    sequelize: db,
    timestamps: false,
    tableName: tableViewName,
  })
}
