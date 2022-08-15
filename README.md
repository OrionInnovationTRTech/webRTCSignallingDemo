# WebRTC Signaling Demo

WebRTC is one of the popular concepts in RTC technologies and there are various tutorials for it. Besides, there are plenty of libraries (especially for NPM) that use WebRTC to establish communication for many uses. Many of the tutorials use these libraries to show how to build clone applications of Zoom, Discord, etc. However, they fail to show how WebRTC works at its core.

We will be building a simple demo that demonstrates signaling between two browsers. It will only require a browser and some Javascript code. Since the goal is to grasp the signaling concept, it will not be a useful application but rather a demo that demonstrates each of the components that are required to establish a connection in a simple way.

## Setup

For this demo, we need two browsers working at the same time. One will be User A while the other one will be User B. File structure is shown in the diagram below. If you wish, you can use two computers to see the connection between different devices. It will be the same case whether you use the same device or two devices.

```bash
signaling demo
├── userA
│   ├── index.html
│   └── scriptA.js
└── userB
    ├── index.html
    └── scriptB.js

```

HTML files will be blank, they just need an HTML boilerplate and they need to be connected to their script files.

> userA/index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title>User A</title>
</head>

    <script src="scriptA.js"></script>
</html>

```

> userB/index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title>User B</title>
</head>

    <script src="scriptB.js"></script>
</html>

```

To work with our environment, I would recommend opening the `signaling demo` folder in VS Code and enabling Live Share. Then we can open up two tabs to access two of the directories:

```bash
<http://127.0.0.1:5500/userA/>
<http://127.0.0.1:5500/userB/>

```

