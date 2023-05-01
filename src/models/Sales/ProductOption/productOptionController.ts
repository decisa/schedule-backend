import { Transaction } from 'sequelize'
import type { ProductOptionShape } from '../../models'
import { ProductConfiguration } from '../ProductConfiguration/productConfiguration'
import { ProductOption } from './productOption'
import db from '../..'

export default class ProductOptionController {
  static async upsertMagentoProductOptions(
    options: ProductOptionShape[],
    configInstance: ProductConfiguration,
    t?: Transaction,
  ): Promise<ProductOption[]> {
    if (!options.length) {
      return []
    }
    let transaction: Transaction
    if (t) {
      transaction = t
    } else {
      transaction = await db.transaction()
    }
    try {
      const result: ProductOption[] = []

      for (let i = 0; i < options?.length; i += 1) {
        const option = options[i]
        if (!option.externalId || !configInstance.id) {
          throw new Error('external option id or configuration id is missing')
        }

        let productOptionRecord: ProductOption | null
        productOptionRecord = await ProductOption.findOne({
          transaction,
          where: {
            externalId: option.externalId,
            configId: configInstance.id,
          },
        })
        if (!productOptionRecord) {
          productOptionRecord = await ProductOption.create({
            ...option,
            configId: configInstance.id,
          }, {
            transaction,
          })
        } else {
        // update option record:
          const updatedOptionValues: ProductOptionShape = {
            sortOrder: option.sortOrder,
            externalId: option.externalId,
            externalValue: option.externalValue,
            label: productOptionRecord.label || option.label,
            value: productOptionRecord.value || option.value,
            configId: configInstance.id,
          }

          productOptionRecord.set(updatedOptionValues)
          productOptionRecord = await productOptionRecord.save({
            transaction,
          })
        }
        result.push(productOptionRecord)
      }

      if (!t) {
      // if no transaction was provided, commit the local transaction:
        await transaction.commit()
      }
      return result
    } catch (error) {
      // if the t transaction was passed to the method, throw error again
      // to be processed by another
      if (t) {
        throw error
      }
      console.log('error occured: ', error, 'rolling back transaction')
      await transaction.rollback()
      return []
    }
  }
}
