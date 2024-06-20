import type { GetRoomResult, GetRoomResultEventSchema, PlayerKicked, PlayerLeftRoom } from '@packages/domain';
import type { WatchStopHandle } from 'vue';
import _ from 'lodash';

export const useRoomStore = defineStore('room', () => {
    const appStore = useAppStore();
    const { app, waitSocketConnected } = appStore;
    let stopHandle: WatchStopHandle | undefined = undefined;

    const emitGetRoomEvent = () => {
        app.lobbySocket?.emit('get-room', {
            type: 'get-room',
            data: {
                roomId: app.status?.roomId!,
            },
        });
    }

    const playerJoinedRoomListener = () => {
        emitGetRoomEvent();
    }

    const playerReadinessChangedListener = () => {
        emitGetRoomEvent();
    }

    const playerLeftRoomListener = (event: PlayerLeftRoom) => {
        const data = event.data;

        emitGetRoomEvent();

        if (data.playerId == app.status?.id) {
            navigateTo('/');
        }
    }

    const playerKickedListener = (event: PlayerKicked) => {
        const data = event.data;

        emitGetRoomEvent();

        if (data.playerId == app.status?.id) {
            navigateTo('/');
        }
    }

    const roomChangedHostListener = () => {
        emitGetRoomEvent();
    }

    const roomClosedListener = () => {
        navigateTo('/');
    }

    const roomStartedGameListener = () => {
        navigateTo('/game');
    }

    const roomEndedGameListener = () => {
        navigateTo('/room');
    }

    const getRoomResultListener = (event: GetRoomResult) => {
        state.room = event.data;
    }

    const init = async () => {
        await waitSocketConnected();

        stopHandle = watch(() => app.status?.roomId, (nRoomId, oRoomId) => {            
            if (nRoomId == oRoomId)
                return;

            if (oRoomId) {
                app.lobbySocket?.off('player-joined-room', playerJoinedRoomListener);
                app.lobbySocket?.off('player-readiness-changed', playerReadinessChangedListener);
                app.lobbySocket?.off('player-left-room', playerLeftRoomListener);
                app.lobbySocket?.off('player-kicked', playerKickedListener);
                app.lobbySocket?.off('room-changed-host', roomChangedHostListener);
                app.lobbySocket?.off('room-closed', roomClosedListener);
                app.lobbySocket?.off('room-started-game', roomStartedGameListener);
                app.lobbySocket?.off('room-ended-game', roomEndedGameListener);
                app.lobbySocket?.off('get-room-result', getRoomResultListener);
            }

            if (nRoomId) {
                app.lobbySocket?.on('player-joined-room', playerJoinedRoomListener);
                app.lobbySocket?.on('player-readiness-changed', playerReadinessChangedListener);
                app.lobbySocket?.on('player-left-room', playerLeftRoomListener);
                app.lobbySocket?.on('player-kicked', playerKickedListener);
                app.lobbySocket?.on('room-changed-host', roomChangedHostListener);
                app.lobbySocket?.on('room-closed', roomClosedListener);
                app.lobbySocket?.on('room-started-game', roomStartedGameListener);
                app.lobbySocket?.on('room-ended-game', roomEndedGameListener);
                app.lobbySocket?.on('get-room-result', getRoomResultListener);
                
                app.lobbySocket?.emit('get-room', {
                    type: 'get-room',
                    data: {
                        roomId: nRoomId,
                    },
                });
            }
        }, { deep: true, immediate: true });
    }

    const prepare = async () => {
        await waitSocketConnected();

        const player = _.find(state.room?.players, (player) => player.id == app.status?.id);

        if (player?.id == state.room?.host.id)
            return;

        app.lobbySocket?.emit('change-readiness', {
            type: 'change-readiness',
            data: {
                roomId: app.status?.roomId!,
                isReady: !player?.isReady,
            },
        });
    }

    const leave = async () => {
        await waitSocketConnected();
        

        if (!app.status?.roomId)
            return;

        app.lobbySocket?.emit('leave-room', {
            type: 'leave-room',
            data: {
                roomId: app.status?.roomId!,
            },
        });
    }

    const kick = async (playerId: string) => {
        await waitSocketConnected();

        app.lobbySocket?.emit('kick-player', {
            type: 'kick-player',
            data: {
                playerId: playerId,
                roomId: app.status?.roomId!,
            },
        });
    }

    const start = async () => {
        await waitSocketConnected();

        const player = _.find(state.room?.players, (player) => player.id == app.status?.id);

        if (player?.id != state.room?.host.id)
            return;

        app.lobbySocket?.emit('start-game', {
            type: 'start-game',
            data: {
                roomId: state.room?.id!,
            },
        });
    }

    const dispose = () => {
        if (stopHandle) {
            stopHandle();
            stopHandle = undefined;
        }

        app.lobbySocket?.off('player-joined-room', playerJoinedRoomListener);
        app.lobbySocket?.off('player-readiness-changed', playerReadinessChangedListener);
        app.lobbySocket?.off('player-left-room', playerLeftRoomListener);
        app.lobbySocket?.off('player-kicked', playerKickedListener);
        app.lobbySocket?.off('room-changed-host', roomChangedHostListener);
        app.lobbySocket?.off('room-closed', roomClosedListener);
        app.lobbySocket?.off('room-started-game', roomStartedGameListener);
        app.lobbySocket?.off('room-ended-game', roomEndedGameListener);
        app.lobbySocket?.off('get-room-result', getRoomResultListener);
    }

    const state = reactive<State>({});

	return { state, init, prepare, leave, kick, start, dispose }
});


interface State {
    room?: GetRoomResultEventSchema['data'],
}