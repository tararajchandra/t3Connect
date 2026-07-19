import { useState, useRef, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
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

  // File Transfer State
  const fileDcRef = useRef<RTCDataChannel | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [transferProgress, setTransferProgress] = useState(0);
  const [isTransferring, setIsTransferring] = useState(false);
  const incomingFileMeta = useRef<{name: string, size: number, mimeType: string} | null>(null);
  const incomingChunks = useRef<ArrayBuffer[]>([]);

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

  // Global keyboard capture
  useEffect(() => {
    if (!connected || role !== "client") return;

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (!dcRef.current || dcRef.current.readyState !== "open") return;
      e.preventDefault();
      dcRef.current.send(JSON.stringify({ type: "keydown", key: e.key }));
    };

    const handleGlobalKeyUp = (e: KeyboardEvent) => {
      if (!dcRef.current || dcRef.current.readyState !== "open") return;
      e.preventDefault();
      dcRef.current.send(JSON.stringify({ type: "keyup", key: e.key }));
    };

    window.addEventListener('keydown', handleGlobalKeyDown, { capture: true });
    window.addEventListener('keyup', handleGlobalKeyUp, { capture: true });

    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown, { capture: true });
      window.removeEventListener('keyup', handleGlobalKeyUp, { capture: true });
    };
  }, [connected, role]);

  const disconnect = () => {
    if (wsRef.current) wsRef.current.close();
    if (pcRef.current) pcRef.current.close();
    setConnected(false);
    setConnecting(false);
    setSessionId("");
    setRole("none");
    setIsTransferring(false);
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

  const handleFileMessage = (event: MessageEvent) => {
    if (typeof event.data === "string") {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "file-start") {
          incomingFileMeta.current = msg;
          incomingChunks.current = [];
          setTransferProgress(0);
          setIsTransferring(true);
        } else if (msg.type === "file-end") {
          if (incomingFileMeta.current && incomingChunks.current.length > 0) {
            const blob = new Blob(incomingChunks.current, { type: incomingFileMeta.current.mimeType || 'application/octet-stream' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = incomingFileMeta.current.name || 'downloaded_file';
            a.click();
            URL.revokeObjectURL(url);
          }
          setIsTransferring(false);
          incomingFileMeta.current = null;
          incomingChunks.current = [];
        }
      } catch (e) {
        console.error("Invalid text message on file channel", e);
      }
    } else if (event.data instanceof ArrayBuffer) {
      incomingChunks.current.push(event.data);
      if (incomingFileMeta.current && incomingFileMeta.current.size) {
        const currentSize = incomingChunks.current.reduce((acc, val) => acc + val.byteLength, 0);
        setTransferProgress(Math.min(100, Math.round((currentSize / incomingFileMeta.current.size) * 100)));
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !fileDcRef.current || fileDcRef.current.readyState !== "open") return;
    
    setIsTransferring(true);
    setTransferProgress(0);
    
    fileDcRef.current.send(JSON.stringify({
      type: "file-start",
      name: file.name,
      size: file.size,
      mimeType: file.type
    }));
    
    const chunkSize = 65536; // 64KB
    let offset = 0;
    
    const readSlice = (o: number) => {
      const slice = file.slice(offset, o + chunkSize);
      return slice.arrayBuffer();
    };
    
    while (offset < file.size) {
      const buffer = await readSlice(offset);
      
      if (fileDcRef.current.bufferedAmount > fileDcRef.current.bufferedAmountLowThreshold) {
        await new Promise(r => {
          if (!fileDcRef.current) return r(0);
          const onBufferedAmountLow = () => {
            if (fileDcRef.current) fileDcRef.current.removeEventListener('bufferedamountlow', onBufferedAmountLow);
            r(0);
          };
          fileDcRef.current.addEventListener('bufferedamountlow', onBufferedAmountLow);
        });
      }
      
      fileDcRef.current.send(buffer);
      offset += buffer.byteLength;
      setTransferProgress(Math.min(100, Math.round((offset / file.size) * 100)));
    }
    
    fileDcRef.current.send(JSON.stringify({ type: "file-end" }));
    setIsTransferring(false);
    
    if (fileInputRef.current) fileInputRef.current.value = "";
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

      // Data Channel for files
      const fileDc = pc.createDataChannel("file-transfer");
      fileDc.binaryType = "arraybuffer";
      fileDcRef.current = fileDc;
      fileDc.onopen = () => console.log("File Data channel opened");
      fileDc.onmessage = handleFileMessage;
      
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

            <button className="connect-btn secondary-btn" style={{ marginTop: '10px' }} onClick={async () => {
              try {
                const selected = await open({
                  multiple: false,
                });
                if (selected) {
                  await invoke('send_file_to_client', { path: selected });
                }
              } catch (e) {
                console.error("Failed to select file:", e);
              }
            }}>
              Send File to Client
            </button>
            
            <button className="disconnect-btn" style={{ marginTop: '10px' }} onClick={disconnect}>
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
          
          <div className={`glass-panel floating-toolbar ${showToolbar ? '' : 'toolbar-fade-out'}`} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="status-indicator" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="status-dot"></div>
              Connected ({sessionId})
            </div>
            
            <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
              <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileSelect} />
              <button className="connect-btn secondary-btn" style={{ flex: 1, padding: '8px' }} onClick={() => fileInputRef.current?.click()} disabled={isTransferring}>
                Send File
              </button>
              <button className="disconnect-btn" style={{ flex: 1, padding: '8px' }} onClick={disconnect}>
                Disconnect
              </button>
            </div>
            
            {isTransferring && (
              <div style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginTop: '5px' }}>
                <div style={{ height: '4px', backgroundColor: 'var(--primary)', width: `${transferProgress}%`, transition: 'width 0.2s' }}></div>
              </div>
            )}
          </div>
        </main>
      )}
    </>
  );
}

export default App;
