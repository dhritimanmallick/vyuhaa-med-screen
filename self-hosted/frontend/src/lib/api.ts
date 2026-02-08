/**
 * Self-hosted API client - replaces Supabase client
 * Drop-in replacement for use with local PostgreSQL backend
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const TILE_SERVER_URL = import.meta.env.VITE_TILE_SERVER_URL || 'http://localhost:3000';

// Token storage
const ACCESS_TOKEN_KEY = 'vyuhaa_access_token';
const REFRESH_TOKEN_KEY = 'vyuhaa_refresh_token';
const USER_KEY = 'vyuhaa_user';

class ApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private user: any = null;
  private authChangeCallbacks: ((event: string, session: any) => void)[] = [];

  constructor() {
    this.loadTokensFromStorage();
  }

  private loadTokensFromStorage() {
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
      this.refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      const userStr = localStorage.getItem(USER_KEY);
      if (userStr) {
        try {
          this.user = JSON.parse(userStr);
        } catch (e) {
          this.user = null;
        }
      }
    }
  }

  private saveTokensToStorage(accessToken: string, refreshToken: string, user: any) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.user = user;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  }

  private clearTokensFromStorage() {
    this.accessToken = null;
    this.refreshToken = null;
    this.user = null;
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  }

  private notifyAuthChange(event: string) {
    const session = this.accessToken ? { user: this.user } : null;
    this.authChangeCallbacks.forEach(cb => cb(event, session));
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_URL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle token expiration
    if (response.status === 401 && this.refreshToken) {
      const refreshed = await this.refreshSession();
      if (refreshed) {
        headers['Authorization'] = `Bearer ${this.accessToken}`;
        return fetch(url, { ...options, headers });
      }
    }

    return response;
  }

  async refreshSession(): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: this.refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        this.accessToken = data.access_token;
        this.user = data.user;
        localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }
    
    this.clearTokensFromStorage();
    this.notifyAuthChange('SIGNED_OUT');
    return false;
  }

  // Auth methods (Supabase-compatible interface)
  auth = {
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          return { data: null, error: { message: data.error || 'Login failed' } };
        }

        this.saveTokensToStorage(data.access_token, data.refresh_token, data.user);
        this.notifyAuthChange('SIGNED_IN');

        return { data: { user: data.user, session: { access_token: data.access_token } }, error: null };
      } catch (error: any) {
        return { data: null, error: { message: error.message || 'Login failed' } };
      }
    },

    signOut: async (options?: { scope?: string }) => {
      try {
        await this.request('/api/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refresh_token: this.refreshToken }),
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
      
      this.clearTokensFromStorage();
      this.notifyAuthChange('SIGNED_OUT');
      return { error: null };
    },

    getSession: async () => {
      if (!this.accessToken) {
        return { data: { session: null }, error: null };
      }

      return {
        data: {
          session: {
            user: this.user,
            access_token: this.accessToken,
          },
        },
        error: null,
      };
    },

    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      this.authChangeCallbacks.push(callback);
      
      // Immediately call with current state
      if (this.accessToken) {
        callback('INITIAL_SESSION', { user: this.user });
      }

      return {
        data: {
          subscription: {
            unsubscribe: () => {
              const index = this.authChangeCallbacks.indexOf(callback);
              if (index > -1) {
                this.authChangeCallbacks.splice(index, 1);
              }
            },
          },
        },
      };
    },

    getUser: async () => {
      if (!this.accessToken) {
        return { data: { user: null }, error: null };
      }
      return { data: { user: this.user }, error: null };
    },
  };

  // Database query builder (Supabase-compatible interface)
  from(table: string) {
    return new QueryBuilder(this, table);
  }

  // Storage (local filesystem via backend)
  storage = {
    from: (bucket: string) => ({
      upload: async (path: string, file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch(`${API_URL}/api/upload/${bucket}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          return { data: null, error };
        }

        const data = await response.json();
        return { data: { path: data.url }, error: null };
      },

      getPublicUrl: (path: string) => ({
        data: { publicUrl: `${API_URL}${path}` },
      }),
    }),
  };
}

class QueryBuilder {
  private client: ApiClient;
  private table: string;
  private selectFields: string = '*';
  private filters: string[] = [];
  private orderByField: string | null = null;
  private orderDirection: 'asc' | 'desc' = 'asc';
  private limitValue: number | null = null;
  private isSingle: boolean = false;

  constructor(client: ApiClient, table: string) {
    this.client = client;
    this.table = table;
  }

  select(fields: string = '*') {
    this.selectFields = fields;
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push(`${column}=${encodeURIComponent(value)}`);
    return this;
  }

  neq(column: string, value: any) {
    this.filters.push(`${column}!==${encodeURIComponent(value)}`);
    return this;
  }

  in(column: string, values: any[]) {
    this.filters.push(`${column}=in.(${values.join(',')})`);
    return this;
  }

  is(column: string, value: any) {
    this.filters.push(`${column}=is.${value}`);
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderByField = column;
    this.orderDirection = options?.ascending === false ? 'desc' : 'asc';
    return this;
  }

  limit(count: number) {
    this.limitValue = count;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  async then(resolve: (result: { data: any; error: any }) => void) {
    const result = await this.execute();
    resolve(result);
  }

  private async execute(): Promise<{ data: any; error: any }> {
    try {
      let endpoint = `/api/${this.table}`;
      const params = new URLSearchParams();
      
      this.filters.forEach(f => {
        const [key, value] = f.split('=');
        params.append(key, value);
      });

      if (this.orderByField) {
        params.append('order', `${this.orderByField}.${this.orderDirection}`);
      }

      if (this.limitValue) {
        params.append('limit', this.limitValue.toString());
      }

      const queryString = params.toString();
      if (queryString) {
        endpoint += `?${queryString}`;
      }

      const response = await this.client.request(endpoint);
      
      if (!response.ok) {
        const error = await response.json();
        return { data: null, error };
      }

      let data = await response.json();
      
      if (this.isSingle) {
        data = Array.isArray(data) ? data[0] : data;
      }

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  async insert(values: any) {
    try {
      const response = await this.client.request(`/api/${this.table}`, {
        method: 'POST',
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json();
        return { data: null, error };
      }

      const data = await response.json();
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  async update(values: any) {
    try {
      // Extract ID from filters
      const idFilter = this.filters.find(f => f.startsWith('id='));
      if (!idFilter) {
        return { data: null, error: { message: 'ID required for update' } };
      }
      const id = idFilter.split('=')[1];

      const response = await this.client.request(`/api/${this.table}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json();
        return { data: null, error };
      }

      const data = await response.json();
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }

  async delete() {
    try {
      const idFilter = this.filters.find(f => f.startsWith('id='));
      if (!idFilter) {
        return { data: null, error: { message: 'ID required for delete' } };
      }
      const id = idFilter.split('=')[1];

      const response = await this.client.request(`/api/${this.table}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        return { data: null, error };
      }

      return { data: {}, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  }
}

// Export singleton instance (drop-in replacement for supabase client)
export const api = new ApiClient();

// For compatibility with existing imports
export const supabase = api;

// Tile server helper
export const getTileServerUrl = () => TILE_SERVER_URL;
export const getApiUrl = () => API_URL;
