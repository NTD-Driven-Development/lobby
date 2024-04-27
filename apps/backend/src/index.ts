import fastify from 'fastify'
import socketIO from 'fastify-socket.io'
import { Server, Socket } from 'socket.io'

const app = fastify()

// health check
app.get('/health', (_, res) => res.send('ok'))

app.register(socketIO, { cors: { origin: '*' } })
app.ready((err) => {
    if (err) throw err
    app.io.on('connection', (socket: Socket) => console.info('Socket connected!', socket.id))
})

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
