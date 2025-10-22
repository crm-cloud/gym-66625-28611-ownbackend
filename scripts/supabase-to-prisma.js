import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Client } from 'pg';

// Configuration
const CONFIG = {
  supabase: {
    host: 'db.gfrpkapmievifpqfhjrp.supabase.co',
    port: 5432,
    user: 'postgres',
    password: 'Rajat@3003',
    database: 'postgres',
    schema: 'public,auth',
    ssl: { rejectUnauthorized: false },
  },
  output: {
    schemaFile: join(dirname(fileURLToPath(import.meta.url)), '../backend/prisma/schema.prisma'),
    enums: true,
    models: true,
    relations: true,
  },
  typeMappings: {
    // Standard PostgreSQL to Prisma type mappings
    'smallint': 'Int',
    'integer': 'Int',
    'bigint': 'BigInt',
    'decimal': 'Decimal',
    'numeric': 'Decimal',
    'real': 'Float',
    'double precision': 'Float',
    'serial': 'Int @default(autoincrement())',
    'bigserial': 'BigInt @default(autoincrement())',
    'uuid': 'String @default(uuid())',
    'text': 'String',
    'varchar': 'String',
    'char': 'String',
    'bytea': 'Bytes',
    'boolean': 'Boolean',
    'date': 'DateTime',
    'timestamp': 'DateTime',
    'timestamptz': 'DateTime @db.Timestamptz',
    'time': 'DateTime',
    'timetz': 'DateTime',
    'interval': 'Unsupported("interval")',
    'json': 'Json',
    'jsonb': 'Json',
  },
  // Special handling for Supabase auth tables
  authTables: ['users', 'sessions', 'identities', 'audit_log_entries', 'mfa_factors', 'mfa_challenges', 'sso_providers'],
  // Skip these tables from processing
  skipTables: ['spatial_ref_sys', 'pg_stat_statements', 'pg_stat_statements_info', 'pg_stat_progress_create_index', 'pg_stat_progress_vacuum'],
  // Custom type overrides
  typeOverrides: {
    'created_at': { type: 'DateTime', default: '@default(now())' },
    'updated_at': { type: 'DateTime', default: '@updatedAt' },
    'deleted_at': { type: 'DateTime?', default: null },
    'email': { type: 'String? @db.VarChar(255)' },
  },
};

// Special field handlers for common fields
const SPECIAL_FIELDS = {
  'created_at': { type: 'DateTime', default: '@default(now())', isRequired: true },
  'updated_at': { type: 'DateTime', default: '@updatedAt', isRequired: true },
  'is_active': { type: 'Boolean', default: '@default(true)', isRequired: false },
  'is_deleted': { type: 'Boolean', default: '@default(false)', isRequired: false },
  'status': { type: 'String', isRequired: true },
  'deleted_at': { type: 'DateTime?', isRequired: false },
  'email': { type: 'String? @db.VarChar(255)', isRequired: false },
};

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Prisma schema content
let prismaSchema = `// This file was auto-generated from Supabase SQL schema
// Generated at: ${new Date().toISOString()}
// Using Supabase to Prisma converter

generator client {
  provider = "prisma-client-js"
  previewFeatures = ["filterJson"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

`;

// Connect to Supabase database
async function getDatabaseSchema() {
  const client = new Client({
    host: CONFIG.supabase.host,
    port: CONFIG.supabase.port,
    user: CONFIG.supabase.user,
    password: CONFIG.supabase.password,
    database: CONFIG.supabase.database,
  });

  try {
    await client.connect();
    console.log('🔌 Connected to Supabase database');

    // Get enums
    const enums = await getEnums(client);
    
    // Get tables and their columns
    const tables = await getTables(client);
    
    // Get foreign key relationships
    const relations = await getRelations(client);
    
    // Get indexes
    const indexes = await getIndexes(client);
    
    return { enums, tables, relations, indexes };
  } finally {
    await client.end();
  }
}

