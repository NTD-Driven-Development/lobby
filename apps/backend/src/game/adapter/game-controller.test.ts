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

    it(`
        遊戲開發者向 Lobby 註冊一個大老二遊戲，
        沒有圖片連結，最小人數及最大人數上限皆為 4 人，
        規則及詳細敘述皆為「待議」，
        前端 host='http://localhost:3000'，
        後端 host='http://localhost:8000/api'，
        由於平台沒有註冊過這款遊戲，所以遊戲註冊成功。
    `, (done) => {
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

    it(`
        註冊一個 Big Two blah blah 遊戲，
        從遊戲列表中選取該筆遊戲並更新遊戲名稱為「test-updated」，
        更新成功。
    `, (done) => {
        client.emit('register-game', {
            type: 'register-game',
            data: {
                name: 'Big Two blah blah',
                description: 'test',
                rule: 'test',
                minPlayers: 4,
                maxPlayers: 4,
                imageUrl: null,
                frontendUrl: 'http://localhost:3000',
                backendUrl: 'http://localhost:8000/api',
            },
        } as RegisterGameEventSchema)
        client.on('game-registered', (event) => {
            const aggregateId = event.data.id
            client.emit('get-games', {
                type: 'get-games',
                data: {},
            })
            client.on('get-games-result', (event) => {
                // given
                const data = event.data.find((game) => game.id === aggregateId)
                expect(data).toBeTruthy()
                const payload = {
                    type: 'update-game-info',
                    data: {
                        id: data?.id,
                        name: 'test-updated',
                    },
                } as UpdateGameInfoEventSchema
                // when
                client.emit('update-game-info', payload)
                // then
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
            })
        })
    })
})
