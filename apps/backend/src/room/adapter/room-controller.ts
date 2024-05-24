/* eslint-disable @typescript-eslint/no-unused-vars */
import { CreateRoomEventSchema, Player } from '@packages/domain'
import { autoInjectable, inject } from 'tsyringe'
import { CreateRoomUseCase } from '../usecases/create-room-usecase'

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
    public async createRoom(event: CreateRoomEventSchema, host: Player) {
        console.log('create-room', event)
        console.log('host', host)
        const createRoomData = {
            ...event.data,
            host: host,
            players: [host],
        }

        await this.createRoomUseCase.execute(createRoomData)
    }
}
