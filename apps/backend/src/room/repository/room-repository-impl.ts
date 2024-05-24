import { injectable } from 'tsyringe'
import { RoomRepository } from './room-repository'
import { Repository } from 'typeorm'
import { RoomData } from '~/data/entity'
import { AppDataSource } from '~/data/data-source'
import { Room, RoomStatus, Game } from '@packages/domain'

@injectable()
export class RoomRepositoryImpl implements RoomRepository {
    private repo: Repository<RoomData>
    public constructor() {
        this.repo = AppDataSource.getRepository(RoomData)
    }
    findById(roomId: string): Promise<Room> {
        throw new Error('Method not implemented.')
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
    console.log(aggregate.players)
    console.log(typeof aggregate.players)
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
