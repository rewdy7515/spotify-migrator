const { getSpotify } = require("./spotify");
const { parseCookies } = require("./cookies");

module.exports = async function handler(req, res) {
  try {
    const cookies = parseCookies(req);
    const token = cookies.access;

    if (!token) return res.status(200).json({ logged: false });

    const spotify = getSpotify();
    spotify.setAccessToken(token);

    // Verificar que el token sea válido
    const me = await spotify.getMe();

    const user = {
      id: me.body?.id,
      name: me.body?.display_name,
      image: me.body?.images?.[0]?.url || null,
    };

    return res.status(200).json({ logged: true, user });
  } catch (err) {
    console.log(err);
    return res.status(200).json({ logged: false });
  }
};
