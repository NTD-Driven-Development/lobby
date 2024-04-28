/* eslint-disable @typescript-eslint/no-unused-vars */
import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { UserController } from '~/controllers/user-controller'

export const UserRoutes = (fastify: FastifyInstance, opts: FastifyPluginOptions, done: () => void) => {
    fastify.get('/', UserController.getUsers)
    done()
}
