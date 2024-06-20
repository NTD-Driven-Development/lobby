<template>
    <NuxtLayout name="dashboard">
        <div class="h-full p-3 md:p-6">
            <div class="flex w-full gap-2 md:gap-4 overflow-hidden">
                <div class="flex flex-1 flex-col overflow-hidden">
                    <div class="flex items-center text-xs gap-0.5 p-1.5 md:text-sm md:p-2">
                        <span class="text-gray-500">遊戲名稱</span>
                        <span class="text-red-500">*</span>
                    </div>
                    <InputText v-model="state.form.name" class="text-sm grow basis-0 min-w-0 md:text-base"/>
                </div>
                <div class="flex flex-1 flex-col overflow-hidden">
                    <div class="flex items-center text-xs gap-0.5 p-1.5 md:text-sm md:p-2">
                        <span class="text-gray-500">遊戲敘述</span>
                        <span class="text-red-500">*</span>
                    </div>
                    <InputText v-model="state.form.description" class="text-sm grow basis-0 min-w-0 md:text-base"/>
                </div>
            </div>
            <div class="flex w-full gap-2 md:gap-4 overflow-hidden">
                <div class="flex flex-1 flex-col overflow-hidden">
                    <div class="flex items-center text-xs gap-0.5 p-1.5 md:text-sm md:p-2">
                        <span class="text-gray-500">遊戲規則</span>
                        <span class="text-red-500">*</span>
                    </div>
                    <InputText v-model="state.form.rule" class="text-sm grow basis-0 min-w-0 md:text-base"/>
                </div>
                <div class="flex flex-1 flex-col overflow-hidden">
                    <div class="flex items-center text-xs gap-0.5 p-1.5 md:text-sm md:p-2">
                        <span class="text-gray-500">圖片網址</span>
                        <span class="text-red-500">*</span>
                    </div>
                    <InputText v-model="state.form.imageUrl" class="text-sm grow basis-0 min-w-0 md:text-base"/>
                </div>
            </div>
            <div class="flex w-full gap-2 md:gap-4 overflow-hidden">
                <div class="flex flex-1 flex-col overflow-hidden">
                    <div class="flex items-center text-xs gap-0.5 p-1.5 md:text-sm md:p-2">
                        <span class="text-gray-500">最小人數</span>
                        <span class="text-red-500">*</span>
                    </div>
                    <InputText v-model="state.form.minPlayers" type="number" class="text-sm grow basis-0 min-w-0 md:text-base"/>
                </div>
                <div class="flex flex-1 flex-col overflow-hidden">
                    <div class="flex items-center text-xs gap-0.5 p-1.5 md:text-sm md:p-2">
                        <span class="text-gray-500">最大人數</span>
                        <span class="text-red-500">*</span>
                    </div>
                    <InputText v-model="state.form.maxPlayers" type="number" class="text-sm grow basis-0 min-w-0 md:text-base"/>
                </div>
            </div>
            <div class="flex w-full gap-2 md:gap-4 overflow-hidden">
                <div class="flex flex-1 flex-col overflow-hidden">
                    <div class="flex items-center text-xs gap-0.5 p-1.5 md:text-sm md:p-2">
                        <span class="text-gray-500">前端網址</span>
                        <span class="text-red-500">*</span>
                    </div>
                    <InputText v-model="state.form.frontendUrl" class="text-sm grow basis-0 min-w-0 md:text-base"/>
                </div>
                <div class="flex flex-1 flex-col overflow-hidden">
                    <div class="flex items-center text-xs gap-0.5 p-1.5 md:text-sm md:p-2">
                        <span class="text-gray-500">後端網址</span>
                        <span class="text-red-500">*</span>
                    </div>
                    <InputText v-model="state.form.backendUrl" class="text-sm grow basis-0 min-w-0 md:text-base"/>
                </div>
            </div>
            <div class="flex pt-4 md:pt-6">
                <Button label="送出" class="w-full text-sm" @click="submit"/>
            </div>
            <Toast position="bottom-center"></Toast>
        </div>
    </NuxtLayout>
</template>

<script setup lang="ts">
    const appStore = useAppStore();
    const { app, waitSocketConnected } = appStore;
    const registerStore = useRegisterStore();
    const { state, submit } = registerStore;
    const toast = useToast();

    onMounted(async () => {
        await waitSocketConnected();

        app.lobbySocket?.on('game-registered', gameRegisterListner);
    });

    onUnmounted(() => {
        app.lobbySocket?.off('game-registered', gameRegisterListner);
    });

    const gameRegisterListner = () => {
        toast.add({ severity: 'info', summary: '處理結果', detail: '遊戲註冊成功', life: 1500 });
    }
</script>