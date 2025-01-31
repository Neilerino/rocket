const API_PATH = 'http://dev.rocket:8080/api/v1';

export const getRequest = async <T>(url: string): Promise<T> => {
  const response = await fetch(`${API_PATH}${url}`);
  return (await response.json()) as T;
};

export const postRequest = async <T>(url: string, data: unknown): Promise<T> => {
  const response = await fetch(`${API_PATH}${url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return (await response.json()) as T;
};
