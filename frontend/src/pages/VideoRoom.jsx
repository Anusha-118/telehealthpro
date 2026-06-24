import React, { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Users, ScreenShare } from 'lucide-react';

const VideoRoom = () => {
  const { appointmentId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const peerId = searchParams.get('peer');
  const peerName = searchParams.get('name') || 'Consulting Specialist';

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [micActive, setMicActive] = useState(true);
  const [videoActive, setVideoActive] = useState(true);
  const [connecting, setConnecting] = useState(true);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // 1. Initialize Socket signaling connection
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const socket = io(socketUrl);
    socketRef.current = socket;

    socket.emit('register', user.id);

    // Ice configuration servers (using Google STUN)
    const pcConfig = {
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    };

    const initializeMedia = async () => {
      try {
        // 2. Fetch User media streams
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // 3. Initialize RTCPeerConnection
        const pc = new RTCPeerConnection(pcConfig);
        peerConnectionRef.current = pc;

        // Add local tracks to peer connection
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });

        // Set remote tracks handler
        pc.ontrack = (event) => {
          if (event.streams && event.streams[0]) {
            setRemoteStream(event.streams[0]);
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = event.streams[0];
            }
          }
        };

        // Forward ICE candidates
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit('webrtc_ice_candidate', {
              candidate: event.candidate,
              toUserId: peerId,
              fromUserId: user.id
            });
          }
        };

        // If the user role is patient, initiate the call offer
        // This ensures a deterministic caller/callee signaling handshake loop
        if (user.role === 'patient') {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit('webrtc_offer', {
            offer,
            toUserId: peerId,
            fromUserId: user.id,
            appointmentId
          });
        }

        setConnecting(false);
      } catch (err) {
        console.error('WebRTC Media constraints acquisition failed:', err);
        setConnecting(false);
        alert('Could not acquire camera/microphone media access.');
      }
    };

    initializeMedia();

    // 4. Socket Listeners for Signalling
    socket.on('webrtc_offer', async ({ offer }) => {
      try {
        const pc = peerConnectionRef.current;
        if (pc) {
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socketRef.current.emit('webrtc_answer', {
            answer,
            toUserId: peerId,
            fromUserId: user.id
          });
        }
      } catch (err) {
        console.error('Error handling webrtc offer:', err);
      }
    });

    socket.on('webrtc_answer', async ({ answer }) => {
      try {
        const pc = peerConnectionRef.current;
        if (pc) {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        }
      } catch (err) {
        console.error('Error handling webrtc answer:', err);
      }
    });

    socket.on('webrtc_ice_candidate', async ({ candidate }) => {
      try {
        const pc = peerConnectionRef.current;
        if (pc) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (err) {
        console.error('Error adding ICE candidate:', err);
      }
    });

    socket.on('webrtc_hangup', () => {
      handleHangUp(false);
    });

    return () => {
      // Clean up track handles
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      socket.disconnect();
    };
  }, [appointmentId, peerId, user, navigate]);

  const handleHangUp = (notifyPeer = true) => {
    if (notifyPeer && socketRef.current) {
      socketRef.current.emit('webrtc_hangup', {
        toUserId: peerId,
        fromUserId: user.id
      });
    }

    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    // Redirect to dashboards
    const fallbackPath = user?.role === 'doctor' ? '/doctor/appointments' : '/patient/appointments';
    navigate(fallbackPath);
  };

  const toggleMic = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicActive(audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoActive(videoTrack.enabled);
      }
    }
  };

  return (
    <div className="h-screen bg-darkBg-deep flex flex-col justify-between text-white select-none">
      {/* Header */}
      <header className="px-6 py-4 bg-darkBg-dark/80 backdrop-blur-md flex justify-between items-center border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse"></div>
          <span className="font-extrabold text-sm tracking-wide uppercase">Live consultation room</span>
        </div>
        <span className="text-xs text-slate-400 font-semibold truncate max-w-xs">Consultation: {peerName}</span>
      </header>

      {/* Video feeds grid */}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 p-6 relative">
        {connecting && (
          <div className="absolute inset-0 z-40 bg-darkBg-deep flex items-center justify-center space-y-3 flex-col">
            <div className="h-10 w-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-semibold text-slate-400">Connecting video consultation tunnel...</p>
          </div>
        )}

        {/* Local Stream */}
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transform scale-x-[-1]"
          />
          <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1.5 rounded-xl text-xxs font-semibold flex items-center space-x-1">
            <span>Local feed (You)</span>
          </div>
        </div>

        {/* Remote Stream */}
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
          {remoteStream ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center p-6 space-y-2">
              <Users className="h-10 w-10 mx-auto text-slate-700 animate-pulse" />
              <p className="text-xs font-semibold text-slate-500">Awaiting consultation partner to join call...</p>
            </div>
          )}
          <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1.5 rounded-xl text-xxs font-semibold flex items-center space-x-1">
            <span>Remote feed: {peerName}</span>
          </div>
        </div>
      </main>

      {/* Controllers Footer */}
      <footer className="py-6 bg-darkBg-dark/80 backdrop-blur-md flex justify-center items-center space-x-4 border-t border-slate-800">
        <button
          onClick={toggleMic}
          className={`p-4 rounded-2xl transition-all hover-scale shadow-lg ${
            micActive ? 'bg-slate-850 hover:bg-slate-700 text-white' : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
          aria-label={micActive ? 'Mute Mic' : 'Unmute Mic'}
        >
          {micActive ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </button>

        <button
          onClick={toggleVideo}
          className={`p-4 rounded-2xl transition-all hover-scale shadow-lg ${
            videoActive ? 'bg-slate-850 hover:bg-slate-700 text-white' : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
          aria-label={videoActive ? 'Stop Video' : 'Start Video'}
        >
          {videoActive ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
        </button>

        <button
          onClick={() => handleHangUp(true)}
          className="p-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white transition-all hover-scale shadow-lg"
          aria-label="Hang Up"
        >
          <PhoneOff className="h-5 w-5" />
        </button>
      </footer>
    </div>
  );
};

export default VideoRoom;
