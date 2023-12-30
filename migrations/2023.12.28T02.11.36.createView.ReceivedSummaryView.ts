// import { MigrationFn } from 'umzug';
import { QueryTypes } from 'sequelize'
import { Migration } from '../umzug'
import { ReceivedItem } from '../src/models/Receiving/ReceivedItems/receivedItems'
import { receivedSummaryView, totalQtyReceivedField } from '../src/views/ReceivedSummary/receivedSummary'
import { PurchaseOrderItem } from '../src/models/Receiving/PurchaseOrderItem/purchaseOrderItem'
import { ShipmentItem } from '../src/models/Receiving/ShipmentItem/shipmentItem'

export const up: Migration = async ({ context: queryIterface }) => {
  const db = queryIterface.sequelize
  // raw SQL query for checking if the view exists with some dynamic values from existing models
  const checkViewExistsSql = `
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.VIEWS 
  WHERE TABLE_SCHEMA = '${db.getDatabaseName()}'
  AND TABLE_NAME = '${receivedSummaryView}';
  `
  // dyncamically create query parts for type safety
  const riQtyReceived = `ri.${ReceivedItem.getAttributes().qtyReceived.field || 'qtyReceived'}`
  const riShipmentItemId = `ri.${ReceivedItem.getAttributes().shipmentItemId.field || 'shipmentItemId'}`
  const poiId = `poi.${PurchaseOrderItem.getAttributes().id.field || 'id'}`

  const poiConfigurationId = `poi.${PurchaseOrderItem.getAttributes().configurationId.field || 'configurationId'}`

  const siPurchaseOrderItemId = `si.${ShipmentItem.getAttributes().purchaseOrderItemId.field || 'purchaseOrderItemId'}`
  const siId = `si.${ShipmentItem.getAttributes().id.field || 'id'}`

  // raw SQL query to create the view:
  const createViewSql = `
  CREATE VIEW ${receivedSummaryView} AS
  SELECT 
    ${poiConfigurationId} as configurationId,
    CAST(SUM(${riQtyReceived}) as SIGNED) as ${totalQtyReceivedField}
  FROM 
    ${PurchaseOrderItem.tableName} poi
    LEFT JOIN ${ShipmentItem.tableName} si ON ${poiId} = ${siPurchaseOrderItemId}
    LEFT JOIN ${ReceivedItem.tableName} ri ON ${riShipmentItemId} = ${siId}
  GROUP BY ${poiConfigurationId};
  `

  // search if the view with a given name already exists
  const results = await db.query<{ 'COUNT(*)': number }>(checkViewExistsSql, { type: QueryTypes.SELECT })
  const totalCount = results[0]['COUNT(*)']
  const viewExists = totalCount > 0

  // if view exists - drop it first
  if (viewExists) {
    console.log(`view ${receivedSummaryView} already exists`)
    const dropViewQuery = `DROP VIEW ${receivedSummaryView}`
    await queryIterface.sequelize.query(dropViewQuery)
    console.log(`view ${receivedSummaryView} was dropped.`)
  }
  // create the view
  console.log(`creating new ${receivedSummaryView} view.`)
  await db.query(createViewSql)
}

export const down: Migration = async ({ context: queryIterface }) => {
  const dropViewQuery = `DROP VIEW ${receivedSummaryView}`
  await queryIterface.sequelize.query(dropViewQuery)
  console.log(`view ${receivedSummaryView} was dropped.`)
  // await queryIterface.dropTable('ReceivedItems')
}
