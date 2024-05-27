import {
    UpdateGameInfoEventSchema,
    RegisterGameEventSchema,
    JoinRoomEventSchema,
    LeaveRoomEventSchema,
    ChangeReadinessEventSchema,
    ChangeHostEventSchema,
    CreateRoomEventSchema,
    CloseRoomEventSchema,
    EndGameEventSchema,
    StartGameEventSchema,
    UpdateUserInfoEventSchema,
    RegisterUserEventSchema,
    GetRoomsEventSchema,
    GetGamesResultEventSchema,
    GameInfoUpdatedEventSchema,
    GameRegisteredEventSchema,
    PlayerJoinedRoomEventSchema,
    PlayerLeftRoomEventSchema,
    PlayerReadinessChangedEventSchema,
    RoomChangedHostEventSchema,
    RoomClosedEventSchema,
    RoomCreatedEventSchema,
    RoomEndedGameEventSchema,
    RoomStartedGameEventSchema,
    UserInfoUpdatedEventSchema,
    UserRegisteredEventSchema,
    GetGamesEventSchema,
    GetRoomEventSchema,
    GetRoomResultEventSchema,
    GetRoomsResultEventSchema,
    GetMyStatusEventSchema,
    GetMyStatusResultEventSchema,
} from '@packages/domain'
import { Socket as BaseServer } from 'socket.io'
import { Socket as BaseClient } from 'socket.io-client'

interface ServerToClientEvents {
    'get-my-status-result': (event: GetMyStatusResultEventSchema) => void
    'get-room-result': (event: GetRoomResultEventSchema) => void
    'get-rooms-result': (event: GetRoomsResultEventSchema) => void
    'get-games-result': (event: GetGamesResultEventSchema) => void
    'game-info-updated': (event: GameInfoUpdatedEventSchema) => void
    'game-registered': (event: GameRegisteredEventSchema) => void
    'player-joined-room': (event: PlayerJoinedRoomEventSchema) => void
    'player-left-room': (event: PlayerLeftRoomEventSchema) => void
    'player-readiness-changed': (event: PlayerReadinessChangedEventSchema) => void
    'room-changed-host': (event: RoomChangedHostEventSchema) => void
    'room-closed': (event: RoomClosedEventSchema) => void
    'room-created': (event: RoomCreatedEventSchema) => void
    'room-ended-game': (event: RoomEndedGameEventSchema) => void
    'room-started-game': (event: RoomStartedGameEventSchema) => void
    'user-info-updated': (event: UserInfoUpdatedEventSchema) => void
    'user-registered': (event: UserRegisteredEventSchema) => void
}

interface ClientToServerEvents {
    'get-my-status': (event: GetMyStatusEventSchema) => void
    'get-room': (event: GetRoomEventSchema) => void
    'get-rooms': (event: GetRoomsEventSchema) => void
    'get-games': (event: GetGamesEventSchema) => void
    'update-game-info': (event: UpdateGameInfoEventSchema) => void
    'register-game': (event: RegisterGameEventSchema) => void
    'join-room': (event: JoinRoomEventSchema) => void
    'leave-room': (event: LeaveRoomEventSchema) => void
    'change-readiness': (event: ChangeReadinessEventSchema) => void
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
