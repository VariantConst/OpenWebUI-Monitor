import { ensureTablesExist } from '../lib/db/client'

async function init() {
    try {
        await ensureTablesExist()
        console.log('Database initialized successfully')
    } catch (error) {
        console.error('Database initialization failed:', error)
        process.exit(1)
    }
}

init()
