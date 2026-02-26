// Type definitions for tangerine
// Project: https://github.com/forwardemail/tangerine
// Definitions by: Forward Email <https://forwardemail.net>

/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/member-ordering */

import { Resolver } from 'node:dns/promises';
import type { LookupAddress, LookupOptions } from 'node:dns';

export type TangerineOptions = {
  /**
   * Timeout in milliseconds for DNS queries.
   * @default 5000
   */
  timeout?: number;

  /**
   * Number of retry attempts for DNS queries.
   * @default 4
   */
  tries?: number;

  /**
   * DNS-over-HTTPS servers to use.
   * @default new Set(['1.1.1.1', '1.0.0.1'])
   */
  servers?: Set<string> | string[];

  /**
   * Request options passed to the HTTP client.
   */
  requestOptions?: {
    method?: 'GET' | 'POST' | 'get' | 'post';
    headers?: Record<string, string>;
  };

  /**
   * Protocol to use for DNS-over-HTTPS requests.
   * @default 'https'
   */
  protocol?: 'http' | 'https';

  /**
   * DNS result ordering.
   * @default 'verbatim' for Node.js >= 17.0.0, 'ipv4first' otherwise
   */
  dnsOrder?: 'verbatim' | 'ipv4first';

  /**
   * Logger instance for debugging.
   * Set to `false` to disable logging.
   * @default false
   */
  logger?:
    | false
    | {
        info: (...args: unknown[]) => void;
        warn: (...args: unknown[]) => void;
        error: (...args: unknown[]) => void;
      };

  /**
   * ID generator for DNS packets.
   * Can be a number or a function that returns a number (sync or async).
   * @default 0
   */
  id?: number | (() => number) | (() => Promise<number>);

  /**
   * Concurrency limit for resolveAny queries.
   * @default os.cpus().length
   */
  concurrency?: number;

  /**
   * Default IPv4 address for local binding.
   * @default '0.0.0.0'
   */
  ipv4?: string;

  /**
   * Default IPv6 address for local binding.
   * @default '::0'
   */
  ipv6?: string;

  /**
   * Port for IPv4 local binding.
   */
  ipv4Port?: number;

  /**
   * Port for IPv6 local binding.
   */
  ipv6Port?: number;

  /**
   * Cache instance for storing DNS results.
   * Set to `false` to disable caching.
   * @default new Map()
   */
  cache?: Map<string, unknown> | false;

  /**
   * Default TTL in seconds for cached DNS results.
   * @default 300
   */
  defaultTTLSeconds?: number;

  /**
   * Maximum TTL in seconds for cached DNS results.
   * @default 86400
   */
  maxTTLSeconds?: number;

  /**
   * Function to generate cache arguments.
   */
  setCacheArgs?: (
    key: string,
    result: { expires: number; ttl: number }
  ) => unknown[];

  /**
   * Whether to return HTTP errors as DNS errors.
   * @default false
   */
  returnHTTPErrors?: boolean;

  /**
   * Whether to rotate servers on errors.
   * @default true
   */
  smartRotate?: boolean;

  /**
   * Whether to resolve against all configured servers in parallel and return
   * the first successful response.
   * @default false
   */
  parallelResolution?: boolean;

  /**
   * Default error message for unsuccessful HTTP responses.
   * @default 'Unsuccessful HTTP response'
   */
  defaultHTTPErrorMessage?: string;
};

export type DnsRecordType =
  | 'A'
  | 'A6'
  | 'AAAA'
  | 'AFSDB'
  | 'AMTRELAY'
  | 'ANY'
  | 'APL'
  | 'ATMA'
  | 'AVC'
  | 'AXFR'
  | 'CAA'
  | 'CDNSKEY'
  | 'CDS'
  | 'CERT'
  | 'CNAME'
  | 'CSYNC'
  | 'DHCID'
  | 'DLV'
  | 'DNAME'
  | 'DNSKEY'
  | 'DOA'
  | 'DS'
  | 'EID'
  | 'EUI48'
  | 'EUI64'
  | 'GID'
  | 'GPOS'
  | 'HINFO'
  | 'HIP'
  | 'HTTPS'
  | 'IPSECKEY'
  | 'ISDN'
  | 'IXFR'
  | 'KEY'
  | 'KX'
  | 'L32'
  | 'L64'
  | 'LOC'
  | 'LP'
  | 'MAILA'
  | 'MAILB'
  | 'MB'
  | 'MD'
  | 'MF'
  | 'MG'
  | 'MINFO'
  | 'MR'
  | 'MX'
  | 'NAPTR'
  | 'NID'
  | 'NIMLOC'
  | 'NINFO'
  | 'NS'
  | 'NSAP'
  | 'NSAP-PTR'
  | 'NSEC'
  | 'NSEC3'
  | 'NSEC3PARAM'
  | 'NULL'
  | 'NXT'
  | 'OPENPGPKEY'
  | 'OPT'
  | 'PTR'
  | 'PX'
  | 'RKEY'
  | 'RP'
  | 'RRSIG'
  | 'RT'
  | 'Reserved'
  | 'SIG'
  | 'SINK'
  | 'SMIMEA'
  | 'SOA'
  | 'SPF'
  | 'SRV'
  | 'SSHFP'
  | 'SVCB'
  | 'TA'
  | 'TALINK'
  | 'TKEY'
  | 'TLSA'
  | 'TSIG'
  | 'TXT'
  | 'UID'
  | 'UINFO'
  | 'UNSPEC'
  | 'URI'
  | 'WKS'
  | 'X25'
  | 'ZONEMD';

