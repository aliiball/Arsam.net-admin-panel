/** Standard paginated envelope returned by every list endpoint. */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/** Sort descriptor encoded in the URL as `field:dir`. */
export interface SortSpec {
  id: string;
  desc: boolean;
}

/** Common list query params (resource contract). */
export interface ListQuery {
  page: number;
  pageSize: number;
  sort?: SortSpec[];
  /** Arbitrary filter key -> value(s). */
  filters?: Record<string, string | string[]>;
}
