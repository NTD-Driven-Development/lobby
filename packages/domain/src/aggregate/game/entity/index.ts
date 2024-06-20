/* eslint-disable @typescript-eslint/no-explicit-any */
import { AggregateRoot, DomainEvent } from '../../../core'
import { RegisterGameCommandSchema, UpdateGameInfoCommandSchema } from '../command'
import { GameInfoUpdated, GameRegistered } from '../events'

export type GameId = string

export class Game extends AggregateRoot<GameId> {
    constructor(
        id: GameId,
        name: string,
        description: string,
        rule: string,
        minPlayers: number,
        maxPlayers: number,
        imageUrl: string | null,
        frontendUrl: string,
        backendUrl: string,
        version?: number,
        status?: GameStatus,
        createdAt?: Date,
    )
    constructor(domainEvents: DomainEvent[])
    constructor(
        public readonly id: any,
        public name: string = undefined as any,
        public description: string = undefined as any,
        public rule: string = undefined as any,
        public minPlayers: number = undefined as any,
        public maxPlayers: number = undefined as any,
        public imageUrl: string | null = undefined as any,
        public frontendUrl: string = undefined as any,
        public backendUrl: string = undefined as any,
        protected version: number = 1,
        public status: GameStatus = GameStatus.OFFLINE,
        public createdAt: Date = new Date(),
    ) {
        super(id)
    }

    public register(data: RegisterGameCommandSchema): void {
        this.apply(
            new GameRegistered({
                id: this.id,
                name: data.name,
                description: data.description,
                rule: data.rule,
                minPlayers: data.minPlayers,
                maxPlayers: data.maxPlayers,
                imageUrl: data.imageUrl,
                frontendUrl: data.frontendUrl,
                backendUrl: data.backendUrl,
                status: GameStatus.OFFLINE,
            }),
        )
    }

    public updateInfo(data: UpdateGameInfoCommandSchema): void {
        this.apply(new GameInfoUpdated({ ...data, status: GameStatus.OFFLINE, id: this.id }))
    }

    public changeStatus(status: GameStatus): void {
        this.apply(new GameInfoUpdated({ id: this.id, status }))
    }

    protected when(event: DomainEvent): void {
        switch (true) {
            case event instanceof GameRegistered:
                this.name = event.data.name
                this.description = event.data.description
                this.rule = event.data.rule
                this.minPlayers = event.data.minPlayers
                this.maxPlayers = event.data.maxPlayers
                this.imageUrl = event.data.imageUrl
                this.frontendUrl = event.data.frontendUrl
                this.backendUrl = event.data.backendUrl
                this.status = event.data.status
                this.createdAt = event.getOccurredOn()
                break
            case event instanceof GameInfoUpdated:
                this.name = event.data.name ?? this.name
                this.description = event.data.description ?? this.description
                this.rule = event.data.rule ?? this.rule
                this.minPlayers = event.data.minPlayers ?? this.minPlayers
                this.maxPlayers = event.data.maxPlayers ?? this.maxPlayers
                this.imageUrl = event.data.imageUrl ?? this.imageUrl
                this.frontendUrl = event.data.frontendUrl ?? this.frontendUrl
                this.backendUrl = event.data.backendUrl ?? this.backendUrl
                this.status = event.data.status ?? this.status
                break
            default:
                throw new Error('Invalid game event')
        }
    }
}

export enum GameStatus {
    ONLINE = 'ONLINE',
    OFFLINE = 'OFFLINE',
}
