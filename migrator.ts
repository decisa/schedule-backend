import { migrator } from './umzug'

if (require.main === module) {
  migrator.runAsCLI()
    .then((success: boolean) => {
      if (success) {
        console.log('migration completed successfully')
        // exit with success
        process.exit(0)
      }
      console.log('migration finished with errors')
      // exit with failure
      process.exit(1)
    })
    .catch((err) => {
      console.log('Migrator has failed')
      console.log(err)
      // exit with failure
      process.exit(1)
    })
}
