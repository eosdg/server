import {mapUserToUsername, User, users} from "../User";
import {games} from "../Game";
import {Socket} from "socket.io";

export function bindUserListeners(socket: Socket, id: string): void {
    socket.on("username", name => {
        User.getUser(id).username = name;
        for (const gameID in games) {
            if (games[gameID].participants.includes(id)) {
                games[gameID].deliverToGameparticipants("participantsChanged", games[gameID]?.participants.map(mapUserToUsername));
            }
        }
    });

    socket.on('disconnect', () => {
        User.disconnectUser(id);
        console.log(`user ${id} disconnected`);
        console.log(`${users.length} users connected`);
    });
}
