export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedResult<T> = {
  items: T[];
  pagination: PaginationMeta;
};

export function buildPaginationMeta(
  page: number,
  limit: number,
  total: number,
): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / limit),
  };
}

export function parseActiveStatus(
  status?: string,
): boolean | undefined {
  if (status === undefined) {
    return undefined;
  }
  if (status === 'active' || status === 'true') {
    return true;
  }
  if (status === 'inactive' || status === 'false') {
    return false;
  }
  return undefined;
}
