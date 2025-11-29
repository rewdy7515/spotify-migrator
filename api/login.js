const { getSpotify } = require("./spotify");

module.exports = async function handler(req, res) {
  try {
    const spotify = getSpotify();

    const scopes = [
      "playlist-read-private",
      "playlist-read-collaborative",
      "playlist-modify-private",
      "playlist-modify-public",
      "user-library-read",
      "user-library-modify",
      "user-follow-read",
      "user-follow-modify",
    ];

    const url = spotify.createAuthorizeURL(scopes);
    res.writeHead(302, { Location: url }).end();
  } catch (err) {
    console.error(err);
    res.status(500).send("Error de configuración de Spotify (revisa variables de entorno).");
  }
};