export type MxRecord = {
  priority: number;
  exchange: string;
  type?: 'MX';
};

export type NaptrRecord = {
  flags: string;
  service: string;
  regexp: string;
  replacement: string;
  order: number;
  preference: number;
  type?: 'NAPTR';
};

export type SoaRecord = {
  nsname: string;
  hostmaster: string;
  serial: number;
  refresh: number;
  retry: number;
  expire: number;
  minttl: number;
  type?: 'SOA';
};

export type SrvRecord = {
  priority: number;
  weight: number;
  port: number;
  name: string;
  type?: 'SRV';
};

export type CaaRecord = {
  critical: number;
  issue?: string;
  issuewild?: string;
  iodef?: string;
  contactemail?: string;
  contactphone?: string;
  type?: 'CAA';
};

export type CertRecord = {
  certType: number | string;
  keyTag: number;
  algorithm: number;
  certificate: Uint8Array | string;
};

export type TlsaRecord = {
  usage: number;
  selector: number;
  mtype: number;
  matchingType: number;
  cert: Uint8Array;
  certificate: Uint8Array;
};

export type HttpsRecord = {
  name: string;
  ttl: number;
  type: 'HTTPS';
  priority: number;
  target: string;
  params: Record<string, unknown>;
};

export type SvcbRecord = {
  name: string;
  ttl: number;
  type: 'SVCB';
  priority: number;
  target: string;
  params: Record<string, unknown>;
};

export type AnyRecord = {
  type: string;
  [key: string]: unknown;
};

export type ResolveOptions = {
  ttl?: boolean;
};

export type RecordWithTtl = {
  address: string;
  ttl: number;
};

export type SpoofPacket = {
  id: number;
  type: 'response';
  flags: number;
  flag_qr: boolean;
  opcode: string;
  flag_aa: boolean;
  flag_tc: boolean;
  flag_rd: boolean;
  flag_ra: boolean;
  flag_z: boolean;
  flag_ad: boolean;
  flag_cd: boolean;
  rcode: string;
  questions: Array<{ name: string; type: string; class: string }>;
  answers: Array<{
    name: string;
    type: string;
    ttl: number;
    class: string;
    flush: boolean;
    data: unknown;
  }>;
  authorities: unknown[];
  additionals: unknown[];
  ttl: number;
  expires: number;
};

export type RequestFunction = (
  url: string,
  options: Record<string, unknown>
) => Promise<{
  statusCode: number;
  headers: Record<string, string>;
  body: {
    arrayBuffer: () => Promise<ArrayBuffer>;
  };
}>;

declare class Tangerine extends Resolver {
  /**
   * Path to the hosts file.
   */
  static HOSTFILE: string;

  /**
   * Parsed hosts from the hosts file.
   */
  static HOSTS: Array<{ ip: string; hosts: string[] }>;

  /**
   * Set of valid DNS record types.
   */
  static TYPES: Set<string>;

  /**
   * Set of DNS error codes.
   */
  static CODES: Set<string>;

  /**
   * Record types supported by resolveAny.
   */
  static ANY_TYPES: string[];

  /**
   * Record types supported by native DNS.
   */
  static NATIVE_TYPES: Set<string>;

  /**
   * Check if a port number is valid.
   */
  static isValidPort(port: number): boolean;

  /**
   * Get address configuration types based on network interfaces.
   */
  static getAddrConfigTypes(): 0 | 4 | 6;

  /**
   * Get a random integer between min and max (inclusive).
   */
  static getRandomInt(min: number, max: number): number;

  /**
   * Combine multiple errors into a single error.
   */
  static combineErrors(errors: Error[]): Error;

  /**
   * Create a DNS error with the specified code.
   */
  static createError(
    name: string,
    rrtype: string,
    code: string,
    errno?: number
  ): Error;

  /**
   * Options passed to the constructor.
   */
  options: TangerineOptions;

  /**
   * Set of active abort controllers.
   */
  abortControllers: Set<AbortController>;

