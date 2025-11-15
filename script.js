/* Elements */
const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const stats = document.getElementById('stats');
const filters = document.querySelectorAll('.filter');
const currentDate = document.getElementById('currentDate');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

let tasks = []; // {id, text, completed}
let currentFilter = 'all';

/* --- date display --- */
function updateDate() {
  const d = new Date();
  const opts = { weekday: 'short', month: 'short', day: 'numeric' };
  currentDate.textContent = d.toLocaleDateString(undefined, opts);
}
updateDate();

/* --- theme --- */
function loadTheme() {
  const t = localStorage.getItem('theme') || 'light';
  if (t === 'dark') {
    document.body.classList.add('dark');
    themeIcon.textContent = '☀️';
  } else {
    document.body.classList.remove('dark');
    themeIcon.textContent = '🌙';
  }
}
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  themeIcon.textContent = isDark ? '☀️' : '🌙';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});
loadTheme();

/* --- persist tasks --- */
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

/* --- load tasks on start --- */
function loadTasks() {
  const raw = JSON.parse(localStorage.getItem('tasks') || '[]');
  tasks = Array.isArray(raw) ? raw : [];
  renderTasks();
}
loadTasks();

/* --- utility --- */
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/* --- add task --- */
taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;
  const newTask = { id: uid(), text, completed: false };
  tasks.unshift(newTask);
  saveTasks();
  taskInput.value = '';
  renderTasks(true);
});

/* --- render --- */
function renderTasks(animated = false) {
  taskList.innerHTML = '';
  const filtered = tasks.filter((t) => {
    if (currentFilter === 'all') return true;
    if (currentFilter === 'active') return !t.completed;
    return t.completed;
  });

  filtered.forEach((t) => {
    const li = document.createElement('li');
    li.className = 'task-item';
    if (animated) li.classList.add('fade-in');

    // left: checkbox + text
    const left = document.createElement('div');
    left.className = 'task-left';

    const cb = document.createElement('div');
    cb.className = 'checkbox';
    if (t.completed) {
      cb.classList.add('checked');
      cb.innerHTML = '✓';
    }

    cb.addEventListener('click', () => {
      t.completed = !t.completed;
      saveTasks();
      renderTasks();
    });

    const txt = document.createElement('div');
    txt.className = 'task-text';
    txt.textContent = t.text;
    if (t.completed) txt.classList.add('completed');

    left.append(cb, txt);

    // actions
    const actions = document.createElement('div');
    actions.className = 'task-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'icon-btn';
    editBtn.innerHTML = '✏️';
    editBtn.title = 'Edit';
    editBtn.addEventListener('click', () => {
      const val = prompt('Edit task', t.text);
      if (val !== null) {
        t.text = val.trim();
        saveTasks();
        renderTasks();
      }
    });

    const delBtn = document.createElement('button');
    delBtn.className = 'icon-btn';
    delBtn.innerHTML = '🗑️';
    delBtn.title = 'Delete';
    delBtn.addEventListener('click', () => {
      li.classList.add('fade-out');
      setTimeout(() => {
        tasks = tasks.filter((x) => x.id !== t.id);
        saveTasks();
        renderTasks();
      }, 250);
    });

    actions.append(editBtn, delBtn);
    li.append(left, actions);
    taskList.appendChild(li);
  });

  stats.textContent = `${tasks.length} task${tasks.length === 1 ? '' : 's'}`;
  document.querySelectorAll('.filter').forEach((f) =>
    f.classList.toggle('active', f.dataset.filter === currentFilter)
  );
}

/* --- filters --- */
filters.forEach((btn) => {
  btn.addEventListener('click', () => {
    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});
