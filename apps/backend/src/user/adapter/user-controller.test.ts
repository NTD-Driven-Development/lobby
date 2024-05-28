/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserRegisteredEventSchema, UpdateUserInfoEventSchema, UserInfoUpdatedEventSchema, GameStatus } from '@packages/domain'
import { Client } from '@packages/socket'
import io from 'socket.io-client'

let client: Client

describe('socket on user-controller', () => {
    beforeAll((done) => {
        setUp(done)
    })
    beforeEach(() => {
        // Setup
        client = io(globalThis.SOCKET_URL, {
            reconnectionDelayMax: 0,
            reconnectionDelay: 0,
            forceNew: true,
            transports: ['websocket'],
            auth: {
                name: 'A',
                email: 'test@example.com',
            },
        })
        client.on('connect', () => {})
    })

    afterEach(() => {
        if (client.connected) {
            client.disconnect()
        }
    })

    it(`
        訪客A由第三方登入，得到 id token 
            payload = {
            name: 'A',
            email: 'test@example.com'
        }，執行會員註冊，因會員表不存在此 email，所以註冊成功。
    `, (done) => {
        //when
        //given
        client.emit('register-user', {
            type: 'register-user',
            data: null,
        })

        // then
        client.on('user-registered', (event) => {
            expect(event.data).toEqual(
                expect.objectContaining<UserRegisteredEventSchema['data']>({
                    id: expect.any(String),
                    name: 'A',
                    email: 'test@example.com',
                }),
            )
            done()
        })
    })

    it(`
    會員A名稱修改為 "小明"
    `, (done) => {
        // Emit sth from Client do Server
        // when
        client.emit('update-user-info', {
            type: 'update-user-info',
            data: {
                name: '小明',
            },
        } as UpdateUserInfoEventSchema)
        // then
        client.on('user-info-updated', (event) => {
            expect(event.data).toEqual(
                expect.objectContaining<UserInfoUpdatedEventSchema['data']>({
                    id: expect.any(String),
                    name: '小明',
                }),
            )
        })
        done()
    })

    it(`
        小明已經加入了狼人殺房間，
        取得小明的個人狀態
        應該回傳小明的房間編號
    `, (done) => {
        // Emit sth from Client do Server
        givenGame(client, '狼人殺').then((game) => {
            client.emit('create-room', givenCreateRoom(game.id))
            client.on('room-created', (event) => {
                const roomId = event.data.roomId
                // when
                client.emit('get-my-status', {
                    type: 'get-my-status',
                    data: null,
                })
                // then
                client.on('get-my-status-result', (event) => {
                    expect(event.data).toEqual(
                        expect.objectContaining({
                            id: expect.any(String),
                            email: 'test@example.com',
                            name: '小明',
                            roomId: roomId,
                        }),
                    )
                    done()
                })
            })
        })
    })
})

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

    Promise.all([
        new Promise((resolve) => {
            client.emit('register-game', {
                type: 'register-game',
                data: {
                    name: '狼人殺',
                    description: '待議',
                    rule: '待議',
                    minPlayers: 5,
                    maxPlayers: 10,
                    imageUrl: null,
                    frontendUrl: 'http://localhost:2012',
                    backendUrl: 'http://localhost:2013/api',
                },
            })
            client.on('game-registered', () => {
                resolve(true)
            })
        }),
    ]).then(() => {
        client.disconnect()
        done()
    })
}

function givenCreateRoom(gameId: string, password: string | null = null, roomName: string | null = '') {
    return {
        type: 'create-room' as const,
        data: {
            name: `快來一起玩吧~${roomName}`,
            gameId,
            minPlayers: 5,
            maxPlayers: 10,
            password,
        },
    }
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