  /**
   * Create a new Tangerine DNS resolver instance.
   * @param options - Configuration options
   * @param request - HTTP request function (default: undici.request)
   */
  constructor(options?: TangerineOptions, request?: RequestFunction);

  /**
   * Set local addresses for DNS queries.
   */
  setLocalAddress(ipv4?: string, ipv6?: string): void;

  /**
   * Resolve a hostname to IP addresses.
   */
  lookup(
    name: string,
    options?: LookupOptions
  ): Promise<LookupAddress | LookupAddress[]>;

  /**
   * Perform a reverse DNS lookup.
   */
  lookupService(
    address: string,
    port: number,
    abortController?: AbortController,
    purgeCache?: boolean
  ): Promise<{ hostname: string; service: string }>;

  /**
   * Reverse DNS lookup for an IP address.
   */
  reverse(
    ip: string,
    abortController?: AbortController,
    purgeCache?: boolean
  ): Promise<string[]>;

  /**
   * Resolve IPv4 addresses.
   */
  resolve4(
    name: string,
    options?: ResolveOptions,
    abortController?: AbortController
  ): Promise<string[] | RecordWithTtl[]>;

  /**
   * Resolve IPv6 addresses.
   */
  resolve6(
    name: string,
    options?: ResolveOptions,
    abortController?: AbortController
  ): Promise<string[] | RecordWithTtl[]>;

  /**
   * Resolve CAA records.
   */
  resolveCaa(
    name: string,
    options?: ResolveOptions,
    abortController?: AbortController
  ): Promise<CaaRecord[]>;

  /**
   * Resolve CNAME records.
   */
  resolveCname(
    name: string,
    options?: ResolveOptions,
    abortController?: AbortController
  ): Promise<string[]>;

  /**
   * Resolve MX records.
   */
  resolveMx(
    name: string,
    options?: ResolveOptions,
    abortController?: AbortController
  ): Promise<MxRecord[]>;

  /**
   * Resolve NAPTR records.
   */
  resolveNaptr(
    name: string,
    options?: ResolveOptions,
    abortController?: AbortController
  ): Promise<NaptrRecord[]>;

  /**
   * Resolve NS records.
   */
  resolveNs(
    name: string,
    options?: ResolveOptions,
    abortController?: AbortController
  ): Promise<string[]>;

  /**
   * Resolve PTR records.
   */
  resolvePtr(
    name: string,
    options?: ResolveOptions,
    abortController?: AbortController
  ): Promise<string[]>;

  /**
   * Resolve SOA records.
   */
  resolveSoa(
    name: string,
    options?: ResolveOptions,
    abortController?: AbortController
  ): Promise<SoaRecord>;

  /**
   * Resolve SRV records.
   */
  resolveSrv(
    name: string,
    options?: ResolveOptions,
    abortController?: AbortController
  ): Promise<SrvRecord[]>;

  /**
   * Resolve TXT records.
   */
  resolveTxt(
    name: string,
    options?: ResolveOptions,
    abortController?: AbortController
  ): Promise<string[][]>;

  /**
   * Resolve CERT records.
   */
  resolveCert(
    name: string,
    options?: ResolveOptions,
    abortController?: AbortController
  ): Promise<CertRecord[]>;

  /**
   * Resolve TLSA records.
   */
  resolveTlsa(
    name: string,
    options?: ResolveOptions,
    abortController?: AbortController
  ): Promise<TlsaRecord[]>;

  /**
   * Get the list of DNS servers.
   */
  getServers(): string[];

  /**
   * Cancel all pending DNS queries.
   */
  cancel(): void;

  /**
   * Resolve any record type.
   */
  resolveAny(
    name: string,
    options?: ResolveOptions,
    abortController?: AbortController
  ): Promise<AnyRecord[]>;

  /**
   * Set the default result order for DNS queries.
   */
  setDefaultResultOrder(dnsOrder: 'verbatim' | 'ipv4first'): void;

  /**
   * Set the DNS servers to use.
   */
  setServers(servers: string[]): void;

  /**
   * Create a spoofed DNS packet for testing.
   * @param name - The hostname
   * @param rrtype - The record type
   * @param answers - Array of answers
   * @param json - Whether to return JSON string (default: false)
   * @param expires - Expiration time in milliseconds (default: 300000 = 5 minutes)
   */
  spoofPacket(
    name: string,
    rrtype: DnsRecordType,
    answers?: unknown[],
    json?: boolean,
    expires?: number | Date
  ): SpoofPacket | string;

  /**
   * Resolve DNS records of a specific type.
   */
  resolve(
    name: string,
    rrtype?: DnsRecordType,
    options?: ResolveOptions,
    abortController?: AbortController
  ): Promise<unknown>;
}

export default Tangerine;
export { Tangerine };
