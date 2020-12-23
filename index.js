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
let games = {};
let usernames = {}


function notifyAllUsers() {
    io.emit("info", {
            version: VERSION,
            usersnumber: users.length
        })
}

function leaveGameAndCleanUp(id, gameID) {
    games[gameID].participants = games[gameID].participants.filter(item => item !== id);
    if (games[gameID].participants.length === 0) {
        delete games[gameID]
    }
}

function disconnectUser(id) {
    users = users.filter(user => user.id !== id);
    delete usernames[id];
    notifyAllUsers();
    for (const key of Object.keys(games)) {
        leaveGameAndCleanUp(id, key);
    }
}

function getID(length = 16) {
    return Math.random().toString(36).substr(2, length);
}

function deliverToGameparticipants(gameID, title, data) {
    const participants = games[gameID].participants;
    for (const participant of participants) {
        users.filter(user => user.id === participant)[0].socket.emit(title, data);
    }
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
        console.log("User " + id + " wants to join game " + data);
        if (games[data]) {
            socket.emit("joinGame", {succ: true, id: data});
        } else {
            socket.emit("joinGame", {succ: false, message: "Spiel exisitiert nicht!"});
        }
    });
    socket.on("createGame", () => {
        console.log("User "+id+" wants to create game")
        let gameID = getID(4);
        while (games[gameID]) {
            gameID = getID(4);
        }
        games[gameID] = {
            id: gameID,
            host: id,
            participants: [id],
            state: "lobby"
        }
        socket.emit("createdGame", gameID);
    });

    socket.on('enterGame', gameID=> {
        if(games[gameID]?.participants.indexOf(id)<0) games[gameID]?.participants.push(id);
        deliverToGameparticipants(gameID, "participantsChanged", games[gameID]?.participants.map(user => usernames[user]|| "Unbekannt"));
    });

    socket.on("amIHost", gameID => {
        socket.emit("amIHost", games[gameID]?.host === id);
    });

    socket.on("username", name => usernames[id] = name);

    socket.on('disconnect', () => {
        disconnectUser(id);
        console.log(`user ${id} disconnected`);
        console.log(`${users.length} users connected`);
    });
});

Http.listen(PORT, () => {
    console.log(`Listening at :${PORT}...`);
});
