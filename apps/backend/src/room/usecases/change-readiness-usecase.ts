import { UseCase, ChangeReadinessCommandSchema } from '@packages/domain'
import { EventBus, WebSocketEventBus } from '~/eventbus'
import { autoInjectable, inject } from 'tsyringe'
import { RoomRepository, RoomRepositoryImpl } from '~/room/repository'
import { UserRepository, UserRepositoryImpl } from '~/user/repository'

export type ChangeReadinessInput = Omit<ChangeReadinessCommandSchema, 'playerId'> & { email: string; roomId: string }

@autoInjectable()
export class ChangeReadinessUseCase implements UseCase<ChangeReadinessInput, void> {
    constructor(
        @inject(RoomRepositoryImpl)
        private roomRepository: RoomRepository,
        @inject(UserRepositoryImpl)
        private userRepository: UserRepository,
        @inject(WebSocketEventBus)
        private eventBus: EventBus,
    ) {}

    async execute(input: ChangeReadinessInput): Promise<void> {
        const room = await this.roomRepository.findById(input.roomId)
        const player = await this.userRepository.findByEmail(input.email)
        room.changePlayerReadiness({
            playerId: player.id,
            isReady: input.isReady,
        })
        await this.roomRepository.save(room)
        const events = room.getDomainEvents()
        this.eventBus.broadcast(events)
    }
}
