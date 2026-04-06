# Word Office

Independent, open-source document editing suite. Built from scratch in Rust and React.

## Quick Start

`ash
# Install dependencies
pnpm install

# Build everything
pnpm build

# Run dev servers
pnpm dev

# Run tests
pnpm test
`

## License

Dual-licensed under [AGPL-3.0](LICENSE) (Community) and [Commercial](LICENSE-COMMERCIAL) (Enterprise).

See [LICENSE.md](LICENSE.md) for details on the dual license model.

## Documentation

See [.sisyphus/plans/full-rewrite-modernization.md](.sisyphus/plans/full-rewrite-modernization.md) for the full modernization plan.

## Structure

`
core/                   # Rust document engine
core-enterprise/         # Enterprise Rust crates (commercial)
services/              # Rust microservices
apps/                   # React 19 frontend
apps-web-enterprise/     # Enterprise frontend extensions
integrations/           # Nextcloud, OpenCloud, Android, WOPI
assets/                 # Fonts, dictionaries, artwork, templates
plugins/                # AI autofill, SDK forms
packages/               # Shared JS/TS packages
tools/                  # CI, Docker, packaging
tests/                  # Test suites
`

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

All contributors must sign the CLA (Contributor License Agreement) to grant
dual-license distribution rights.