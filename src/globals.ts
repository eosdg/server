import {Server} from "socket.io";
import pjson from "../package.json"

export const VERSION = pjson.version;

export function getID(length = 16): string {
    return Math.random().toString(36).substr(2, length);
}

export let io;

export function setIO(io: Server): void {
    this.io = io;
}
