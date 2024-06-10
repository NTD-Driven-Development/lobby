import { config } from 'dotenv'
if (process.env.NODE_ENV === 'production') {
    config({ path: `../.env.${process.env.NODE_ENV}` })
} else {
    config({ path: `.env.${process.env.NODE_ENV}` })
}
import 'reflect-metadata'
import { container } from 'tsyringe'
import { AppDataSource } from '~/data/data-source'
import { GameService } from '~/services/game-service'
;(async () => {
    await AppDataSource.initialize()
    if (AppDataSource.isInitialized) {
        console.log('LOBBY Database is connected')

        const gameService = container.resolve(GameService)
        const interval = setInterval(
            async () => {
                console.log('Heartbeat')
                await gameService.discoveryGameServices()
            },
            Number(process.env.HEARTBEAT_INTERVAL || '5000'),
        )
        process.on('SIGINT', () => {
            clearInterval(interval)
            process.exit(0)
        })
    } else {
        console.error('LOBBY Database is not connected')
        process.exit(1)
    }
})()
