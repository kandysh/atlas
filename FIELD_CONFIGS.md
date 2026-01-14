# Field Configuration System

This document describes the field configuration system and how it controls table columns.

## Overview

Field configurations are stored in the database and control:
- What fields are available in the workspace
- How they appear in the table view
- What cell component is used to render/edit them

## Schema

Each field configuration has the following properties:

- `id`: Unique identifier
- `workspaceId`: The workspace this field belongs to
- `key`: Field key (e.g., "title", "status", "priority")
- `name`: Display name for the field
- `type`: Data type (`text`, `select`, `multiselect`, `date`, `checkbox`, `number`)
- `options`: JSON object with field-specific options
  - `choices`: Array of options for select/multiselect fields
  - `defaultValue`: Default value for the field
  - `required`: Whether the field is required
  - `suffix`: Optional suffix for number fields (e.g., "h", "min", "days")
- `order`: Display order (lower numbers appear first)
- `visible`: Controls visibility in table view
  - `"true"`: Field is visible in the table
  - `"false"`: Field is hidden from the table
  - `"detail-only"`: Field is only visible in the detail drawer
- `cellType`: Specifies which cell component to use for rendering
  - See "Cell Types" section below

## Cell Types

The `cellType` field maps to specific UI components:

### Standard Cell Types
- `editable-text`: Text input (single-line for title, multiline for other fields)
- `editable-number`: Number input with optional suffix
- `editable-date`: Date picker
- `editable-tags`: Tag input for multiselect fields
- `editable-combobox`: Searchable dropdown
- `editable-owner`: Owner selection dropdown
- `status`: Status badge with dropdown
- `priority`: Priority badge with dropdown
- `badge-list`: Display array items as badges

## Usage

### Creating Columns Dynamically

The `buildColumnsFromFieldConfigs` utility function in `src/lib/utils/column-builder.tsx` generates table columns from field configurations:

```typescript
import { buildColumnsFromFieldConfigs } from "@/src/lib/utils/column-builder";

const columns = buildColumnsFromFieldConfigs(
  fieldConfigs,
  handleUpdate,
  uniqueOwners,
  uniqueAssetClasses
);
```

### Fetching Field Configs

Use the `useWorkspaceFields` hook to fetch field configurations:

```typescript
import { useWorkspaceFields } from "@/src/lib/query/hooks";

const { data: fieldsData, isLoading } = useWorkspaceFields(workspaceId);
const fieldConfigs = fieldsData?.fields || [];
```

## Default Field Configurations

Default field configurations are defined in `src/lib/utils/default-field-configs.ts` and are automatically created when a new workspace is created.

### Example Default Field

```typescript
{
  workspaceId,
  key: "currentHrs",
  name: "Estimated Hours",
  type: "number",
  options: { 
    defaultValue: 0, 
    required: false,
    suffix: "h" // Displays as "5h" in the table
  },
  order: 10,
  visible: "true",
  cellType: "editable-number",
}
```

## Migrations

When the schema changes:

1. Run `npm run db:generate` to create a new migration
2. The migration will add new columns with default values
3. Run `npm run db:migrate` or `npm run db:push` to apply migrations

For existing workspaces, see `drizzle/0004_update-field-configs.sql` which updates existing field configs with appropriate `visible` and `cellType` values.

## Customization

Workspace administrators can customize field configurations:

1. Add new fields
2. Hide/show fields by changing the `visible` property
3. Reorder fields by changing the `order` property
4. Modify field options (choices, required, etc.)

Changes to field configurations immediately affect the table view for all workspace members.
