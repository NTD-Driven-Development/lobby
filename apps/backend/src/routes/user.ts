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
    //使用者註冊事件
    socket.on('register-user', async (event) => {
        await userController.registerUser(event, socket.auth.user)
    })
    //使用者更新個資事件
    socket.on('update-user-info', async (event) => {
        await userController.updateUserInfo(event, socket.auth.user)
    })
    socket.on('get-my-status', async () => {
        socket.emit('get-my-status-result', await userController.getMyStatus(socket.auth.user))
    })
}
