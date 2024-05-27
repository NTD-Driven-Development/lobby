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
        // given
        givenGame(client, '大老二').then((game) => {
            const givenData = givenCreateRoom(game.id, '123')
            client.emit('create-room', givenData)
            client.on('room-created', async (event) => {
                // then
                assertRoomCreatedSuccessfully(event, givenData.data)
                done()
            })
        })
    })

    it(`
        玩家 A 剛建立了大老二房間，密碼為=123。
        玩家 B 加入 A 的房間，
        因房間尚未開始遊戲且玩家 B 並未在其他房間，
        所以玩家 B 已加入房間。
        玩家 B 按了準備，又取消了準備，
        最後 A 離開了房間。
    `, (done) => {
        // given
        const { clientA, clientB } = givenTwoPlayersSocket()
        givenGame(clientA, '大老二').then((game) => {
            clientA.emit('create-room', givenCreateRoom(game.id, '123'))
            clientB.on('room-created', async (event) => {
                const roomId = event.data.roomId
                // B join A's room
                clientB.emit('join-room', givenJoinRoom(roomId, '123'))
                await assertClientBWasJoinedRoom(clientA, clientB)
                // B change readiness to true
                clientB.emit('change-readiness', givenChangeReadiness(roomId, true))
                await Promise.all([
                    assertClientReadinessWasChanged(clientB, roomId, true),
                    assertClientReadinessWasChanged(clientA, roomId, true),
                ])
                // B change readiness to false
                clientB.emit('change-readiness', givenChangeReadiness(roomId, false))
                await Promise.all([
                    assertClientReadinessWasChanged(clientB, roomId, false),
                    assertClientReadinessWasChanged(clientA, roomId, false),
                ])
                // A leave room
                clientA.emit('leave-room', { type: 'leave-room', data: { roomId } })
                await Promise.all([assertClientWasLeftRoom(clientA, roomId), assertClientWasLeftRoom(clientB, roomId)])
                done()
            })
        })
    })
})

function assertClientWasLeftRoom(client: Client, roomId: string) {
    return new Promise((resolve) =>
        client.on('player-left-room', (event) => {
            expect(event.data).toEqual({
                roomId,
                playerId: expect.any(String),
            })
            client.off('player-left-room')
            resolve(true)
        }),
    )
}

function givenChangeReadiness(roomId: string, isReady: boolean) {
    return { type: 'change-readiness' as const, data: { roomId, isReady } }
}

function assertClientReadinessWasChanged(client: Client, roomId: string, isReady: boolean) {
    return new Promise((resolve) => {
        client.on('player-readiness-changed', (event) => {
            // then
            expect(event.data).toEqual({
                roomId,
                playerId: expect.any(String),
                isReady,
            })
            client.off('player-readiness-changed')
            resolve(true)
        })
    })
}

function assertClientBWasJoinedRoom(clientA: Client, clientB: Client) {
    return Promise.all([
        new Promise((resolve) => {
            clientA.on('player-joined-room', (event) => {
                // then
                expect(event.data.player).toEqual({
                    id: expect.any(String),
                    name: 'B',
                    isReady: false,
                })
                clientA.off('player-joined-room')
                resolve(true)
            })
        }),
        new Promise((resolve) => {
            clientB.on('player-joined-room', (event) => {
                // then
                expect(event.data.player).toEqual({
                    id: expect.any(String),
                    name: 'B',
                    isReady: false,
                })
                clientB.off('player-joined-room')
                resolve(true)
            })
        }),
    ])
}

function givenJoinRoom(roomId: string, password: string | null = null) {
    return {
        type: 'join-room' as const,
        data: {
            roomId,
            password: password,
        },
    }
}

function givenTwoPlayersSocket() {
    const clientA: Client = io(globalThis.SOCKET_URL, {
        reconnectionDelayMax: 0,
        reconnectionDelay: 0,
        forceNew: true,
        transports: ['websocket'],
        auth: {
            email: 'a@gmail.com',
            name: 'A',
        },
    })
    const clientB: Client = io(globalThis.SOCKET_URL, {
        reconnectionDelayMax: 0,
        reconnectionDelay: 0,
        forceNew: true,
        transports: ['websocket'],
        auth: {
            email: 'b@gmail.com',
            name: 'B',
        },
    })
    return { clientA, clientB }
}

async function givenGame(client: Client, name: string) {
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
        auth: {
            email: 'test@gmail.com',
            name: 'test',
        },
    })

    // Create two players
    const clientA: Client = io(globalThis.SOCKET_URL, {
        reconnectionDelayMax: 0,
        reconnectionDelay: 0,
        forceNew: true,
        transports: ['websocket'],
        auth: {
            email: 'a@gmail.com',
            name: 'A',
        },
    })

    const clientB: Client = io(globalThis.SOCKET_URL, {
        reconnectionDelayMax: 0,
        reconnectionDelay: 0,
        forceNew: true,
        transports: ['websocket'],
        auth: {
            email: 'b@gmail.com',
            name: 'B',
        },
    })

    Promise.all([
        new Promise((resolve) => {
            client.on('connect', () => {
                client.emit('register-user', { type: 'register-user', data: null })
                client.on('user-registered', () => {
                    resolve(true)
                })
            })
        }),
        new Promise((resolve) => {
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
            client.on('game-registered', () => {
                resolve(true)
            })
        }),
        new Promise((resolve) => {
            clientA.on('connect', () => {
                clientA.emit('register-user', { type: 'register-user', data: null })
                clientA.on('user-registered', () => {
                    resolve(true)
                })
            })
        }),
        new Promise((resolve) => {
            clientB.on('connect', () => {
                clientB.emit('register-user', { type: 'register-user', data: null })
                clientB.on('user-registered', () => {
                    resolve(true)
                })
            })
        }),
    ]).then(() => {
        client.disconnect()
        clientA.disconnect()
        clientB.disconnect()
        done()
    })
}

function assertRoomCreatedSuccessfully(
    event: RoomCreated,
    givenData: {
        name: string
        minPlayers: number
        maxPlayers: number
        gameId: string
        password: string | null
    },
) {
    expect(event.data).toEqual(
        expect.objectContaining<RoomCreatedEventSchema['data']>({
            roomId: expect.any(String),
            name: givenData.name,
            game: expect.objectContaining({
                id: givenData.gameId,
            }),
            host: {
                id: expect.any(String),
                name: 'test',
                isReady: true,
            },
            currentPlayers: [
                {
                    id: expect.any(String),
                    name: 'test',
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

function givenCreateRoom(gameId: string, password: string | null = null): CreateRoomEventSchema {
    return {
        type: 'create-room',
        data: {
            name: '快來一起玩吧~',
            gameId,
            minPlayers: 4,
            maxPlayers: 4,
            password,
        },
    } as CreateRoomEventSchema
}
