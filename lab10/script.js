const GITHUB_USERNAME = 'zzhakayev';
const API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=6`;

const TIMEOUT_MS = 5000;
const PROJECTS_CACHE_KEY = 'lab10-github-projects';
const COOKIE_NAME = 'visitorName';

const themeBtn = document.querySelector('#theme-toggle');
const msgInput = document.querySelector('#message');
const counter = document.querySelector('#char-counter');

const projectGrid = document.querySelector('#project-grid');
const statusEl = document.querySelector('#project-status');

const greetingBanner = document.querySelector('#greeting');
const commentForm = document.querySelector('#comment-form');
const commentInput = document.querySelector('#comment-input');
const commentList = document.querySelector('#comment-list');

const lastUpdated = document.querySelector('#last-updated');

let isDark = false;

function safeRender(text) {
    const div = document.createElement('div');
    div.textContent = text ?? '';
    return div.innerHTML;
}

function showError(message, type = 'warning') {
    if (!statusEl) {
        return;
    }

    statusEl.className = `alert alert-${type}`;
    statusEl.textContent = message;

    console.warn('Status message:', message);
}

async function fetchWithTimeout(url) {
    const controller = new AbortController();

    const timer = setTimeout(() => {
        controller.abort();
    }, TIMEOUT_MS);

    try {
        return await fetch(url, {
            signal: controller.signal,
            headers: {
                Accept: 'application/vnd.github+json'
            }
        });
    } finally {
        clearTimeout(timer);
    }
}

async function fetchProjects() {
    const response = await fetchWithTimeout(API_URL);

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }

    const repos = await response.json();

    console.log('Fetched live GitHub repos:', repos.length);

    return repos.map((repo) => {
        return {
            id: repo.id,
            title: repo.name,
            description: repo.description || 'No description provided.',
            language: repo.language || 'GitHub',
            url: repo.html_url,
            updated: new Date(repo.updated_at).toLocaleDateString()
        };
    });
}

function saveProjectsToCache(projects) {
    localStorage.setItem(PROJECTS_CACHE_KEY, JSON.stringify(projects));
    console.log('Saved projects to localStorage cache:', projects.length);
}

function loadProjectsFromCache() {
    const cachedProjects = localStorage.getItem(PROJECTS_CACHE_KEY);

    if (!cachedProjects) {
        return null;
    }

    try {
        const parsedProjects = JSON.parse(cachedProjects);

        if (Array.isArray(parsedProjects)) {
            console.log('Loaded projects from cache:', parsedProjects.length);
            return parsedProjects;
        }

        return null;
    } catch (error) {
        console.error('Failed to parse cached projects:', error);
        return null;
    }
}

async function loadProjects() {
    showError('Loading projects from GitHub API...', 'info');

    try {
        const projects = await fetchProjects();

        saveProjectsToCache(projects);

        return projects;
    } catch (error) {
        console.error('Fetch failed:', error.name, error.message);

        const cachedProjects = loadProjectsFromCache();

        if (cachedProjects) {
            showError('Live request failed. Showing saved cached projects.', 'warning');
            return cachedProjects;
        }

        showError('Could not load projects. Please try again later.', 'danger');
        return [];
    }
}

function renderProjects(projects) {
    if (!projectGrid) {
        return;
    }

    projectGrid.textContent = '';

    if (projects.length === 0) {
        const emptyColumn = document.createElement('div');
        emptyColumn.className = 'col-12';

        const emptyMessage = document.createElement('p');
        emptyMessage.className = 'text-muted';
        emptyMessage.textContent = 'No projects available.';

        emptyColumn.append(emptyMessage);
        projectGrid.append(emptyColumn);

        console.log('Rendered 0 projects');
        return;
    }

    projects.forEach((project) => {
        const column = document.createElement('div');
        column.className = 'col';

        column.insertAdjacentHTML('beforeend', `
            <article class="card h-100 shadow-sm border-0 project-card">
                <div class="card-body d-flex flex-column">
                    <h3 class="card-title h5 fw-bold">${safeRender(project.title)}</h3>

                    <p class="card-text text-muted">
                        ${safeRender(project.description)}
                    </p>

                    <p class="small text-muted mb-3">
                        Language: ${safeRender(project.language)}<br>
                        Updated: ${safeRender(project.updated)}
                    </p>

                    <a
                        class="btn btn-outline-primary btn-sm mt-auto"
                        href="${project.url}"
                        target="_blank"
                        rel="noopener">
                        Open on GitHub
                    </a>
                </div>
            </article>
        `);

        projectGrid.append(column);
    });

    showError(`Loaded ${projects.length} projects successfully.`, 'success');

    console.log('Rendered projects:', projects.length);
    console.table(projects);
}

function toggleTheme() {
    isDark = !isDark;

    document.body.classList.toggle('dark-mode', isDark);
    themeBtn.textContent = isDark ? 'Light Theme' : 'Dark Theme';

    console.log('Theme toggled:', isDark);
}

function updateCharacterCounter() {
    const length = msgInput.value.length;

    counter.textContent = `${length}/1000`;

    console.log('Character count:', length);
}

function setVisitorCookie(name) {
    const encodedName = encodeURIComponent(name);

    document.cookie = `${COOKIE_NAME}=${encodedName}; max-age=2592000; path=/; SameSite=Lax`;

    console.log('Visitor cookie set:', name);
}

function getVisitorCookie() {
    const cookies = document.cookie.split('; ');

    const visitorCookie = cookies.find((cookie) => {
        return cookie.startsWith(`${COOKIE_NAME}=`);
    });

    if (!visitorCookie) {
        return null;
    }

    return decodeURIComponent(visitorCookie.split('=')[1]);
}

function greetReturningVisitor() {
    if (!greetingBanner) {
        return;
    }

    const savedName = getVisitorCookie();

    if (savedName) {
        greetingBanner.textContent = `Welcome back, ${savedName}!`;
        console.log('Returning visitor:', savedName);
        return;
    }

    const visitorName = prompt('First time here — what is your name?');

    if (visitorName && visitorName.trim()) {
        const cleanName = visitorName.trim();

        setVisitorCookie(cleanName);
        greetingBanner.textContent = `Nice to meet you, ${cleanName}!`;
    } else {
        greetingBanner.textContent = 'Welcome to my portfolio!';
    }

    console.log('Visitor cookie:', getVisitorCookie());
}

function addComment(text) {
    const commentCard = document.createElement('div');

    commentCard.className = 'bg-white p-3 rounded shadow-sm';

    commentCard.insertAdjacentHTML('beforeend', `
        <p class="mb-0">${safeRender(text)}</p>
    `);

    commentList.append(commentCard);

    console.log('Rendered comment safely:', text);
}

function updateTimestamp() {
    if (!lastUpdated) {
        return;
    }

    lastUpdated.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
}

if (themeBtn) {
    themeBtn.addEventListener('click', toggleTheme);
}

if (msgInput && counter) {
    msgInput.addEventListener('input', updateCharacterCounter);
}

if (commentForm && commentInput && commentList) {
    commentForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const commentText = commentInput.value.trim();

        if (!commentText) {
            console.warn('Comment is empty.');
            return;
        }

        addComment(commentText);
        commentForm.reset();
    });
}

window.addEventListener('offline', () => {
    showError('You are offline. Showing cached data if available.', 'warning');
});

window.addEventListener('DOMContentLoaded', async () => {
    greetReturningVisitor();
    updateCharacterCounter();
    updateTimestamp();

    const projects = await loadProjects();

    renderProjects(projects);

    setInterval(updateTimestamp, 1000);

    console.log('Lab 10 async API features loaded successfully');
});
