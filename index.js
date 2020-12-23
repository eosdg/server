import express from "express";

import {Server} from "http";

import {Server as SocketServer} from "socket.io";

import questions from "@eosdg/questions";


const Express = express();
const Http = Server(Express);
const io = new SocketServer(Http, {
    cors: {
        origin: '*'
    }
});

// eslint-disable-next-line no-undef
const VERSION = process.env.npm_package_version;
const PORT = 3420;
const CONNECTIONSLIMIT = 300;

let users = [];




function notifyAllUsers() {
    for (const user of users) {
        user.socket.emit("info", {
            id: user.id,
            version: VERSION,
            usersnumber: users.length
        })
    }
}

function disconnectUser(id) {
    users = users.filter(user => user.id !== id);
    notifyAllUsers();
}

function getID(length = 16) {
    return '_' + Math.random().toString(36).substr(2, length);
}

io.on("connection", socket => {
    const id = getID();
    if (users.length >= CONNECTIONSLIMIT) {
        socket.emit('err', { message: 'Maximale Verbindungsanzahl erreicht' })
        socket.disconnect()
        console.log('Disconnected...')
        return;
    }
    users.push({id, socket});
    notifyAllUsers();
    console.log(`user ${id} connected`);
    console.log(`${users.length} users connected`);

    socket.emit("info", {
        id,
        version: VERSION,
        usersnumber: users.length
    });

    socket.on("joinGame", data => {

    });
    socket.on('disconnect', () => {
        disconnectUser(id);
        console.log(`user ${id} disconnected`);
        console.log(`${users.length} users connected`);
    });
});

Http.listen(PORT, () => {
    console.log(`Listening at :${PORT}...`);
});
