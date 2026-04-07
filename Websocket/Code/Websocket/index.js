// On met des accolades quand on importe une partie d'un module / d'une biblioth_que
// On ne met pas d'accolades quand on importe le module / la bibliothèque lui-même / elle-même

const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const { availableParallelism } = require('node:os');
const cluster = require('node:cluster');
const { createAdapter, setupPrimary } = require('@socket.io/cluster-adapter');

if (cluster.isPrimary) {
    const numCPUs = availableParallelism();
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork({
        PORT: 3000 + i
        });
    }

    return setupPrimary();
}

async function main() {
    // Open database file
    const db = await open({
        filename: 'chat.db',
        driver: sqlite3.Database
    });

    // Create our 'message' table (we ignore the 'client_offset' column for now)
    await db.exec(`
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            client_offset TEXT UNIQUE,
            content TEXT
        );
    `);

    const app = express();
    const server = createServer(app);
    const io = new Server(server, {
        connectionStateRecovery: {},
        adapter: createAdapter()
    });

    app.get('/', (req, res) => {
        res.sendFile(join(__dirname, 'index.html'));
    });

    // Colors: https://www.geeksforgeeks.org/javascript/how-to-add-colors-to-javascript-console-outputs/
    // Colors list: https://en.wikipedia.org/wiki/ANSI_escape_code#3-bit_and_4-bit
    // (On change le chiffre (FG) au milieu des autres caractères de la magie)

    io.on('connection', async (socket) => {
        console.log('\x1b[36m%s\x1b[0m', '[INFO] Someone connected.');

        socket.on('disconnect', () => {
            console.log('\x1b[93m%s\x1b[0m', '[WARN] Someone disconnected, ignore warning if preceded by manual disconnection info.');
        });


        socket.on('chat message', async (msg, clientOffset, callback) => {
            let result;
            try {
                // Stores messages in database
                result = await db.run('INSERT INTO messages (content, client_offset) VALUES (?, ?)', msg, clientOffset);
            } catch (e) {
                if (e.errno === 19 /* SQLITE_CONSTRAINT */) {
                    // the message was already inserted, so we notify the client
                    callback();
                } else {
                    // nothing to do, just let the client retry (blank = no info so client retries and we don't crash I assume)
                }
                return;
            }

            // Include offset with the message so we no longer get it directly but ask the DB I guess?
            io.emit('chat message', msg, result.lastID);
            //acknowledge the event
            callback();

            console.log('\x1b[32m%s\x1b[0m', '[CHAT] ' + msg);
        });


        if (!socket.recovered) {
            // if the connection stare recovery was not successful
            try {
                await db.each('SELECT id, content FROM messages WHERE id > ?',
                    [socket.handshake.auth.serverOffset || 0],
                    (_err, row) => {
                        socket.emit('chat message', row.content, row.id);
                    }
                )
            } catch (e) {
                // something went wrong
            }
        }


        socket.on('manual disconnect', () => {
        console.log('\x1b[91m%s\x1b[3m', '[CRIT] Unsolved bug will be executed next line! Bug will be italised. Read next log with caution.');
            console.log('\x1b[36m%s\x1b[0m', '[INFO] Manual disconnection started.');
        });

        // This is haunting the program and appearing at every connexion
        // The reconnexion also broke because you can't send messages after using the button
        // Cela ne viens pas du nombre de coeur, c'était déjà cassé avant..
        socket.on('manual connect', () => {
        console.log('\x1b[91m%s\x1b[3m', '[CRIT] Unsolved bug will be executed next line! Bug will be italised. Read next log with caution.');
            console.log('\x1b[36m%s\x1b[0m', '[INFO] Manual connection ended.');
        });
    });


    // We can bold this, but how?
    // Adding the bold with 1m instead of 0m at the end only bolds the next message. Which is useful for above but not for below.

    const port = process.env.PORT;

    server.listen(port, () => {
        console.log('\x1b[95m%s\x1b[0m', `[BOOT] Server running at http://localhost:${port} .`);
    });
}

main();