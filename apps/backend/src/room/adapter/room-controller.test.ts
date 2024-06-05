/* eslint-disable @typescript-eslint/no-explicit-any */
import { CreateRoomEventSchema, GameStatus, RoomCreated, RoomCreatedEventSchema, RoomStatus } from '@packages/domain'
import { Client } from '@packages/socket'
import io from 'socket.io-client'

describe('socket on room-controller', () => {
    beforeAll(async () => {
        // Setup
        // Create Game
        await setUp()
    })

    it(`
        玩家在 Lobby 中建立大老二遊戲房間
        房間名稱為「快來一起玩吧~」
        人數最小為 4 人，最大為 4 人，設定密碼 = 123
        房間建立成功
    `, (done) => {
        // given
        const client = createClient('test')
        givenGame(client, '大老二').then((game) => {
            const givenData = givenCreateRoom(game.id, '123')
            client.emit('create-room', givenData)
            client.once('room-created', async (event) => {
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
    `, async () => {
        // given
        const { clientA, clientB, clientC } = await givenSixPlayersSocket()
        const game = await givenGame(clientA, '大老二')
        let roomId: string = ''
        // A create room
        await Promise.all([
            new Promise((resolve) => {
                clientB.once('room-created', (event) => {
                    roomId = event.data.roomId
                    resolve(true)
                })
                clientA.emit('create-room', givenCreateRoom(game.id, '123', 'A'))
            }),
        ])
        // B join room
        await joinRoom(clientB, roomId, '123')
        // B change readiness to true
        await Promise.all([
            changeReadiness(clientB, roomId, true),
            assertClientReadinessWasChanged(clientB, roomId, true),
            assertClientReadinessWasChanged(clientA, roomId, true),
        ])
        // B change readiness to false
        await Promise.all([
            changeReadiness(clientB, roomId, false),
            assertClientReadinessWasChanged(clientB, roomId, false),
            assertClientReadinessWasChanged(clientA, roomId, false),
        ])
        // A leave room
        await Promise.all([leaveRoom(clientA, roomId), assertClientWasLeftRoom(clientA, roomId), assertClientWasLeftRoom(clientB, roomId)])
        // C join B's room
        await Promise.all([joinRoom(clientC, roomId, '123')])
    })

    it(`
        A, D 兩位玩家建立了十三支遊戲房間，
        D 加入 A 的房間，
        加入失敗，只能加入一個房間。
        A 建立第二個十三支遊戲房間，
        建立失敗，只能建立一個房間。
    `, async () => {
        // given
        const { clientA, clientD } = await givenSixPlayersSocket()
        const game = await givenGame(clientA, '十三支')

        // A, D create room
        await Promise.all([createRoom(clientA, game, null, 'A2'), createRoom(clientD, game)])
        await Promise.all([
            new Promise((resolve) => {
                clientA.once('validation-error', (error) => {
                    expect(error).toBe('Player has already joined a room')
                    resolve(true)
                })
                clientA.emit('create-room', givenCreateRoom(game.id, null, 'A3'))
            }),
        ])
    })

    it(`
        玩家 test 查詢遊戲房間列表，
        應包含大老二 2 間、十三支 2 間房間。
        查詢大老二房間列表，
        查詢結果 2 間。
        查詢房間名稱包含 "A2" 的列表，
        查詢結果 1 間。
    `, (done) => {
        // given
        const client = createClient('test')
        client.emit('get-rooms', { type: 'get-rooms', data: {} })
        client.once('get-rooms-result', (event) => {
            expect(event.data.filter((room) => room.game.name === '大老二').length).toBe(2)
            expect(event.data.filter((room) => room.game.name === '十三支').length).toBe(2)
            givenGame(client, '大老二').then((game) => {
                client.emit('get-rooms', { type: 'get-rooms', data: { gameId: game.id } })
                client.once('get-rooms-result', (event) => {
                    expect(event.data.length).toBe(2)
                    client.emit('get-rooms', { type: 'get-rooms', data: { search: 'A2' } })
                    client.once('get-rooms-result', (event) => {
                        expect(event.data.length).toBe(1)
                        done()
                    })
                })
            })
        })
    })

    it(`
        A 已經在房間中，
        A 退出房間，
        A 創建了十三支遊戲房間，
        B 加入了 A 的房間，
        B 已加入房間，
        A 將 B 踢出房間，
        B 已離開房間。
    `, (done) => {
        // given
        givenSixPlayersSocket().then(({ clientE: clientA, clientF: clientB }) => {
            givenGame(clientA, '大老二').then((game) => {
                // A create room
                clientA.emit('create-room', givenCreateRoom(game.id, '123'))
                // B join room
                clientB.on('room-created', async (event) => {
                    clientB.off('room-created')
                    const roomId = event.data.roomId
                    // B join A's room
                    clientB.emit('join-room', givenJoinRoom(roomId, '123'))
                    clientB.once('player-joined-room', async () => {
                        clientA.emit('get-room', { type: 'get-room', data: { roomId } })
                        clientA.once('get-room-result', async (event) => {
                            clientA.off('get-room-result')
                            const players = event.data.players
                            const kickUser = players.find((p) => p.name == 'F')
                            clientA.emit('kick-player', { type: 'kick-player', data: { playerId: kickUser?.id as string, roomId } })
                            clientB.once('player-kicked', () => {
                                clientA.emit('get-room', { type: 'get-room', data: { roomId } })
                                clientA.once('get-room-result', (event) => {
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
                                                name: 'E',
                                                isReady: true,
                                                status: 'CONNECTED',
                                            }),
                                            players: expect.arrayContaining([
                                                expect.objectContaining({
                                                    id: expect.any(String),
                                                    name: 'E',
                                                    isReady: true,
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
                                    clientB.emit('join-room', givenJoinRoom(roomId, '123'))
                                    clientA.once('player-joined-room', () => {
                                        done()
                                    })
                                })
                            })
                        })
                    })
                })
            })
        })
    })
})

function createRoom(client: Client, game: { id: string; name: string }, password: string | null = null, roomName: string | null = '') {
    return new Promise((resolve) => {
        client.once('room-created', resolve)
        client.emit('create-room', givenCreateRoom(game.id, password, roomName))
    })
}

function changeReadiness(client: Client, roomId: string, isReady: boolean) {
    return new Promise((resolve) => {
        client.once('player-readiness-changed', resolve)
        client.emit('change-readiness', givenChangeReadiness(roomId, isReady))
    })
}

function leaveRoom(client: Client, roomId: string) {
    return new Promise((resolve) => {
        client.once('player-left-room', resolve)
        client.emit('leave-room', { type: 'leave-room', data: { roomId } })
    })
}

function assertClientWasLeftRoom(client: Client, roomId: string) {
    return new Promise((resolve) =>
        client.once('player-left-room', (event) => {
            expect(event.data).toEqual({
                roomId,
                playerId: expect.any(String),
            })
            resolve(true)
        }),
    )
}

function givenChangeReadiness(roomId: string, isReady: boolean) {
    return { type: 'change-readiness' as const, data: { roomId, isReady } }
}

function assertClientReadinessWasChanged(client: Client, roomId: string, isReady: boolean) {
    return new Promise((resolve) => {
        client.once('player-readiness-changed', (event) => {
            // then
            expect(event.data).toEqual({
                roomId,
                playerId: expect.any(String),
                isReady,
            })
            resolve(true)
        })
    })
}

function joinRoom(client: Client, roomId: string, password: string | null = null) {
    return new Promise((resolve, reject) => {
        client.once('validation-error', (error) => {
            reject(error)
        })
        client.once('player-joined-room', (event) => {
            expect(event.data.player.name).toBe((client.auth as { [key: string]: any }).name)
            resolve(true)
        })
        client.emit('join-room', {
            type: 'join-room',
            data: { roomId, password },
        })
    })
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

async function givenSixPlayersSocket() {
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
    const clientE: Client = io(globalThis.SOCKET_URL, {
        reconnectionDelayMax: 0,
        reconnectionDelay: 0,
        forceNew: true,
        transports: ['websocket'],
        auth: {
            email: 'e@gmail.com',
            name: 'E',
        },
    })
    const clientF: Client = io(globalThis.SOCKET_URL, {
        reconnectionDelayMax: 0,
        reconnectionDelay: 0,
        forceNew: true,
        transports: ['websocket'],
        auth: {
            email: 'f@gmail.com',
            name: 'F',
        },
    })
    await Promise.all([
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
        new Promise((resolve) => {
            clientE.on('connect', () => {
                resolve(true)
            })
        }),
        new Promise((resolve) => {
            clientF.on('connect', () => {
                resolve(true)
            })
        }),
    ])
    return { clientA, clientB, clientC, clientD, clientE, clientF }
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

async function setUp() {
    // Create players
    await Promise.all([
        new Promise((resolve) => {
            const client = createClient('test')
            client.on('connect', () => {
                resolve(true)
            })
        }),
        new Promise((resolve) => {
            const client = createClient('A')
            client.on('connect', () => {
                registerGame(client, '大老二').then(() => {
                    registerGame(client, '撿紅點').then(() => {
                        registerGame(client, '十三支').then(() => {
                            resolve(true)
                        })
                    })
                })
            })
        }),
        new Promise((resolve) => {
            const clientA = createClient('A')
            clientA.on('connect', () => {
                resolve(true)
            })
        }),
        new Promise((resolve) => {
            const clientB = createClient('B')
            clientB.on('connect', () => {
                resolve(true)
            })
        }),
        new Promise((resolve) => {
            const clientC = createClient('C')
            clientC.on('connect', () => {
                resolve(true)
            })
        }),
        new Promise((resolve) => {
            const clientD = createClient('D')
            clientD.on('connect', () => {
                resolve(true)
            })
        }),
        new Promise((resolve) => {
            const clientE = createClient('E')
            clientE.on('connect', () => {
                resolve(true)
            })
        }),
        new Promise((resolve) => {
            const clientF = createClient('F')
            clientF.on('connect', () => {
                resolve(true)
            })
        }),
    ])
}

function registerGame(client: Client, name: string) {
    return new Promise((resolve) => {
        client.once('game-registered', resolve)
        client.emit('register-game', {
            type: 'register-game',
            data: {
                name,
                description: '待議',
                rule: '待議',
                minPlayers: 4,
                maxPlayers: 4,
                imageUrl: null,
                frontendUrl: 'http://localhost:3000',
                backendUrl: 'http://localhost:8000/api',
            },
        })
    })
}

function createClient(name: string): Client {
    return io(globalThis.SOCKET_URL, {
        reconnectionDelayMax: 0,
        reconnectionDelay: 0,
        forceNew: true,
        transports: ['websocket'],
        auth: {
            email: `${name}@gmail.com`,
            name,
        },
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
