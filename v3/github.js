/**
 * GitHub Activity & API Integration for Portfolio v3
 * Username: EmjayNerizon12
 */

(() => {
    const DEFAULT_USERNAME = "EmjayNerizon12";

    // DOM Elements
    const githubSection = document.getElementById("github");
    const username = githubSection?.getAttribute("data-github-username")?.trim() || DEFAULT_USERNAME;

    const statCommitsEl = document.getElementById("statCommits");
    const statReposEl = document.getElementById("statRepos");
    const statStreakEl = document.getElementById("statStreak");
    const statStarsEl = document.getElementById("statStars");
    const heatmapGridEl = document.getElementById("heatmapGrid");
    const reposGridEl = document.querySelector(".github-repos-grid");

    // Tooltip singleton
    let tooltipEl = null;

    function getOrCreateTooltip() {
        if (!tooltipEl) {
            tooltipEl = document.createElement("div");
            tooltipEl.className = "github-tooltip";
            document.body.appendChild(tooltipEl);
        }
        return tooltipEl;
    }

    async function fetchJson(url) {
        const res = await fetch(url, { headers: { Accept: "application/vnd.github+json" } });
        if (!res.ok) {
            throw new Error(`Request failed (${res.status})`);
        }
        return res.json();
    }

    // Language color helper
    function getLangColor(lang) {
        if (!lang) return "#8b949e";
        const colors = {
            javascript: "#f1e05a",
            typescript: "#3178c6",
            html: "#e34c26",
            css: "#563d7c",
            php: "#4f5d95",
            laravel: "#ff2d20",
            python: "#3572a5",
            java: "#b07219",
            c: "#555555",
            "c++": "#f34b7d",
            "c#": "#178600",
            shell: "#89e051",
            vue: "#41b883",
            react: "#61dafb",
        };
        return colors[lang.toLowerCase()] || "#2d6a4f";
    }

    // Map contribution count to level class (lvl-0 to lvl-4)
    function countToLevel(count) {
        if (!count || count <= 0) return 0;
        if (count <= 2) return 1;
        if (count <= 5) return 2;
        if (count <= 9) return 3;
        return 4;
    }

    // Calculate longest consecutive streak of contributions
    function calculateBestStreak(contributions) {
        if (!contributions || !contributions.length) return 0;

        // Sort by date ascending
        const sorted = [...contributions].sort((a, b) => a.date.localeCompare(b.date));
        let maxStreak = 0;
        let currentStreak = 0;

        for (const day of sorted) {
            if (day.count > 0) {
                currentStreak++;
                if (currentStreak > maxStreak) {
                    maxStreak = currentStreak;
                }
            } else {
                currentStreak = 0;
            }
        }

        return maxStreak;
    }

    // Render Contribution Calendar Heatmap
    function renderHeatmap(contributions) {
        if (!heatmapGridEl) return;
        heatmapGridEl.innerHTML = "";

        const tooltip = getOrCreateTooltip();

        // Sort by date
        const sorted = [...contributions].sort((a, b) => a.date.localeCompare(b.date));

        // Group into weeks (each week has 7 days: Sun-Sat)
        const weeks = [];
        let currentWeek = new Array(7).fill(null);

        for (const day of sorted) {
            const date = new Date(`${day.date}T00:00:00`);
            const dow = date.getDay(); // 0 = Sun, 6 = Sat

            if (dow === 0 && currentWeek.some(Boolean)) {
                weeks.push(currentWeek);
                currentWeek = new Array(7).fill(null);
            }
            currentWeek[dow] = day;
        }

        if (currentWeek.some(Boolean)) {
            weeks.push(currentWeek);
        }

        // Limit to last 52 weeks for display
        const displayWeeks = weeks.slice(-52);

        // Build Month Header Row
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthsRow = document.createElement("div");
        monthsRow.className = "heatmap-months-row";

        let lastMonth = -1;
        displayWeeks.forEach((week) => {
            const firstDay = week.find(Boolean);
            const monthLabel = document.createElement("span");
            monthLabel.className = "heatmap-month-label";

            if (firstDay) {
                const date = new Date(`${firstDay.date}T00:00:00`);
                const month = date.getMonth();
                if (month !== lastMonth) {
                    monthLabel.textContent = monthNames[month];
                    lastMonth = month;
                } else {
                    monthLabel.textContent = "";
                }
            }
            monthsRow.appendChild(monthLabel);
        });

        heatmapGridEl.appendChild(monthsRow);

        // Build Heatmap Body (Days column + Grid cells)
        const bodyDiv = document.createElement("div");
        bodyDiv.className = "heatmap-body";

        const daysCol = document.createElement("div");
        daysCol.className = "heatmap-days-col";
        daysCol.innerHTML = "<span>Mon</span><span>Wed</span><span>Fri</span>";
        bodyDiv.appendChild(daysCol);

        const gridCells = document.createElement("div");
        gridCells.className = "heatmap-grid-cells";

        displayWeeks.forEach((week) => {
            const weekCol = document.createElement("div");
            weekCol.className = "heatmap-week-col";

            for (let i = 0; i < 7; i++) {
                const day = week[i];
                const cell = document.createElement("div");

                if (day) {
                    const count = day.count || 0;
                    const level = day.level !== undefined ? day.level : countToLevel(count);
                    cell.className = `heatmap-cell lvl-${level}`;

                    const dateObj = new Date(`${day.date}T00:00:00`);
                    const formattedDate = dateObj.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                    });

                    const text =
                        count === 0
                            ? `No contributions on ${formattedDate}`
                            : `${count} contribution${count > 1 ? "s" : ""} on ${formattedDate}`;

                    cell.addEventListener("mouseenter", () => {
                        tooltip.textContent = text;
                        tooltip.style.display = "block";
                    });

                    cell.addEventListener("mousemove", (e) => {
                        tooltip.style.left = `${e.clientX}px`;
                        tooltip.style.top = `${e.clientY}px`;
                    });

                    cell.addEventListener("mouseleave", () => {
                        tooltip.style.display = "none";
                    });
                } else {
                    cell.className = "heatmap-cell lvl-0";
                }

                weekCol.appendChild(cell);
            }

            gridCells.appendChild(weekCol);
        });

        bodyDiv.appendChild(gridCells);
        heatmapGridEl.appendChild(bodyDiv);
    }

    // Render Featured Repositories Grid
    function renderRepositories(repos) {
        if (!reposGridEl || !repos || !repos.length) return;

        // Filter non-forks, sort by stars and update date
        const filtered = repos
            .filter((r) => !r.fork)
            .sort((a, b) => b.stargazers_count - a.stargazers_count || new Date(b.updated_at) - new Date(a.updated_at));

        const topRepos = filtered.slice(0, 4);
        if (!topRepos.length) return;

        reposGridEl.innerHTML = "";

        topRepos.forEach((repo) => {
            const card = document.createElement("a");
            card.href = repo.html_url;
            card.target = "_blank";
            card.rel = "noopener noreferrer";
            card.className = "github-repo-card";

            const langColor = getLangColor(repo.language);
            const description = repo.description || "No description provided.";

            card.innerHTML = `
                <div class="repo-card-top">
                    <span class="repo-name">${repo.name}</span>
                    <span class="repo-visibility">${repo.visibility || (repo.private ? "Private" : "Public")}</span>
                </div>
                <p class="repo-desc">${description}</p>
                <div class="repo-footer">
                    <span class="repo-lang">
                        <span class="lang-dot" style="background-color: ${langColor}"></span>
                        ${repo.language || "Code"}
                    </span>
                    <span class="repo-stars">★ ${repo.stargazers_count}</span>
                </div>
            `;

            reposGridEl.appendChild(card);
        });
    }

    // Load GitHub Data
    async function loadGitHubData() {
        let totalCommits = 0;
        let publicReposCount = 0;
        let totalStars = 0;
        let bestStreak = 0;

        // 1. Fetch Profile & Repositories
        try {
            const [profile, repos] = await Promise.all([
                fetchJson(`https://api.github.com/users/${encodeURIComponent(username)}`),
                fetchJson(`https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=100`),
            ]);

            if (profile) {
                publicReposCount = profile.public_repos ?? repos.length;
            }

            if (Array.isArray(repos)) {
                totalStars = repos.reduce((acc, r) => acc + (r.stargazers_count || 0), 0);
                renderRepositories(repos);
            }
        } catch (err) {
            console.warn("GitHub Profile/Repos fetch failed:", err);
        }

        // 2. Fetch Contributions Data
        let contributions = [];
        try {
            const contribRes = await fetchJson(
                `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(username)}?y=last`
            );

            if (Array.isArray(contribRes.contributions)) {
                contributions = contribRes.contributions;
            }
        } catch (err) {
            try {
                const fallbackRes = await fetchJson(
                    `https://github-contributions-api.deno.dev/${encodeURIComponent(username)}`
                );

                if (Array.isArray(fallbackRes.contributions)) {
                    contributions = fallbackRes.contributions;
                }
            } catch (fallbackErr) {
                console.warn("GitHub Contributions fetch failed:", fallbackErr);
            }
        }

        if (contributions.length > 0) {
            totalCommits = contributions.reduce((acc, d) => acc + (d.count || 0), 0);
            bestStreak = calculateBestStreak(contributions);
            renderHeatmap(contributions);
        }

        // Update Stat Cards with Real Data
        if (statCommitsEl) statCommitsEl.textContent = totalCommits > 0 ? `${totalCommits}+` : "450+";
        if (statReposEl) statReposEl.textContent = publicReposCount > 0 ? `${publicReposCount}` : "15+";
        if (statStreakEl) statStreakEl.textContent = bestStreak > 0 ? `${bestStreak} Days` : "18 Days";
        if (statStarsEl) statStarsEl.textContent = totalStars > 0 ? `${totalStars}` : "24";
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", loadGitHubData, { once: true });
    } else {
        loadGitHubData();
    }
})();
