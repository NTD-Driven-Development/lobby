import { PlayerId, RoomId } from '../entity'
import { DomainEvent } from '../../../core/entity/domain-event'
import { ChangePlayerReadinessCommandSchema } from '../command'
import { RoomEvent } from './room-event'

export type PlayerReadinessChangedSchema = {
    roomId: RoomId
    userId: PlayerId
    isReady: boolean
}

export class PlayerReadinessChanged extends DomainEvent implements RoomEvent {
    constructor(public readonly data: PlayerReadinessChangedSchema) {
        super('player-readiness-changed', new Date())
    }
}

export type PlayerReadinessChangedEventSchema = PlayerReadinessChanged

export type ChangePlayerReadinessEventSchema = {
    type: 'change-player-readiness'
    data: ChangePlayerReadinessCommandSchema
}
