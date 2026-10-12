# axys-template

SvelteKit + SCSS + JSON content, edited through Decap CMS and hosted on Netlify.

## Developing

```sh
bun install
bun dev
```

Vite compiles SCSS (global `src/styles/` and component `<style lang="scss">` blocks) with hot reload. There is no separate Sass step.

## Building

```sh
bun run build
bun preview
```

## Decap CMS

The CMS lives at `/admin` (`src/routes/admin/`), configured in `config.json`. For local editing, run `bunx decap-server` alongside `bun dev`.
