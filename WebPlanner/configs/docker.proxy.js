const PROXY_CONFIG = [
  {
      context: [
          "/api",
          "/builder",
          "/misc",
          "/textures",
          "/images",
          "/thumbnails",
          "/previews",
          "/bumpmaps",
          "/bumpthumbs",
          "/connect",
          "/.well-known"
      ],
      target: process.env.FM_HOST || "http://localhost:10080/",
      secure: false,
      changeOrigin: true,
      ws: true
  }
]

module.exports = PROXY_CONFIG;
