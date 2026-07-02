export function saveTasksToStorage(tasks) {
  localStorage.setItem("taskhub_tasks", JSON.stringify(tasks));
}

export function getTasksFromStorage() {
  const storedTasks = localStorage.getItem("taskhub_tasks");
  if (storedTasks) {
    return JSON.parse(storedTasks);
  }
  return [];
}
