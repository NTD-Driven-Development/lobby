/* eslint-disable @typescript-eslint/no-unused-vars */
import { CreateRoomEventSchema } from '@packages/domain'
import { autoInjectable, inject } from 'tsyringe'
import { CreateRoomUseCase } from '../usecases/create-room-usecase'
import { Auth0User } from '~/middleware/socket-auth0'

// @autoInjectable()
// export class RoomController {
//     public async getRooms(request: FastifyRequest, reply: FastifyReply) {
//         return 'Hello World!'
//     }
// }

@autoInjectable()
export class RoomController {
    constructor(
        @inject(CreateRoomUseCase)
        private createRoomUseCase: CreateRoomUseCase,
    ) {
        this.createRoomUseCase = createRoomUseCase
    }
    public async createRoom(event: CreateRoomEventSchema, user: Auth0User) {
        await this.createRoomUseCase.execute({
            ...event.data,
            host: {
                id: user.email,
                name: user.name,
                isReady: true,
            },
        })
    }
}
