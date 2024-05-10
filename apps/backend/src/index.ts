import 'reflect-metadata'
import fastify from 'fastify'
import socketIO from 'fastify-socket.io'
import { GameEventHandlers } from './routes'
import { Server } from '@packages/socket'
import { Socket } from 'socket.io'
import { container } from 'tsyringe'
// import { UserRoutes, RoomRoutes, GameRoutes } from '~/routes'

const app = fastify()

// health check
app.get('/api/health', (_, res) => res.send('ok'))

// prefix api
// app.register(RoomRoutes, { prefix: '/api/rooms' })
// app.register(GameRoutes, { prefix: '/api/games' })
// app.register(UserRoutes, { prefix: '/api/users' })

// socket.io
app.register(socketIO, { cors: { origin: '*' } })
app.ready((err) => {
    if (err) throw err
    app.io.on('connection', (socket: Server) => {
        container.registerInstance(Socket, socket)

        console.info('Socket connected!', socket.id)

        GameEventHandlers(socket)

        socket.on('disconnect', () => console.info('Socket disconnected!', socket.id))
    })

    app.io.on('error', (error) => console.error('Socket error:', error))
})

// start server
app.listen(
    {
        port: Number(process.env.NODE_PORT) || 3000,
        host: '0.0.0.0',
    },
    (err, address) => {
        if (err) {
            console.error(err)
            process.exit(1)
        }
        console.log(`Server listening at ${address}`)
    },
)

declare module 'fastify' {
    interface FastifyInstance {
        io: Socket
    }
}
