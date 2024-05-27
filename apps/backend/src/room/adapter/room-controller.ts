/* eslint-disable @typescript-eslint/no-unused-vars */
import { ChangeReadinessEventSchema, CreateRoomEventSchema, JoinRoomEventSchema, LeaveRoomEventSchema } from '@packages/domain'
import { autoInjectable, inject } from 'tsyringe'
import { Auth0User } from '~/middleware/socket-auth0'
import { CreateRoomUseCase } from '../usecases/create-room-usecase'
import { JoinRoomUseCase } from '../usecases/join-room-usecase'
import { ChangeReadinessUseCase } from '../usecases/change-readiness-usecase'
import { LeaveRoomUseCase } from '../usecases/leave-room-usecase'

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
        @inject(JoinRoomUseCase)
        private joinRoomUseCase: JoinRoomUseCase,
        @inject(ChangeReadinessUseCase)
        private changeReadinessUseCase: ChangeReadinessUseCase,
        @inject(LeaveRoomUseCase)
        private leaveRoomUseCase: LeaveRoomUseCase,
    ) {}
    public async createRoom(event: CreateRoomEventSchema, user: Readonly<Auth0User>) {
        await this.createRoomUseCase.execute({
            ...event.data,
            email: user.email,
        })
    }

    public async joinRoom(event: JoinRoomEventSchema, user: Readonly<Auth0User>) {
        await this.joinRoomUseCase.execute({
            ...event.data,
            email: user.email,
        })
    }

    public async changeReadiness(event: ChangeReadinessEventSchema, user: Readonly<Auth0User>) {
        await this.changeReadinessUseCase.execute({
            ...event.data,
            email: user.email,
        })
    }

    public async leaveRoom(event: LeaveRoomEventSchema, user: Readonly<Auth0User>) {
        await this.leaveRoomUseCase.execute({
            ...event.data,
            email: user.email,
        })
    }
}
