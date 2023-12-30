import {
  CreationOptional,
  DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize,
} from 'sequelize'
import { ProductConfiguration } from '../../models/Sales/ProductConfiguration/productConfiguration'

// ProductSummaryView is a view that aggregates the qtyPurchased, qtyShipped, and qtyReceived
// table views are not directly supported by sequelize, so we have to define the model carefully
// intentionally skipping declaration of all mixins and association fields, so that typescript will complain if we try to use them
// the table view MUST be created AFTER the database is SYNC'ed, so that the table view is not accidentally created as a table
export class ProductSummaryView extends Model<InferAttributes<ProductSummaryView>, InferCreationAttributes<ProductSummaryView>> {
  declare configurationId: number

  declare qtyPurchased: number

  declare qtyShipped: number

  declare qtyReceived: number

  // virtual fields
  declare qtyInProduction: CreationOptional<number>

  declare qtyInTransit: CreationOptional<number>
}

// init function for the view
//
export function initProductSummaryView(db: Sequelize, tableViewName = 'ProductSummaryViews') {
  ProductSummaryView.init({
    configurationId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: ProductConfiguration,
        key: 'id',
      },
    },
    qtyPurchased: {
      type: DataTypes.INTEGER,
      // get() {
      //   const value = this.getDataValue('qtyPurchased')
      //   return value === null ? 0 : Number(value)
      // },
    },
    qtyShipped: {
      type: DataTypes.INTEGER,
      // get() {
      //   const value = this.getDataValue('qtyShipped')
      //   return value === null ? 0 : Number(value)
      // },
    },
    qtyReceived: {
      type: DataTypes.INTEGER,
      // get() {
      //   const value = this.getDataValue('qtyReceived')
      //   return value === null ? 0 : Number(value)
      // },
    },
    qtyInTransit: {
      type: new DataTypes.VIRTUAL(DataTypes.INTEGER, ['qtyShipped', 'qtyReceived']),
      get() {
        return this.qtyShipped - this.qtyReceived
      },
    },
    qtyInProduction: {
      type: new DataTypes.VIRTUAL(DataTypes.INTEGER, ['qtyPurchased', 'qtyShipped']),
      get() {
        return this.qtyPurchased - this.qtyShipped
      },
    },
  }, {
    sequelize: db,
    timestamps: false,
    tableName: tableViewName,
  })
}
