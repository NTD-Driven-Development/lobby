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

export const UserEventHandlers = async (socket: Server) => {
    const userController = container.resolve(UserController)
    // auto register user when socket connected
    await userController.registerUser(socket.auth.user).then(() => {
        console.log('user registered')
        userController.getMyStatus(socket.auth.user).then((status) => {
            if (status.data.roomId) {
                if (!socket.rooms.has(status.data.roomId)) {
                    socket.join(status.data.roomId)
                    console.log('join room', status.data.roomId)
                } else {
                    console.log('exist room', status.data.roomId)
                }
            }
        })
    })
    // 使用者註冊事件
    socket.on('register-user', async () => {
        await userController.registerUser(socket.auth.user)
    })
    // 使用者更新個資事件
    socket.on('update-user-info', async (event) => {
        await userController.updateUserInfo(event, socket.auth.user)
    })
    // 取得使用者狀態事件

    socket.on('get-my-status', async () => {
        socket.emit('get-my-status-result', await userController.getMyStatus(socket.auth.user))
    })
}
