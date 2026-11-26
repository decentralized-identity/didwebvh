## `did:webvh` DID Method Specification

### Target System

The target system of the `did:webvh` DID method is the host (or domain)
name when the domain specified by the DID is resolved through the Domain Name
System (DNS) and verified by processing a log of DID versions.

### Method Name

The namestring that identifies this DID method is: `webvh`. A DID that uses this
method MUST begin with the following prefix: `did:webvh`. Per the DID
specification, this string MUST be in lowercase. The remainder of the DID, after
the prefix, is the [method-specific identifier](#method-specific-identifier),
specified below.

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

webvh-domain              = domain-name [ percent-encoded-port ]

domain-name               = domain-label 1*( "." domain-label )

domain-label              = let-dig [ *61let-dig-hyp let-dig ]

let-dig                   = ALPHA / DIGIT

let-dig-hyp               = ALPHA / DIGIT / "-"

percent-encoded-port      = "%3A" port-number

port-number               = 1*5DIGIT

webvh-path-segment        = 1*idchar
```

ABNF character strings are case-insensitive by default, so `"%3A"` accepts either `%3A` or `%3a`. Producers **MUST** use the uppercase form `%3A` in the canonical representation.

The `scid` production describes the base58btc-encoded SHA-256 multihash generated and verified as specified in [SCID Generation and Verification](#scid-generation-and-verification). The `{SCID}` value used temporarily during DID creation is a placeholder and is not a conforming `scid`; it **MUST** be replaced before the DID is published or resolved.

The `webvh-domain` identifies the web origin from which the [[ref: DID Log]]
can be retrieved. The `domain-name` is an ASCII fully qualified domain name.
It **MUST NOT** contain percent-encoding. The only percent-encoded sequence
permitted in `webvh-domain` is the `%3A` (or `%3a`) separator that introduces
`percent-encoded-port`. A domain name that contains non-ASCII characters
**MUST** be expressed using IDNA2008 A-labels, as specified in
[International Domain Names](#international-domain-names).

The `domain-name`:

- **MUST** conform to [[spec:RFC1035]], [[spec:RFC1123]] and [[spec:RFC2181]].
  In particular, every label **MUST** be an LDH label as defined in
  [[spec:RFC5890]] Section 2.3.1, of between 1 and 63 octets.
- **MUST NOT** exceed 253 octets in total, excluding any port.
- **MUST** match the applicable TLS server identity requirements in
  [[spec:RFC9525]].
- **MUST NOT** be, or be interpretable as, an IPv4 or IPv6 address. This
  includes non-canonical textual forms that a URL parser would normalize to an
  IP address. To this end, the final label **MUST NOT** consist only of
  decimal digits, and **MUST NOT** consist of `0x` or `0X` followed only by
  zero or more hexadecimal digits.
- **MUST**, if any label begins with the characters `xn--` in any letter case,
  write that label entirely in lowercase.

A percent-encoded colon **MUST NOT** appear within `domain-name`. A `%3A` or
`%3a` immediately followed by one to five decimal digits at the end of
`webvh-domain` **MUST** be parsed as `percent-encoded-port`. If
`percent-encoded-port` is present, `port-number` **MUST** represent a decimal
integer in the range 1 through 65535 inclusive. The domain component
**MUST NOT** contain more than one percent-encoded port separator.

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

#### Case Sensitivity and Normalization

This section defines the case sensitivity and normalization of the
`did:webvh` method-specific identifier, as required by [[spec:DID-CORE]]
Section 8.1.

- **Comparison.** Two `did:webvh` DIDs are the same DID if and only if they
  are identical character for character after the hexadecimal digits of every
  percent-encoded octet have been converted to uppercase. No other
  normalization is applied when comparing DIDs. In particular, letter case in
  the SCID, the domain name and the path segments is significant for DID
  comparison, even though DNS treats domain names case-insensitively.
- **No resolver normalization.** Resolvers **MUST NOT** apply Unicode
  normalization, IDNA mapping, Punycode conversion or case folding to any part
  of a `did:webvh` DID, either when parsing it or when comparing it to the
  `id` of a resolved [[ref: DIDDoc]].
- **Canonical form for producers.** [[ref: DID Controllers]] **MUST** use
  uppercase hexadecimal digits in all percent-encoding, and **MUST NOT**
  percent-encode any character that is permitted unencoded by the
  `webvh-method-specific-id` rule. They **SHOULD** use lowercase for all
  letters in the domain name, except where the [[ref: SCID]] is placed in the
  domain name.
- **Path segments.** Percent-encoded octets in a `webvh-path-segment`
  represent UTF-8 [[spec:RFC3629]]. A path segment whose decoded octets are
  not well-formed UTF-8 is invalid. [[ref: DID Controllers]] **SHOULD** apply
  Unicode Normalization Form C [[spec:UAX15]] to path text before
  percent-encoding it.

Because the DID string, including its domain and path, is part of the input
to [SCID generation](#scid-generation-and-verification), DIDs that differ in
encoding have different SCIDs and are different DIDs, even if they transform
to the same HTTPS URL. Only the form recorded in the [[ref: DID Log]]
resolves, because resolution requires the resolved DID to match `state.id`
exactly.

#### International Domain Names

A `did:webvh` DID **MAY** use an internationalized domain name (IDN). In the
DID, every label of an IDN that contains non-ASCII characters **MUST** be
represented by its A-label, as defined in [[spec:RFC5890]] Section 2.3.2.1
and constructed as specified in [[spec:RFC5891]] Section 4.4. U-labels,
whether raw or percent-encoded, **MUST NOT** appear in a `did:webvh` DID.

**Creating a DID on an IDN.** A [[ref: DID Controller]] converting a Unicode
domain name to A-labels **SHOULD** apply the UTS #46 `ToASCII` operation
[[spec:UTS46]] with:

- `Transitional_Processing` = `false`
- `CheckHyphens` = `false`
- `CheckBidi` = `true`
- `CheckJoiners` = `true`
- `UseSTD3ASCIIRules` = `false`
- `VerifyDnsLength` = `false`

This is equivalent to the WHATWG URL "domain to ASCII" algorithm with
*beStrict* set to `false` [[spec:URL]], and it produces the same host that
conforming web browsers and HTTP clients connect to. The result **MUST**
satisfy the `domain-name` rule and the validation requirements in
[Method-Specific Identifier](#method-specific-identifier). The
[[ref: DID Controller]] **SHOULD** confirm that the resulting host name
matches the TLS certificate of the server that will publish the
[[ref: DID Log]] before creating the DID.

**Resolving a DID on an IDN.** An A-label is an ordinary LDH label. Resolvers
process it exactly like any other label: they validate it as specified in
[Method-Specific Identifier](#method-specific-identifier) and copy it
verbatim into the HTTPS URL. Resolvers are not required to verify that a
label beginning with `xn--` is a valid A-label. A label that is not a valid
A-label cannot be registered in the DNS under IDNA2008, so resolving it fails
at DNS lookup or TLS verification.

**Displaying a DID on an IDN.** Software that presents a `did:webvh` DID to a
person **MAY** convert A-labels to U-labels for display, using the UTS #46
`ToUnicode` operation. When it does, it **SHOULD** apply the confusable and
mixed-script detection described in [[spec:UTS39]], and **SHOULD** make the
A-label form available. The display form is not a `did:webvh` DID. It
**MUST NOT** be used for DID comparison, as the value of any `id`,
`controller` or `alsoKnownAs` property, or as input to resolution.

::: note Why A-labels
Placing A-labels in the DID makes the DID-to-HTTPS transformation independent
of Unicode and IDNA processing. Every resolver produces the same HTTPS URL by
copying the domain verbatim, whatever its platform's IDNA implementation. The
choice of IDNA profile matters only once, when the [[ref: DID Controller]]
creates the DID. A-labels are also the form used by the DNS, by TLS
certificates and by `did:web` resolvers, and they satisfy the [[spec:DID-CORE]]
`idchar` rule without percent-encoding.
:::

### The DID to HTTPS Transformation

The `did:webvh` [method-specific identifier](#method-specific-identifier) is
defined to enable a transformation of the DID to an HTTPS URL for publishing
and retrieving the [[ref: DID Log]]. This section defines the transformation
from DID to HTTPS URL, including a number of examples.

Given a `did:webvh`, the HTTPS URL for the [[ref: DID Log]] is generated by
carrying out the following steps. The steps are carried out by the [[ref: DID Controller]] to determine where to publish the [[ref: DID Log]], and by all resolvers to
retrieve the [[ref: DID Log]]. International domain names require no special
processing in this transformation, because the DID carries them as A-labels
(see [International Domain Names](#international-domain-names)).

 1. **Remove the 'did:webvh:' prefix** from the input identifier.
 2. **Remove the SCID segment**, which is the first segment after the prefix.
 3. **Transform the domain component**, which is the first component, up to the first `:` delimiter, of the remaining method-specific identifier.
    - If the component ends with `%3A` or `%3a` followed by one to five decimal digits, separate the port and validate it as a decimal integer in the range 1 through 65535 inclusive.
    - Reject the component if what remains contains any `%` character.
    - Validate the domain name as specified in [Method-Specific Identifier](#method-specific-identifier), including the LDH, length and IP-address requirements.
    - Do not apply percent-decoding, Unicode normalization, IDNA processing or case folding to the domain name. The validated domain name is used verbatim in the HTTPS URL.
    - Re-encode the port separator as the canonical uppercase string `%3A` when producing a DID representation. Preserve the ordinary `:` separator when producing the HTTPS URL.
 4. **Transform the method-specific deployment path**, consisting of the zero or more components after the domain component and delimited by `:` characters.
    - For each component, validate its percent-encoding and percent-decode it exactly once. The decoded octets **MUST** be well-formed UTF-8. Do not apply Unicode normalization to the decoded value.
    - Reject a component if its decoded value is empty, is `.` or `..`, contains `/`, `\\`, or U+0000, or begins or ends with whitespace.
    - Percent-encode the validated decoded value according to [[spec:RFC3986]], using uppercase hexadecimal digits.
    - Join the resulting encoded path segments using `/`.
 5. **Reconstruct the HTTPS URL**:
    - Format as `https://{domain}:{port}/{encoded_path}/did.jsonl` if a port is present.
    - Format as `https://{domain}/{encoded_path}/did.jsonl` if there are path segments and no port.
    - If no path segments exist, format as `https://{domain}:{port}/.well-known/did.jsonl` or `https://{domain}/.well-known/did.jsonl` as applicable.
 6. The content type for the `did.jsonl` file **SHOULD** be `text/jsonl`.

Any validation failure in steps 3 or 4 **MUST** cause parsing, transformation
and resolution to fail with `invalidDid`, and **MUST** occur before any
network request is made.

The DID URL path, query, and fragment, if present, **MUST** be separated from the DID before this transformation is applied. They **MUST NOT** be interpreted as part of the SCID, domain, port, or method-specific deployment path.

 If the DID is using [[ref: witnesses]], an extra JSON file containing the witness proofs for the [[ref: DID Log Entries]] must be published and retrieved during resolution. The URL for the extra file is defined by replacing the `/did.jsonl` at the end of the [[ref: DID Log]] URL with `/did-witness.json`.

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

internationalized domain (`jp納豆.例.jp`) and path (`用户`)

`did:webvh:{SCID}:xn--jp-cd2fp15c.xn--fsq.jp:%E7%94%A8%E6%88%B7` -->

`https://xn--jp-cd2fp15c.xn--fsq.jp/%E7%94%A8%E6%88%B7/did.jsonl`

The [[ref: DID Controller]] derived the A-labels `xn--jp-cd2fp15c` and
`xn--fsq` from the U-labels `jp納豆` and `例` when creating the DID (see
[International Domain Names](#international-domain-names)). The non-ASCII
path segment `用户` is carried as percent-encoded UTF-8 with uppercase
hexadecimal digits.

:::

A client resolving a `did:webvh` DID **MAY** choose to use a [[ref: watcher]] as the source of data about a `did:webvh` DID, rather than resolving the DID's HTTPS location to retrieve the [[ref: DID Log]]. See the specification section on [Watchers](#did-watchers) for information about `did:webvh` and [[ref: watchers]].

The location of the `did:webvh` `did.jsonl` [[ref:DID Log]] file is the same as
where the comparable `did:web`'s `did.json` file is published. A [[ref: DID Controller]] **MAY** publish both DIDs and so, both files. The process
to do so is described in the [publishing a parallel `did:web`
DID](#publishing-a-parallel-didweb-did) section of this specification.

::: warning

While the transformation from a did:webvh identifier to an HTTPS resource relies on DNS resolution, clients should not assume that a `did:webvh` identifier is inherently bound to or controlled by the entity associated with the corresponding DNS domain. In fact, a `did:webvh` [[ref: DID Log]] may be obtained from sources other than its corresponding HTTPS location (perhaps indexed by its [[ref: SCID]]), and in such cases, the same verification steps may be applied to determine its validity.

Verification of a did:webvh identifier using this specification ensures cryptographic validity, but that does not imbue "trust" in the identifier itself. Trust in a did:webvh DID should be derived from external sources, such as verifiable credentials issued by trusted parties (possibly discovered by dereferencing a [`/whois`](#common-did-url-path-services) DID URL published by the [[ref: DID Controller]]) or via Trust Registries that maintain authoritative records of trusted DIDs in a given context. Implementers should exercise caution and avoid conflating technical verification with trustworthiness, ensuring that reliance on a `did:webvh` identifier is informed by independent verification mechanisms.

:::

### The DID Log File

The [[ref: DID log]] file contains a list of [[ref: entries]], one for each version of the DID. A
version of the DID is an update to the contents of the resolved [[ref: DIDDoc]] for the
DID, and/or a change to the [[ref: parameters]] that control the generation and
verification of the DID.

Each entry is a JSON object consisting of the following properties.

`{ "versionId": "", "versionTime": "", "parameters": {}, "state": {}, "proof" : [] }`

1. The [[spec: json-schema-core]] definition of the [[ref: DID log entry]] data structure can be found in the [log_entry.json](https://raw.githubusercontent.com/decentralized-identity/didwebvh/refs/heads/main/schemas/v2.0/log_entry.json) file in this repository. [[ref: Log entries]] processed under v1.0 of this specification (see [Upgrading a DID](#upgrading-a-did)) are defined by the [v1.0 log_entry.json](https://raw.githubusercontent.com/decentralized-identity/didwebvh/refs/heads/main/schemas/v1.0/log_entry.json) file.
2. The value of `versionId` **MUST** be a string consisting of the DID version number
   (starting at `1` and incrementing by one per DID version), a literal dash
   `-`, and the `entryHash`, a hash calculated across the [[ref: log entry]]
   content. The input to the hash is chosen so as to link each entry to its
   predecessor in a ledger-like chain. The input to the hash is specified in the
   [Entry Hash Generation and
   Verification](#entry-hash-generation-and-verification) section of this
   specification.
3. The value of `versionTime` **MUST** be a timestamp in UTC of the entry in [[ref: ISO8601]] format, as asserted by the [[ref: DID Controller]]. The timestamp
   **MUST** be the time the DID will be retrieved by a [[ref: witness]] or resolver,
   or before.
4. The JSON object `parameters` contains the configurations/options set by the
   [[ref: DID Controller]] to be used in the processing of current and future
   [[ref: log entries]]. Permitted `parameters` are defined in the [`did:webvh`
   DID Method Parameters](#didwebvh-did-method-parameters) section of this
   specification.
5. The JSON object `state` contains the [[ref: DIDDoc]] for this version of the
   DID.
6. The JSON array `proof` contains a [[ref: Data Integrity]] proof created for
   the entry and signed by a key authorized to update the [[ref: DIDDoc]].

After creation, each entry has (per the [[ref: JSON Lines]] specification) all
extra whitespace removed, a `\n` character appended, and the result added to
the [[ref: DID Log]] file for publication.

A more comprehensive description of how to create and update a [[ref: DID log entry]] is given in steps 4 - 6 of the [create DID](#create-register) section.

Examples of [[ref: DID Logs]] and [[ref: DID log entries]] can be found in the
[Examples] section on the `did:webvh` information website.

[Examples]: https://didwebvh.info/latest/example/

::: example

**Examples of log entries that fail verification.** Illustrative and
non-exhaustive; the normative rejection criteria are defined in the DID
verification algorithm in this specification.

1. **Duplicate witness IDs.** `{"threshold": 1, "witnesses": [{"id":
   "did:key:X"}, {"id": "did:key:X"}]}` — the same `did:key` appears more than
   once in the witnesses list; each witness has to be unique.

2. **Signing key not committed.** Entry N-1 sets `prerotationHashes: ["H1","H2"]`, and entry N is signed by key K3, whose hash is not `H1` or `H2`. Entry N fails verification, even if K3 signed, or was committed in, an earlier entry.

3. **Wrong cryptosuite on log-entry proof.** `{"type":"DataIntegrityProof","cryptosuite":"ecdsa-jcs-2019","proofPurpose":"assertionMethod"}` — rejected even if the signature is structurally valid, because the active `method` [[ref: parameter]] (`did:webvh:2.0`) requires `eddsa-jcs-2022`.

4. **`state.id` SCID in an entry does not match [[ref: SCID]] in DID and in `parameters.scid`.** DID `did:webvh:Qm111...` [[ref: DID Log]] first entry has `parameters.scid: "Qm111..."` but in any entry has `state.id: "did:webvh:Qm222...:example.com"` — the [[ref: SCID]] values are inconsistent.

5. **SCID changes under portability.** Entry N has `state.id: "did:webvh:Qm222...:new.example.com"` while entry N-1 carried `Qm111...` — the [[ref: SCID]] is immutable across all entries.

6. **Unknown `method` value.** First entry has `parameters.method: "did:webvh:99.0"`, `"did:webvh:2.0-rc1"`, or `"didwebvh:2.0"` — unrecognised values are rejected and never silently downgraded.

7. **`method` downgrade.** Entry N-1 has an active `method` of `did:webvh:2.0` and entry N sets `parameters.method: "did:webvh:1.0"` — a change to a lower version is never permitted. See [Upgrading a DID](#upgrading-a-did).

8. **Entry after `prerotationHashes: []`.** Entry N sets `prerotationHashes: []`. Entry N+1 fails verification whatever key signs it: no key is committed for it.

9. **Reused key.** Entry 2 is signed by key K1. Entries 2 and 3 both list K1's hash in `prerotationHashes` (as a recovery key, for example), and entry 4 is signed by K1. Entry 4 fails verification: K1 already signed entry 2. Listing K1's hash again is valid; signing with it again is not.

10. **`prerotationHashes` omitted, or `updateKeys` after the first entry.** An entry without a `prerotationHashes` property, or a later entry that includes `updateKeys`, fails verification.

11. **Upgrading entry lists `updateKeys`.** A v1.0 entry N-1 sets `nextKeyHashes: ["H1"]`, and entry N upgrades to `did:webvh:2.0` with `updateKeys: ["K1"]`, where K1 hashes to `H1`. Entry N fails verification: under v2.0, `updateKeys` appears only in the first entry, and entry N is instead signed by K1 without listing it. See [Upgrading from v1.0 to v2.0](#upgrading-from-v10-to-v20).

12. **Upgrading entry signed by a revealed key.** Pre-rotation is active under v1.0, and the upgrading entry is signed by a key whose hash is in the previous entry's `nextKeyHashes` but that appeared in the `updateKeys` of an earlier v1.0 entry. The upgrading entry fails verification: that key is a [[ref: used key]].

:::

### DID Method Operations

#### Create (Register)

Creating a `did:webvh` DID is done by carrying out the following steps.

1. **Define the DID string**
   The start of the DID **MUST** be the literal string "`did:webvh:{SCID}:`", where the `{SCID}` is
   a placeholder that will be replaced by the calculated [[ref: SCID]] later in the process (see step
   5). This first part of the DID string is followed by a fully qualified domain name
   (with an optional path) that is secured by a TLS/SSL certificate and
   reflects the web location at which the [[ref: DID Log]] (`did.jsonl`) will be published

   The DID **MUST** be a valid `did:webvh` DID as per the ABNF of a `did:webvh` DID defined
   in the [Method-Specific Identifier](#method-specific-identifier) section of this specification.

   If the domain name contains non-ASCII characters, the [[ref: DID Controller]]
   **MUST** express it using A-labels before constructing the DID string, as
   specified in [International Domain Names](#international-domain-names). The
   DID string chosen at this step is bound into the [[ref: SCID]] and cannot
   later be re-encoded.

   1. Note: the [[ref: SCID]] for a `did:webvh` DID is not by default in the HTTPS
      URL for the DID. A [[ref: DID Controller]] **MAY** include the [[ref: SCID]] in the HTTPS URL by inserting additional placeholder `{SCID}`
      strings into the domain name or path components of the method-specific
      identifier when creating the DID. Additional instance(s) of the [[ref: SCID]] in the domain and/or path parts of the DID does not alter the
      [DID-to-HTTPS transformation](#the-did-to-https-transformation).

2. **Generate the authorization key pair(s)**
   [Authorized keys](#authorized-keys) are authorized to control (create, update, deactivate) the DID.
   At the same time, generate any other key pairs that will be placed into the initial
   [[ref: DIDDoc]] for the DID.

   1. For each key pair that will sign the first [[ref: log entry]], generate a
      [[ref: multikey]] based on the key pair's public key. The
      [[ref: multikey]] representations of the public keys are placed in the
      `updateKeys` property in [[ref: parameters]].
   2. Generate the key pair(s) that can sign the next [[ref: log entry]], and
      calculate their [[ref: pre-rotation]] hashes for the `prerotationHashes`
      property in [[ref: parameters]], as defined in [Pre-Rotation Key Hash
      Generation and
      Verification](#pre-rotation-key-hash-generation-and-verification).
   3. The public key(s) of the authorization key pair(s) **SHOULD NOT** be used
      in the [[ref: DIDDoc]] as well. A key is best used for a single purpose:
      a key that authorizes updates can sign only one [[ref: log entry]], and
      publishing it in the [[ref: DIDDoc]] exposes it to the
      [post-quantum attacks](#post-quantum-attacks) that
      [[ref: pre-rotation]] otherwise mitigates.

3. **Create the initial [[ref: DIDDoc]] for the DID**
   The [[ref: DIDDoc]] **MUST** contain the top level `id` property which **MUST** be the DID string from
   step 1, including the placement of the `{SCID}` placeholder for the [[ref: SCID]]. Other
   [[ref: DIDDoc]] verifications **SHOULD** be performed.

   All other absolute references to the DID in the [[ref: DIDDoc]] must use the form defined
   in step 1, with the identified placeholder for the [[ref: SCID]] (e.g., `did:webvh:{SCID}:example.com#key-1`,
   `did:webvh:{SCID}:example.com:dids:issuer#key-1`, etc.).

   The [[ref: DIDDoc]] can contain any other content as deemed necessary by the [[ref: DID Controller]].

   1. Note: The placeholder (the string `{SCID}`) **MUST** be in every place in the [[ref: DIDDoc]] where
   the [[ref: SCID]] is to be placed.

4. **Generate a preliminary DID Log Entry** JSON object containing the same JSON
   properties that will be in the published [[ref: DID log entry]], but with some
   values preset, pending calculation of the [[ref: SCID]] and [[ref: entryHash]] and
   without the `proof`.

   1. The value of `versionId` string **MUST** be the placeholder literal `"{SCID}"`.
   2. The value of `versionTime` string **MUST** be a valid UTC [[ref: ISO8601]] date/time string,
   and the represented time **MUST** be before or equal to the current time.
   3. The value of the `parameters` property **MUST** be a JSON object defined at the
      discretion of the [[ref: DID Controller]]. The properties in this nested JSON object
      **MUST** be as permitted in the [DID Generation and Verification
      Parameters](#didwebvh-did-method-parameters) section of this specification,
      and all required values in the first version of the DID **MUST** be
      present. The `method` [[ref: parameter]] **MUST** be set to the value
      for the version of this specification used to create the DID. New DIDs
      **SHOULD** be created using v2.0 (`did:webvh:2.0`). A
      [[ref: DID Controller]] **MAY** create a v1.0 DID, for example when the
      resolvers used by relying parties do not yet support v2.0, and upgrade
      it later as described in [Upgrading a DID](#upgrading-a-did). In addition, where the [[ref: SCID]] of the DID is referenced in
      the parameters, the placeholder literal string `{SCID}` **MUST** be used
      in place of the to-be-calculated [[ref: SCID]].
   4. The value of the `state` property **MUST** be the initial [[ref: DIDDoc]] as
      defined in the previous step 3 of this process.

5. **Update the preliminary DID Log Entry to the initial DID Log Entry**
   Use the preliminary [[ref: DID log entry]] to perform the consecutive steps:

   1. **Calculate the [[ref: SCID]]**
   The preliminary JSON object **MUST** be used to calculate the [[ref: SCID]] for the DID as defined in
   the [SCID Generation and Verification](#scid-generation-and-verification) section of this
   specification.
   2. **Replace the placeholder `{SCID}`** Treating the preliminary JSON object
   entry as a string, perform a literal text replacement of every occurrence of
   the placeholder `{SCID}` with the calculated [[ref: SCID]] from the previous
   step.
      - NOTE: As a consequence, the literal string `{SCID}` cannot appear as a
        value anywhere in the first published [[ref: DID Log]] entry — it will
        always be replaced. If that string is required in the [[ref: DIDDoc]], it
        can be introduced via an update in a subsequent [[ref: log entry]].
   3. **Calculate the [[ref: Entry Hash]]**
   The preliminary JSON object updated in the previous step **MUST** be used to calculate the [[ref: Entry Hash]]
   (`entryHash`) for the [[ref: log entry]], as defined in the
   [Entry Hash Generation and Verification](#entry-hash-generation-and-verification) section of
   this specification.
   4. **Replace the preliminary `versionId` value** The value of the `versionId`
   property **MUST** be updated with the literal string `1` (for version number 1),
   a literal `-`, followed by the `entryHash` value calculated in the previous
   step.
   5. **Generate the [[ref: Data Integrity]] proof** A [[ref: Data Integrity]]
   proof on the preliminary JSON object as updated in the previous step **MUST**
   be generated using an authorized key in the required `updateKeys` property in the
   [[ref: parameters]] object and the `proofPurpose` set to `assertionMethod`.

   6. **Add the [[ref: Data Integrity]] proof** The [[ref: Data Integrity]] proof
   is added to the preliminary JSON object. The resultant JSON object is the
   initial [[ref: DID log entry]] for the DID.

6. **Generate the first [[ref: JSON Line]]**
   The [[ref: DID log entry]] **MUST** be updated to be a [[ref: JSON Lines]]
   entry by removing extraneous white space and appending a carriage return,
   and the result stored as the contents of the file `did.jsonl`.

   If the [[ref: DID Controller]] has opted to use [[ref: witnesses]] for the
   DID, the required proofs from the DID's [[ref: witnesses]] **MUST** be
   collected and published in the `did-witness.json` file before the [[ref: DID Log]] with the new version is published. See the [DID
   Witnesses](#did-witnesses) section of this specification.

7. **Publish the [[ref: DID Log]]**
   The complete [[ref: DID Log]] file **MUST** be published at the appropriate
   Web location defined by the `did:webvh` DID identifier (see step 1)

     - This is a logical operation -- how a deployment serves the `did.jsonl`
       content is not constrained.
     - Use the [DID-to-HTTPS Transformation](#the-did-to-https-transformation)
       steps to transform the DID into the Web location of the [[ref: DID Log]]
       file.

   If there are [[ref: watchers]] configured for the DID, a webhook is triggered
   to notify the [[ref: watchers]] that a new DID is available and should be
   retrieved. See the [Watchers](#did-watchers) section of this specification for
   more details.

A controller **MAY** generate an equivalent `did:web` [[ref: DIDDoc]] and publish it as
defined in the
[Publishing a Parallel `did:web` DID](#publishing-a-parallel-didweb-did) section
of this specification. The `did:web` [[ref: DIDDoc]] could be used for backwards
compatibility as a transition is made from `did:web` to `did:webvh`. Verifiers
using the `did:web` lose the verifiable properties and history of the `did:webvh`
for the convenience of the simple retrieval of the `did:web` [[ref: DIDDoc]].

#### Read (Resolve)

The following steps MUST be executed to resolve the [[ref: DIDDoc]] for a `did:webvh` DID:

1. The [DID-to-HTTPS Transformation](#the-did-to-https-transformation) steps
   **MUST** be used to transform the DID into an HTTPS URL for the [[ref: DID Log]] file.
2. Perform an HTTPS `GET` request to the URL using an agent that can successfully
   negotiate a secure HTTPS connection, which enforces the security requirements
   as described in
   [Security considerations](#security-considerations).
3. When performing the DNS resolution during the HTTPS GET request, the client
   SHOULD utilize [[spec:rfc8484]] in order to prevent tracking of the identity
   being resolved.
4. The [[ref: DID Log]] file **MUST** be processed as described below, producing
   the [[ref: DIDDoc]] identified in the resolution request.
5. The resolver **MUST NOT** add any services to the resolved [[ref: DIDDoc]]
   that are not present in the `state` of the [[ref: log entry]]. This is a
   change from v1.0, under which resolvers add implicit `#files` and `#whois`
   services. A [[ref: log entry]] whose active `method` is that of v1.0 is
   processed under the v1.0 rules, as described in [Upgrading from v1.0 to
   v2.0](#upgrading-from-v10-to-v20).

To process the retrieved [[ref: DID Log]] file, the resolver **MUST** carry out the following steps on each of the [[ref: log entries]] in the order they appear in the file, applying the [[ref: parameters]] from the current and previous entries. Every step **MUST** be performed for **every** entry; in particular, [[ref: Data Integrity]] proof verification (step 2) and `entryHash` verification (step 3) **MUST NOT** be skipped for intermediate entries on the grounds that the resolver only needs the latest [[ref: DIDDoc]].

::: note Basic Note

   NOTE: A resolver implementation that caches previously verified state could
   retrieve only subsequent entries and resume processing after the last verified
   entry rather than reprocessing the full log, provided the cached state was
   itself produced by full verification and the cache has not been modified
   since.

:::

As noted in the [DID Log File](#the-did-log-file) section, [[ref: log entries]] are each a JSON object with the following properties:

   1. `versionId`
   2. `versionTime`
   3. `parameters`
   4. `state` -- the version's [[ref: DIDDoc]].
   5. `proof` -- a [[ref: Data Integrity]] proof for the [[ref: log entry]].

Initialize a counter `didIdMatchCount` to `0` before processing any entries.

For each entry:

1. Update the currently active [[ref: parameters]] with the [[ref: parameters]]
   from the entry (if any). The `parameters` **MUST** adhere to the [`did:webvh`
   DID Method Parameters](#didwebvh-did-method-parameters) section of this
   specification. Continue processing using the now active set of [[ref: parameters]].
   - The entry **MUST** be processed according to the version of this
     specification identified by the now active `method` [[ref: parameter]],
     as described in [Upgrading a DID](#upgrading-a-did).
   - While all [[ref: parameters]] in the first [[ref: Log Entry]] take effect
     immediately, some kinds of [[ref: parameters]] defined in later [[ref: entries]] only take effect *after* that entry has been published. For
     example, updates to the `witnesses` array take effect only
     *after* the entry in which they are defined has been published.
2. The [[ref: Data Integrity]] proof in the entry **MUST** be valid and signed by
   an authorized key as defined in the [Authorized Keys](#authorized-keys)
   section of this specification, and with a `proofPurpose` set to `assertionMethod`.
   1. If no key is authorized for the entry — for example, after an entry
      that set `prerotationHashes` to `[]` — resolution **MUST** terminate.
   2. If the [[ref: DID Controller]] has opted to use [[ref: witnesses]]
      resolvers **MUST** retrieve and verify the DID's `did-witness.json` file. For
      details, see the [DID Witnesses](#did-witnesses) section of this
      specification.
3. Verify the `versionId` for the entry.
   1. The version number **MUST** be `1` for the first entry and **MUST** equal the previous entry's version number + 1 for each subsequent entry. Gaps (e.g., entry 3 after entry 1) **MUST** terminate resolution.
   2. Exactly one dash `-` **MUST** follow the version number; missing or multiple dashes **MUST** cause rejection.
   3. The `entryHash` **MUST** follow the dash, **MUST** be a valid [[ref: multihash]] in the algorithm permitted by the active `method`, and **MUST** be verified per [Entry Hash Generation and Verification](#entry-hash-generation-and-verification). Verification **MUST** be performed for every entry.
4. The `versionTime` **MUST** be a valid UTC [[ref: ISO8601]] string with explicit `Z` (or `+00:00`); values without a zone designator, or expressing a non-UTC zone, **MUST** be rejected.
   - The `versionTime` of **every** entry **MUST** be strictly greater than the immediately preceding entry's. Equal timestamps **MUST** be rejected.
   - The `versionTime` of every entry **MUST NOT** be more than a small,
     implementation-defined tolerance in the future relative to the resolver's
     current time. Resolvers **SHOULD** use a tolerance of no more than 5
     minutes. Entries that exceed this tolerance **MUST** cause resolution to
     fail.
5. When processing the first [[ref: DID log]] entry, verify the [[ref: SCID]]
   (defined in the [[ref: parameters]]) according to the
   [SCID Generation and Verification](#scid-generation-and-verification) section
   of this specification.
6. Get the value of the [[ref: log entry]] property `state`, which is the [[ref: DIDDoc]] for the version.
      1. Parse the top-level `id` of `state` as a `did:webvh` DID per the [Method-Specific Identifier](#method-specific-identifier) ABNF; if parsing fails, resolution **MUST** terminate.
      2. The SCID segment of `state.id` **MUST** be byte-for-byte identical to the `scid` value in the DID and the first entry's `parameters.scid`. This check **MUST** apply to **every** entry's `state.id`, not just the first. A mismatch **MUST** terminate resolution.
      3. If the DID being resolved matches exactly the value of `state.id` in the current [[ref: DIDDoc]] entry, increment `didIdMatchCount` by `1`.
7. Verify [[ref: key pre-rotation]]. The entry **MUST** include a `parameters.prerotationHashes` property, and only the first entry **MUST** include `parameters.updateKeys`; otherwise, resolution **MUST** terminate. For every entry after the first, the key that signed the entry's proof (step 2) **MUST** be authorized as defined in [Authorized Keys](#authorized-keys): its hash, computed per [Pre-Rotation Key Hash Generation and Verification](#pre-rotation-key-hash-generation-and-verification), **MUST** appear in the previous entry's `prerotationHashes`, and the key **MUST NOT** be a [[ref: used key]]. A key that does not meet both conditions **MUST** cause resolution to terminate. The keys authorized to sign an entry that upgrades a DID from v1.0 are defined in [Upgrading from v1.0 to v2.0](#upgrading-from-v10-to-v20).
8. As each [[ref: log entry]] is processed and verified, collect the following information
   about each version:
      1. The [[ref: DIDDoc]].
      2. The `versionId` of the [[ref: DIDDoc]].
      3. The UTC `versionTime` of the [[ref: DIDDoc]].
      4. The hashes of the keys authorized to sign the next
         [[ref: log entry]], from the entry's `prerotationHashes`.
      5. The [[ref: used keys]]: the keys in the first entry's `updateKeys`
         and the key that signed each later entry processed so far (and, for
         a DID upgraded from v1.0, the keys in the `updateKeys` of every v1.0
         entry).
      6. All other `did:webvh` processing configuration settings as defined in the
         `parameters` object.
      7. Add the value of top level `id`.
      8. The value of `DIDIdMatchCount`.
9. If the `parameters` for any of the versions define that some or all of
  the [[ref: DID Log entries]] must be witnessed, further verification of
  the [[ref: witness]] proofs must be carried out, as defined in the [DID
  Witnesses](#did-witnesses) section of this specification.

Once every [[ref: log entry]] has been processed as above, the resolver **MUST** determine and produce the [[ref: DIDDoc]] identified in the resolution request:

1. The value of `didIdMatchCount` **MUST** be greater than `0`; if it is `0`, the
   log **MUST** be rejected, as no entry's `state.id` matches the DID being resolved.
2. Flag failed verifications appropriately, either invalidating the entire DID or marking all entries from the first invalid entry to the end of the log as invalid.
3. Produce the requested [[ref: DIDDoc]] based on the verification results:
   1. If all verifications pass, resolve the DID, applying any resolution options as requested.
   2. A `did:webvh` resolver **MUST** resolve the [[spec:DID-Core]] `versionId` and
      `versionTime` resolution options, and **SHOULD** resolve the
      `did:webvh`-specific `versionNumber` resolution option, returning the
      corresponding [[ref: DIDDoc]] version with a successful status code — even
      if later entries in the log are invalid:
      - `versionId` — the option's value **MUST** match the full `versionId`
        from a [[ref: DID Log entry]]. If no entry has that `versionId`, a
        `notFound` error **MUST** be returned.
      - `versionTime` — a specified time in [[ref: ISO8601]] format **MUST**
        return the DIDDoc from the [[ref: DID Log entry]] that was active at
        that time, if any. If the DID was not active at the specified time, a
        `notFound` error **MUST** be returned.
      - `versionNumber` — an integer value **SHOULD** be resolved to the
        [[ref: DID Log entry]] whose `versionId` has a matching integer prior
        to the literal `-`, as defined in the [creating the
        DID](#create-register) section of this specification, if such an entry
        exists.
   3. If the DID or DID version being resolved is invalid, return an appropriate error code.

While resolver caching policies are an implementation matter and largely outside the scope of this specification, resolvers **SHOULD NOT** cache a DID that fails verification. This ensures that the DID’s [[ref: DID Controller]] has the opportunity to recover a DID that may have been erroneously or maliciously invalidated.

A resolver **MAY** use a DID [[ref: watcher]] in addition to, or in place of retrieving the DID information from the source, and use that information based on their knowledge of the governance of the [[ref: watcher]]. See the [Watchers](#did-watchers) section of this specification for more details.

As defined in the [[spec:DID-RESOLUTION]] specification, a did:webvh resolver should return the following DID Document Metadata when resolving a `did:webvh` DID Document:

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
  "witness": { ...
  },
  "watchers: [ ...
  ]
}
```

where the items in the Metadata JSON object are:

- `versionId` — The `versionId` from the [[ref: Log Entry]] of the resolved DIDDoc version.
- `versionTime` — The `versionTime` from the [[ref: Log Entry]] of the resolved DIDDoc version, in [[ref: ISO8601]] timestamp format.
- `created` — The [[ref: ISO8601]] timestamp of the DID's first [[ref: log entry]], indicating when (according to the [[ref: DID Controller]]) the DID was created.
- `updated` — The [[ref: ISO8601]] timestamp of the DID's last valid [[ref: log entry]].
- `scid` — The [[ref: SCID]] of the resolved DID.
- `portable` — A boolean value indicating whether the resolved DID has [[ref: portability]] active and so may be moved in the future, as defined in the [portability](#did-portability) section of this specification.
- `deactivated` — A boolean indicating whether the DID has been deactivated. When `true`, the DID is no longer active.
- `ttl` - A string containing the unsigned integer value of the DID's `ttl` [[ref: parameter]] (time-to-live) in seconds. The TTL is guidance from the [[ref: DID Controller]] for those resolving the DID about how long to cache the DID. The value is a string containing the integer value because the [[spec: DID-RESOLUTION]] specification requires that DID metadata not be integers. The value needs to be converted to an integer by the resolver client before use.
- `witness` — An object containing the current (active in the last valid [[ref: DID log entry]]) configuration of witnesses for the DID. The object is as defined as the same named object in the [witness list](#witness-lists) section of this specification.
  - The value of the `threshold` attribute of the `witness` object is a string containing the integer value of `threshold` because the [[spec: DID-RESOLUTION]] specification requires that DID metadata not include integers. The value needs to be converted to an integer by the resolver client before use.
- `watchers` — An array containing the current (active in the last valid [[ref: DID log entry]]) list of [[ref: watcher]] URLs that have agreed to monitor and cache the DID’s state.

The "last valid [[ref: log entry]]" for some of the items above references the case where a DID resolution request references a DIDDoc that was valid, but where the DID Log has later [[ref: log entries]] that fail verification, as noted in the DID resolution steps earlier in this section. If all [[ref: log entries]] pass verification, the last valid [[ref: log entry]] is the last [[ref: log entry]].

When a DID resolution error occurs, the `error` field **MUST** be included in the `didResolutionMetadata`, as defined by the [[spec:DID-RESOLUTION]] specification. In addition, resolvers **SHOULD** provide supplemental "Problem Details" metadata following [[spec:rfc9457]], using the following structure:

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

As described in [[spec:DID-EXTENSION-RESOLUTION]], the following values **MUST** be used in the `error` field of the resolution metadata when resolving a `did:webvh` DID under the corresponding error conditions:

- `notFound` — The [[ref: DID Log]] or the resource referenced by a DID URL was not found. If the [[ref: DID Log]] does not exist at the DID's designated HTTPS location (according to the [DID-to-HTTPS Transformation](#the-did-to-https-transformation)), the resolver **MAY** attempt to retrieve it from alternative sources, such as [[ref: Watchers]], for verification and resolution.
- `invalidDid` — Any error that renders the `did:webvh` DID invalid during resolution.

Resolvers **SHOULD** populate the `problemDetails` field to aid in diagnosing and understanding resolution failures. The [did:webvh information site](https://didwebvh.info) may serve as a non-normative reference for common `did:webvh` resolution error types and explanations.

#### Update (Rotate)

To update a DID, a new, verifiable [[ref: DID Log Entry]] must be generated,
witnessed (if necessary), appended to the existing [[ref: DID Log]] (`did.jsonl`),
and published to the web location defined by the DID. The process to generate a
verifiable [[ref: DID Log Entry]] follows a similar process to the
[Create](#create-register) process, as follows:

1. Make the desired changes to the [[ref: DIDDoc]]. The top-level `id` in the
   [[ref: DIDDoc]] **MUST** contain the value of the DID.
   1. If the DID is configured to support [[ref: portability]], the root `id`
      property in the [[ref: DIDDoc]] **MAY** be changed when the [[ref: DID Controller]] wants to (or
      is forced to) publish the DID at a different Internet location and wants
      to retain the [[ref: SCID]] and history of the DID. For details, see the
      [DID Portability](#did-portability) section of this specification.
2. Define the [[ref: parameters]] JSON object to include the properties that affect the evolution of the
   DID. The `parameters` **MUST** be from those listed in the [`did:webvh` DID
   Method Parameters](#didwebvh-did-method-parameters) section of this
   specification. Any [[ref: parameters]] defined in the JSON object override the
   previously active value, while any [[ref: parameters]] not included imply the
   existing values remain in effect. The `prerotationHashes` [[ref: parameter]]
   **MUST** be included, committing to the key(s) that can sign the next
   entry; if no other changes to the [[ref: parameters]] are needed, it is
   the only property.
   - While all [[ref: parameters]] in the first [[ref: Log Entry]] take effect
     immediately, some types of [[ref: parameters]] defined in later [[ref: entries]] only take
     effect after the entry has been published. For example, the keys
     committed in `prerotationHashes` and changes to the [[ref: witnesses]] for a DID take effect
     only *after* the entry in which they are defined has been published.
3. Generate a preliminary [[ref: DID log entry]] JSON object containing the following properties:
   1. The value of `versionId` **MUST** be the value of `versionId` from the *previous* [[ref: DID log entry]].
   2. The `versionTime` value **MUST** be a string that is an [[ref: ISO8601]]
      format UTC timestamp. The time **MUST** be greater than the time of the
      previous [[ref: log entry]], and **MUST** be the time the DID will be
      retrieved by a [[ref: witness]] or resolver, or before.
   3. The [[ref: parameters]] passed in as a JSON object.
   4. Set the `state` JSON object to be the new version of the [[ref: DIDDoc]].
4. Calculate the new `versionId` of the new [[ref: DID Log Entry]], including
   incrementing the version number integer and using the process described in
   the [Entry Hash Generation and Verification](#entry-hash-generation-and-verification)
   section of this specification.
5. Replace the value of the `versionId` property in the preliminary [[ref: DID Log Entry]] with the value produced in the previous step.
6. Generate a [[ref: Data Integrity]] proof on the [[ref: DID log entry]] using
   an authorized key, as defined in the [Authorized Keys](#authorized-keys)
   section of this specification, and the `proofPurpose` set to `assertionMethod`.
7. The key used in the previous step **MUST** be one whose hash is in the
   `prerotationHashes` [[ref: parameter]] of the previous [[ref: DID log]]
   entry, and **MUST NOT** be a [[ref: used key]]. Once used, the key
   cannot sign another entry, and its private key **SHOULD** be securely
   destroyed, as described in [Pre-Rotation Key Hash Generation and
   Verification](#pre-rotation-key-hash-generation-and-verification).
8. The proof JSON object **MUST** be added as the value of the `proof` property in the [[ref: log entry]].
9. The entry **MUST** be made a [[ref: JSON Line]] by removing extra whitespace, adding a `\n`
   to the entry.
10. If the [[ref: DID Controller]] opts to use [[ref: witnesses]] for the
   DID, the [[ref: DID Controller]] **MUST** collect the [[ref: threshold]] of proofs
   from the DID's [[ref: witnesses]], and update and publish the DID's
   `did-witness.json` file. The updated `did-witness.json` file **MUST** be published
   **BEFORE** the updated [[ref: DID Log]] file is published. See the [DID
   Witnesses](#did-witnesses) section of this specification.
11. The new [[ref: log entry]] **MUST** be appended to the existing contents of
    the [[ref: DID Log]] file `did.jsonl`.
12. The updated [[ref: DID Log]] file **MUST** be published at the appropriate
    location defined by the `did:webvh` identifier.
    - This is a logical operation -- how a deployment serves the `did.jsonl`
    content is not constrained.
    - If there are [[ref: watchers]] configured for the DID, webhooks are triggered
   to notify the [[ref: watchers]] that an update is available and should be
   retrieved. See the [Watchers](#did-watchers) section of this specification for
   more details.

To upgrade a DID to a later version of this specification, the
[[ref: DID Controller]] carries out this update process with the additional
requirements defined in [Upgrading a DID](#upgrading-a-did).

A controller **MAY** generate an equivalent, updated `did:web` [[ref: DIDDoc]] and
publish it as defined in the
[Publishing a Parallel `did:web` DID](#publishing-a-parallel-didweb-did)
section of this specification.

#### Deactivate (Revoke)

Deactivating a DID allows a [[ref: DID Controller]] to signal that the DID is no longer being maintained or updated. There is an explicit approach to deactivation that aligns with the [[spec: DID-CORE]] specification, and other approaches that a `did:webvh` [[ref: DID Controller]] can use if the [[spec: DID-CORE]] approach does not achieve their desired outcome. This section covers the various methods for signaling that a DID is retired.

To deactivate a `did:webvh` DID per the [[spec:DID-CORE]] specification, the [[ref: DID Controller]] **MUST** add to the [[ref: DID log entry]] [[ref: parameters]] the property name and value `"deactivated": true`. Once done, a resolver **MUST NOT** return the [[ref: DIDDoc]] and **MUST** include `"deactivated": true` in the DID Resolution Metadata. Because no entry can follow the deactivating entry, there is no need to also remove the authorized keys when deactivating.

A concern with using the [[spec: DID-CORE]] approach to deactivation is the resolver requirement that the [[ref: DIDDoc]] not be returned for a deactivated DID. A [[ref: DID Controller]] might want the final [[ref: DIDDoc]] to continue to be resolved, while also signaling that the DID is no longer being updated. In the future, a DID Resolution query parameter (`returnDeactivatedDidDocument=true`) has been proposed to be added to the [[spec: DID-RESOLUTION]] specification to allow a client to request the [[ref: DIDDoc]] of a deactivated DID. However, even if that parameter is adopted, it places the burden on the resolver client to decide whether and how to use it. An alternative that a `did:webvh` [[ref: DID Controller]] could use is to signal that a DID is no longer being updated by setting the `prerotationHashes` array to empty (`[]`), as discussed above, and not setting the `deactivated` [[ref: parameter]] to `true`. The result is that the final [[ref: DIDDoc]] continues to be returned by default, and no further entry can be signed: a resolver treats any entry after it as invalid, as defined in [Authorized Keys](#authorized-keys), just as it does any entry after a deactivating entry.

To resolve a prior version of a deactivated `did:webvh` DID, a client can use the appropriate DID Resolution query [[ref: parameters]] `versionId`, `versionTime`, or the did:webvh-specific `versionNumber` (as described in the Read (Resolve) section of this specification). When such a DID is resolved in this way, the DID Resolution Metadata **MUST** include the property name and value `"deactivated": true`.

A [[ref: DID Controller]] can “deactivate” a DID by removing the published [[ref: DID Log]] and associated files and resources. Once removed, attempts to retrieve the [[ref: DID Log]] will result in a `Not Found` error status when resolving the DID. [[ref: Watchers]] monitoring a removed DID **SHOULD** continue to cache the last known valid state of the DID indefinitely so that their clients can still resolve and reference it, even after the [[ref: DID Log]] has been deleted.

### DID Method Processes

The [DID Method Operations](#did-method-operations) reference several processes
that are executed during [[ref: DIDDoc]] generation and DID resolution verification. Each
of those processes is specified in the following sections.

#### `did:webvh` DID Method Parameters

All `did:webvh` [[ref: Log entries]] contain the JSON object `parameters`. This object defines the DID processing [[ref: parameters]] used by the [[ref: DID Controller]] when publishing the current and subsequent [[ref: DID log entries]]. DID Resolvers **MUST** use the same [[ref: parameters]] to process the [[ref: DID Log]] to resolve the DID. The `parameters` object **MUST** only include properties defined in the version of the `did:webvh` DID Method specification being used.

**General Rules for Parameters:**

- **Default Values**: When the `method` parameter (see below) sets the [[spec: semver]] version of this specification to be used for a DID, any parameter introduced by that version but not explicitly set in the same [[ref: log entry]] **MUST** assume the default value defined in this section. The `method` parameter is required in the first [[ref: log entry]] and may appear in later entries to upgrade the DID to a newer [[spec semver]] version of the `did:webvh` specification.

- **Allowed Values**: Each parameter is constrained by the data type, structure and allowed values specified in this section.  If a value does not conform, the parameter is invalid and resolvers **MUST** reject the [[ref: log entry]].

- **Deactivation**: Parameters that support deactivation (such as `witness` or `prerotationHashes`) are set to defined values, described below, to indicate they are no longer active.

- The JSON `null` value **MUST NOT** be used to indicate default or deactivated values, as it removes the typing information required for proper interpretation.

:::note
Some early `did:webvh` implementations used the JSON `null` value to indicate the deactivation of parameters such as `watchers`, `witness`, `updateKeys`, `nextKeyHashes`, and `ttl`. Although this usage is deprecated and not valid per the current specification, resolver implementations **SHOULD** gracefully accept `null` and immediately convert the value to their equivalent default value for the parameter when processing [[ref: DID Log entries]].
:::

::: example
An example of the `parameters` property in the first [[ref: DID Log]] entry:

```json
{
  "portable": true,
  "updateKeys": [
    "z82LkqR25TU88tztBEiFydNf4fUPn8oWBANckcmuqgonz9TAbK9a7WGQ5dm7jyqyRMpaRAe"
  ],
  "prerotationHashes": [
    "QmZreDcjvWEpyRFznQeExWNCsvMLk5i59AcRJJuQC8UodJ"
  ],
  "method": "did:webvh:2.0",
  "scid": "{SCID}"
}
```

:::

The following lists the [[ref: parameters]], their data types, and enumerated values.

- `method`: Specifies the `did:webvh` [[spec: semver]] specification version to be used for processing the DID's log. Each acceptable value in turn defines what cryptographic algorithms are permitted for the current and subsequent [[ref: DID log entries]]. An update to the specification version in the middle of a [[ref: DID Log]] could introduce new [[ref: parameters]].
  - **MUST** appear in the first [[ref: log entry]]. When creating a DID, the value **SHOULD** be `did:webvh:2.0` (see [Create (Register)](#create-register)).
  - Resolvers **MUST** reject any `method` value that is not **exactly** one of the acceptable values for the version(s) of this specification the resolver supports. Unknown values **MUST NOT** be silently downgraded, defaulted, or ignored — resolution **MUST** terminate.
  - If not present in later entries, the previous value continues to be active.
  - **MAY** appear in later entries to upgrade the spec version, as described in [Upgrading a DID](#upgrading-a-did). A change to a *lower* version than currently active is **NOT** permitted; a [[ref: DID Controller]] **MUST NOT** publish such an entry, and resolvers **MUST** reject it.
  - Acceptable values:
    - `did:webvh:2.0` -- v2.0 of this specification. Resolvers **MUST** support this value.
      - Permitted hash algorithms: `SHA-256` [[spec:rfc6234]] (multihash code `0x12`) **only**. Any other algorithm **MUST** cause resolution to terminate.
      - Permitted [[ref: Data Integrity]] cryptosuites for **both** log-entry proofs **and** witness proofs: exactly `eddsa-jcs-2022` [[spec:di-eddsa-v1.0]]. Resolvers **MUST** verify the proof's `cryptosuite` property; an absent, mismatched, or non-conformant `cryptosuite` **MUST** cause the entry to be rejected. Verifying only `proofPurpose` is **insufficient**.
        - [[ref: witness]] [[ref: did:key]] identifiers **MUST** use a key compliant with the `eddsa-jcs-2022` cryptosuite defined in [[spec:di-eddsa-v1.0]].
    - `did:webvh:1.0` -- [v1.0](../v1.0) of this specification. Resolvers **SHOULD** support this value so that did:webvh [[ref: DIDs]] created under v1.0, including those later upgraded to v2.0, remain resolvable. A [[ref: log entry]] whose active `method` is `did:webvh:1.0` **MUST** be processed as defined in [v1.0](../v1.0). The differences between v1.0 and v2.0 are listed in [Upgrading from v1.0 to v2.0](#upgrading-from-v10-to-v20).
    - Values for versions of this specification prior to v1.0 are not supported.
- `scid`: The [[ref: SCID]] value for the DID.
  - **MUST** appear in the first [[ref: log entry]].
  - **MUST NOT** appear in later [[ref: log entries]].
- `updateKeys`: A JSON array of [[ref: multikey]] formatted public keys associated with the private keys authorized to sign the first [[ref: log entry]]. See the [Authorized Keys](#authorized-keys) section of this specification for additional details.
  - This property **MUST** appear in the first [[ref: log entry]], and **MUST** contain at least one key.
  - This property **MUST NOT** appear in later [[ref: log entries]]. Later entries are authorized by `prerotationHashes`.
  - The keys in `updateKeys` are [[ref: used keys]]: none of them can sign a later entry.
- `prerotationHashes`: A JSON array of strings that are hashes of [[ref: multikey]] formatted public keys. The next [[ref: log entry]] **MUST** be signed by a key whose hash is in this array.
  - This property **MUST** appear in **every** [[ref: log entry]]. Its value is never inherited from an earlier entry.
  - The process for generating the hashes and additional details for using [[ref: pre-rotation]] are defined in the [Pre-Rotation Key Hash Generation and Verification](#pre-rotation-key-hash-generation-and-verification) section of this specification.
  - A [[ref: DID Controller]] **MAY** include hashes that are not used to sign the next entry, and **MAY** include a hash in the `prerotationHashes` of more than one entry — for example, the hash of a recovery key held in cold storage. Unused hashes are ignored. A key whose hash is listed again can still sign only one entry, as it is a [[ref: used key]] once it has signed.
  - The value **MAY** be an empty array (`[]`) to stop further updates without deactivating the DID. Any [[ref: log entry]] after one whose `prerotationHashes` is `[]` **MUST** be rejected, as defined in [Authorized Keys](#authorized-keys). See the [deactivate](#deactivate-revoke) section of this specification for more details.
  - This parameter replaces the v1.0 `nextKeyHashes` [[ref: parameter]], which **MUST NOT** appear in a [[ref: log entry]] processed under v2.0. See [Upgrading from v1.0 to v2.0](#upgrading-from-v10-to-v20).
- `witness`: A JSON object declaring the set of witnesses and threshold number of witness proofs required to update the DID. For details of this data and its usage in the DID update approval process, see the [DID Witnesses](#did-witnesses) section of this specification.
  - Defaults to `{}` if not set in the first [[ref: log entry]].
  - If not set in other [[ref: log entries]], its value is retained from the most recent prior value.
  - If the `witness` property is updated from `{}`, the change is immediately active, and the corresponding [[ref: log entry]] **MUST** be [[ref: witnessed]].
  - The `witness` [[ref: parameter]] **MAY** be set to `{}` to indicate that
    witnesses are not (or no longer) being used. If witnesses are active when the
    `witness` [[ref: parameter]] is set to `{}`, that [[ref: log entry]]
    **MUST** be [[ref: witnessed]].
- `watchers`: An optional entry whose value is a JSON array containing a list of URLs ([[spec:rfc9110]]) that have notified the DID Controller that they are willing to watch the DID. See the [Watchers](#did-watchers) section of this specification for more details.
  - Defaults to `[]` if not set in the first [[ref: log entry]].
  - If not set in other [[ref: log entries]], its value is retained from the most recent prior value.
  - **MAY** be set to an empty array `[]` to indicate that watchers are not (or no longer) being used.
- `portable`: Boolean (JSON `true` / `false`) indicating if the DID is portable, allowing a DID Controller to control if a DID can be moved, while retaining its [[ref: SCID]] and verifiable history. See the [DID Portability](#did-portability) section of this specification for more details.
  - Setting `portable: true` is permitted **only** in the first entry. A later entry that sets `portable: true` **MUST** be rejected by resolvers, regardless of historical state.
  - Defaults to `false` if omitted in the first entry. Resolvers **SHOULD** warn if `portable` is omitted from the first entry.
  - Retains value if omitted in later entries.
  - Setting `portable: false` in any later entry permanently disables portability; later entries **MUST NOT** set it back to `true`.
  - Even when `portable: true`, the SCID segment of `state.id` (and of `parameters.scid` in the first entry) **MUST NOT** change for the life of the DID. Only host/path portions may change.
- `deactivated`: A JSON boolean that indicates whether the DID has been deactivated. A deactivated DID is no longer subject to updates but remains resolvable. See the [deactivate (revoke)](#deactivate-revoke) section of this specification for more details.
  - Defaults to `false` if not set in the first [[ref: DID log entry]].
  - If set to `true`, the DID is considered deactivated and no further updates to the DID are permitted.
- `ttl`: An unsigned integer that indicates how long, in seconds, a resolver should cache the resolved `did:webvh` DID before refreshing. It provides guidance from the [[ref: DID Controller]] on cache duration, with a range of 0 to 2^31. The parameter is analogous to the `TTL` parameter used in DNS [[spec: rfc2181]]. Caching a `did:webvh` can be valuable in places where the business rules require resolving a number of DID URLs for the same DID. For example, a client might want to call the resolver to get the current [[ref: DIDDoc]], and then make repeated calls to get all of the previous versions of the [[ref: DIDDoc]]. By caching the [[ref: DIDDoc]] state, the resolver would not have to retrieve and process the [[ref: DID Log]] on each call.
  - Defaults to `3600` (1 hour) if not set in the first [[ref: DID log entry]].
  - If set to `0`, indicates that the DID should not be cached.

#### Cryptographic Agility

The `did:webvh` DID method is designed to support cryptographic agility—the ability to adapt to evolving cryptographic algorithms and suites over time without breaking compatibility or requiring global coordination.

Cryptographic agility in `did:webvh` is achieved through the following mechanisms:

- **Self-describing cryptographic formats:** All cryptographically generated data (e.g., hashes and signatures) use formats that encode the algorithm used. Hashes use the [[ref: Multihash]] format, and signatures use the [[ref: Data Integrity]] Proofs. These formats allow verifiers to determine the algorithm from the data itself, enabling flexible and extensible support.

- **Specification versioning via the `method` parameter:** Each [[ref: DID Log Entry]] may include a `method` parameter that specifies the version of the `did:webvh` specification being used for the current and subsequent [[ref: log entries]]. This parameter is required in the initial log entry and may be updated in later entries to adopt newer versions of the specification, as described in [Upgrading a DID](#upgrading-a-did). This allows long-lived DIDs to transition to updated algorithm sets over time.

- **Version-specific algorithm policies:** Each version of the `did:webvh` specification defines the permitted cryptographic algorithms and suites for that version. This constrains what algorithms [[ref: DID Controllers]] may use and limits the verification requirements placed on resolvers. For example, the v2.0 specification permits only one hash algorithm and one [[ref: Data Integrity]] cryptosuite, while future versions may change or expand this set.

- **Response to cryptographic vulnerabilities:** If flaws are identified in a cryptographic algorithm permitted by a given version of the specification, a new version of the `did:webvh` specification will be released that removes or replaces the compromised algorithms. DID Controllers may then rotate to the newer version by updating the `method` parameter in a new log entry.

This design allows `did:webvh` to remain interoperable and verifiable across cryptographic eras while minimizing the burden on resolvers and preserving backward compatibility where safe to do so.

#### SCID Generation and Verification

The [[ref: self-certifying identifier]] or `SCID` is a required [[ref: parameter]] in the
first [[ref: DID log entry]] and is the hash of the DID's inception event.

##### Generate SCID

To generate the [[ref: SCID]] for a `did:webvh` DID, the DID Controller
**MUST** execute the following function:

 `base58btc(multihash(JCS(preliminary log entry with placeholders), <hash algorithm>))`

Where:

1. The `preliminary log entry with placeholders` consists of the following
   pre-publication JSON object of what will become the first [[ref: log entry]]. The
   placeholder is the literal string "`{SCID}`".

   - The `versionId` entry, which **MUST** be `{SCID}`.
   - The `versionTime` entry, which **MUST** be a string that is the current time in
         UTC [[ref: ISO8601]] format, e.g., `"2024-04-05T07:32:58Z"`
   - The complete `parameters` for the initial [[ref: log entry]] as defined by the
     [[ref: DID Controller]], with the placeholder wherever the [[ref: SCID]] will
     eventually be placed.
   - The `state` JSON object with the value being the initial [[ref: DIDDoc]]
     with placeholders (the literal string "`{SCID}`") wherever the [[ref: SCID]] will eventually be placed in the [[ref: DIDDoc]].

2. `JCS` is an implementation of the [[ref: JSON Canonicalization Scheme]]
   [[spec:rfc8785]]. It outputs a canonicalized representation of its JSON
   input.
3. `multihash` is an implementation of the [[ref: multihash]] specification. Its
   output is a hash of the input using the associated `<hash algorithm>`,
   prefixed with a hash algorithm identifier and the hash size.
4. `<hash algorithm>` is the hash algorithm used by the [[ref: DID Controller]].
   The hash algorithm **MUST** be one listed in the
   [parameters](#didwebvh-did-method-parameters) defined by the version of the
   `did:webvh` specification being used by the [[ref: DID Controller]].
5. `base58btc` is an implementation of the [[ref: base58btc]] function.
   Its output is the base58 encoded string of its input.

##### Verify SCID

To verify the [[ref: SCID]] of a `did:webvh` DID being resolved, the resolver
**MUST** execute the following process:

1. Extract the first [[ref: DID log entry]] and use it for the rest of the steps
   in this process.
2. Extract the `scid` property value from the [[ref: parameters]] in the [[ref: DID log entry]].
3. Determine the hash algorithm used by the [[ref: DID Controller]] from the [[ref: multihash]] `scid` value.
   - The hash algorithm **MUST** be one listed in the
   [parameters](#didwebvh-did-method-parameters) defined by the version of the
   `did:webvh` specification being used by the [[ref: DID Controller]] based on the active
   `method` [[ref: parameters]] property.
4. Remove the [[ref: data integrity]] proof property from the [[ref: DID log entry]].
5. Replace the `versionId` property value with the literal `"{SCID}"`.
6. Treat the resulting [[ref: log entry]] as a string and do a text replacement of the `scid`
   value from Step 2 with the literal string `{SCID}`.
7. Use the result and the hash algorithm (from Step 3) as input to the function
   defined in the [Generate SCID](#generate-scid) section (above).
8. The output string **MUST** match the `scid` extracted
   in Step 2. If not, terminate the resolution process with an error.

#### Entry Hash Generation and Verification

The `entryHash` follows the version number and dash character `-` in the
`versionId` property in each DID log entry. Each `entryHash` is calculated
across its [[ref: log entry]], excluding the [[ref: Data Integrity]] proof. The
`versionId` used in the input to the hash is a predecessor value to the current
[[ref: log entry]], ensuring that the [[ref: entries]] are cryptographically "chained"
together in a microledger. For the first [[ref: log entry]], the predecessor
`versionId` is the SCID (itself a hash), while for all other entries it is the
`versionId` property from the previous log entry.

##### Generate Entry Hash

To generate the required hash for a `did:webvh` [[ref: log entry]], the [[ref: DID Controller]]
**MUST** execute the process `base58btc(multihash(JCS(entry), <hash algorithm>))` given a
preliminary [[ref: log entry]] as the string `entry`, where:

1. `JCS` is an implementation of the [[ref: JSON Canonicalization Scheme]]
   ([[spec:rfc8785]]). Its output is a canonicalized representation of its
   input.
2. `multihash` is an implementation of the [[ref: multihash]] specification. Its
   output is a hash of the input using the associated `<hash algorithm>`,
   prefixed with a hash algorithm identifier and the hash size.
3. `<hash algorithm>` is the hash algorithm used by the [[ref: DID Controller]].
   The hash algorithm **MUST** be one listed in the
   [parameters](#didwebvh-did-method-parameters) defined by the version of the
   `did:webvh` specification being used by the [[ref: DID Controller]].
4. `base58btc` is an implementation of the [[ref: base58btc]] function.
   Its output is the base58 encoded string of its input.

The following is an example of a preliminary [[ref: log entry]] that is processed to
produce an [[ref: entry hash]]. As this is a first entry in a [[ref: DID Log]], the input
`versionId` is the [[ref: SCID]] of the DID.

```json
{"versionId": "QmYxuX84PnJBfdS7da9hHhe5NRreXC9AjibTGTw98DsVBj", "versionTime": "2025-04-01T17:39:50Z", "parameters": {"witness": {"threshold": 2, "witnesses": [{"id": "did:key:z6Mkkc51mg2vpQzKWAbWQZupeGYhowaBjYkmvcKMTqteqHB4"}, {"id": "did:key:z6MkuDdJdKLCgwZuQuEi9xG6LVgJJ9Tebr74CXPYPSumqgJs"}, {"id": "did:key:z6MkoSWmQyp4fTk4ZQy4KUsss9dFX51XfEUzKKKj1J1JUsrF"}]}, "updateKeys": ["z6MkgzBDcBFV3sk4ypPE5YXMZHmS213A3HpYY2LmcVKV15jr"], "prerotationHashes": ["QmZreDcjvWEpyRFznQeExWNCsvMLk5i59AcRJJuQC8UodJ"], "method": "did:webvh:2.0", "scid": "QmYxuX84PnJBfdS7da9hHhe5NRreXC9AjibTGTw98DsVBj"}, "state": {"@context": ["https://www.w3.org/ns/did/v1"], "id": "did:webvh:QmYxuX84PnJBfdS7da9hHhe5NRreXC9AjibTGTw98DsVBj:domain.example"}}
```

Resulting [[ref: entryHash]]: `QmeBMQkuiRVy8f4msw2HtmmzBdpjB4oVeGmVqJUKceSwCE`

##### Verify The Entry Hash

To verify the `entryHash` for a given `did:webvh` [[ref: DID log entry]], a DID
Resolver **MUST** execute the following process:

1. Extract the `versionId` in the [[ref: DID log entry]], and
   remove from it the version number and dash prefix, leaving the log entry
   `entryHash` value.
2. Determine the hash algorithm used by the [[ref: DID Controller]] from the [[ref: multihash]] `entryHash` value.
   - The hash algorithm **MUST** be one listed in the
   [parameters](#didwebvh-did-method-parameters) defined by the version of the
   `did:webvh` specification being used by the [[ref: DID Controller]] based on the
   `method` [[ref: parameters]] property set in the current or most recent prior [[ref: log entry]].
3. Remove the [[ref: Data Integrity]] `proof` from the [[ref: log entry]].
4. Set the `versionId` in the entry object to be the `versionId` from the
   previous [[ref: log entry]]. If this is the first entry in the log, set the value to
   `<scid>`, the value of the [[ref: SCID]] of the DID.
5. Calculate the hash string as `base58btc(multihash(JCS(entry), <hash algorithm>))`, where:
   1. `entry` is the data from the previous step.
   2. `JCS` is an implementation of the [[ref: JSON Canonicalization Scheme]]
      ([[spec:rfc8785]]). Its output is a canonicalized representation of its
      input.
   3. `multihash` is an implementation of the [[ref: multihash]] specification.
      Its output is a hash of the input using the associated `<hash algorithm>`,
      prefixed with a hash algorithm identifier and the hash size.
   4. `<hash algorithm>` is the hash algorithm from Step 2.
   5. `base58btc` is an implementation of the [[ref: base58btc]] function.
      Its output is the base58 encoded string of its input.
6. Verify that the calculated value matches the extracted `entryHash` value from
   Step 1. If not, terminate the resolution process with an error.

#### Authorized Keys

Each entry in the [[ref: DID Log]] **MUST** include a [[ref: Data Integrity]] `proof` where, at minimum:

1. `type` is `DataIntegrityProof`,
2. `cryptosuite` **MUST** be one listed in the
   [parameters](#didwebvh-did-method-parameters) defined by the version of the
   `did:webvh` specification being used by the [[ref: DID Controller]] based on the active
   `method` [[ref: parameters]] property.
3. `proofPurpose` is `assertionMethod`,
4. `verificationMethod` resolves to a [[ref: multikey]] that is an **authorized key** for the entry, as defined below.

Resolvers **MUST** reject an entry whose proof fails *any* check. A structurally-valid signature over a *different* cryptosuite than allowed by the active `method` parameter **MUST NOT** be accepted.

`did:webvh` requires [[ref: key pre-rotation]]. Each entry commits, in its
`prerotationHashes` [[ref: parameter]], to the keys that can sign the next
entry, without revealing them. The authorized keys for an entry are:

- **First entry:** the [[ref: multikeys]] in the entry's own `updateKeys`
  [[ref: parameter]].
- **Every later entry:** each [[ref: multikey]] whose hash, calculated as
  defined in [Pre-Rotation Key Hash Generation and
  Verification](#pre-rotation-key-hash-generation-and-verification), is in
  the `prerotationHashes` of the **previous** entry, and that is not a
  [[ref: used key]].
- **An entry that upgrades a DID from v1.0:** as defined in [Upgrading from
  v1.0 to v2.0](#upgrading-from-v10-to-v20).

The [[ref: used keys]] for an entry are the keys in the first entry's
`updateKeys` and the key that signed the proof of each later entry before it.
For a DID upgraded from v1.0, they also include the keys in the `updateKeys`
of every v1.0 entry. A key **MUST** sign the proof of at most one entry: a
resolver **MUST** keep the used keys (or their hashes) while processing the
log, and an entry signed by a used key **MUST** be rejected, even if its hash
is in the previous entry's `prerotationHashes`. A hash **MAY** appear in the
`prerotationHashes` of several entries, such as the hash of a recovery key
held in cold storage; this rule only means that once the key signs an entry,
it cannot sign another.

A resolver of the DID **MUST** verify the signature, and the key used for
signing each [[ref: DID Log]] entry **MUST** be an authorized key for that
entry. If not, terminate the resolution process with an error. If an entry
has no authorized keys — because the previous entry set `prerotationHashes`
to `[]` — every signature fails this check, so no entry can follow it.

The `did:webvh` Implementation Guide contains further discussion on the management
of keys authorized to update the DID.

::: note
**Why the first entry lists its keys.** The proof of an entry is not part of
the input to the [[ref: SCID]] or the [[ref: entry hash]], so on its own it
does not bind who signed the first entry. Listing the first entry's signing
keys in `updateKeys` makes them part of the [[ref: SCID]] input, so the first
entry's proof can be verified against keys fixed by the DID itself, and a
party that knows the first entry cannot re-sign it with a key of its own.
Later entries need no such list: the key that signs each one is fixed by the
hashes committed in the entry before it, which are covered by the chain of
[[ref: entry hashes]].
:::

#### DID Portability

As noted in the [Update (rotate)](#update-rotate) section of the specification,
a `did:webvh` DID can be renamed by changing the `id` DID string in the
DIDDoc to one that resolves to a different HTTPS URL if the following conditions are met.

- The [[ref: DID Log]] of the renamed DID **MUST** contain all of the [[ref: log entries]]
  from the creation of the DID.
- The [[ref: log entry]] in which the DID is renamed **MUST** be a valid DID entry
  building on the prior [[ref: DID log entries]], per this specification.
- The [[ref: parameter]] `portable` **MUST** be set to `true` in the **first** [[ref: log entry]]. An entry that introduces `portable: true` after the first entry **MUST** be rejected.
- The [[ref: SCID]] **MUST** be the same in the original and renamed DID. Specifically, the SCID segment of `state.id` in **every** [[ref: log entry]] (including the renamed entry and all subsequent entries) **MUST** equal the `parameters.scid` from the first entry. Only the host/path portion of `state.id` may change under portability; the SCID segment is immutable for the life of the DID. A "portable rename" entry whose `state.id` carries a different SCID **MUST** be rejected.
- The [[ref: DIDDoc]] **MUST** contain the prior DID string as an `alsoKnownAs` entry.
- [[ref: DID Controllers]] **SHOULD** account for any DNS requirements in making domain changes that impact a `did:webvh` DID being moved, such as those outlined in [[spec:rfc1034]] (“Domain Names - Concepts and Facilities”), and [[spec:rfc1035]] (“Domain Names Implementation and Specification”).

**Security Note — Misleading Prior Domain Association**

When using portability, a `did:webvh` identifier may include a domain component that was never actually used to host its DID Log before being "moved" to a domain under the [[ref: DID Controller]]’s control. This creates a potential for misleading claims of association with the original domain. Resolvers and clients of resolvers **MUST** ignore any prior domain components when evaluating the history or trustworthiness of a `did:webvh` DID; only the current hosting location and its associated verifiable history are relevant. In addition, if the [[ref: DID Controller]] publishes a [`/whois`](#common-did-url-path-services) DID URL service, it can be used to obtain attestations about the DID and [[ref: DID Controller]] from relevant authorities.

#### Pre-Rotation Key Hash Generation and Verification

Pre-rotation requires a [[ref: DID Controller]] to commit to the authorization
keys that will be used ("rotated to") in the next [[ref: log entry]] for updating the [[ref: DIDDoc]]. The purpose
of committing to future keys is that if the currently authorized keys are
compromised by an attacker, the attacker cannot take control of
the DID by using the compromised keys to rotate to new keys the attacker
controls. Assuming the attacker has not also compromised the committed key
pairs, they cannot sign the next entry. See the
non-normative section about [Using Pre-Rotation Keys](https://didwebvh.info/latest/implementers-guide/prerotation-keys/)
in the `did:webvh` Implementer's Guide for additional guidance.

To create a hash to be included in the `prerotationHashes` array, the [[ref: DID Controller]] **MUST** execute the following process for each possible future
authorization key.

1. Generate a new key pair. The key type **MUST** be one that can be used as a
   `did:webvh` authorization key.
2. Generate a [[ref: multikey]] representation of the public key of the new key
   pair.
3. Calculate the hash string as `base58btc(multihash(multikey, <hash algorithm>))`, where:
   1. `multikey` is the [[ref: multikey]] representation of the public key from Step 2.
   2. `multihash` is an implementation of the [[ref: multihash]] specification.
      Its output is a hash of the input using the associated `<hash algorithm>`,
      prefixed with a hash algorithm identifier and the hash size.
   3. `<hash algorithm>` is the hash algorithm used by the [[ref: DID Controller]].
      The hash algorithm **MUST** be one listed in the
      [parameters](#didwebvh-did-method-parameters) defined by the version of the
      `did:webvh` specification being used by the [[ref: DID Controller]].
   4. `base58btc` is an implementation of the [[ref: base58btc]] function.
      Its output is the plain base58btc encoding of its input, without a
      [[ref: multibase]] prefix.
4. Insert the calculated hash into the `prerotationHashes` array being built up within
   the [[ref: parameters]] property.
5. The generated key pair **SHOULD** be safely stored so that it can be used
   to sign a later [[ref: log entry]].

A [[ref: DID Controller]] **MAY** include extra entries (for keys or just random
strings) in a `prerotationHashes` array.

After a pre-rotation key has signed an entry, it is **spent**: it **MUST
NOT** sign another entry, which resolvers enforce (see [Authorized
Keys](#authorized-keys)). Its private key **SHOULD** be **securely
destroyed**, so that it cannot be misused if the key store is later
compromised.

When processing a [[ref: DID log entry]] other than the first, a `did:webvh`
resolver **MUST**:

1. Calculate the hash of the [[ref: multikey]] that signed the entry's proof,
   as defined in step 3 above.
2. The hash algorithm **MUST** be one listed in the
   [parameters](#didwebvh-did-method-parameters) defined by the version of the
   `did:webvh` specification being used by the [[ref: DID Controller]].
3. The resultant hash **MUST** be in the `prerotationHashes` array from the
   previous [[ref: log entry]] (or, for an entry that upgrades a DID from
   v1.0, as defined in [Upgrading from v1.0 to
   v2.0](#upgrading-from-v10-to-v20)). If not, terminate the resolution
   process with an error.
4. The [[ref: multikey]] **MUST NOT** be a [[ref: used key]]. If it is,
   terminate the resolution process with an error.
5. A `prerotationHashes` array **MUST** be in the `parameters` of the
   [[ref: log entry]] currently being processed. If not, terminate the
   resolution process with an error.

#### DID Witnesses

The [[ref: witness]] process for a `did:webvh` DID provides a way for
collaborators to work with the [[ref: DID Controller]] to "witness" the
publication of new versions of the DID. This specification defines the technical
mechanism for using [[ref: witnesses]]. Governance and policy questions about
when and how to use the technical mechanism are outside the scope of this
specification.

Witnesses can prevent a [[ref: DID Controller]] from updating/removing
versions of a DID without detection by the witnesses. [[ref: Witnesses]] are
also a further mitigation against malicious actors compromising both a [[ref: DID Controller]]'s authorization key(s) to update the DID, and the [[ref: DID Controller]]'s web site where the [[ref: DID log]] is published. With both
compromises, a malicious actor might be able to take control over the DID by rewriting the
[[ref: DID Log]] using the keys they have compromised. By adding [[ref: witnesses]] to monitor and approve each version update, a malicious actor cannot
rewrite the previous history without having compromised a sufficient number of
[[ref: witnesses]], the [[ref: DID Controller]]'s key(s), and the Web Server on
which the [[ref: DID Log]] is published.

##### Witness Lists

The list of DIDs that witness DID updates is defined in the `witness`
parameter, as described in the [Parameters](#didwebvh-did-method-parameters)
section of this specification. After the first `witness` parameter has been set
to other than `{}` (empty object) in a [[ref: DID log entry]], and while there
are active witnesses, a [[ref: threshold]] of the active witnesses must provide
valid proofs associated with each [[ref: DID log entry]] before the [[ref: DID log entry]] can be published. If a [[ref: DID log entry]] contains a new
(replacement) list of witnesses (by including a new `witness` [[ref: parameter]]) that new list becomes active **AFTER** the new [[ref: DID log entry]] has been published. Such a replacement **MAY** be a `{}` (empty object).
Once the `witness` attribute set to `{}` becomes active, updates to the DID are
not [[ref: witnessed]].

##### Witness DIDs and Reputation

Since `did:webvh` witness DIDs must be `did:key` DIDs, there is not an
explicitly published identifier for each witness. If there is a need in an ecosystem
to identify who the witnesses are, a mechanism should be defined by the
governance of the ecosystem, such as the entry of the DID in a trust registry.
Such mechanisms are outside the scope of this specification.

When a [[ref: did:key]] DID is used in any `did:webvh` context — as a witness `id`, as a `verificationMethod` controller, or as an `assertionMethod` reference in a [[ref: Data Integrity]] proof — the [[ref: did:key]] specification **MUST** be followed. Notably, the multibase value in the method-specific identifier (the **body** of the DID) **MUST** equal the multibase value in any fragment identifier (if present) that references the lone verification method within the DID. For `did:key:z6MkABC...#z6MkABC...`, body and fragment **MUST** be byte-for-byte equal. Verifiers **MUST** reject any reference where they differ, because the body authoritatively defines the public key while the fragment is the Verification Method id; permitting divergence would let an attacker claim a proof was made by `did:key:A` while actually signing with `did:key:B`.

##### The `witness` Parameter

The `witness` element in a [[ref: parameters]] object of a [[ref: DID Log entry]]
has the following data structure:

```json

"witness" : {
  "threshold": n,
  "witnesses" : [
      {
         "id": "<did:key DID of witness>"
      }
   ]
}

```

where:

- `threshold`: a positive integer (JSON number, no fractional part, value ≥ 1) that **MUST** be attained or surpassed by the count of **distinct** verified [[ref: witness]] approvals for a [[ref: DID log entry]] to be considered approved. The `threshold` **MUST** be between 1 and the number of **distinct** `witnesses[].id` values, inclusive. A `witness` parameter where `threshold` is missing, non-integer, < 1, or > count(distinct ids) **MUST** be rejected; resolvers **MUST NOT** silently coerce a malformed `witness` to "no witnesses" — they **MUST** terminate resolution with an error.
- `witnesses`: the array of [[ref: witnesses]] that **MUST** be non-empty, with each entry including the field:
  - `id`: (required) the DID of the witness. The DID **MUST** be a `did:key` DID and **MUST** be unique within the array (compared byte-for-byte after Unicode NFC normalisation). Each `id` contributes at most one approval to threshold counting, regardless of how many proofs are attributed to it.
  - The `did:key` used as a witness `id` **MUST** decode to a public key compatible with one of the cryptosuites listed in the
   [parameters](#didwebvh-did-method-parameters) defined by the version of the
   `did:webvh` specification being used by the [[ref: DID Controller]] based on the active
   `method` [[ref: parameters]] property. A witness `id` whose body decodes to a key of any other type **MUST** be rejected at parameter-validation time — not at signature-verification time — so an invalid witness configuration cannot ever take effect.

##### Witness Threshold Algorithm

The use of the [[ref: threshold]] versus needing approvals from all [[ref: witnesses]] is to prevent faulty [[ref: witnesses]] from blocking the publishing
of a new version of the DID. To determine if the [[ref: threshold]] has been
met, participants **MUST**:

1. Verify each [[ref: Data Integrity]] proof in `did-witness.json` for the relevant `versionId` independently.
2. Attribute each verified proof to a witness `id` from the **active** `witnesses` list. Proofs that cannot be attributed (the proof's key does not belong to any listed witness) **MUST** be discarded.
3. Form the set of **distinct** attributed `id` values. The threshold check applies to the size of this set, not to the raw proof count.
4. If `|set| ≥ threshold`, the update is "[[ref: witnessed]]"; otherwise resolution **MUST** terminate with an error.

The client of a DID Resolver can evaluate the witnesses according to
the governance of the ecosystem. Such an evaluation is outside the scope of this
specification.

##### The Witness Proofs File

Proofs from [[ref: witnesses]] are placed into a separate file
(`did-witness.json`) from the [[ref: DID Log]]. The same [DID to HTTPS
Transformation](#the-did-to-https-transformation) used for the [[ref: DID Log]]
is used to locate the `did-witness.json` resource, with only the last element
changed (`did.jsonl` to `did-witness.json`). The media type of the file
**SHOULD** be `application/json`.

The data model for the `did-witness.json` file is:

```json
[
  {
    "versionId": "1-Qmba111111...",
    "proof": [{ ... }, { ... }]
  },
  {
    "versionId": "2-Qzmb222222...",
    "proof": [{ ... }, { ... }]
  }
]
```

Where:

- `versionId` is the `versionId` of the [[ref: DID log entry]] to which the
  [[ref: witness]] proofs apply.
- `proof` is an array of [[ref: Data Integrity]] proofs that use the `versionId`
  as input data.  The permitted [[ref: Data Integrity]] cryptosuite **MUST** be one listed in the
   [parameters](#didwebvh-did-method-parameters) defined by the version of the
   `did:webvh` specification being used by the [[ref: DID Controller]] based on the active
   `method` [[ref: parameters]] property, and the `proofPurpose` set to `assertionMethod`.

Because a witness `id` is a `did:key` DID, the verification key is fully determined by decoding the `did:key` body — no DID resolution is required and no `verificationMethod` lookup is permitted. Resolvers verifying a witness proof **MUST**:

1. Parse the proof's `verificationMethod` as `did:key:<multibase>#<multibase>` and recover the public key by decoding the body multibase per the [[ref: did:key]] specification.
2. Verify the signature using **only** that key. Resolvers **MUST NOT** dereference the witness DID for a key, **MUST NOT** consult any other key store, and **MUST NOT** accept a proof whose body multibase decodes to a key structurally invalid for the cryptosuites mandated by the active `method`.

A valid proof from a [[ref: witness]] carries the implication that **ALL** prior
[[ref: DID Log entries]] are also approved by that witness. To maintain a
manageable `did-witness.json` file size, the [[ref: DID Controller]] **SHOULD**
remove all older proofs for **published** [[ref: DID Log entries]], keeping only the
latest proof for each witness.

To eliminate the race condition in publishing the [[ref: DID Log]] and
`did-witness.json` files, when a new [[ref: DID Log entry]] is being added,
[[ref: witness]] proofs **MUST** be added to the `did-witness.json` file and
that file published **BEFORE** publishing the [[ref: DID Log]] file containing
the new [[ref: DID Log entry]]. As a result, `did:webvh` resolvers may find
proofs for unpublished [[ref: DID log entries]] in the `did-witness.json` file.
Resolvers **MUST** ignore proofs with `versionId`s not in the [[ref: DID Log]]
file. Since resolvers cannot verify an unpublished [[ref: DID log entry]], the
[[ref: witness]] proofs on unpublished [[ref: DID log entries]] do not carry the
implication of approval of prior [[ref: DID Log entries]]. Therefore, at times
there may be two proofs in the `did-witness.json` file for a [[ref: witness]]:

- The most recent proof for a published [[ref: DID Log entry]].
- An additional proof that applies to an unpublished [[ref: DID Log entry]].

To avoid unnecessary clutter in the `did-witness.json` file, array entries
without proofs (e.g., containing only the `versionId`) **SHOULD** be removed.

##### Witnessing a DID Version Update

The following process is used to witness a DID version update:

- The [[ref: DID Controller]] prepares the full [[ref: DID Log Entry]] (including the
  `proof` element) for the new version of the DID, and shares it with the active [[ref: witnesses]].
  - The specification leaves to implementers *how* the [[ref: log entry]] data is provided to the [[ref: witnesses]].
- Each [[ref: witness]] **MUST** hold its own copy of the published [[ref: DID Log]] (`did.jsonl`) prior to witnessing, and **MUST** confirm that the controller-supplied candidate entry verifies as the next entry to that [[ref: DID Log]].
- Each [[ref: witness]] **MUST** independently verify the candidate entry using every step in [Read (Resolve)](#read-resolve). Any failure **MUST** cause the witness to refuse approval.
- Each [[ref: witness]] determines (based on the governance of the ecosystem)
  if they approve of the DID version update.
  - The meaning of "approve" for any given implementation is outside the scope of this specification.
- If the verification is successful and approval granted, the [[ref: witness]]
  creates and sends to the [[ref: DID Controller]] a [[ref: Data Integrity]]
  proof signed using the [[ref: witness]]'s `did:key` DID.
  - The specification leaves to implementers how [[ref: witness]] proofs are
    conveyed to the [[ref: DID Controller]].
- The [[ref: DID Controller]] **MUST** add the proof to the record for
  the applicable `versionId` for the unpublished [[ref: DID log entry]]
  to the `did-witness.json` file.
  - The [[ref: DID Controller]] **MAY** publish the updated `did-witness.json` file
    as new witness proofs are added to the file.
  - The [[ref: DID Controller]] **MUST** publish the updated `did-witness.json` file
    **after** a [[ref: threshold]] of witness proofs have been received and **before** the
    witnessed [[ref: DID Log]] file is published.

##### Verifying Witness Proofs During Resolution

A `did:webvh` resolver **MUST** verify that all [[ref: DID Log entries]] that have active [[ref: witnesses]] have a [[ref: threshold]] of approving witnesses. Resolvers **MUST**:

1. Complete all non-witness verifications of the [[ref: DID Log]] **before** processing any witness proof. Witness verification **MUST NOT** substitute for entry-hash or signature verification.
2. Retrieve the `did-witness.json`.
3. For each entry in `did-witness.json`, confirm its `versionId` matches a `versionId` present in **this** `did.jsonl` log. Non-matching entries, including those for future entries, **MUST** be discarded and **MUST NOT** be treated as evidence of witnessing for any other entry.
4. Verify enough proofs to meet the [[ref: threshold]] for all entries requiring witnessing.
5. For each entry requiring witnessing, confirm a threshold of verified, distinct-witness proofs whose `versionId` matches the current or any later published entry. Otherwise, terminate with an error.

For each witness proof, the resolver **MUST** extract `verificationMethod` and confirm that:

1. It is a valid, [[ref: did:key]] specification-compliant DID URL of the form `did:key:<multibase>#<multibase>` where body and fragment multibases are byte-equal (see [`did:key` body/fragment check](#witness-dids-and-reputation)).
2. No previously verified proof was found in the witnesses array for the same `versionId` and `id` (one count per witness per entry).

A proof failing either requirement **MUST** be discarded from threshold counting.

A [[ref: DID Controller]] is expected to prune the `did-witness.json` file to include only the last proof for each witness for a published [[ref: DID log entry]]. However, if a [[ref: DID Controller]] does not prune the file, a resolver **MAY** do the pruning as part of the resolution process, verifying only the minimum number of proofs needed to meet the [[ref: threshold]] for each [[ref: DID log entry]]. While it is expected that a [[ref: DID Controller]] will exclude any proofs that fail verification, a resolver **MAY** ignore any proofs that fail verification and still resolve the DID if there are enough valid proofs to meet the [[ref: threshold]] requirements.

If you want to learn more about the practical application of witnesses, see the
Implementer's Guide section on
[Witnesses](https://didwebvh.info/latest/implementers-guide/witnesses/) on the
`did:webvh` information site for more discussion on the witness capability and
using it in production scenarios.

#### DID Watchers

[[ref: Watchers]] are components found in some digital trust and DID ecosystems that monitor DIDs on behalf of clients for various purposes, such as:

- **Caching verified DIDs:** Storing verified DID documents to facilitate efficient resolution.
- **Ensuring persistence:** Maintaining access to DIDs even after removal by the [[ref: DID Controller]]. For example, the [Verifiable Data Gateway](https://github.com/LedgerDomain/did-webplus?tab=readme-ov-file#verifiable-data-gateway-vdg) in [did](https://github.com/LedgerDomain/did-webplus/blob/main/README.md)[:webplus](https://github.com/LedgerDomain/did-webplus/blob/main/README.md) could function as a [[ref: watcher]] for enduring DIDs.
- **Detecting inconsistencies:** Identifying malicious behavior by the [[ref: DID Controller]], such as republishing altered [[ref: DID Logs]]. A network of [[ref: watchers]] can reach consensus independently of [[ref: witnesses]].

Any party may set up a [[ref: watcher]] for `did:webvh` DIDs. However, a `did:webvh` DID Controller may opt to collaborate with specific [[ref: watchers]] by publishing their URIs in the [[ref: parameters]] of [[ref: DID log entries]]. It is outside the scope of this specification how a [[ref: DID controller]] requests a [[ref: watcher]] monitor a DID or how a [[ref: watcher]] requests it be included in the [[ref: DID Log]] of a DID.

The governance of [[ref: watchers]] is out of scope for this specification, which defines only the technical mechanisms for notifying and querying [[ref: watcher]] services.

##### Publishing Watcher URLs

did:webvh provides a mechanism for notifying resolvers (and their clients via [[spec:DID-RESOLUTION]] metadata) about configured [[ref: watchers]].  The `watchers` [[ref: parameter]] lists URIs that identify the DID's [[ref: watchers]].

[[ref: Watchers]] can be used by `did:webvh` resolvers and resolver clients. When resolving a `did:webvh` DID, `did:webvh` resolvers **MUST** provide the active list of [[ref: watchers]] in the DID metadata, as noted in the [read/resolve](#read-resolve) section of this specification.

Watcher URIs MAY use schemes other than HTTP(S), such as a DID ([[spec:DID-CORE]]), depending on the specific implementation or network requirements. However, this specification does not define how non-HTTP(S) [[ref: watcher]] URIs should be resolved or interacted with. If a [[ref: watcher]] uses an HTTP(S) URL, it **MUST** support the HTTP-based interaction model defined in the [Watcher Endpoints and Behavior](#watcher-endpoints-and-behavior) section.

If a `watchers` entry is included in a [[ref: DID log entry]], it replaces the active set of [[ref:watchers]].

If a new [[ref: watcher]] is added after a DID has existed for some time, the [[ref: DID Controller]] **SHOULD** notify the new [[ref: watcher]] about previously created [[ref: DID Resources]].

[[ref: Watchers]] do not need to be listed in the [[ref: DID log]]. [[ref: Watchers]] can operate independently of the [[ref: DID Controller]] by polling for updates. [[ref: DID Controllers]] **MAY** send notifications to [[ref: watchers]] that the [[ref: DID Controller]] is aware of but does not list in the [[ref: DID Log]].

##### Watcher Endpoints and Behavior

A [[ref: watcher]] is a web server accessible via HTTP that **MUST** support the following capabilities:

- **Client Requests:**
  - Retrieve the [[ref: DID log]] file for a given [[ref: SCID]].
  - Retrieve the witness file for a given [[ref: SCID]].
  - Retrieve a resource for a given [[ref: SCID]] and resource path.
- **Notifications (typically) from the [[ref: DID Controller]]:**
  - Notify the [[ref: watcher]] about a new log entry for a DID.
  - Notify the [[ref: watcher]] about a new or updated [[ref: DID resource]].
  - Request removal of a given [[ref: SCID]] from the [[ref: watcher]]'s cache.
  - Request removal of a given DID resource [[ref: SCID]] from the [[ref: watcher]]'s cache.

##### Watcher HTTP API Operations

The following HTTP API operations define the interaction between [[ref: watchers]] and other components. Included with the specification is the [did:webvh v1.0 Watcher OpenAPI YML Definition](https://raw.githubusercontent.com/decentralized-identity/didwebvh/refs/heads/main/watcherOpenAPI/watcher-v1.0.0.yml) that includes the request and response data models and status codes for each of the endpoints.

- **GET `<WATCHER URL>/log?scid=<SCID>`**: Returns the latest [[ref: DID Log]] for the given [[ref: SCID]].
- **POST `<WATCHER URL>/log?did=<DID>`**: Notifies the [[ref: watcher]] of a log update, prompting retrieval of the latest [[ref: DID Log]] and [[ref: witness]] file. This endpoint uses the `did` as the query parameter instead of the [[ref: SCID]] to ensure that the [[ref: watcher]] is notified in the case of the DID moving to a new web location. The [[ref: watcher]] is expected to continue indexing the DID using its [[ref: SCID]].
- **POST `<WATCHER URL>/log/delete?scid=<SCID>`**: Notifies the [[ref: watcher]] that the given `<SCID>` should be deleted from the [[ref: watcher]]'s cache. If removed, subsequent requests for that `<SCID>` from clients should return a `404 Not Found` status. The body of the request is a Data Integrity proof from the requester that may be used by the [[ref: Watcher]] to decide on the legitimacy of the request. The [[ref: Watcher]] will act (or not) on the request according to its governance, which is out of scope of this specification. For example, a [[ref: watcher]] might implement a workflow that must be completed to approve the deletion of a `<SCID>` from the [[ref: watcher]]'s cache. The endpoint could be used to carry out a "right to be forgotten" order, such as might be required under Europe's [General Data Protection Regulation (GDPR)](https://gdpr-info.eu/).
- **GET `<WATCHER URL>/witness?scid=<SCID>`**: Returns the latest `witness.json` file for the given [[ref: SCID]].
- **GET `<WATCHER URL>/resource?scid=<SCID>&path=<resourcePath>`**: Retrieves the requested resource.
- **POST `<WATCHER URL>/resource?scid=<SCID>&path=<resourcePath>`**: Notifies the [[ref: watcher]] of a new or updated resource.
- **POST `<WATCHER URL>/resource/delete?scid=<SCID>&path=<resourcePath>`**: Notifies the [[ref: watcher]] that the given `<resourcePath>` associated with the `<SCID>` should be deleted from the [[ref: watcher]]'s cache. If removed, subsequent requests for that `<SCID>` and `<resourcePath>` from clients should return a `404 Not Found` status. The body of the request is a Data Integrity proof from the requester that may be used by the [[ref: Watcher]] to decide on the legitimacy of the request. The [[ref: Watcher]] will act (or not) on the request according to its governance, which is out of scope of this specification. For example, a [[ref: watcher]] might implement a workflow that must be completed to approve the deletion of a `<SCID>` from the [[ref: watcher]]'s cache. The endpoint could be used to carry out a "right to be forgotten" order, such as might be required under Europe's [General Data Protection Regulation (GDPR)](https://gdpr-info.eu/).

#### Publishing a Parallel `did:web` DID

Each time a `did:webvh` version is created, the [[ref: DID Controller]] **MAY**
generate a corresponding `did:web` to publish along with the `did:webvh`. If
this is being done, the `did:webvh` DIDDoc **SHOULD** have the corresponding
`did:web` in the `alsoKnownAs` array. To publish a parallel `did:web` DIDDoc, the
[[ref: DID Controller]] **MUST**:

1. Start with the resolved version of the [[ref: DIDDoc]] from `did:webvh`.
2. Execute a text replacement across the [[ref: DIDDoc]] of `did:webvh:<SCID>:` to
   `did:web:`, where `<scid>` is the actual `did:webvh` [[ref: SCID]].
3. Add to the [[ref: DIDDoc]] `alsoKnownAs` array, the full `did:webvh` DID. If
   the `alsoKnownAs` array does not exist in the [[ref: DIDDoc]], it **MUST** be
   added.
4. Remove any duplicate entries in the `alsoKnownAs` array, including the
   `did:web` DID itself if it was duplicated in the earlier steps.
5. Publish the resulting [[ref: DIDDoc]] as the file `did.json` at the web location
   determined by the specified `did:web` DID-to-HTTPS transformation.

Because the `did:web` [[ref: DIDDoc]] contains the same services as the
`did:webvh` [[ref: DIDDoc]], any `PathHandler`-typed services (see [Common DID URL
Path Services](#common-did-url-path-services)) dereference to the same resources
from either DID, provided their `serviceEndpoint` values are absolute HTTPS
URLs.

Because the text replacement in step 2 preserves the domain and path
components exactly, a parallel `did:web` DID carries the same A-label domain
and percent-encoded path as its `did:webvh` DID. `did:web` resolvers, which
construct the HTTPS URL by prefixing `https://` to the domain, can therefore
resolve parallel `did:web` DIDs on internationalized domains without any IDNA
processing.

The benefit of doing this is that resolvers that have not been updated to
support `did:webvh` can continue to resolve the [[ref: DID Controller]]'s DIDs.
`did:web` resolvers that are aware of `did:webvh` features can use that knowledge,
and the existence of the `alsoKnownAs` `did:webvh` data in the [[ref: DIDDoc]] to get the
verifiable history of the DID.

The risk of publishing the `did:web` in parallel with the `did:webvh` is that the
added security and convenience of using `did:webvh` are lost.

### Common DID URL Path Services

*This section is non-normative.*

DID URLs with paths, such as `<did>/whois`, are dereferenced using the
`PathHandler`-typed services in the resolved [[ref: DIDDoc]], as defined in
the DID Resolution specification [[spec:DID-RESOLUTION]]. `did:webvh`
resolvers do not add services to the resolved [[ref: DIDDoc]] (see [Read
(Resolve)](#read-resolve)), so a DID URL path can be dereferenced only if the
[[ref: DIDDoc]] includes a `PathHandler`-typed service that matches it.

::: note DIDs using v1.0
Under [v1.0](../v1.0) of this specification, resolvers add implicit `#files`
and `#whois` services to the resolved [[ref: DIDDoc]]. Those services are
still added when resolving a [[ref: DIDDoc]] version whose active `method` is
that of v1.0. See [Upgrading from v1.0 to v2.0](#upgrading-from-v10-to-v20).
:::

Two DID URL path services are commonly used with `did:webvh` DIDs: `#whois`,
for publishing verifiable information about the DID's controller, and
`#files`, for publishing resources addressed by DID URLs. In v1.0 of this
specification, resolvers added both services to every resolved
[[ref: DIDDoc]]. They are now optional: a [[ref: DID Controller]] that wants
either one adds it to the [[ref: DIDDoc]], with a `serviceEndpoint` of their
choosing.

A common convention, and the one used by the v1.0 implicit services, is to
publish the resources at the web location of the [[ref: DID Log]]. The
`serviceEndpoint` is the HTTPS URL from the [DID-to-HTTPS
Transformation](#the-did-to-https-transformation) with the final `did.jsonl`
segment removed, and with any `.well-known/` segment removed. For example,
for `did:webvh:{SCID}:example.com`, the base URL is `https://example.com/`,
and for `did:webvh:{SCID}:example.com:dids:issuer`, it is
`https://example.com/dids/issuer/`.

#### The `/whois` Service

The `/whois` DID URL path draws on the `WHOIS` protocol [[spec-inform:rfc3912]]:
submit a request about a domain name and get back what is published about
it. Dereferencing `<did>/whois` returns a [[ref: Linked-VP]], published by the
[[ref: DID Controller]] and signed by the DID, containing
[[ref: Verifiable Credentials]] whose `credentialSubject.id` is the DID (or an
equivalent identifier, such as one in the [[ref: DIDDoc]]'s `alsoKnownAs`
array). [[spec:vc-recognized-entities-1.0]] Verifiable Credentials are a good
fit. The [[ref: DID Controller]] chooses which credentials to include; the
relying party decides which assertions, and which issuers, matter to it.

The result is a simple, decentralized trust registry. To learn more about the
controller of a DID, a relying party dereferences `<did>/whois`. To learn more
about the issuer of a credential in the presentation, it repeats the process
with `<issuer did>/whois`, much like walking a Certificate Authority
hierarchy, until it reaches an issuer it already trusts. For example, an
importer receiving a "Product Passport" credential from a mining company
could find, in the company's `/whois` presentation, a business registration
credential, a mining permit, and an audit credential. Where the importer does
not recognize the permit or audit issuer, the `/whois` of that issuer might
lead to a government or an accreditation body that it does recognize. Such
checks take a handful of HTTPS requests. Where they do not lead to an
automated trust decision, they still collect information that a person can
use to make one.

A [[ref: DID Controller]] can publish a `/whois` presentation by adding a
service such as the following to the [[ref: DIDDoc]], and publishing the
presentation, with media type `application/vp`, at the `serviceEndpoint`:

```json
{
  "@context": "https://identity.foundation/linked-vp/contexts/v1",
  "id": "did:webvh:{SCID}:example.com#whois",
  "type": ["PathHandler", "whois"],
  "path": "/whois",
  "serviceEndpoint": "https://example.com/whois.vp"
}
```

With this service, the DID URL `did:webvh:{SCID}:example.com/whois` is
dereferenced to `https://example.com/whois.vp`.

When a [parallel `did:web` DID](#publishing-a-parallel-didweb-did) is
published, the presentation's proof can reference either DID, or the
presentation can include two proofs, one referencing a verification method of
each DID. Since each DID lists the other in `alsoKnownAs` and both have the
same verification methods, a verifier can use the DID it has already
resolved, or resolve the DID referenced in the proof.

::: note Future direction for `/whois`
The `whois` service `type` and the `/whois` convention are expected to be defined in their own specification,
independent of any DID method. A `whois-vh` specification is also
anticipated, giving the `/whois` presentation a verifiable history using a
mechanism similar to the one `did:webvh` uses for the DID itself.
:::

#### The `#files` Service

A `#files` service lets a [[ref: DID Controller]] publish resources, such as
governance documents, schemas or images, that are referenced by DID URLs
rather than by HTTPS URLs. References made this way stay with the DID: if the
resources move (to a CDN, for example, or as part of [DID
portability](#did-portability)), the [[ref: DID Controller]] updates the
`serviceEndpoint` in the [[ref: DIDDoc]], and the DID URLs continue to work.

```json
{
  "id": "did:webvh:{SCID}:example.com#files",
  "type": "PathHandler",
  "path": "/",
  "serviceEndpoint": "https://example.com/"
}
```

A `path` of `/` matches any DID URL path not matched by a more specific
`PathHandler`-typed service, such as `#whois`. With this service, the DID URL
`did:webvh:{SCID}:example.com/governance/issuers.json` is dereferenced by
removing the matched `/` from the path and appending the remainder to the
`serviceEndpoint`, giving `https://example.com/governance/issuers.json`.
