export enum FieldType {
  TEXT_FIELD = 'TEXT_FIELD',
  TEXT_AREA = 'TEXT_AREA',
  NUMBER = 'NUMBER',
  NUMBER_ANY = 'NUMBER_ANY',
  CHECKBOX = 'CHECKBOX',
  DATE = 'DATE',
  DATETIME = 'DATETIME',
  TIME = 'TIME',
  COMBOBOX = 'COMBOBOX',
  EMAIL= 'EMAIL',
  TEXT= 'TEXT'
}

export interface FieldMeta {
  type: FieldType;
  nullable: boolean;
  visible: boolean;
  editable: boolean;
  defaultValue?: any;
}

export interface FieldDefinition {
  field: string;
  label?: string;
  meta: FieldMeta;
  values?: any[];
}

export interface TableMeta {
  field: string;
  type: string;
  visible: boolean;
  editable: boolean;
  nullable: boolean;
}
