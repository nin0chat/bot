import { psqlClient } from "./database";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pgIPC = require("pg-ipc");

export let ipc;

export function initIPC() {
    ipc = new pgIPC(psqlClient);
}
