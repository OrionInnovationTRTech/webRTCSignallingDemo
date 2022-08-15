// Create a RTCPeerConnection object
const remoteConnection = new RTCPeerConnection();

// Listen for new ICE candidates and add them to the remoteConnection object
remoteConnection.onicecandidate = event => {
    console.log("New candidate! SDP updated: ");
    console.log(remoteConnection.localDescription);
}

// Listen for data channel changes 
remoteConnection.ondatachannel = event => {
    const dataChannel = event.channel;
    remoteConnection.dataChannel = dataChannel;
    // Assign the data channel to remoteConnection object

    // Listen for messages and log them out
    dataChannel.onmessage = event => {
        console.log("New Message: " + event.data);
    }

    // When data channel is open, log out a message indicating that the data channel is open
    dataChannel.onopen = () => {
        console.log('Data Channel opened');
    }
}

// Get the offer from other userA and set it as remote description
function setOffer(offer) {
    remoteConnection.setRemoteDescription(offer).then( a => {
        console.log("Offer set!");
    })

    // In response, create an answer and set it as local description
    remoteConnection.createAnswer().then( answer => {
        remoteConnection.setLocalDescription(answer);
    }).then( a => {
        console.log("Answer created!");
    })
}

// Send a message via the data channel
function sendMessage(message) {
    remoteConnection.dataChannel.send(message);
}

// For more detail, see README.md