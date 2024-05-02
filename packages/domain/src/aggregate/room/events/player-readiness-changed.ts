import { PlayerId, RoomId } from '../..'
import { DomainEvent } from '../../../core/entity'

export type PlayerReadinessChangedSchema = {
    roomId: RoomId
    userId: PlayerId
    isReady: boolean
}

export class PlayerReadinessChanged extends DomainEvent {
    constructor(public readonly data: PlayerReadinessChangedSchema) {
        super('player-readiness-changed', new Date())
    }
}
