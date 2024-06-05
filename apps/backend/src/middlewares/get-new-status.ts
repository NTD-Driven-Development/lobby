import { Server } from '@packages/socket'
import { container } from 'tsyringe'
import { Event } from 'socket.io'
import { RoomController } from '~/room/adapter/room-controller'
import { UserController } from '~/user/adapter/user-controller'

const GetNewStatusHandler = (socket: Server) => async (event: Event, next: (err?: Error) => void) => {
    const userController = container.resolve(UserController)
    const roomController = container.resolve(RoomController)
    const status = await userController.getMyStatus(socket.auth.user)
    const roomEvents = [
        'player-joined-room',
        'player-readiness-changed',
        'player-left-room',
        'player-kicked',
        'room-changed-host',
        'room-closed',
        'room-started-game',
    ]
    socket.emit('get-my-status-result', status)
    if (roomEvents.includes(event[0])) {
        socket.emit(
            'get-room-result',
            await roomController.getRoom({ type: 'get-room', data: { roomId: status.data.roomId as string } }, socket.auth.user),
        )
    }
    next()
}

export { GetNewStatusHandler }
