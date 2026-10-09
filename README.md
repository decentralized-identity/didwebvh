# The `did:webvh` DID Method -- `did:web` + Verifiable History

The spec repository for the `did:webvh` DID Method. `did:webvh` is `did:web`
extended to include the Verifiable History of the DID.

Read the spec: [https://identity.foundation/didwebvh](https://identity.foundation/didwebvh/next)

Proof of concept implementations available:

- Typescript: [https://github.com/decentralized-identity/trustdidweb-ts](https://github.com/decentralized-identity/trustdidweb-ts)
- Python: [https://github.com/decentralized-identity/trustdidweb-py](https://github.com/decentralized-identity/trustdidweb-py)
- Go: [https://github.com/nuts-foundation/trustdidweb-go](https://github.com/nuts-foundation/trustdidweb-go)
- Python Web Server: [https://github.com/decentralized-identity/trustdidweb-server-py](https://github.com/decentralized-identity/trustdidweb-server-py)

## Current Status of the Specification

The current stable version of the specification can be found at
[https://identity.foundation/didwebvh](https://identity.foundation/didwebvh).
See any guidance there about the status of the specification -- past versions,
upcoming changes, etc.

## Abstract

The `did:webvh` DID Method is an enhancement to the well-known `did:web` DID
method, providing a complementary web-based DID method that addresses
limitations of `did:web`, most notability, the verifiable history for which it
is name. `did:webvh` features include the following.

- Ongoing publishing of all DID Document (DIDDoc) versions for a DID instead of,
  or alongside a `did:web` DID/DIDDoc.
- Uses the same DID-to-HTTPS transformation as `did:web`.
- Provides resolvers the full history of the DID using a verifiable chain of
  updates to the DIDDoc from genesis to deactivation.
- A self-certifying identifier (SCID) for the DID that is globally
  unique and derived from the initial DIDDoc that enables DID portability, such
  as moving the DIDs web location (and so the DID string itself) while retaining
  the DID's history.
- DIDDoc updates include a proof signed by the DID Controller(s) *authorized* to
  update the DID.
- An optional mechanism for publishing "pre-rotation" keys to prevent loss of
  control of the DID in cases where an active private key is compromised.
- An optional mechanism for having collaborating "witnesses"
  that approve updates to the DID by the DID Controller before publication.
- DID URL path handling that defaults (but can be overridden) to automatically
  resolving `<did>/path/to/file` by using a comparable DID-to-HTTPS translation
  as for the DIDDoc.
- A DID URL path `<did>/whois` that defaults to automatically returning (if
  published by the DID controller) a Verifiable Presentation containing
  Verifiable Credentials with the DID as the `credentialSubject`,
  signed by the DID.

Combined, the additional features enable greater trust, security and
verifiability without compromising the simplicity of `did:web`. The incorporation
of the DID Core compatible "/whois" path, drawing inspiration from the
traditional WHOIS protocol, offers an easy to use, decentralized, trust
registry. `did:webvh` aims to establish a more trusted and secure web
environment by providing robust verification processes and enabling transparency
and authenticity in the management of decentralized digital identities.

## Contributing to the Specification

Pull requests (PRs) to this repository may be accepted. Each commit of a PR must
have a DCO (Developer Certificate of Origin -
[https://github.com/apps/dco](https://github.com/apps/dco)) sign-off. This can
be done from the command line by adding the `-s` (lower case) option on the `git
commit` command (e.g., `git commit -s -m "Comment about the commit"`).

Rendering and reviewing the spec locally for testing requires `npm` and `node`
installed. Follow these steps:

- Fork and locally clone the repository.
- Install `node` and `npm`.
- Run `npm install` from the root of your local repository.
- Edit the spec documents (in the `/spec` folder).
- Run `npm run render`'
  - Use `npm run edit` to interactively edit, render and review the spec.
- Load the root `index.html` file in a browser to be redirected to the current default version of the specification.

The specification is currently in [Spec-Up] format. See the
[Spec-Up Documentation] for a list of Spec-Up features and functionality.

[Spec-Up]: https://github.com/decentralized-identity/spec-up
[Spec-Up Documentation]: https://identity.foundation/spec-up/

## Publishing Previous Spec Versions

[Spec-Up] allows for multiple versions of the spec to be rendered and accessed
on the same site. We use that feature for the `did:webvh` DID Method spec to snapshot
previous versions of the spec for reference.

To create a snapshot of a version:

- Make a new folder in the root of the repository for the new version, called `spec-v<ver>`. For example `spec-v0.3`.
- Copy the current `spec` folder markdown files from the point of that version into the new folder. If you are doing this process as you are starting a new version, you can just copy the files from the `spec` folder of the main branch. Otherwise, you have to find the last commit of the version and get the files from that point in the GitHub history.
- Update the `specs.json` file to include a new specification:
  - Copy the primary spec entry text.
  - Paste that text into a new spec entry in the `"specs"` array.
  - Update the `"spec_directory"` property to be the name of the new folder you created.
  - Update the `"output_path"` property to be `./v<ver>`. For example `"./v0.3"`.
  - Append to the `"title"` property the version ` - Version <ver>`, For example ` - Version 0.3`.
- Add a link to the versioned specification in the `Previous Drafts` bullet list, in the `header.md` file in the main spec, so that readers can click on it from the main specification.
- Update the `header.md` file of the new version spec folder (e.g in `spec-v0.3`) to:
  - Change the status to `HISTORICAL -- **THIS IS NOT THE CURRENT VERSION OF THE SPECIFICATION**`
  - As appropriate, add guidance for readers **WITHOUT** altering the version of the specification itself.
  - Remove the `Past Drafts` section and put a relative link back to the current spec -- such as:

```text
**Latest Version:**

- Specification: [https://identity.foundation/didwebvh/](../)
- Repository: [https://github.com/decentralized-identity/didwebvh](https://github.com/decentralized-identity/didwebvh)

```

## Setting the Default Landing Page Version

In the lifecycle of the specification, there will be times when the latest
version is stable, with clarifications being added, and other times when new
versions are being defined with breaking changes. At all times we want to
control which version is the default spec. that comes up when a user goes to the
base spec URL
[https://identity.foundation/didwebvh/](:https://identity.foundation/didwebvh/).
We control that via the `index.html` file in the root folder. That is just a
redirect to one of the versions of the spec.

To change the default landing page spec. version, change the root folder
`index.html` line:

```html
window.location.replace("v1.0");
```

Notably -- set the `v1.0` to the appropriate version, which might be `next`, if
the we want the landing page to be the `Editor's Draft` for a period of time.

Here's how we manage things in different situations:

- The specification website landing page is always the current stable version of
  the specification, and past versions plus the next version ("Editor's Draft")
  are linked in that folder's `header.md` file.
- The `spec` folder is the `./next` folder and is called the `Editor's Draft`.
  Immediately after a stable version is announced, it is a copy of the newly
  stable version, but will evolve from there. Clarifications may be applied to the latest
  `spec-vx.x` folder, and if so, those changes **MUST** also be applied to the Editor's
  Draft.
