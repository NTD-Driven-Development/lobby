import { AggregateRoot, DomainEvent } from '../../../core'
import { UpdateGameInfoCommandSchema } from '../command'
import { GameInfoUpdated, GameRegistered } from '../events'

export type GameId = string

export class Game extends AggregateRoot<GameId> {
    constructor(
        public readonly id: GameId,
        public name: string,
        public description: string,
        public rule: string,
        public minPlayers: number,
        public maxPlayers: number,
        public imageUrl: string,
        public frontendUrl: string,
        public backendUrl: string,
        public status: GameStatus = GameStatus.OFFLINE,
        public createdAt: Date,
    ) {
        if (typeof id === 'object') {
            super(id)
        } else {
            super(id)
            this.apply(
                new GameRegistered({
                    id,
                    name,
                    description,
                    rule,
                    minPlayers,
                    maxPlayers,
                    imageUrl,
                    frontendUrl,
                    backendUrl,
                    status,
                }),
            )
        }
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
