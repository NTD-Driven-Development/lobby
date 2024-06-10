import { io } from 'socket.io-client';
import { Auth0Client, createAuth0Client, User } from '@auth0/auth0-spa-js';
import type { Client } from '@packages/socket';
import type { GetMyStatusResultSchema } from '@packages/domain';

const AUTH0_CONFIG = {
    domain: 'identity-microservice-game-platform.jp.auth0.com',
    clientId: '2QurxAMuqttQELIUu3qrAGHmbRcRBehJ',
}

export const useAppStore = defineStore('app', () => {
	const init = async () => {
        const router = useRouter();

        app.auth = await createAuth0Client({
          domain: AUTH0_CONFIG.domain,
          clientId: AUTH0_CONFIG.clientId
        });

        // 重新導向至大廳時會有 code & state 參數
        if (router.currentRoute.value.query.code && router.currentRoute.value.query.state) {
            const { code, state, ...query } = router.currentRoute.value.query;

            await app.auth?.handleRedirectCallback();

            router.replace({
                query: query,
            });
        }

        app.isAuthenticated = await app.auth?.isAuthenticated();
        app.user = await app.auth?.getUser();
    }

    const login = async () => {
        try {
            await app.auth?.loginWithRedirect({
                authorizationParams: {
                    redirect_uri: window.origin,
                }
            });
        }
        catch (error) {
            throw error;
        }
    }
    
    const logout = async () => {
        try {
            await app.auth?.logout({
                openUrl: async (url) => {
                    await useRouter().push('/');
                }
            });

			app.isAuthenticated = false;
            app.user = undefined;
        }
        catch (error) {
            throw error;
        }
    }

	const waitSocketConnected = () => new Promise((r) => {
		if (app.lobbySocket?.connected)
			r(true);

		const stopHandle = watch(() => app.lobbySocket, (socket) => {
			socket?.once('connect', () => {
				stopHandle && stopHandle();
				r(true);
			});
		});
	});

    const app = reactive<APP>({
		isAuthenticated: false,
	});

    watch(() => app.isAuthenticated, async (n) => {
		if (!n) {
			app.lobbySocket?.disconnect();
			return;
		}

		const token = await app.auth?.getIdTokenClaims();
        const config = useRuntimeConfig();

		const s: Client = io(config.public.BACKEND_URL, {
			reconnectionDelayMax: 0,
			reconnectionDelay: 0,
			forceNew: true,
			transports: ['websocket'],
			auth: {
				token: `Bearer ${token?.__raw}`,
			}
		});

        s?.on('get-my-status-result', (event) => {
            app.status = event.data;
        });

        // 首次取得Status
        s?.emit('get-my-status', {
            type: 'get-my-status',
            data: null,
        });

		app.lobbySocket = s;
	}, { deep: true });

    init();

	return { app, waitSocketConnected, login, logout }
});

interface APP {
    auth?: Auth0Client,
    user?: User,
    status?: GetMyStatusResultSchema,
    isAuthenticated?: boolean,
    lobbySocket?: Client,
}