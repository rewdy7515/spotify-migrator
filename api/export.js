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
      user: {},
      playlists: [],
      liked: [],
      albums: [],
      artists: [],
      podcasts: [],
    };

    // perfil
    const me = await spotify.getMe();
    backup.user = {
      id: me.body?.id,
      name: me.body?.display_name,
      image: me.body?.images?.[0]?.url || null,
      country: me.body?.country,
      product: me.body?.product,
    };

    // playlists (paginadas)
    let plOffset = 0;
    let playlistsPage;
    do {
      playlistsPage = await spotify.getUserPlaylists({ limit: 50, offset: plOffset });
      for (let pl of playlistsPage.body.items) {
        const tracks = [];

        let trackOffset = 0;
        let trackPage;
        do {
          trackPage = await spotify.getPlaylistTracks(pl.id, { limit: 100, offset: trackOffset });
          for (let it of trackPage.body.items) {
            if (it.track?.uri) tracks.push(it.track.uri);
          }
          trackOffset += trackPage.body.items.length;
        } while (trackPage.body.next);

        backup.playlists.push({
          name: pl.name,
          public: pl.public,
          tracks,
        });
      }
      plOffset += playlistsPage.body.items.length;
    } while (playlistsPage.body.next);

    // liked tracks (paginadas)
    let likedOffset = 0;
    let likedPage;
    do {
      likedPage = await spotify.getMySavedTracks({ limit: 50, offset: likedOffset });
      for (let it of likedPage.body.items) {
        if (it.track?.uri) backup.liked.push(it.track.uri);
      }
      likedOffset += likedPage.body.items.length;
    } while (likedPage.body.next);

    // albums guardados
    let albumOffset = 0;
    let albumPage;
    do {
      albumPage = await spotify.getMySavedAlbums({ limit: 20, offset: albumOffset });
      for (let it of albumPage.body.items) {
        if (it.album?.uri) backup.albums.push(it.album.uri);
      }
      albumOffset += albumPage.body.items.length;
    } while (albumPage.body.next);

    // artistas seguidos (cursor)
    let artistAfter = undefined;
    let artistPage;
    do {
      artistPage = await spotify.getFollowedArtists({ limit: 50, after: artistAfter });
      for (let it of artistPage.body.artists.items) {
        if (it.uri) backup.artists.push(it.uri);
      }
      artistAfter = artistPage.body.artists.cursors?.after;
    } while (artistPage.body.artists.next);

    // podcasts (shows guardados)
    let showOffset = 0;
    let showPage;
    do {
      showPage = await spotify.getMySavedShows({ limit: 50, offset: showOffset });
      for (let it of showPage.body.items) {
        if (it.show?.uri) backup.podcasts.push(it.show.uri);
      }
      showOffset += showPage.body.items.length;
    } while (showPage.body.next);

    return res.json(backup);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error al exportar");
  }
};
