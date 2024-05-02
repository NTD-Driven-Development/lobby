import { PlayerId, RoomId } from '@room/entity'
import { DomainEvent } from '~/core/entity/domain-event'
import { ChangePlayerReadinessCommandSchema } from '@room/command'

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

export type PlayerReadinessChangedEventSchema = PlayerReadinessChanged

export type ChangePlayerReadinessEventSchema = {
    type: 'change-player-readiness'
    data: ChangePlayerReadinessCommandSchema
}
