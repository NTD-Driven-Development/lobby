/* eslint-disable @typescript-eslint/no-unused-vars */
import { RegisterUserEventSchema } from '@packages/domain'
import { FastifyReply, FastifyRequest } from 'fastify'
import { autoInjectable, inject } from 'tsyringe'
import { Auth0User } from '~/middleware/socket-auth0'
import { RegisterUserUseCase } from '../usecases/register-user-usecase'

// @autoInjectable()
// export class UserController {
//     public async getUsers(request: FastifyRequest, reply: FastifyReply) {
//         return 'Hello World!'
//     }
// }

@autoInjectable()
export class UserController {
    constructor(
        @inject(RegisterUserUseCase)
        private registerUserUseCase: RegisterUserUseCase,
    ) {
        this.registerUserUseCase = registerUserUseCase
    }
    public async registerUser(event: RegisterUserEventSchema, user: Auth0User) {
        await this.registerUserUseCase.execute({
            email: user.email,
            name: user.name,
        })
    }
}
