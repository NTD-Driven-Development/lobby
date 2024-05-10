/* eslint-disable @typescript-eslint/no-unused-vars */
import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { container } from 'tsyringe'
import { RoomController } from '~/room/adapter/room-controller'

export const RoomRoutes = (fastify: FastifyInstance, opts: FastifyPluginOptions, done: () => void) => {
    const roomController = container.resolve(RoomController)
    fastify.get('/', roomController.getRooms)
    done()
}
