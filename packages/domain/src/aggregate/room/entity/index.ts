/* eslint-disable @typescript-eslint/no-explicit-any */
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
    PlayerKicked,
} from '../events'
import {
    JoinRoomCommandSchema,
    LeaveRoomCommandSchema,
    ChangeReadinessCommandSchema,
    ChangeHostCommandSchema,
    CloseRoomCommandSchema,
    StartGameCommandSchema,
    CreateRoomCommandSchema,
    KickPlayerCommandSchema,
} from '../command'
import { Game } from '../../game'

export type RoomId = string

export type PlayerId = string

export type RoomGameSchema = Required<Pick<Game, 'id' | 'name' | 'minPlayers' | 'maxPlayers'>>

export class Room extends AggregateRoot<RoomId> {
    constructor(
        id: RoomId,
        name?: string,
        game?: RoomGameSchema,
        host?: Player,
        players?: Player[],
        minPlayers?: number,
        maxPlayers?: number,
        createdAt?: Date,
        status?: RoomStatus,
        password?: string | null,
        isClosed?: boolean,
        gameUrl?: string | null,
    )
    constructor(domainEvents: DomainEvent[])
    constructor(
        public readonly id: any,
        public name: string = '',
        public game: RoomGameSchema = undefined as any,
        public host: Player = undefined as any,
        public players: Player[] = [],
        public minPlayers: number = 0,
        public maxPlayers: number = 0,
        public createdAt: Date = new Date(),
        public status: RoomStatus = RoomStatus.WAITING,
        public password: string | null = null,
        public isClosed: boolean = false,
        public gameUrl: string | null = null,
    ) {
        super(id)
    }

    public createRoom(payload: CreateRoomCommandSchema) {
        if (
            payload.minPlayers < payload.game.minPlayers ||
            payload.maxPlayers > payload.game.maxPlayers
        ) {
            throw new Error('Invalid number of players')
        }
        this.apply(
            new RoomCreated({
                roomId: this.id,
                name: payload.name,
                game: payload.game,
                host: payload.host,
                currentPlayers: [payload.host],
                minPlayers: payload.minPlayers,
                maxPlayers: payload.maxPlayers,
                password: payload.password,
                status: RoomStatus.WAITING,
                isClosed: false,
                gameUrl: null,
                createdAt: new Date(),
            }),
        )
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
                this.host.isReady = true
                this.players = this.players.map((player) => {
                    if (player.id === event.data.host) {
                        return { ...player, isReady: true }
                    }
                    return player
                })
                break
            case event instanceof PlayerJoinedRoom:
                this.addPlayer(event.data.player)
                break
            case event instanceof PlayerLeftRoom:
                this.removePlayer(event.data.playerId)
                break
            case event instanceof PlayerKicked:
                this.removePlayer(event.data.playerId)
                break
            case event instanceof PlayerReadinessChanged:
                this.players.forEach((player) => {
                    if (player.id === event.data.playerId) {
                        player.isReady = event.data.isReady
                    }
                })
                break
            default:
                throw new Error('Invalid room event')
        }
    }

    public changeHost(payload: ChangeHostCommandSchema) {
        this.validateHost(payload.playerId)
        this.apply(new RoomChangedHost({ roomId: this.id, host: payload.playerId }))
    }

    public closeRoom(payload: CloseRoomCommandSchema) {
        this.validateHost(payload.playerId)
        this.apply(new RoomClosed({ roomId: this.id, isClosed: true }))
    }

    public joinRoom(payload: JoinRoomCommandSchema) {
        if (this.isFull()) {
            throw new Error('The room is full')
        }
        if (this.isLocked() && payload.password !== this.password) {
            throw new Error('Invalid password')
        }
        this.apply(
            new PlayerJoinedRoom({
                roomId: this.id,
                player: {
                    id: payload.playerId,
                    name: payload.playerName,
                    isReady: false,
                    status: PlayerStatus.CONNECTED,
                },
            }),
        )
    }

    public leaveRoom(payload: LeaveRoomCommandSchema) {
        const player = this.findPlayer(payload.playerId)
        if (!player) {
            throw new Error('Player not found')
        }
        this.apply(new PlayerLeftRoom({ roomId: this.id, playerId: player.id }))
        if (this.host.id === player.id) {
            this.apply(new RoomChangedHost({ roomId: this.id, host: this.players[0]?.id }))
        }
        if (this.players.length === 0) {
            this.apply(new RoomClosed({ roomId: this.id, isClosed: true }))
        }
    }

    public kickPlayer(payload: KickPlayerCommandSchema) {
        this.validateHost(payload.hostId)
        const player = this.findPlayer(payload.playerId)
        if (!player) {
            throw new Error('Player not found')
        }
        this.apply(new PlayerKicked({ roomId: this.id, playerId: payload.playerId }))
    }

    public findPlayer(playerId: PlayerId) {
        return this.players.find((player) => player.id === playerId)
    }

    private validateHost(playerId: PlayerId) {
        if (this.host.id !== playerId) {
            throw new Error('Only the host can perform this action')
        }
    }

    public changePlayerReadiness(payload: ChangeReadinessCommandSchema) {
        const player = this.players.find((player) => player.id === payload.playerId)
        if (!player) {
            throw new Error('Player not found')
        }
        this.apply(
            new PlayerReadinessChanged({
                roomId: this.id,
                playerId: player.id,
                isReady: payload.isReady,
            }),
        )
    }

    public startGame(payload: StartGameCommandSchema) {
        this.validateHost(payload.playerId)
        if (this.isStarted()) {
            throw new Error('The game has already started')
        }
        this.apply(
            new RoomStartedGame({
                roomId: this.id,
                gameUrl: payload.gameUrl,
                status: RoomStatus.PLAYING,
            }),
        )
    }

    public endGame() {
        if (this.status === RoomStatus.WAITING) {
            throw new Error('The game has not started yet')
        }
        this.apply(
            new RoomEndedGame({ roomId: this.id, status: RoomStatus.WAITING, gameUrl: null }),
        )
    }

    private cancelReadyExceptHost() {
        this.players.forEach((player) => {
            if (player.id !== this.host.id) {
                this.apply(
                    new PlayerReadinessChanged({
                        roomId: this.id,
                        playerId: player.id,
                        isReady: false,
                    }),
                )
            }
        })
    }

    private addPlayer(player: Player) {
        this.players.push(player)
    }

    private removePlayer(playerId: PlayerId) {
        this.players = this.players.filter((player) => player.id !== playerId)
    }

    isStarted() {
        return this.status === RoomStatus.PLAYING
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
        return this.password !== null && this.password !== ''
    }
}

export enum RoomStatus {
    WAITING = 'WAITING',
    PLAYING = 'PLAYING',
}

export enum PlayerStatus {
    CONNECTED = 'CONNECTED',
    DISCONNECTED = 'DISCONNECTED',
}

export type Player = {
    id: Readonly<PlayerId>
    name: Readonly<string>
    isReady: boolean
    status: PlayerStatus
}
