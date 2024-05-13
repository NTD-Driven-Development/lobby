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
            expect(event.data).toEqual(
                expect.objectContaining<GameRegisteredEventSchema['data']>({
                    id: expect.any(String),
                    name: 'test',
                    description: 'test',
                    rule: 'test',
                    minPlayers: 1,
                    maxPlayers: 1,
                    imageUrl: null,
                    frontendUrl: 'test',
                    backendUrl: 'test',
                    status: GameStatus.OFFLINE,
                }),
            )
            aggregateId = event.data.id
            done()
        })
        client.emit('register-game', {
            type: 'register-game',
            data: {
                name: 'test',
                description: 'test',
                rule: 'test',
                minPlayers: 1,
                maxPlayers: 1,
                imageUrl: null,
                frontendUrl: 'test',
                backendUrl: 'test',
            },
        } as RegisterGameEventSchema)
    })

    it('should be get game-info-updated event', (done) => {
        // Emit sth from Client do Server
        client.on('game-info-updated', (event) => {
            expect(event.data).toEqual(
                expect.objectContaining<GameInfoUpdatedEventSchema['data']>({
                    id: expect.any(String),
                    name: 'test-updated',
                    status: GameStatus.OFFLINE,
                }),
            )
            done()
        })
        client.emit('update-game-info', {
            type: 'update-game-info',
            data: {
                id: aggregateId,
                name: 'test-updated',
            },
        } as UpdateGameInfoEventSchema)
    })
})
