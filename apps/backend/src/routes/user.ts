/* eslint-disable @typescript-eslint/no-unused-vars */
import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { container } from 'tsyringe'
import { UserController } from '~/user/adapter/user-controller'

export const UserRoutes = (fastify: FastifyInstance, opts: FastifyPluginOptions, done: () => void) => {
    const userController = container.resolve(UserController)
    fastify.get('/', userController.getUsers)
    done()
}
