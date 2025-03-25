<template>
    <NuxtLayout name="dashboard">
        <div class="flex flex-col h-full p-6 gap-4">
            <div class="flex flex-col border text-sm p-2 gap-1 rounded-lg">
                <span class="p-text-secondary block">房間名稱：{{ state.room?.name }}</span>
                <span class="p-text-secondary block">遊戲名稱：{{ state.room?.game.name }}</span>
                <span class="p-text-secondary block">當前人數：{{ state.room?.players?.length }}</span>
                <span class="p-text-secondary block">遊戲規則：{{ state.room?.game.description }}</span>
            </div>
            <div class="grid flex-1 grid-cols-[repeat(auto-fill,_minmax(300px,_1fr))] auto-rows-min gap-2" v-if="state.room?.players">
                <div v-for="player in state.room?.players" class="flex flex-col border p-3 gap-3 rounded-lg">
                    <div class="flex flex-col gap-1">
                        <div class="flex items-center justify-between">
                            <div>
                                <span v-if="player.id == state.room?.host.id">(房主)</span>
                                <span>{{ player.name }}</span>
                            </div>
                            <div class="flex justify-end">
                                <span class="text-sm text-red-500" v-if="player.isReady">{{ '已就緒' }}</span>
                                <span class="text-sm text-gray-500" v-else>{{ '尚未準備' }}</span>
                            </div>
                        </div>
                        <div class="flex justify-end">
                            <div class="text-sm text-red-500 cursor-pointer"
                            :class="{ 'invisible': app.status?.id != state.room?.host.id || player.id == state.room?.host.id }"
                            @click="kick(player.id)">踢出</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="flex pt-4 md:pt-6 gap-2">
                <Button label="退出房間" severity="danger" class="w-full text-sm md:text-base" @click="leave"/>
                <Button label="開始遊戲" :disabled="_.some(state.room?.players, (v) => !v.isReady)" class="w-full text-sm md:text-base" @click="start" v-if="app.status?.id == state.room?.host.id"/>
                <Button :label="_.find(state.room?.players, (v) => v.id == app.status?.id)?.isReady ? '取消準備' : '準備'" class="w-full text-sm md:text-base" @click="prepare" v-else/>
            </div>
        </div>
    </NuxtLayout>
</template>

<script setup lang="ts">
    import _ from 'lodash-es';

    const appStore = useAppStore();
    const { app } = appStore;
    const roomStore = useRoomStore();
    const { state, init, prepare, leave, kick, start, dispose } = roomStore;

    onMounted(async () => {
        init();
    });

    onUnmounted(() => {
        dispose();
    });
</script>