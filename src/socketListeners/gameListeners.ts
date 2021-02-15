import {Game, games} from "../Game";
import questions from "@eosdg/questions";
import {mapUserToUsername, User} from "../User";
import {Socket} from "socket.io";
import {getID} from "../globals";


export function bindGameListeners(socket: Socket, id: string): void {

    socket.on("getGameData", gameID => {
        socket.emit("getGameData", games[gameID]);
    });

    socket.on("createGame", () => {
        console.log("User " + id + " wants to create game")
        let gameID = getID(4);
        while (games[gameID]) {
            gameID = getID(4);
        }

        games[gameID] = new Game(gameID, id, questions);
        //Object.keys(questions)
        socket.emit("createdGame", gameID);
    });

    //User is trying to join
    socket.on("joinGame", data => {
        console.log("User " + id + " wants to join game " + data);
        if (games[data]) {
            socket.emit("joinGame", {succ: true, id: data});
        } else {
            socket.emit("joinGame", {succ: false, message: "Spiel exisitiert nicht!"});
        }
    });
    //User actually joined
    socket.on('enterGame', (gameID: string) => {
        if (games[gameID]?.participants.indexOf(id) < 0) games[gameID]?.participants.push(id);
        games[gameID].deliverToGameparticipants("participantsChanged", games[gameID]?.participants.map(mapUserToUsername));
    });

    socket.on("amIHost", gameID => {
        socket.emit("amIHost", games[gameID]?.host === id);
    });

    socket.on("startGame", params => {
        const game = games[params.gameID];
        const firstQuestion = game.startGame(params.settings);
        game.deliverToGameparticipants("question", firstQuestion);
    });

    socket.on("nextQuestion", gameID => {
        games[gameID].deliverToGameparticipants("question", games[gameID].nextQuestion());
    });

    socket.on("answer", answer => {
        const res = games[answer.gameID].addAnswerAndReturnResults(answer.answer, User.getUser(id).username, id);
        if (res) {
            games[answer.gameID].deliverToGameparticipants("results", res);
        }
    });
    socket.on("leaveGame", (gameId) => games[gameId].leaveGameAndCleanUp(id))
}
