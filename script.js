let localStream;
let peerConnection;
const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

document.getElementById('startBtn').addEventListener('click', startBroadcast);
document.getElementById('stopBtn').addEventListener('click', stopBroadcast);

async function startBroadcast() {
    try {
        updateStatus("Getting microphone access...");
        localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Create peer connection
        peerConnection = new RTCPeerConnection(configuration);
        
        // Add stream to connection
        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream);
        });
        
        // Create offer
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        
        // Generate a simple "connection ID" (in a real app, use a signaling server)
        const connectionId = Math.random().toString(36).substring(2, 8);
        document.getElementById('connectionId').textContent = `Connection ID: ${connectionId}`;
        
        // For demo purposes, we'll store the offer in localStorage
        // In a real app, you'd send this to a signaling server
        localStorage.setItem('voiceOffer', JSON.stringify({
            id: connectionId,
            offer: peerConnection.localDescription
        }));
        
        updateStatus("Ready to connect. Share the Connection ID with the receiver.");
        
        document.getElementById('startBtn').disabled = true;
        document.getElementById('stopBtn').disabled = false;
        
    } catch (error) {
        updateStatus(`Error: ${error.message}`);
        console.error(error);
    }
}

function stopBroadcast() {
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
    }
    
    updateStatus("Broadcast stopped");
    document.getElementById('startBtn').disabled = false;
    document.getElementById('stopBtn').disabled = true;
    document.getElementById('connectionId').textContent = '';
}

function updateStatus(message) {
    document.getElementById('status').textContent = `Status: ${message}`;
}
