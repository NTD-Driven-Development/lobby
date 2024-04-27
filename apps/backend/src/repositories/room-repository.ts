import { Game, PlayerId, Room, RoomId, RoomStatus } from '@packages/domain'

export interface RoomRepository {
    findById(roomId: RoomId): Room
    findByStatus(status: RoomStatus): Room[]
    findWaitingPublicRoomsByGame(game: Game): Room[]
    existsByHostId(hostId: PlayerId): boolean
    hasPlayerJoinedRoom(playerId: PlayerId): boolean
    createRoom(room: Room): Room
    closeRoom(room: Room): void
    leaveRoom(room: Room): void
    update(room: Room): Room
    deleteAll(): void
}
