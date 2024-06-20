import { RoomStatus } from '../entity'

export type GetRoomsQuerySchema = {
    status?: RoomStatus
    gameId?: string
    search?: string
}
