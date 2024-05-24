import { io } from 'socket.io-client';
import type { Client } from '@packages/socket';

export const useAppStore = defineStore('app', () => {
    const authStore = useAuthStore();
	const { auth, isAuthenticated } = storeToRefs(authStore);

    const lobbySocket = ref<Client>();
    
    watch(() => isAuthenticated.value, async (n) => {
		if (!n) {
			lobbySocket.value?.disconnect();
			return;
		}

		const token = await auth.value?.getIdTokenClaims();

		const s: Client = io('localhost:3001', {
			reconnectionDelayMax: 0,
			reconnectionDelay: 0,
			forceNew: true,
			transports: ['websocket'],
			auth: {
				token: `Bearer ${token?.__raw}`,
			}
		});

		lobbySocket.value = s;
	}, { deep: true });

	const waitSocketConnected = () => new Promise((r) => {
		if (lobbySocket.value?.connected)
			r(true);

		const stopHandle = watch(() => lobbySocket.value, (socket) => {
			if (!socket?.connected)
				return;

			stopHandle && stopHandle();
			r(true);
		}, { deep: true });
	});

	return { lobbySocket, waitSocketConnected };
});