import { RoomId } from '../entity'

export interface RoomEvent {
    data: Required<{ roomId: RoomId }>
}
