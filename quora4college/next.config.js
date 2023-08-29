/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: ['lh3.googleusercontent.com', 'res.cloudinary.com', 'pixabay.com'],
    },
    env: {
      server: process.env.server,
    },
  }
  
  module.exports = nextConfig