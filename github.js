(() => {
  const section = document.querySelector("#projects[data-github-username]");
  const username = section?.getAttribute("data-github-username")?.trim();

  if (!username) return;

  const nameEl = document.getElementById("githubName");
  const bioEl = document.getElementById("githubBio");
  const avatarEl = document.getElementById("githubAvatar");
  const profileLinkEl = document.getElementById("githubProfileLink");
  const reposContainer = document.getElementById("githubProjects");
  const errorEl = document.getElementById("githubError");

  if (!reposContainer) return;

  function showError(message) {
    if (!errorEl) return;
    errorEl.textContent = message;
    errorEl.classList.remove("d-none");
  }

  function clearError() {
    if (!errorEl) return;
    errorEl.textContent = "";
    errorEl.classList.add("d-none");
  }

  function renderRepoCard(repo) {
    const col = document.createElement("div");
    col.className = "col-md-6 col-lg-4 reveal";

    const card = document.createElement("div");
    card.className = "card-surface hover-lift p-4 h-100 d-flex flex-column";

    const top = document.createElement("div");
    top.className = "d-flex align-items-start justify-content-between gap-3";

    const title = document.createElement("h3");
    title.className = "h6 fw-semibold mb-2";
    title.textContent = repo.name || "Repository";

    const stars = document.createElement("span");
    stars.className = "badge text-bg-light border";
    stars.textContent = `⭐ ${repo.stargazers_count ?? 0}`;

    top.appendChild(title);
    top.appendChild(stars);

    const desc = document.createElement("p");
    desc.className = "text-muted mb-3";
    desc.textContent = repo.description || "No description";

    const bottom = document.createElement("div");
    bottom.className = "d-flex gap-2 flex-wrap mt-auto align-items-center";

    const lang = document.createElement("span");
    lang.className = "badge text-bg-light border";
    lang.textContent = repo.language || "Unknown";
    bottom.appendChild(lang);

    if (repo.archived) {
      const archived = document.createElement("span");
      archived.className = "badge text-bg-light border";
      archived.textContent = "Archived";
      bottom.appendChild(archived);
    }

    const link = document.createElement("a");
    link.className = "btn btn-sm btn-outline-secondary ms-auto";
    link.href = repo.html_url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "View";
    bottom.appendChild(link);

    card.appendChild(top);
    card.appendChild(desc);
    card.appendChild(bottom);
    col.appendChild(card);
    return col;
  }

  async function fetchJson(url) {
    const res = await fetch(url, { headers: { Accept: "application/vnd.github+json" } });
    if (!res.ok) {
      throw new Error(`GitHub request failed (${res.status})`);
    }
    return res.json();
  }

  async function load() {
    clearError();

    try {
      const profile = await fetchJson(`https://api.github.com/users/${encodeURIComponent(username)}`);

      if (nameEl) nameEl.textContent = profile.name || profile.login || username;
      if (bioEl) bioEl.textContent = profile.bio || "";
      if (avatarEl) avatarEl.src = profile.avatar_url || "";

      const profileUrl = profile.html_url || `https://github.com/${username}`;
      if (profileLinkEl) {
        profileLinkEl.href = profileUrl;
        profileLinkEl.target = "_blank";
        profileLinkEl.rel = "noopener noreferrer";
      }

      const repos = await fetchJson(
        `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=12`
      );

      reposContainer.innerHTML = "";
      for (const repo of repos.filter((r) => !r.fork)) {
        reposContainer.appendChild(renderRepoCard(repo));
      }

      const reveals = Array.from(reposContainer.querySelectorAll(".reveal"));
      for (const el of reveals) el.classList.add("is-visible");
    } catch (err) {
      showError(
        "Unable to load GitHub repositories right now. (Tip: GitHub API has rate limits, so try again later.)"
      );
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", load, { once: true });
  } else {
    load();
  }
})();
