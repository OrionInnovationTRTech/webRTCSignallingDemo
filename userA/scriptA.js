const localConnection = new RTCPeerConnection();

const dataChannel = localConnection.createDataChannel('dataChannel');

// Event listeners
dataChannel.onopen = () => {
    console.log('dataChannel opened');
}

dataChannel.onmessage = event => {
    console.log("New Message: " + event.data);
}

// Create offer
localConnection.createOffer().then( offer => {
    localConnection.setLocalDescription(offer);
}).then( a => {
    console.log("Offer created!");
})

localConnection.onicecandidate = event => {
    console.log("New candidate! SDP updated: ");
    console.log(localConnection.localDescription);
}

function setAnswer(answer) {
    localConnection.setRemoteDescription(answer);
}

function sendMessage(message) {
    dataChannel.send(message);
}