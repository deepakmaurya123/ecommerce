export const saveTokens = (data) => {
  if (!data) return;
  if (data.access) {
    localStorage.setItem("access_token", data.access);
  }
  if (data.refresh) {
    localStorage.setItem("refresh_token", data.refresh);
  }
  if (data.user) {
    localStorage.setItem("user", JSON.stringify(data.user));
  }
};

export const getAccessToken = () => {
  return localStorage.getItem("access_token");
};

export const getRefreshToken = () => {
  return localStorage.getItem("refresh_token");
};

export const removeTokens = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
};

export const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};
