import api from "./axios";

export const getTasks = () => api.get("/tasks/all_tasks");
export const createTask = (data) => api.post("/tasks/create", data);
export const updateTask = (id, data) => api.put(`/tasks/update_task/${id}`, data);
export const deleteTask = (id) => api.delete(`/tasks/delete_task/${id}`);
