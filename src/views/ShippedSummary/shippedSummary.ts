import {
  DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize,
} from 'sequelize'

import { ProductConfiguration } from '../../models/Sales/ProductConfiguration/productConfiguration'

export const totalQtyShippedField = 'totalQtyShipped'

export const shippedSummaryView = 'ShippedSummaryViews'

// ShippedSummaryView is a view that calculates the total number of units shipped for every configurationId
// table views are not directly supported by sequelize, so we have to define the model carefully
// intentionally skipping declaration of all mixins and association fields, so that typescript will complain if we try to use them
// the table view MUST be created AFTER the database is SYNC'ed (migrated), so that the table view is not accidentally created as a table
export class ShippedSummaryView extends Model<InferAttributes<ShippedSummaryView>, InferCreationAttributes<ShippedSummaryView>> {
  declare configurationId: number

  declare totalQtyShipped: number
}

// init function for the view
//
export function initShippedSummaryView(db: Sequelize, tableViewName = shippedSummaryView) {
  ShippedSummaryView.init({
    configurationId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: ProductConfiguration,
        key: 'id',
      },
    },
    totalQtyShipped: {
      type: DataTypes.INTEGER,
    },
  }, {
    sequelize: db,
    timestamps: false,
    tableName: tableViewName,
  })
}
