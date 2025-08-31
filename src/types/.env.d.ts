declare namespace NodeJS {
  interface ProcessEnv {
    PORT?: string;
    MONGO_URI?: string;
    JWT_SECRET?: string;
    EMAIL_PASS?: string;
    EMAIL_USER?: string;
    JWT_REFRESH_SECRET?: string;
    FRONTEND_URL?: string;
    NODE_ENV?: "development" | "production" | "test";
  }
}
