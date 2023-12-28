// import { MigrationFn } from 'umzug';
import { QueryTypes } from 'sequelize'
import { PurchaseOrderItem } from '../src/models/Receiving/PurchaseOrderItem/purchaseOrderItem'
import { ReceivedItem } from '../src/models/Receiving/ReceivedItems/receivedItems'
import { ShipmentItem } from '../src/models/Receiving/ShipmentItem/shipmentItem'
import { ProductConfiguration } from '../src/models/Sales/ProductConfiguration/productConfiguration'
import { Migration } from '../umzug'

const tableViewName = 'ProductSummaryViews'

export const up: Migration = async ({ context: queryIterface }) => {
  const db = queryIterface.sequelize
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

  // if view exists - drop it
  if (viewExists) {
    console.log(`view ${tableViewName} already exists`)
    const dropViewQuery = `DROP VIEW ${tableViewName}`
    await queryIterface.sequelize.query(dropViewQuery)
    console.log(`view ${tableViewName} was dropped.`)
  }
  // create the view
  if (!viewExists) {
    console.log(`creating new ${tableViewName} view.`)
    await db.query(createViewSql)
  }
}

export const down: Migration = async ({ context: queryIterface }) => {
  const dropViewQuery = `DROP VIEW ${tableViewName}`
  await queryIterface.sequelize.query(dropViewQuery)
  console.log(`view ${tableViewName} was dropped.`)
  // await queryIterface.dropTable('ReceivedItems')
}
