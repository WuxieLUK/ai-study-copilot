import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Keep these server-only, native/heavy dependencies outside the bundler:
   *  - pdf-parse / pdfjs-dist resolve their own worker file at runtime
   *    (bundling breaks the path — "Setting up fake worker failed").
   *  - @huggingface/transformers + onnxruntime-node load native binaries and
   *    model files from disk.
   *  - sharp ships platform-specific binaries.
   */
  serverExternalPackages: [
    "pdf-parse",
    "pdfjs-dist",
    "@huggingface/transformers",
    "onnxruntime-node",
    "sharp",
  ],
};

export default nextConfig;
