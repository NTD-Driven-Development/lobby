import { PlayerId } from '@room/entity'

export type PlayerJoinRoomCommandSchema = {
    userId: PlayerId
    userName: string
}
