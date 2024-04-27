import { Game } from './game'

export type RoomId = string

export type PlayerId = string

export class Room {
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
    ) {
        this.id = id
        this.name = name
        this.game = game
        this.host = host
        this.players = players
        this.minPlayers = minPlayers
        this.maxPlayers = maxPlayers
        this.createdAt = createdAt
        this.status = status
        this.password = password
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

    joinRoom(player: Player) {
        if (this.isFull()) {
            throw new Error('The room is full')
        }
        this.addPlayer(player)
    }

    leaveRoom(playerId: PlayerId) {
        this.removePlayer(playerId)
        if (this.host.id === playerId) {
            this.changeHost(this.players[0]?.id)
        }
    }

    kickPlayer(hostId: PlayerId, playerId: PlayerId) {
        this.validateHost(hostId)
        const player = this.findPlayer(playerId)
        if (!player) {
            throw new Error('Player not found')
        }
        this.removePlayer(playerId)
    }

    findPlayer(playerId: PlayerId) {
        return this.players.find((player) => player.id === playerId)
    }

    validateHost(playerId: PlayerId) {
        if (this.host.id !== playerId) {
            throw new Error('Only the host can perform this action')
        }
    }

    changeHost(playerId: PlayerId) {
        this.host = this.players.find((player) => player.id === playerId) ?? this.host
    }

    changePlayerReadiness(playerId: PlayerId, isReady: boolean) {
        const player = this.players.find((player) => player.id === playerId)
        if (player) {
            isReady ? player.ready() : player.cancelReady()
        }
    }

    startGame() {
        if (this.status === RoomStatus.PLAYING) {
            throw new Error('The game has already started')
        }
        this.status = RoomStatus.PLAYING
    }

    endGame() {
        if (this.status === RoomStatus.WAITING) {
            throw new Error('The game has not started yet')
        }
        this.status = RoomStatus.WAITING
        this.cancelReadyExceptHost()
    }

    cancelReadyExceptHost() {
        this.players.forEach((player) => {
            if (player.id !== this.host.id) {
                player.cancelReady()
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

    ready() {
        this.isReady = true
    }

    cancelReady() {
        this.isReady = false
    }
}
