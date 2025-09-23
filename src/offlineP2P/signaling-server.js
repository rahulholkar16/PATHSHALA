import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

let peers = {};

io.on("connection", (socket) => {
    console.log("Peer Conected: ", socket.id);
    peers[socket.id] = socket;

    socket.on("offer", data => {
        if (peers[data.target]) peers[data.target].emit("offer", { sdp: data.sdp, sender: socket.id });
    });

    socket.on("answer", data => {
        if (peers[data.target]) peers[data.target].emit("answer", { sdp: data.sdp, sender: socket.id });
    });

    socket.on("ice-candidate", data => {
        if (peers[data.sender]) peers[data.sender].emit("ice-candidate", { candidate: data.candidate, sender: socket.id });
    });

    socket.on("disconnect", () => delete peers[socket.id]);
});

server.listen(4000, () => console.log("Signaling server running on port 4000"));