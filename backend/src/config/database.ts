import { PrismaClient } from '@prisma/client';
import { toCamelCase } from '../utils/caseConverter';
import _ from 'lodash';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Create a new Prisma client with case conversion middleware
const prismaClient = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
}).$extends({
  query: {
    async $allOperations({ operation, model, args, query }) {
      // Convert input args to snake_case before the query
      const convertArgs = (obj: any): any => {
        if (!obj) return obj;
        if (Array.isArray(obj)) {
          return obj.map(v => convertArgs(v));
        } else if (obj !== null && typeof obj === 'object') {
          return Object.keys(obj).reduce((result, key) => {
            const value = obj[key];
            result[_.snakeCase(key)] = convertArgs(value);
            return result;
          }, {} as Record<string, any>);
        }
        return obj;
      };

      // Convert input arguments to snake_case
      const convertedArgs = args ? convertArgs(args) : args;
      
      // Execute the query
      const result = await query(convertedArgs);
      
      // Convert result to camelCase
      return toCamelCase(result);
    }
  }
});

// Prevent multiple instances of Prisma Client in development
const prisma = global.prisma || prismaClient;

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;
