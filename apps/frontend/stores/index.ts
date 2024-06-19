import { number, object, string } from 'yup';
import { GameStatus, type GamesResultSchema, type GetRoomsResultSchema, type JoinRoomEventSchema, type PlayerLeftRoom } from '@packages/domain';

export const useIndexStore = defineStore('index', () => {
    const appStore = useAppStore();
    const { app, waitSocketConnected } = appStore;

    const init = async () => {
        await waitSocketConnected();

        app.lobbySocket?.emit('get-games', {
            type: 'get-games',
            data: {
                status: GameStatus.ONLINE,
            },
        });

        app.lobbySocket?.once('get-games-result', (event) => {
            state.games = event.data;
            state.currentGame = event.data[0];
        });
    }

    const join = async (data: JoinRoomEventSchema['data']) => {
        await waitSocketConnected();

        if (app.status?.roomId) {
            app.lobbySocket?.once('player-left-room', () => {
                app.lobbySocket?.emit('join-room', {
                    type: 'join-room',
                    data: data
                });
        
                app.lobbySocket?.on('player-joined-room', (event) => {
                    navigateTo('/room');
                });
            });

            app.lobbySocket?.emit('leave-room', {
                type: 'leave-room',
                data: {
                    roomId: app.status?.roomId!,
                },
            });
        }
        else {
            app.lobbySocket?.emit('join-room', {
                type: 'join-room',
                data: data
            });
    
            app.lobbySocket?.on('player-joined-room', (event) => {
                navigateTo('/room');
            });
        }
    }

    const createRoomSubmit = () => {
        try {
            const data = createRoomSchema.validateSync(state.createRoomDialog.form);

            state.createRoomDialog.form = {};
            state.createRoomDialog.show = false;

            if (app.status?.roomId) {
                app.lobbySocket?.once('player-left-room', () => {
                    app.lobbySocket?.emit('create-room', {
                        type: 'create-room',
                        data: {
                            name: data.name,
                            password: data.password ?? '',
                            minPlayers: data.minPlayers,
                            maxPlayers: data.maxPlayers,
                            gameId: state.currentGame?.id!,
                        },
                    });
        
                    app.lobbySocket?.once('room-created', (event) => {
                        navigateTo('/room');
                    });
                });

                app.lobbySocket?.emit('leave-room', {
                    type: 'leave-room',
                    data: {
                        roomId: app.status?.roomId!,
                    },
                });
            }
            else {
                app.lobbySocket?.emit('create-room', {
                    type: 'create-room',
                    data: {
                        name: data.name,
                        password: data.password ?? '',
                        minPlayers: data.minPlayers,
                        maxPlayers: data.maxPlayers,
                        gameId: state.currentGame?.id!,
                    },
                });
    
                app.lobbySocket?.once('room-created', (event) => {
                    navigateTo('/room');
                });
            }
        }
        catch (error) {
            console.log(error);
        }
    }

    const joinLockedRoomSubmit = async () => {
        try {
            const data = joinLockedRoomSchema.validateSync(state.joinLockedRoomDialog.form);

            state.joinLockedRoomDialog.form = {};
            state.joinLockedRoomDialog.show = false;

            await join(data);
        }
        catch (error) {
            console.log(error);
        }
    }

    const state = reactive<State>({
        search: '',
        createRoomDialog: {
            show: false,
            form: {},
            submit: createRoomSubmit,
        },
        joinLockedRoomDialog: {
            show: false,
            form: {},
            submit: joinLockedRoomSubmit,
        },
    });

    watch(() => [state.search, state.currentGame?.id], ([search, gameId]) => {
        app.lobbySocket?.emit('get-rooms', {
            type: 'get-rooms',
            data: {
                gameId: gameId,
                search: search,
            },
        });

        app.lobbySocket?.once('get-rooms-result', (event) => {
            state.rooms = event.data;
        });
    }, { deep: true });

	return { state, init, join }
});

const createRoomSchema = object({
    name: string().required(),
    password: string(),
    minPlayers: number().required(),
    maxPlayers: number().required(),
});

const joinLockedRoomSchema = object({
    roomId: string().required(),
    password: string().required(),
});

type ArrayInferType<T> = T extends (infer T)[] ? T : never
export type GameResultSchema = ArrayInferType<GamesResultSchema>
export type GetRoomResultSchema = ArrayInferType<GetRoomsResultSchema>

interface JoinLockedRoomForm {
    name?: string,
    password?: string,
    minPlayers?: string,
    maxPlayers?: string,
}

interface JoinLockedRoomForm {
    roomId?: string,
    password?: string,
}

interface State {
    games?: GamesResultSchema,
    currentGame?: GameResultSchema,
    rooms?: GetRoomsResultSchema,
    search: string,
    createRoomDialog: {
        show: boolean,
        form: JoinLockedRoomForm,
        submit: () => void,
    },
    joinLockedRoomDialog: {
        show: boolean,
        form: JoinLockedRoomForm,
        submit: () => void,
    },
}