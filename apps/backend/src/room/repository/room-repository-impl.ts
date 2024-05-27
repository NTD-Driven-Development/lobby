import { injectable } from 'tsyringe'
import { RoomRepository } from './room-repository'
import { Repository } from 'typeorm'
import { RoomData } from '~/data/entity'
import { AppDataSource } from '~/data/data-source'
import { Room, RoomStatus, Game } from '@packages/domain'

@injectable()
export class RoomRepositoryImpl implements RoomRepository {
    private repo: Repository<RoomData> = AppDataSource.getRepository(RoomData)

    public async findById(roomId: string): Promise<Room> {
        return toDomain(
            await this.repo.findOneOrFail({
                where: { id: roomId },
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
    hasPlayerJoinedRoom(playerId: string): Promise<boolean> {
        throw new Error('Method not implemented.')
    }
    public async save(aggregate: Room): Promise<void> {
        await this.repo.save(toData(aggregate))
    }
    delete(room: Room): Promise<void> {
        throw new Error('Method not implemented.')
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
        data.host,
        data.players,
        data.minPlayers,
        data.maxPlayers,
        data.createdAt,
        data.status as RoomStatus,
        data.password,
        data.isClosed,
        data.gameUrl,
    )
}
