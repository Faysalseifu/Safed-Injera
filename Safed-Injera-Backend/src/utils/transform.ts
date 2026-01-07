/**
 * Utility functions for transforming between database snake_case and frontend camelCase
 */

/**
 * Convert a snake_case string to camelCase
 */
const snakeToCamel = (str: string): string => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

/**
 * Convert a camelCase string to snake_case
 */
const camelToSnake = (str: string): string => {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
};

/**
 * Transform an object from snake_case keys to camelCase keys
 */
export const toCamelCase = <T extends Record<string, any>>(obj: T): any => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => toCamelCase(item));
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  const transformed: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = snakeToCamel(key);
    
    if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
      if (Array.isArray(value)) {
        transformed[camelKey] = value.map(item => 
          typeof item === 'object' && item !== null ? toCamelCase(item) : item
        );
      } else {
        transformed[camelKey] = toCamelCase(value);
      }
    } else {
      transformed[camelKey] = value;
    }
  }
  
  return transformed;
};

/**
 * Transform an object from camelCase keys to snake_case keys
 */
export const toSnakeCase = <T extends Record<string, any>>(obj: T): any => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => toSnakeCase(item));
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  const transformed: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = camelToSnake(key);
    
    if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
      if (Array.isArray(value)) {
        transformed[snakeKey] = value.map(item => 
          typeof item === 'object' && item !== null ? toSnakeCase(item) : item
        );
      } else {
        transformed[snakeKey] = toSnakeCase(value);
      }
    } else {
      transformed[snakeKey] = value;
    }
  }
  
  return transformed;
};

/**
 * Transform stock record from database format to API format
 */
export const transformStock = (stock: any) => {
  return toCamelCase(stock);
};

/**
 * Transform order record from database format to API format
 */
export const transformOrder = (order: any) => {
  return toCamelCase(order);
};

/**
 * Transform stock input from API format to database format
 */
export const transformStockInput = (input: any) => {
  return toSnakeCase(input);
};

/**
 * Transform order input from API format to database format
 */
export const transformOrderInput = (input: any) => {
  return toSnakeCase(input);
};

