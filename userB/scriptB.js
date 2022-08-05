const remoteConnection = new RTCPeerConnection();

remoteConnection.onicecandidate = event => {
    console.log("New candidate! SDP updated: ");
    console.log(remoteConnection.localDescription);
}

remoteConnection.ondatachannel = event => {
    const dataChannel = event.channel;
    remoteConnection.dataChannel = dataChannel;

    dataChannel.onmessage = event => {
        console.log("New Message: " + event.data);
    }

    dataChannel.onopen = () => {
        console.log('Data Channel opened');
    }
}

function setOffer(offer) {
    remoteConnection.setRemoteDescription(offer).then( a => {
        console.log("Offer set!");
    })

    remoteConnection.createAnswer().then( answer => {
        remoteConnection.setLocalDescription(answer);
    }).then( a => {
        console.log("Answer created!");
    })
}

function sendMessage(message) {
    remoteConnection.dataChannel.send(message);
}