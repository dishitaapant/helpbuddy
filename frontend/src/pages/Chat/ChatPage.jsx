// pages/Chat/ChatPage.jsx — Anonymous Real-time Chat + Voice Call
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getSocket, disconnectSocket } from '../../utils/socket';
import Navbar from '../../components/Navbar';
import api from '../../utils/api';

// ─── WebRTC Config ─────────────────────────────────────────────────────────────
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

const ChatPage = () => {
  const { token, user } = useAuth();
  const [status, setStatus] = useState('idle'); // idle | waiting | matched | left
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [partnerInitials, setPartnerInitials] = useState('');
  const [roomId, setRoomId] = useState('');
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState('');

  // Voice call states
  const [callStatus, setCallStatus] = useState('idle'); // idle | calling | incoming | active
  const [callerSocketId, setCallerSocketId] = useState('');
  const [isMuted, setIsMuted] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const remoteAudioRef = useRef(null);

  // ─── Init Socket ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const socket = getSocket(token);
    socketRef.current = socket;

    socket.on('waiting_for_partner', () => setStatus('waiting'));
    socket.on('already_in_room', () => setStatus('matched'));

    socket.on('matched', ({ roomId }) => {
      setRoomId(roomId);
      setStatus('matched');
      setMessages([{ type: 'system', text: '🟢 Connected! You can now chat anonymously.' }]);
      api.post('/chat/increment').catch(() => {});
    });

    socket.on('partner_initials', ({ initials }) => setPartnerInitials(initials));

    socket.on('receive_message', (msg) => {
      setMessages((prev) => [...prev, { ...msg, isSelf: msg.senderId === user?.id }]);
    });

    socket.on('partner_left', ({ message }) => {
      setStatus('left');
      setMessages((prev) => [...prev, { type: 'system', text: `🔴 ${message}` }]);
      cleanupCall();
    });

    socket.on('user_blocked', ({ message }) => {
      setMessages((prev) => [...prev, { type: 'system', text: `🚫 ${message}` }]);
      setStatus('left');
    });

    socket.on('report_submitted', ({ message }) => {
      setMessages((prev) => [...prev, { type: 'system', text: `📋 ${message}` }]);
      setShowReport(false);
    });

    socket.on('identity_reveal_request', () => {
      const accepted = window.confirm('Your partner wants to reveal identities. Accept?');
      if (accepted) socket.emit('accept_identity_reveal');
    });

    socket.on('identity_revealed', ({ name, email }) => {
      setMessages((prev) => [
        ...prev,
        { type: 'system', text: `🤝 Identity revealed! Your partner is ${name} (${email})` },
      ]);
    });

    // ─── WebRTC Call Signaling ────────────────────────────────────────────────
    socket.on('incoming_call', ({ from }) => {
      setCallerSocketId(from);
      setCallStatus('incoming');
    });

    socket.on('call_accepted', () => {
      setCallStatus('active');
      startWebRTC(true); // initiator
    });

    socket.on('call_rejected', () => {
      setCallStatus('idle');
      setMessages((prev) => [...prev, { type: 'system', text: '📵 Call was declined.' }]);
    });

    socket.on('call_ended', () => {
      cleanupCall();
      setMessages((prev) => [...prev, { type: 'system', text: '📵 Call ended.' }]);
    });

    socket.on('webrtc_offer', async ({ from, offer }) => {
      await handleOffer(from, offer);
    });

    socket.on('webrtc_answer', async ({ answer }) => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(answer);
      }
    });

    socket.on('webrtc_ice_candidate', async ({ candidate }) => {
      if (peerConnectionRef.current) {
        try { await peerConnectionRef.current.addIceCandidate(candidate); } catch {}
      }
    });

   return () => {
  if (socketRef.current) {
    const socket = socketRef.current;

    socket.off('waiting_for_partner');
    socket.off('already_in_room');
    socket.off('matched');
    socket.off('partner_initials');
    socket.off('receive_message');
    socket.off('partner_left');
    socket.off('user_blocked');
    socket.off('report_submitted');
    socket.off('identity_reveal_request');
    socket.off('identity_revealed');
    socket.off('incoming_call');
    socket.off('call_accepted');
    socket.off('call_rejected');
    socket.off('call_ended');
    socket.off('webrtc_offer');
    socket.off('webrtc_answer');
    socket.off('webrtc_ice_candidate');

    disconnectSocket(); 
  }

  cleanupCall();
};
}, [token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ─── Chat Actions ─────────────────────────────────────────────────────────────
  const joinQueue = () => {
    setMessages([]);
    setPartnerInitials('');
    setRoomId('');
    socketRef.current?.emit('join_queue');
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || status !== 'matched') return;
    socketRef.current?.emit('send_message', { content: input.trim() });
    setMessages((prev) => [
      ...prev,
      { isSelf: true, content: input.trim(), timestamp: new Date(), senderInitials: user?.initials },
    ]);
    setInput('');
  };

  const leaveRoom = () => {
    socketRef.current?.emit('leave_room');
    setStatus('left');
    cleanupCall();
    setMessages((prev) => [...prev, { type: 'system', text: '👋 You left the chat.' }]);
  };

  const blockUser = () => {
    if (window.confirm('Block this user? They will no longer be matched with you.')) {
      socketRef.current?.emit('block_user');
    }
  };

  const submitReport = () => {
    socketRef.current?.emit('report_user', { reason: reportReason });
    setReportReason('');
  };

  const revealIdentity = () => {
    if (window.confirm('Request to reveal your identity to your partner?')) {
      socketRef.current?.emit('request_identity_reveal');
      setMessages((prev) => [...prev, { type: 'system', text: '🤝 Identity reveal request sent.' }]);
    }
  };

  // ─── WebRTC Call Logic ────────────────────────────────────────────────────────
  const startCall = async () => {
    setCallStatus('calling');
    socketRef.current?.emit('call_request');
  };

  const acceptCall = async () => {
    setCallStatus('active');
    socketRef.current?.emit('call_accepted', { to: callerSocketId });
    await startWebRTC(false); // not initiator
  };

  const rejectCall = () => {
    socketRef.current?.emit('call_rejected', { to: callerSocketId });
    setCallStatus('idle');
  };

  const endCall = () => {
    socketRef.current?.emit('call_ended');
    cleanupCall();
    setMessages((prev) => [...prev, { type: 'system', text: '📵 You ended the call.' }]);
  };

  const startWebRTC = async (isInitiator) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStreamRef.current = stream;

      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnectionRef.current = pc;

      // Add local audio track
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      // Play remote audio
      pc.ontrack = (event) => {
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = event.streams[0];
          remoteAudioRef.current.play().catch(() => {});
        }
      };

      // ICE candidate handling
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current?.emit('webrtc_ice_candidate', { 
            to: callerSocketId, 
            candidate: event.candidate 
            });
        }
      };

      if (isInitiator) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socketRef.current?.emit('webrtc_offer', { 
          to: callerSocketId, 
            offer 
            });
      }
    } catch (err) {
      console.error('WebRTC error:', err);
      setMessages((prev) => [...prev, { type: 'system', text: '🎙️ Could not access microphone.' }]);
      cleanupCall();
    }
  };

  const handleOffer = async (from, offer) => {
    setCallStatus('active');
    const pc = peerConnectionRef.current;
    if (!pc) return;
    await pc.setRemoteDescription(offer);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socketRef.current?.emit('webrtc_answer', { to: from, answer });
  };

  const cleanupCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    setCallStatus('idle');
    setCallerSocketId('');
    setIsMuted(false);
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((t) => {
        t.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0f0f1a] flex flex-col pb-20">
      {/* Hidden audio element for remote voice */}
      <audio ref={remoteAudioRef} autoPlay playsInline />

      {/* Header */}
      <div className="glass border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-white font-display text-lg">Anonymous Chat</h1>
          <p className="text-white/40 text-xs">
            {status === 'matched' ? `Chatting with ${partnerInitials || '...'}` :
             status === 'waiting' ? 'Finding your partner...' :
             'Connect anonymously'}
          </p>
        </div>
        {status === 'matched' && (
          <div className="flex gap-2">
            {/* Voice Call */}
            {callStatus === 'idle' && (
              <button onClick={startCall} className="w-8 h-8 rounded-xl bg-calm-500/20 flex items-center justify-center text-calm-400 hover:bg-calm-500/30 transition-colors" title="Voice Call">
                📞
              </button>
            )}
            {/* Identity Reveal */}
            <button onClick={revealIdentity} className="w-8 h-8 rounded-xl bg-primary-500/20 flex items-center justify-center text-primary-400 hover:bg-primary-500/30 transition-colors" title="Reveal Identity">
              🤝
            </button>
            {/* Report */}
            <button onClick={() => setShowReport(!showReport)} className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 hover:bg-amber-500/30 transition-colors" title="Report">
              ⚑
            </button>
            {/* Block */}
            <button onClick={blockUser} className="w-8 h-8 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/30 transition-colors" title="Block">
              🚫
            </button>
            {/* Leave */}
            <button onClick={leaveRoom} className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white/50 hover:bg-white/20 transition-colors" title="Leave">
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Report Panel */}
      {showReport && (
        <div className="glass border-b border-white/10 px-4 py-3 animate-slide-up">
          <p className="text-white text-sm font-medium mb-2">Report this user</p>
          <div className="flex gap-2">
            <input
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Reason (optional)"
              className="input-field text-sm py-2 flex-1"
            />
            <button onClick={submitReport} className="bg-amber-500/20 border border-amber-500/30 text-amber-400 px-3 rounded-xl text-sm hover:bg-amber-500/30 transition-colors">
              Report
            </button>
          </div>
        </div>
      )}

      {/* Incoming Call Banner */}
      {callStatus === 'incoming' && (
        <div className="glass border-b border-white/10 px-4 py-3 flex items-center justify-between animate-slide-up">
          <div className="flex items-center gap-2">
            <span className="text-lg animate-pulse-soft">📞</span>
            <p className="text-white text-sm">Incoming voice call from {partnerInitials}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={acceptCall} className="bg-calm-500/20 border border-calm-500/30 text-calm-400 px-3 py-1 rounded-lg text-sm">Accept</button>
            <button onClick={rejectCall} className="bg-red-500/20 border border-red-500/30 text-red-400 px-3 py-1 rounded-lg text-sm">Decline</button>
          </div>
        </div>
      )}

      {/* Active Call Bar */}
      {callStatus === 'active' && (
        <div className="bg-calm-500/10 border-b border-calm-500/20 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-calm-400 rounded-full animate-pulse-soft" />
            <p className="text-calm-400 text-sm font-medium">Voice call active</p>
          </div>
          <div className="flex gap-2">
            <button onClick={toggleMute} className={`text-xs px-3 py-1 rounded-lg border transition-colors ${isMuted ? 'bg-red-500/20 border-red-500/30 text-red-400' : 'bg-white/10 border-white/20 text-white/60'}`}>
              {isMuted ? '🔇 Muted' : '🎙️ Mute'}
            </button>
            <button onClick={endCall} className="bg-red-500/20 border border-red-500/30 text-red-400 text-xs px-3 py-1 rounded-lg">End</button>
          </div>
        </div>
      )}

      {/* Calling status */}
      {callStatus === 'calling' && (
        <div className="bg-primary-500/10 border-b border-primary-500/20 px-4 py-2 flex items-center gap-2">
          <span className="animate-pulse-soft">📞</span>
          <p className="text-primary-400 text-sm">Calling {partnerInitials}...</p>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {/* Idle state */}
        {status === 'idle' && (
          <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center animate-fade-in">
            <div className="text-6xl mb-4 animate-float">💬</div>
            <h2 className="text-white font-display text-2xl mb-2">Talk to Someone</h2>
            <p className="text-white/40 text-sm max-w-xs mb-8">
              You'll be paired with a random stranger. Your identity stays hidden — only your initials are shown.
            </p>
            <button onClick={joinQueue} className="btn-primary px-8">
              Find a Partner →
            </button>
          </div>
        )}

        {/* Waiting state */}
        {status === 'waiting' && (
          <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center">
            <div className="w-16 h-16 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin mb-4" />
            <h2 className="text-white font-display text-xl mb-2">Finding someone for you...</h2>
            <p className="text-white/40 text-sm">This usually takes a few seconds</p>
            <button
              onClick={() => { socketRef.current?.emit('leave_room'); setStatus('idle'); }}
              className="mt-6 text-white/40 text-sm hover:text-white/60 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Messages */}
        {(status === 'matched' || status === 'left') && messages.map((msg, i) => {
          if (msg.type === 'system') {
            return (
              <div key={i} className="text-center">
                <span className="text-white/30 text-xs bg-white/5 px-3 py-1 rounded-full">{msg.text}</span>
              </div>
            );
          }
          return (
            <div key={i} className={`flex ${msg.isSelf ? 'justify-end' : 'justify-start'} message-enter`}>
              <div className={`max-w-[75%] ${msg.isSelf ? 'items-end' : 'items-start'} flex flex-col`}>
                <span className={`text-[10px] font-medium mb-1 ${msg.isSelf ? 'text-primary-400' : 'text-white/40'}`}>
                  {msg.isSelf ? 'You' : (msg.senderInitials || partnerInitials)}
                </span>
                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.isSelf
                    ? 'bg-primary-500 text-white rounded-tr-md'
                    : 'bg-white/10 text-white/90 rounded-tl-md'
                }`}>
                  {msg.content}
                </div>
                <span className="text-[10px] text-white/20 mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}

        {/* Left state actions */}
        {status === 'left' && (
          <div className="text-center py-4">
            <button onClick={joinQueue} className="btn-primary px-6 text-sm">
              Find New Partner →
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {status === 'matched' && (
        <form onSubmit={sendMessage} className="glass border-t border-white/10 px-4 py-3 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="input-field py-2.5 text-sm flex-1"
            maxLength={1000}
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="w-10 h-10 bg-primary-500 hover:bg-primary-600 disabled:opacity-30 rounded-xl flex items-center justify-center transition-all active:scale-95"
          >
            <span className="text-white text-sm">→</span>
          </button>
        </form>
      )}

      <Navbar />
    </div>
  );
};

export default ChatPage;
