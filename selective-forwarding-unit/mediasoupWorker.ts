import { createWorker }  from 'mediasoup'
import { logger } from "./logger";

export const createAndConfigureWorker = async () => {
    const worker = await createWorker()
    worker.on('died', () => {
        logger.error('mediasoup worker died')
        setTimeout(() => process.exit(1), 2000)
    })
    return worker
}