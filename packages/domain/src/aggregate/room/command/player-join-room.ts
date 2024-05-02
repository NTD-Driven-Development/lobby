import { PlayerId } from '../entity'

export type PlayerJoinRoomCommandSchema = {
    userId: PlayerId
    userName: string
}
