import { PlayerId } from '../entity'

export type ChangePlayerReadinessCommandSchema = {
    playerId: PlayerId
    isReady: boolean
}
