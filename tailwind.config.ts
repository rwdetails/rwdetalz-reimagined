import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        glow: "hsl(var(--glow))",
        "glass-bg": "hsl(var(--glass-bg))",
        "glass-border": "hsl(var(--glass-border))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px hsl(var(--glow) / 0.3)" },
          "50%": { boxShadow: "0 0 40px hsl(var(--glow) / 0.6)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "float-bubble": {
          "0%": { 
            transform: "translateY(0) translateX(0) scale(1)",
            opacity: "0.3"
          },
          "50%": { 
            transform: "translateY(-50px) translateX(30px) scale(1.1)",
            opacity: "0.5"
          },
          "100%": { 
            transform: "translateY(-100px) translateX(0) scale(0.9)",
            opacity: "0"
          },
        },
        "bounce-in": {
          "0%": { 
            opacity: "0",
            transform: "scale(0.5)"
          },
          "60%": { 
            opacity: "1",
            transform: "scale(1.1)"
          },
          "100%": { 
            transform: "scale(1)"
          },
        },
        "rotate-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
        "ping-slow": {
          "0%": { 
            transform: "scale(1)",
            opacity: "1"
          },
          "50%": { 
            transform: "scale(1.5)",
            opacity: "0.5"
          },
          "100%": { 
            transform: "scale(2)",
            opacity: "0"
          },
        },
        "twinkle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.3" },
        },
        "shine": {
          "0%": { 
            transform: "translate(-10%, -10%)",
            opacity: "0.5"
          },
          "50%": { 
            transform: "translate(10%, 10%)",
            opacity: "0.8"
          },
          "100%": { 
            transform: "translate(-10%, -10%)",
            opacity: "0.5"
          },
        },
        "wiggle": {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        "scale-pulse": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.6s ease-out",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "float-bubble": "float-bubble 15s ease-in-out infinite",
        "bounce-in": "bounce-in 0.6s ease-out",
        "rotate-slow": "rotate-slow 60s linear infinite",
        "pulse-slow": "pulse-slow 4s ease-in-out infinite",
        "ping-slow": "ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite",
        "twinkle": "twinkle 3s ease-in-out infinite",
        "shine": "shine 8s ease-in-out infinite",
        "wiggle": "wiggle 1s ease-in-out infinite",
        "scale-pulse": "scale-pulse 2s ease-in-out infinite",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-primary": "var(--gradient-primary)",
        "gradient-dark": "var(--gradient-dark)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
