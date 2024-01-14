import {
  DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize,
} from 'sequelize'
import { PurchaseOrderItem } from '../../models/Receiving/PurchaseOrderItem/purchaseOrderItem'

export const totalQtyShippedField = 'totalQtyShipped'

export const poShippedViewName = 'POShippedView'

// POShippedView is a view that calculates the total number of purchaseOrderItems that were shipped from vendors.
// table views are not directly supported by sequelize, so we have to define the model carefully
// intentionally skipping declaration of all mixins and association fields, so that typescript will complain if we try to use them
// the table view MUST be created AFTER the database is SYNC'ed (migrated), so that the table view is not accidentally created as a table

export class POShippedView extends Model<InferAttributes<POShippedView>, InferCreationAttributes<POShippedView>> {
  declare purchaseOrderItemId: number

  declare totalQtyShipped: number
}

// init function for the view
//
export function initPOShippedView(db: Sequelize, tableViewName = poShippedViewName) {
  POShippedView.init({
    purchaseOrderItemId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: PurchaseOrderItem,
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
