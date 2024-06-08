<template>
    <div class="absolute w-full h-full">
        <iframe width="100%" height="100%" :src="src"></iframe>
    </div>
</template>

<script setup lang="ts">
    const appStore = useAppStore();
    const { app, waitSocketConnected } = appStore;

    const src = ref();

    onMounted(async () => {
        await waitSocketConnected();

        app.lobbySocket?.on('get-room-result', (event) => {
            src.value = `${event.data.gameUrl}&playerId=${app.status?.id}`;
        });
        
        app.lobbySocket?.emit('get-room', {
            type: 'get-room',
            data: {
                roomId: app.status?.roomId!,
            },
        });
    });
</script>