export * from './events'

import { AggregateRoot, DomainEvent } from '../../core'
import { Game } from '../game'
import {
    PlayerJoinedRoom,
    PlayerLeavedRoom,
    PlayerReadinessChanged,
    RoomClosed,
    RoomCreated,
    RoomEndedGame,
    RoomStartedGame,
    RoomChangedHost,
} from './events'

export type RoomId = string

export type PlayerId = string

export class Room extends AggregateRoot<RoomId> {
    constructor(
        public readonly id: RoomId,
        public name: string,
        public game: Game,
        public host: Player,
        public players: Player[],
        public minPlayers: number,
        public maxPlayers: number,
        public createdAt: Date,
        public status: RoomStatus = RoomStatus.WAITING,
        public password: string | null = null,
        public isClosed: boolean = false,
        public gameUrl: string | null = null,
    ) {
        if (typeof id === 'object') {
            super(id)
        } else {
            super(id)
            this.apply(new RoomCreated({ id, name, game, host, currentPlayers: players, minPlayers, maxPlayers, password }))
        }
    }

    protected when(event: DomainEvent): void {
        switch (true) {
            case event instanceof RoomCreated:
                this.name = event.data.name
                this.game = event.data.game
                this.host = event.data.host
                this.players = event.data.currentPlayers
                this.minPlayers = event.data.minPlayers
                this.maxPlayers = event.data.maxPlayers
                this.password = event.data.password
                this.createdAt = event.getOccurredOn()
                this.status = RoomStatus.WAITING
                break
            case event instanceof RoomClosed:
                this.isClosed = true
                break
            case event instanceof RoomStartedGame:
                this.status = RoomStatus.PLAYING
                this.gameUrl = event.data.gameUrl
                break
            case event instanceof RoomEndedGame:
                this.status = RoomStatus.WAITING
                this.gameUrl = null
                this.cancelReadyExceptHost()
                break
            case event instanceof RoomChangedHost:
                this.host = this.findPlayer(event.data.playerId) ?? this.host
                break
            case event instanceof PlayerJoinedRoom:
                this.addPlayer(event.data.user)
                break
            case event instanceof PlayerLeavedRoom:
                this.removePlayer(event.data.userId)
                break
            case event instanceof PlayerReadinessChanged:
                this.players.forEach((player) => {
                    if (player.id === event.data.userId) {
                        player.isReady = event.data.isReady
                    }
                })
                break
            default:
                throw new Error('Invalid room event')
        }
    }

    isFull() {
        return this.players.length >= this.maxPlayers
    }

    isEmpty() {
        return this.players.length === 0
    }

    isHost(playerId: PlayerId) {
        return this.host.id === playerId
    }

    isLocked() {
        return this.password !== null
    }

    private addPlayer(player: Player) {
        this.players.push(player)
    }

    private removePlayer(playerId: PlayerId) {
        this.players = this.players.filter((player) => player.id !== playerId)
    }

    public joinRoom(player: Player) {
        if (this.isFull()) {
            throw new Error('The room is full')
        }
        this.apply(new PlayerJoinedRoom({ roomId: this.id, user: player }))
    }

    public leaveRoom(playerId: PlayerId) {
        const player = this.findPlayer(playerId)
        if (!player) {
            throw new Error('Player not found')
        }
        this.apply(new PlayerLeavedRoom({ roomId: this.id, userId: playerId }))
        if (this.host.id === playerId) {
            this.apply(new RoomChangedHost({ id: this.id, playerId: this.players[0]?.id }))
        }
    }

    public kickPlayer(hostId: PlayerId, playerId: PlayerId) {
        this.validateHost(hostId)
        const player = this.findPlayer(playerId)
        if (!player) {
            throw new Error('Player not found')
        }
        this.apply(new PlayerLeavedRoom({ roomId: this.id, userId: playerId }))
    }

    public findPlayer(playerId: PlayerId) {
        return this.players.find((player) => player.id === playerId)
    }

    private validateHost(playerId: PlayerId) {
        if (this.host.id !== playerId) {
            throw new Error('Only the host can perform this action')
        }
    }

    public changePlayerReadiness(playerId: PlayerId, isReady: boolean) {
        const player = this.players.find((player) => player.id === playerId)
        if (!player) {
            throw new Error('Player not found')
        }
        this.apply(new PlayerReadinessChanged({ roomId: this.id, userId: playerId, isReady }))
    }

    public startGame(url: string) {
        if (this.status === RoomStatus.PLAYING) {
            throw new Error('The game has already started')
        }
        this.apply(new RoomStartedGame({ id: this.id, gameUrl: url }))
    }

    public endGame() {
        if (this.status === RoomStatus.WAITING) {
            throw new Error('The game has not started yet')
        }
        this.apply(new RoomEndedGame({ id: this.id }))
    }

    private cancelReadyExceptHost() {
        this.players.forEach((player) => {
            if (player.id !== this.host.id) {
                this.apply(new PlayerReadinessChanged({ roomId: this.id, userId: player.id, isReady: false }))
            }
        })
    }
}

export enum RoomStatus {
    WAITING = 'WAITING',
    PLAYING = 'PLAYING',
}

export class Player {
    constructor(
        public readonly id: PlayerId,
        public readonly name: string,
        public isReady: boolean = false,
    ) {
        this.id = id
        this.name = name
    }
}
