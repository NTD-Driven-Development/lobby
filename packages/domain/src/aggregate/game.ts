export type GameId = string

export class Game {
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
        public createdAt: Date,
    ) {
        this.id = id
        this.name = name
        this.description = description
        this.rule = rule
        this.minPlayers = minPlayers
        this.maxPlayers = maxPlayers
        this.imageUrl = imageUrl
        this.frontendUrl = frontendUrl
        this.backendUrl = backendUrl
        this.createdAt = createdAt
    }
}
