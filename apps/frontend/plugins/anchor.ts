export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.directive('anchor', {
        mounted: (el, binding) => {
            el.addEventListener('click', () => {
                anchor(binding.value?.id, {
                    containerId: binding.value?.containerId,
                    duration: binding.value?.duration,
                    offset: binding.value?.offset,
                });
            });
        },
    });
    nuxtApp.hooks.hook('app:mounted', () => {
        window.addEventListener('wheel', () => {
            if (!cancelToken) cancelToken = true;
        });
        window.addEventListener('touchstart', () => {
            if (!cancelToken) cancelToken = true;
        });
    });
})

let cancelToken = false;

export const anchor = (elementId: string, options?: Options) => {
    if (!elementId)
        return;

    const element = document.getElementById(elementId);
    const offset = options?.offset ?? 0;
    const duration = options?.duration ?? 1000;
    const container = document.getElementById(options?.containerId ?? '') ?? document.documentElement;
    
    if (elementId == '_top') {
        scrollTo(container, 0 + offset, duration);
    }
    else if (elementId == '_bottom') {
        scrollTo(container, container.scrollHeight - container.clientHeight + offset, duration);
    }
    else if (element) {
        scrollTo(container, element.offsetTop - container.offsetTop + offset, duration);
    }
};

const scrollTo = (container: HTMLElement, position: number, duration: number) => {
    let currentPos = container.scrollTop;
    let start = 0;
    cancelToken = false;
    position = +position, duration = +duration;
    window.requestAnimationFrame(function step(currentTime) {
        start = !start ? currentTime : start;
        let progress = (currentTime - start) / duration;
        // console.log(((position - currentPos) * easeOut(progress)) + currentPos);
        // console.log(progress);
        // console.log(easeOut(progress));
        // console.log('------');
        //scroll
        if (currentPos < position) container.scrollTo(0, ((position - currentPos) * easeOut(progress)) + currentPos);
        else container.scrollTo(0, currentPos - ((currentPos - position) * easeOut(progress)));
        //check if is located the target.
        if (cancelToken) return;
        if (progress < 1 && easeOut(progress) < 0.999) window.requestAnimationFrame(step);
        else container.scrollTo(0, position);
    });
};

const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);

interface Options {
    containerId ?: string,
    duration ?: number,
    offset ?: number,
}