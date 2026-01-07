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
    
    const query = {
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

  getOne: async (resource, params) => {
    const { json } = await httpClient(`${API_URL}/${resource}/${params.id}`);
    return { data: { ...json, id: json._id || json.id } };
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


