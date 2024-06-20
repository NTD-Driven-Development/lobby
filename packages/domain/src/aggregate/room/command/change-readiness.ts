import { PlayerId } from '../entity'

export type ChangeReadinessCommandSchema = {
    playerId: PlayerId
    isReady: boolean
}
