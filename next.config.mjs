import path from 'path';
import { fileURLToPath } from 'url';

// 因为是 .mjs 文件 (ES Module)，需要用这种方式获取 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // 在这里强制配置 Webpack 的路径别名
    config.resolve.alias['@'] = path.join(__dirname, '.');
    return config;
  },
};

export default nextConfig;
