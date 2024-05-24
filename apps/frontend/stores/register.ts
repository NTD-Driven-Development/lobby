import { number, object, string } from 'yup';

export const useRegisterStore = defineStore('register', () => {
    const appStore = useAppStore();
    const { lobbySocket } = storeToRefs(appStore);

    const state = reactive<State>({
        form: {
        },
    });

    const submit = async () => {
        try {
            const data = schema.validateSync(state.form);
            state.form = {};

            lobbySocket.value?.emit('register-game', {
                type: 'register-game',
                data: {
                    name: data.name,
                    description: data.description,
                    rule: data.rule,
                    imageUrl: data.imageUrl,
                    maxPlayers: data.maxPlayers,
                    minPlayers: data.minPlayers,
                    frontendUrl: data.frontendUrl,
                    backendUrl: data.backendUrl,
                },
            });
        }
        catch (error) {
            console.log(error);
        }
    }

    return { state, submit };
});

const schema = object({
    name: string().required(),
    description: string().required(),
    rule: string().required(),
    minPlayers: number().required(),
    maxPlayers: number().required(),
    imageUrl: string().required(),
    frontendUrl: string().required(),
    backendUrl: string().required(),
});

interface Form {
    name?: string,
    description?: string,
    rule?: string,
    minPlayers?: string,
    maxPlayers?: string,
    imageUrl?: string,
    frontendUrl?: string,
    backendUrl?: string,
}

interface State {
    form: Form,
}