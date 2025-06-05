// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#3D365C',
        },
        purpleCustom: {
          900: '#7C4585',
        },
      },
    },
  },
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // 👈 Add paths to all source files
  ],
};
