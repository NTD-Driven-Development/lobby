import { UseCase, LeaveRoomCommandSchema } from '@packages/domain'
import { EventBus, WebSocketEventBus } from '~/eventbus'
import { autoInjectable, inject } from 'tsyringe'
import { RoomRepository, RoomRepositoryImpl } from '~/room/repository'
import { UserRepository, UserRepositoryImpl } from '~/user/repository'

export type LeaveRoomInput = Omit<LeaveRoomCommandSchema, 'playerId'> & { email: string; roomId: string }

@autoInjectable()
export class LeaveRoomUseCase implements UseCase<LeaveRoomInput, void> {
    constructor(
        @inject(RoomRepositoryImpl)
        private roomRepository: RoomRepository,
        @inject(UserRepositoryImpl)
        private userRepository: UserRepository,
        @inject(WebSocketEventBus)
        private eventBus: EventBus,
    ) {}

    async execute(input: LeaveRoomInput): Promise<void> {
        const room = await this.roomRepository.findById(input.roomId)
        const player = await this.userRepository.findByEmail(input.email)
        room.leaveRoom({ playerId: player.id })
        await this.roomRepository.save(room)
        const events = room.getDomainEvents()
        this.eventBus.broadcast(events)
    }
}
