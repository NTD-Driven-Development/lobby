// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    devtools: { enabled: true },
	css: ['~/assets/css/main.css'],
    postcss: {
		plugins: {
			tailwindcss: {},
			autoprefixer: {},
		},
    },
	ssr: false,
	modules: [
        'nuxt-primevue',
		'@pinia/nuxt',
    ],
	primevue: {
        options: {
			unstyled: true,
        },
		importPT: { from: '~/presets/' },
    },
})
