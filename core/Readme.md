![World-Office](https://codeberg.org/World-Office/artwork/raw/branch/main/assets/banner.png)

[![License](https://img.shields.io/badge/License-GNU%20AGPL%20V3-green.svg?style=flat)](https://www.gnu.org/licenses/agpl-3.0.en.html)     ![x2tconverter](https://img.shields.io/badge/x2tconverter-v2.0.2.376-blue.svg?style=flat) ![Platforms Windows | OS X | Linux](https://img.shields.io/badge/Platforms-Windows%20%7C%20OS%20X%20%7C%20Linux%20-lightgray.svg?style=flat)

## Core

> **Disclaimer:** World-Office is an independent open-source fork hosted on Codeberg and is not affiliated with, endorsed by, or controlled by any of the upstream projects or integration providers referenced in this repository (including WORLDOFFICE, Ascensio System SIA, and others). World-Office is entirely separate from "word-office" (a GitHub organization associated with Nextcloud and IONOS). World-Office maintains its own development roadmap, release cycle, and support channels.
>
All meaningful pull requests from WORLDOFFICE and word-office on GitHub have been reviewed and, where applicable, synced into this fork. An automated watch is in place that continuously monitors and integrates relevant upstream developments.
Server core components which are a part of [Document Server][1] and [Desktop Editors][2]. Enable the conversion between the most popular office document formats: DOC, DOCX, ODT, RTF, TXT, PDF, HTML, EPUB, XPS, DjVu, XLS, XLSX, ODS, CSV, PPT, PPTX, ODP.

  [1]: https://codeberg.org/World-Office/DocumentServer
  [2]: https://codeberg.org/World-Office/DesktopEditors

## Build third party dependencies

To build third-party dependencies you can use our build script at Common/3dParty/build_dependencies.sh. Currently it only supports a Nextcloud remote but feel free to add support for others as well. You have to add a NEXTCLOUD_USER, NEXTCLOUD_PASS, NEXTCLOUD_REMOTE and BASE_REMOTE_PATH. Then run 
```sh
./build_dependencies.sh
```

to build all dependencies. This takes very long (~5 hours or more). Once finished, the binary files are in `PKG_NAME/VERSION/TARGET_TRIPLET/PKG_NAME_binary.tar.bz2` of your specified remote. Once finished you can build the project with your pre-compiled binaries by specifying 
```sh
-DVCPKG_BINARY_REMOTE="https://my-remote.corp/repository/vcpkg/"
```
in the cmake command of the core or desktop build.

## License

Core is released under an GNU AGPL v3.0 license. See the LICENSE file for more information.
