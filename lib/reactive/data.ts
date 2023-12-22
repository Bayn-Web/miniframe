const propsToEffects: any = {}
const dirtyEffects: any = []
let queued = false
let currentEffect: Function | undefined = undefined;

/**
 * @description reative data, can refresh dom.
*/
const data: any = new Proxy(({} as any), {
    get(obj, prop) {
        onGet(prop)
        return obj[prop]
    },
    set(obj, prop, value) {
        obj[prop] = value
        onSet(prop)
        return true
    }
})

/**
 * @description get data
 * @param {string} prop
*/
function onGet(prop: any) {
    if (currentEffect) {
        const effects = propsToEffects[prop] ?? (propsToEffects[prop] = [])
        effects.push(currentEffect)
    }
}

/**
 * @description flush effects queue
*/
function flush() {
    while (dirtyEffects.length) {
        (dirtyEffects as Function[]).shift()!()
    }
}

/**
 * @description set data
 * @param {string} prop
*/
function onSet(prop: any) {
    if (propsToEffects[prop]) {
        dirtyEffects.push(...propsToEffects[prop])
        if (!queued) {
            queued = true
            queueMicrotask(() => {
                queued = false
                flush()
            })
        }
    }
}

/**
 * @description create effect
 * @param {Function} effect
*/
function createEffect(effect: Function) {
    currentEffect = effect
    effect()
    currentEffect = undefined
}

export {
    createEffect,
    data
}