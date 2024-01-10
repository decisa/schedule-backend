// import { MigrationFn } from 'umzug';
import { QueryTypes } from 'sequelize'
import { Migration } from '../umzug'
import { ShipmentItem } from '../src/models/Receiving/ShipmentItem/shipmentItem'
import { ReceivedItem } from '../src/models/Receiving/ReceivedItems/receivedItems'
import { poReceivedViewName } from '../src/views/PurchaseOrders/poReceived'

export const up: Migration = async ({ context: queryIterface }) => {
  const db = queryIterface.sequelize
  // raw SQL query for checking if the view exists with some dynamic values from existing models
  const checkViewExistsSql = `
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.VIEWS 
  WHERE TABLE_SCHEMA = '${db.getDatabaseName()}'
  AND TABLE_NAME = '${poReceivedViewName}';
  `
  // dyncamically create query parts for type safety
  const siId = `si.${ShipmentItem.getAttributes().id.field || 'id'}`
  const siPOId = `si.${ShipmentItem.getAttributes().purchaseOrderItemId.field || 'purchaseOrderItemId'}`
  const riQtyReceived = `ri.${ReceivedItem.getAttributes().qtyReceived.field || 'qtyReceived'}`
  const riShipmentItemId = `ri.${ReceivedItem.getAttributes().shipmentItemId.field || 'shipmentItemId'}`
  // raw SQL query to create the view:
  const createViewSql = `
  CREATE VIEW ${poReceivedViewName} AS
  SELECT 
    ${siPOId} as purchaseOrderItemId,
    SUM(${riQtyReceived}) as totalQtyReceived
  FROM
    ${ReceivedItem.tableName} ri
    LEFT JOIN ${ShipmentItem.tableName} si ON ${riShipmentItemId}=${siId}
  GROUP BY ${siPOId};
  `

  // search if the view with a given name already exists
  const results = await db.query<{ 'COUNT(*)': number }>(checkViewExistsSql, { type: QueryTypes.SELECT })
  const totalCount = results[0]['COUNT(*)']
  const viewExists = totalCount > 0

  // if view exists - drop it
  if (viewExists) {
    console.log(`view ${poReceivedViewName} already exists`)
    const dropViewQuery = `DROP VIEW ${poReceivedViewName}`
    await queryIterface.sequelize.query(dropViewQuery)
    console.log(`view ${poReceivedViewName} was dropped.`)
  }
  // create the view

  console.log(`creating new ${poReceivedViewName} view.`)
  await db.query(createViewSql)
}

export const down: Migration = async ({ context: queryIterface }) => {
  const dropViewQuery = `DROP VIEW ${poReceivedViewName}`
  await queryIterface.sequelize.query(dropViewQuery)
  console.log(`view ${poReceivedViewName} was dropped.`)
  // await queryIterface.dropTable('ReceivedItems')
}
