import {
    UserRegisteredEventSchema,
    UpdateUserInfoEventSchema,
    UserInfoUpdatedEventSchema,


} from '@packages/domain'
import { Client } from '@packages/socket'
import io from 'socket.io-client'

let client: Client

describe('socket on user-controller', () => {
    beforeAll(() => { })
    beforeEach(() => {
        // Setup
        client = io(globalThis.SOCKET_URL, {
            reconnectionDelayMax: 0,
            reconnectionDelay: 0,
            forceNew: true,
            transports: ['websocket'],
            auth: {
                name: 'A',
                email: 'test@example.com'
            }
        })
        client.on('connect', () => { })
    })

    afterEach(() => {
        if (client.connected) {
            client.disconnect()
        }
    })
    //-----------------------------------------------------------

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
            data: null
        })

        // then
        client.on('user-registered', (event) => {
            expect(event.data).toEqual(
                expect.objectContaining<UserRegisteredEventSchema['data']>({
                    id: expect.any(String),
                    name: 'A',
                    email: 'test@example.com'
                }),
            )
            done()
        })
    })
    //-----------------------------------------------------------
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
})
