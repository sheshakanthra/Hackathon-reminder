const PLACE_EMOJI = { '1st': '🥇', '2nd': '🥈', '3rd': '🥉' };

const WinsShowcase = ({ hackathons }) => {
  const wins = hackathons.filter(h => h.status === 'won');

  if (wins.length === 0) return null;

  const shareOnLinkedIn = (hack) => {
    const text = encodeURIComponent(
      `🏆 Excited to share that I won ${hack.name}! ` +
      `${hack.prizeWon ? `Prize: ${hack.prizeWon}. ` : ''}` +
      `${hack.place ? `Placed ${hack.place}. ` : ''}` +
      `Built something awesome with my team. #hackathon #buildinpublic`
    );
    window.open(`https://www.linkedin.com/sharing/share-offsite/?text=${text}`, '_blank');
  };

  return (
    <div className="mt-10">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-px bg-gradient-to-r from-amber-200 to-transparent" />
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full">
          <span className="text-lg">🏆</span>
          <span className="text-sm font-black text-amber-800 uppercase tracking-widest">My Wins</span>
          <span className="text-xs font-black bg-amber-500 text-white w-5 h-5 rounded-full flex items-center justify-center">
            {wins.length}
          </span>
        </div>
        <div className="flex-1 h-px bg-gradient-to-l from-amber-200 to-transparent" />
      </div>

      {/* Trophy shelf */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {wins.map(hack => (
          <div key={hack._id}
               className="relative bg-white rounded-2xl border-l-4 border-amber-500 border border-amber-100
                          shadow-md shadow-amber-50 p-5 overflow-hidden
                          hover:shadow-lg hover:shadow-amber-100 transition-all duration-300">
            {/* Background trophy watermark */}
            <span className="absolute right-4 top-3 text-7xl opacity-5 select-none pointer-events-none">
              🏆
            </span>

            {/* Place badge */}
            {hack.place && (
              <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800
                              text-xs font-black px-3 py-1 rounded-full mb-3">
                {PLACE_EMOJI[hack.place] || '🏅'} {hack.place} Place
              </div>
            )}

            {/* Name */}
            <h3 className="font-black text-gray-900 text-base leading-snug mb-1">
              {hack.name}
            </h3>

            {/* Meta */}
            <div className="space-y-1 mb-4">
              {hack.prizeWon && (
                <p className="text-sm font-bold text-amber-700">💰 {hack.prizeWon}</p>
              )}
              <p className="text-xs text-gray-500">
                {[hack.category, hack.location].filter(Boolean).join(' · ')}
              </p>
              {hack.createdAt && (
                <p className="text-xs text-gray-400">
                  {new Date(hack.createdAt).toLocaleDateString([], { month: 'long', year: 'numeric' })}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => shareOnLinkedIn(hack)}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#0077b5] text-white
                           rounded-xl text-xs font-bold hover:bg-[#005885] transition shadow-sm"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                Share on LinkedIn
              </button>
              {hack.certificateUrl && (
                <a href={hack.certificateUrl} target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-1.5 px-3 py-2 bg-white border border-amber-300
                              text-amber-700 rounded-xl text-xs font-bold hover:bg-amber-50 transition shadow-sm">
                  🎓 Certificate
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WinsShowcase;
