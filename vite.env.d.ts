/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  // Add any other custom environment variables here for auto-complete
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
