import {
  CreationOptional,
  DataTypes, InferAttributes, InferCreationAttributes, Model, QueryTypes, Sequelize,
} from 'sequelize'
import { ProductConfiguration } from '../../models/Sales/ProductConfiguration/productConfiguration'
import { PurchaseOrderItem } from '../../models/Receiving/PurchaseOrderItem/purchaseOrderItem'
import { ShipmentItem } from '../../models/Receiving/ShipmentItem/shipmentItem'
import { ReceivedItem } from '../../models/Receiving/ReceivedItems/receivedItems'

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
      type: DataTypes.BIGINT,
      get() {
        const value = this.getDataValue('qtyPurchased')
        return value === null ? 0 : Number(value)
      },
    },
    qtyShipped: {
      type: DataTypes.BIGINT,
      get() {
        const value = this.getDataValue('qtyShipped')
        return value === null ? 0 : Number(value)
      },
    },
    qtyReceived: {
      type: DataTypes.BIGINT,
      get() {
        const value = this.getDataValue('qtyReceived')
        return value === null ? 0 : Number(value)
      },
    },
    qtyInTransit: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.qtyShipped - this.qtyReceived
      },
    },
    qtyInProduction: {
      type: DataTypes.VIRTUAL,
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

export async function createIfNotExistsProductSummaryView(db: Sequelize, tableViewName = 'ProductSummaryViews') {
  // raw SQL query for checking if the view exists with some dynamic values from existing models
  const checkViewExistsSql = `
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.VIEWS 
  WHERE TABLE_SCHEMA = '${db.getDatabaseName()}'
  AND TABLE_NAME = '${tableViewName}';
  `
  // dyncamically create query parts for type safety
  const pId = `p.${ProductConfiguration.getAttributes().id.field || 'id'}`
  const poiId = `poi.${PurchaseOrderItem.getAttributes().id.field || 'id'}`
  const poiQtyPurchased = `poi.${PurchaseOrderItem.getAttributes().qtyPurchased.field || 'qtyPurchased'}`
  const poiConfigurationId = `poi.${PurchaseOrderItem.getAttributes().configurationId.field || 'configurationId'}`
  const siPurchaseOrderItemId = `si.${ShipmentItem.getAttributes().purchaseOrderItemId.field || 'purchaseOrderItemId'}`
  const siQtyShipped = `si.${ShipmentItem.getAttributes().qtyShipped.field || 'qtyShipped'}`
  const riPurchaseOrderItemId = `ri.${ReceivedItem.getAttributes().purchaseOrderItemId.field || 'purchaseOrderItemId'}`
  const riQtyReceived = `ri.${ReceivedItem.getAttributes().qtyReceived.field || 'qtyReceived'}`

  // raw SQL query to create the view:
  const createViewSql = `
  CREATE VIEW ${tableViewName} AS
  SELECT 
    ${pId} as configurationId,
    SUM(${poiQtyPurchased}) as qtyPurchased,
    SUM(${siQtyShipped}) as qtyShipped,
    SUM(${riQtyReceived}) as qtyReceived
  FROM 
    ${ProductConfiguration.tableName} p
    LEFT JOIN ${PurchaseOrderItem.tableName} poi ON ${pId} = ${poiConfigurationId}
    LEFT JOIN ${ShipmentItem.tableName} si ON ${poiId} = ${siPurchaseOrderItemId}
    LEFT JOIN ${ReceivedItem.tableName} ri ON ${poiId} = ${riPurchaseOrderItemId}
  GROUP BY p.id;
  `

  // search if the view with a given name already exists
  const results = await db.query<{ 'COUNT(*)': number }>(checkViewExistsSql, { type: QueryTypes.SELECT })
  const totalCount = results[0]['COUNT(*)']
  const viewExists = totalCount > 0

  // do nothig if the view already exists
  if (viewExists) {
    console.log(`view ${tableViewName} already exists`)
  }
  // otherwise create the view
  if (!viewExists) {
    await db.query(createViewSql)
  }

  // initialize the view Model, so that we can use it in the code
  initProductSummaryView(db, tableViewName)

  // one-to-one relationship between ProductConfiguration and ProductSummaryView
  // set up relationship between ProductConfiguration and ProductSummaryView so that we can use eager loading
  // note that views are not actual tables and we cannot use mixins from relationships
  ProductConfiguration.hasOne(ProductSummaryView, {
    as: 'summary',
    sourceKey: 'id',
    foreignKey: 'configurationId',
  })
  ProductSummaryView.belongsTo(ProductConfiguration, {
    as: 'product',
    foreignKey: 'configurationId',
  })
}
