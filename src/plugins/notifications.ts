import { push } from 'notivue'

export const notifications = {
    success: (message: string) => push.success({ message, duration: 2000 }),
    error: (message: string) => push.error({ message, duration: 2000 }),
    warning: (message: string) => push.warning({ message, duration: 2000 }),
    info: (message: string) => push.info({ message, duration: 2000 })
}