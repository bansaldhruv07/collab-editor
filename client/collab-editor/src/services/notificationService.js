import api from "./api";

const getNotifications = async (options = {}) => {
  const { page = 1, unreadOnly = false } = options;
  const params = new URLSearchParams();
  if (page > 1) params.append("page", page);
  if (unreadOnly) params.append("unreadOnly", "true");

  const url = `/notifications${params.toString() ? `?${params}` : ""}`;
  const response = await api.get(url);
  return response.data;
};

const markAsRead = async (id) => {
  const response = await api.put(`/notifications/${id}/read`);
  return response.data;
};

const markAllAsRead = async () => {
  const response = await api.put("/notifications/read-all");
  return response.data;
};

const deleteNotification = async (id) => {
  const response = await api.delete(`/notifications/${id}`);
  return response.data;
};

const notificationService = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};

export default notificationService;
