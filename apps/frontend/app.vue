<template>
	<div>
		<NuxtPage></NuxtPage>
		<Toast group="invitation" :pt="{
			root: 'w-80 rounded-md',
			content: 'flex p-2 items-start lg:p-3',
		}">
			<template #message="slotProps">
                <div class="flex flex-1 flex-col items-start">
                    <div class="flex items-center gap-2">
                        <Avatar image="https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png" shape="circle"/>
                        <span class="font-bold text-surface-900 dark:text-surface-0">王小明</span>
                    </div>
                    <div class="text-sm my-2 text-surface-900 dark:text-surface-0">{{ slotProps.message.detail }}</div>
					<div class="flex w-full gap-2">
						<div class="text-sm cursor-pointer">加入</div>
						<div class="text-sm cursor-pointer">拒絕</div>
					</div>
                </div>
            </template>
		</Toast>
	</div>
</template>

<script setup lang="ts">
	const toast = useToast();

	const showInvitation = () => {
		toast.add({ severity: 'info', summary: '房間邀請', detail: '來和我一起玩大老二吧！', group: 'invitation' });
	}

	onMounted(() => {
	// setInterval(() => {
		showInvitation();
	// }, 2000);
	});
</script>