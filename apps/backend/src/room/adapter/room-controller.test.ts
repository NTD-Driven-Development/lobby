import { CreateRoomEventSchema, RegisterGameEventSchema, RoomCreated, RoomCreatedEventSchema, RoomStatus } from '@packages/domain'
import { Client } from '@packages/socket'
import io from 'socket.io-client'

let client: Client

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
            const gameInfo = {
                id: event.data.id,
                name: event.data.name,
                minPlayers: event.data.minPlayers,
                maxPlayers: event.data.maxPlayers,
            }

            client.emit('create-room', givenCreateRoom(gameInfo))
            client.on('room-created', (event) => {
                // then
                assertRoomCreatedSuccessfully(event, gameInfo)
                done()
            })
        })

        client.emit('register-game', givenRegisterGame('大老二'))
    })
})

const givenRegisterGame = (name: string) => {
    return {
        type: 'register-game',
        data: {
            name: name,
            description: '待議',
            rule: '待議',
            minPlayers: 4,
            maxPlayers: 4,
            imageUrl: null,
            frontendUrl: 'http://localhost:3000',
            backendUrl: 'http://localhost:8000/api',
        },
    } as RegisterGameEventSchema
}
function assertRoomCreatedSuccessfully(event: RoomCreated, gameInfo: { id: string; name: string; minPlayers: number; maxPlayers: number }) {
    expect(event.data).toEqual(
        expect.objectContaining<RoomCreatedEventSchema['data']>({
            roomId: expect.any(String),
            name: givenCreateRoom(gameInfo).data.name,
            game: givenCreateRoom(gameInfo).data.game,
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
            minPlayers: givenCreateRoom(gameInfo).data.minPlayers,
            maxPlayers: givenCreateRoom(gameInfo).data.maxPlayers,
            password: givenCreateRoom(gameInfo).data.password,
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
