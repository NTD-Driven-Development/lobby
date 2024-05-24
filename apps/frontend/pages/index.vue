<template>
    <NuxtLayout name="dashboard">
        <div class="flex flex-col h-full">
            <div class="flex p-2 gap-2 bg-gray-50 overflow-auto">
                <div v-for="i in 3" class="px-10 py-4 border whitespace-nowrap">{{ `遊戲${i}` }}</div>
            </div>
            <div class="flex justify-around p-2 gap-2 bg-gray-100">
                <InputText placeholder="搜尋房間" class="w-[70%]"></InputText>
                <Button label="建立房間"></Button>
            </div>
            <div class="grid flex-1 grid-cols-2 gap-2 p-2 bg-gray-50">
                <div v-for="r in 20" class=" bg-gray-200">{{ r }}</div>
            </div>
        </div>
    </NuxtLayout>
</template>