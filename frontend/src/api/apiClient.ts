const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

export async function apiFetch(
    endpoint: string,
    options?: RequestInit
) {
    return fetch("https://weavercrm.com${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options?.headers,
        },
    });
}