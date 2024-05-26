import { PlayerId } from '../entity'

export type PlayerJoinRoomCommandSchema = {
    playerId: PlayerId
    playerName: string
    password?: string | null
}
