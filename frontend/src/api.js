const API = import.meta.env.VITE_API_URL || "/api";

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem("rmvm_user"));
  } catch {
    return null;
  }
}

export function setUser(user) {
  localStorage.setItem("rmvm_user", JSON.stringify(user));
}

export function clearUser() {
  localStorage.removeItem("rmvm_user");
}

export function getToken() {
  return localStorage.getItem("rmvm_token");
}

export function setToken(token) {
  localStorage.setItem("rmvm_token", token);
}

export function clearToken() {
  localStorage.removeItem("rmvm_token");
}

export async function api(path, method = "GET", body) {
  const token = getToken();

  let resposta;

  try {
    resposta = await fetch(API + path, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Não foi possível conectar ao servidor.");
  }

  const dados = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    throw new Error(dados?.error || "Ocorreu um erro na requisição.");
  }

  return dados;
}
