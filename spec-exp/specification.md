## `did:webvh` DID Method Specification

### Conformance

As well as sections marked as non-normative, all examples, notes, and
informative checklists in this specification are non-normative. Everything
else in this specification is normative.

The key words **MAY**, **MUST**, **MUST NOT**, **NOT REQUIRED**,
**RECOMMENDED**, **REQUIRED**, **SHOULD**, and **SHOULD NOT** in this
specification are to be interpreted as described in BCP 14 [[spec:RFC2119]]
[[spec:RFC8174]] when, and only when, they appear in all capitals, as shown
here.

### Relationship to VH-Log

This version of `did:webvh` is a [[ref: specialisation]] of the
[[ref: VH-Log]] specification [[spec:VH-LOG]]. VH-Log defines the mechanism underlying
`did:webvh` — the log entry structure, cryptographic chaining, [[ref: SCID]],
[[ref: parameters]], key authorization and pre-rotation, [[ref: witnesses]],
[[ref: watchers]], the resolution algorithm, and the requirements for
publishing and retrieving log files. This specification defines only what is
specific to `did:webvh`, and implementers **MUST** consult [[ref: VH-Log]] for
the normative definition of the log mechanism.

`did:webvh` constrains VH-Log by:

- Specifying the [[ref: state]] object as a W3C DID Document ([[ref: DIDDoc]]).
- Defining the DID as `did:webvh:<SCID>:<domain>[:<path>]`, and the location
  of the [[ref: DID Log]] by the [DID-to-HTTPS
  Transformation](#the-did-to-https-transformation).
- Naming the log file `did.jsonl` and the witness proofs file
  `did-witness.json`.
- Using `method` (e.g., `did:webvh:1.0`) as the version parameter, in place
  of the VH-Log `logVersion` parameter.
- Requiring [[ref: witnesses]] to be identified by [[ref: did:key]] DIDs.
- Adding the `portable` [[ref: parameter]] and [[ref: DID portability]].
- Defining the DID method identifier, CRUD operations, DID resolution options
  and metadata, and DID URL handling, including the implicit `#files` and
  `#whois` services and publishing a parallel `did:web` DID.

`did:webvh` v1.0 defined the log mechanism itself. In this version, that
material is replaced by references to [[ref: VH-Log]]:

| Topic | `did:webvh` v1.0 | This version |
|---|---|---|
| Log entry structure, Create, Update and Read algorithms | Defined in `did:webvh` | VH-Log, with the `did:webvh` constraints defined here |
| [[ref: SCID]], [[ref: entry hash]], authorized keys, pre-rotation | Defined in `did:webvh` | VH-Log |
| Parameters | Defined in `did:webvh` | VH-Log, plus `method` and `portable` |
| [[ref: Witnesses]] and [[ref: watchers]], including the watcher HTTP API | Defined in `did:webvh` | VH-Log, plus `did:key` witness identifiers |
| Transport, SSRF and CORS requirements | Security Considerations | VH-Log's [Publishing and Retrieving Log Resources](https://swcurran.github.io/VH-Log/next/index.html#publishing-and-retrieving-log-resources) |
| Version selection | `did:webvh` | VH-Log's [Selecting a Version](https://swcurran.github.io/VH-Log/next/index.html#selecting-a-version) |
| Checking the log against [[ref: watchers]] | Not defined | VH-Log's `checkWatchers`, `extraWatchers` and `minCopies` [resolution options](#didwebvh-resolution-options) |
| Security and Privacy Considerations | Partly normative | Non-normative; requirements are in the normative sections |

[`did:vh`](https://swcurran.github.io/didvh/) [[spec:DID-VH]] is a sibling VH-Log
specialisation that removes the domain and path from the DID. Its DID is
`did:vh:<SCID>`, and its [[ref: DID Log]] is passed to the [[ref: Resolver]]
by the client rather than located from the DID. Otherwise, the two methods are
kept as close as their different approaches to locating the log allow.

#### Compatibility with `did:webvh` v1.0

This version is intended to resolve every valid `did:webvh` v1.0 DID to the
same [[ref: DIDDoc]], with the same `method` value (`did:webvh:1.0`). The
following differences between this version and v1.0 are known. Each is to be
resolved, either by a change to [[ref: VH-Log]] or by accepting the
difference.

::: issue Whole-second `versionTime`

VH-Log requires `versionTime` values in whole seconds, and requires a
[[ref: Resolver]] to reject a value with fractional seconds. `did:webvh` v1.0
did not prohibit fractional seconds, so a v1.0 [[ref: DID Log]] with a
fractional-second `versionTime` fails verification under this version.

:::

::: issue `null` parameter values

`did:webvh` v1.0 prohibits `null` [[ref: parameter]] values, but says that
[[ref: Resolvers]] **SHOULD** accept them from early implementations and treat
them as the parameter's default value. VH-Log prohibits `null` and requires a
[[ref: Resolver]] to reject a [[ref: log entry]] with a non-conformant
parameter value, and a [[ref: specialisation]] cannot relax VH-Log's
processing rules. A v1.0 [[ref: DID Log]] that uses `null` fails verification
under this version.

:::

::: issue Watcher notification parameter

The `did:webvh` v1.0 watcher notification operation is **POST
`<WATCHER URL>/log?did=<DID>`**. VH-Log names the query parameter `id`
(**POST `<WATCHER URL>/log?id=<log identifier>`**), which this version uses.
A v1.0 [[ref: watcher]] does not recognise the `id` parameter.

:::

::: issue Non-HTTP watcher URIs

`did:webvh` v1.0 allows `watchers` entries to use schemes other than HTTP(S),
such as DIDs. VH-Log defines the `watchers` [[ref: parameter]] as a list of
HTTP(S) URLs. A v1.0 [[ref: DID Log]] that lists a non-HTTP(S)
[[ref: watcher]] may fail verification under this version.

:::

The [resolution options](#didwebvh-resolution-options) `checkWatchers`,
`extraWatchers` and `minCopies`, the `copies` and `warnings` metadata, and the
`invalidOptions`, `featureNotSupported`, `logForked` and `insufficientCopies`
errors are additions in this version. They do not change the result of
resolving a v1.0 DID when they are not used.

### Target System

The target system of the `did:webvh` DID method is the host (or domain)
name when the domain specified by the DID is resolved through the Domain Name
System (DNS) and verified by processing a log of DID versions.

### Method Name

The namestring that identifies this DID method is: `webvh`. A DID that uses
this method **MUST** begin with the following prefix: `did:webvh`. Per the DID
specification, this string **MUST** be in lowercase. The remainder of the DID,
after the prefix, is the [method-specific
identifier](#method-specific-identifier), specified below.

### Method-Specific Identifier

Every `did:webvh` DID **MUST** first conform to the DID Syntax ABNF Rules in [[spec:DID-CORE]] Section 3.1. The rules in this section are additional restrictions on, and do not replace, those rules. A `did:webvh` DID is valid only if it satisfies both the DID Core rules and the rules and validation requirements below.

When the DID Core `method-name` is `webvh`, the DID Core `method-specific-id` **MUST** additionally conform to the `webvh-method-specific-id` rule below. The rules `idchar` and `pct-encoded` are imported unchanged from DID Core. `ALPHA`, `DIGIT`, and `HEXDIG` are defined by [[spec:RFC5234]].

```abnf
webvh-method-specific-id = scid ":" webvh-domain
                             *( ":" webvh-path-segment )

scid                      = 46(base58btc-char)

base58btc-char            = %x31-39       ; 1-9
                          / %x41-48       ; A-H
                          / %x4A-4E       ; J-N
                          / %x50-5A       ; P-Z
                          / %x61-6B       ; a-k
                          / %x6D-7A       ; m-z

webvh-domain              = encoded-domain-name
                             [ percent-encoded-port ]

encoded-domain-name       = encoded-domain-label
                             1*( "." encoded-domain-label )

encoded-domain-label      = 1*( ALPHA / DIGIT / "-" / pct-encoded )

percent-encoded-port      = "%3A" port-number

port-number               = 1*5DIGIT

webvh-path-segment        = 1*idchar
```

ABNF character strings are case-insensitive by default, so `"%3A"` accepts either `%3A` or `%3a`. Producers **MUST** use the uppercase form `%3A` in the canonical representation.

The `scid` production describes the base58btc-encoded SHA-256 multihash generated and verified as specified in [SCID Generation and Verification](#scid-generation-and-verification). The `{SCID}` value used temporarily during DID creation is a placeholder and is not a conforming `scid`; it **MUST** be replaced before the DID is published or resolved.

The `webvh-domain` identifies the web origin from which the DID Log can be retrieved. After percent-decoding and applying the IDNA processing defined in [The DID to HTTPS Transformation](#the-did-to-https-transformation):

- the result **MUST** be a fully qualified domain name conforming to [[spec:RFC1035]], [[spec:RFC1123]], and [[spec:RFC2181]];
- the domain name **MUST** match the applicable TLS server identity requirements in [[spec:RFC9525]];
- the domain **MUST NOT** be an IPv4 or IPv6 address, including a non-canonical textual representation that a URL parser would normalize to an IP address;
- every DNS label **MUST** be non-empty, no more than 63 octets after IDNA processing, and the complete domain name **MUST** satisfy the DNS length limit; and
- percent-encoding **MUST** be valid and **MUST** be decoded exactly once before domain and port validation.

A percent-encoded colon (`%3A` or `%3a`) **MUST NOT** appear within `encoded-domain-name`. A `%3A` immediately followed by one to five decimal digits at the end of `webvh-domain` **MUST** be parsed as `percent-encoded-port`; if `percent-encoded-port` is present, `port-number` **MUST** represent a decimal integer in the range 1 through 65535 inclusive. The domain component **MUST NOT** contain more than one percent-encoded port separator.

Each `webvh-path-segment` represents one segment of the path used to retrieve the DID Log. A path segment **MUST** be non-empty. After percent-decoding exactly once, it:

- **MUST NOT** be `.` or `..`;
- **MUST NOT** contain `/`, `\\`, or U+0000; and
- **MUST NOT** begin or end with whitespace.

Invalid percent-encoding or failure of any decoded-value requirement **MUST** cause parsing, transformation, and resolution to fail with `invalidDid`.

The colons in `webvh-method-specific-id` delimit method-specific components. They are not DID URL path separators. For example, in:

```text
did:webvh:<SCID>:example.com:issuers:business
```

`issuers` and `business` are method-specific deployment path segments used to locate the DID Log.

By contrast, `/`, `?`, and `#` introduce DID URL path, query, and fragment components under DID Core Section 3.2. They are not part of `webvh-method-specific-id`. A `did:webvh` DID URL **MUST** first conform to the DID URL Syntax ABNF Rules in DID Core Section 3.2, and its contained DID **MUST** satisfy the additional rules in this section. This specification does not otherwise replace DID Core's `path-abempty`, `query`, or `fragment` productions.

The `id` of a resolved `did:webvh` DID Document identifies the DID subject and therefore **MUST** be a bare `did:webvh` DID. It **MUST NOT** contain a DID URL path, query, or fragment component.

Conforming identifiers have the following forms:

```text
did:webvh:<SCID>:example.com
did:webvh:<SCID>:example.com%3A3000
did:webvh:<SCID>:example.com:dids:issuer
did:webvh:<SCID>:example.com%3A3000:dids:issuer
```

These are syntax templates: `<SCID>` stands for an actual conforming SCID and is not the literal characters `<SCID>`.

As specified in the [DID-to-HTTPS Transformation](#the-did-to-https-transformation) section of this specification, `did:webvh` and `did:web` DIDs that have the same fully qualified domain and path transform to the same HTTPS URL, with the exception of the final file: `did.json` for `did:web` and `did.jsonl` for `did:webvh`. For `did:webvh` DIDs using [[ref: witnesses]], a `did-witness.json` file **MUST** also be available logically beside the `did.jsonl` file. See the [witnesses](#did-witnesses) section of this specification for details.


### The DID to HTTPS Transformation

The `did:webvh` [method-specific identifier](#method-specific-identifier) is
defined to enable a transformation of the DID to an HTTPS URL for publishing
and retrieving the [[ref: DID Log]]. This is the location of the log that
[[ref: VH-Log]] leaves to the [[ref: specialisation]]. This section defines the
transformation from DID to HTTPS URL, including a number of examples.

Given a `did:webvh`, the HTTPS URL for the [[ref: DID Log]] is generated by
carrying out the following steps. The steps are carried out by the
[[ref: DID Controller]] to determine where to publish the [[ref: DID Log]], and
by all resolvers to retrieve the [[ref: DID Log]]. The process described here
includes the appropriate handling of international domain names.

 1. **Remove the 'did:webvh:' prefix** from the input identifier.
 2. **Remove the SCID segment**, which is the first segment after the prefix.
 3. **Transform the domain component**, which is the first component, up to the first `:` delimiter, of the remaining method-specific identifier.
    - Validate all percent-encoding and percent-decode the component exactly once.
    - If the decoded component contains a port separator, separate and validate the port as a decimal integer in the range 1 through 65535 inclusive.
    - Apply Unicode normalization and IDNA2008 processing to the decoded domain name.
    - Validate the resulting domain name and reject any IPv4 or IPv6 address, including an input that the URL parser normalizes to an IP address.
    - Re-encode the port separator as the canonical uppercase string `%3A` when producing a DID representation. Preserve the ordinary `:` separator when producing the HTTPS URL.
 4. **Transform the method-specific deployment path**, consisting of the zero or more components after the domain component and delimited by `:` characters.
    - For each component, validate its percent-encoding and percent-decode it exactly once.
    - Reject a component if its decoded value is empty, is `.` or `..`, contains `/`, `\\`, or U+0000, or begins or ends with whitespace.
    - Percent-encode the validated decoded value according to [[spec:RFC3986]], using uppercase hexadecimal digits.
    - Join the resulting encoded path segments using `/`.
 5. **Reconstruct the HTTPS URL**:
    - Format as `https://{domain}:{port}/{encoded_path}/did.jsonl` if a port is present.
    - Format as `https://{domain}/{encoded_path}/did.jsonl` if there are path segments and no port.
    - If no path segments exist, format as `https://{domain}:{port}/.well-known/did.jsonl` or `https://{domain}/.well-known/did.jsonl` as applicable.

The DID URL path, query, and fragment, if present, **MUST** be separated from
the DID before this transformation is applied. They **MUST NOT** be
interpreted as part of the SCID, domain, port, or method-specific deployment
path.

If the DID is using [[ref: witnesses]], the URL of the witness proofs file is
defined by replacing the `/did.jsonl` at the end of the [[ref: DID Log]] URL
with `/did-witness.json`.

When this algorithm is used for dereferencing a DID URL path (such as
`<did>/whois` or `<did>/path/to/file` as defined in the section [DID URL Path
Handling](#did-url-path-handling)) using the implicit `services`, update step
**5.** to not include the `.well-known/` path segment, and to append the DID
URL path instead of `did.jsonl`.

The [[ref: DID Log]], the witness proofs file and other DID resources at these
URLs **MUST** be published and retrieved as defined in VH-Log's [Publishing
and Retrieving Log
Resources](https://swcurran.github.io/VH-Log/next/index.html#publishing-and-retrieving-log-resources)
section, which requires, among other things, HTTPS with TLS server
authentication, the `Access-Control-Allow-Origin: *` header on the
[[ref: DID Log]], no automatic redirects, and the rejection of IP literals and
private addresses.

The following are some examples of various DID-to-HTTPS transformations based
on the processing steps specified above.

::: example

`did:webvh` DIDs and the corresponding web locations of their `did:webvh` log file.
In the examples, `{SCID}` is a placeholder for where the generated [[ref: SCID]] will be
placed in the actual DIDs and HTTPS URLs. Note that when the `{SCID}` follows
the literal `did:webvh:` as a separate element, the `{SCID}` is not part of the
HTTPS URL.

---

domain/`did:web`-compatible

`did:webvh:{SCID}:example.com` -->

`https://example.com/.well-known/did.jsonl`

subdomain

`did:webvh:{SCID}:issuer.example.com` -->

`https://issuer.example.com/.well-known/did.jsonl`

path

`did:webvh:{SCID}:example.com:dids:issuer` -->

`https://example.com/dids/issuer/did.jsonl`

path w/ port

`did:webvh:{SCID}:example.com%3A3000:dids:issuer` -->

`https://example.com:3000/dids/issuer/did.jsonl`

internationalized domain

 `did:webvh:{SCID}:jp納豆.例.jp:用户` -->

 `https://xn--jp-cd2fp15c.xn--fsq.jp/%E7%94%A8%E6%88%B7/did.jsonl`

:::

The location of the `did:webvh` `did.jsonl` [[ref: DID Log]] file is the same
as where the comparable `did:web`'s `did.json` file is published. A
[[ref: DID Controller]] **MAY** publish both DIDs and so, both files. The
process to do so is described in the [publishing a parallel `did:web`
DID](#publishing-a-parallel-didweb-did) section of this specification.

::: warning

While the transformation from a `did:webvh` identifier to an HTTPS resource
relies on DNS resolution, a `did:webvh` identifier is not inherently bound to
or controlled by the entity associated with the corresponding DNS domain. As
[[ref: VH-Log]] defines, the location of a log is used only to find it, and
plays no part in verifying it. A `did:webvh` [[ref: DID Log]] can be obtained
from sources other than its HTTPS location, such as a [[ref: watcher]], and is
verified in the same way.

Verification of a `did:webvh` identifier using this specification ensures
cryptographic validity, but that does not imbue "trust" in the identifier
itself. Trust in a `did:webvh` DID comes from external sources, such as
verifiable credentials issued by trusted parties (possibly discovered by
dereferencing the DID's [/whois](#the-whois-service) URL) or Trust Registries
that maintain authoritative records of trusted DIDs in a given context.

:::

### The DID Log File

The `did:webvh` [[ref: DID Log]] is a [[ref: VH-Log]] log file. The log entry
structure, [[ref: JSON Lines]] serialisation, cryptographic chaining, and
verification are all as defined in VH-Log's [The VH-Log
File](https://swcurran.github.io/VH-Log/next/index.html#the-vh-log-file)
section.

The `did:webvh`-specific constraints are:

- The log file **MUST** be named `did.jsonl`, at the URL given by the
  [DID-to-HTTPS Transformation](#the-did-to-https-transformation). Its media
  type **SHOULD** be `text/jsonl`.
- The witness proofs file **MUST** be named `did-witness.json`, beside the
  `did.jsonl` file. Its media type **SHOULD** be `application/json`.
- The `state` property of each entry **MUST** contain the [[ref: DIDDoc]] for
  that version of the DID.
- The `parameters` property **MUST** follow [`did:webvh` DID Method
  Parameters](#didwebvh-did-method-parameters).

A JSON Schema definition of the `did:webvh` v1.0 [[ref: DID log entry]] can be
found in the
[log_entry.json](https://raw.githubusercontent.com/decentralized-identity/didwebvh/refs/heads/main/schemas/v1.0/log_entry.json)
file in this repository. Examples of [[ref: DID Logs]] and
[[ref: DID log entries]] can be found in the
[Examples](https://didwebvh.info/latest/example/) section of the `did:webvh`
information website.

::: example

**`did:webvh`-specific examples of log entries that fail verification**, in
addition to the general examples in [[ref: VH-Log]]. Illustrative and
non-exhaustive; the normative rejection criteria are defined in the
[Resolution Algorithm](#resolution-algorithm).

1. **`state.id` [[ref: SCID]] does not match.** DID `did:webvh:Qm111...:example.com`, whose
   first entry has `parameters.scid: "Qm111..."`, has an entry with `state.id:
   "did:webvh:Qm222...:example.com"` — the [[ref: SCID]] values are
   inconsistent.

2. **SCID changes under portability.** Entry N has `state.id:
   "did:webvh:Qm222...:new.example.com"` while entry N-1 carried `Qm111...` —
   the [[ref: SCID]] is immutable across all entries.

3. **`portable` set after the first entry.** Entry 3 sets `"portable": true`.
   Portability can be enabled only in the first entry.

4. **Unknown `method` value.** First entry has `parameters.method:
   "did:webvh:99.0"`, `"did:webvh:1.0-rc1"`, `"didwebvh:1.0"` or
   `"did:vh:1.0"` — unrecognised values are rejected and never silently
   downgraded.

5. **`logVersion` present.** An entry includes `"logVersion": "vh-log:1.0"`.
   `did:webvh` uses `method` as its version parameter, so `logVersion` is not
   permitted.

6. **Witness not a `did:key`.** `{"threshold": 1, "witnesses": [{"id":
   "did:web:witness.example.com"}]}` — witness identifiers must be
   [[ref: did:key]] DIDs.

:::

### DID Method Operations

#### Create (Register)

Creating a `did:webvh` DID follows VH-Log's
[Create](https://swcurran.github.io/VH-Log/next/index.html#create) algorithm,
with the following `did:webvh`-specific constraints:

1. **The DID string** (VH-Log Create step 1). The start of the DID **MUST** be
   the literal string `did:webvh:{SCID}:`, where `{SCID}` is the placeholder
   for the [[ref: SCID]] calculated later. It is followed by a fully qualified
   domain name (with an optional port and path) that is secured by a TLS
   certificate and reflects the web location at which the [[ref: DID Log]]
   will be published. The DID **MUST** be a valid `did:webvh` DID as defined
   in [Method-Specific Identifier](#method-specific-identifier).
   - The [[ref: SCID]] is not by default in the HTTPS URL for the DID. A
     [[ref: DID Controller]] **MAY** include the [[ref: SCID]] in the HTTPS URL
     by inserting additional `{SCID}` placeholders into the domain name or path
     components of the method-specific identifier. Additional instances of the
     [[ref: SCID]] in the domain and/or path do not alter the [DID-to-HTTPS
     transformation](#the-did-to-https-transformation).

2. **Keys** (VH-Log Create step 2). At the same time as the authorization key
   pairs, the [[ref: DID Controller]] generates any other key pairs to be
   placed into the initial [[ref: DIDDoc]]. The public keys of the
   authorization key pairs **MAY** also be used in the [[ref: DIDDoc]], but
   that is not required.

3. **The initial [[ref: state]] object MUST be a [[ref: DIDDoc]]** (VH-Log
   Create step 3). Its top-level `id` **MUST** be the DID string from step 1,
   including the `{SCID}` placeholder. All other absolute references to the
   DID within the [[ref: DIDDoc]] **MUST** likewise use the placeholder form
   (e.g., `did:webvh:{SCID}:example.com#key-1`). The [[ref: DIDDoc]] **MAY**
   contain any other content the [[ref: DID Controller]] requires. Because
   VH-Log replaces every `{SCID}` placeholder in the first entry, the literal
   string `{SCID}` can be introduced into the [[ref: DIDDoc]] only in a later
   entry.

4. **The [[ref: parameters]]** (VH-Log Create step 4) **MUST** follow
   [`did:webvh` DID Method Parameters](#didwebvh-did-method-parameters),
   including a `did:webvh` `method` value.

5. **Witnesses** (VH-Log Create step 6). If [[ref: witnesses]] are used, the
   witness proofs **MUST** be collected and published in the
   `did-witness.json` file before the [[ref: DID Log]] is published. See [DID
   Witnesses](#did-witnesses).

6. **Publishing** (VH-Log Create step 7). The [[ref: DID Log]] **MUST** be
   published as `did.jsonl` at the URL given by the [DID-to-HTTPS
   Transformation](#the-did-to-https-transformation). This is a logical
   operation — how a deployment serves the `did.jsonl` content is not
   constrained. If there are [[ref: watchers]], they are notified as defined in
   [DID Watchers](#did-watchers).

A [[ref: DID Controller]] **MAY** generate an equivalent `did:web`
[[ref: DIDDoc]] and publish it as defined in [Publishing a Parallel `did:web`
DID](#publishing-a-parallel-didweb-did).

#### Read (Resolve)

A `did:webvh` [[ref: Resolver]] implements the `resolve` function defined in
[[spec:DID-RESOLUTION]]:

```text
resolve(did, resolutionOptions) →
   « didResolutionMetadata, didDocument, didDocumentMetadata »
```

by applying VH-Log's [Read
(Resolve)](https://swcurran.github.io/VH-Log/next/index.html#read-resolve)
algorithm, including its [Resolution
Options](https://swcurran.github.io/VH-Log/next/index.html#resolution-options),
[Comparing Copies of a
Log](https://swcurran.github.io/VH-Log/next/index.html#comparing-copies-of-a-log)
and [Selecting a
Version](https://swcurran.github.io/VH-Log/next/index.html#selecting-a-version)
sections, with the `did:webvh`-specific rules in this section.

##### `did:webvh` Resolution Options

The VH-Log resolution options are passed in `resolutionOptions`. `versionId`
and `versionTime` are defined in [[spec:DID-RESOLUTION]]; `versionNumber`,
`checkWatchers`, `extraWatchers` and `minCopies` are `did:webvh`-specific, and
are to be registered in [[spec:DID-EXTENSION-RESOLUTION]]. In addition to
VH-Log's requirements for these options:

- A malformed option, or more than one of `versionId`, `versionTime` and
  `versionNumber`, **MUST** cause the `invalidOptions` error.
- An option the [[ref: Resolver]] does not support **MUST** cause the
  `featureNotSupported` error. A [[ref: Resolver]] **SHOULD** support
  `checkWatchers`, `extraWatchers` and `minCopies`.
- Each `extraWatchers` value **MUST** be an `https` URL.

::: example
Resolving version 2 of a DID, and checking the [[ref: DID Log]] against two of
the [[ref: watchers]] listed in it and a [[ref: watcher]] chosen by the
client:

```json
{
  "did": "did:webvh:QmfGEUAcMpzo25kF2Rhn8L5FAXysfGnkzjwdKoNPi615XQ:example.com",
  "resolutionOptions": {
    "versionNumber": 2,
    "checkWatchers": 2,
    "extraWatchers": [ "https://watcher.example.org" ],
    "minCopies": 3
  }
}
```
:::

##### Resolution Algorithm

A `did:webvh` [[ref: Resolver]] **MUST** apply the following
`did:webvh`-specific rules within the VH-Log Read (Resolve) algorithm:

1. **The DID.** The `did` input **MUST** conform to the rules in
   [Method-Specific Identifier](#method-specific-identifier); if it does not,
   return the `invalidDid` error.
2. **Locating the log** (VH-Log Read step 1). The [[ref: DID Log]] and witness
   proofs file are retrieved from the URLs given by the [DID-to-HTTPS
   Transformation](#the-did-to-https-transformation). When performing the DNS
   resolution, the [[ref: Resolver]] **SHOULD** use DNS over HTTPS
   [[spec:rfc8484]], to prevent tracking of the DID being resolved. As VH-Log
   allows, the [[ref: Resolver]] **MAY** instead, or also, retrieve them from
   a [[ref: watcher]] using the [[ref: SCID]] in the DID — for example, if the
   [[ref: DID Log]] is not found at the HTTPS location. If the
   [[ref: DID Log]] cannot be found, return the `notFound` error.
3. **Parameters** (VH-Log Read step 1). `parameters` **MUST** adhere to
   [`did:webvh` DID Method Parameters](#didwebvh-did-method-parameters).
4. **Witnesses** (VH-Log Read step 2.1). Witness proofs **MUST** be verified as
   defined in [DID Witnesses](#did-witnesses).
5. **State** (VH-Log Read step 6). Before processing any entries, initialize a
   counter `didIdMatchCount` to `0`. Then, for every entry:
   1. The top-level `id` of `state` **MUST** parse as a `did:webvh` DID, as
      defined in [Method-Specific Identifier](#method-specific-identifier).
   2. The SCID segment of `state.id` **MUST** be byte-for-byte identical to
      the `scid` [[ref: parameter]] of the first entry, and to the
      [[ref: SCID]] in the `did` input.
   3. If the `state.id` is not the same as in the previous entry, the change
      **MUST** be permitted by [DID Portability](#did-portability).
   4. If the `did` input is exactly equal to `state.id`, increment
      `didIdMatchCount` by `1`.

   After all entries have been processed, if `didIdMatchCount` is `0`, no
   entry's `state.id` matches the DID being resolved, and the
   [[ref: Resolver]] **MUST** return the `invalidDid` error. These checks
   apply to every entry verified, including those of further copies
   retrieved with `checkWatchers` or `extraWatchers`.
6. **Implicit services.** If the [[ref: DIDDoc]] being returned does not
   already include the two `did:webvh` implicit services defined in
   [`did:webvh` Implicit DID URL Path Handler
   Services](#didwebvh-implicit-did-url-path-handler-services), add them to
   it, using the defaults described there. This requirement is **at risk**;
   see the note in that section.
7. **Result.** Return the [[ref: DIDDoc]] (unless the DID is deactivated, as
   defined in [Deactivate (Revoke)](#deactivate-revoke)) with the metadata
   defined in [DID Resolution Metadata](#did-resolution-metadata). A failure
   that VH-Log defines returns the corresponding `error` listed there.

##### DID Resolution Metadata

As defined in [[spec:DID-RESOLUTION]], a `did:webvh` [[ref: Resolver]]
**SHOULD** return the following DID Document Metadata:

```json
{
  "versionId": "1-QmRRaLXwc6BjBuBPosSupJwEQ8w9f3znP7yfbpGfwcnLr6",
  "versionTime": "2025-01-23T04:12:36Z",
  "created": "2025-01-23T04:12:36Z",
  "updated": "2025-01-23T04:12:36Z",
  "scid": "QmPEQVM1JPTyrvEgBcDXwjK4TeyLGSX1PxjgyeAisdWM1p",
  "portable": false,
  "deactivated": false,
  "ttl": "3600",
  "witness": { ... },
  "watchers": [ ... ]
}
```

The items are taken from the VH-Log [Resolution
Result](https://swcurran.github.io/VH-Log/next/index.html#resolution-result),
plus `portable`, as follows:

- `versionId` — The `versionId` of the [[ref: DID log entry]] of the resolved
  [[ref: DIDDoc]] version.
- `versionTime` — The `versionTime` of the [[ref: DID log entry]] of the
  resolved [[ref: DIDDoc]] version, as an [[ref: ISO8601]] timestamp.
- `created` — The `versionTime` of the first [[ref: DID log entry]], as an
  [[ref: ISO8601]] timestamp: when, according to the
  [[ref: DID Controller]], the DID was created.
- `updated` — The `versionTime` of the last valid [[ref: DID log entry]], as
  an [[ref: ISO8601]] timestamp.
- `scid` — The [[ref: SCID]] of the DID.
- `portable` — A boolean that is `true` if [[ref: portability]] is active, so
  that the DID may be moved in the future, as defined in [DID
  Portability](#did-portability).
- `deactivated` — A boolean that is `true` if the DID has been deactivated,
  as defined in [Deactivate (Revoke)](#deactivate-revoke).
- `ttl` — A string containing the unsigned integer value, in seconds, of the
  active `ttl` [[ref: parameter]]: guidance from the [[ref: DID Controller]]
  on how long to cache the resolution result. Caching is valuable where a
  client resolves several DID URLs for the same DID — for example, the
  current [[ref: DIDDoc]] and then each previous version — so that the
  [[ref: Resolver]] need not retrieve and process the [[ref: DID Log]] on each
  call.
- `witness` — The active `witness` [[ref: parameter]] object, as defined in
  VH-Log's [The `witness`
  Parameter](https://swcurran.github.io/VH-Log/next/index.html#the-witness-parameter)
  section, if [[ref: witnesses]] are active. Its `threshold` value is a string
  containing the integer value.
- `watchers` — The active list of [[ref: watcher]] URLs from the `watchers`
  [[ref: parameter]].

"Active" means as set by the last valid [[ref: DID log entry]]. That is the
last entry in the [[ref: DID Log]] unless later entries fail verification, in
which case it is the last entry before the first failure.

`ttl` and the `witness` `threshold` are strings, not integers, because
[[spec:DID-RESOLUTION]] does not permit integers in DID metadata; a client
converts them to integers before use.

The `copies` and `warnings` items of the VH-Log [Resolution
Result](https://swcurran.github.io/VH-Log/next/index.html#resolution-result)
describe the resolution rather than the DID, so they are returned in the
`didResolutionMetadata`, not the DID Document Metadata. A [[ref: Resolver]]
given `checkWatchers`, `extraWatchers` or `minCopies` **MUST** include
`copies`, and **SHOULD** include `warnings` when there are any, with the
structure and values defined in VH-Log:

```json
{
  "contentType": "application/did+json",
  "copies": [
    {
      "source": "https://example.com/.well-known/did.jsonl",
      "versionId": "3-QmRRaLXwc6BjBuBPosSupJwEQ8w9f3znP7yfbpGfwcnLr6",
      "status": "current"
    },
    {
      "source": "https://watcher.example.org",
      "versionId": "2-QmPEQVM1JPTyrvEgBcDXwjK4TeyLGSX1PxjgyeAisdWM1p",
      "status": "behind"
    },
    {
      "source": "https://watcher.example.net",
      "status": "unavailable"
    }
  ],
  "warnings": [
    {
      "code": "copy-behind",
      "source": "https://watcher.example.org",
      "message": "Copy is 1 entry behind the reference copy."
    },
    {
      "code": "copy-unavailable",
      "source": "https://watcher.example.net",
      "message": "Watcher did not respond."
    }
  ]
}
```

When a DID resolution error occurs, the `error` field **MUST** be included in
the `didResolutionMetadata`, as defined in [[spec:DID-RESOLUTION]], and
[[ref: Resolvers]] **SHOULD** include `problemDetails` following
[[spec:rfc9457]], as in this example:

```json
"didResolutionMetadata": {
  "error": "invalidDid",
  "problemDetails": {
    "type": "https://w3id.org/security#INVALID_CONTROLLED_IDENTIFIER_DOCUMENT_ID",
    "title": "The resolved DID is invalid.",
    "detail": "Parse error of the resolved DID at character 3, expected ':'."
  }
}
```

The following `error` values **MUST** be used. The first four are from
[[spec:DID-EXTENSION-RESOLUTION]]; `logForked` and `insufficientCopies` are
also used by `did:vh`, and are to be registered there.

- `invalidDid` — The DID is malformed, or its [[ref: DID Log]] (or the
  requested version) fails verification.
- `invalidOptions` — A resolution option is malformed or not permitted.
- `notFound` — The [[ref: DID Log]] was not found, the requested version does
  not exist, or the resource referenced by a DID URL was not found.
- `featureNotSupported` — The [[ref: Resolver]] does not support
  `versionNumber`, `checkWatchers`, `extraWatchers` or `minCopies`.
- `logForked` — Two copies of the [[ref: DID Log]] both pass verification but
  diverge, as defined in VH-Log's [Comparing Copies of a
  Log](https://swcurran.github.io/VH-Log/next/index.html#comparing-copies-of-a-log)
  section. The `problemDetails` **MUST** include the fork report that section
  requires.
- `insufficientCopies` — Fewer than `minCopies` copies of the
  [[ref: DID Log]] were retrieved and matched.

[[ref: Resolvers]] **SHOULD** populate the `problemDetails` field to aid in
diagnosing resolution failures. The [did:webvh information
site](https://didwebvh.info) may serve as a non-normative reference for common
`did:webvh` resolution error types and explanations.

##### DID URL Query Parameters

The `versionId`, `versionTime` and `versionNumber` options can also be given
as DID URL query parameters, such as
`did:webvh:<SCID>:example.com?versionNumber=2`. When a `did:webvh` DID URL is
dereferenced, the DID URL dereferencer **SHOULD** pass each of these
parameters to `resolve` as the resolution option of the same name.

#### Update (Rotate)

Updating a `did:webvh` DID follows VH-Log's
[Update](https://swcurran.github.io/VH-Log/next/index.html#update) algorithm,
with the following `did:webvh`-specific constraints:

- **State changes (VH-Log Update step 1):** Changes are made to the
  [[ref: DIDDoc]]. The top-level `id` **MUST** remain the DID, unless the DID
  is being moved as defined in [DID Portability](#did-portability).
- **Parameters (VH-Log Update step 2):** `parameters` **MUST** follow
  [`did:webvh` DID Method Parameters](#didwebvh-did-method-parameters).
- **Witnesses (VH-Log Update step 10):** If [[ref: witnesses]] are active,
  the updated `did-witness.json` file **MUST** be published **before** the
  updated [[ref: DID Log]]. See [DID Witnesses](#did-witnesses).
- **Publishing (VH-Log Update step 12):** The updated [[ref: DID Log]]
  **MUST** be published at the URL given by the [DID-to-HTTPS
  Transformation](#the-did-to-https-transformation) of the DID in the new
  entry's `state.id`. If there are [[ref: watchers]], they are notified as
  defined in [DID Watchers](#did-watchers).

A [[ref: DID Controller]] **MAY** generate an equivalent, updated `did:web`
[[ref: DIDDoc]] and publish it as defined in [Publishing a Parallel `did:web`
DID](#publishing-a-parallel-didweb-did).

#### Deactivate (Revoke)

A `did:webvh` DID is deactivated as defined in VH-Log's
[Deactivate](https://swcurran.github.io/VH-Log/next/index.html#deactivate)
section, by adding `"deactivated": true` to the [[ref: parameters]] of a new
[[ref: DID log entry]]. Once a DID is deactivated, a [[ref: Resolver]]
**MUST NOT** return the [[ref: DIDDoc]] and **MUST** include
`"deactivated": true` in the DID Document Metadata, as defined in
[[spec:DID-CORE]]. Prior versions **MAY** be resolved with the `versionId`,
`versionTime` or `versionNumber` options, and the metadata for them **MUST**
include `"deactivated": true`.

The [[spec:DID-CORE]] requirement not to return the [[ref: DIDDoc]] of a
deactivated DID may not suit a [[ref: DID Controller]] who wants the final
[[ref: DIDDoc]] to remain resolvable while signalling that the DID will no
longer be updated. As defined in VH-Log's
[Deactivate](https://swcurran.github.io/VH-Log/next/index.html#deactivate)
section, such a [[ref: DID Controller]] can instead set `updateKeys` to `[]`
without setting `deactivated`, so that the final [[ref: DIDDoc]] is still
returned but cannot be updated.

A [[ref: DID Controller]] can also remove the published [[ref: DID Log]] and
associated files. Resolution from the DID's HTTPS location then returns the
`notFound` error, although [[ref: watchers]] may continue to serve the last
known valid [[ref: DID Log]], as VH-Log describes.

Because the domain name in the DID is used to locate the [[ref: DID Log]], a
[[ref: DID Controller]] **SHOULD** deactivate the DID, or move it using [DID
Portability](#did-portability), before giving up control of the domain name or
web location, so that a later holder of the domain cannot be mistaken for the
[[ref: DID Controller]].

### `did:webvh` DID Method Parameters

`did:webvh` uses the VH-Log [parameters
mechanism](https://swcurran.github.io/VH-Log/next/index.html#vh-log-parameters),
including its [general
rules](https://swcurran.github.io/VH-Log/next/index.html#general-rules-for-parameters).
The parameters `scid`, `updateKeys`, `nextKeyHashes`, `witness`, `watchers`,
`deactivated`, and `ttl` are used exactly as defined in [[ref: VH-Log]], with
one `did:webvh`-specific constraint: `witness` `id` values **MUST** be
`did:key` DIDs (see [DID Witnesses](#did-witnesses)). The `parameters` object
**MUST NOT** include any other properties, except those listed below.

::: example
The `parameters` property in the first [[ref: DID log entry]]:

```json
{
  "method": "did:webvh:1.0",
  "scid": "{SCID}",
  "portable": true,
  "updateKeys": [
    "z82LkqR25TU88tztBEiFydNf4fUPn8oWBANckcmuqgonz9TAbK9a7WGQ5dm7jyqyRMpaRAe"
  ],
  "nextKeyHashes": [
    "enkkrohe5ccxyc7zghic6qux5inyzthg2tqka4b57kvtorysc3aa"
  ]
}
```
:::

- `method`: The version parameter of `did:webvh`, designated in place of
  VH-Log's `logVersion` as VH-Log's [parameters
  section](https://swcurran.github.io/VH-Log/next/index.html#vh-log-parameters)
  permits, and subject to all of VH-Log's rules for the version parameter: it
  **MUST** appear in the first entry, **MAY** appear in later entries to
  upgrade to a later version, and a value that is not exactly one of the
  acceptable values **MUST** cause resolution to terminate. `logVersion`
  itself **MUST NOT** be used. Acceptable values:
  - `did:webvh:1.0` — implies VH-Log `vh-log:1.0`, and permits the same hash
    algorithm (`SHA-256` only) and [[ref: Data Integrity]] cryptosuite
    (`eddsa-jcs-2022` [[spec:di-eddsa-v1.0]] only) for both log-entry and
    witness proofs.
- `portable`: A JSON boolean indicating whether the DID is portable, allowing
  the [[ref: DID Controller]] to move the DID to a new web location while
  retaining its [[ref: SCID]] and verifiable history. See [DID
  Portability](#did-portability).
  - `portable: true` is permitted **only** in the first entry. A later entry
    that sets `portable: true` **MUST** be rejected, regardless of historical
    state.
  - Defaults to `false` if omitted in the first entry. [[ref: Resolvers]]
    **SHOULD** warn if `portable` is omitted from the first entry.
  - Retains its value if omitted in later entries.
  - Setting `portable: false` in any later entry permanently disables
    portability; later entries **MUST NOT** set it back to `true`.

::: issue Experimental `method` value

This version uses `did:webvh:1.0` so that `did:webvh` v1.0 DIDs remain valid
(but see [Compatibility with `did:webvh`
v1.0](#compatibility-with-didwebvh-v10)). If this approach is adopted, the
next version of `did:webvh` will define a new `method` value, implying the
VH-Log version it is based on.

:::

### Cryptographic Agility

`did:webvh` inherits [cryptographic
agility](https://swcurran.github.io/VH-Log/next/index.html#cryptographic-agility)
from [[ref: VH-Log]] unchanged, with the `method` [[ref: parameter]] in the
role of `logVersion`. If a flaw is found in a permitted algorithm, a new
version of `did:webvh` will define a new `method` value, and
[[ref: DID Controllers]] can move to it in a new [[ref: DID log entry]].

### SCID Generation and Verification

The [[ref: SCID]] is generated and verified exactly as defined in VH-Log's
[SCID Generation and
Verification](https://swcurran.github.io/VH-Log/next/index.html#scid-generation-and-verification)
section. The preliminary log entry is the one described in [Create
(Register)](#create-register), in which the `{SCID}` placeholder appears in
the DID string wherever it is used, and in `parameters.scid`.

### Entry Hash Generation and Verification

The [[ref: entry hash]] is generated and verified exactly as defined in
VH-Log's [Entry Hash Generation and
Verification](https://swcurran.github.io/VH-Log/next/index.html#entry-hash-generation-and-verification)
section.

### Authorized Keys and Pre-Rotation

The authorized keys mechanism is as defined in VH-Log's [Authorized
Keys](https://swcurran.github.io/VH-Log/next/index.html#authorized-keys)
section, and key pre-rotation as defined in its [Pre-Rotation Key Hash
Generation and
Verification](https://swcurran.github.io/VH-Log/next/index.html#pre-rotation-key-hash-generation-and-verification)
section. The proof `cryptosuite` **MUST** be one permitted by the active
`method` [[ref: parameter]]; [[ref: Resolvers]] **MUST NOT** accept a
structurally valid signature using any other cryptosuite. Further guidance is
in [Using Pre-Rotation
Keys](https://didwebvh.info/latest/implementers-guide/prerotation-keys/) in
the `did:webvh` Implementer's Guide.

### DID Portability

A `did:webvh` DID can be moved to a new web location by changing the top-level
`id` of the [[ref: DIDDoc]] in a new [[ref: DID log entry]] to a DID that
transforms to a different HTTPS URL. Such a change **MUST** meet the following
conditions:

- The [[ref: parameter]] `portable` **MUST** have been set to `true` in the
  **first** [[ref: DID log entry]], and not since set to `false`.
- The [[ref: DID Log]] of the renamed DID **MUST** contain all of the
  [[ref: DID log entries]] from the creation of the DID, and the entry in which
  the DID is renamed **MUST** be a valid entry building on them.
- The [[ref: SCID]] **MUST** be the same in the original and renamed DID: the
  SCID segment of `state.id` in **every** [[ref: DID log entry]] **MUST** equal
  the `scid` [[ref: parameter]] of the first entry. Only the domain, port and
  path portions of `state.id` may change.
- The [[ref: DIDDoc]] **MUST** contain the prior DID string as an
  `alsoKnownAs` entry.

[[ref: DID Controllers]] **SHOULD** account for any DNS requirements in making
domain changes that affect a `did:webvh` DID being moved, such as those
outlined in [[spec:rfc1034]] and [[spec:rfc1035]]. When a DID is moved, an
HTTP redirect from the old location to the new one helps clients that still
hold the old DID, even when control of the DID is transferred.

A `did:webvh` DID can be created with a domain that was never used to host its
[[ref: DID Log]], and then moved to a domain under the
[[ref: DID Controller]]'s control. [[ref: Resolvers]] and their clients
**MUST** therefore ignore any prior domain components when evaluating the
history or trustworthiness of a `did:webvh` DID; only the current location and
the verifiable history are relevant. See [Misleading Prior-Domain
Association](#misleading-prior-domain-association).

### DID Witnesses

`did:webvh` uses the [[ref: witness]] mechanism defined in VH-Log's
[Witnesses](https://swcurran.github.io/VH-Log/next/index.html#witnesses)
section, with the following `did:webvh`-specific rules:

- Each `witness` `id` **MUST** be a [[ref: did:key]] DID whose key is
  compatible with a cryptosuite permitted by the active `method`. A `witness`
  [[ref: parameter]] containing any other `id` **MUST** be rejected when the
  parameter is validated, not when a signature is verified, so that an invalid
  witness configuration cannot take effect.
- A witness proof's `verificationMethod` **MUST** be a `did:key` DID URL of the
  form `did:key:<multibase>#<multibase>`, with the two multibase values
  byte-for-byte equal. The verification key **MUST** be recovered only by
  decoding the `did:key` body, as defined in the [[ref: did:key]]
  specification; [[ref: Resolvers]] **MUST NOT** resolve the witness DID or
  consult any other key store. A proof that does not meet these requirements
  **MUST** be discarded from threshold counting.
- The witness proofs file is `did-witness.json`, beside the `did.jsonl` file,
  with the data model defined in VH-Log's [The Witness Proofs
  File](https://swcurran.github.io/VH-Log/next/index.html#the-witness-proofs-file)
  section.

The body and fragment of a `did:key` DID URL must match because the body
defines the public key, while the fragment is only the verification method
`id`. Allowing them to differ would let an attacker claim that a proof was made
by `did:key:A` while signing with `did:key:B`.

Because `did:webvh` witness identifiers are `did:key` DIDs, they do not
identify who the [[ref: witnesses]] are. If an ecosystem needs to identify its
witnesses, its governance can define a mechanism, such as listing the witness
DIDs in a trust registry. Such mechanisms are outside the scope of this
specification. For more on using witnesses in production, see
[Witnesses](https://didwebvh.info/latest/implementers-guide/witnesses/) in the
`did:webvh` Implementer's Guide.

### DID Watchers

`did:webvh` uses the [[ref: watcher]] mechanism defined in VH-Log's
[Watchers](https://swcurran.github.io/VH-Log/next/index.html#watchers)
section, including its HTTP API, which the [did:webvh v1.0 Watcher OpenAPI
definition](https://raw.githubusercontent.com/decentralized-identity/didwebvh/refs/heads/main/watcherOpenAPI/watcher-v1.0.0.yml)
describes (but see the [watcher notification
issue](#compatibility-with-didwebvh-v10)). When resolving a `did:webvh` DID,
[[ref: Resolvers]] **MUST** return the active list of [[ref: watchers]] in the
DID Document Metadata.

For `did:webvh`, the log identifier in VH-Log's notification operation,
**POST `<WATCHER URL>/log?id=<log identifier>`**, is the DID. The
[[ref: watcher]] retrieves the [[ref: DID Log]] (and witness proofs file) from
the URL given by the [DID-to-HTTPS
Transformation](#the-did-to-https-transformation) of that DID, and indexes it
by its [[ref: SCID]]. The DID, rather than the [[ref: SCID]], is used so that
the [[ref: watcher]] can find the [[ref: DID Log]] after the DID is moved using
[DID Portability](#did-portability).

### Publishing a Parallel `did:web` DID

Each time a `did:webvh` version is created, the [[ref: DID Controller]] **MAY**
generate a corresponding `did:web` to publish along with the `did:webvh`. If
this is being done, the `did:webvh` DIDDoc **SHOULD** have the corresponding
`did:web` in the `alsoKnownAs` array. To publish a parallel `did:web` DIDDoc, the
[[ref: DID Controller]] **MUST**:

1. Start with the resolved version of the [[ref: DIDDoc]] from `did:webvh`.
2. If the "implicit" `did:webvh` services (as formally defined in [`did:webvh`
   Implicit DID URL Path Handler
   Services](#didwebvh-implicit-did-url-path-handler-services)) are not already
   present in the [[ref: DIDDoc]], they **MUST** be added. These services are
   the `#files` `PathService` with `id: "#files"` or `id: "<did>#files"` and
   the `whois` service with `id: "#whois"` or `id: "<did>#whois"`, with the
   `serviceEndpoint` for both derived from the [DID-to-HTTPS
   transformation](#the-did-to-https-transformation).
3. Execute a text replacement across the [[ref: DIDDoc]] of `did:webvh:<SCID>:` to
   `did:web:`, where `<SCID>` is the actual `did:webvh` [[ref: SCID]].
4. Add to the [[ref: DIDDoc]] `alsoKnownAs` array, the full `did:webvh` DID. If
   the `alsoKnownAs` array does not exist in the [[ref: DIDDoc]], it **MUST** be
   added.
5. Remove any duplicate entries in the `alsoKnownAs` array, including the
   `did:web` DID itself if it was duplicated in the earlier steps.
6. Publish the resulting [[ref: DIDDoc]] as the file `did.json` at the web location
   determined by the specified `did:web` DID-to-HTTPS transformation.

The benefit of doing this is that resolvers that have not been updated to
support `did:webvh` can continue to resolve the [[ref: DID Controller]]'s DIDs.
`did:web` resolvers that are aware of `did:webvh` features can use that knowledge,
and the existence of the `alsoKnownAs` `did:webvh` data in the [[ref: DIDDoc]] to get the
verifiable history of the DID.

The risk of publishing the `did:web` in parallel with the `did:webvh` is that the
added security and convenience of using `did:webvh` are lost: a resolver
settling for the `did:web` version of the DID does not get the verifiability of
the `did:webvh` log. See [Publishing a Parallel
`did:web`](#publishing-parallel-didweb).

### DID URL Path Handling

The `did:webvh` DID method embraces the expressive power of DID URLs while
preserving the semantic simplicity of a web-based dereferencing model. In
particular, `did:webvh` implementations **MUST** support dereferencing DID URL
paths, as defined by the [DID Core
specification](https://www.w3.org/TR/did-core/#did-url-path), using the
mechanism defined in this section.

Dereferencing a `did:webvh` DID URL first requires resolving the DID to obtain
the requested [[ref: DIDDoc]] -- the current version by default, or a specific
version if one is selected via the `versionId`, `versionTime`, or
`versionNumber` resolution options.

A service object in the resolved [[ref: DIDDoc]] is eligible for DID URL path
handling if its `type` includes `PathHandler`. `did:webvh` uses this
`PathHandler` service-selection mechanism and `PathService` service handler, which are expected to
be defined in a future revision of the DID Resolution specification
[[spec:DID-RESOLUTION]]. This specification will reference that mechanism
normatively once it stabilizes there; until then, it is described here in
full:

- Of the services whose `type` includes `PathHandler`, the object whose `path`
  attribute is the longest complete match from the beginning of the DID URL
  path is the selected service (if any).
- If the matched service type includes `PathService` (such as the `did:webvh`
  implicit services), the handler performs the following processing: the
  matched `path` value is removed from the beginning of the DID URL path.
  Whatever remains of the DID URL path (if anything) is appended to the
  selected service's `serviceEndpoint` to produce a result URL.
- The resulting URL is the location of the referenced resource, which can itself be
  dereferenced to retrieve the content referenced by the original DID URL.
- If the selected service is not of type `PathService`, use the handler
  appropriate for the service's type.

A [[ref: DID Controller]] **MAY** include any number of `PathHandler`-typed
services in the [[ref: DIDDoc]] to handle DID URL paths as needed. As defined
in [`did:webvh` Implicit DID URL Path Handler
Services](#didwebvh-implicit-did-url-path-handler-services) below, two
specific implicit services (`#files` and `#whois`) are always present in the
resolved [[ref: DIDDoc]] -- added by the resolver if not already defined
explicitly by the [[ref: DID Controller]]. A DID URL dereferencer does not
need to know which case applies; it simply locates and processes whatever
`PathHandler`-typed service objects are present, according to their `type`
and `path`.

#### `did:webvh` Implicit DID URL Path Handler Services

::: warning At Risk

**Feature at Risk:** The requirement that resolvers automatically add the
`did:webvh` implicit services (`#files` and `#whois`) to the resolved
[[ref: DIDDoc]] is at risk of being removed in a future version of this
specification. Resolvers will continue to add the implicit services to the
[[ref: DIDDoc]] of a DID whose `method` [[ref: parameter]] is
`did:webvh:1.0`. Whether, or for how long, DIDs updated to a later version
will continue to have the implicit services added has not been decided. A
[[ref: DID Controller]] updating a DID to a version that does not add the
implicit services would have to explicitly include the corresponding
`PathHandler`-typed services in the [[ref: DIDDoc]] to support `/whois` and
general DID URL path handling.

:::

`did:webvh` implicitly defines exactly two `PathHandler`-typed services:
`#files` and `#whois`. If the resolved [[ref: DIDDoc]] does not already
include a service with a matching `id`, the resolver **MUST** add the
corresponding implicit service defined below, as required by step 7 of the [Resolution
Algorithm](#resolution-algorithm).

A [[ref: DID Controller]] **MAY** explicitly define a service using either of
these reserved `id`s -- as an absolute reference that includes the DID (e.g.,
`<did>#files`), or a relative reference (e.g., `#files`) -- to override the
corresponding implicit service; the explicit definition **MUST** then be used
instead of the default. An explicit service using one of these `id`s **MUST**
be used for the same purpose as the implicit service it overrides: a service
with `id` `#files` (or `<did>#files`) **MUST** remain a
`PathHandler`/`PathService` for the DID's general DID URL path handling, and a
service with `id` `#whois` (or `<did>#whois`) **MUST** remain the service used
to locate the DID's `/whois` [[ref: Linked-VP]].

The implicit `#files` service is:

```json
{
  "id": "<did>#files",
  "type": ["PathHandler", "PathService"],
  "path": "/",
  "serviceEndpoint": "https://example.com/"
}
```

with `path` set to `/` so that it matches any DID URL path not otherwise
claimed by a more specific `PathHandler`, such as `#whois`. See [The `#files`
Service](#the-files-service) for its `serviceEndpoint` derivation and use.

The implicit `#whois` service is:

```json
{
  "@context": "https://identity.foundation/linked-vp/contexts/v1",
  "id": "<did>#whois",
  "type": ["PathHandler", "PathService", "whois"],
  "path": "/whois",
  "serviceEndpoint": "<did-to-https-translation>/whois.vp"
}
```

See [The `#whois` Service](#the-whois-service) for its `serviceEndpoint`
derivation and the content requirements of the resource it locates.

#### The `#files` Service

The `#files` service provides access to arbitrary files or resources at a
`did:webvh` DID URL path, selected using the mechanism described in [DID URL
Path Handling](#did-url-path-handling) above. See [`did:webvh` Implicit DID
URL Path Handler
Services](#didwebvh-implicit-did-url-path-handler-services) for its default
definition and the rules for overriding it.

The `serviceEndpoint` of the implicit `#files` service is derived from the
[DID-to-HTTPS transformation](#the-did-to-https-transformation): the final
path segment (`did.jsonl`) is removed, and if the resulting HTTPS URL contains
`.well-known/`, that segment **MUST** also be removed. A [[ref: DID
Controller]] wishing to publish the DID's files or resources at a location
other than this default -- for example, from a separate file server or CDN --
can do so by explicitly overriding the `#files` service with a `serviceEndpoint`
of their choosing, as described in [`did:webvh` Implicit DID URL Path Handler
Services](#didwebvh-implicit-did-url-path-handler-services).

For example, dereferencing `did:webvh:{SCID}:example.com/governance/issuers.json`
selects the `#files` service (its `path` of `/` is the only match). Removing
that matched `/` from the DID URL path `/governance/issuers.json` leaves
`governance/issuers.json`, which is appended to the `serviceEndpoint` to
produce `https://example.com/governance/issuers.json` -- the location of the
retrieved resource.

To dereference a DID URL of the form `<did:webvh DID>/path/to/file`, a
did:webvh DID URL dereferencer resolves the base DID to obtain the
[[ref: DIDDoc]], then applies the [DID URL Path
Handling](#did-url-path-handling) mechanism described above to select a
service and construct the resulting URL -- for a DID URL path not matched by
a more specific `PathHandler`, such as `#whois`, this selects the implicit
`#files` service -- which is then dereferenced to retrieve the resource.

#### The `#whois` Service

The `#whois` service enables recipients of a `did:webvh` DID to retrieve a
[[ref: Verifiable Presentation]]—optionally published by the [[ref: DID Controller]]—containing one or more embedded [[ref: Verifiable Credentials]].
These credentials may help resolvers or relying parties make informed trust
decisions about the controller of the DID.

`did:webvh` DIDs **automatically** support a `/whois` service endpoint,
selected using the [DID URL Path Handling](#did-url-path-handling) mechanism
described above, with `path` set to `/whois`. The `serviceEndpoint` of the
implicit `#whois` service is derived from the [DID-to-HTTPS
transformation](#the-did-to-https-transformation) for the [[ref: DID Log]],
except that the final path segment is `whois.vp` instead of `did.jsonl`.

The resource located at the resulting URL MUST be a [[ref: Linked-VP]]:

- It **MUST** be signed by the DID.
- It **MUST** contain one or more [[ref: Verifiable Credentials]] about the DID
  subject, using the DID or an equivalent identifier (such as one listed in the
  [[ref: DIDDoc]]'s `alsoKnownAs` array) as the `credentialSubject.id`.
- Those Verifiable Credentials **SHOULD** be [[spec:vc-recognized-entities-1.0]]
  Verifiable Credentials.

The contents of the presentation are determined solely by the
[[ref: DID Controller]], who selects which credentials to include. It is up to
the resolver or relying party to decide what assertions (and issuers) are
relevant for establishing trust. For example, the presentation could include a
credential linking the DID for a business to that business’s registration ID,
and a second credential (perhaps an ISO certification) where the
`credentialSubject.id` is the registration ID.

::: note future-direction-whois

**Future Direction for `/whois`**

The `whois` service `type` used here is expected to eventually be defined by
its own, separate specification, rather than by this document. A future
`whois-vh` specification is also anticipated, extending the `/whois` service
to be a Linked VP of [[spec:vc-recognized-entities-1.0]] Verifiable Credentials that itself
has a "verifiable history" -- using a mechanism similar to the one `did:webvh`
uses for the verifiable history of the DID itself.

:::

A [[ref: DID Controller]] **MAY** explicitly override the implicit `#whois`
service, as described in [`did:webvh` Implicit DID URL Path Handler
Services](#didwebvh-implicit-did-url-path-handler-services). This is required
if the controller wishes to:

- Publish the WHOIS Verifiable Presentation in a different format (i.e., not
  [[ref: W3C VCDM]]).
- Serve the WHOIS presentation from a different location, using a non-default
  media type, or under a different `id`.

To dereference the DID URL `<did:webvh DID>/whois`, a DID URL dereferencer
resolves the base `did:webvh` DID to obtain the [[ref: DIDDoc]], then applies
the [DID URL Path Handling](#did-url-path-handling) mechanism described above
to select the `#whois` service and construct the resulting URL, which is then
dereferenced to retrieve the resource.

#### Parallel `did:web` DID URL Path Handling

As required by [Publishing a Parallel `did:web`
DID](#publishing-a-parallel-didweb-did), a `did:web` DID published alongside a
`did:webvh` DID has the same [`did:webvh` Implicit DID URL Path Handler
Services](#didwebvh-implicit-did-url-path-handler-services) -- `#files` and
`#whois` -- as the `did:webvh` DID, with `serviceEndpoint` values that resolve
to the same underlying resources. As a result, the `#files` and `#whois`
services of the current `did:webvh` DID can be dereferenced using either DID,
referencing the same resource either way.

For the `#whois` service specifically, the [[ref: verifiable presentation]]
proof can reference either DID or include two proofs, each referencing a
verification method for one of the DIDs. If only one DID is referenced, since
both DIDs will have an `alsoKnownAs` for one another and include the same
verification methods, a resolver using the DID not referenced in the proof can
choose to verify the proof with the already resolved DID, or resolve the
referenced DID before verifying the proof.
