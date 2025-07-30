[![](public/icon-180x180.png)](https://lincoln-lm.github.io/ten-lines/)

## [Ten Lines](https://lincoln-lm.github.io/ten-lines/): A Suite of Tools for RNG Manipulation in Generation 3

**_Ten Lines_** (name inspired by an old script by Shao that finds initial seeds "in like 10 lines") aims to provide tools to facilitate retail rng manipulation in the 3rd generation of Pok&eacute;mon games.

## Features

-   Direct incorporation of farmed seed lists for FireRed/LeafGreen (live updated every new build)
-   Searcher tab for finding targets
-   Initial Seed tab for finding potential initial seeds for a particular target (both RSE painting and FRLG initial seed manip)
-   Gen-3-Seed-Assistant-like calibration tab with builtin IV calculation.
-   Support for [blisy's e-reader events](https://www.youtube.com/watch?v=fgX36SAeTwQ)
-   Progressive Web App for use offline
-   (Hopefully) mobile-friendly UI

## Contribution

Welcome!

## Building and Running Locally (see [main.yml](.github/workflows/main.yml) & [package.json](package.json))

To build & run locally:

1. [Install emsdk](https://emscripten.org/docs/getting_started/downloads.html)
1. Clone the repository: `git clone --recursive https://github.com/lincoln-lm/ten-lines.git`
1. Enter project directory: `cd ten-lines`
1. Install python dependencies `pip install -r src/wasm/requirements.txt`
    - On a system with an externally managed environment, install these in a virtualenv
1. Install TS dependencies: `npm install`
1. Build WebAssembly library: `emcmake cmake -S src/wasm -B src/wasm/build && cmake --build src/wasm/build`
1. Build the project: `npx tsc -b && npx vite build`
1. Start the development server: `npx vite`

## Powered by

-   Static site hosting by GitHub
-   Static site built via [Vite](https://vite.dev/) & [React](https://react.dev/)
-   Processing is done in-browser via an [emscripten](https://emscripten.org/)-compiled [WebAssembly module](src/wasm/) that makes use of [PokeFinderCore](https://github.com/Admiral-Fish/PokeFinder)
