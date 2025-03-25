/* eslint-disable @typescript-eslint/no-explicit-any */
import { config } from 'dotenv'
if (process.env.NODE_ENV === 'production') {
    config({ path: `../.env.${process.env.NODE_ENV}` })
} else {
    config({ path: `.env.${process.env.NODE_ENV}` })
}
import 'reflect-metadata'
import fastify from 'fastify'
import socketIO from 'fastify-socket.io'
import { GameEventHandlers, RoomEventHandlers, RoomRoutes, UserEventHandlers } from '~/routes'
import { Server } from '@packages/socket'
import { Socket } from 'socket.io'
import { container } from 'tsyringe'
import { auth0Middleware } from '~/middlewares'
import { AppDataSource } from './data/data-source'
import { GetNewStatusHandler } from './middlewares/get-new-status'
;['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach((signal) =>
    process.on(signal, async () => {
        /** do your logic */
        console.log('Server shutting down...')
        await AppDataSource.destroy()
        process.exit()
    }),
)
;(async () => {
    try {
        // import { UserRoutes, RoomRoutes, GameRoutes } from '~/routes'
        const app = fastify()

        // health check
        app.get('/api/health', (_, res) => res.send('ok'))

        // socket.io
        app.register(socketIO, { cors: { origin: '*' } })
        // prefix api
        app.register(RoomRoutes, { prefix: '/api/rooms' })
        app.ready(async (err) => {
            if (err) throw err
            container.registerInstance('ServerSocket', app.io)

            app.io.use(auth0Middleware() as any)
            app.io.on('connection', (socket: Server) => {
                socket.on('disconnect', () => console.info('Socket disconnected!', socket.id))
                container.registerInstance(Socket, socket)

                console.info('Socket connected!', socket.id)
                socket.use(UserEventHandlers(socket))
                socket.use(RoomEventHandlers(socket))
                socket.use(GameEventHandlers(socket))
                socket.use(GetNewStatusHandler(socket))
            })

            app.io.on('error', (error) => console.error('Socket error:', error))
        })
        await AppDataSource.initialize()
        if (AppDataSource.isInitialized) {
            // start server
            app.listen(
                {
                    port: Number(process.env.NODE_PORT) || 3001,
                    host: process.env.NODE_HOST || '0.0.0.0',
                },
                (err, address) => {
                    if (err) {
                        console.error(err)
                        process.exit(1)
                    }
                    console.log(`Server listening at ${address}`)
                },
            )
        }
    } catch (err) {
        console.error(err)
        process.exit(1)
    }
})()

declare module 'fastify' {
    interface FastifyInstance {
        io: Socket
    }
}
