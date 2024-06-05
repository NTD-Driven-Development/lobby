import {
    DomainEvent,
    GameInfoUpdated,
    GameRegistered,
    PlayerJoinedRoom,
    PlayerKicked,
    PlayerLeftRoom,
    PlayerReadinessChanged,
    RoomChangedHost,
    RoomClosed,
    RoomCreated,
    RoomEndedGame,
    RoomStartedGame,
    UserInfoUpdated,
    UserRegistered,
} from '@packages/domain'
import { EventBus } from '~/eventbus/eventbus'
import { Server } from '@packages/socket'
import { autoInjectable, inject } from 'tsyringe'
import { Socket } from 'socket.io'

@autoInjectable()
export class WebSocketEventBus implements EventBus {
    public constructor(
        @inject(Socket) private readonly toClient: Server,
        @inject('ServerSocket') private readonly server: Server,
    ) {}

    public broadcast(events: DomainEvent[]) {
        events.forEach((event) => {
            this.handle(event)
        })
    }

    private handle(event: DomainEvent) {
        switch (true) {
            case event instanceof RoomCreated:
                this.server.emit('room-created', event)
                this.toClient.join(event.data.roomId)
                break
            case event instanceof RoomClosed:
                this.server.emit('room-closed', event)
                break
            case event instanceof RoomChangedHost:
                this.server.in(event.data.roomId).emit('room-changed-host', event)
                break
            case event instanceof RoomEndedGame:
                this.server.in(event.data.roomId).emit('room-ended-game', event)
                break
            case event instanceof RoomStartedGame:
                this.server.in(event.data.roomId).emit('room-started-game', event)
                break
            case event instanceof PlayerJoinedRoom:
                this.toClient.join(event.data.roomId)
                this.server.in(event.data.roomId).emit('player-joined-room', event)
                break
            case event instanceof PlayerLeftRoom:
                this.server.in(event.data.roomId).emit('player-left-room', event)
                this.toClient.leave(event.data.roomId)
                break
            case event instanceof PlayerReadinessChanged:
                this.server.in(event.data.roomId).emit('player-readiness-changed', event)
                break
            case event instanceof GameInfoUpdated:
                this.server.emit('game-info-updated', event)
                break
            case event instanceof GameRegistered:
                this.server.emit('game-registered', event)
                break
            case event instanceof UserRegistered:
                this.toClient.emit('user-registered', event)
                break
            case event instanceof UserInfoUpdated:
                this.toClient.emit('user-info-updated', event)
                break
            case event instanceof PlayerKicked:
                this.server.in(event.data.roomId).emit('player-kicked', event)
                if (event.data.playerId === this.toClient.auth.user.id) {
                    this.toClient.leave(event.data.roomId)
                }
                break
        }
    }
}
