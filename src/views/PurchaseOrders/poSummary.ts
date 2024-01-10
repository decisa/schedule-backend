import {
  DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize,
} from 'sequelize'
import { PurchaseOrderItem } from '../../models/Receiving/PurchaseOrderItem/purchaseOrderItem'

export const poSummaryViewName = 'POSummaryView'

// POSummaryView is a view that gives a report on every po item: qtyPurchased, qtyReceived, qtyShipped.
// table views are not directly supported by sequelize, so we have to define the model carefully
// intentionally skipping declaration of all mixins and association fields, so that typescript will complain if we try to use them
// the table view MUST be created AFTER the database is SYNC'ed (migrated), so that the table view is not accidentally created as a table

export class POSummaryView extends Model<InferAttributes<POSummaryView>, InferCreationAttributes<POSummaryView>> {
  declare purchaseOrderItemId: number

  declare qtyPurchased: number

  declare qtyShipped: number

  declare qtyReceived: number
}

// init function for the view
//
export function initPOSummaryView(db: Sequelize, tableViewName = poSummaryViewName) {
  POSummaryView.init({
    purchaseOrderItemId: {
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
    qtyShipped: {
      type: DataTypes.INTEGER,
    },
    qtyReceived: {
      type: DataTypes.INTEGER,
    },
  }, {
    sequelize: db,
    timestamps: false,
    tableName: tableViewName,
  })
}
