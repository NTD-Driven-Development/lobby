import { PlayerId } from '@room/entity'

export type ChangePlayerReadinessCommandSchema = {
    playerId: PlayerId
    isReady: boolean
}
