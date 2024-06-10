<template>
    <NuxtLayout name="dashboard">
        <div class="flex flex-col h-full gap-3 p-3 md:p-6">
            <div class="flex shrink-0 gap-2 overflow-auto" v-if="state.games">
                <div v-for="game in state.games" class="relative flex items-center justify-center min-w-[120px] max-w-[120px] min-h-[48px] max-h-[48px] text-sm border rounded cursor-pointer whitespace-prewrap"
                :class="{ ' bg-gray-50/30 border-gray-400': game.id == state.currentGame?.id, 'bg-white': game.id != state.currentGame?.id }"
                @click="state.currentGame = game">
                    <span>{{ game.name }}</span>
                    <div class="absolute"></div>
                </div>
            </div>
            <div class="flex shrink-0 justify-around gap-2">
                <InputText placeholder="搜尋房間" v-model="state.search" class="w-full text-sm"></InputText>
                <Button label="建立房間" @click="state.createRoomDialog.show = true" class="shrink-0 text-sm"></Button>
            </div>
            <div class="grid flex-1 grid-cols-[repeat(auto-fill,_minmax(300px,_1fr))] auto-rows-min gap-2" v-if="state.rooms">
                <div v-for="room in state.rooms" class="flex flex-col border p-3 gap-3 cursor-pointer rounded-lg text-sm"
                @click="onRoomClick(room)">
                    <div class="flex flex-col gap-1.5">
                        <div>
                            <span>房間名稱：</span>
                            <span>{{ room.name }}</span>
                        </div>
                        <div>
                            <span>遊戲名稱：</span>
                            <span>{{ room.game.name }}</span>
                        </div>
                        <div class="flex justify-between">
                            <div>
                                <span>人數：</span>
                                <span>{{ `${room.currentPlayers}/${room.maxPlayers}` }}</span>
                            </div>
                            <div class="text-red-500" v-if="room.isLocked">需要密碼</div>
                        </div>
                    </div>
                </div>
            </div>
            <Dialog v-model:visible="state.createRoomDialog.show" modal header="建立房間" class="min-w-[300px]">
                <template class="flex flex-col">
                    <Fieldset legend="遊戲資訊" class="text-sm">
                        <span class="p-text-secondary block">遊戲名稱：{{ state.currentGame?.name }}</span>
                        <span class="p-text-secondary block">最小人數：{{ state.currentGame?.minPlayers }}</span>
                        <span class="p-text-secondary block">最大人數：{{ state.currentGame?.maxPlayers }}</span>
                    </Fieldset>
                    <div class="flex flex-1 flex-col overflow-hidden">
                        <div class="flex items-center text-xs gap-0.5 p-1.5 md:text-sm md:p-2">
                            <span class="text-gray-500">房間名稱</span>
                            <span class="text-red-500">*</span>
                        </div>
                        <InputText v-model="state.createRoomDialog.form.name" class="text-sm grow basis-0 min-w-0 md:text-base"/>
                    </div>
                    <div class="flex flex-1 flex-col overflow-hidden">
                        <div class="flex items-center text-xs gap-0.5 p-1.5 md:text-sm md:p-2">
                            <span class="text-gray-500">最小人數</span>
                            <span class="text-red-500">*</span>
                        </div>
                        <InputText v-model="state.createRoomDialog.form.minPlayers" class="text-sm grow basis-0 min-w-0 md:text-base"/>
                    </div>
                    <div class="flex flex-1 flex-col overflow-hidden">
                        <div class="flex items-center text-xs gap-0.5 p-1.5 md:text-sm md:p-2">
                            <span class="text-gray-500">最大人數</span>
                            <span class="text-red-500">*</span>
                        </div>
                        <InputText v-model="state.createRoomDialog.form.maxPlayers" class="text-sm grow basis-0 min-w-0 md:text-base"/>
                    </div>
                    <div class="flex flex-1 flex-col overflow-hidden">
                        <div class="flex items-center text-xs gap-0.5 p-1.5 md:text-sm md:p-2">
                            <span class="text-gray-500">房間密碼</span>
                        </div>
                        <InputText v-model="state.createRoomDialog.form.password" type="password" class="text-sm grow basis-0 min-w-0 md:text-base"/>
                    </div>
                    <div class="flex justify-end gap-2 mt-4">
                        <Button type="button" label="取消" severity="secondary" @click="state.createRoomDialog.show = false"></Button>
                        <Button type="button" label="建立" @click="state.createRoomDialog.submit"></Button>
                    </div>
                </template>
            </Dialog>
            <Dialog v-model:visible="state.joinLockedRoomDialog.show" modal header="加入房間" class="min-w-[300px]">
                <template class="flex flex-col">
                    <div class="flex flex-1 flex-col overflow-hidden">
                        <div class="flex items-center text-xs gap-0.5 p-1.5 md:text-sm md:p-2">
                            <span class="text-gray-500">房間密碼</span>
                            <span class="text-red-500">*</span>
                        </div>
                        <InputText v-model="state.joinLockedRoomDialog.form.password" type="password" class="text-sm grow basis-0 min-w-0 md:text-base"/>
                    </div>
                    <div class="flex justify-end gap-2 mt-4">
                        <Button type="button" label="取消" severity="secondary" @click="state.joinLockedRoomDialog.show = false"></Button>
                        <Button type="button" label="加入" @click="state.joinLockedRoomDialog.submit"></Button>
                    </div>
                </template>
            </Dialog>
        </div>
    </NuxtLayout>
</template>

<script setup lang="ts">
    const appStore = useAppStore();
    const { app } = appStore;
    const indexStore = useIndexStore();
    const { state, init, join } = indexStore;

    onMounted(() => {
        init();
    });

    const onRoomClick = (room: GetRoomResultSchema) => {
        if (room.id == app.status?.roomId) {
            navigateTo('/room');
        }
        else if (room.isLocked) {
            state.joinLockedRoomDialog.form.roomId = room.id;
            state.joinLockedRoomDialog.show = true;
        }
        else {
            join({ roomId: room.id });
        }
    }
</script>