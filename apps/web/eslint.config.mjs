import nextConfig from "eslint-config-next";

const config = [
  ...nextConfig,
  {
    name: "custom-ignores",
    ignores: [
      // Default ignores of eslint-config-next (explicitly added):
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];

export default config;
