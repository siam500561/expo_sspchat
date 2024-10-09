/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        outfit_regular: ["Outfit_400Regular"],
        outfit_medium: ["Outfit_500Medium"],
        outfit_bold: ["Outfit_700Bold"],
      },
    },
  },
  plugins: [],
};