Yet, it will suffice to open HTML files on a browser. We don’t need the page itself, we just need to open two tabs and their consoles like below.
![enter image description here](https://i.ibb.co/YpTLV5m/Screen-Shot-2022-08-04-at-10-48-23.png)
## Create SDP

Setup is ready, let’s start with `scriptA.js`.

```jsx
const localConnection = new RTCPeerConnection();

const dataChannel = localConnection.createDataChannel('dataChannel');

//Event listeners
dataChannel.onopen = () => {
    console.log('Data channel opened');
}

dataChannel.onmessage = event => {
    console.log("New Message: " + event.data);
}

```

-   The first step is to create a `RTCPeerConnection` to establish our connection.
-   This connection will require a data channel to carry our messages. We create it for our `localConnection` and set its label to `dataChannel`.
-   We need some event listeners to get updates from the connection:
    - The first one listens to if the data channel has been opened or not. Openness means that the connection with the remote peer is successful and data channels between peers are linked.
    -   Once the data channel is open we can begin to listen to incoming messages.

----------

```jsx
localConnection.createOffer().then( offer => {
    localConnection.setLocalDescription(offer);
}).then( a => {
    console.log("Offer created!");
})

localConnection.onicecandidate = event => {
    console.log("New candidate! SDP updated: ");
    console.log(localConnection.localDescription);
}

```

-   To get our SDP object, we need to create an offer. This offer will be saved to the local description of User A.
-   Now we listen for ICE candidates. Once the offer is created we will get several ICE candidates for our device. Each time we got a new ICE candidate we update our SDP so that it contains all of the candidates so far.

SDP is created and we can see it in the console. We will have a couple of SDP objects but we need the last one since it contains all of the ICE candidates.
![enter image description here](https://i.ibb.co/kQ2Cs03/Screen-Shot-2022-08-04-at-12-54-23.png)
We can easily copy it as shown in the image above. To accomplish the signaling we need to transfer this SDP object to the remote peer. For this demo, we just copy it and will use it in User B. In the next article, we will examine how we can signal SDP via the Firebase database.

```jsx
// User A's offer 
{
    "type": "offer",
    "sdp": "v=0\\r\\no=- 438850326770022590 2 IN IP4 127.0.0.1\\r\\ns=-\\r\\nt=0 0\\r\\na=group:BUNDLE 0\\r\\na=extmap-allow-mixed\\r\\na=msid-semantic: WMS\\r\\nm=application 64108 UDP/DTLS/SCTP webrtc-datachannel\\r\\nc=IN IP4 10.254.127.14\\r\\na=candidate:2579874737 1 udp 2122260223 10.254.127.14 64108 typ host generation 0 network-id 1 network-cost 10\\r\\na=candidate:3611705153 1 tcp 1518280447 10.254.127.14 9 typ host tcptype active generation 0 network-id 1 network-cost 10\\r\\na=ice-ufrag:s0FI\\r\\na=ice-pwd:PSnzwoIGM8YZO8McmQ1nURNF\\r\\na=ice-options:trickle\\r\\na=fingerprint:sha-256 59:24:02:51:D0:41:46:90:99:71:42:22:58:85:AE:F4:C2:07:FA:0B:2B:F0:CF:51:B9:04:1A:E4:CF:69:85:6C\\r\\na=setup:actpass\\r\\na=mid:0\\r\\na=sctp-port:5000\\r\\na=max-message-size:262144\\r\\n"
}

```

## Signal the Offer and Create an Answer

Before continuing with User A, we need to pass SDP to User B. Let’s start to code `scriptB.js`

```jsx
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
        console.log('Data channel opened');
    }
}

```

- As we did for User A, we create a `RTCPeerConnection` object and listen for new ICE candidates. These candidates will show up when we create an answer for User B.
-   Event listeners are similar but there is a small difference. Since User A has initiated the signaling process, its data channel will be passed to User B when the connection is established which means that they will share the same data channel. Because of that, we need to listen to the data channel for User B. When there is an event happening in the data channel, User B will be listening for open and message events like User A.

```jsx
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

```

-   We are using a function here because we will call this function once we get an SDP offer from User A.
-   To pass the SDP to User B, we set the offer as a remote description.
-   When we set the remote description, we can create our answer and set it as the local description.

```jsx
// Execute this in the console of User B (SDP object is only given for example, you need to pass your own SDP object you copied)
setOffer({
    "type": "offer",
    "sdp": "v=0\\r\\no=- 6903397949454729551 2 IN IP4 127.0.0.1\\r\\ns=-\\r\\nt=0 0\\r\\na=group:BUNDLE 0\\r\\na=extmap-allow-mixed\\r\\na=msid-semantic: WMS\\r\\nm=application 56524 UDP/DTLS/SCTP webrtc-datachannel\\r\\nc=IN IP4 10.254.127.14\\r\\na=candidate:2579874737 1 udp 2122260223 10.254.127.14 56524 typ host generation 0 network-id 1 network-cost 10\\r\\na=candidate:3611705153 1 tcp 1518280447 10.254.127.14 9 typ host tcptype active generation 0 network-id 1 network-cost 10\\r\\na=ice-ufrag:JApg\\r\\na=ice-pwd:AHSRC03UbXKzl2P+e9dPNLZT\\r\\na=ice-options:trickle\\r\\na=fingerprint:sha-256 42:50:14:BB:F9:6B:A0:3B:62:15:59:86:14:20:48:30:DD:50:8B:C0:30:31:AD:61:E3:42:B0:20:93:EE:14:30\\r\\na=setup:actpass\\r\\na=mid:0\\r\\na=sctp-port:5000\\r\\na=max-message-size:262144\\r\\n"
})

```

-   Once we execute the function, an answer will be created and User B’s SDP will be updated each time a new ICE candidate is found. Like we did previously, we will copy the answer SDP object.

![enter image description here](https://i.ibb.co/vzb2rMY/Screen-Shot-2022-08-04-at-13-28-45.png)
## Establishing the Connection and Sending Messages

We get back to User A and finish `scriptA.js`. We will be defining two more functions to gain chatting functionality.

```jsx
function setAnswer(answer) {
    localConnection.setRemoteDescription(answer);
}

function sendMessage(message) {
    dataChannel.send(message);
}

```

```jsx
// Execute this in the console of User A (SDP object is only given for example, you need to pass your own SDP object you copied)
setAnswer({
    "type": "answer",
    "sdp": "v=0\\r\\no=- 8372747172637914019 2 IN IP4 127.0.0.1\\r\\ns=-\\r\\nt=0 0\\r\\na=group:BUNDLE 0\\r\\na=extmap-allow-mixed\\r\\na=msid-semantic: WMS\\r\\nm=application 52700 UDP/DTLS/SCTP webrtc-datachannel\\r\\nc=IN IP4 10.254.127.14\\r\\na=candidate:2579874737 1 udp 2122260223 10.254.127.14 52700 typ host generation 0 network-id 1 network-cost 10\\r\\na=ice-ufrag:9BNJ\\r\\na=ice-pwd:duKEejZ669stZBln7bBESiii\\r\\na=ice-options:trickle\\r\\na=fingerprint:sha-256 1B:17:0E:A8:41:90:C5:79:F1:12:0E:61:E2:05:EE:CE:4D:91:12:A3:97:20:91:D8:A7:42:17:F1:C8:9E:23:16\\r\\na=setup:active\\r\\na=mid:0\\r\\na=sctp-port:5000\\r\\na=max-message-size:262144\\r\\n"
})

```

-   To finish the signaling process, we need to signal User A back. We set the answer SDP as remote description of User A.
-   Once we finish the signaling, data channel will be opened for both sides. We can easily send a message from User A to User B via data channel.

There is one last function left and we will declare it in `scriptB.js`

```jsx
function sendMessage(message) {
    remoteConnection.dataChannel.send(message);
}

```

-   This function is a bit different because User B uses data channel it got from User A. So it needs to use the data channel bound to its connection.
![enter image description here](https://i.ibb.co/MfHrXsW/Screen-Shot-2022-08-04-at-13-47-38.png)

By establishing the connection, we can easily send simple variables like strings to the remote peer. It is not limited to that, you can send video-audio tracks, objects and even files.
