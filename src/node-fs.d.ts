declare module 'node:fs' {
  export interface Dirent {
    name: string
    isDirectory(): boolean
  }
  export function readFileSync(path: string, encoding: 'utf8'): string
  export function readdirSync(path: string, options: { withFileTypes: true }): Dirent[]
}

declare module 'node:path' {
  export function dirname(path: string): string
  export function join(...paths: string[]): string
}

declare module 'node:url' {
  export function fileURLToPath(url: string | URL): string
}
