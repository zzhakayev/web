const STORAGE_KEY = 'portfolio-projects-lab8';

const themeBtn = document.querySelector('#theme-toggle');
const msgInput = document.querySelector('#message');
const counter = document.querySelector('#char-counter');
const filterBtns = document.querySelectorAll('.filter-btn');
const projectGrid = document.querySelector('#project-grid');

const addProjectForm = document.querySelector('#add-project-form');
const projectTitleInput = document.querySelector('#project-title');
const projectDescriptionInput = document.querySelector('#project-description');
const projectCategoryInput = document.querySelector('#project-category');
const lastUpdated = document.querySelector('#last-updated');

let isDark = false;
let currentFilter = 'all';

const defaultProjects = [
    {
        id: 1,
        title: 'HTML Profile Page',
        description: 'A semantic HTML5 page with header, navigation, sections, images, and table.',
        category: 'html',
        image: 'https://placehold.co/800x500/2563eb/ffffff?text=HTML+Page'
    },
    {
        id: 2,
        title: 'CSS Styled Portfolio',
        description: 'A portfolio page styled with colors, spacing, typography, and card components.',
        category: 'css',
        image: 'https://placehold.co/800x500/7c3aed/ffffff?text=CSS+Design'
    },
    {
        id: 3,
        title: 'Flexbox Navbar',
        description: 'A responsive navigation bar created with Flexbox alignment and gap.',
        category: 'css',
        image: 'https://placehold.co/800x500/0f766e/ffffff?text=Flexbox'
    },
    {
        id: 4,
        title: 'Programming Table',
        description: 'An accessible table with caption, table head, table body, and scoped headers.',
        category: 'html',
        image: 'https://placehold.co/800x500/d97706/ffffff?text=Table'
    },
    {
        id: 5,
        title: 'Responsive Layout',
        description: 'A mobile-first layout that works on phones, tablets, and desktop screens.',
        category: 'css',
        image: 'https://placehold.co/800x500/be123c/ffffff?text=Responsive'
    },
    {
        id: 6,
        title: 'Bootstrap Portfolio',
        description: 'A refactored portfolio page using Bootstrap grid, cards, navbar, and forms.',
        category: 'bootstrap',
        image: 'https://placehold.co/800x500/111827/ffffff?text=Bootstrap'
    }
];

function loadProjects() {
    const savedProjects = localStorage.getItem(STORAGE_KEY);

    if (!savedProjects) {
        return defaultProjects.map((project) => ({ ...project }));
    }

    try {
        const parsedProjects = JSON.parse(savedProjects);

        if (Array.isArray(parsedProjects)) {
            return parsedProjects;
        }

        return defaultProjects.map((project) => ({ ...project }));
    } catch (error) {
        console.error('Failed to parse projects from localStorage:', error);
        return defaultProjects.map((project) => ({ ...project }));
    }
}

function saveProjects(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

let projects = loadProjects();

function getCategoryLabel(category) {
    if (category === 'html') {
        return 'HTML';
    }

    if (category === 'css') {
        return 'CSS';
    }

    if (category === 'bootstrap') {
        return 'Bootstrap';
    }

    return 'Project';
}

function getBadgeClass(category) {
    if (category === 'html') {
        return 'bg-primary';
    }

    if (category === 'css') {
        return 'bg-success';
    }

    if (category === 'bootstrap') {
        return 'bg-dark';
    }

    return 'bg-secondary';
}

function getProjectImage(category) {
    if (category === 'html') {
        return 'https://placehold.co/800x500/2563eb/ffffff?text=HTML+Project';
    }

    if (category === 'css') {
        return 'https://placehold.co/800x500/7c3aed/ffffff?text=CSS+Project';
    }

    if (category === 'bootstrap') {
        return 'https://placehold.co/800x500/111827/ffffff?text=Bootstrap';
    }

    return 'https://placehold.co/800x500/6b7280/ffffff?text=Project';
}

function updateFilterButtons() {
    filterBtns.forEach((button) => {
        const isActive = button.dataset.category === currentFilter;

        button.classList.toggle('btn-primary', isActive);
        button.classList.toggle('btn-outline-primary', !isActive);
    });
}

function renderProjects() {
    projectGrid.textContent = '';

    const visibleProjects = projects.filter((project) => {
        return currentFilter === 'all' || project.category === currentFilter;
    });

    if (visibleProjects.length === 0) {
        const emptyColumn = document.createElement('div');
        emptyColumn.className = 'col-12';

        const emptyMessage = document.createElement('p');
        emptyMessage.className = 'text-muted';
        emptyMessage.textContent = 'No projects found for this category.';

        emptyColumn.append(emptyMessage);
        projectGrid.append(emptyColumn);

        console.log('Rendered projects: 0');
        return;
    }

    visibleProjects.forEach((project) => {
        const column = document.createElement('div');
        column.className = 'col';

        column.insertAdjacentHTML('beforeend', `
            <article class="card h-100 shadow-sm border-0 project-card" data-category="${project.category}" data-id="${project.id}">
                <img class="card-img-top project-img" src="${project.image || getProjectImage(project.category)}" alt="">
                <div class="card-body d-flex flex-column">
                    <h3 class="card-title h5 fw-bold"></h3>
                    <p class="card-text text-muted"></p>

                    <div class="mt-auto d-flex justify-content-between align-items-center gap-2">
                        <span class="badge ${getBadgeClass(project.category)}"></span>
                        <button type="button" class="btn btn-outline-danger btn-sm remove-project-btn">
                            Remove
                        </button>
                    </div>
                </div>
            </article>
        `);

        const image = column.querySelector('img');
        const title = column.querySelector('h3');
        const description = column.querySelector('p');
        const badge = column.querySelector('.badge');
        const removeButton = column.querySelector('.remove-project-btn');

        image.alt = `Preview of ${project.title} project`;
        title.textContent = project.title;
        description.textContent = project.description;
        badge.textContent = getCategoryLabel(project.category);

        removeButton.addEventListener('click', () => {
            projects = projects.filter((item) => item.id !== project.id);

            saveProjects(projects);
            renderProjects();

            console.log('Removed project:', project.id);
            console.table(projects);
        });

        projectGrid.append(column);
    });

    console.log('Rendered projects:', visibleProjects.length);
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

themeBtn.addEventListener('click', toggleTheme);

msgInput.addEventListener('input', updateCharacterCounter);

filterBtns.forEach((button) => {
    button.addEventListener('click', (event) => {
        currentFilter = event.target.dataset.category;

        updateFilterButtons();
        renderProjects();

        console.log('Filtering by:', currentFilter);

        // debugger; was demonstrated in DevTools Sources panel and then commented out before final submission.
    });
});

addProjectForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const title = projectTitleInput.value.trim();
    const description = projectDescriptionInput.value.trim();
    const category = projectCategoryInput.value;

    if (!title || !description) {
        console.warn('Project title and description are required.');
        return;
    }

    const newProject = {
        id: Date.now(),
        title: title,
        description: description,
        category: category,
        image: getProjectImage(category)
    };

    projects.push(newProject);
    saveProjects(projects);

    currentFilter = 'all';
    updateFilterButtons();
    renderProjects();

    addProjectForm.reset();

    console.log('Added project:', newProject);
    console.table(projects);
});

function updateTimestamp() {
    lastUpdated.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
}

updateFilterButtons();
renderProjects();
updateCharacterCounter();
updateTimestamp();

setInterval(updateTimestamp, 1000);

console.log('script.js loaded successfully');