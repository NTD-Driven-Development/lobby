import { CreateRoomEventSchema, RegisterGameEventSchema, RoomCreatedEventSchema, RoomStatus } from '@packages/domain'
import { Client } from '@packages/socket'
import io from 'socket.io-client'

let client: Client
let gameInfo = {
    id: '',
    name: '',
    minPlayers: 0,
    maxPlayers: 0,
}

describe('socket on room-controller', () => {
    beforeAll(() => {})
    beforeEach(() => {
        // Setup
        client = io(globalThis.SOCKET_URL, {
            reconnectionDelayMax: 0,
            reconnectionDelay: 0,
            forceNew: true,
            transports: ['websocket'],
        })
        client.on('connect', () => {})
    })

    afterEach(() => {
        if (client.connected) {
            client.disconnect()
        }
    })

    it(`
        玩家在 Lobby 中建立大老二遊戲房間
        房間名稱為「快來一起玩吧~」
        人數最小為 4 人，最大為 4 人，設定密碼 = 123
        所以房間建立成功
    `, (done) => {
        // Emit sth from Client do Server
        client.on('game-registered', (event) => {
            gameInfo = {
                id: event.data.id,
                name: event.data.name,
                minPlayers: event.data.minPlayers,
                maxPlayers: event.data.maxPlayers,
            }

            client.emit('create-room', {
                type: 'create-room',
                data: {
                    name: '快來一起玩吧~',
                    game: {
                        id: gameInfo.id,
                        name: gameInfo.name,
                        minPlayers: gameInfo.minPlayers,
                        maxPlayers: gameInfo.maxPlayers,
                    },
                    minPlayers: 4,
                    maxPlayers: 4,
                    password: '123',
                },
            } as CreateRoomEventSchema)

            client.on('room-created', (event) => {
                // then
                expect(event.data).toEqual(
                    expect.objectContaining<RoomCreatedEventSchema['data']>({
                        roomId: expect.any(String),
                        name: '快來一起玩吧~',
                        game: {
                            id: gameInfo.id,
                            name: gameInfo.name,
                            minPlayers: gameInfo.minPlayers,
                            maxPlayers: gameInfo.maxPlayers,
                        },
                        host: {
                            id: expect.any(String),
                            name: expect.any(String),
                            isReady: true,
                        },
                        currentPlayers: [
                            {
                                id: expect.any(String),
                                name: expect.any(String),
                                isReady: true,
                            },
                        ],
                        minPlayers: 4,
                        maxPlayers: 4,
                        password: '123',
                        createdAt: expect.any(String),
                        status: RoomStatus.WAITING,
                        isClosed: false,
                        gameUrl: null,
                    }),
                )
                done()
            })
        })

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
})
