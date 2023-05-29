import express from "express";
import {Server} from "http";
import * as socketio from "socket.io";
import {User, users, notifyAllUsers} from "./User";
import {getID, setIO, io, VERSION} from "./globals";
import {bindGameListeners} from "./socketListeners/gameListeners";
import {bindUserListeners} from "./socketListeners/userListeners";


const PORT = 3420;
const CONNECTIONSLIMIT = 300;


const Express = express;
const Http = new Server(Express);
setIO(new socketio.Server(Http, {
    cors: {
        origin: '*'
    }
}));
io.on("connection", socket => {
    const id = getID();
    if (users.length >= CONNECTIONSLIMIT) {
        socket.emit('err', {message: 'Maximale Verbindungsanzahl erreicht'})
        socket.disconnect()
        console.log('Disconnected...')
        return;
    }
    users.push(new User(id, socket));
    notifyAllUsers();
    console.log(`user ${id} connected`);
    console.log(`${users.length} users connected`);

    socket.emit("info", {
        id,
        version: VERSION,
        usersnumber: users.length
    });


    bindGameListeners(socket, id);
    bindUserListeners(socket, id);
});

io.on("connect_error", (err) => {
  console.log(`connect_error due to ${err.message}`);
});

Http.listen(PORT, () => {
    console.log(`Listening at :${PORT}...`);
});
