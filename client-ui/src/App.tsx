import { useState, useRef, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import logo from './assets/logo.png';

function App() {
  const [role, setRole] = useState<"none" | "host" | "client">("none");
  const [sessionId, setSessionId] = useState("");
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showToolbar, setShowToolbar] = useState(true);
  
  const wsRef = useRef<WebSocket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);

  // Auto-hide toolbar when mouse doesn't move
  useEffect(() => {
    if (!connected || role !== "client") return;
    let timeout: ReturnType<typeof setTimeout>;
    
    const handleMouse = () => {
      setShowToolbar(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowToolbar(false), 2000);
    };
    
    window.addEventListener('mousemove', handleMouse);
    return () => {
      window.removeEventListener('mousemove', handleMouse);
      clearTimeout(timeout);
    };
  }, [connected, role]);

  const disconnect = () => {
    if (wsRef.current) wsRef.current.close();
    if (pcRef.current) pcRef.current.close();
    setConnected(false);
    setConnecting(false);
    setSessionId("");
    setRole("none");
  };

  const startHost = async () => {
    setConnecting(true);
    try {
      const id: number = await invoke("start_host");
      setSessionId(id.toString());
      setRole("host");
      setConnected(true);
    } catch (e) {
      console.error(e);
      alert("Failed to start host: " + e);
    } finally {
      setConnecting(false);
    }
  };

  const connectAsClient = async () => {
    if (!sessionId) return;
    setConnecting(true);

    const ws = new WebSocket(`ws://qkwcwksoc88cckoks84o44ks.192.99.167.217.sslip.io/ws/${sessionId}`);
    wsRef.current = ws;

    ws.onopen = async () => {
      console.log("WebSocket connected. Initializing WebRTC...");
      
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
      });
      pcRef.current = pc;

      // Data Channel for inputs
      const dc = pc.createDataChannel("input-channel");
      dcRef.current = dc;
      dc.onopen = () => console.log("Data channel opened");
      
      // Force H264 for the video transceiver
      const tc = pc.addTransceiver("video", { direction: "recvonly" });
      if (typeof RTCRtpReceiver !== "undefined" && RTCRtpReceiver.getCapabilities) {
        const capabilities = RTCRtpReceiver.getCapabilities("video");
        if (capabilities) {
          const h264Codecs = capabilities.codecs.filter(c => c.mimeType.toLowerCase() === "video/h264");
          if (h264Codecs.length > 0) {
            tc.setCodecPreferences(h264Codecs);
          }
        }
      }

      // Receive video
      pc.ontrack = (event) => {
        console.log("Received remote track", event.track);
        if (videoRef.current) {
          if (event.streams && event.streams[0]) {
            videoRef.current.srcObject = event.streams[0];
          } else {
            videoRef.current.srcObject = new MediaStream([event.track]);
          }
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          ws.send(JSON.stringify({ candidate: event.candidate }));
        }
      };

      // Create Offer
      const offer = await pc.createOffer({ offerToReceiveVideo: true });
      await pc.setLocalDescription(offer);
      
      ws.send(JSON.stringify({
        type: "offer",
        sdp: offer.sdp
      }));
      setConnected(true);
    };

    ws.onmessage = async (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "answer" && msg.sdp) {
        await pcRef.current?.setRemoteDescription({ type: "answer", sdp: msg.sdp });
        console.log("Remote description set.");
      } else if (msg.candidate) {
        await pcRef.current?.addIceCandidate(msg.candidate);
        console.log("Added ICE candidate.");
      }
    };
    
    ws.onerror = (e) => {
      console.error(e);
      alert("WebSocket connection failed.");
      disconnect();
    }
  };

  const getNormalizedCoords = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return null;
    const video = videoRef.current;
    const rect = video.getBoundingClientRect();
    
    const scale = Math.min(rect.width / video.videoWidth, rect.height / video.videoHeight);
    const renderedWidth = video.videoWidth * scale;
    const renderedHeight = video.videoHeight * scale;
    const offsetX = (rect.width - renderedWidth) / 2;
    const offsetY = (rect.height - renderedHeight) / 2;

    const x = e.clientX - rect.left - offsetX;
    const y = e.clientY - rect.top - offsetY;

    if (x < 0 || x > renderedWidth || y < 0 || y > renderedHeight) return null;

    return {
      x: x / renderedWidth,
      y: y / renderedHeight
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dcRef.current || dcRef.current.readyState !== "open") return;
    const coords = getNormalizedCoords(e);
    if (!coords) return;
    dcRef.current.send(JSON.stringify({ type: "mousemove", ...coords }));
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dcRef.current || dcRef.current.readyState !== "open") return;
    const button = e.button === 0 ? "left" : e.button === 2 ? "right" : "middle";
    dcRef.current.send(JSON.stringify({ type: "mousedown", button }));
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dcRef.current || dcRef.current.readyState !== "open") return;
    const button = e.button === 0 ? "left" : e.button === 2 ? "right" : "middle";
    dcRef.current.send(JSON.stringify({ type: "mouseup", button }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!dcRef.current || dcRef.current.readyState !== "open") return;
    e.preventDefault();
    dcRef.current.send(JSON.stringify({ type: "keydown", key: e.key }));
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!dcRef.current || dcRef.current.readyState !== "open") return;
    e.preventDefault();
    dcRef.current.send(JSON.stringify({ type: "keyup", key: e.key }));
  };

  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <>
      {role === "none" && (
        <main className="connection-screen">
          <div className="glass-panel connect-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <img src={logo} alt="t3 Solutions" style={{ height: '60px', width: 'auto' }} />
            <p style={{ color: 'var(--text-secondary)' }}>Choose an option</p>
            
            <button className="connect-btn" onClick={startHost} disabled={connecting}>
              {connecting ? "Starting..." : "Share My Screen (Host)"}
            </button>
            <button className="connect-btn secondary-btn" onClick={() => setRole("client")}>
              View Someone's Screen (Client)
            </button>
          </div>
        </main>
      )}

      {role === "host" && (
        <main className="connection-screen">
          <div className="glass-panel connect-card">
            <img src={logo} alt="t3 Solutions" style={{ height: '50px', width: 'auto', marginBottom: '10px' }} />
            <h1 className="brand-title" style={{ fontSize: '1.5rem', marginTop: 0 }}>Host</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Your screen is ready to share.</p>
            
            <div style={{ margin: '20px 0', fontSize: '2em', fontWeight: 'bold', letterSpacing: '2px', color: 'var(--primary)' }}>
              {sessionId}
            </div>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9em' }}>
              Share this Session ID and your IP address with the viewer.
            </p>
            
            <button className="disconnect-btn" style={{ marginTop: '20px' }} onClick={disconnect}>
              Stop Sharing
            </button>
          </div>
        </main>
      )}

      {role === "client" && !connected && (
        <main className="connection-screen">
          <div className="glass-panel connect-card">
            <img src={logo} alt="t3 Solutions" style={{ height: '40px', width: 'auto' }} />
            <h1 className="brand-title" style={{ fontSize: '1.5rem', marginTop: 0 }}>Connect to Host</h1>
            
            <input
              className="pin-input"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              placeholder="Session PIN"
              maxLength={6}
              disabled={connecting}
            />
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="disconnect-btn" onClick={() => setRole("none")} disabled={connecting}>
                Back
              </button>
              <button className="connect-btn" onClick={connectAsClient} disabled={connecting} style={{ flex: 1 }}>
                {connecting ? "Connecting..." : "Connect"}
              </button>
            </div>
          </div>
        </main>
      )}

      {role === "client" && connected && (
        <main className="stream-container">
          <div 
            style={{ width: '100%', height: '100%', outline: 'none' }}
            tabIndex={0}
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            onContextMenu={handleContextMenu}
          >
            <video 
              className="stream-video"
              ref={videoRef}
              autoPlay 
              playsInline
              muted
            />
          </div>
          
          <div className={`glass-panel floating-toolbar ${showToolbar ? '' : 'toolbar-fade-out'}`}>
            <div className="status-indicator">
              <div className="status-dot"></div>
              Connected ({sessionId})
            </div>
            <button className="disconnect-btn" onClick={disconnect}>
              Disconnect
            </button>
          </div>
        </main>
      )}
    </>
  );
}

export default App;
