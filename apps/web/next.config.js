/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["@repo/ui"],
        async rewrites() {
            const backendOrigin = process.env.BACKEND_ORIGIN;
            if (!backendOrigin) {
                throw new Error("Missing BACKEND_ORIGIN in web environment");
            }
            return [
                {
                    source: "/api/backend/:path*",
                    destination: `${backendOrigin}/api/v1/:path*`,
                },
            ];
        },
};

export default nextConfig;
