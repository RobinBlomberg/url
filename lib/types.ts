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
