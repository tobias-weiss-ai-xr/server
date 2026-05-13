# Change log
## develop
### wo-docserver
* **migration-complete**: Replaced C++ Document Server with Rust implementation
  - WOPI endpoints (CheckFileInfo, GetFile, PutFile) implemented in Rust
  - `/hosting/discovery` and `/hosting/wopi/*` routes added for editor UI
  - Editor UI now served from `apps/web/apps/*/dist/` React builds
  - JWT validation via `JWT_SECRET` env var
  - Single binary deployment with ~5-10 min build time
  - WOPI host configuration via `WOPI_HOST` env var (aliased to `WOPI_HOST_URL`)
  - E2E Dockerfile rewritten to build from Rust sources instead of C++

### x2t
* 
