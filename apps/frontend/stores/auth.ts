import { Auth0Client, createAuth0Client, User } from '@auth0/auth0-spa-js';

const AUTH0_CONFIG = {
    domain: 'identity-microservice-game-platform.jp.auth0.com',
    clientId: '2QurxAMuqttQELIUu3qrAGHmbRcRBehJ',
}

export const useAuthStore = defineStore('auth', () => {
    const auth = ref<Auth0Client | undefined>(undefined);
    const user = ref<User | undefined>(undefined);
    const isAuthenticated = ref(false);

    const init = async () => {
        const router = useRouter();

        auth.value = await createAuth0Client({
          domain: AUTH0_CONFIG.domain,
          clientId: AUTH0_CONFIG.clientId
        });

        // 重新導向至大廳時會有code & state參數
        if (router.currentRoute.value.query.code && router.currentRoute.value.query.state) {
            const { code, state, ...query } = router.currentRoute.value.query;

            await auth.value?.handleRedirectCallback();

            router.replace({
                query: query,
            });
        }

        isAuthenticated.value = await auth.value?.isAuthenticated();
        user.value = await auth.value?.getUser();
    };

    const login = async () => {
        try {
            await auth.value?.loginWithRedirect({
                authorizationParams: {
                    redirect_uri: 'http://localhost:3000',
                }
            });
        }
        catch (error) {
            throw error;
        }
    }
    
    const logout = async () => {
        try {
            await auth.value?.logout({
                openUrl: async (url) => {
                    await useRouter().push('/');
                }
            });

            isAuthenticated.value = false;
            user.value = undefined;
        }
        catch (error) {
            throw error;
        }
    }

    init()

    return { auth, user, isAuthenticated, login, logout };
});