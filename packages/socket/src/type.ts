import {
    GameInfoUpdated,
    GameRegistered,
    PlayerJoinedRoom,
    PlayerLeftRoom,
    PlayerReadinessChanged,
    RoomChangedHost,
    RoomClosed,
    RoomCreated,
    RoomEndedGame,
    RoomStartedGame,
    UserInfoUpdated,
    UserRegistered,
    UpdateGameInfoEventSchema,
    RegisterGameEventSchema,
    PlayerJoinRoomEventSchema,
    PlayerLeaveRoomEventSchema,
    ChangePlayerReadinessEventSchema,
    ChangeHostEventSchema,
    CreateRoomEventSchema,
    CloseRoomEventSchema,
    EndGameEventSchema,
    StartGameEventSchema,
    UpdateUserInfoEventSchema,
    RegisterUserEventSchema,
} from '@packages/domain'
import { Socket as BaseServer } from 'socket.io'
import { Socket as BaseClient } from 'socket.io-client'

interface ServerToClientEvents {
    'game-info-updated': (event: GameInfoUpdated) => void
    'game-registered': (event: GameRegistered) => void
    'player-joined-room': (event: PlayerJoinedRoom) => void
    'player-left-room': (event: PlayerLeftRoom) => void
    'player-readiness-changed': (event: PlayerReadinessChanged) => void
    'room-changed-host': (event: RoomChangedHost) => void
    'room-closed': (event: RoomClosed) => void
    'room-created': (event: RoomCreated) => void
    'room-ended-game': (event: RoomEndedGame) => void
    'room-started-game': (event: RoomStartedGame) => void
    'user-info-updated': (event: UserInfoUpdated) => void
    'user-registered': (event: UserRegistered) => void
}

interface ClientToServerEvents {
    'update-game-info': (event: UpdateGameInfoEventSchema) => void
    'register-game': (event: RegisterGameEventSchema) => void
    'join-room': (event: PlayerJoinRoomEventSchema) => void
    'leave-room': (event: PlayerLeaveRoomEventSchema) => void
    'change-readiness': (event: ChangePlayerReadinessEventSchema) => void
    'change-host': (event: ChangeHostEventSchema) => void
    'close-room': (event: CloseRoomEventSchema) => void
    'create-room': (event: CreateRoomEventSchema) => void
    'end-game': (event: EndGameEventSchema) => void
    'start-game': (event: StartGameEventSchema) => void
    'update-user-info': (event: UpdateUserInfoEventSchema) => void
    'register-user': (event: RegisterUserEventSchema) => void
}

export type Server = BaseServer<ClientToServerEvents, ServerToClientEvents>
export type Client = BaseClient<ServerToClientEvents, ClientToServerEvents>
