import { AbstractRepository, Game, PlayerId, Room, RoomId, RoomStatus } from '@packages/domain'

export interface RoomRepository extends AbstractRepository<Room, RoomId> {
    findById(roomId: RoomId): Promise<Room | null>
    findByStatus(status: RoomStatus): Promise<Room[]>
    findWaitingPublicRoomsByGame(game: Game): Promise<Room[]>
    existsByHostId(hostId: PlayerId): Promise<boolean>
    hasPlayerJoinedRoom(playerId: PlayerId): Promise<boolean>
    save(room: Room): Promise<void>
    delete(room: Room): Promise<void>
}
