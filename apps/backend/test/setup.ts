/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-var-requires */
import 'tsconfig-paths/register'
import { Config } from '@jest/types'
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql'

declare global {
    var SOCKET_URL: string
    var pgContainer: StartedPostgreSqlContainer
}

require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` })

export default async function (globalConfig: Config.GlobalConfig, projectConfig: Config.ProjectConfig) {
    if (globalConfig.testPathPattern.includes('/unit')) {
        console.log('is unit test, skip setup server')
        return
    }
    // Connect our container
    console.log('starting test db...')
    const pgsqlContainer = await new PostgreSqlContainer('postgres:16-alpine3.19')
        .withUsername(process.env.DB_USER)
        .withPassword(process.env.DB_PASSWORD)
        .withDatabase(process.env.DB_NAME)
        .withExposedPorts({
            container: 5432,
            host: Number(process.env.DB_PORT),
        })
        .withReuse()
        .start()
    globalThis.pgContainer = pgsqlContainer
    console.log('test db started...')
    console.log('setup test server')
    await require('../src/index')
}
