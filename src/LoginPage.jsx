import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

const LoginPage = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);

    // Mouse position for 3D tilt effect
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Smooth spring physics for the tilt
    const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
    const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

    // Transform mouse position to rotation degrees
    const rotateX = useTransform(mouseY, [-0.5, 0.5], [15, -15]); // Tilt up/down
    const rotateY = useTransform(mouseX, [-0.5, 0.5], [-15, 15]); // Tilt left/right

    const handleMouseMove = (e) => {
        const { clientX, clientY, innerWidth, innerHeight } = e;
        // Normalize mouse position from -0.5 to 0.5
        const normalizedX = (clientX / innerWidth) - 0.5;
        const normalizedY = (clientY / innerHeight) - 0.5;

        x.set(normalizedX);
        y.set(normalizedY);
    };

    // Reset tilt on mouse leave
    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (username === 'Manvendra.Singh' && password === '1234') {
            onLogin();
        } else {
            setError(true);
            // Reset error animation after a brief moment
            setTimeout(() => setError(false), 500);
        }
    };

    return (
        <div
            className="h-screen w-full bg-[#050505] flex items-center justify-center overflow-hidden relative perspective-1000"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse delay-1000" />
            </div>

            {/* 3D Tilt Container */}
            <motion.div
                style={{
                    rotateX,
                    rotateY,
                    transformStyle: "preserve-3d"
                }}
                className="relative z-10 w-full max-w-md px-4"
            >
                {/* Header Section - Floating above card */}
                <motion.div
                    className="text-center mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{ transform: "translateZ(50px)" }}
                >
                    <div className="inline-block p-4 rounded-full bg-white/5 backdrop-blur-md border border-white/10 mb-4 shadow-[0_0_30px_rgba(0,255,204,0.2)]">
                        <img src="/logo.png" alt="NITPLANE Logo" className="w-12 h-12 object-contain drop-shadow-[0_0_10px_cyan]" />
                    </div>
                    <h1 className="text-4xl font-bold text-white tracking-[0.2em] mb-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                        NITPLANE
                    </h1>
                    <p className="text-cyan-400 text-xs tracking-[0.3em] uppercase">
                        Login to see flight
                    </p>
                </motion.div>

                {/* Login Card */}
                <motion.div
                    className={`
            relative bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 
            shadow-[0_0_50px_rgba(0,0,0,0.5)]
            md:hover:shadow-[0_0_50px_rgba(0,255,204,0.1)] transition-shadow duration-500
            ${error ? 'animate-shake border-red-500/50' : ''}
          `}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    style={{ transform: "translateZ(20px)" }}
                >
                    {/* Neon Glow Border Effect */}
                    <div className="absolute inset-0 rounded-3xl pointer-events-none bg-gradient-to-br from-white/5 to-transparent opacity-50" />

                    <form onSubmit={handleSubmit} className="space-y-6 relative z-20">
                        <div className="space-y-2">
                            <label className="text-xs text-gray-400 tracking-widest ml-1">USERNAME</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all duration-300"
                                placeholder="Enter username"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs text-gray-400 tracking-widest ml-1">PASSWORD</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all duration-300"
                                placeholder="••••••••"
                            />
                        </div>

                        {error && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-red-400 text-xs text-center tracking-wider"
                            >
                                ACCESS DENIED - INVALID CREDENTIALS
                            </motion.p>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-4 rounded-xl tracking-widest hover:shadow-[0_0_20px_rgba(0,255,204,0.4)] transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            INITIALIZE SYSTEM
                        </button>
                    </form>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
