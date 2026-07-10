const themeBtn = document.querySelector('#theme-toggle');
const msgInput = document.querySelector('#message');
const counter = document.querySelector('#char-counter');
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

let isDark = false;

const projectData = [
    { title: 'HTML Profile Page', category: 'html' },
    { title: 'CSS Styled Portfolio', category: 'css' },
    { title: 'Flexbox Navbar', category: 'css' },
    { title: 'Programming Table', category: 'html' },
    { title: 'Responsive Layout', category: 'css' },
    { title: 'Bootstrap Portfolio', category: 'bootstrap' }
];

console.table(projectData);

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

function filterProjects(category) {
    console.log('Filtering by:', category);

    // debugger; was demonstrated in DevTools Sources panel and then commented out before final submission.

    projectCards.forEach((card) => {
        const shouldShow = category === 'all' || card.dataset.category === category;

        card.parentElement.classList.toggle('d-none', !shouldShow);
    });
}

themeBtn.addEventListener('click', toggleTheme);

msgInput.addEventListener('input', updateCharacterCounter);

filterBtns.forEach((button) => {
    button.addEventListener('click', (event) => {
        const category = event.target.dataset.category;

        filterBtns.forEach((btn) => {
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-outline-primary');
        });

        event.target.classList.remove('btn-outline-primary');
        event.target.classList.add('btn-primary');

        filterProjects(category);
    });
});

console.log('script.js loaded successfully');