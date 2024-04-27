import { Player, RoomId } from '../aggregate'
import { DomainEvent } from './domain-event'

export type PlayerReadinessChangeSchema = {
    roomId: RoomId
    user: Player
}

export class PlayerReadinessChanged extends DomainEvent<PlayerReadinessChangeSchema> {
    constructor(public readonly data: PlayerReadinessChangeSchema) {
        super('player-readiness-changed', data)
    }
}
