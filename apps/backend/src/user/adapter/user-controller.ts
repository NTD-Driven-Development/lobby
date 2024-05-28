/* eslint-disable @typescript-eslint/no-unused-vars */
import { UpdateUserInfoEventSchema } from '@packages/domain'
import { autoInjectable, inject } from 'tsyringe'
import { Auth0User } from '~/middlewares'
import { RegisterUserUseCase, UpdateUserInfoUseCase, GetMyStatusUseCase } from '~/user/usecases'
import { SocketThrow } from '~/decorators'
import { Socket } from 'socket.io'
import { Server } from '@packages/socket'

// import { FastifyReply, FastifyRequest } from 'fastify'
// @autoInjectable()
// export class UserController {
//     public async getUsers(request: FastifyRequest, reply: FastifyReply) {
//         return 'Hello World!'
//     }
// }

@autoInjectable()
export class UserController {
    constructor(
        @inject(Socket)
        private socket: Server,
        @inject(RegisterUserUseCase)
        private registerUserUseCase: RegisterUserUseCase,
        @inject(UpdateUserInfoUseCase)
        private updateUserInfoUseCase: UpdateUserInfoUseCase,
        @inject(GetMyStatusUseCase)
        private getMyStatusUseCase: GetMyStatusUseCase,
    ) {}

    @SocketThrow
    public async registerUser(user: Auth0User) {
        await this.registerUserUseCase.execute({
            email: user.email,
            name: user.name,
        })
    }

    @SocketThrow
    public async updateUserInfo(event: UpdateUserInfoEventSchema, user: Auth0User) {
        await this.updateUserInfoUseCase.execute({
            email: user.email,
            name: event.data?.name,
        })
    }

    @SocketThrow
    public async getMyStatus(user: Readonly<Auth0User>) {
        return await this.getMyStatusUseCase.execute({ email: user.email })
    }
}
