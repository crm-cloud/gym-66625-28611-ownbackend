import React from 'react';

// Placeholder functions and data for components during migration
export const createPlaceholderComponent = (name: string) => {
  return () => React.createElement('div', 
    { className: "flex items-center justify-center p-8 border rounded-lg" },
    React.createElement('p', 
      { className: "text-muted-foreground" },
      `${name} component - Database integration pending`
    )
  );
};

export const placeholderData = {
  members: [],
  trainers: [],
  classes: [],
  products: [],
  transactions: [],
  feedback: [],
  leads: [],
  lockers: [],
  teams: [],
  assignments: [],
  utilization: [],
  progressSummary: {},
  goals: []
};