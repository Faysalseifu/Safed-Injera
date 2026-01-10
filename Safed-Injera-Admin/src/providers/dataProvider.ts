import { DataProvider, fetchUtils } from 'react-admin';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const httpClient = (url: string, options: fetchUtils.Options = {}) => {
  const token = localStorage.getItem('token');
  const headers = new Headers(options.headers || {});
  
  headers.set('Content-Type', 'application/json');
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  return fetchUtils.fetchJson(url, { ...options, headers });
};

const dataProvider: DataProvider = {
  getList: async (resource, params) => {
    const { page, perPage } = params.pagination || { page: 1, perPage: 10 };
    const { field, order } = params.sort || { field: 'id', order: 'ASC' };
    
    // Handle activity-logs resource name conversion
    const resourcePath = resource === 'activity-logs' ? 'activity-logs' : resource;
    
    // Convert filter params to query params
    const query: Record<string, any> = {
      limit: perPage,
      offset: (page - 1) * perPage,
    };
    
    // Add filters
    if (params.filter) {
      Object.entries(params.filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          // Map react-admin filter keys to API query params
          if (key === 'q') {
            // Search query - backend should handle this
            query.search = value;
          } else if (key === 'entityType') {
            query.entityType = value;
          } else if (key === 'actionType') {
            query.actionType = value;
          } else {
            query[key] = value;
          }
        }
      });
    }
    
    const queryString = Object.entries(query)
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
      .join('&');
    
    const url = `${API_URL}/${resourcePath}?${queryString}`;
    const { json, headers } = await httpClient(url);
    
    const contentRange = headers.get('Content-Range');
    const total = contentRange 
      ? parseInt(contentRange.split('/').pop() || '0', 10)
      : json.length;
    
    return {
      data: json.map((item: any) => ({ 
        ...item, 
        id: item.id || item._id,
        createdAt: item.created_at || item.createdAt,
        userUsername: item.user_username || item.userUsername,
        entityType: item.entity_type || item.entityType,
        entityId: item.entity_id || item.entityId,
        actionType: item.action_type || item.actionType,
      })),
      total,
    };
  },

  getOne: async (resource, params) => {
    // Handle activity-logs resource name conversion
    const resourcePath = resource === 'activity-logs' ? 'activity-logs' : resource;
    const { json } = await httpClient(`${API_URL}/${resourcePath}/${params.id}`);
    return { data: { ...json, id: json._id || json.id || json.id } };
  },

  getMany: async (resource, params) => {
    const responses = await Promise.all(
      params.ids.map(id => httpClient(`${API_URL}/${resource}/${id}`))
    );
    return {
      data: responses.map(({ json }) => ({ ...json, id: json._id || json.id })),
    };
  },

  getManyReference: async (resource, params) => {
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    
    const query = {
      [params.target]: params.id,
      _start: (page - 1) * perPage,
      _end: page * perPage,
      _sort: field,
      _order: order,
      ...params.filter,
    };
    
    const queryString = Object.entries(query)
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
      .join('&');
    
    const url = `${API_URL}/${resource}?${queryString}`;
    const { json, headers } = await httpClient(url);
    
    const contentRange = headers.get('Content-Range');
    const total = contentRange 
      ? parseInt(contentRange.split('/').pop() || '0', 10)
      : json.length;
    
    return {
      data: json.map((item: any) => ({ ...item, id: item._id || item.id })),
      total,
    };
  },

  create: async (resource, params) => {
    const { json } = await httpClient(`${API_URL}/${resource}`, {
      method: 'POST',
      body: JSON.stringify(params.data),
    });
    return { data: { ...json, id: json._id || json.id } };
  },

  update: async (resource, params) => {
    const { json } = await httpClient(`${API_URL}/${resource}/${params.id}`, {
      method: 'PUT',
      body: JSON.stringify(params.data),
    });
    return { data: { ...json, id: json._id || json.id } };
  },

  updateMany: async (resource, params) => {
    await Promise.all(
      params.ids.map(id =>
        httpClient(`${API_URL}/${resource}/${id}`, {
          method: 'PUT',
          body: JSON.stringify(params.data),
        })
      )
    );
    return { data: params.ids };
  },

  delete: async (resource, params) => {
    const { json } = await httpClient(`${API_URL}/${resource}/${params.id}`, {
      method: 'DELETE',
    });
    return { data: { ...json, id: params.id } };
  },

  deleteMany: async (resource, params) => {
    await Promise.all(
      params.ids.map(id =>
        httpClient(`${API_URL}/${resource}/${id}`, {
          method: 'DELETE',
        })
      )
    );
    return { data: params.ids };
  },
};

export default dataProvider;


