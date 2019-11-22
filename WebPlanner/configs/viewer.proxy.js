const PROXY_CONFIG = [
  {
      context: [
          "/api",
          "/builder",
          "/misc",
          "/textures",
          "/thumbnails",
          "/previews",
          "/bumpmaps",
          "/bumpthumbs",
          "/connect",
          "/.well-known"
      ],
      target: process.env.FM_HOST || "https://viewer.webplanner.app/",
      secure: false,
      changeOrigin: true,
      ws: true
  }
]

module.exports = PROXY_CONFIG;