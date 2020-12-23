import express from "express";

import {Server} from "http";

import {Server as SocketServer} from "socket.io";

const Express = express();
const Http = Server(Express);
const io = new SocketServer(Http, {
    cors: {
        origin: '*'
    }
});


const PORT = 3420;
const VERSION = "0.1.0";
let USERCOUNT = 0;

const helo = {
    version: VERSION,
    userCount: USERCOUNT
}

function getID(length = 16) {
    return '_' + Math.random().toString(36).substr(2, length);
}

io.on("connection", socket => {
    const id = getID();
    USERCOUNT++;
    console.log(`user ${id} connected`);
    console.log(`${USERCOUNT} users connected`);

    socket.emit("helo", {
        id,
        ...helo
    });

    socket.on("joinGame", data => {

    });
    socket.on('disconnect', () => {
        USERCOUNT--;
        console.log(`user ${id} disconnected`);
        console.log(`${USERCOUNT} users connected`);
    });
});

Http.listen(PORT, () => {
    console.log(`Listening at :${PORT}...`);
});
