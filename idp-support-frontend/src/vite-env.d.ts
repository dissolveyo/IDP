interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_GOOGLE_MAPS_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}