async function getEnums(client) {
  const query = `
    SELECT t.typname as enum_name, 
           e.enumlabel as enum_value
    FROM pg_type t 
    JOIN pg_enum e ON t.oid = e.enumtypid  
    JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = ANY($1::text[])
    ORDER BY t.typname, e.enumsortorder`;
    
  const result = await client.query(query, [[...CONFIG.supabase.schema.split(','), 'public']]);
  
  // Group enum values by enum name
  const enums = {};
  for (const row of result.rows) {
    if (!enums[row.enum_name]) {
      enums[row.enum_name] = [];
    }
    enums[row.enum_name].push(row.enum_value);
  }
  
  return Object.entries(enums).map(([name, values]) => ({
    name,
    values: [...new Set(values)] // Remove duplicates if any
  }));
}

async function getTables(client) {
  const query = `
    SELECT 
      t.table_name,
      c.column_name,
      c.udt_name as data_type,
      c.column_default,
      c.is_nullable,
      c.character_maximum_length,
      c.numeric_precision,
      c.numeric_scale,
      c.is_identity,
      c.identity_generation,
      c.is_generated,
      c.generation_expression,
      c.is_updatable,
      c.is_insertable_into,
      c.column_comment,
      pgd.description as column_comment_pg
    FROM information_schema.tables t
    JOIN information_schema.columns c 
      ON t.table_name = c.table_name 
      AND t.table_schema = c.table_schema
    LEFT JOIN pg_catalog.pg_statio_all_tables st
      ON t.table_schema = st.schemaname AND t.table_name = st.relname
    LEFT JOIN pg_catalog.pg_description pgd
      ON pgd.objsubid = c.ordinal_position 
      AND pgd.objoid = st.relid
    WHERE t.table_schema = ANY($1::text[])
      AND t.table_type = 'BASE TABLE'
      AND t.table_name NOT LIKE 'pg_%'
      AND t.table_name NOT LIKE 'sql_%'
      AND t.table_name NOT LIKE '_prisma_%'
      AND t.table_name NOT IN (${CONFIG.skipTables.map((_, i) => `$${i + 2}`).join(',')})
    ORDER BY t.table_name, c.ordinal_position`;
    
  const result = await client.query(
    query, 
    [CONFIG.supabase.schema.split(','), ...CONFIG.skipTables]
  );
  
  // Group columns by table
  const tables = {};
  for (const row of result.rows) {
    if (!tables[row.table_name]) {
      tables[row.table_name] = [];
    }
    tables[row.table_name].push(row);
  }
  
  return Object.entries(tables).map(([tableName, columns]) => ({
    name: tableName,
    columns: columns.map(col => ({
      name: col.column_name,
      type: col.data_type,
      isNullable: col.is_nullable === 'YES',
      defaultValue: col.column_default,
      isIdentity: col.is_identity === 'YES',
      isGenerated: col.is_generated === 'ALWAYS',
      comment: col.column_comment || col.column_comment_pg,
      maxLength: col.character_maximum_length,
      numericPrecision: col.numeric_precision,
      numericScale: col.numeric_scale
    }))
  }));
}

async function getRelations(client) {
  const query = `
    SELECT
      tc.table_schema, 
      tc.constraint_name, 
      tc.table_name, 
      kcu.column_name, 
      ccu.table_schema AS foreign_table_schema,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name,
      rc.update_rule,
      rc.delete_rule,
      rc.match_option
    FROM 
      information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      JOIN information_schema.referential_constraints AS rc
        ON rc.constraint_name = tc.constraint_name
        AND rc.constraint_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY' 
      AND tc.table_schema = ANY($1::text[])
    ORDER BY tc.table_schema, tc.table_name, kcu.ordinal_position`;
    
  const result = await client.query(query, [CONFIG.supabase.schema.split(',')]);
  
  // Group by constraint to handle composite foreign keys
  const constraints = {};
  for (const row of result.rows) {
    const key = `${row.table_schema}.${row.constraint_name}`;
    if (!constraints[key]) {
      constraints[key] = {
        tableSchema: row.table_schema,
        constraintName: row.constraint_name,
        tableName: row.table_name,
        foreignTableSchema: row.foreign_table_schema,
        foreignTableName: row.foreign_table_name,
        columns: [],
        foreignColumns: [],
        updateRule: row.update_rule,
        deleteRule: row.delete_rule,
        matchOption: row.match_option
      };
    }
    constraints[key].columns.push(row.column_name);
    constraints[key].foreignColumns.push(row.foreign_column_name);
  }
  
  return Object.values(constraints);
}

