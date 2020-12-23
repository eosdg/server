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
