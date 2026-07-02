import { initTheme } from "./utils/theme.js";
import { initPomodoro } from "./features/pomodoro.js";
import { initTasksManager } from "./features/tasks.js";

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initPomodoro();
  initTasksManager();

  const submitBtn = document.querySelector(
    '#add-task-form button[type="submit"]',
  );
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.textContent = "Tambah";
  }
});
