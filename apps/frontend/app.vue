<template>
	<div>
		<NuxtPage></NuxtPage>
		<Toast position="bottom-center" group="app"></Toast>
	</div>
</template>

<script setup lang="ts">
	const appStore = useAppStore();
	const { app, waitSocketConnected } = appStore;
	const toast = useToast();

	onMounted(async () => {
        await waitSocketConnected();

        app.lobbySocket?.on('validation-error', (event) => {
			toast.add({ group: 'app', severity: 'error', summary: '錯誤', detail: event, life: 1500 });
        });
    });
</script>