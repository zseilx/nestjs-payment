export interface InfinityScrollOptions {
  cursor?: string;
  take?: number;
  order?: 'asc' | 'desc';
}

export interface InfinityScrollResult<T> {
  data: T[];
  paging: {
    cursor: number | string | Date | null;
    take: number;
    totalRow: number;
  };
}
