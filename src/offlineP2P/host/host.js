const socket = io("http://192.168.29.1:4000"); // signaling server
let peerConnection;
let dataChannel;

socket.on("connect", () => {
    console.log("Connected to signaling server");
    socket.emit("host-ready");
});

socket.on("offer", async (offer) => {
    peerConnection = new RTCPeerConnection();

    // Data channel for sending
    dataChannel = peerConnection.createDataChannel("fileTransfer");
    dataChannel.onopen = () => console.log("Data channel ready (host)");

    await peerConnection.setRemoteDescription(offer);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    socket.emit("answer", answer);
});

document.getElementById("shareBtn").addEventListener("click", () => {
    const fileInput = document.getElementById("lectureFile");
    const file = fileInput.files[0];
    if (!file) return alert("Select a lecture first!");

    const chunkSize = 16 * 1024; // 16KB chunks
    let offset = 0;

    const reader = new FileReader();
    reader.onload = (e) => {
        sendChunk(e.target.result);
    };

    function sendChunk(chunk) {
        dataChannel.send(chunk);
        offset += chunk.byteLength;

        if (offset < file.size) {
            readSlice(offset);
        } else {
            dataChannel.send(JSON.stringify({ done: true, name: file.name }));
            console.log("File sent successfully");
        }
    }

    function readSlice(o) {
        const slice = file.slice(o, o + chunkSize);
        reader.readAsArrayBuffer(slice);
    }

    readSlice(0);
});
