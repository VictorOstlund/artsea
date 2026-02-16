import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.vam.ac.uk" },
      { protocol: "https", hostname: "**.tate.org.uk" },
      { protocol: "https", hostname: "**.barbican.org.uk" },
      { protocol: "https", hostname: "**.southbankcentre.co.uk" },
    ],
  },
};

export default nextConfig;
