import {
  DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize,
} from 'sequelize'
import { ProductConfiguration } from '../../models/Sales/ProductConfiguration/productConfiguration'

export const totalQtyReceivedField = 'totalQtyReceived'
export const receivedSummaryView = 'ReceivedSummaryViews'

// ReceivedSummaryViews is a view that calculates the total number of units that were received for every configurationId
// table views are not directly supported by sequelize, so we have to define the model carefully
// intentionally skipping declaration of all mixins and association fields, so that typescript will complain if we try to use them
// the table view MUST be created AFTER the database is SYNC'ed (migrated), so that the table view is not accidentally created as a table
export class ReceivedSummaryView extends Model<InferAttributes<ReceivedSummaryView>, InferCreationAttributes<ReceivedSummaryView>> {
  declare configurationId: number

  declare totalQtyReceived: number
}

// init function for the view
//
export function initReceivedSummaryView(db: Sequelize, tableViewName = receivedSummaryView) {
  ReceivedSummaryView.init({
    configurationId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: ProductConfiguration,
        key: 'id',
      },
    },
    totalQtyReceived: {
      type: DataTypes.INTEGER,
    },
  }, {
    sequelize: db,
    timestamps: false,
    tableName: tableViewName,
  })
}
