#!/bin/bash
# Mass replace all mock imports with utils/mockData imports
# This is a quick fix to resolve all build errors at once

# Replace all @/mock/ imports with @/utils/mockData
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/@\/mock\/[a-z-]*/@\/utils\/mockData/g'

echo "All mock imports have been replaced with utils/mockData"