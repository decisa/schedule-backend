import {
  DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize,
} from 'sequelize'
import { PurchaseOrderItem } from '../../models/Receiving/PurchaseOrderItem/purchaseOrderItem'

export const totalQtyReceivedField = 'totalQtyReceived'

export const poReceivedViewName = 'POReceivedView'

// POReceivedView is a view that calculates the total number of purchaseOrderItems that were received.
// table views are not directly supported by sequelize, so we have to define the model carefully
// intentionally skipping declaration of all mixins and association fields, so that typescript will complain if we try to use them
// the table view MUST be created AFTER the database is SYNC'ed (migrated), so that the table view is not accidentally created as a table

export class POReceivedView extends Model<InferAttributes<POReceivedView>, InferCreationAttributes<POReceivedView>> {
  declare purchaseOrderItemId: number

  declare totalQtyReceived: number
}

// init function for the view
//
export function initPOReceivedView(db: Sequelize, tableViewName = poReceivedViewName) {
  POReceivedView.init({
    purchaseOrderItemId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: PurchaseOrderItem,
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
