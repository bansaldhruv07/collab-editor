import api from "./api";
const getProfile = async () => {
  const response = await api.get("/users/me");
  return response.data;
};
const updateProfile = async (data) => {
  const response = await api.put("/users/me", data);
  return response.data;
};
const changePassword = async (currentPassword, newPassword) => {
  const response = await api.put("/users/me/password", {
    currentPassword,
    newPassword,
  });
  return response.data;
};
const deleteAccount = async (password) => {
  const response = await api.delete("/users/me", { data: { password } });
  return response.data;
};
const userService = {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
};
export default userService;