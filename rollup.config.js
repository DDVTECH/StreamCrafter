import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import commonjs from '@rollup/plugin-commonjs';
import postcss from 'rollup-plugin-postcss';
import autoprefixer from 'autoprefixer';
import image from '@rollup/plugin-image';
import pkg from './package.json';

export default {
    input: 'src/index.js',
    output: [ 
      {
        file: pkg.main,
        format: 'cjs',
        sourcemap: true,
      },
    ],
    plugins: [
      // This prevents needing an additional `external` prop in this config file by automatically excluding peer dependencies
      peerDepsExternal(),
      // Convert CommonJS modules to ES6
      commonjs({ 
        include: 'node_modules/**',
      }),
      // "...locates modules using the Node resolution algorithm"
      resolve(),
      // Do Babel transpilation
      babel({
        exclude: 'node_modules/**',
        babelHelpers: "bundled",
        extensions: [".js", ".ts", ".jsx", ".tsx"],
      }),
      image(),
      // Compiles sass, run autoprefixer, creates a sourcemap, and saves a .css file
      postcss({
        plugins: [autoprefixer],
        modules: {
          scopeBehaviour: 'global',
        },
        sourceMap: true,
        extract: true,
      }),
    ],
  }