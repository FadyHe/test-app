import type { Config } from "tailwindcss";
import twAnimateCss from "tw-animate-css";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  plugins: [twAnimateCss],
};

export default config;
