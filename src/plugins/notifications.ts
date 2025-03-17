import { push } from 'notivue'

export const notifications = {
    success: (message: string) => push.success(message),
    error: (message: string) => push.error(message),
    warning: (message: string) => push.warning(message),
    info: (message: string) => push.info(message),
}