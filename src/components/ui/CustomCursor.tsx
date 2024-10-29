"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect } from "react";
import { Ticket } from "lucide-react";
import { useTheme } from "next-themes";

export const CustomCursor = () => {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const { theme } = useTheme();

  const springConfig = { damping: 25, stiffness: 700 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  const isDark = theme === "dark";
  const primaryColor = isDark ? "rgb(248 248 252)" : "rgb(23 23 23)";
  const glowColor = isDark
    ? "rgba(248, 248, 252, 0.2)"
    : "rgba(23, 23, 23, 0.2)";
  const particleColor = isDark ? "rgb(234 179 8)" : "rgb(234 179 8)";

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    window.addEventListener("mousemove", moveCursor);
    return () => window.removeEventListener("mousemove", moveCursor);
  }, []);

  return (
    <motion.div
      className="custom-cursor-wrapper fixed top-0 left-0 w-full h-full pointer-events-none z-50"
      style={{
        x: cursorXSpring,
        y: cursorYSpring,
      }}
    >
      <div className="relative -left-8 -top-8">
        {/* Outer glow ring */}
        <motion.div
          className="absolute rounded-full w-16 h-16 backdrop-blur-sm"
          style={{ backgroundColor: glowColor }}
          initial={{ scale: 0, rotate: 0 }}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Middle ring with dollar signs */}
        <motion.div
          className="absolute rounded-full w-12 h-12 border-2 left-2 top-2 flex items-center justify-center overflow-hidden"
          style={{ borderColor: `${primaryColor}40` }}
          initial={{ scale: 0, rotate: 0 }}
          animate={{
            scale: [1, 1.1, 1],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {/* Animated dollar signs */}
          {[...Array(4)].map((_, i) => (
            <motion.span
              key={i}
              className="absolute font-bold text-sm"
              style={{ color: `${primaryColor}60` }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{
                opacity: [0, 1, 0],
                y: [-20, -30],
                x: Math.sin((i * Math.PI) / 2) * 10,
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeOut",
              }}
            >
              $
            </motion.span>
          ))}
        </motion.div>

        {/* Inner circle with ticket icon */}
        <motion.div
          className="absolute rounded-full w-8 h-8 backdrop-blur-md flex items-center justify-center left-4 top-4 overflow-hidden"
          style={{ backgroundColor: primaryColor }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.2 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
          }}
        >
          <motion.div
            className="relative"
            style={{ color: isDark ? "rgb(23 23 23)" : "rgb(248 248 252)" }}
            initial={{ scale: 0.8 }}
            animate={{
              scale: [0.8, 1.2, 0.8],
              rotate: [-10, 10, -10],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Ticket className="h-4 w-4" />
          </motion.div>

          {/* Shine effect */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: isDark
                ? "linear-gradient(45deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)"
                : "linear-gradient(45deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)",
            }}
            animate={{
              x: ["-200%", "200%"],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </motion.div>

        {/* Particles effect - modified to look like small sparkles/coins */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: `${particleColor}90` }}
            initial={{
              scale: 0,
              x: 0,
              y: 0,
              opacity: 0,
            }}
            animate={{
              scale: [0, 1, 0],
              x: [0, (i % 2 ? 20 : -20) * Math.sin(i * 60)],
              y: [0, (i % 2 ? -20 : 20) * Math.cos(i * 60)],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeOut",
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};
