/* eslint-disable @typescript-eslint/no-explicit-any */
import { CreateRoomEventSchema, GameStatus, RoomCreated, RoomCreatedEventSchema, RoomStatus } from '@packages/domain'
import { Client } from '@packages/socket'
import io from 'socket.io-client'

let client: Client

describe('socket on room-controller', () => {
    beforeAll((done) => {
        // Setup
        // Create Game
        setUp(done)
    })
    beforeEach((done) => {
        // Setup
        client = io(globalThis.SOCKET_URL, {
            reconnectionDelayMax: 0,
            reconnectionDelay: 0,
            forceNew: true,
            transports: ['websocket'],
            auth: {
                email: 'test@gmail.com',
                name: 'test',
            },
        })
        client.on('connect', () => {
            done()
        })
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
        givenGame('大老二').then((game) => {
            client.emit('create-room', givenCreateRoom(game))
            client.on('room-created', async (event) => {
                // then
                assertRoomCreatedSuccessfully(event, game)
                done()
            })
        })
    })
})

async function givenGame(name: string) {
    client.emit('get-games', { type: 'get-games', data: {} })
    return await new Promise<{
        id: string
        name: string
        description: string
        rule: string
        minPlayers: number
        maxPlayers: number
        imageUrl: string | null
        frontendUrl: string
        backendUrl: string
        status: GameStatus
    }>((resolve) => {
        client.on('get-games-result', (event) => {
            const game = event.data.find((game) => game.name === name)
            resolve(game as any)
        })
    })
}

function setUp(done: jest.DoneCallback) {
    client = io(globalThis.SOCKET_URL, {
        reconnectionDelayMax: 0,
        reconnectionDelay: 0,
        forceNew: true,
        transports: ['websocket'],
    })
    client.on('connect', () => {
        client.emit('register-game', {
            type: 'register-game',
            data: {
                name: '大老二',
                description: '待議',
                rule: '待議',
                minPlayers: 4,
                maxPlayers: 4,
                imageUrl: null,
                frontendUrl: 'http://localhost:3000',
                backendUrl: 'http://localhost:8000/api',
            },
        })
        done()
    })
}

function assertRoomCreatedSuccessfully(event: RoomCreated, gameInfo: { id: string; name: string; minPlayers: number; maxPlayers: number }) {
    const givenData = givenCreateRoom(gameInfo).data
    expect(event.data).toEqual(
        expect.objectContaining<RoomCreatedEventSchema['data']>({
            roomId: expect.any(String),
            name: givenData.name,
            game: givenData.game,
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
            minPlayers: givenData.minPlayers,
            maxPlayers: givenData.maxPlayers,
            password: givenData.password,
            createdAt: expect.any(String),
            status: RoomStatus.WAITING,
            isClosed: false,
            gameUrl: null,
        }),
    )
}

function givenCreateRoom(gameInfo: { id: string; name: string; minPlayers: number; maxPlayers: number }): CreateRoomEventSchema {
    return {
        type: 'create-room',
        data: {
            name: '快來一起玩吧~',
            game: gameInfo,
            minPlayers: 4,
            maxPlayers: 4,
            password: '123',
        },
    } as CreateRoomEventSchema
}
