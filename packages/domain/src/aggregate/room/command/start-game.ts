import { PlayerId } from '../entity'

export type StartGameCommandSchema = {
    gameUrl: string
    playerId: PlayerId
}
