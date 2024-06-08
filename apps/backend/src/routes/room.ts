/* eslint-disable @typescript-eslint/no-explicit-any */
import { Server } from '@packages/socket'
import { Event, Socket } from 'socket.io'
import { container } from 'tsyringe'
import { RoomController } from '~/room/adapter/room-controller'

// export const RoomRoutes = (fastify: FastifyInstance, opts: FastifyPluginOptions, done: () => void) => {
//     const roomController = container.resolve(RoomController)
//     fastify.get('/', roomController.getRooms)
//     done()
// }

export const RoomEventHandlers = (socket: Server) => async (event: Event, next: (err?: Error) => void) => {
    container.registerInstance(Socket, socket)
    const roomController = container.resolve(RoomController)
    switch (event[0]) {
        case 'create-room':
            await roomController.createRoom(event[1], socket.auth.user)
            next()
            break
        case 'join-room':
            await roomController.joinRoom(event[1], socket.auth.user)
            next()
            break
        case 'change-readiness':
            await roomController.changeReadiness(event[1], socket.auth.user)
            next()
            break
        case 'leave-room':
            await roomController.leaveRoom(event[1], socket.auth.user)
            next()
            break
        case 'get-room':
            socket.emit('get-room-result', await roomController.getRoom(event[1], socket.auth.user))
            next()
            break
        case 'get-rooms':
            socket.emit('get-rooms-result', await roomController.getRooms(event[1], socket.auth.user))
            next()
            break
        case 'kick-player':
            await roomController.kickPlayer(event[1], socket.auth.user)
            next()
            break
        default:
            next()
            break
    }
}
