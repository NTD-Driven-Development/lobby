<template>
    <div class="absolute w-full h-full font-GenJyuuGothic">
        <div class="absolute bg-black/30 z-50" :class="{ 'w-full h-full md:w-0 md:h-0': isMenuOpen }"
        @click.stop="isMenuOpen = false"></div>
        <div class="absolute flex flex-col h-full top-0 z-50 shadow overflow-hidden transition-all ease-in-out duration-700 bg-gray-200 bg-contain" 
        :class="isMenuOpen?'w-60' : 'w-0 md:w-60'">
            <div class="flex flex-col items-center min-w-[240px] p-6 gap-4 transition-all ease-in-out duration-500 bg-blue-800">
                <NuxtLink class="aspect-square w-full max-w-[120px]" @click="isMenuOpen = false">
                    <img :src="app.user?.picture" class="w-full h-full rounded-full object-cover bg-white overflow-hidden" v-if="app?.user"/>
                    <img src="~/assets/images/avast.jpeg" class="w-full h-full rounded-full object-cover bg-white overflow-hidden" v-else/>
                </NuxtLink>
                <div class="text-white flex flex-1 flex-col overflow-hidden">
                    <div>{{ app?.user?.name ?? '訪客' }}</div>
                </div>
            </div>
            <div class="w-auto h-full overflow-auto">
                <div class="flex h-16 w-full min-w-[200px] py-3.5 px-3 items-center cursor-pointer"
                :class="$route.path == '/room' ? 'bg-blue-800/90 text-white' : 'bg-white'"
                @click="navigateTo('/room')"
                v-if="app.status?.roomId">
                    <div class="flex justify-center items-center aspect-square h-full rounded-full">
                        <Icon icon="ic:round-meeting-room" class="w-6 h-6"/>
                    </div>
                    <div class="px-4">當前房間</div>
                </div>
                <div class="flex h-16 w-full min-w-[200px] py-3.5 px-3 items-center cursor-pointer"
                :class="$route.path == '/' ? 'bg-blue-800/90 text-white' : 'bg-white'"
                @click="navigateTo('/')">
                    <div class="flex justify-center items-center aspect-square h-full rounded-full">
                        <Icon icon="solar:gamepad-broken" class="w-6 h-6"/>
                    </div>
                    <div class="px-4">房間列表</div>
                </div>
                <div class="flex h-16 w-full min-w-[200px] py-3.5 px-3 items-center cursor-pointer"
                :class="$route.path == '/register' ? 'bg-blue-800/90 text-white' : 'bg-white'"
                @click="navigateTo('/register')">
                    <div class="flex justify-center items-center aspect-square h-full rounded-full">
                        <Icon icon="mdi:link-plus" class="w-6 h-6"/>
                    </div>
                    <div class="px-4">註冊遊戲</div>
                </div>
                <div class="flex h-16 w-full min-w-[200px] py-3.5 px-3 bg-white items-center cursor-pointer"
                v-clipboard="{ key: 'share', copy: () => share }"
                v-clipboard:success="{ key: 'share', do: () => $toast.add({ severity: 'info', detail: '平台連結已複製', group:'shareLink', life: 1000 }) }">
                    <div class="flex justify-center items-center aspect-square h-full rounded-full">
                        <Icon icon="material-symbols:share" class="w-6 h-6"/>
                    </div>
                    <div class="px-4">分享平台</div>
                </div>
                <div class="flex h-16 w-full min-w-[200px] py-3.5 px-3 bg-white items-center cursor-pointer"
                @click="() => logout()" v-if="app?.isAuthenticated">
                    <div class="flex justify-center items-center aspect-square h-full rounded-full">
                        <Icon icon="ic:outline-logout" class="w-6 h-6"/>
                    </div>
                    <div class="px-4">登出</div>
                </div>
                <div class="flex h-16 w-full min-w-[200px] py-3.5 px-3 bg-white items-center cursor-pointer"
                @click="() => login()" v-else>
                    <div class="flex justify-center items-center aspect-square h-full rounded-full">
                        <Icon icon="ic:outline-logout" class="w-6 h-6"/>
                    </div>
                    <div class="px-4">快速登入</div>
                </div>
            </div>
        </div>
        <div class="bg-blue-800 h-12 md:hidden">
            <div class="relative flex justify-center items-center h-full aspect-square cursor-pointer transition-all ease-in-out md:hidden tap-hignlight-disable" @click="isMenuOpen = !isMenuOpen">
                <div class="w-5 h-[2.5px] bg-white transition-all ease-in-out
                    before:absolute before:w-5 before:h-[2.5px] before:bg-white before:transition-all before:ease-in-out before:-translate-y-[7px]
                    after:absolute after:w-5 after:h-[2.5px] after:bg-white after:transition-all after:ease-in-out after:translate-y-[7px]"
                    :class="isMenuOpen?'bg-transparent -translate-x-4 before:rotate-45 after:-rotate-45 before:translate-x-3.5 before:-translate-y-0 after:translate-x-3.5 after:translate-y-0':''">
                </div>
            </div>
        </div>
        <main class="relative h-[calc(100%-48px)] md:ml-60 md:h-full overflow-auto transition-all ease-in-out duration-700 bg-white" id="main">
    		<div class="absolute w-full h-full bg-gray-500/10 z-20" v-if="!isInteractive"></div>
            <slot v-if="app?.isAuthenticated"></slot>
            <span v-else class="flex items-center justify-center w-full h-full">請由選單快速登入</span>
        </main>
        <Toast position="bottom-center" group="shareLink" :pt="{
			root: 'w-80 rounded-md',
			content: 'flex p-2 items-start lg:p-3',
		}">
            <template #message="slotProps">
                <div class="flex flex-1 flex-col items-start">
                    <div class="text-sm my-2 text-surface-900 dark:text-surface-0">{{ slotProps.message.detail }}</div>
                </div>
            </template>
        </Toast>
		<Toast group="init" position="bottom-center"></Toast>
    </div>
</template>

<script setup lang="ts">
    import { Icon } from '@iconify/vue';

    const appStore = useAppStore();
    const { app, login, logout } = appStore;

	const toast = useToast();

    const isMenuOpen = ref(false);
	const isInteractive = ref(false);

    const share = computed(() => window.location.origin);

    watch(() => [app.lobbySocket, app.isAuthenticated], ([socket, isAuthenticated]) => {
		if (!socket && isAuthenticated) {
			isInteractive.value = false;
			toast.add({ severity: 'info', summary: '請稍後', detail:'與伺服器連線中', group: 'init' });
		}
		else {
			isInteractive.value = true;
			toast.removeGroup('init');
		}
	}, { immediate: true });
</script>