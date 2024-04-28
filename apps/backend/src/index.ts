import fastify from 'fastify'
import socketIO from 'fastify-socket.io'
import { Server, Socket } from 'socket.io'
import { UserRoutes, RoomRoutes, GameRoutes } from '~/routes'

const app = fastify()

// health check
app.get('/api/health', (_, res) => res.send('ok'))

// prefix api
app.register(RoomRoutes, { prefix: '/api/rooms' })
app.register(GameRoutes, { prefix: '/api/games' })
app.register(UserRoutes, { prefix: '/api/users' })

// socket.io
app.register(socketIO, { cors: { origin: '*' } })
app.ready((err) => {
    if (err) throw err
    app.io.on('connection', (socket: Socket) => {
        console.info('Socket connected!', socket.id)
        socket.on('ping', (data: { msg: string }) => {
            console.info('Socket received:', data.msg)
            socket.emit('pong', { msg: 'pong!' })
        })
        socket.on('disconnect', () => console.info('Socket disconnected!', socket.id))
    })

    app.io.on('error', (error) => console.error('Socket error:', error))
})

// start server
app.listen(
    {
        port: 3000,
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
        io: Server<{ hello: string }>
    }
}
