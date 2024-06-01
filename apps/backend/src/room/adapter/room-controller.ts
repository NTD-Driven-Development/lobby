/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    ChangeReadinessEventSchema,
    CreateRoomEventSchema,
    GetRoomEventSchema,
    GetRoomsEventSchema,
    JoinRoomEventSchema,
    KickPlayerEventSchema,
    LeaveRoomEventSchema,
} from '@packages/domain'
import { autoInjectable, inject } from 'tsyringe'
import { Auth0User } from '~/middlewares/socket-auth0'
import {
    CreateRoomUseCase,
    JoinRoomUseCase,
    ChangeReadinessUseCase,
    LeaveRoomUseCase,
    GetRoomUseCase,
    GetRoomsUseCase,
    KickPlayerUseCase,
} from '~/room/usecases'
import { Server } from '@packages/socket'
import { SocketThrow } from '~/decorators/socket-throw'
import { Socket } from 'socket.io'

// import { FastifyReply, FastifyRequest } from 'fastify'
// @autoInjectable()
// export class RoomController {
//     public async getRooms(request: FastifyRequest, reply: FastifyReply) {
//         return 'Hello World!'
//     }
// }

@autoInjectable()
export class RoomController {
    constructor(
        @inject(Socket)
        private socket: Server,
        @inject(CreateRoomUseCase)
        private createRoomUseCase: CreateRoomUseCase,
        @inject(JoinRoomUseCase)
        private joinRoomUseCase: JoinRoomUseCase,
        @inject(ChangeReadinessUseCase)
        private changeReadinessUseCase: ChangeReadinessUseCase,
        @inject(LeaveRoomUseCase)
        private leaveRoomUseCase: LeaveRoomUseCase,
        @inject(GetRoomUseCase)
        private getRoomUseCase: GetRoomUseCase,
        @inject(GetRoomsUseCase)
        private getRoomsUseCase: GetRoomsUseCase,
        @inject(KickPlayerUseCase)
        private kickPlayerUseCase: KickPlayerUseCase,
    ) {}

    @SocketThrow
    public async createRoom(event: CreateRoomEventSchema, user: Readonly<Auth0User>) {
        await this.createRoomUseCase.execute({
            ...event.data,
            email: user.email,
        })
    }

    @SocketThrow
    public async joinRoom(event: JoinRoomEventSchema, user: Readonly<Auth0User>) {
        await this.joinRoomUseCase.execute({
            ...event.data,
            email: user.email,
        })
    }

    @SocketThrow
    public async changeReadiness(event: ChangeReadinessEventSchema, user: Readonly<Auth0User>) {
        await this.changeReadinessUseCase.execute({
            ...event.data,
            email: user.email,
        })
    }

    @SocketThrow
    public async leaveRoom(event: LeaveRoomEventSchema, user: Readonly<Auth0User>) {
        await this.leaveRoomUseCase.execute({
            ...event.data,
            email: user.email,
        })
    }

    @SocketThrow
    public async getRoom(event: GetRoomEventSchema, user: Readonly<Auth0User>) {
        return await this.getRoomUseCase.execute({
            ...event.data,
        })
    }

    @SocketThrow
    public async getRooms(event: GetRoomsEventSchema, user: Readonly<Auth0User>) {
        return await this.getRoomsUseCase.execute({
            ...event.data,
        })
    }

    @SocketThrow
    public async kickPlayer(event: KickPlayerEventSchema, user: Readonly<Auth0User>) {
        return await this.kickPlayerUseCase.execute({
            ...event.data,
            email: user.email,
        })
    }
}
