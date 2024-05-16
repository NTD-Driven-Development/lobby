<template>
    <div class="absolute w-full h-full font-GenJyuuGothic">
        <div class="absolute bg-black/30 z-50" :class="{ 'w-full h-full md:w-0 md:h-0': isMenuOpen }"
        @click.stop="isMenuOpen = false"></div>
        <div class="absolute flex flex-col h-full top-0 z-50 shadow overflow-hidden transition-all ease-in-out duration-700 bg-gray-200 bg-contain" 
        :class="isMenuOpen?'w-60' : 'w-0 md:w-60'">
            <div class="h-12 min-h-[48px] relative transition-all ease-in-out duration-500 bg-blue-800">
                <!-- LOGO -->
                <NuxtLink @click="isMenuOpen = false">
                    <img src="~/public/favicon.ico" alt="logo" class="absolute -translate-y-1/2 top-1/2 -translate-x-1/2 left-1/2 h-3/5"/>
                </NuxtLink>
                <!-- 關閉 -->
                <Icon icon="ic:round-close" class="absolute right-2.5 top-2.5 w-7 h-7 text-white cursor-pointer md:invisible" @click="isMenuOpen = false"/>
            </div>
            <div class="flex h-24 min-w-[240px] p-4 transition-all ease-in-out duration-500 bg-blue-800">
                <NuxtLink class="aspect-square h-full" @click="isMenuOpen = false">
                    <img src="~/assets/images/avast.jpeg" class="w-full h-full rounded-full object-cover bg-white overflow-hidden"/>
                </NuxtLink>
                <div class="text-white flex flex-1 flex-col overflow-hidden px-4 py-2">
                    <div>{{ 'Nacke' }}</div>
                </div>
            </div>
            <div class="w-auto h-full overflow-auto">
                <div class="flex h-16 w-full min-w-[200px] py-3.5 px-3 bg-white items-center"
                @click="">
                    <div class="flex justify-center items-center aspect-square h-full rounded-full">
                        <Icon icon="material-symbols:edit" class="w-6 h-6"/>
                    </div>
                    <div class="px-4">編輯資料</div>
                </div>
                <div class="flex h-16 w-full min-w-[200px] py-3.5 px-3 bg-white items-center"
                @click="">
                    <div class="flex justify-center items-center aspect-square h-full rounded-full">
                        <Icon icon="fluent-mdl2:contact-list" class="w-6 h-6"/>
                    </div>
                    <div class="px-4">好友</div>
                </div>
                <div class="flex h-16 w-full min-w-[200px] py-3.5 px-3 bg-white items-center"
                v-clipboard="{ key: 'share', copy: () => console.log(share) }"
                v-clipboard:success="{ key: 'share', do: () => $toast.add({ severity: 'info', detail: '平台連結已複製', life: 1000 }) }">
                    <div class="flex justify-center items-center aspect-square h-full rounded-full">
                        <Icon icon="material-symbols:share" class="w-6 h-6"/>
                    </div>
                    <div class="px-4">分享平台</div>
                </div>
                <div class="flex h-16 w-full min-w-[200px] py-3.5 px-3 bg-white items-center"
                @click="() => logout()" v-if="isAuthenticated">
                    <div class="flex justify-center items-center aspect-square h-full rounded-full">
                        <Icon icon="ic:outline-logout" class="w-6 h-6"/>
                    </div>
                    <div class="px-4">登出</div>
                </div>
                <div class="flex h-16 w-full min-w-[200px] py-3.5 px-3 bg-white items-center"
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
        <main class="h-[calc(100%-48px)] md:ml-60 md:h-full overflow-auto transition-all ease-in-out duration-700 bg-white" id="main">
            <slot />
        </main>
        <Toast position="bottom-center" :pt="{
			root: 'w-80 rounded-md',
			content: 'flex p-2 items-start lg:p-3',
		}">
            <template #message="slotProps">
                <div class="flex flex-1 flex-col items-start">
                    <div class="text-sm my-2 text-surface-900 dark:text-surface-0">{{ slotProps.message.detail }}</div>
                </div>
            </template>
        </Toast>
    </div>
</template>

<script setup lang="ts">
    import { Icon } from '@iconify/vue';

    const authStore = useAuthStore();
    const { auth, isAuthenticated } = storeToRefs(authStore);
    const isMenuOpen = ref(false);

    const share = computed(() => window.location.origin);

    const login = async () => {
        authStore.login();
    }

    const logout = async () => {
        authStore.logout();
    };
</script>