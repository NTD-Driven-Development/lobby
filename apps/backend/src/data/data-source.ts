import dotenv from 'dotenv'
dotenv.config({ path: `.env.${process.env.NODE_ENV}` })
import { DataSource } from 'typeorm'
import { GameData } from '~/data/entity'

export const AppDataSource = new DataSource({
    type: process.env.DB_TYPE as 'mariadb' | 'mongodb' | 'mysql' | 'mssql' | 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true,
    logging: ['error'],
    entities: [GameData],
    subscribers: [],
    migrations: [],
    extra: {
        connectionLimit: 10,
    },
})

AppDataSource.initialize()
    .then(() => {
        console.log('Database connected')
    })
    .catch((err) => {
        console.error('Database connection error', err)
        process.exit(1)
    })
