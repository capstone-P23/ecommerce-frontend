import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // 로컬 `vercel build` 산출물 (gitignore 되지만 lint 는 스캔하므로 명시 제외)
    ".vercel/**",
    // MSW 가 npx msw init 으로 생성하는 service worker (수정 금지)
    "public/mockServiceWorker.js",
  ]),
]);

export default eslintConfig;
