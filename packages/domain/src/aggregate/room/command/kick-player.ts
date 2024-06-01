import { PlayerId, RoomId } from '../entity'

export type KickPlayerCommandSchema = {
    hostId: PlayerId
    playerId: PlayerId
    roomId: RoomId
}
