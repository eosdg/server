const PORT = 3420;
const VERSION = "0.1.0";
const Express = require("express")();
const Http = require("http").Server(Express);
const io = require("socket.io")(Http, {
    cors: {
        origin: '*'
    }
});


const helo = {
    version: VERSION
}

function getID(length = 16) {
    return '_' + Math.random().toString(36).substr(2, length);
}


io.on("connection", socket => {
    const id = getID();
    console.log(`user ${id} connected`);
    socket.emit("helo", {
        id,
        ...helo
    });

    socket.on("joinGame", data => {

    });
    socket.on('disconnect', () => {
        console.log(`user ${id} disconnected`);
    });
});

Http.listen(PORT, () => {
    console.log(`Listening at :${PORT}...`);
});
