interface FieldDefinition {
  name: string;
  type: string;
  required: boolean;
}

export function entityTemplate(
  resourcePascal: string,
  fields: FieldDefinition[]
): string {
  const fieldTypes = fields
    .map((f) => {
      const optional = f.required ? '' : '?';
      return `  ${f.name}${optional}: ${f.type};`;
    })
    .join('\n');

  return `export type T${resourcePascal} = {
${fieldTypes}
};

export type T${resourcePascal}WithID = T${resourcePascal} & { id: number };
export type T${resourcePascal}Create = Omit<T${resourcePascal}, 'createdAt' | 'updatedAt'>;
export type T${resourcePascal}Update = Partial<T${resourcePascal}Create>;

export type T${resourcePascal}GetResponse = Omit<T${resourcePascal}WithID, 'isActive' | 'createdAt' | 'updatedAt'> & {
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
};

export type T${resourcePascal}CreateRequest = Omit<T${resourcePascal}Create, 'isActive'> & {
  is_active?: boolean;
};

export type T${resourcePascal}UpdateRequest = Partial<T${resourcePascal}CreateRequest>;
`;
}
