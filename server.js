const socket = new WebSocket("ws://localhost:8080");



socket.addEventListener("open", (event) => {
    socket.send("Hello Server!");
})

socket.addEventListener("message", (event) => {   
    socket.send("message from srv", event.data);
}




