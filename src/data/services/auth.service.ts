import { AuthResponse } from "../types/auth.type";

export const authService = {
  async login(
    email: string, 
    password: string
  ): Promise<AuthResponse> {
    const response = await fetch('http://localhost:8080/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao realizar login');
    }

    return data;
  },

  async register(
    name: string,
    email: string, 
    password: string
  ): Promise<AuthResponse> {
    const response = await fetch('http://localhost:8080/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao cadatrar');
    }

    return data;
  },
};