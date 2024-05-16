// import { useAuthStore } from '~/stores/auth';
// import axios, { AxiosError, AxiosRequestConfig } from 'axios';


export default defineNuxtPlugin(() => {
    // const { public: { csrfTokenKey } } = useRuntimeConfig();
	// axios.defaults.baseURL = useUrl({ subDomain: 'estate' } as any);

    // // 每次請求前帶上AccessToken及CsrfToken
    // axios.interceptors.request.use((config) => {
    //     config.headers.Authorization = useAuthStore().getAccessToken();
    //     config.headers[csrfTokenKey] = useCookie(csrfTokenKey).value;

    //     return config;
    // });

    // // 每次請求響應後 處理401請求
    // axios.interceptors.response.use((response) => response, async (error) => {
    //     const authStore = useAuthStore();
    //     const { transformResponse, ...originConfig } = error.config!;

    //     try {
    //         if (error.response && error.response.status == 401) {
    //             await authStore.refresh(); // 嘗試刷新token

    //             const config: AxiosRequestConfig = {
    //                 ...originConfig,
    //             };
                
    //             const response = await axios(config);
    //             return response;
    //         }
    //         else {
    //             throw error;
    //         }
    //     }
    //     catch (error) {
    //         if (error instanceof AxiosError) {
    //             if (error.response && error.response.status == 401) {
    //                 authStore.clearAccessToken();
    //             }

    //             throw error;
    //         }
    //         throw error;
    //     }
    // });
})