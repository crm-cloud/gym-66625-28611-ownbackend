import _ from 'lodash';

/**
 * Converts object keys from snake_case to camelCase
 */
export function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(v => toCamelCase(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      const value = obj[key];
      const newKey = _.camelCase(key);
      result[newKey] = toCamelCase(value);
      return result;
    }, {} as Record<string, any>);
  }
  return obj;
}

/**
 * Converts object keys from camelCase to snake_case
 */
export function toSnakeCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(v => toSnakeCase(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      const value = obj[key];
      const newKey = _.snakeCase(key);
      result[newKey] = toSnakeCase(value);
      return result;
    }, {} as Record<string, any>);
  }
  return obj;
}
