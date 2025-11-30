function parseCookies(req) {
  const header = req.headers?.cookie;
  if (!header) return {};

  return header.split(";").reduce((acc, pair) => {
    const [k, v] = pair.split("=");
    acc[k?.trim()] = decodeURIComponent(v || "");
    return acc;
  }, {});
}

module.exports = { parseCookies };
