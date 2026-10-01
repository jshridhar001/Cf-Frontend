declare module '@tanstack/react-table' {
  interface ColumnMeta<TData, TValue> {
    headerClassName?: string;
    cellClassName?: string;
    width?: string;
    align?: 'left' | 'right' | 'center';
    filterLabel?: string;
    mono?: boolean;
    numeric?: boolean;
    wrap?: boolean;
    emphasize?: boolean;
    groupStart?: boolean;
    filterValueFormatter?: (value: unknown) => string;
  }
}

export {};
