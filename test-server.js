import { createServer } from 'vite'

async function start() {
    try {
        const server = await createServer({
            server: {
                port: 5173,
                host: true
            }
        })
        await server.listen()
        console.log('Server started on port 5173')
        server.printUrls()
    } catch (e) {
        console.error('Error starting server:', e)
    }
}

start()
