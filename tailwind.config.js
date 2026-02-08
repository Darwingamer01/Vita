/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
            animation: {
                marquee: 'marquee 160s linear infinite',
                float: 'float 6s ease-in-out infinite',
            },
            keyframes: {
                marquee: {
                    '0%': { transform: 'translateX(0%)' },
                    '100%': { transform: 'translateX(-100%)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                shimmer: {
                    '100%': { transform: 'translateX(100%)' },
                }
            },
        },
    },
    plugins: [
        function ({ addUtilities }) {
            addUtilities({
                ".perspective-1000": {
                    perspective: "1000px",
                },
                ".transform-style-3d": {
                    transformStyle: "preserve-3d",
                },
                ".rotate-x-10": {
                    transform: "rotateX(10deg)",
                },
                ".rotate-y-10": {
                    transform: "rotateY(10deg)",
                },
                ".rotate-z-10": {
                    transform: "rotateZ(10deg)",
                },
            });
        },
    ],
};
