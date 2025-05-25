declare module 'dotenv' {
  const config: () => { parsed: Record<string, string> };
  export { config };
}