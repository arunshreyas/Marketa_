const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3500';

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    hasBrand?: boolean;
  };
}

export interface BrandData {
  brandName: string;
  productDescription: string;
  targetAudience: string;
  brandTone: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const authAPI = {
  signup: async (username: string, name: string, email: string, password: string): Promise<{ token: string }> => {
    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, name, email, password }),
    });

    if (response.status !== 201) {
      const error = await response.json().catch(() => ({ message: 'Signup failed' }));
      throw new Error(error.message || 'Signup failed');
    }

    return response.json();
  },

  login: async (email: string, password: string): Promise<{ token: string }> => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (response.status !== 200) {
      const error = await response.json().catch(() => ({ message: 'Login failed' }));
      throw new Error(error.message || 'Login failed');
    }

    return response.json();
  },
};

export const brandAPI = {
  saveBrand: async (brandData: BrandData, token: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/brand`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(brandData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to save brand');
    }

    return response.json();
  },

  getBrand: async (token: string): Promise<BrandData> => {
    const response = await fetch(`${API_BASE_URL}/api/brand`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch brand');
    }

    return response.json();
  },
};

export const chatAPI = {
  sendMessage: async (prompt: string, userId: string, token: string): Promise<{ response: string }> => {
    const response = await fetch(`${API_BASE_URL}/api/marketa/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ prompt, userId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get response');
    }

    return response.json();
  },
};

export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

export const setAuthToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('authToken', token);
  }
};

export const removeAuthToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
  }
};

export const getUserData = () => {
  if (typeof window !== 'undefined') {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }
  return null;
};

export const setUserData = (data: any): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('userData', JSON.stringify(data));
  }
};

export const apiClient = {
  async request(endpoint: string, options: RequestInit = {}) {
    const token = getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...(options.headers as Record<string, string>),
      },
    });

    return response;
  },
};
