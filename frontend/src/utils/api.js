// frontend/src/utils/api.js
export const API_URL = "http://localhost:5000";

export async function getTestMessage() {
  const res = await fetch(`${API_URL}/`); // <-- note the /
  const data = await res.text();
  return data;
}
