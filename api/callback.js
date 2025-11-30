const { getSpotify } = require("./spotify");

module.exports = async function handler(req, res) {
  const code = req.query.code;

  try {
    const spotify = getSpotify();
    const tokenData = await spotify.authorizationCodeGrant(code);

    res.setHeader("Set-Cookie", [
      `access=${tokenData.body.access_token}; Path=/; HttpOnly; SameSite=Lax`,
      `refresh=${tokenData.body.refresh_token}; Path=/; HttpOnly; SameSite=Lax`,
    ]);

    res.redirect("/");
  } catch (err) {
    console.log(err);
    res.status(500).send("Error autenticando con Spotify");
  }
};
