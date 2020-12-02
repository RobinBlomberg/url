/**
 * Models the built-in URL object.
 */
export declare type UrlSchema = {
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
export declare type Query = {
    [Key: string]: boolean | number | string | undefined;
};
