<template>
    <div class="absolute w-full h-full">
        <iframe width="100%" height="100%" :src="src"></iframe>
        <button class="absolute left-1/2 -translate-x-1/2 bottom-[80px] px-4 py-2 bg-red-500 text-white rounded"
        v-show="showLeave"
        @click="navigateTo('/room')">返回房間</button>
    </div>
</template>

<script setup lang="ts">
    const appStore = useAppStore();
    const { app, waitSocketConnected } = appStore;

    const src = ref();
    const showLeave = ref(false);

    onMounted(async () => {
        await waitSocketConnected();

        app.lobbySocket?.on('get-room-result', (event) => {
            src.value = `${event.data.gameUrl}&playerId=${app.status?.id}&playerName=${app.user?.name}`;
        });

        app.lobbySocket?.on('room-ended-game', () => {
            showLeave.value = true;
        });
        
        app.lobbySocket?.emit('get-room', {
            type: 'get-room',
            data: {
                roomId: app.status?.roomId!,
            },
        });
    });
</script>