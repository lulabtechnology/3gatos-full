import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";


export default {
darkMode: ["class"],
content: [
"./app/**/*.{ts,tsx}",
"./components/**/*.{ts,tsx}",
"./lib/**/*.{ts,tsx}"
],
theme: {
extend: {
colors: {
border: "hsl(214 32% 91%)",
input: "hsl(214 32% 91%)",
ring: "hsl(214 32% 17%)",
background: "#ffffff",
foreground: "#0f172a",
primary: { DEFAULT: "#0ea5e9", foreground: "#ffffff" },
muted: { DEFAULT: "#f8fafc", foreground: "#64748b" },
card: { DEFAULT: "#ffffff", foreground: "#0f172a" }
},
borderRadius: { xl: "1rem", "2xl": "1.25rem" }
}
},
plugins: [animate]
} satisfies Config;
