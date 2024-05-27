import { Room, CreateRoomCommandSchema, UseCase } from '@packages/domain'
import { v4 } from 'node-uuid'
import { EventBus } from '~/eventbus/eventbus'
import { WebSocketEventBus } from '~/eventbus/websocket-eventbus'
import { autoInjectable, inject } from 'tsyringe'
import { RoomRepositoryImpl } from '../repository/room-repository-impl'
import { RoomRepository } from '../repository/room-repository'
import { UserRepository } from '~/user/repository/user-repository'
import { UserRepositoryImpl } from '~/user/repository/user-repository-impl'

export type CreateRoomInput = Omit<CreateRoomCommandSchema, 'players' | 'host'> & { email: string }

@autoInjectable()
export class CreateRoomUseCase implements UseCase<CreateRoomInput, void> {
    constructor(
        @inject(RoomRepositoryImpl)
        private roomRepository: RoomRepository,
        @inject(UserRepositoryImpl)
        private userRepository: UserRepository,
        @inject(WebSocketEventBus)
        private eventBus: EventBus,
    ) {}

    async execute(input: CreateRoomInput): Promise<void> {
        const room = new Room(v4())
        const user = await this.userRepository.findByEmail(input.email)
        const player = {
            id: user.id,
            name: user.name,
            isReady: true,
        }
        room.createRoom({
            ...input,
            host: player,
            players: [player],
        })
        await this.roomRepository.save(room)
        const events = room.getDomainEvents()
        this.eventBus.broadcast(events)
    }
}
