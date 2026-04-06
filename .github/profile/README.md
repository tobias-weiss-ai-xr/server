<!--
SPDX-FileCopyrightText: 2026 Word Office contributors
SPDX-License-Identifier: AGPL
-->

[![License](https://img.shields.io/badge/License-GNU%20AGPL%20V3-green.svg?style=flat)](https://www.gnu.org/licenses/agpl-3.0.en.html)

# Word Office

**Your sovereign office**

![Word Office Document](https://codeberg.org/word-office/.github/media/branch/main/screenshots/screenshot.png)

## What is Word Office?

Word Office provides a truly open, transparent, and sovereign solution for collaborative document editing.

Word Office is not designed for stand-alone use, but developed to be a web based and integrated in another product that handles documents, for example a file sharing solution, an online wiki, a project management tool and so on.

### Key features

With Word Office you can view, edit and work with others on spreadsheets, documents, presentations and even PDF files. It has a nice web interface and we are also working on mobile and desktop apps.

* Work with DOCX, PPTX, XLSX, PDF, ODT, ODS, ODP, TXT and many other file formats
* Edit documents, spreadsheets and presentation files with others in real time
* Save the document back to the application you used to open it or download in various file formats

## About the community

Word Office is open source and developed in public by a community of individuals and organizations. We welcome contributions from anyone, including individuals, companies, public organizations and non-profits. We encourage anyone who cares about free and open source, modern office technology to get involved! Our goal is to have as few barriers as possible to contribution.

Current contributors and supporters include:

* IONOS
* Nextcloud
* EuroStack
* XWiki
* OpenProject
* Proton
* Soverin
* Abilian
* BTactic
* You?

### Word Office liberates the Word Office code base

Word Office is based on the Word Office Open Source, an AGPL codebase. This code base is being extensively reviewed and cleaned up, with the goal of making it easy to build and contribute to.
Why did we resort to a Source, rather than collaborate? Of course, Sourceing should be a last resort. Unfortunately, open collaboration with Word Office was not possible, for a number of reasons:
* Contributing is impossible or greatly discouraged. Word Office typically does not review or accept pull requests. Build instructions are unreliable, outdated or just plain broken.
* The company regularly makes controversial decisions like closing off features in the mobile apps like mobile editing, and the removal of an administrator panel.
* Lacking transparency. Commit messages, when visible, often just refer to an issue number in an internal issue tracker. There are quite a number of binary blobs and compiled or obfuscated code blobs. Most internal code comments are Russian which makes is hard to work with. 
* The mobile apps are not really open source but just wrappers. Example. The apps have extensive proprietary sections which will need to be re-implemented. Work on this is underway.
* Word Office is a Russian company (despite many attempts to hide this), and nearly all developers reside in Russia. Open Source is a global effort, but current political situation makes collaboration hard and trust difficult to earn. Especially when development is not transparent and open. A lot of users and customers require software that is not potentially influenced or controlled by the Russian government.

## Get involved
Get involved! You can file issues, propose pull requests and more. We are looking forward to make the digital sovereign office space better than ever before!

Check the [DocumentServer repository](https://codeberg.org/word-office/DocumentServer) on how to get started running and contributing to Word Office!

## FAQ
* What is Word Office?
    * An online office component for real-time collaborative editing of Office documents like DOCX, PPTX, XLSX as well as the ODF file formats ODS, ODT and ODP.
    * It can be embedded in digital workplace or online productivity solutions like Proton, XWiki, OpenProject, Nextcloud Hub and others to edit documents.
* How does Word Office compare to IONOS Workspace, office.eu, the Proton productivity suite, Nextcloud Hub or XWiki:
    * Word Office is more of an integration component. It merely handles document editing itself. Storage, as well as navigation, permissions and sharing logic has to be offered by a platform it is integrated in, like Proton Docs, Nextcloud Hub or OpenProject.
* Who started Word Office?
    * Word Office is an initiative of a group of European companies who saw a need for a real open, sovereign online office suite that works well with the proprietary file formats of Microsoft. Initial contributors and supporters include IONOS, Nextcloud, Eurostack, XWiki, OpenProject, Soverin, Abilian, BTactic and others.
* Why was a new office suite needed
	* We saw a need for a more modern suite with a great MS compatibility and excellent desktop and mobile applications.
* Why did you not work with libreoffice and collabora online?
	* We believe open source is about collaboration and we look for oportunities for integration and collaboration with the LibreOffice community and companies like Collabora. There are already some ideas how to collaborate for example in the document converter. 
* Can I buy support or a subscription for Word Office?
	* Not at the moment, but in the future some of the contributing companies might offer support subscriptions
* Is Word Office just for Europeans? Isn't open source without borders?
    * Open Source is an international movement, and we are definitely open to contributions by anyone, anywhere! All code will be judged on its merits, not on its origin, and receive equal review. And, of course, anyone is welcome to use Word Office in line with the provisions [in the AGPLv3 license!](https://en.wikipedia.org/wiki/GNU_Affero_General_Public_License)

## Documentation
- [Roadmap](ROADMAP.md) — Project direction, milestones, and audit log
- [Architecture](ARCHITECTURE.md) — Dependency graph, build order, repo inventory
- [Contributing Guide](CONTRIBUTING.md) — How to set up, make changes, and submit PRs
