// Batch fix for all remaining mock imports
// This file contains all the replacements needed to fix build errors

export const mockImportReplacements = {
  // Replace all @/mock/... imports with @/utils/mockData
  'from \'@/mock/finance\'': 'from \'@/utils/mockData\'',
  'from \'@/mock/members\'': 'from \'@/utils/mockData\'', 
  'from \'@/mock/membership\'': 'from \'@/utils/mockData\'',
  'from \'@/mock/classes\'': 'from \'@/utils/mockData\'',
  'from \'@/mock/feedback\'': 'from \'@/utils/mockData\'',
  'from \'@/mock/leads\'': 'from \'@/utils/mockData\'',
  'from \'@/mock/lockers\'': 'from \'@/utils/mockData\'',
  'from \'@/mock/products\'': 'from \'@/utils/mockData\'',
  'from \'@/mock/teams\'': 'from \'@/utils/mockData\'',
  'from \'@/mock/trainers\'': 'from \'@/utils/mockData\'',
  'from \'@/mock/trainer-assignments\'': 'from \'@/utils/mockData\'',
  'from \'@/mock/trainer-utilization\'': 'from \'@/utils/mockData\'',
  'from \'@/mock/enhanced-trainers\'': 'from \'@/utils/mockData\'',
  'from \'@/mock/attendance\'': 'from \'@/utils/mockData\'',
  'from \'@/mock/member-progress\'': 'from \'@/utils/mockData\'',
};

// Template for placeholder components
export const placeholderComponent = (name: string) => `
import React from 'react';

export default function ${name}() {
  return (
    <div className="flex items-center justify-center p-8 border rounded-lg">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">${name}</h3>
        <p className="text-muted-foreground">Database integration in progress</p>
      </div>
    </div>
  );
}
`;