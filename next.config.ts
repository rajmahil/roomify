import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "api2-u129up.transloadit.com",
      },

      {
        protocol: "https",
        hostname: "api2-u706up.transloadit.com",
      },
      {
        protocol: "https",
        hostname: "bkngqoknovmaxmpmiuyh.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/images/**",
      },
    ],
  },
};

export default nextConfig;
