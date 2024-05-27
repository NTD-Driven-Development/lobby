import { PlayerId } from '../entity'

export type JoinRoomCommandSchema = {
    playerId: PlayerId
    playerName: string
    password?: string | null
}
