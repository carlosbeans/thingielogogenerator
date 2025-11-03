/** @type {import('next').NextConfig} */
const nextConfig = {
     transpilePackages: ["three", "@react-three/fiber", "@react-three/postprocessing"],
     webpack: (config) => {
          config.module.rules.push({
               test: /\.(glsl|vs|fs|vert|frag)$/,
               use: ["raw-loader"],
          });
          return config;
     },
};

export default nextConfig;
