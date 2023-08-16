import { seeder } from './umzug'

if (require.main === module) {
  seeder.runAsCLI()
    .then((success: boolean) => {
      if (success) {
        console.log('Seeder complted successfully')
        // exit with success
        process.exit(0)
      } else {
        console.log('Seeder finished with errors')
        // exit with failure
        process.exit(1)
      }
    })
    .catch((err) => {
      console.log('Seeder has failed')
      console.log(err)
      // exit with failure
      process.exit(1)
    })
}
