import {
    GameInfoUpdatedEventSchema,
    GameRegisteredEventSchema,
    GameStatus,
    RegisterGameEventSchema,
    UpdateGameInfoEventSchema,
} from '@packages/domain'
import { Client } from '@packages/socket'
import io from 'socket.io-client'
import { AppDataSource } from '~/data/data-source'

let client: Client
let aggregateId: string

describe('socket on game-controller', () => {
    beforeAll((done) => {
        AppDataSource.connect().then(async () => {
            console.log('Database connected')
            const entities = AppDataSource.entityMetadatas
            for (const entity of entities) {
                const repository = AppDataSource.getRepository(entity.name)
                await repository.clear()
            }
            AppDataSource.close()
            done()
        })
    })
    beforeEach((done: jest.DoneCallback) => {
        // Setup
        // Do not hardcode server port and address, square brackets are used for IPv6
        client = io(globalThis.SOCKET_URL, {
            reconnectionDelayMax: 0,
            reconnectionDelay: 0,
            forceNew: true,
            transports: ['websocket'],
        })
        client.on('connect', () => {
            AppDataSource.connect().then(() => {
                done()
            })
        })
    })

    /**
     * Run after each test
     */
    afterEach(() => {
        // Cleanup
        if (client.connected) {
            client.disconnect()
            AppDataSource.close()
        }
    })

    it('should be get game-registered event', (done) => {
        // Emit sth from Client do Server
        client.on('game-registered', (event) => {
            // then
            expect(event.data).toEqual(
                expect.objectContaining<GameRegisteredEventSchema['data']>({
                    id: expect.any(String),
                    name: 'Big Two',
                    description: '待議',
                    rule: '待議',
                    minPlayers: 4,
                    maxPlayers: 4,
                    imageUrl: null,
                    frontendUrl: 'http://localhost:3000',
                    backendUrl: 'http://localhost:8000/api',
                    status: GameStatus.OFFLINE,
                }),
            )
            aggregateId = event.data.id
            done()
        })
        // when
        client.emit('register-game', {
            type: 'register-game',
            data: {
                name: 'Big Two',
                description: '待議',
                rule: '待議',
                minPlayers: 4,
                maxPlayers: 4,
                imageUrl: null,
                frontendUrl: 'http://localhost:3000',
                backendUrl: 'http://localhost:8000/api',
            },
        } as RegisterGameEventSchema)
    })

    it('should be get game-info-updated event', (done) => {
        // Emit sth from Client do Server
        client.on('game-info-updated', (event) => {
            // then
            expect(event.data).toEqual(
                expect.objectContaining<GameInfoUpdatedEventSchema['data']>({
                    id: expect.any(String),
                    name: 'test-updated',
                    status: GameStatus.OFFLINE,
                }),
            )
            done()
        })
        // when
        client.emit('update-game-info', {
            type: 'update-game-info',
            data: {
                id: aggregateId,
                name: 'test-updated',
            },
        } as UpdateGameInfoEventSchema)
    })
})
