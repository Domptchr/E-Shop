/** @type {import('next').NextConfig} */
const nextConfig = {
    agentRules: false,
    experimental: {
        optimizePackageImports: ["@untitledui/icons"],
    },
};

export default nextConfig;
