import { PlayerId, RoomId } from '../entity'
import { DomainEvent } from '../../../core/entity'
import { KickPlayerCommandSchema } from '../command'
import { RoomEvent } from './room-event'

export type PlayerKickedSchema = {
    roomId: RoomId
    playerId: PlayerId
}

export class PlayerKicked extends DomainEvent implements RoomEvent {
    constructor(public readonly data: PlayerKickedSchema) {
        super('player-kicked', new Date())
    }
}

export type PlayerKickedEventSchema = PlayerKicked

export type KickPlayerEventSchema = {
    type: 'kick-player'
    data: Omit<KickPlayerCommandSchema, 'hostId'>
}
