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
const getDocuments = async (forceRefresh = false) => {
  const cacheKey = "documents:list";
  if (!forceRefresh) {
    const cached = cache.get(cacheKey);
    if (cached) return cached;
  }
  const response = await api.get("/documents");
  cache.set(cacheKey, response.data, 30000);
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
};
export default documentService;
