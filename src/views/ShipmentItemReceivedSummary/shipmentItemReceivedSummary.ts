import {
  DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize,
} from 'sequelize'

import { ShipmentItem } from '../../models/Receiving/ShipmentItem/shipmentItem'

export const totalQtyReceivedField = 'totalQtyReceived' as const

export const shipmentItemReceivedSummaryView = 'ShipmentItemReceivedSummaryViews'

// ShippedItemsReceivedSummaryView is a view that calculates the total number of units that were received for every shipmentItemId
// table views are not directly supported by sequelize, so we have to define the model carefully
// intentionally skipping declaration of all mixins and association fields, so that typescript will complain if we try to use them
// the table view MUST be created AFTER the database is SYNC'ed (migrated), so that the table view is not accidentally created as a table
export class ShipmentItemReceivedSummaryView extends Model<InferAttributes<ShipmentItemReceivedSummaryView>, InferCreationAttributes<ShipmentItemReceivedSummaryView>> {
  declare shipmentItemId: number

  declare totalQtyReceived: number
}

// init function for the view
//
export function initShipmentItemReceivedSummaryView(db: Sequelize, tableViewName = shipmentItemReceivedSummaryView) {
  ShipmentItemReceivedSummaryView.init({
    shipmentItemId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: ShipmentItem,
        key: 'id',
      },
    },
    [totalQtyReceivedField]: {
      type: DataTypes.INTEGER,
    },
  }, {
    sequelize: db,
    timestamps: false,
    tableName: tableViewName,
  })
}
