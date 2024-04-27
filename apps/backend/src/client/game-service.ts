import { Player } from '@packages/domain'

export type GamePlayer = Omit<Player, 'isReady' | 'ready' | 'cancelReady'>

export interface GameService {
    startGame(): Promise<StartGameResponse>
}

export class StartGameRequest {
    constructor(
        public readonly roomId: string,
        public readonly players: GamePlayer[],
    ) {
        this.roomId = roomId
        this.players = players
    }
}

export class StartGameResponse {
    constructor(public readonly url: string) {
        this.url = url
    }
}
