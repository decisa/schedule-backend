import {
  DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize,
} from 'sequelize'
import { PurchaseOrderItem } from '../../models/Receiving/PurchaseOrderItem/purchaseOrderItem'

export const totalQtyShippedField = 'totalQtyShipped'
export const totalQtyReceivedField = 'totalQtyReceived'

export const poItemsSummaryViewName = 'POItemsSummaryViews'

// POItemsSummaryViews is a view that summarizes every POItem, i.e. provides information on qty purchased, total qty shipped and total qty received
// table views are not directly supported by sequelize, so we have to define the model carefully
// intentionally skipping declaration of all mixins and association fields, so that typescript will complain if we try to use them
// the table view MUST be created AFTER the database is SYNC'ed (migrated), so that the table view is not accidentally created as a table

export class POItemsSummaryView extends Model<InferAttributes<POItemsSummaryView>, InferCreationAttributes<POItemsSummaryView>> {
  declare poItemId: number

  declare qtyPurchased: number

  declare totalQtyShipped: number

  declare totalQtyReceived: number
}

// init function for the view
//
export function initPOItemsSummaryView(db: Sequelize, tableViewName = poItemsSummaryViewName) {
  POItemsSummaryView.init({
    poItemId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: PurchaseOrderItem,
        key: 'id',
      },
    },
    qtyPurchased: {
      type: DataTypes.INTEGER,
    },
    totalQtyShipped: {
      type: DataTypes.INTEGER,
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