async function getIndexes(client) {
  const query = `
    SELECT
      t.schemaname,
      t.tablename,
      c.relname,
      a.attname,
      ix.indisprimary,
      ix.indisunique,
      ix.indisclustered,
      ix.indisvalid,
      pg_get_indexdef(ix.indexrelid) as indexdef
    FROM
      pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      JOIN pg_index ix ON c.oid = ix.indexrelid
      JOIN pg_class t ON ix.indrelid = t.oid
      JOIN pg_attribute a ON a.attrelid = c.oid
    WHERE
      t.relkind = 'r'  -- Ordinary tables only
      AND c.relkind = 'i'  -- Indexes only
      AND n.nspname = ANY($1::text[])
      AND t.relname NOT LIKE 'pg_%'
      AND t.relname NOT LIKE 'sql_%'
      AND t.relname NOT LIKE '_prisma_%'
      AND t.relname NOT IN (${CONFIG.skipTables.map((_, i) => `$${i + 2}`).join(',')})
    ORDER BY
      t.relname,
      c.relname,
      array_position(ix.indkey, a.attnum)`;
      
  const result = await client.query(
    query, 
    [CONFIG.supabase.schema.split(','), ...CONFIG.skipTables]
  );
  
  // Group by table and index name
  const indexes = {};
  for (const row of result.rows) {
    const tableKey = `${row.schemaname}.${row.tablename}`;
    const indexKey = `${tableKey}.${row.relname}`;
    
    if (!indexes[tableKey]) {
      indexes[tableKey] = [];
    }
    
    let index = indexes[tableKey].find(i => i.name === row.relname);
    if (!index) {
      index = {
        name: row.relname,
        table: row.tablename,
        schema: row.schemaname,
        isPrimary: row.indisprimary,
        isUnique: row.indisunique,
        isClustered: row.indisclustered,
        isValid: row.indisvalid,
        definition: row.indexdef,
        columns: []
      };
      indexes[tableKey].push(index);
    }
    
    index.columns.push(row.attname);
  }
  
  return indexes;
}

