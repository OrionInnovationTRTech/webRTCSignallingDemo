// Create a RTCPeerConnection object
const localConnection = new RTCPeerConnection();

// Create a data channel assigned to the localConnection object
const dataChannel = localConnection.createDataChannel('dataChannel');

//// Event listeners
// When data channel is open, log out a message indicating that the data channel is open
dataChannel.onopen = () => {
    console.log('dataChannel opened');
}

// When a message is received, log out the message
dataChannel.onmessage = event => {
    console.log("New Message: " + event.data);
}

// Create offer
localConnection.createOffer().then( offer => {
    // Set the offer as local description
    localConnection.setLocalDescription(offer);
}).then( a => {
    // Log out a message indicating that the offer is created
    console.log("Offer created!");
})

// Listen for ICE candidates and add them to the localConnection object
localConnection.onicecandidate = event => {
    console.log("New candidate! SDP updated: ");
    console.log(localConnection.localDescription);
}

// Get the answer offer and set it as remote description
function setAnswer(answer) {
    localConnection.setRemoteDescription(answer);
}

// Send a message via the data channel
function sendMessage(message) {
    dataChannel.send(message);
}

// For more detail, see README.md