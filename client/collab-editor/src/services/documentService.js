import api from "./api";

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

const getDocuments = async () => {
  const response = await api.get("/documents");
  return response.data;
};

const getDocument = async (id) => {
  const response = await api.get(`/documents/${id}`);
  return response.data;
};

const saveContent = async (id, content, htmlContent) => {
  const response = await api.put(`/documents/${id}/content`, {
    content,
    htmlContent,
  });
  return response.data;
};

const createDocument = async (title) => {
  const response = await api.post("/documents", { title });
  return response.data;
};

const updateTitle = async (id, title) => {
  const response = await api.patch(`/documents/${id}/title`, { title });
  return response.data;
};

const deleteDocument = async (id) => {
  const response = await api.delete(`/documents/${id}`);
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
