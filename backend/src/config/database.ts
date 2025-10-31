import { PrismaClient, Prisma } from '@prisma/client';
import { toCamelCase } from '../utils/caseConverter';
import _ from 'lodash';

// Define a custom type for the extended Prisma client
type ExtendedPrismaClient = PrismaClient & {
  $extends: (extension: any) => ExtendedPrismaClient;
};

declare global {
  // eslint-disable-next-line no-var
  var prisma: ExtendedPrismaClient | undefined;
}

// Create a new Prisma client with case conversion middleware
const prismaClient = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
}) as unknown as ExtendedPrismaClient;

// Extend the client with case conversion middleware
const extendedPrisma = prismaClient.$extends({
  query: {
    async $allOperations({ operation, model, args, query }: any) {
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

      try {
        // Convert input arguments to snake_case
        const convertedArgs = args ? convertArgs(args) : args;
        
        // Execute the query
        const result = await query(convertedArgs);
        
        // Convert result to camelCase
        return toCamelCase(result);
      } catch (error) {
        console.error('Prisma query error:', {
          operation,
          model,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        throw error;
      }
    }
  }
});

// Prevent multiple instances of Prisma Client in development
const prisma = global.prisma || extendedPrisma;

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Export the typed Prisma client
export default prisma;

// Re-export Prisma types for convenience
export { Prisma };
