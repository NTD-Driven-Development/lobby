/* eslint-disable @typescript-eslint/no-unused-vars */
import { Server } from '@packages/socket'
import { container } from 'tsyringe'
import { UserController } from '~/user/adapter/user-controller'

// import { FastifyInstance, FastifyPluginOptions } from 'fastify'
// export const UserRoutes = (fastify: FastifyInstance, opts: FastifyPluginOptions, done: () => void) => {
//     const userController = container.resolve(UserController)
//     fastify.get('/', userController.getUsers)
//     done()
// }

export const UserEventHandlers = (socket: Server) => {
    const userController = container.resolve(UserController)
    socket.on('register-user', async (event) => {
        await userController.registerUser(event, socket.auth.user)
    })
}
