// pages/Music/MusicPage.jsx — Curated Calming Music Playlists
import React, { useState } from 'react';
import Navbar from '../../components/Navbar';

// ─── Curated Playlists ─────────────────────────────────────────────────────────
// These are hand-picked, calming, royalty-friendly YouTube videos/playlists
const PLAYLISTS = [
  {
    id: 'anxiety',
    category: 'Anxiety Relief',
    emoji: '🌊',
    description: 'Gentle sounds to quiet a racing mind',
    color: 'from-blue-500/20 to-indigo-600/10',
    border: 'border-blue-500/20',
    accent: 'text-blue-400',
    tracks: [
      { title: 'Calm Ocean Waves', artist: 'Nature Sounds', duration: '1 hr', youtubeId: 'q76bMs-NwRk' },
      { title: 'Anxiety Relief Music', artist: 'Meditative Mind', duration: '3 hr', youtubeId: 'cwKvEXkAMms' },
      { title: 'Forest Rain Sounds', artist: 'Nature Therapy', duration: '8 hr', youtubeId: 'xNN7iTA57jM' },
      { title: 'Peaceful Piano', artist: 'Peder B. Helland', duration: '2 hr', youtubeId: 'XULUBg_ZcAU' },
      { title: '528 Hz Healing Frequency', artist: 'Meditative Mind', duration: '3 hr', youtubeId: 'LVkjSLHDqiU' },
    ],
  },
  {
    id: 'panic',
    category: 'Panic Attack Calming',
    emoji: '🕊️',
    description: 'Immediate relief during panic episodes',
    color: 'from-purple-500/20 to-pink-600/10',
    border: 'border-purple-500/20',
    accent: 'text-purple-400',
    tracks: [
      { title: 'Emergency Calm – 10 min', artist: 'The Honest Guys', duration: '10 min', youtubeId: 'O-6f5wQXSu8' },
      { title: 'Panic Attack Relief', artist: 'Jason Stephenson', duration: '20 min', youtubeId: 'y9RjYiKZvKM' },
      { title: 'Binaural Beats – Alpha', artist: 'Greenred Productions', duration: '1 hr', youtubeId: 'WPni755-Krg' },
      { title: 'Soft Tibetan Bowls', artist: 'Relaxation Music', duration: '1 hr', youtubeId: 'v_VNtAebNQE' },
      { title: 'ASMR Gentle Rain', artist: 'ASMR Zeitgeist', duration: '30 min', youtubeId: 'jLbwzFxNxvA' },
    ],
  },
  {
    id: 'sleep',
    category: 'Sleep & Relaxation',
    emoji: '🌙',
    description: 'Wind down and drift into peaceful rest',
    color: 'from-indigo-500/20 to-blue-600/10',
    border: 'border-indigo-500/20',
    accent: 'text-indigo-400',
    tracks: [
      { title: 'Deep Sleep Music', artist: 'Soothing Relaxation', duration: '8 hr', youtubeId: 'rkZl7pt9gnY' },
      { title: 'Delta Waves Sleep', artist: 'Greenred Productions', duration: '3 hr', youtubeId: 'F1IHoU3oEws' },
      { title: 'Soft Rain for Sleep', artist: 'Nature Sound', duration: '10 hr', youtubeId: 'yMRs8rpjT5Q' },
      { title: 'Lofi Sleep Study', artist: 'Lofi Girl', duration: '2 hr', youtubeId: 'jfKfPfyJRdk' },
      { title: 'Sleep Piano Music', artist: 'Peder B. Helland', duration: '3 hr', youtubeId: 'APmFOGcPDvo' },
    ],
  },
  {
    id: 'meditation',
    category: 'Meditation & Focus',
    emoji: '🧘',
    description: 'Center your mind and find stillness',
    color: 'from-calm-500/20 to-teal-600/10',
    border: 'border-calm-500/20',
    accent: 'text-calm-400',
    tracks: [
      { title: 'Morning Meditation', artist: 'Great Meditation', duration: '20 min', youtubeId: 'NcqOBp7TLlw' },
      { title: 'Zen Garden Ambience', artist: 'Relaxation Music', duration: '2 hr', youtubeId: 'kgx4WGK0oNU' },
      { title: '10-Min Mindfulness', artist: 'Headspace', duration: '10 min', youtubeId: 'ZToicYcHIOU' },
      { title: 'Focus Flow — Alpha', artist: 'Binaural Beats', duration: '1 hr', youtubeId: 'WPni755-Krg' },
      { title: 'Nature + Flute', artist: 'Relaxing Music', duration: '3 hr', youtubeId: 'lTRiuFIWV54' },
    ],
  },
];

