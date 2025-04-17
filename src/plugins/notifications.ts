import { push } from 'notivue'

interface NotificationOptions {
    timeout: number;
}

export const notifications = {
    success: (message: string, options: NotificationOptions = { timeout: 5000 }) => push.success(message, options),
    error: (message: string, options: NotificationOptions = { timeout: 5000 }) => push.error(message, options),
    warning: (message: string, options: NotificationOptions = { timeout: 5000 }) => push.warning(message, options),
    info: (message: string, options: NotificationOptions = { timeout: 5000 }) => push.info(message, options)
}