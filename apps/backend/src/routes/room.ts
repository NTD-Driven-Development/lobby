/* eslint-disable @typescript-eslint/no-unused-vars */
import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { RoomController } from '~/controllers/room-controller'

export const RoomRoutes = (fastify: FastifyInstance, opts: FastifyPluginOptions, done: () => void) => {
    fastify.get('/', RoomController.getRooms)
    done()
}
