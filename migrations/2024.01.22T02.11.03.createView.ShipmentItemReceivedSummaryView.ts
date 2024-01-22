// import { MigrationFn } from 'umzug';
import { QueryTypes } from 'sequelize'
import { Migration } from '../umzug'
import { shipmentItemReceivedSummaryView, totalQtyReceivedField } from '../src/views/ShipmentItemReceivedSummary/shipmentItemReceivedSummary'
import { ShipmentItem } from '../src/models/Receiving/ShipmentItem/shipmentItem'
import { ReceivedItem } from '../src/models/Receiving/ReceivedItems/receivedItems'

export const up: Migration = async ({ context: queryIterface }) => {
  const db = queryIterface.sequelize
  // raw SQL query for checking if the view exists with some dynamic values from existing models
  const checkViewExistsSql = `
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.VIEWS 
  WHERE TABLE_SCHEMA = '${db.getDatabaseName()}'
  AND TABLE_NAME = '${shipmentItemReceivedSummaryView}';
  `
  // dyncamically create query parts for type safety
  const siId = `si.${ShipmentItem.getAttributes().id.field || 'id'}`
  const riQtyReceived = `ri.${ReceivedItem.getAttributes().qtyReceived.field || 'qtyReceived'}`
  const riShipmentItemId = `ri.${ReceivedItem.getAttributes().shipmentItemId.field || 'shipmentItemId'}`

  // raw SQL query to create the view:

  // SELECT
  //   si.id as purchaseOrderItemId,
  //   CAST(SUM(qtyReceived) as SIGNED) as totalQtyReceived
  // FROM
  //   shipmentitems si
  //   LEFT JOIN receiveditems ri ON si.id = ri.shipmentItemId
  // GROUP BY si.id

  const createViewSql = `
  CREATE VIEW ${shipmentItemReceivedSummaryView} AS
  SELECT 
    ${siId} as purchaseOrderItemId,
    CAST(SUM(${riQtyReceived}) as SIGNED) as ${totalQtyReceivedField}

  FROM
    ${ShipmentItem.tableName} si
    LEFT JOIN ${ReceivedItem.tableName} ri ON ${siId}=${riShipmentItemId}
  GROUP BY ${siId};
  `

  // search if the view with a given name already exists
  const results = await db.query<{ 'COUNT(*)': number }>(checkViewExistsSql, { type: QueryTypes.SELECT })
  const totalCount = results[0]['COUNT(*)']
  const viewExists = totalCount > 0

  // if view exists - drop it
  if (viewExists) {
    console.log(`view ${shipmentItemReceivedSummaryView} already exists`)
    const dropViewQuery = `DROP VIEW ${shipmentItemReceivedSummaryView}`
    await queryIterface.sequelize.query(dropViewQuery)
    console.log(`view ${shipmentItemReceivedSummaryView} was dropped.`)
  }
  // create the view

  console.log(`creating new ${shipmentItemReceivedSummaryView} view.`)
  await db.query(createViewSql)
}

export const down: Migration = async ({ context: queryIterface }) => {
  const dropViewQuery = `DROP VIEW ${shipmentItemReceivedSummaryView}`
  await queryIterface.sequelize.query(dropViewQuery)
  console.log(`view ${shipmentItemReceivedSummaryView} was dropped.`)
  // await queryIterface.dropTable('ReceivedItems')
}
