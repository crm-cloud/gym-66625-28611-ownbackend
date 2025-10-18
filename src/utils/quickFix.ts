// Quick fix for all remaining imports - replace with database hooks or mockData where appropriate

// For pages and components that still import deleted mock files:
export const createPlaceholderContent = (componentName: string) => `
// Placeholder component until database migration is complete
export default function ${componentName}() {
  return (
    <div className="flex items-center justify-center p-8 border rounded-lg">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">${componentName}</h3>
        <p className="text-muted-foreground">Database integration in progress</p>
      </div>
    </div>
  );
}
`;

// Standard replacements for common mock imports
export const standardReplacements = {
  mockMembers: 'useMembers hook data',
  mockBranches: 'useBranches hook data', 
  mockTrainers: 'useTrainers hook data',
  mockClasses: 'useGymClasses hook data',
  mockMembershipPlans: 'useMembershipPlans hook data'
};