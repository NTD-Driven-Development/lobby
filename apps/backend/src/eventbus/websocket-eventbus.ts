import {
    DomainEvent,
    GameInfoUpdated,
    GameRegistered,
    PlayerJoinedRoom,
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
    private readonly socket: Server

    public constructor(@inject(Socket) socket: Server) {
        this.socket = socket
    }

    public broadcast(events: DomainEvent[]) {
        events.forEach((event) => {
            this.handle(event)
        })
    }

    private handle(event: DomainEvent) {
        switch (true) {
            case event instanceof RoomCreated:
                this.socket.broadcast.emit('room-created', event)
                this.socket.emit('room-created', event)
                this.socket.join(event.data.roomId)
                break
            case event instanceof RoomClosed:
                this.socket.broadcast.emit('room-closed', event)
                this.socket.emit('room-closed', event)
                break
            case event instanceof RoomChangedHost:
                this.socket.in(event.data.roomId).emit('room-changed-host', event)
                this.socket.emit('room-changed-host', event)
                break
            case event instanceof RoomEndedGame:
                this.socket.in(event.data.roomId).emit('room-ended-game', event)
                this.socket.emit('room-ended-game', event)
                break
            case event instanceof RoomStartedGame:
                this.socket.in(event.data.roomId).emit('room-started-game', event)
                this.socket.emit('room-started-game', event)
                break
            case event instanceof PlayerJoinedRoom:
                this.socket.in(event.data.roomId).emit('player-joined-room', event)
                this.socket.emit('player-joined-room', event)
                break
            case event instanceof PlayerLeftRoom:
                this.socket.in(event.data.roomId).emit('player-left-room', event)
                this.socket.emit('player-left-room', event)
                this.socket.leave(event.data.roomId)
                break
            case event instanceof PlayerReadinessChanged:
                this.socket.in(event.data.roomId).emit('player-readiness-changed', event)
                this.socket.emit('player-readiness-changed', event)
                break
            case event instanceof GameInfoUpdated:
                this.socket.broadcast.emit('game-info-updated', event)
                this.socket.emit('game-info-updated', event)
                break
            case event instanceof GameRegistered:
                this.socket.broadcast.emit('game-registered', event)
                this.socket.emit('game-registered', event)
                break
            case event instanceof UserRegistered:
                this.socket.emit('user-registered', event)
                break
            case event instanceof UserInfoUpdated:
                this.socket.emit('user-info-updated', event)
                break
        }
    }
}
