<p align="center">
  <img src="assets/artwork/assets/banner.png" alt="Word Office Banner" width="600">
</p>

<h1 align="center">Word Office</h1>

<p align="center">
  <strong>Independent, open-source document editing suite.</strong><br>
  Built from scratch in Rust and React.
</p>

<p align="center">
  <a href="https://codeberg.org/World-Office/server">Repository</a> ·
  <a href="LICENSE">AGPL-3.0</a> ·
  <a href=".github/CONTRIBUTING.md">Contributing</a>
</p>

---

## Quick Start

`ash
pnpm install
pnpm build
pnpm dev
`

## Structure

| Directory | Purpose |
|-----------|---------|
| core/ | Rust document engine |
| core-enterprise/ | Enterprise Rust crates |
| services/ | Rust microservices |
| pps/ | React 19 frontend |
| integrations/ | Nextcloud, OpenCloud, Android |
| ssets/ | Fonts, dictionaries, artwork |
| plugins/ | AI autofill, SDK forms |
| packages/ | Shared JS/TS packages |

## License

Dual-licensed under [AGPL-3.0](LICENSE) (Community) and [Commercial](LICENSE-COMMERCIAL) (Enterprise).

## Contributing

See [CONTRIBUTING.md](.github/CONTRIBUTING.md). All contributors must sign the [CLA](cla/).