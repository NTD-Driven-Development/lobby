import { defineStore } from 'pinia';
import { Auth0Client, createAuth0Client } from '@auth0/auth0-spa-js';

const AUTH0_CONFIG = {
    domain: 'identity-microservice-game-platform.jp.auth0.com',
    clientId: '2QurxAMuqttQELIUu3qrAGHmbRcRBehJ',
}

export const useAuthStore = defineStore('auth', () => {
    const auth = ref<Auth0Client | undefined>(undefined);
    const isInit = ref(false);
    const isAuthenticated = ref(false);

    const configure = async () => {
        auth.value = await createAuth0Client({
          domain: AUTH0_CONFIG.domain,
          clientId: AUTH0_CONFIG.clientId
        });
    };

    async function login() {
        try {
            await auth.value?.loginWithRedirect({
                openUrl: async (url) => {
                    isAuthenticated.value = true;
                    await useRouter().push('/');
                }
            });
        }
        catch (error) {
            throw error;
        }
    }
    
    async function logout(): Promise<void> {
        try {
            auth.value?.logout({
                openUrl: async (url) => {
                    isAuthenticated.value = false;
                    await useRouter().push('/');
                }
            });
        }
        catch (error) {
            throw error;
        }
    }

    configure()
    .then((v) => {
        isInit.value = true;
    });
    
    return { auth, isInit, isAuthenticated, login, logout };
});