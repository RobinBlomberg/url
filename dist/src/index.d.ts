/**
 * Utility class for handling URLs.
 */
export class Url {
    /**
     * @param {string} path
     * @return {string}
     */
    static normalizePath(path: string): string;
    /**
     * @param {string} url
     * @return {UrlSchema}
     */
    static parse(url: string): UrlSchema;
    /**
     * @param {string} query
     * @return {Object.<string, string>}
     */
    static parseQuery(query: string): {
        [x: string]: string;
    };
    /**
     * Splits an URL path into its respective directories.
     *
     * @param {string} path
     * @return {string[]}
     * @example
     * Url.splitPath('/foo//bar/index.php/');
     * // ['foo', '', 'bar', 'index.php']
     */
    static splitPath(path: string): string[];
    /**
     * @param {Partial<UrlSchema>} [options]
     * @return {string}
     */
    static stringify({ hash, host, hostname, href, origin, password, pathname, port, protocol, search, searchParams, username }?: Partial<import("./types").UrlSchema> | undefined): string;
    /**
     * @param {Query} query
     * @return {string}
     */
    static stringifyQuery(query?: Query): string;
}
export type UrlSchema = {
    hash: string;
    host: string;
    hostname: string;
    href: string;
    origin: string;
    password: string;
    pathname: string;
    port: string | number | undefined;
    protocol: string;
    search: string;
    searchParams: import("./types").Query;
    username: string;
};
export type Query = {
    [Key: string]: string | number | boolean | undefined;
};
