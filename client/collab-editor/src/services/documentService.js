import api from "./api";
import cache from "./cache";
const getCollaborators = async (id) => {
  const response = await api.get(`/documents/${id}/collaborators`);
  return response.data;
};
const addCollaborator = async (id, email) => {
  const response = await api.post(`/documents/${id}/collaborators`, { email });
  return response.data;
};
const removeCollaborator = async (id, userId) => {
  const response = await api.delete(`/documents/${id}/collaborators/${userId}`);
  return response.data;
};
const getDocuments = async (options = {}) => {
  const { search, page = 1, limit = 20, forceRefresh = false } = options;
  const cacheKey = `documents:list:${search || ""}:${page}:${limit}`;
  if (!forceRefresh && !search) {
    const cached = cache.get(cacheKey);
    if (cached) return cached;
  }
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (page !== 1) params.append("page", page);
  if (limit !== 20) params.append("limit", limit);
  const url = `/documents${params.toString() ? `?${params}` : ""}`;
  const response = await api.get(url);
  if (!search) {
    cache.set(cacheKey, response.data, 30000);
  }
  return response.data;
};
const getDocument = async (id) => {
  const cacheKey = `document:${id}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;
  const response = await api.get(`/documents/${id}`);
  cache.set(cacheKey, response.data, 60000);
  return response.data;
};
const saveContent = async (id, content, htmlContent) => {
  const response = await api.put(`/documents/${id}/content`, {
    content,
    htmlContent,
  });
  cache.invalidate(`document:${id}`);
  return response.data;
};
const createDocument = async (title) => {
  const response = await api.post("/documents", { title });
  cache.invalidate("documents:list");
  return response.data;
};
const updateTitle = async (id, title) => {
  const response = await api.patch(`/documents/${id}/title`, { title });
  cache.invalidate("documents:list");
  cache.invalidate(`document:${id}`);
  return response.data;
};
const deleteDocument = async (id) => {
  const response = await api.delete(`/documents/${id}`);
  cache.invalidate("documents:list");
  cache.invalidate(`document:${id}`);
  return response.data;
};
const getVersions = async (id) => {
  const response = await api.get(`/documents/${id}/versions`);
  return response.data;
};
const getVersion = async (documentId, versionId) => {
  const response = await api.get(
    `/documents/${documentId}/versions/${versionId}`,
  );
  return response.data;
};
const restoreVersion = async (documentId, versionId) => {
  const response = await api.post(
    `/documents/${documentId}/versions/${versionId}/restore`,
  );
  return response.data;
};
const getActivity = async (id) => {
  const response = await api.get(`/documents/${id}/activity`);
  return response.data;
};
const duplicateDocument = async (id) => {
  const response = await api.post(`/documents/${id}/duplicate`);

  cache.invalidate("documents:list");
  return response.data;
};
const documentService = {
  getDocuments,
  getDocument,
  createDocument,
  updateTitle,
  deleteDocument,
  saveContent,
  getCollaborators,
  addCollaborator,
  removeCollaborator,
  getVersions,
  getVersion,
  restoreVersion,
  getActivity,
  duplicateDocument,
  getTrash: async () => {
    const response = await api.get("/documents/trash");
    return response.data;
  },
  restoreDocument: async (id) => {
    const response = await api.post(`/documents/${id}/restore`);
    cache.invalidate("documents:list");
    return response.data;
  },
  permanentDelete: async (id) => {
    const response = await api.delete(`/documents/${id}/permanent`);
    return response.data;
  },
};

export default documentService;
