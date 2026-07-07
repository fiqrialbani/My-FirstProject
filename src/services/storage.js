import { STORAGE_KEYS } from '../config/constants.js';

export function saveTasksToStorage(tasks) {
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
}

export function getTasksFromStorage() {
  const storedTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
  if (storedTasks) {
    return JSON.parse(storedTasks);
  }
  return [];
}