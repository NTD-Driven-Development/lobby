import { UseCase, JoinRoomCommandSchema } from '@packages/domain'
import { EventBus, WebSocketEventBus } from '~/eventbus'
import { autoInjectable, inject } from 'tsyringe'
import { RoomRepository, RoomRepositoryImpl } from '~/room/repository'
import { UserRepository, UserRepositoryImpl } from '~/user/repository'

export type JoinRoomInput = Omit<JoinRoomCommandSchema, 'playerName' | 'playerId'> & { email: string; roomId: string }

@autoInjectable()
export class JoinRoomUseCase implements UseCase<JoinRoomInput, void> {
    constructor(
        @inject(RoomRepositoryImpl)
        private roomRepository: RoomRepository,
        @inject(UserRepositoryImpl)
        private userRepository: UserRepository,
        @inject(WebSocketEventBus)
        private eventBus: EventBus,
    ) {}

    async execute(input: JoinRoomInput): Promise<void> {
        const player = await this.userRepository.findByEmail(input.email)
        if (await this.roomRepository.hasPlayerJoinedRoom(player.id)) {
            throw new Error('Player has already joined a room')
        }
        const room = await this.roomRepository.findById(input.roomId)
        room.joinRoom({
            playerId: player.id,
            playerName: player.name,
            password: input.password,
        })
        await this.roomRepository.save(room)
        const events = room.getDomainEvents()
        this.eventBus.broadcast(events)
    }
}
