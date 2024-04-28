import { PlayerId, RoomId } from '../..'
import { DomainEvent } from '../../../core/entity'

export type PlayerReadinessChangeSchema = {
    roomId: RoomId
    userId: PlayerId
    isReady: boolean
}

export class PlayerReadinessChanged extends DomainEvent {
    constructor(public readonly data: PlayerReadinessChangeSchema) {
        super('player-readiness-changed', new Date())
    }
}