// Generate Prisma schema from database metadata
async function generatePrismaSchema({ enums, tables, relations, indexes }) {
  let schema = '';
  
  // 1. Add enums
  if (enums.length > 0) {
    schema += '// Enums\n';
    for (const enumDef of enums) {
      if (enumDef.values && enumDef.values.length > 0) {
        schema += `enum ${toPascalCase(enumDef.name)} {\n`;
        schema += `  ${enumDef.values.map(v => toPascalCase(v.replace(/'/g, ''))).join('\n  ')}\n}\n\n`;
      }
    }
  }
  
  // 2. Add models
  for (const table of tables) {
    // Skip auth tables if they're already handled by Supabase
    if (CONFIG.authTables.includes(table.name.toLowerCase())) {
      console.log(`ℹ️  Skipping auth table: ${table.name}`);
      continue;
    }
    
    // Start model definition
    schema += `model ${toPascalCase(table.name)} {\n`;
    
    // Track fields for relation definitions
    const relationFields = [];
    
    // Add columns
    for (const column of table.columns) {
      // Skip columns that are part of composite foreign keys (handled in relations)
      const isPartOfFk = relations.some(r => 
        r.tableName === table.name && r.columns.includes(column.name)
      );
      
      if (isPartOfFk) {
        continue;
      }
      
      // Handle special fields
      const specialField = SPECIAL_FIELDS[column.name.toLowerCase()];
      if (specialField) {
        schema += `  ${column.name} ${specialField.type}${specialField.default ? ` ${specialField.default}` : ''}\n`;
        continue;
      }
      
      // Map SQL type to Prisma type
      let prismaType = mapSqlTypeToPrisma(column.type, column);
      
      // Handle array types
      if (column.type.endsWith('[]')) {
        prismaType = prismaType.replace('[]', '') + '[]';
      }
      
      // Build field definition
      let field = `  ${column.name} ${prismaType}`;
      
      // Add field attributes
      const fieldAttrs = [];
      
      // Handle primary keys
      if (column.isPrimaryKey) {
        fieldAttrs.push('@id');
        if (prismaType === 'String' && column.defaultValue?.includes('uuid_generate')) {
          fieldAttrs.push('@default(uuid())');
        } else if (prismaType === 'Int' && column.defaultValue?.includes('nextval')) {
          fieldAttrs.push('@default(autoincrement())');
        }
      }
      
      // Handle default values
      if (column.defaultValue && !column.isPrimaryKey) {
        const defaultValue = formatDefaultValue(column.defaultValue, prismaType);
        if (defaultValue) {
          fieldAttrs.push(`@default(${defaultValue})`);
        }
      }
      
      // Add field attributes if any
      if (fieldAttrs.length > 0) {
        field += ` ${fieldAttrs.join(' ')}`;
      }
      
      // Add field to schema
      schema += `${field}\n`;
    }
    
    // Add relations
    const tableRelations = relations.filter(r => r.tableName === table.name);
    for (const rel of tableRelations) {
      const relationName = toCamelCase(rel.foreignTableName);
      const relatedModel = toPascalCase(rel.foreignTableName);
      
      // Determine relation type (1:1, 1:n, m:n)
      const isOneToOne = rel.columns.length === 1 && rel.foreignColumns.length === 1;
      
      // Add relation field
      if (isOneToOne) {
        schema += `  ${relationName} ${relatedModel} @relation("${rel.constraintName}")\n`;
      } else {
        schema += `  ${relationName} ${relatedModel}[] @relation("${rel.constraintName}")\n`;
      }
    }
    
    // Add schema attribute for public schema
    schema += '  @@schema("public")\n';
    
    // Add table mapping
    schema += `  @@map("${table.name}")\n`;
    
    // Add indexes
    const tableIndexes = indexes[`public.${table.name}`] || [];
    for (const index of tableIndexes) {
      if (!index.isPrimary) { // Skip primary keys as they're already handled
        const indexName = index.name.replace(/^[^_]+_/, ''); // Remove table prefix
        const indexFields = index.columns.map(c => `"${c}"`).join(', ');
        const indexType = index.isUnique ? '@@unique' : '@@index';
        schema += `  ${indexType}([${indexFields}], name: "${indexName}")\n`;
      }
    }
    
    // Close model
    schema += '}\n\n';
  }
  
  return schema;
}

// Helper function to format default values for Prisma
function formatDefaultValue(defaultValue, prismaType) {
  if (!defaultValue) return null;
  
  // Handle common default values
  if (defaultValue === 'CURRENT_TIMESTAMP') {
    return 'now()';
  }
  
  // Handle UUID generation
  if (defaultValue.includes('uuid_generate')) {
    return 'uuid()';
  }
  
  // Handle boolean defaults
  if (prismaType === 'Boolean') {
    return defaultValue === 'true' ? 'true' : 'false';
  }
  
  // Handle string defaults
  if (prismaType === 'String' || prismaType === 'DateTime') {
    return `"${defaultValue.replace(/'/g, '"')}"`;
  }
  
  // For numbers, just return as is
  if (['Int', 'Float', 'Decimal', 'BigInt'].includes(prismaType)) {
    return defaultValue;
  }
  
  // For JSON/Jsonb, parse and stringify to ensure valid JSON
  if (prismaType === 'Json' || prismaType === 'Json?') {
    try {
      return JSON.stringify(JSON.parse(defaultValue));
    } catch (e) {
      return `"${defaultValue}"`;
    }
  }
  
  return defaultValue;
}

