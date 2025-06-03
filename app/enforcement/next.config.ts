import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  basePath: "/enforcement",
  experimental:{
    serverActions: {
      bodySizeLimit: '10mb', // Increase the body size limit for server actions
    }
  }
};

export default nextConfig;
