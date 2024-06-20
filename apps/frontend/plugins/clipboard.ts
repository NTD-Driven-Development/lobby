export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.directive('clipboard', {
        mounted: (el, binding) => {
            if (binding.arg == 'success' && binding.value.key) {
                successMap.set(binding.value.key, binding.value.do);
            }
            if (binding.arg == undefined && binding.value.copy) {
                el.addEventListener('click', () => {
                    const tmpInput = document.createElement("textarea");
                    tmpInput.value = binding.value.copy();
                    tmpInput.style.top = "0";
                    tmpInput.style.left = "0";
                    tmpInput.style.position = "fixed";
                    document.body.appendChild(tmpInput);
                    tmpInput.focus();
                    tmpInput.select();
                    const result = document.execCommand('copy');
                    document.body.removeChild(tmpInput);
                    if (result && binding.value.key) successMap.get(binding.value.key)();
                });
            }
        }
    });
})

const successMap = new Map();