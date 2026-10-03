import React, { useEffect, useState } from 'react';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  UserCircle2,
} from 'lucide-react';
import { UserProfile } from '../types';
import { isAuthorizedAdminEmail, ADMIN_PASSWORD } from '../lib/adminAuth';
import {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  saveUserProfileToRtdb,
} from '../lib/firebase';
import { getTrendingMedia, getPopularMovies, getPopularTv } from '../services/tmdb';

interface SignUpScreenProps {
  onBackToGetStarted?: () => void;
  onAuthSuccess: (profile: Partial<UserProfile>) => void;
  onGuestContinue: () => void;
}

// Fallback high-definition movie flyers matching Marvel, DC, and blockbusters
const VERIFIED_TMDB_FLYERS = [
  'https://image.tmdb.org/t/p/w500/7WsyChLLEz331M3GScK1P33R32f.jpg', // Avengers: Infinity War
  'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg', // Spider-Man: Across the Spider-Verse
  'https://image.tmdb.org/t/p/w500/r2J02Z2OpNTctetGCSpkmkoZjqn.jpg', // Guardians of the Galaxy Vol 3
  'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg', // Spider-Man: No Way Home
  'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg', // Deadpool & Wolverine
  'https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg', // The Batman
  'https://image.tmdb.org/t/p/w500/8Gxv8ASAil3S39j3y2s2R1G322.jpg', // Oppenheimer
  'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', // Dune: Part Two
  'https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg', // Barbie
  'https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg', // Avatar: The Way of Water
  'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', // Interstellar
  'https://image.tmdb.org/t/p/w500/vZloFAK7NKnMGKEslAoLi6kjvKR.jpg', // John Wick: Chapter 4
  'https://image.tmdb.org/t/p/w500/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg', // Inside Out 2
  'https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg', // Top Gun: Maverick
  'https://image.tmdb.org/t/p/w500/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg', // Gladiator II
  'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg', // Fight Club
  'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg', // The Dark Knight
];

// Traced Disney, Marvel, and DC Comics profile avatars
export interface AvatarCategory {
  title: string;
  items: { id: string; name: string; url: string }[];
}

export const AVATAR_CATEGORIES: AvatarCategory[] = [
  {
    title: 'Disney',
    items: [
      { id: 'simba', name: 'Simba', url: '/avatars/simba.webp' },
      { id: 'mal', name: 'Mal', url: '/avatars/mal.webp' },
      { id: 'olaf', name: 'Olaf', url: '/avatars/olaf.webp' },
      { id: 'jack-skellington', name: 'Jack', url: '/avatars/jack-skellington.webp' },
      { id: 'elsa', name: 'Elsa', url: '/avatars/elsa.webp' },
      { id: 'grogu', name: 'Grogu', url: '/avatars/grogu.webp' },
      { id: 'mickey', name: 'Mickey', url: '/avatars/mickey.webp' },
      { id: 'stitch', name: 'Stitch', url: '/avatars/stitch.webp' },
    ],
  },
  {
    title: 'Marvel',
    items: [
      { id: 'iron-man', name: 'Iron Man', url: '/avatars/iron-man.webp' },
      { id: 'spider-man', name: 'Spider-Man', url: '/avatars/spider-man.webp' },
      { id: 'hulk', name: 'Hulk', url: '/avatars/hulk.webp' },
      { id: 'black-panther', name: 'Black Panther', url: '/avatars/black-panther.webp' },
      { id: 'captain-america', name: 'Captain', url: '/avatars/captain-america.webp' },
      { id: 'thor', name: 'Thor', url: '/avatars/thor.webp' },
      { id: 'groot', name: 'Groot', url: '/avatars/groot.webp' },
      { id: 'deadpool', name: 'Deadpool', url: '/avatars/deadpool.webp' },
      { id: 'wolverine', name: 'Wolverine', url: '/avatars/wolverine.webp' },
      { id: 'thanos', name: 'Thanos', url: '/avatars/thanos.webp' },
    ],
  },
  {
    title: 'DC Comics',
    items: [
      { id: 'batman', name: 'Batman', url: '/avatars/batman.webp' },
      { id: 'superman', name: 'Superman', url: '/avatars/superman.webp' },
      { id: 'wonder-woman', name: 'Wonder Woman', url: '/avatars/wonder-woman.webp' },
      { id: 'the-flash', name: 'The Flash', url: '/avatars/the-flash.webp' },
      { id: 'joker', name: 'Joker', url: '/avatars/joker.webp' },
      { id: 'harley-quinn', name: 'Harley Quinn', url: '/avatars/harley-quinn.webp' },
      { id: 'aquaman', name: 'Aquaman', url: '/avatars/aquaman.webp' },
      { id: 'robin', name: 'Robin', url: '/avatars/robin.webp' },
      { id: 'catwoman', name: 'Catwoman', url: '/avatars/catwoman.webp' },
    ],
  },
];

