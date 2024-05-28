/* eslint-disable @typescript-eslint/no-unused-vars */
import { RegisterUserEventSchema, UpdateUserInfoEventSchema } from '@packages/domain'
import { FastifyReply, FastifyRequest } from 'fastify'
import { autoInjectable, inject } from 'tsyringe'
import { Auth0User } from '~/middleware/socket-auth0'
import { RegisterUserUseCase } from '../usecases/register-user-usecase'
import { UpdateUserInfoUseCase } from '../usecases/update-user-info-usecase'
import { GetMyStatusUseCase } from '../usecases/get-my-status-usecase'
import { SocketThrow } from '~/decorators/socket-throw'
import { Socket } from 'socket.io'
import { Server } from '@packages/socket'

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
