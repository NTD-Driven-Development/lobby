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
        房間建立成功
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
        玩家 A 剛建立了大老二房間，密碼為 123。
        玩家 B 加入 A 的房間，
        玩家 B 已加入房間，
        玩家 B 按了準備，又取消了準備，
        玩家 A 離開了房間，
        玩家 C 透過房間列表加入 B 的房間，
    `, (done) => {
        // given
        const { clientA, clientB, clientC } = givenFourPlayersSocket()
        givenGame(clientA, '大老二').then((game) => {
            clientA.emit('create-room', givenCreateRoom(game.id, '123'))
            clientB.on('room-created', async (event) => {
                clientB.off('room-created')
                const roomId = event.data.roomId
                // B join A's room
                clientB.emit('join-room', givenJoinRoom(roomId, '123'))
                await assertClientBWasJoinedRoom(clientA, clientB)
                // B get room data
                clientB.emit('get-room', { type: 'get-room', data: { roomId } })
                await assertClientBGetCurrentRoomData(clientB, roomId, game)
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

                // C join B's room
                clientC.emit('get-rooms', { type: 'get-rooms', data: {} })
                clientC.on('get-rooms-result', async (event) => {
                    const room = event.data.find((room) => room.id === roomId)
                    clientC.emit('join-room', givenJoinRoom(room?.id as string, '123'))
                    await assertClientBWasJoinedRoom(clientB, clientC, 'C')
                    done()
                })
            })
        })
    })

    it(`
        A, D 兩位玩家建立了大老二遊戲房間，
        D 加入 A 的房間，
        加入失敗，只能加入一個房間。
        A 建立第二個大老二遊戲房間，
        建立失敗，只能建立一個房間。
    `, (done) => {
        // given
        const { clientA, clientD } = givenFourPlayersSocket()
        givenGame(clientA, '大老二').then((game) => {
            clientA.emit('create-room', givenCreateRoom(game.id, null, 'A'))
            assertCannotJoinSecondRoom(clientA, game, clientD).then(() => {
                clientA.emit('create-room', givenCreateRoom(game.id, null, 'A2'))
                clientA.on('validation-error', (error) => {
                    expect(error).toBe('Player has already joined a room')
                    done()
                })
            })
        })
    })
})

async function assertCannotJoinSecondRoom(
    clientA: Client,
    game: {
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
    },
    clientD: Client,
) {
    return Promise.all([
        new Promise((resolve) => {
            clientA.on('room-created', (event) => {
                clientA.off('room-created')
                const roomId = event.data.roomId
                clientD.emit('create-room', givenCreateRoom(game.id, null, 'D'))
                // D join A's room
                clientD.on('room-created', () => {
                    clientD.off('room-created')
                    clientD.emit('join-room', givenJoinRoom(roomId))
                    clientD.on('validation-error', (error) => {
                        expect(error).toBe('Player has already joined a room')
                        resolve(true)
                    })
                })
            })
        }),
    ])
}

function assertClientBGetCurrentRoomData(
    client: Client,
    roomId: string,
    game: {
        id: string
        name: string
        description: string
        rule: string
        minPlayers: number
        maxPlayers: number
        imageUrl: string | null
    },
) {
    return new Promise((resolve) => {
        client.on('get-room-result', (event) => {
            expect(event.data).toEqual(
                expect.objectContaining({
                    id: roomId,
                    name: '快來一起玩吧~',
                    game: expect.objectContaining({
                        id: game.id,
                        name: game.name,
                        description: game.description,
                        rule: game.rule,
                        minPlayers: game.minPlayers,
                        maxPlayers: game.maxPlayers,
                        imageUrl: game.imageUrl,
                    }),
                    host: expect.objectContaining({
                        id: expect.any(String),
                        name: 'A',
                        isReady: true,
                        status: 'CONNECTED',
                    }),
                    players: expect.arrayContaining([
                        expect.objectContaining({
                            id: expect.any(String),
                            name: 'A',
                            isReady: true,
                            status: 'CONNECTED',
                        }),
                        expect.objectContaining({
                            id: expect.any(String),
                            name: 'B',
                            isReady: false,
                            status: 'CONNECTED',
                        }),
                    ]),
                    minPlayers: 4,
                    maxPlayers: 4,
                    isLocked: true,
                    createdAt: expect.any(String),
                    status: RoomStatus.WAITING,
                    isClosed: false,
                    gameUrl: null,
                }),
            )
            resolve(true)
        })
    })
}

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

function assertClientBWasJoinedRoom(clientA: Client, clientB: Client, userName: string = 'B') {
    return Promise.all([
        new Promise((resolve) => {
            clientA.on('player-joined-room', (event) => {
                // then
                expect(event.data.player).toEqual(
                    expect.objectContaining({
                        id: expect.any(String),
                        name: userName,
                        isReady: false,
                        status: 'CONNECTED',
                    }),
                )
                clientA.off('player-joined-room')
                resolve(true)
            })
        }),
        new Promise((resolve) => {
            clientB.on('player-joined-room', (event) => {
                // then
                expect(event.data.player).toEqual(
                    expect.objectContaining({
                        id: expect.any(String),
                        name: userName,
                        isReady: false,
                        status: 'CONNECTED',
                    }),
                )
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

function givenFourPlayersSocket() {
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
    const clientC: Client = io(globalThis.SOCKET_URL, {
        reconnectionDelayMax: 0,
        reconnectionDelay: 0,
        forceNew: true,
        transports: ['websocket'],
        auth: {
            email: 'c@gmail.com',
            name: 'C',
        },
    })
    const clientD: Client = io(globalThis.SOCKET_URL, {
        reconnectionDelayMax: 0,
        reconnectionDelay: 0,
        forceNew: true,
        transports: ['websocket'],
        auth: {
            email: 'd@gmail.com',
            name: 'D',
        },
    })
    return { clientA, clientB, clientC, clientD }
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
    const { clientA, clientB, clientC, clientD } = givenFourPlayersSocket()

    Promise.all([
        new Promise((resolve) => {
            client.on('connect', () => {
                resolve(true)
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
                resolve(true)
            })
        }),
        new Promise((resolve) => {
            clientB.on('connect', () => {
                resolve(true)
            })
        }),
        new Promise((resolve) => {
            clientC.on('connect', () => {
                resolve(true)
            })
        }),
        new Promise((resolve) => {
            clientD.on('connect', () => {
                resolve(true)
            })
        }),
    ]).then(() => {
        client.disconnect()
        clientA.disconnect()
        clientB.disconnect()
        clientC.disconnect()
        clientD.disconnect()
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
            host: expect.objectContaining({
                id: expect.any(String),
                name: 'test',
                isReady: true,
                status: 'CONNECTED',
            }),
            currentPlayers: expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(String),
                    name: 'test',
                    isReady: true,
                    status: 'CONNECTED',
                }),
            ]),
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

function givenCreateRoom(gameId: string, password: string | null = null, roomName: string | null = ''): CreateRoomEventSchema {
    return {
        type: 'create-room',
        data: {
            name: `快來一起玩吧~${roomName}`,
            gameId,
            minPlayers: 4,
            maxPlayers: 4,
            password,
        },
    } as CreateRoomEventSchema
}
