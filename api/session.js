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
    await spotify.getMe();

    return res.status(200).json({ logged: true });
  } catch (err) {
    console.log(err);
    return res.status(200).json({ logged: false });
  }
};
