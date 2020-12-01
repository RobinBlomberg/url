export class Url {
  static normalizePath(path: string): string;
  static parse(url: string): UrlSchema;
  static parseQuery(query: string): Record<string, string>
  static splitPath(path: string): string[];
  static stringify(options: Partial<UrlSchema>): string;
  static stringifyQuery(query?: Query): string;
}

/**
 * Models the built-in URL object.
 */
export type UrlSchema = {
  hash: string;
  host: string;
  hostname: string;
  href: string;
  origin: string;
  password: string;
  pathname: string;
  port: number | string | undefined;
  protocol: string;
  search: string;
  searchParams: Query;
  username: string;
};

export type Query = {
  [Key: string]: boolean | number | string | undefined;
};
