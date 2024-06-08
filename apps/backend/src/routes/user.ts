/* eslint-disable @typescript-eslint/no-unused-vars */
import { Server } from '@packages/socket'
import { Event, Socket } from 'socket.io'
import { container } from 'tsyringe'
import { UserController } from '~/user/adapter/user-controller'

// import { FastifyInstance, FastifyPluginOptions } from 'fastify'
// export const UserRoutes = (fastify: FastifyInstance, opts: FastifyPluginOptions, done: () => void) => {
//     const userController = container.resolve(UserController)
//     fastify.get('/', userController.getUsers)
//     done()
// }

export const UserEventHandlers = (socket: Server) => async (event: Event, next: (err?: Error) => void) => {
    container.registerInstance(Socket, socket)
    const userController = container.resolve(UserController)

    switch (event[0]) {
        case 'register-user':
            await userController.registerUser(socket.auth.user)
            next()
            break
        case 'update-user-info':
            await userController.updateUserInfo(event[1], socket.auth.user)
            next()
            break
        case 'get-my-status':
            socket.emit('get-my-status-result', await userController.getMyStatus(socket.auth.user))
            next()
            break
        default:
            // auto register user when socket connected
            await userController.registerUser(socket.auth.user).then(() => {
                console.log('user registered')
                // auto join room when user has roomId
                userController.getMyStatus(socket.auth.user).then((status) => {
                    if (status.data.roomId) {
                        if (!socket.rooms.has(status.data.roomId)) {
                            socket.join(status.data.roomId)
                            console.log('join room', status.data.roomId)
                        } else {
                            console.log('exist room', status.data.roomId)
                        }
                    }
                    next()
                })
            })
            break
    }
}