// Main function to run the conversion
async function main() {
  try {
    console.log('🚀 Starting Supabase to Prisma schema conversion...');
    
    // 1. Get database schema
    console.log('🔍 Extracting database schema...');
    const schema = await getDatabaseSchema();
    
    // 2. Generate Prisma schema
    console.log('🔄 Generating Prisma schema...');
    const prismaSchemaContent = await generatePrismaSchema(schema);
    
    // 3. Add enums and models to the schema
    prismaSchema += prismaSchemaContent;
    
    // 4. Add auth models if needed
    if (CONFIG.supabase.schema.includes('auth')) {
      prismaSchema += `
// Auth models (Supabase Auth)
// Note: These are simplified representations. Adjust according to your needs.
model AuthUser {
  id                 String    @id @default(uuid())
  email              String?   @unique
  encrypted_password String?
  confirmed_at       DateTime?
  created_at         DateTime  @default(now())
  updated_at         DateTime  @updatedAt
  
  @@schema("auth")
  @@map("users")
}

model AuthSession {
  id           String    @id @default(uuid())
  user_id      String
  token        String    @unique
  refresh_token String?  @unique
  expires_at   DateTime
  created_at   DateTime  @default(now())
  updated_at   DateTime  @updatedAt
  
  user AuthUser @relation(fields: [user_id], references: [id], onDelete: Cascade)
  
  @@schema("auth")
  @@map("sessions")
}
`;
    }
    
    // 5. Write the schema file
    console.log('💾 Writing Prisma schema file...');
    writeFileSync(CONFIG.output.schemaFile, prismaSchema, 'utf8');
    
    console.log(`✅ Successfully generated Prisma schema at: ${CONFIG.output.schemaFile}`);
    console.log('✨ Done!');
    
  } catch (error) {
    console.error('❌ Error generating Prisma schema:', error);
    process.exit(1);
  }
}

// Run the main function
main().catch(console.error);

// Map SQL type to Prisma type with better handling
function mapSqlTypeToPrisma(sqlType, column = {}) {
  if (!sqlType) return 'String'; // Default to String if type is not specified
  
  // Check for array types
  const isArray = sqlType.endsWith('[]');
  let baseType = isArray ? sqlType.replace(/\[\]$/, '') : sqlType;
  
  // Check for type overrides first
  const lowerType = baseType.toLowerCase();
  if (CONFIG.typeOverrides[column.name?.toLowerCase()]) {
    return CONFIG.typeOverrides[column.name.toLowerCase()].type;
  }
  
  // Handle standard type mappings
  if (CONFIG.typeMappings[baseType.toLowerCase()]) {
    return CONFIG.typeMappings[baseType.toLowerCase()];
  }
  
  // Handle character varying with length
  if (baseType.startsWith('character varying') || baseType.startsWith('varchar')) {
    return 'String' + (column.maxLength ? ` @db.VarChar(${column.maxLength})` : '');
  }
  
  // Handle numeric/decimal with precision and scale
  if (baseType.startsWith('numeric') || baseType.startsWith('decimal')) {
    const match = baseType.match(/\((\d+)(?:\s*,\s*(\d+))?\)/);
    if (match) {
      const precision = match[1];
      const scale = match[2] || '2';
      return `Decimal @db.Decimal(${precision},${scale})`;
    }
    return 'Decimal';
  }
  
  // Handle timestamp with/without timezone
  if (baseType.includes('timestamp')) {
    return baseType.includes('tz') ? 'DateTime @db.Timestamptz' : 'DateTime';
  }
  
  // Handle enum types
  if (baseType.startsWith('enum_') || baseType.endsWith('_enum')) {
    return toPascalCase(baseType.replace(/^enum_|_enum$/g, ''));
  }
  
  // Default to String for unknown types
  console.warn(`⚠️  Unknown type: ${baseType}, defaulting to String`);
  return 'String';
}

