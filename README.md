# KTRZ Monokai for Orca

A port of the [KTRZ Monokai](https://github.com/ixkaito/ktrz-monokai) color
scheme to [Orca](https://www.onorca.dev). A flat, dark Monokai theme with a
matching terminal theme and syntax colors.

Requires Orca `>= 1.4.245`.

## Install

### From a local folder (for testing / immediate use)

1. Clone this repo (or `ghq get sasagar/orca-ktrz-monokai`).
2. In Orca: **Settings → Plugins → Add plugin → From a folder…**
3. Pick this folder, review the requested access, and enable it.
4. **Settings → Appearance** → set **KTRZ Monokai** as the dark theme.
5. In the terminal settings, choose the **KTRZ Monokai** terminal theme.

### From the Orca plugin directory (after publishing)

Once published, it appears at `onorca.dev/plugins/sasagar/orca-ktrz-monokai`
and can be installed from **Add plugin → From a Git URL…** or the directory.

## Publishing to the Orca directory

The directory lists plugins automatically — no form, no queue:

1. Push this repo to `https://github.com/sasagar/orca-ktrz-monokai` (public).
2. Add the GitHub topic: `gh repo edit --add-topic orca-plugin`
3. Push a version tag: `git tag v1.0.0 && git push origin v1.0.0`
4. Check the status page at `onorca.dev/plugins/sasagar/orca-ktrz-monokai`
   (usually within an hour, if it passes the validator).

To validate the manifest beforehand, from a checkout of Orca's repo run:
`pnpm validate:plugin path/to/orca-ktrz-monokai`

## Editing the colors

The theme files under `themes/` and `terminal/` are **generated** — do not edit
them by hand. Change the palette or the mapping and rebuild:

```bash
node scripts/build.mjs          # regenerate
node scripts/build.mjs --check  # verify the committed files are up to date
```

- `scripts/ktrz-palette.json` — the core KTRZ Monokai colors.
- `scripts/build.mjs` — maps the palette to Orca's UI tokens and syntax scopes.

Most colors map 1:1 from the original KTRZ VS Code theme. A few Orca-only UI
tokens (selection tint, diff backgrounds) are **derived** by compositing a
palette hue over the background; those are marked in `build.mjs`.

## Credits

- Original theme: [KTRZ Monokai](https://github.com/ixkaito/ktrz-monokai) by
  ixkaito (MIT).
- Orca theme file structure follows the conventions of community theme plugins
  such as [Tokyo Night for Orca](https://github.com/vale-c/orca-tokyonight).

## License

[MIT](LICENSE).
