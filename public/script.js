const loginBtn = document.querySelector("#loginBtn");
const exportBtn = document.querySelector("#exportBtn");
const importBtn = document.querySelector("#importBtn");
const downloadBtn = document.querySelector("#downloadBtn");
const switchBtn = document.querySelector("#switchBtn");
const inputFile = document.querySelector("#inputFile");
const statusEl = document.querySelector("#status");
const app = document.querySelector("#app");
const authRow = document.querySelector("#authRow");
const switchRow = document.querySelector("#switchRow");
const userInfo = document.querySelector("#userInfo");
const userNameEl = document.querySelector("#userName");
const avatarEl = document.querySelector("#avatar");
const logEl = document.querySelector("#log");
const progressWrap = document.querySelector("#progressWrap");
const progressEl = document.querySelector("#progress");
const progressLabel = document.querySelector("#progressLabel");

let isLogged = false;
let backupBlob = null;
let progressTimer = null;
let backupData = null;
let selectionState = {
  userName: false,
  profileImage: false,
  playlists: true,
  liked: true,
  albums: true,
  artists: true,
  podcasts: true,
};

init();

function init() {
  loginBtn.onclick = () => {
    loginBtn.disabled = true;
    window.location.href = "/api/login";
  };

  exportBtn.onclick = handleExport;
  importBtn.onclick = () => inputFile.click();
  downloadBtn.onclick = downloadBackup;
  inputFile.onchange = handleImport;
  switchBtn.onclick = switchAccount;
  initSelection();

  hydrateAuthState();
}

function setLogged(state) {
  isLogged = state;

  if (isLogged) {
    app.classList.remove("hidden");
    statusEl.textContent = "Listo. Exporta o importa tus playlists.";
    switchRow.classList.remove("hidden");
    authRow.classList.add("hidden");
    loadProfile();
  } else {
    app.classList.add("hidden");
    statusEl.textContent = "Conecta tu cuenta de Spotify para continuar.";
    downloadBtn.classList.add("hidden");
    switchRow.classList.add("hidden");
    backupBlob = null;
    authRow.classList.remove("hidden");
    userInfo.classList.add("hidden");
  }
}

function initSelection() {
  document.querySelectorAll('#selection input[type="checkbox"]').forEach((chk) => {
    const key = chk.dataset.key;
    chk.checked = selectionState[key];
    chk.onchange = () => {
      selectionState[key] = chk.checked;
    };
  });
}

function hydrateAuthState() {
  const params = new URLSearchParams(window.location.search);
  const authedParam = params.get("authed");
  const authedSession = sessionStorage.getItem("spotifyAuthed");

  if (authedParam === "1") {
    sessionStorage.setItem("spotifyAuthed", "1");
    params.delete("authed");
    const newUrl =
      window.location.pathname +
      (params.toString() ? `?${params.toString()}` : "") +
      window.location.hash;
    window.history.replaceState({}, "", newUrl);
    setLogged(true);
    return;
  }

  setLogged(authedSession === "1");
}

async function handleExport() {
  if (!isLogged) {
    log("Primero inicia sesión con Spotify.");
    return;
  }

  toggleExportState(true);
  startProgress();

  try {
    const res = await fetch("/api/export");
    if (!res.ok) {
      throw new Error(await res.text());
    }

    backupData = await res.json();
    backupBlob = new Blob([JSON.stringify(buildSelectedData(), null, 2)], {
      type: "application/json",
    });

    finishProgress();
    downloadBtn.classList.remove("hidden");
    document.querySelector("#selection").classList.remove("hidden");
    log("Exportación completada. Descarga el archivo.");
  } catch (err) {
    stopProgress();
    log(`Error al exportar: ${err.message}`);
  } finally {
    toggleExportState(false);
  }
}

async function handleImport(e) {
  if (!isLogged) {
    log("Primero inicia sesión con Spotify.");
    return;
  }

  const file = e.target.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    const json = JSON.parse(text);

    const res = await fetch("/api/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(json),
    });

    log(await res.text());
  } catch (err) {
    log(`Error al importar: ${err.message}`);
  } finally {
    inputFile.value = "";
  }
}

function downloadBackup() {
  if (!backupData) {
    log("Primero exporta tus datos.");
    return;
  }

  backupBlob = new Blob([JSON.stringify(buildSelectedData(), null, 2)], {
    type: "application/json",
  });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(backupBlob);
  a.download = "spotify_backup.json";
  a.click();
}

function log(message) {
  logEl.textContent = message;
}

function toggleExportState(isLoading) {
  exportBtn.disabled = isLoading;
  importBtn.disabled = isLoading;
}

function startProgress() {
  progressEl.value = 0;
  progressLabel.textContent = "0%";
  progressWrap.classList.remove("hidden");
  progressTimer = setInterval(() => {
    const next = Math.min(progressEl.value + Math.random() * 12, 90);
    progressEl.value = next;
    progressLabel.textContent = `${Math.round(next)}%`;
  }, 350);
}

function finishProgress() {
  stopProgress();
  progressEl.value = 100;
  progressLabel.textContent = "100%";
  downloadBtn.classList.remove("hidden");
}

function stopProgress() {
  if (progressTimer) {
    clearInterval(progressTimer);
    progressTimer = null;
  }
  progressWrap.classList.add("hidden");
}

function switchAccount() {
  sessionStorage.removeItem("spotifyAuthed");
  userInfo.classList.add("hidden");
  window.location.href = "/api/login";
}

async function loadProfile() {
  try {
    const res = await fetch("/api/session");
    if (!res.ok) return;
    const data = await res.json();
    if (!data.logged) return;

    const { user } = data;
    if (user?.name) userNameEl.textContent = user.name;
    if (user?.image) {
      avatarEl.src = user.image;
      avatarEl.classList.remove("hidden");
    } else {
      avatarEl.classList.add("hidden");
    }
    userInfo.classList.remove("hidden");
  } catch (err) {
    console.error(err);
  }
}

function buildSelectedData() {
  if (!backupData) return {};

  const selected = {};

  if (selectionState.userName || selectionState.profileImage) {
    selected.user = {};
    if (selectionState.userName && backupData.user?.name) {
      selected.user.name = backupData.user.name;
    }
    if (selectionState.profileImage && backupData.user?.image) {
      selected.user.image = backupData.user.image;
    }
    // if nothing got added, drop user
    if (Object.keys(selected.user).length === 0) delete selected.user;
  }

  if (selectionState.playlists) selected.playlists = backupData.playlists || [];
  if (selectionState.liked) selected.liked = backupData.liked || [];
  if (selectionState.albums) selected.albums = backupData.albums || [];
  if (selectionState.artists) selected.artists = backupData.artists || [];
  if (selectionState.podcasts) selected.podcasts = backupData.podcasts || [];

  return selected;
}
