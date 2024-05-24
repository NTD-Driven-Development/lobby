import { Room, CreateRoomCommandSchema, UseCase } from '@packages/domain'
import { v4 } from 'node-uuid'
import { EventBus } from '~/eventbus/eventbus'
import { WebSocketEventBus } from '~/eventbus/websocket-eventbus'
import { autoInjectable, inject } from 'tsyringe'
import { RoomRepositoryImpl } from '../repository/room-repository-impl'
import { RoomRepository } from '../repository/room-repository'

export type CreateRoomInput = CreateRoomCommandSchema

@autoInjectable()
export class CreateRoomUseCase implements UseCase<CreateRoomInput, void> {
    constructor(
        @inject(RoomRepositoryImpl)
        private roomRepository: RoomRepository,
        @inject(WebSocketEventBus)
        private eventBus: EventBus,
    ) {
        this.roomRepository = roomRepository
        this.eventBus = eventBus
    }

    async execute(input: CreateRoomInput): Promise<void> {
        const room = new Room(v4())
        room.createRoom(input)
        await this.roomRepository.save(room)
        const events = room.getDomainEvents()
        this.eventBus.broadcast(events)
    }
}
