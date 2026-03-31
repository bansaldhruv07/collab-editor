import api from "./api";

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

const documentService = {
  getDocuments,
  getDocument,
  createDocument,
  updateTitle,
  deleteDocument,
  saveContent,
};

export default documentService;
