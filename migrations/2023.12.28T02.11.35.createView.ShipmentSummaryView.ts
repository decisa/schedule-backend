// import { MigrationFn } from 'umzug';
import { QueryTypes } from 'sequelize'
import { ShipmentItem } from '../src/models/Receiving/ShipmentItem/shipmentItem'
import { Migration } from '../umzug'
import { shippedSummaryView, totalQtyShippedField } from '../src/views/ShippedSummary/shippedSummary'
import { PurchaseOrderItem } from '../src/models/Receiving/PurchaseOrderItem/purchaseOrderItem'

// ShippedSummaryView is a view that calculates
// the total number of units shipped from vendors for every configurationId

export const up: Migration = async ({ context: queryIterface }) => {
  const db = queryIterface.sequelize
  // raw SQL query for checking if the view exists with some dynamic values from existing models
  const checkViewExistsSql = `
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.VIEWS 
  WHERE TABLE_SCHEMA = '${db.getDatabaseName()}'
  AND TABLE_NAME = '${shippedSummaryView}';
  `
  // dyncamically create query parts for type safety
  const siPurchaseOrderItemId = `si.${ShipmentItem.getAttributes().purchaseOrderItemId.field || 'purchaseOrderItemId'}`
  const poiId = `poi.${PurchaseOrderItem.getAttributes().id.field || 'id'}`
  const poiConfigurationId = `poi.${PurchaseOrderItem.getAttributes().configurationId.field || 'configurationId'}`
  const siQtyShipped = `si.${ShipmentItem.getAttributes().qtyShipped.field || 'qtyShipped'}`

  // raw SQL query to create the view:
  const createViewSql = `
  CREATE VIEW ${shippedSummaryView} AS
  SELECT 
    ${poiConfigurationId} as configurationId,
    CAST(SUM(${siQtyShipped}) as SIGNED) as ${totalQtyShippedField}
  FROM 
    ${PurchaseOrderItem.tableName} poi
    LEFT JOIN ${ShipmentItem.tableName} si ON ${poiId} = ${siPurchaseOrderItemId}
  GROUP BY ${poiConfigurationId};
  `
/*
  CREATE VIEW ShippedSummaryView AS
  SELECT
    poi.ConfigurationId as configurationId,
    CAST(SUM(si.QtyShipped) as SIGNED) as totalQtyShipped
  FROM
    PurchaseOrderItems poi
    LEFT JOIN ShipmentItems si ON poi.Id = si.purchaseOrderItemId
  GROUP BY poi.ConfigurationId
*/

  // search if the view with a given name already exists
  const results = await db.query<{ 'COUNT(*)': number }>(checkViewExistsSql, { type: QueryTypes.SELECT })
  const totalCount = results[0]['COUNT(*)']
  const viewExists = totalCount > 0

  // if view exists - drop it first
  if (viewExists) {
    console.log(`view ${shippedSummaryView} already exists`)
    const dropViewQuery = `DROP VIEW ${shippedSummaryView}`
    await queryIterface.sequelize.query(dropViewQuery)
    console.log(`view ${shippedSummaryView} was dropped.`)
  }
  // create the view
  console.log(`creating new ${shippedSummaryView} view.`)
  await db.query(createViewSql)
}

export const down: Migration = async ({ context: queryIterface }) => {
  const dropViewQuery = `DROP VIEW ${shippedSummaryView}`
  await queryIterface.sequelize.query(dropViewQuery)
  console.log(`view ${shippedSummaryView} was dropped.`)
  // await queryIterface.dropTable('ReceivedItems')
}
