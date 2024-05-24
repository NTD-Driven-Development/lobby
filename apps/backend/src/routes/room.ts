/* eslint-disable @typescript-eslint/no-unused-vars */
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
}
