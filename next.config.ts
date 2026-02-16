import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.vam.ac.uk" },
      { protocol: "https", hostname: "**.tate.org.uk" },
      { protocol: "https", hostname: "**.barbican.org.uk" },
      { protocol: "https", hostname: "**.southbankcentre.co.uk" },
      { protocol: "https", hostname: "**.nationalgallery.org.uk" },
      { protocol: "https", hostname: "designmuseum.org" },
      { protocol: "https", hostname: "**.whitechapelgallery.org" },
      { protocol: "https", hostname: "**.somersethouse.org.uk" },
      { protocol: "https", hostname: "**.serpentinegalleries.org" },
      { protocol: "https", hostname: "d37zoqglehb9o7.cloudfront.net" },
      { protocol: "https", hostname: "**.saatchigallery.com" },
    ],
  },
};

export default nextConfig;
