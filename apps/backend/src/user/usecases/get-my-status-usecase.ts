import { UseCase } from '@packages/domain'
import { EventBus } from '~/eventbus/eventbus'
import { WebSocketEventBus } from '~/eventbus/websocket-eventbus'
import { autoInjectable, inject } from 'tsyringe'
import { UserRepository } from '~/user/repository/user-repository'
import { UserRepositoryImpl } from '~/user/repository/user-repository-impl'
import { RoomRepositoryImpl } from '~/room/repository/room-repository-impl'
import { RoomRepository } from '~/room/repository/room-repository'

export type GetMyStatusInput = { email: string }

export type GetMyStatusOutput = {
    roomId: string | null
}

@autoInjectable()
export class GetMyStatusUseCase implements UseCase<GetMyStatusInput, GetMyStatusOutput> {
    constructor(
        @inject(UserRepositoryImpl)
        private userRepository: UserRepository,
        @inject(RoomRepositoryImpl)
        private roomRepository: RoomRepository,
        @inject(WebSocketEventBus)
        private eventBus: EventBus,
    ) {
        this.userRepository = userRepository
        this.eventBus = eventBus
    }

    async execute(input: GetMyStatusInput): Promise<GetMyStatusOutput> {
        const user = await this.userRepository.findByEmail(input.email)
        const room = await this.roomRepository.findPlayerInNotClosedRoom(user.id)
        return { roomId: room?.id ?? null }
    }
}
