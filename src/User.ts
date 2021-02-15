import {Socket} from "socket.io"
import {games} from "./Game";

import {io, VERSION} from "./globals"

export class User {
    private readonly _id: string;
    private _username: string;
    private readonly _socket: Socket;


    constructor(id: string, socket: Socket) {
        this._id = id;
        this._socket = socket;
        socket.emit("sendUsername");
    }


    get id(): string {
        return this._id;
    }

    get username(): string {
        if (!this._username) {
            this._socket.emit("sendUsername");
            return "Unbekannt";
        }
        return this._username;
    }

    set username(value: string) {
        this._username = value;
    }

    get socket(): Socket {
        return this._socket;
    }

    static getUser(id: string): User {
        return users.filter(u => u.id === id)[0];
    }

    static remove(id: string): void {
        users = users.filter(u => u.id !== id);
    }

    static disconnectUser(id: string): void {
        User.remove(id);
        notifyAllUsers();
        for (const key of Object.keys(games)) {
            games[key].leaveGameAndCleanUp(id);
        }
    }
}

export let users: Array<User> = [];

export function mapUserToUsername(id: string): string {
    return User.getUser(id).username;
}

export function notifyAllUsers(): void {
    io.emit("info", {
        version: VERSION,
        usersnumber: users.length
    })
}