// ─── YouTube Player Modal ─────────────────────────────────────────────────────
const PlayerModal = ({ track, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
    <div className="w-full max-w-md animate-slide-up" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-white font-semibold">{track.title}</p>
          <p className="text-white/40 text-xs">{track.artist} · {track.duration}</p>
        </div>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 text-white/60 hover:bg-white/20 transition-colors">
          ✕
        </button>
      </div>
      <div className="relative pb-[56.25%] rounded-2xl overflow-hidden bg-black">
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube.com/embed/${track.youtubeId}?autoplay=1&rel=0`}
          title={track.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      <p className="text-white/20 text-xs text-center mt-3">
        Video opens via YouTube. Best experienced with headphones. 🎧
      </p>
    </div>
  </div>
);

// ─── Main Music Page ──────────────────────────────────────────────────────────
const MusicPage = () => {
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [playingTrack, setPlayingTrack] = useState(null);

  return (
    <div className="min-h-screen bg-[#0f0f1a] pb-24">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-72 h-72 bg-purple-500/6 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-indigo-500/6 rounded-full blur-3xl" />
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 relative">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-display text-white">Calming Music</h1>
          <p className="text-white/40 text-sm mt-1">Curated playlists for every emotional need</p>
        </div>

        {/* Playlist Cards */}
        {!selectedPlaylist && (
          <div className="space-y-4 animate-slide-up">
            {PLAYLISTS.map((playlist, i) => (
              <button
                key={playlist.id}
                onClick={() => setSelectedPlaylist(playlist)}
                className={`w-full card bg-gradient-to-br ${playlist.color} ${playlist.border} hover:border-opacity-50 transition-all duration-200 text-left active:scale-[0.98]`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-3xl flex-shrink-0">
                    {playlist.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-base">{playlist.category}</h3>
                    <p className="text-white/40 text-sm">{playlist.description}</p>
                    <p className={`text-xs mt-1 font-medium ${playlist.accent}`}>
                      {playlist.tracks.length} tracks
                    </p>
                  </div>
                  <span className="text-white/20 text-xl">›</span>
                </div>
              </button>
            ))}

            {/* Note */}
            <div className="card bg-white/3 border-white/5 text-center py-4">
              <p className="text-white/30 text-xs">
                🎧 Best experienced with headphones or earbuds.<br />
                All music is curated for therapeutic benefit.
              </p>
            </div>
          </div>
        )}

        {/* Track List */}
        {selectedPlaylist && (
          <div className="animate-slide-up">
            <button
              onClick={() => setSelectedPlaylist(null)}
              className="text-white/40 text-sm hover:text-white/60 mb-6 flex items-center gap-1"
            >
              ← Back
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl">
                {selectedPlaylist.emoji}
              </div>
              <div>
                <h2 className="text-xl font-display text-white">{selectedPlaylist.category}</h2>
                <p className="text-white/40 text-sm">{selectedPlaylist.description}</p>
              </div>
            </div>

            <div className="space-y-2">
              {selectedPlaylist.tracks.map((track, i) => (
                <button
                  key={i}
                  onClick={() => setPlayingTrack(track)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/8 transition-all duration-200 text-left active:scale-[0.98]"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${selectedPlaylist.color} flex items-center justify-center text-sm flex-shrink-0`}>
                    ▶
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">{track.title}</p>
                    <p className="text-white/40 text-xs">{track.artist}</p>
                  </div>
                  <span className="text-white/30 text-xs flex-shrink-0">{track.duration}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Player Modal */}
      {playingTrack && (
        <PlayerModal track={playingTrack} onClose={() => setPlayingTrack(null)} />
      )}

      <Navbar />
    </div>
  );
};

export default MusicPage;
