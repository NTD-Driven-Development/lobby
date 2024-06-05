import { Server } from '@packages/socket'
import { container } from 'tsyringe'
import { RoomController } from '~/room/adapter/room-controller'

// export const RoomRoutes = (fastify: FastifyInstance, opts: FastifyPluginOptions, done: () => void) => {
//     const roomController = container.resolve(RoomController)
//     fastify.get('/', roomController.getRooms)
//     done()
// }

export const RoomEventHandlers = (socket: Server) => {
    const roomController = container.resolve(RoomController)
    socket.on('create-room', async (event) => {
        await roomController.createRoom(event, socket.auth.user)
    })
    socket.on('join-room', async (event) => {
        await roomController.joinRoom(event, socket.auth.user)
    })
    socket.on('change-readiness', async (event) => {
        await roomController.changeReadiness(event, socket.auth.user)
    })
    socket.on('leave-room', async (event) => {
        await roomController.leaveRoom(event, socket.auth.user)
    })
    socket.on('get-room', async (event) => {
        socket.emit('get-room-result', await roomController.getRoom(event, socket.auth.user))
    })
    socket.on('get-rooms', async (event) => {
        socket.emit('get-rooms-result', await roomController.getRooms(event, socket.auth.user))
    })
    socket.on('kick-player', async (event) => {
        await roomController.kickPlayer(event, socket.auth.user)
    })
}
