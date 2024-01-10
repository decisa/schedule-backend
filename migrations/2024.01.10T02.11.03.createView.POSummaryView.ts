// import { MigrationFn } from 'umzug';
import { QueryTypes } from 'sequelize'
import { Migration } from '../umzug'

import { poSummaryViewName } from '../src/views/PurchaseOrders/poSummary'
import { PurchaseOrderItem } from '../src/models/Receiving/PurchaseOrderItem/purchaseOrderItem'
import { POReceivedView } from '../src/views/PurchaseOrders/poReceived'
import { POShippedView } from '../src/views/PurchaseOrders/poShipped'

export const up: Migration = async ({ context: queryIterface }) => {
  const db = queryIterface.sequelize
  // raw SQL query for checking if the view exists with some dynamic values from existing models
  const checkViewExistsSql = `
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.VIEWS 
  WHERE TABLE_SCHEMA = '${db.getDatabaseName()}'
  AND TABLE_NAME = '${poSummaryViewName}';
  `
  // dyncamically create query parts for type safety
  const poiId = `poi.${PurchaseOrderItem.getAttributes().id.field || 'id'}`
  const poiQtyPurchased = `poi.${PurchaseOrderItem.getAttributes().qtyPurchased.field || 'qtyPurchased'}`

  const porvTotalQtyReceived = `porv.${POReceivedView.getAttributes().totalQtyReceived.field || 'totalQtyReceived'}`
  const porvPurchaseOrderItemId = `porv.${POReceivedView.getAttributes().purchaseOrderItemId.field || 'purchaseOrderItemId'}`

  const posvTotalQtyShipped = `posv.${POShippedView.getAttributes().totalQtyShipped.field || 'totalQtyShipped'}`
  const posvPurchaseOrderItemId = `posv.${POShippedView.getAttributes().purchaseOrderItemId.field || 'purchaseOrderItemId'}`
  // raw SQL query to create the view:
  const createViewSql = `
  CREATE VIEW ${poSummaryViewName} AS
  SELECT 
    ${poiId} as purchaseOrderItemId,
    COALESCE(${poiQtyPurchased}, 0) as qtyPurchased,
    COALESCE(${porvTotalQtyReceived}, 0) as qtyReceived,
    COALESCE(${posvTotalQtyShipped}, 0) as qtyShipped
  FROM
    ${PurchaseOrderItem.tableName} poi
    LEFT JOIN ${POReceivedView.tableName} porv ON ${porvPurchaseOrderItemId}=${poiId}
    LEFT JOIN ${POShippedView.tableName} posv ON ${posvPurchaseOrderItemId}=${poiId};
  `

  // search if the view with a given name already exists
  const results = await db.query<{ 'COUNT(*)': number }>(checkViewExistsSql, { type: QueryTypes.SELECT })
  const totalCount = results[0]['COUNT(*)']
  const viewExists = totalCount > 0

  // if view exists - drop it
  if (viewExists) {
    console.log(`view ${poSummaryViewName} already exists`)
    const dropViewQuery = `DROP VIEW ${poSummaryViewName}`
    await queryIterface.sequelize.query(dropViewQuery)
    console.log(`view ${poSummaryViewName} was dropped.`)
  }
  // create the view

  console.log(`creating new ${poSummaryViewName} view.`)
  await db.query(createViewSql)
}

export const down: Migration = async ({ context: queryIterface }) => {
  const dropViewQuery = `DROP VIEW ${poSummaryViewName}`
  await queryIterface.sequelize.query(dropViewQuery)
  console.log(`view ${poSummaryViewName} was dropped.`)
  // await queryIterface.dropTable('ReceivedItems')
}
