// src/features/task.js
import { saveTasksToStorage, getTasksFromStorage } from '../services/storage.js';

let tasks = [];
let taskIdToDelete = null;
let currentFilter = "all";

export function initTasksManager() {
  // DOM Elements
  const taskForm = document.getElementById("add-task-form");
  const taskInput = document.getElementById("task-input");
  const descriptionInput = document.getElementById("task-description-input");
  const categoryInput = document.getElementById("task-category-input");
  const deadlineDateInput = document.getElementById("deadline-date-input");
  const deadlineTimeInput = document.getElementById("deadline-time-input");

  const pendingList = document.getElementById("pending-list");
  const completedList = document.getElementById("completed-list");
  const pendingEmpty = document.getElementById("pending-empty");
  const filterButtons = document.getElementById("filter-buttons");

  // Dashboard & Insight Elements
  const dashboardProgress = document.getElementById("dashboard-progress");
  const progressBarFill = document.getElementById("progress-bar-fill");
  const progressText = document.getElementById("progress-text");
  const insightCard = document.getElementById("insight-card");
  const insightText = document.getElementById("insight-text");

  // Modal Elements
  const deleteModal = document.getElementById("delete-modal");
  const confirmDeleteBtn = document.getElementById("confirm-delete-btn");
  const cancelDeleteBtn = document.getElementById("cancel-delete-btn");

  const statsModal = document.getElementById("stats-modal");
  const showStatsBtn = document.getElementById("show-stats-btn");
  const closeStatsBtn = document.getElementById("close-stats-btn");
  const statsContent = document.getElementById("stats-content");

  function addTask(e) {
    e.preventDefault();
    const taskName = taskInput.value.trim();
    if (!taskName) return;

    let deadlineString = null;
    if (deadlineDateInput.value) {
      const time = deadlineTimeInput.value || "23:59";
      deadlineString = new Date(
        `${deadlineDateInput.value}T${time}`,
      ).toISOString();
    }

    const newTask = {
      id: Date.now().toString(), // ID unik dari timestamp lokal
      name: taskName,
      description: descriptionInput.value.trim(),
      category: categoryInput.value,
      deadline: deadlineString,
      completed: false,
      completedAt: null,
      createdAt: new Date().toISOString(),
    };

    tasks.push(newTask);
    saveTasksToStorage(tasks);
    renderTasks();
    updateDashboard();

    taskForm.reset();
    categoryInput.value = "umum";
  }

  function toggleTaskComplete(id) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date().toISOString() : null;

    saveTasksToStorage(tasks);
    renderTasks();
    updateDashboard();

    if (task.completed && typeof confetti === "function") {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#6366f1", "#10b981", "#06b6d4"],
      });
    }
  }

  function updateTask(id, newValues) {
    const index = tasks.findIndex((t) => t.id === id);
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...newValues };
      saveTasksToStorage(tasks);
      renderTasks();
      updateDashboard();
    }
  }

  // Delete Modal Logic
  function showDeleteModal(id) {
    taskIdToDelete = id;
    deleteModal.classList.remove("hidden");
  }

  function hideDeleteModal() {
    taskIdToDelete = null;
    deleteModal.classList.add("hidden");
  }

  confirmDeleteBtn.addEventListener("click", () => {
    if (taskIdToDelete) {
      tasks = tasks.filter((t) => t.id !== taskIdToDelete);
      saveTasksToStorage(tasks);
      renderTasks();
      updateDashboard();
      hideDeleteModal();
    }
  });

  cancelDeleteBtn.addEventListener("click", hideDeleteModal);

  // UI Logic
  function updateDashboard() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeTasks = tasks.filter((t) => !t.completed).length;
    const completedToday = tasks.filter(
      (t) => t.completed && t.completedAt && new Date(t.completedAt) >= today,
    ).length;
    const totalLoad = activeTasks + completedToday;

    let percent =
      totalLoad > 0 ? Math.round((completedToday / totalLoad) * 100) : 0;

    dashboardProgress.classList.remove("hidden");
    progressBarFill.style.width = `${percent}%`;
    progressText.textContent = `${completedToday} dari ${totalLoad} tugas selesai hari ini`;

    const now = new Date();
    const nearDeadlineTasks = tasks.filter((t) => {
      if (t.completed || !t.deadline) return false;
      const deadline = new Date(t.deadline);
      const diffHours = (deadline - now) / (1000 * 60 * 60);
      return diffHours > 0 && diffHours <= 48;
    });

    if (nearDeadlineTasks.length > 0) {
      insightCard.classList.remove("hidden");
      insightText.innerHTML = `<span class="font-bold">${nearDeadlineTasks.length} tugas</span> mendekati deadline dalam 48 jam. Gas! 🔥`;
    } else {
      insightCard.classList.add("hidden");
    }
  }

  function getCategoryColor(cat) {
    switch (cat) {
      case "teori":
        return "text-purple-600 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-300 border-purple-100 dark:border-purple-800";
      case "praktikum":
        return "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-100 dark:border-indigo-800";
      case "personal":
        return "text-pink-600 bg-pink-50 dark:bg-pink-900/30 dark:text-pink-300 border-pink-100 dark:border-pink-800";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700";
    }
  }

  function createTaskElement(task) {
    const li = document.createElement("li");
    li.className = `group bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden ${task.completed ? "opacity-60 grayscale-[50%]" : ""}`;
    li.style.animation = "fadeUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards";

    const catClass = getCategoryColor(task.category);
    let deadlineHTML = "";
    if (task.deadline) {
      const d = new Date(task.deadline);
      const isLate = d < new Date() && !task.completed;
      const colorClass = isLate
        ? "text-rose-500 font-semibold"
        : "text-gray-400";
      const timeStr = d.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const dateStr = d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      });
      deadlineHTML = `<div class="flex items-center gap-1 text-xs ${colorClass} mt-3"><span>🕒</span> ${dateStr}, ${timeStr} ${isLate ? "(Telat!)" : ""}</div>`;
    }

    li.innerHTML = `
      <div class="task-display relative z-10">
          <div class="flex justify-between items-start mb-2">
             <span class="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${catClass}">${task.category || "Umum"}</span>
             <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                ${
                  !task.completed
                    ? `
                    <button class="focus-btn p-2 rounded-lg text-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-900/30 transition" title="Focus Mode">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    </button>
                    <button class="edit-btn p-2 rounded-lg text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition" title="Edit">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    </button>`
                    : ""
                }
                <button class="delete-btn p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition" title="Delete">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
             </div>
          </div>
          <div class="flex items-start gap-4">
             <button class="complete-btn flex-shrink-0 mt-1 w-6 h-6 rounded-full border-2 ${task.completed ? "bg-emerald-500 border-emerald-500" : "border-gray-300 dark:border-gray-600 hover:border-indigo-500"} flex items-center justify-center transition-all">
                ${task.completed ? '<svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>' : ""}
             </button>
             <div class="flex-grow min-w-0">
                <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100 leading-tight break-words ${task.completed ? "line-through text-gray-400" : ""}">${task.name}</h3>
                ${task.description ? `<p class="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">${task.description}</p>` : ""}
                ${deadlineHTML}
             </div>
          </div>
      </div>
      <div class="task-edit hidden w-full space-y-3 z-20 relative">
           <input type="text" class="edit-name-input w-full p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-semibold" value="${task.name}">
           <div class="flex gap-2">
                <button class="save-edit-btn flex-1 bg-emerald-500 text-white text-xs py-2 rounded-lg font-medium hover:bg-emerald-600 transition">Save</button>
                <button class="cancel-edit-btn flex-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs py-2 rounded-lg font-medium transition">Cancel</button>
           </div>
      </div>
    `;

    const taskDisplay = li.querySelector(".task-display");
    const taskEdit = li.querySelector(".task-edit");
    const editNameInput = li.querySelector(".edit-name-input");

    li.querySelector(".delete-btn").addEventListener("click", () =>
      showDeleteModal(task.id),
    );
    li.querySelector(".complete-btn").addEventListener("click", () =>
      toggleTaskComplete(task.id),
    );

    if (!task.completed) {
      li.querySelector(".focus-btn").addEventListener("click", () =>
        window.appStartFocusMode(task.name),
      );
      li.querySelector(".edit-btn").addEventListener("click", () => {
        taskDisplay.classList.add("hidden");
        taskEdit.classList.remove("hidden");
      });
      li.querySelector(".cancel-edit-btn").addEventListener("click", () => {
        taskDisplay.classList.remove("hidden");
        taskEdit.classList.add("hidden");
      });
      li.querySelector(".save-edit-btn").addEventListener("click", () => {
        updateTask(task.id, { name: editNameInput.value });
        taskDisplay.classList.remove("hidden");
        taskEdit.classList.add("hidden");
      });
    }
    return li;
  }

  function renderTasks() {
    pendingList.innerHTML = "";
    completedList.innerHTML = "";
    const filteredTasks = tasks.filter(
      (t) => currentFilter === "all" || t.category === currentFilter,
    );
    const pending = filteredTasks.filter((t) => !t.completed);
    const completed = filteredTasks.filter((t) => t.completed);

    pendingEmpty.classList.toggle("hidden", pending.length > 0);

    pending
      .sort((a, b) => {
        if (a.deadline && !b.deadline) return -1;
        if (!a.deadline && b.deadline) return 1;
        if (a.deadline && b.deadline)
          return new Date(a.deadline) - new Date(b.deadline);
        return 0;
      })
      .forEach((t) => pendingList.appendChild(createTaskElement(t)));

    completed.forEach((t) => completedList.appendChild(createTaskElement(t)));
  }

  // Listeners for filter buttons
  filterButtons.addEventListener("click", (e) => {
    if (e.target.classList.contains("filter-btn")) {
      document.querySelectorAll(".filter-btn").forEach((btn) => {
        btn.classList.remove("bg-indigo-600", "text-white");
        btn.classList.add(
          "bg-white",
          "dark:bg-gray-800",
          "text-gray-500",
          "dark:text-gray-400",
        );
      });
      e.target.classList.remove(
        "bg-white",
        "dark:bg-gray-800",
        "text-gray-500",
      );
      e.target.classList.add("bg-indigo-600", "text-white");
      currentFilter = e.target.dataset.filter;
      renderTasks();
    }
  });

  taskForm.addEventListener("submit", addTask);

  showStatsBtn.addEventListener("click", () => {
    const completed = tasks.filter((t) => t.completed).length;
    const pending = tasks.filter((t) => !t.completed).length;
    statsContent.innerHTML = `
        <div class="grid grid-cols-2 gap-4">
            <div class="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl text-center">
                <p class="text-3xl font-bold text-emerald-600 dark:text-emerald-400">${completed}</p>
                <p class="text-xs text-gray-500 uppercase tracking-wide">Selesai</p>
            </div>
            <div class="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-2xl text-center">
                <p class="text-3xl font-bold text-amber-600 dark:text-amber-400">${pending}</p>
                <p class="text-xs text-gray-500 uppercase tracking-wide">Pending</p>
            </div>
        </div>
      `;
    statsModal.classList.remove("hidden");
  });

  closeStatsBtn.addEventListener("click", () =>
    statsModal.classList.add("hidden"),
  );

  tasks = getTasksFromStorage();
  renderTasks();
  updateDashboard();
}