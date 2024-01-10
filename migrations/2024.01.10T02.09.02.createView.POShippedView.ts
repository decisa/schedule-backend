// import { MigrationFn } from 'umzug';
import { QueryTypes } from 'sequelize'
import { Migration } from '../umzug'
import { ShipmentItem } from '../src/models/Receiving/ShipmentItem/shipmentItem'
import { totalQtyShippedField } from '../src/views/ShippedSummary/shippedSummary'
import { PurchaseOrderItem } from '../src/models/Receiving/PurchaseOrderItem/purchaseOrderItem'
import { poShippedViewName } from '../src/views/PurchaseOrders/poShipped'

export const up: Migration = async ({ context: queryIterface }) => {
  const db = queryIterface.sequelize
  // raw SQL query for checking if the view exists with some dynamic values from existing models
  const checkViewExistsSql = `
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.VIEWS 
  WHERE TABLE_SCHEMA = '${db.getDatabaseName()}'
  AND TABLE_NAME = '${poShippedViewName}';
  `
  // dyncamically create query parts for type safety
  const poiId = `poi.${PurchaseOrderItem.getAttributes().id.field || 'id'}`
  const siQtyShipped = `si.${ShipmentItem.getAttributes().qtyShipped.field || 'qtyShipped'}`
  const siPurchaseOrderItemId = `si.${ShipmentItem.getAttributes().purchaseOrderItemId.field || 'purchaseOrderItemId'}`
  // raw SQL query to create the view:
  const createViewSql = `
  CREATE VIEW ${poShippedViewName} AS
  SELECT 
    ${poiId} as purchaseOrderItemId,
    SUM(${siQtyShipped}) as ${totalQtyShippedField}
  FROM
    ${PurchaseOrderItem.tableName} poi
    LEFT JOIN ${ShipmentItem.tableName} si ON ${siPurchaseOrderItemId}=${poiId}
    GROUP BY ${poiId}, ${siPurchaseOrderItemId};
  `

  // search if the view with a given name already exists
  const results = await db.query<{ 'COUNT(*)': number }>(checkViewExistsSql, { type: QueryTypes.SELECT })
  const totalCount = results[0]['COUNT(*)']
  const viewExists = totalCount > 0

  // if view exists - drop it
  if (viewExists) {
    console.log(`view ${poShippedViewName} already exists`)
    const dropViewQuery = `DROP VIEW ${poShippedViewName}`
    await queryIterface.sequelize.query(dropViewQuery)
    console.log(`view ${poShippedViewName} was dropped.`)
  }
  // create the view

  console.log(`creating new ${poShippedViewName} view.`)
  await db.query(createViewSql)
}

export const down: Migration = async ({ context: queryIterface }) => {
  const dropViewQuery = `DROP VIEW ${poShippedViewName}`
  await queryIterface.sequelize.query(dropViewQuery)
  console.log(`view ${poShippedViewName} was dropped.`)
  // await queryIterface.dropTable('ReceivedItems')
}
