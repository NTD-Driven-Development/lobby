import { AggregateRoot, DomainEvent } from '../../../core'
import {
    PlayerJoinedRoom,
    PlayerLeftRoom,
    PlayerReadinessChanged,
    RoomClosed,
    RoomCreated,
    RoomEndedGame,
    RoomStartedGame,
    RoomChangedHost,
} from '../events'
import {
    PlayerJoinRoomCommandSchema,
    PlayerLeaveRoomCommandSchema,
    ChangePlayerReadinessCommandSchema,
    ChangeHostCommandSchema,
    CloseRoomCommandSchema,
    StartGameCommandSchema,
} from '../command'

export type RoomId = string

export type PlayerId = string

export class Room extends AggregateRoot<RoomId> {
    constructor(
        public readonly id: RoomId,
        public name: string,
        public game: {
            id: string
            name: string
        },
        public host: Player,
        public players: Player[],
        public minPlayers: number,
        public maxPlayers: number,
        public createdAt: Date = new Date(),
        public status: RoomStatus = RoomStatus.WAITING,
        public password: string | null = null,
        public isClosed: boolean = false,
        public gameUrl: string | null = null,
    ) {
        if (typeof id === 'object') {
            super(id)
        } else {
            super(id)
            this.apply(
                new RoomCreated({
                    id,
                    name,
                    game,
                    host,
                    currentPlayers: players,
                    minPlayers,
                    maxPlayers,
                    password,
                    status,
                    isClosed,
                    gameUrl,
                    createdAt,
                }),
            )
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
                this.status = event.data.status
                this.isClosed = event.data.isClosed
                this.gameUrl = event.data.gameUrl
                this.createdAt = event.data.createdAt
                break
            case event instanceof RoomClosed:
                this.isClosed = event.data.isClosed
                break
            case event instanceof RoomStartedGame:
                this.status = event.data.status
                this.gameUrl = event.data.gameUrl
                break
            case event instanceof RoomEndedGame:
                this.status = event.data.status
                this.gameUrl = event.data.gameUrl
                this.cancelReadyExceptHost()
                break
            case event instanceof RoomChangedHost:
                this.host = this.findPlayer(event.data.host) ?? this.host
                break
            case event instanceof PlayerJoinedRoom:
                this.addPlayer(event.data.user)
                break
            case event instanceof PlayerLeftRoom:
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

    public changeHost(payload: ChangeHostCommandSchema) {
        this.validateHost(payload.playerId)
        this.apply(new RoomChangedHost({ id: this.id, host: payload.playerId }))
    }

    public closeRoom(payload: CloseRoomCommandSchema) {
        this.validateHost(payload.playerId)
        this.apply(new RoomClosed({ id: this.id, isClosed: true }))
    }

    public joinRoom(player: PlayerJoinRoomCommandSchema) {
        if (this.isFull()) {
            throw new Error('The room is full')
        }
        this.apply(
            new PlayerJoinedRoom({
                roomId: this.id,
                user: {
                    id: player.userId,
                    name: player.userName,
                    isReady: false,
                },
            }),
        )
    }

    public leaveRoom(payload: PlayerLeaveRoomCommandSchema) {
        const player = this.findPlayer(payload.playerId)
        if (!player) {
            throw new Error('Player not found')
        }
        this.apply(new PlayerLeftRoom({ roomId: this.id, userId: player.id }))
        if (this.host.id === player.id) {
            this.apply(new RoomChangedHost({ id: this.id, host: this.players[0]?.id }))
        }
        if (this.players.length === 0) {
            this.apply(new RoomClosed({ id: this.id, isClosed: true }))
        }
    }

    public kickPlayer(hostId: PlayerId, playerId: PlayerId) {
        this.validateHost(hostId)
        const player = this.findPlayer(playerId)
        if (!player) {
            throw new Error('Player not found')
        }
        this.apply(new PlayerLeftRoom({ roomId: this.id, userId: playerId }))
    }

    public findPlayer(playerId: PlayerId) {
        return this.players.find((player) => player.id === playerId)
    }

    private validateHost(playerId: PlayerId) {
        if (this.host.id !== playerId) {
            throw new Error('Only the host can perform this action')
        }
    }

    public changePlayerReadiness(payload: ChangePlayerReadinessCommandSchema) {
        const player = this.players.find((player) => player.id === payload.playerId)
        if (!player) {
            throw new Error('Player not found')
        }
        this.apply(
            new PlayerReadinessChanged({
                roomId: this.id,
                userId: player.id,
                isReady: payload.isReady,
            }),
        )
    }

    public startGame(payload: StartGameCommandSchema) {
        if (this.status === RoomStatus.PLAYING) {
            throw new Error('The game has already started')
        }
        this.apply(
            new RoomStartedGame({
                id: this.id,
                gameUrl: payload.gameUrl,
                status: RoomStatus.PLAYING,
            }),
        )
    }

    public endGame() {
        if (this.status === RoomStatus.WAITING) {
            throw new Error('The game has not started yet')
        }
        this.apply(new RoomEndedGame({ id: this.id, status: RoomStatus.WAITING, gameUrl: null }))
    }

    private cancelReadyExceptHost() {
        this.players.forEach((player) => {
            if (player.id !== this.host.id) {
                this.apply(
                    new PlayerReadinessChanged({
                        roomId: this.id,
                        userId: player.id,
                        isReady: false,
                    }),
                )
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
