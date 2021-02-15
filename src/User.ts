import {Socket} from "socket.io"

export class User {
    private readonly _id: string;
    private _username: string;
    private readonly _socket: Socket;


    constructor(id: string, socket: Socket) {
        this._id = id;
        this._socket = socket;
    }


    get id(): string {
        return this._id;
    }

    get username(): string {
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
}

export let users: Array<User> = [];
