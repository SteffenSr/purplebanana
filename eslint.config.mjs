import nextConfig from "eslint-config-next";

const config = [...nextConfig, { ignores: ["out/**", ".next/**"] }];

export default config;
