import { injectable } from 'tsyringe'
import { RoomRepository } from '~/room/repository/room-repository'
import { Repository } from 'typeorm'
import { RoomData } from '~/data/entity'
import { AppDataSource } from '~/data/data-source'
import { Room, RoomStatus, Game, Player } from '@packages/domain'

@injectable()
export class RoomRepositoryImpl implements RoomRepository {
    private repo: Repository<RoomData> = AppDataSource.getRepository(RoomData)

    public async findNotClosed(): Promise<Room[]> {
        const result = await this.repo.find({
            where: { isClosed: false },
        })
        if (result.length === 0) {
            return []
        }
        return result.map(toDomain)
    }
    /**
     *
     * @param roomId
     * @returns
     * @throws {EntityNotFoundError} if the room is not found
     */
    public async findById(roomId: string): Promise<Room> {
        return toDomain(
            await this.repo
                .findOneOrFail({
                    where: { id: roomId },
                })
                .catch((e) => {
                    if (e.name === 'EntityNotFoundError') {
                        throw new Error('Room not found')
                    }
                    throw e
                }),
        )
    }
    findByStatus(status: RoomStatus): Promise<Room[]> {
        throw new Error('Method not implemented.')
    }
    findWaitingPublicRoomsByGame(game: Game): Promise<Room[]> {
        throw new Error('Method not implemented.')
    }
    existsByHostId(hostId: string): Promise<boolean> {
        throw new Error('Method not implemented.')
    }
    public async hasPlayerJoinedRoom(playerId: string): Promise<boolean> {
        const count = await this.repo.query(`
            SELECT COUNT(*) as cnt 
            FROM room WHERE "players" @> '[{"id": "${playerId}"}]' and "isClosed" = false
        `)
        return count[0]['cnt'] > 0
    }
    public async save(aggregate: Room): Promise<void> {
        await this.repo.save(toData(aggregate))
    }
    delete(room: Room): Promise<void> {
        throw new Error('Method not implemented.')
    }
    public async findPlayerInNotClosedRoom(playerId: string): Promise<Room | null> {
        const result = await this.repo.query(`
            SELECT * FROM room
            WHERE "players" @> '[{"id":"${playerId}"}]' and "isClosed" = false
        `)
        if (!result[0]) {
            return null
        }
        return toDomain(result[0])
    }
}

function toData(aggregate: Room) {
    const data = new RoomData()
    data.id = aggregate.id
    data.name = aggregate.name as string
    data.game = aggregate.game
    data.host = aggregate.host
    data.players = aggregate.players
    data.minPlayers = aggregate.minPlayers as number
    data.maxPlayers = aggregate.maxPlayers as number
    data.createdAt = new Date()
    data.status = aggregate.status
    data.password = aggregate.password as string
    data.isClosed = aggregate.isClosed as boolean
    data.gameUrl = aggregate.gameUrl
    return data
}

function toDomain(data: RoomData) {
    return new Room(
        data.id,
        data.name,
        data.game,
        data.host as Player,
        data.players as Player[],
        data.minPlayers,
        data.maxPlayers,
        data.createdAt,
        data.status as RoomStatus,
        data.password,
        data.isClosed,
        data.gameUrl,
    )
}
