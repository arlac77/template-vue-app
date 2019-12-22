import resolve from "@rollup/plugin-node-resolve";
import json from "@rollup/plugin-json";
import commonjs from "@rollup/plugin-commonjs";


import copy from "rollup-plugin-copy";
import replace from "rollup-plugin-replace";
import vue from "rollup-plugin-vue";
import css from "rollup-plugin-css-only";
import resolve from "@rollup/plugin-node-resolve";
import nodeGlobals from "rollup-plugin-node-globals";
import pkg, { config } from "./package.json";
import history from "connect-history-api-fallback";
import proxy from "http-proxy-middleware";
import express from "express";
import { create as browserSyncFactory } from "browser-sync";

const isProduction = !process.env.ROLLUP_WATCH;
const dist = "build/dist";

const globals = { vue: "Vue" };
const external = Object.keys(pkg.dependencies);

const rollupConfig = {
  input: "src/main.mjs",
  //external,

  output: {
    //globals,
    file: `${dist}/bundle.js`,
    sourcemap: !isProduction,
    format: "esm"
  },
  /*
  output: {
    globals,
    name: 'bundle',
    file: `${dist}/bundle.js`,
    format: 'umd'
  },
  */
  watch: {
    include: "src/**/*"
  },
  plugins: [
    json({
      preferConst: true,
      compact: true
    }),
    resolve(),
    commonjs(),
    nodeGlobals(),
    css({ output: `${dist}/bundle.css` }),
    vue({
      template: {
        isProduction,
        compilerOptions: { preserveWhitespace: false }
      },
      css: false
    }),
    copy({
      targets: [
        { src: "public/index.html", dest: dist },
        { src: "public/favicon.ico", dest: dist }
      ]
    }),
    replace({
      "process.env.NODE_ENV": JSON.stringify("production")
    })
  ]
};

if (isProduction) {
  process.env.NODE_ENV = "production";
} else {
  function browsersync() {
    const browserSync = browserSyncFactory();
    const app = express();

    app.use(
      config.api,
      proxy({
        target: config.proxyTarget,
        changeOrigin: true,
       // ws: true,
        logLevel: "debug"
      })
    );

    browserSync.init({
      server: dist,
      watch: true,
      middleware: [app , history()]
    });
  }

  setTimeout(() => {
    browsersync();
  }, 500);
}

export default rollupConfig;
