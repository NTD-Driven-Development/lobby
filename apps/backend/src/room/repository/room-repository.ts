import { AbstractRepository, Game, PlayerId, Room, RoomId, RoomStatus } from '@packages/domain'

export interface RoomRepository extends AbstractRepository<Room, RoomId> {
    findNotClosed(): Promise<Room[]>
    findById(roomId: RoomId): Promise<Room>
    findByStatus(status: RoomStatus): Promise<Room[]>
    findWaitingPublicRoomsByGame(game: Game): Promise<Room[]>
    findPlayerInNotClosedRoom(playerId: PlayerId): Promise<Room | null>
    existsByHostId(hostId: PlayerId): Promise<boolean>
    hasPlayerJoinedRoom(playerId: PlayerId): Promise<boolean>
    save(room: Room): Promise<void>
    delete(room: Room): Promise<void>
}