// Helper function to convert to PascalCase
function toPascalCase(str) {
  if (!str) return '';
  return String(str)
    .replace(/[^\w\s]/g, ' ') // Remove special chars
    .replace(/\s+(\w)/g, (_, c) => c.toUpperCase()) // Capitalize first letter of each word
    .replace(/^(\w)/, m => m.toUpperCase()); // Capitalize first letter
}

// Helper function to convert to camelCase
function toCamelCase(str) {
  if (!str) return '';
  const s = toPascalCase(str);
  return s.charAt(0).toLowerCase() + s.slice(1);
}

// Helper function to determine if a column is auto-incrementing
function isAutoIncrement(column) {
  return (
    column.defaultValue?.includes('nextval') ||
    column.isIdentity ||
    (column.defaultValue?.includes('gen_random_uuid') && column.type === 'uuid')
  );
}

// Helper function to determine if a column is a foreign key
function isForeignKey(column, relations) {
  return relations.some(r => 
    r.columns.includes(column.name) || 
    r.foreignColumns.includes(column.name)
  );
}

// Helper function to get relation name
function getRelationName(columnName, relation) {
  // Remove common suffixes
  const baseName = columnName
    .replace(/_id$/, '')
    .replace(/_uid$/, '')
    .replace(/_uuid$/, '');
  
  // Convert to camelCase
  return toCamelCase(baseName);
}

// Helper function to get the opposite relation name
function getOppositeRelationName(tableName, relation) {
  // Convert table name to singular if needed
  let relationName = toCamelCase(
    tableName.endsWith('s') ? tableName.slice(0, -1) : tableName
  );
  
  // Handle special cases
  if (tableName.endsWith('ies')) {
    relationName = toCamelCase(tableName.replace(/ies$/, 'y'));
  } else if (tableName.endsWith('es')) {
    relationName = toCamelCase(tableName.replace(/es$/, ''));
  }
  
  return relationName;
}

// Helper function to convert snake_case to camelCase
function snakeToCamel(str) {
  if (!str) return '';
  return str.replace(/(_\w)/g, m => m[1].toUpperCase());
}

// Handle default values for fields
function handleDefaultValue(fieldAttrs, col) {
  if (col.defaultValue) {
    if (col.defaultValue.startsWith('"') && col.defaultValue.endsWith('"')) {
      fieldAttrs.push(`@default(${col.defaultValue})`);
    } 
    // Handle numeric defaults
    else if (!isNaN(col.defaultValue)) {
      fieldAttrs.push(`@default(${col.defaultValue})`);
    }
    // Handle boolean defaults
    else if (col.defaultValue === 'true' || col.defaultValue === 'false') {
      fieldAttrs.push(`@default(${col.defaultValue})`);
    }
  }
}
    
    // Handle special fields
    const specialField = SPECIAL_FIELDS[col.name];
    if (specialField) {
      if (specialField.defaultValue) {
        fieldAttrs.push(specialField.defaultValue);
      }
      if (specialField.isRequired) {
        fieldAttrs.push('@notnull');
      }
    }
    
    // Handle foreign key relation - only add if the reference is valid
    const fk = table.foreignKeys.find(fk => fk.column === col.name);
    if (fk) {
      const relatedTable = tables.find(t => t.name === fk.references.table);
      if (relatedTable) {
        const relatedField = relatedTable.columns.find(c => c.name === fk.references.column);
        if (relatedField) {
          // Don't add relation for self-referencing foreign keys to avoid circular dependencies
          if (fk.references.table !== table.name) {
            fieldAttrs.push(`@relation(fields: [${col.name}], references: [${fk.references.column}], onDelete: ${fk.onDelete})`);
          }
        }
      }
    }
    
    if (fieldAttrs.length > 0) {
      field += ' ' + fieldAttrs.join(' ');
    }
    
    prismaSchema += `${field}\n`;
  }
  
  // Add relations
  for (const fk of table.foreignKeys) {
    const relationName = `${table.name}_to_${fk.references.table}`.toLowerCase();
    const relatedTable = tables.find(t => t.name === fk.references.table);
    const isMany = relatedTable && relatedTable.foreignKeys.some(
      fk2 => fk2.references.table === table.name
    );
    
    const fieldName = toCamelCase(fk.references.table);
    const fieldType = toPascalCase(fk.references.table) + (isMany ? '[]' : '?');
    
    prismaSchema += `  ${fieldName} ${fieldType} @relation("${relationName}")\n`;
  }
  
  prismaSchema += `}

`;
}

