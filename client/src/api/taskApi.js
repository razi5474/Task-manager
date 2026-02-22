import API from "./api";

const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export const getTasks = () => API.get("/tasks", authHeader());

export const createTask = (taskData) =>
  API.post("/tasks", taskData, authHeader());

export const deleteTask = (id) =>
  API.delete(`/tasks/${id}`, authHeader());

export const updateTask = (id, data) =>
  API.put(`/tasks/${id}`, data, authHeader());