export const SignUpScreen: React.FC<SignUpScreenProps> = ({
  onAuthSuccess,
  onGuestContinue,
}) => {
  // Creating an account is the default one-time procedure for new installs
  const [isSignUp, setIsSignUp] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Avatar Selection State (Defaulting to Simba)
  const [selectedAvatar, setSelectedAvatar] = useState<string>('/avatars/simba.webp');
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [activeAvatarTab, setActiveAvatarTab] = useState<'All' | 'Disney' | 'Marvel' | 'DC Comics'>('All');

  // Background 3D Flyers
  const [col1Posters, setCol1Posters] = useState<string[]>([]);
  const [col2Posters, setCol2Posters] = useState<string[]>([]);
  const [col3Posters, setCol3Posters] = useState<string[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadRealMoviePosters() {
      try {
        const [trending, movies, tv] = await Promise.all([
          getTrendingMedia(),
          getPopularMovies(),
          getPopularTv(),
        ]);

        const allFlyers = [...trending, ...movies, ...tv]
          .map((item) => item.posterUrl)
          .filter((url) => url && url.startsWith('http') && !url.includes('svg'));

        if (isMounted && allFlyers.length >= 15) {
          const c1 = allFlyers.slice(0, 8);
          const c2 = allFlyers.slice(8, 16);
          const c3 = allFlyers.slice(16, 24);

          setCol1Posters(c1.length > 0 ? c1 : VERIFIED_TMDB_FLYERS.slice(0, 6));
          setCol2Posters(c2.length > 0 ? c2 : VERIFIED_TMDB_FLYERS.slice(6, 12));
          setCol3Posters(c3.length > 0 ? c3 : VERIFIED_TMDB_FLYERS.slice(12, 18));
          return;
        }
      } catch (err) {
        console.warn('Real TMDB flyers load notice:', err);
      }

      if (isMounted) {
        setCol1Posters(VERIFIED_TMDB_FLYERS.slice(0, 6));
        setCol2Posters(VERIFIED_TMDB_FLYERS.slice(6, 12));
        setCol3Posters(VERIFIED_TMDB_FLYERS.slice(12, 18));
      }
    }

    loadRealMoviePosters();

    return () => {
      isMounted = false;
    };
  }, []);

  const p1 = col1Posters.length > 0 ? col1Posters : VERIFIED_TMDB_FLYERS.slice(0, 6);
  const p2 = col2Posters.length > 0 ? col2Posters : VERIFIED_TMDB_FLYERS.slice(6, 12);
  const p3 = col3Posters.length > 0 ? col3Posters : VERIFIED_TMDB_FLYERS.slice(12, 18);

  const getFriendlyErrorMessage = (error: any): string => {
    const code = error?.code || '';
    if (code === 'auth/email-already-in-use') {
      return 'An account with this email already exists. Please switch to Sign In.';
    }
    if (code === 'auth/invalid-email') {
      return 'Please enter a valid email address.';
    }
    if (code === 'auth/weak-password') {
      return 'Password should be at least 6 characters.';
    }
    if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
      return 'Invalid email or password. Please check your credentials.';
    }
    if (code === 'auth/too-many-requests') {
      return 'Too many attempts. Please try again shortly.';
    }
    return error?.message || 'Authentication error. Please try again.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const emailTrim = email.trim();
    const passTrim = password.trim();

    if (!emailTrim || !passTrim) {
      setErrorMsg('Please enter your email and password.');
      return;
    }

    if (passTrim.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    try {
      const emailLower = emailTrim.toLowerCase();
      if (isAuthorizedAdminEmail(emailLower) && passTrim === ADMIN_PASSWORD) {
        const adminProfile: Partial<UserProfile> = {
          username: 'Ashraf (Admin)',
          email: emailTrim,
          movieBoxId: 'MB-ADMIN-001',
          isLoggedIn: true,
          plan: 'VIP Premium',
        };
        setSuccessMsg('Welcome SuperAdmin!');
        setIsLoading(false);
        onAuthSuccess(adminProfile);
        return;
      }

      let fbUser: any = null;
      const displayName = username.trim() || emailTrim.split('@')[0] || 'MovieFan';

      if (isSignUp) {
        try {
          // Attempt to create account
          const userCred = await createUserWithEmailAndPassword(auth, emailTrim, passTrim);
          fbUser = userCred.user;
        } catch (signUpErr: any) {
          // If email already exists, gracefully try signing in directly
          if (signUpErr?.code === 'auth/email-already-in-use') {
            const userCred = await signInWithEmailAndPassword(auth, emailTrim, passTrim);
            fbUser = userCred.user;
          } else {
            throw signUpErr;
          }
        }
      } else {
        try {
          // Attempt to sign in
          const userCred = await signInWithEmailAndPassword(auth, emailTrim, passTrim);
          fbUser = userCred.user;
        } catch (signInErr: any) {
          // If user doesn't exist, gracefully auto-create account
          if (signInErr?.code === 'auth/user-not-found' || signInErr?.code === 'auth/invalid-credential') {
            try {
              const userCred = await createUserWithEmailAndPassword(auth, emailTrim, passTrim);
              fbUser = userCred.user;
            } catch (createErr) {
              throw signInErr;
            }
          } else {
            throw signInErr;
          }
        }
      }

      const movieBoxId = Math.floor(100000000 + Math.random() * 900000000).toString();
      const userProfile: Partial<UserProfile> = {
        uid: fbUser?.uid || `mb_${Date.now()}`,
        username: fbUser?.displayName || displayName,
        email: emailTrim,
        avatarUrl: fbUser?.photoURL || selectedAvatar,
        movieBoxId,
        plan: 'Free Plan',
        isLoggedIn: true,
      };

      // Non-blocking background profile & RTDB sync
      if (fbUser) {
        updateProfile(fbUser, {
          displayName: userProfile.username,
          photoURL: userProfile.avatarUrl,
        }).catch(console.warn);

        saveUserProfileToRtdb(fbUser.uid, {
          username: userProfile.username || displayName,
          email: emailTrim,
          avatarUrl: userProfile.avatarUrl || selectedAvatar,
          movieBoxId,
          plan: 'Free Plan',
        }).catch(console.warn);
      }

      setSuccessMsg(isSignUp ? 'Account ready!' : 'Signed in successfully!');
      setIsLoading(false);
      onAuthSuccess(userProfile);
    } catch (err: any) {
      console.error('Email Auth error:', err);
      setIsLoading(false);
      setErrorMsg(getFriendlyErrorMessage(err));
    }
  };

  // Filtered categories for avatar selector modal
  const displayedCategories =
    activeAvatarTab === 'All'
      ? AVATAR_CATEGORIES
      : AVATAR_CATEGORIES.filter((c) => c.title === activeAvatarTab);

  return (
    <div className="relative w-full h-full bg-[#08090e] text-white overflow-hidden select-none flex flex-col justify-end">
      {/* 3D Perspective and Seamless Infinite Upward Marquee Styles */}
      <style>{`
        @keyframes scrollUpCol1 {
          0% { transform: translateY(0%); }
          100% { transform: translateY(-50%); }
        }
        @keyframes scrollUpCol2 {
          0% { transform: translateY(-20%); }
          100% { transform: translateY(-70%); }
        }
        @keyframes scrollUpCol3 {
          0% { transform: translateY(-10%); }
          100% { transform: translateY(-60%); }
        }

        .scroll-col-1 {
          animation: scrollUpCol1 24s linear infinite;
        }
        .scroll-col-2 {
          animation: scrollUpCol2 18s linear infinite;
        }
        .scroll-col-3 {
          animation: scrollUpCol3 26s linear infinite;
        }

        .perspective-stage {
          perspective: 1100px;
          perspective-origin: 50% 30%;
        }

        .uplifted-3d-board {
          transform: rotateX(25deg) rotateY(-5deg) rotateZ(3deg) scale(1.18);
          transform-style: preserve-3d;
        }
      `}</style>

      {/* FULL BACKGROUND: 3D Uplifted Animated Movie Posters */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="perspective-stage w-full h-full flex items-center justify-center">
          <div className="uplifted-3d-board w-[122%] h-[180%] flex gap-3 px-2">
            {/* Column 1 */}
            <div className="flex-1 h-full overflow-hidden relative [transform:translateZ(10px)]">
              <div className="scroll-col-1 flex flex-col gap-3.5">
                {[...p1, ...p1].map((src, idx) => (
                  <div
                    key={`auth-col1-${idx}`}
                    className="relative w-full aspect-[2/3] rounded-2xl overflow-hidden border border-white/10 shadow-[0_20px_45px_rgba(0,0,0,0.85)] bg-[#121422]"
                  >
                    <img
                      src={src}
                      alt="Movie Flyer"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2 (Middle Column - Elevated Forward in 3D Space) */}
            <div className="flex-1 h-full overflow-hidden relative z-10 -translate-y-8 [transform:translateZ(36px)]">
              <div className="scroll-col-2 flex flex-col gap-3.5">
                {[...p2, ...p2].map((src, idx) => (
                  <div
                    key={`auth-col2-${idx}`}
                    className="relative w-full aspect-[2/3] rounded-2xl overflow-hidden border border-emerald-500/35 shadow-[0_25px_55px_rgba(0,0,0,0.95),0_0_20px_rgba(0,223,130,0.2)] bg-[#121422]"
                  >
                    <img
                      src={src}
                      alt="Movie Flyer"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-emerald-400/10 to-transparent pointer-events-none" />
                  </div>
                ))}
              </div>
            </div>

            {/* Column 3 */}
            <div className="flex-1 h-full overflow-hidden relative [transform:translateZ(16px)]">
              <div className="scroll-col-3 flex flex-col gap-3.5">
                {[...p3, ...p3].map((src, idx) => (
                  <div
                    key={`auth-col3-${idx}`}
                    className="relative w-full aspect-[2/3] rounded-2xl overflow-hidden border border-white/10 shadow-[0_20px_45px_rgba(0,0,0,0.85)] bg-[#121422]"
                  >
                    <img
                      src={src}
                      alt="Movie Flyer"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Subtle Vignette: Smooth background blend while keeping upper flyers clear */}
      <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-[#08090e]/80 via-[#08090e]/30 to-transparent z-10 pointer-events-none" />

      {/* Bottom Subtle Vignette: Soft gradient that preserves visibility of bottom posters */}
      <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-[#08090e]/75 via-[#08090e]/30 to-transparent z-10 pointer-events-none" />

      {/* FOREGROUND: Truly Transparent Glass Card Box */}
      <div className="relative z-20 w-full px-4 pb-7 pt-2 pointer-events-auto">
        <div className="max-w-sm mx-auto w-full bg-black/25 backdrop-blur-md border border-white/20 rounded-3xl p-5 shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
          {/* Switcher & Circular Profile Avatar Selector Row */}
          <div className="flex items-center gap-3 mb-4">
            {/* Box that switches between Create Account and Sign In */}
            <div className="flex-1 flex bg-black/40 p-1 rounded-2xl border border-white/15 backdrop-blur-xs">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(true);
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                  isSignUp
                    ? 'bg-[#00df82] text-black shadow-md font-extrabold'
                    : 'text-zinc-300 hover:text-white'
                }`}
              >
                Create Account
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(false);
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                  !isSignUp
                    ? 'bg-[#00df82] text-black shadow-md font-extrabold'
                    : 'text-zinc-300 hover:text-white'
                }`}
              >
                Sign In
              </button>
            </div>

            {/* At the right: Circular Profile Avatar Picker */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(true)}
                title="Choose Profile Avatar"
                className="relative w-11 h-11 rounded-full p-0.5 border-2 border-[#00df82] bg-black/60 hover:scale-105 active:scale-95 transition-all shadow-lg cursor-pointer flex items-center justify-center group"
              >
                <img
                  src={selectedAvatar}
                  alt="Profile Avatar"
                  className="w-full h-full rounded-full object-cover bg-black/50"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#00df82] text-black flex items-center justify-center text-[9px] font-black shadow ring-1 ring-black">
                  +
                </div>
              </button>
            </div>
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="mb-3 p-2.5 rounded-xl bg-red-500/25 border border-red-500/40 text-red-300 text-xs flex items-start gap-2 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-snug">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-3 p-2.5 rounded-xl bg-emerald-500/25 border border-emerald-500/40 text-[#00df82] text-xs flex items-start gap-2 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-snug">{successMsg}</span>
            </div>
          )}

          {/* Input Form with transparent inputs */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {isSignUp && (
              <div>
                <label className="block text-[11px] font-semibold text-zinc-200 mb-1">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-300" />
                  <input
                    type="text"
                    required={isSignUp}
                    placeholder="e.g. Alex"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-black/35 border border-white/20 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-400 focus:outline-none focus:border-[#00df82] focus:bg-black/50 transition backdrop-blur-xs"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-zinc-200 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-300" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/35 border border-white/20 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-400 focus:outline-none focus:border-[#00df82] focus:bg-black/50 transition backdrop-blur-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-200 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-300" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder={isSignUp ? 'At least 6 characters' : 'Enter your password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/35 border border-white/20 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-zinc-400 focus:outline-none focus:border-[#00df82] focus:bg-black/50 transition backdrop-blur-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-zinc-300 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-[#00df82] hover:bg-[#00c975] active:scale-98 text-black font-extrabold text-sm shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-black" />
              ) : isSignUp ? (
                <span>Create Account</span>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Quick toggle helper text */}
          <div className="mt-3 text-center">
            {isSignUp ? (
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(false);
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="text-[11px] text-zinc-300 hover:text-white transition cursor-pointer"
              >
                Already have an account? <span className="text-[#00df82] font-semibold underline underline-offset-2">Sign In</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(true);
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="text-[11px] text-zinc-300 hover:text-white transition cursor-pointer"
              >
                New device or reinstall? <span className="text-[#00df82] font-semibold underline underline-offset-2">Create Account</span>
              </button>
            )}
          </div>

          {/* Explore as Guest first */}
          <div className="mt-2.5 text-center">
            <button
              type="button"
              onClick={onGuestContinue}
              className="text-xs text-zinc-400 hover:text-[#00df82] transition underline underline-offset-4 cursor-pointer font-medium"
            >
              Explore as Guest first
            </button>
          </div>
        </div>
      </div>

      {/* Avatar Selection Sheet / Modal */}
      {isAvatarModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#0e111a]/95 border-t sm:border border-white/20 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl max-h-[82vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 sticky top-0 bg-[#0e111a] z-10">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <UserCircle2 className="w-4 h-4 text-[#00df82]" />
                  <span>Choose Your Avatar</span>
                </h3>
                <p className="text-[10px] text-zinc-400 mt-0.5">
                  Select your Disney, Marvel, or DC Comics character
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 py-2.5 overflow-x-auto no-scrollbar border-b border-white/5">
              {(['All', 'Disney', 'Marvel', 'DC Comics'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveAvatarTab(tab)}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold transition cursor-pointer shrink-0 ${
                    activeAvatarTab === tab
                      ? 'bg-[#00df82] text-black font-extrabold shadow-sm'
                      : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="space-y-4 pt-3">
              {displayedCategories.map((category) => (
                <div key={category.title}>
                  <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2.5 px-1 flex items-center justify-between">
                    <span>{category.title}</span>
                    <span className="text-[10px] font-normal text-zinc-500 lowercase">
                      {category.items.length} avatars
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {category.items.map((av) => (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => {
                          setSelectedAvatar(av.url);
                          setIsAvatarModalOpen(false);
                        }}
                        className={`group flex flex-col items-center gap-1.5 p-1 rounded-2xl transition-all cursor-pointer ${
                          selectedAvatar === av.url
                            ? 'scale-105'
                            : 'hover:scale-105 opacity-85 hover:opacity-100'
                        }`}
                      >
                        <div
                          className={`relative aspect-square w-14 h-14 rounded-full p-0.5 overflow-hidden transition-all shadow-md ${
                            selectedAvatar === av.url
                              ? 'ring-2 ring-[#00df82] ring-offset-2 ring-offset-black shadow-[#00df82]/30 shadow-lg'
                              : 'border border-white/20 group-hover:border-white/50'
                          }`}
                        >
                          <img
                            src={av.url}
                            alt={av.name}
                            className="w-full h-full rounded-full object-cover bg-black/40"
                          />
                        </div>
                        <span className="text-[10px] font-medium text-zinc-300 truncate max-w-[64px] text-center">
                          {av.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 pb-1 text-center border-t border-white/10 mt-3">
              <p className="text-[10px] text-zinc-400">
                Official Disney, Marvel & DC Comics Avatars
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
