import { KickPlayerCommandSchema, UseCase } from '@packages/domain'
import { EventBus, WebSocketEventBus } from '~/eventbus'
import { autoInjectable, inject } from 'tsyringe'
import { RoomRepository, RoomRepositoryImpl } from '~/room/repository'
import { UserRepository, UserRepositoryImpl } from '~/user/repository'

export type KickPlayerInput = Omit<KickPlayerCommandSchema, 'hostId'> & { email: string }

@autoInjectable()
export class KickPlayerUseCase implements UseCase<KickPlayerInput, void> {
    constructor(
        @inject(RoomRepositoryImpl)
        private roomRepository: RoomRepository,
        @inject(UserRepositoryImpl)
        private userRepository: UserRepository,
        @inject(WebSocketEventBus)
        private eventBus: EventBus,
    ) {}

    async execute(input: KickPlayerInput): Promise<void> {
        const room = await this.roomRepository.findById(input.roomId)
        const host = await this.userRepository.findByEmail(input.email)
        const player = await this.userRepository.findById(input.playerId)
        room.kickPlayer({
            hostId: host.id,
            playerId: player.id,
            roomId: room.id,
        })
        await this.roomRepository.save(room)
        const events = room.getDomainEvents()
        this.eventBus.broadcast(events)
    }
}
