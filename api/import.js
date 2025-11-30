const { getSpotify } = require("./spotify");
const { parseCookies } = require("./cookies");

module.exports = async function handler(req, res) {
  try {
    const cookies = parseCookies(req);
    const token = cookies.access;

    const spotify = getSpotify();

    if (!token) return res.status(401).send("No logueado");
    spotify.setAccessToken(token);

    const backup = req.body;

    for (let pl of backup.playlists) {
      const newPl = await spotify.createPlaylist(pl.name, {
        public: pl.public,
      });

      for (let i = 0; i < pl.tracks.length; i += 100) {
        await spotify.addTracksToPlaylist(
          newPl.body.id,
          pl.tracks.slice(i, i + 100)
        );
      }
    }

    res.send("Importación completada");
  } catch (err) {
    console.log(err);
    res.status(500).send("Error al importar");
  }
};