// Ensure the output directory exists
const outputDir = join(__dirname, '../backend/prisma');
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

// Write the schema file
const outputPath = join(outputDir, 'schema.prisma');
writeFileSync(outputPath, prismaSchema);
console.log(`✅ Successfully generated Prisma schema at: ${outputPath}`);

// Helper functions
function toPascalCase(str) {
  return str
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

function toCamelCase(str) {
  const s = toPascalCase(str);
  return s.charAt(0).toLowerCase() + s.slice(1);
}

function mapSqlTypeToPrisma(sqlType) {
  // Handle array types first
  if (sqlType.endsWith('[]')) {
    const baseType = sqlType.replace('[]', '');
    const mappedType = mapSqlTypeToPrisma(baseType);
    return `${mappedType}[]`;
  }

  // Handle types with precision/scale like numeric(10,2)
  const typeMatch = sqlType.match(/^(\w+)(?:\([^)]*\))?$/);
  if (!typeMatch) return 'String';
  
  const baseType = typeMatch[1].toLowerCase();
  
  const typeMap = {
    // Integer types
    'int': 'Int',
    'integer': 'Int',
    'int4': 'Int',
    'serial': 'Int',
    'serial4': 'Int',
    'smallint': 'Int',
    'int2': 'Int',
    'bigint': 'BigInt',
    'int8': 'BigInt',
    'bigserial': 'BigInt',
    'serial8': 'BigInt',
    
    // Floating point
    'real': 'Float',
    'float4': 'Float',
    'double': 'Float',
    'float8': 'Float',
    'decimal': 'Decimal',
    'numeric': 'Decimal',
    
    // String types
    'varchar': 'String',
    'char': 'String',
    'text': 'String',
    'uuid': 'String',
    'citext': 'String',
    
    // Boolean
    'boolean': 'Boolean',
    'bool': 'Boolean',
    
    // Date/Time
    'date': 'DateTime',
    'time': 'DateTime',
    'timetz': 'DateTime',
    'timestamp': 'DateTime',
    'timestamptz': 'DateTime',
    
    // JSON
    'json': 'Json',
    'jsonb': 'Json',
    
    // Binary
    'bytea': 'Bytes',
    
    // Network
    'inet': 'String',
    'cidr': 'String',
    'macaddr': 'String',
    'macaddr8': 'String',
    
    // Special
    'money': 'Decimal',
    'oid': 'Int',
  };

  return typeMap[baseType] || 'String';
}

// Get default value for a column
function getDefaultValue(column) {
  if (column.column_default === null) return null;
  
  const lowerDefault = String(column.column_default).toLowerCase();
  
  // Handle common default values
  if (lowerDefault.includes('now()') || lowerDefault.includes('current_timestamp')) {
    return 'now()';
  }
  
  if (lowerDefault.includes('gen_random_uuid()')) {
    return 'uuid()';
  }
  
  if (lowerDefault.includes('true') || lowerDefault.includes('false')) {
    return lowerDefault.includes('true') ? 'true' : 'false';
  }
  
  // Handle string literals with single quotes
  const stringMatch = column.column_default?.match(/'([^']*)'/);
  if (stringMatch) {
    return `"${stringMatch[1]}"`;
  }
  
  return null;
}

// Check if a column is a timestamp field
function isTimestampColumn(column) {
  const lowerName = column.column_name.toLowerCase();
  return lowerName.endsWith('_at') || 
         lowerName === 'createdat' || 
         lowerName === 'updatedat' ||
         lowerName === 'deletedat';
}
