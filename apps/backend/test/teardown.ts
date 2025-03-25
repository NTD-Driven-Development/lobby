import { Config } from '@jest/types'

export default async function (globalConfig: Config.GlobalConfig, projectConfig: Config.ProjectConfig) {
    if (projectConfig.globals.CLOSE_TEST_DB) {
        await closeDb()
    }
}

async function closeDb() {
    console.log('stopping db...')
    await globalThis.pgContainer.stop()
    console.log('db stopped...')
}
