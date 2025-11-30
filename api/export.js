const { getSpotify } = require("./spotify");
const { parseCookies } = require("./cookies");

module.exports = async function handler(req, res) {
  try {
    const cookies = parseCookies(req);
    const token = cookies.access;

    const spotify = getSpotify();

    if (!token) return res.status(401).send("No logueado");
    spotify.setAccessToken(token);

    const backup = {
      playlists: [],
      liked: [],
      albums: [],
      artists: [],
    };

    // playlists
    let pls = await spotify.getUserPlaylists({ limit: 50 });
    for (let pl of pls.body.items) {
      const tracks = [];
      let t = await spotify.getPlaylistTracks(pl.id, { limit: 100 });

      for (let it of t.body.items) {
        if (it.track?.uri) tracks.push(it.track.uri);
      }

      backup.playlists.push({
        name: pl.name,
        public: pl.public,
        tracks,
      });
    }

    // liked tracks
    let liked = await spotify.getMySavedTracks({ limit: 50 });
    for (let it of liked.body.items) {
      backup.liked.push(it.track.uri);
    }

    return res.json(backup);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error al exportar");
  }
};
