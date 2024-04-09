## did:tdw DID Method Specification

### Target System

The target system of the Trust DID Web (TDW) DID method is the host (or domain)
name when the domain specified by the DID is resolved through the Domain Name
System (DNS).

### Method Name

The namestring that identifies this DID method is: `tdw`. A DID that uses
this method MUST begin with the following prefix: `did:tdw`. Per the DID
specification, this string MUST be in lowercase. The remainder of the DID, after
the prefix, is the [method-specific identifier](#method-specific-identifier),
specified below.

### Method-specific Identifier

The method specific identifier is a fully qualified domain name that is secured
by a TLS/SSL certificate with an optional path to the [[ref: DID Log]]. The
identifier **MUST** contain a [[ref: self-certifying identifier]] (SCID) as
either part of the subdomain component of the domain name, or as a component of
the optional path. The content of the [[ref: SCID]] is
[generated](#scid-generation-and-validation) in creating the DID. The formal
rules describing valid domain name syntax are described in [[spec:RFC1035]], [[spec:RFC1123]],
and [[spec:RFC2181]].

The domain name component of the method specific identifier MUST match the
common name used in the SSL/TLS certificate, and it MUST NOT include IP
addresses. A port MAY be included and the colon MUST be percent encoded to
prevent a conflict with paths. Directories and subdirectories MAY optionally be
included, delimited by colons rather than slashes.

The [[ref: SCID]], a globally unique identifier, is generated as part of the
creation of the DID and placed into the DID identifier.

As specified in the following Augmented Backus-Naur Form (ABNF) notation
[[spec:rfc2234]] the [[ref: SCID]] **MUST** be present in the DID string, but
may be placed in the (optional) subdomain component of the domain, or as a
segment in the (optional) URL path. See examples below. The `domain-segment` and
`path-segment` elements refer to [[spec:rfc3986]]'s ABNF for a Generic URL (page 49).
Attempting to replicate here the full ABNF of those elements from that RFC would
inevitably be wrong.

```abnf
tdw-did = "did:tdw:" *( domain-segment “.” ) scid 1*( “.” domain-segment ) ( “.” domain-segment ) *( ":" path-segment )
tdw-did = "did:tdw:" 2*( domain-segment “.” ) *( ":" path-segment ) (":" scid ) *( ":" path-segment )
domain-segment = ; A part of a domain name as defined in RFC3986, such as "example" and "com" in "example.com"
path-segment= ; A part of a URL path as defined in RFC3986, such as "path", "to", "folder" in "path/to/folder"
scid = 24( lower-base32 )
lower-base32 = [2-7a-z]
```

::: example

`did:tdw` DIDs and the corresponding web locations for their `did:tdw` log file.
`{SCID}` is a placeholder for where the generated SCID will be placed in the examples.

---

subdomain

`did:tdw:{SCID}.example.com` -->

`https://{SCID}.example.com/.well-known/didlog.txt`

path

`did:tdw:example.com:dids:{SCID}` -->

`https://example.com/dids/{SCID}/didlog.txt`

path w/ port

`did:tdw:example.com%3A3000:dids:{SCID}` -->

`https://example.com:3000/dids/{SCID}/didlog.txt`

:::

The location of the `did:tdw` `didlog.txt` file is the same as where the comparable `did:web`
`did.json` file is published. A [[ref: DID Controller]] **MAY** choose to publish both DIDs and so both files.

### DID Method Operations

#### Create (Register)

Creating a `did:tdw` DID is done by carrying out the following steps.

1. Define the DID string, and hence, the web location at which the DID Log
   (`didlog.txt`) will be published. Identify (using the placeholder `{SCID}`)
   where the required [[ref: SCID]] will be placed in the DID string (ie.
   `did:tdw:example.com:{SCID}`).
2. Create the initial DIDDoc (`did.json`) file for the DID, with whatever
   content is required. Wherever there is self-reference to the DID in the
   DIDDoc, use the absolute form defined in step 1, with the identified
   placeholder for the [[ref: SCID]] (ie. `did:tdw:example.com:{SCID}#key-1`).
   1. As per [Authorized Keys](#authorized-keys), the DIDDoc **MUST** contain at
      least one `authentication` or `verificationMethod` key type.
3. Define a JSON array of valid [[ref: parameters]] that affect the generation
   of the DID. The [DID Generation and Validation
   Parameters](#didtdw-did-method-parameters) section of this specification
   defines the permitted [[ref: parameters]].
4. Pass the DID string, initial DIDDoc, and [[ref: parameters]] to a `did:tdw` "Create" implementation that **MUST**:
   1. Calculate the [[ref: SCID]] for the DID as defined in the [SCID Generation and Validation](#scid-generation-and-validation) section of this specification.
   2. Replace in the DIDDoc the placeholder for the [[ref: SCID]] `{SCID}` with the calculated `SCID`.
   3. Generate a DID Entry as a JSON array with the following five JSON items:
      1. The [[ref: SCID]] as the `entryHash` value: `"ke465curdwjzrrp5x5ut92te"`
      2. An integer, `1`, that is the versionId for this first version of the DIDDoc: `1`
      3. A string that is the current time in [[ref: ISO8601]] format: `"2024-04-04T07:32:58Z"`
      4. The [[ref: parameters]] passed in as a JSON dict: `{"method":"did:tdw:1","scid":"en6dfezxz8yvudnyb5pq9a6g"}`
      5. The contents of the initial DIDDoc, in the form: `{"value": <DIDDoc>}`
   4. Calculate the [[ref: Entry Hash]] (`entryHash`) of the DID Entry as defined in the [Entry Hash Generation and Validation](#entry-hash-generation-and-validation) section of this specification.
   5. Update the `entryHash` with the value produced in the previous step.
   6. Generate a [[ref: Data Integrity]] proof across the entry using an authorized key from the DID, and the `entryHash` as the proof `challenge`. The definition of "authorized" in this case is specified in the [Authorized Keys](#authorized-keys) section of this specification. The proof becomes the sixth and last JSON item in the DID log entry.
   7. Put the resulting entry, with extraneous white space removed as the contents of a file `didlog.txt` and publish the file at the appropriate location defined by the `did:tdw` value.
      1. This is a logical operation -- how a deployment serves the `didlog.txt` content is not constrained.

A controller **MAY** generate an equivalent `did:web` DIDDoc and publish it as
defined in the [Publishing a Parallel `did:web`
DID](#publishing-a-parallel-didweb-did) section of this specification. The
`did:web` DIDDoc could be used for backwards compatibility as a transition is
made from `did:web` to `did:tdw`. Verifiers using the `did:web` lose the
verifiable properties and history of the `did:tdw` for the convenience of the
simple retrieval of the `did:web` DIDDoc.

#### Read (Resolve)

The following steps MUST be executed to resolve the DIDDoc for a `did:tdw` DID:

1. Replace ":" with "/" in the method specific identifier to obtain the fully qualified domain name and optional path.
2. If the domain contains a port percent decode the colon.
3. Generate an HTTPS URL to the expected location of the DIDDoc by prepending `https://`.
4. If no path has been specified in the URL, append `/.well-known`.
5. Append `/didlog.txt` to complete the URL.
6. Perform an HTTP GET request to the URL using an agent that can successfully negotiate a secure HTTPS connection, which enforces the security requirements as described in [Security and privacy considerations](#security-and-privacy-considerations).
7. When performing the DNS resolution during the HTTP GET request, the client SHOULD utilize [[spec:rfc8484]] in order to prevent tracking of the identity being resolved.
8. Process the [[ref: DID Log]] file as described below.

To process the retrieved [[ref: DID Log]] file, the resolver **MUST** carry out the following steps:

1. Process the Log entries in the order they appear in the file, applying the [[ref: parameters]] set on current and previous entries. As noted in the [Create (Register)](#create-register), each log entry consists of a JSON array of 6 items:
   1. `entryHash`
   2. `versionId`
   3. `versionTime`
   4. `parameters`
   5. DIDDoc content -- either the full `value` or a [[ref: JSON Patch]] `patch` to be applied to the prior version of the DIDDoc.
   6. A Data Integrity proof over the entry.
2. For each entry:
   1. Update the currently active [[ref: parameters]] with the parameters from the entry (if any). Continue processing using the now active set of [[ref: parameters]].
   2. Verify that the Data Integrity proof in the entry is valid, and is signed by an authorized key as defined in the [Authorized Keys](#authorized-keys) section of this specification.
   3. Verify that the `entryHash` for the entry using to the process defined in the [Entry Hash Generation and Verification](#entry-hash-generation-and-validation) section of this specification.
   4. For the initial version of the DIDDoc (`1`) verify that the [[ref: SCID]] (defined in the [[ref: parameters]]) is being used in the DID, and verifies according to the [SCID Generation and Verification](#scid-generation-and-validation) section of this specification.
   5. Generate the version of the DIDDoc for the entry by using the JSON value of the `value` item, or by using [[ref: JSON Patch]] to apply the JSON value of the `patch` entry item to the previous version of the DIDDoc.
   6. If [[ref: Key Pre-Rotation]] is being used, verify that any added keys in the DIDDoc have a valid pre-rotation entry as defined in the [Key Pre-Rotation Hash Generation and Verification](#pre-rotation-key-hash-generation-and-validation) section of this specification.
   7. Once each version entry has been processed, collect about each version (at least) the following information:
      1. `versionId`
      2. `versionTime`
      3. The DIDDoc

On completing the processing of all entries in the [[ref: DID Log]], respond to the DID resolution request, including the application of query parameters such as `?versionId=` and `?versionTime=` with the appropriate DIDDoc version.

The following error codes and descriptions may be returned when resolving a DID.

:::todo

Document the full list of error codes that can be generated in resolving a DID.

:::

- Code 404: The `did:tdw` DID Log file `didlog.txt` was not found.

##### Reading did:tdw DID URLs

A `did:tdw` resolver **MAY** implement the resolution of the `/whois` and a DID
URL Path using the [whois LinkedVP Service](#whois-linkedvp-service) and [DID
URL Path Resolution Service](#did-url-path-resolution-service) as defined in
this specification by processing the [[ref: DID Log]] and then [dereferencing
the DID URL] based on the contents of the DIDDoc. The client of a resolver that
does not implement those capabilities must use the resolver to resolve the
appropriate DIDDoc, and then process the resulting DID URLs themselves. Since
the default DID-to-HTTPS URL transformation is trivial, `did:tdw` [[ref: DID
Controllers]] are strongly encouraged to use the default behavior for DID URL
Path resolution.

#### Update (Rotate)

To update a DID to for example, rotate a key in the DIDDoc, a new, verifiable
[[ref: DID Log Entry]] must be generated, appended to the existing [[ref: DID
Log]] (`didlog.txt`) and published to the web location defined by the DID. The
process to generate a verifiable [[ref: DID Log Entry]] follows a similar
process to the [Create](#create-register) process, as follows:

1. Make the desired changes to the DIDDoc. While the contents of a new DIDDoc
   version are (mostly) up to the DID controller, there are some limitations:
   1. The `id` of the DIDDoc **MAY** be changed when the DID Controller wants to
      (or must) publish the DID at a different location and wants to retain the
      [[ref: SCID]] and history of the DID. For details, see the section [Moving
      a DID's Web Location].
   2. If [[ref: Key Pre-Rotation]] is being used in the DID, only keys with a
      valid pre-rotation entry in a previous DIDDoc can be added, as defined in
      the [Key Pre-Rotation Hash Generation and Verification] section of this
      specification.
2. Define a JSON array of valid [[ref: parameters]] that affect the generation
   of the DID. The [`did:tdw` DID Method
   Parameters](#didtdw-did-method-parameters) section of this specification
   defines the permitted [[ref: parameters]].
3. Pass the existing [[ref: DID Log]], the updated DIDDoc, and the [[ref:
   parameters]] to a `did:tdw` update implementation which **MUST**:
   1. Generate a DID Entry as a JSON array (`[<data>]`) with the following JSON
      items:
      1. The `entryHash` from the previous [[ref: DID Log Entry]] as the
         `entryHash` value.
      2. An integer that is one more than the `versionId` of the previous [[ref:
         DID Log Entry]].
      3. A string that is the current time in [[ref: ISO8601]] format:
         `"2024-04-05T07:32:58Z"`
      4. The [[ref: parameters]] passed in as a JSON dict: `{}`
         1. [[ref: parameters]] from previous versions continue to apply and do
            not need to be repeated in each version. As a result, the
            `parameters` item will often be an empty dict.
      5. Generate a [[ref: JSON Patch]] to evolve the previous DIDDoc version to
         the new DIDDoc version, and put the resulting patch in the item
         `{"patch": <DIDDoc Patch>}`. For details see the [Generating and
         Applying a JSON Patch].
         1. An implementation **MAY** skip the [[ref: JSON Patch]] process and
            simply put the full new version of the DIDDoc in the item `{"value":
            <DIDDoc>}` as is done in the initial entry in the log.
   2. Calculate the [[ref: Entry Hash]] (`entryHash`) of the DID Entry as
      defined in the [Entry Hash Generation and Validation] section of this
      specification.
   3. Update the `entryHash` with the value produced in the previous step.
   4. Generate a [[ref: Data Integrity]] proof across the entry using an
      authorized key from the DID, and the `entryHash` as the proof `challenge`.
      The definition of "authorized" is formalized in the [Authorized
      Keys](#authorized-keys) section of this specification. The proof becomes
      the last JSON item in the entry.
   5. Append the resulting entry to the existing contents of the [[ref: DID Log]] file `didlog.txt`.
4. Update the [[ref: DID Log]] file at the appropriate location defined by the `did:tdw` identifier.
      1. This is a logical operation -- how a deployment serves the `didlog.txt` content is not constrained.

A controller **MAY** generate an equivalent, updated `did:web` DIDDoc and publish it as defined in the [Publishing a Parallel `did:web` DID](#publishing-a-parallel-didweb-did) section of this specification.

#### Deactivate (Revoke)

To deactivate the DID, the [[ref: DID Controller]] **SHOULD** update the DIDDoc
to include the item `"deactivated": true`, as defined in the
[[spec:DID-CORE]] specification. WHen doing that, the [[ref: DID Controller]]
might also remove an keys from the DIDDoc, and set the top level `controller`
item to `""` to prevent further updates to the DID.

Alternatively, the file `didlog.txt` **MAY**  be removed or made
no longer publicly available due to any other means.

### DID Method Processes

The [DID Method Operations](#did-method-operations) reference several processes
that are executed during DIDDoc generation and DID resolution verification. Each
of those processes is specified in the following sections.

#### did:tdw DID Method Parameters

Entries in the `did:tdw` [[ref: DID Log]] file contain as the 4th item in the
array a JSON dictionary that define the DID processing parameters being used by the [[ref: DID Controller]] when
publishing that and subsequent DID Entries. Correspondingly, a DID Resolver must
use the same parameters when processing the [[ref: DID Log]] to resolve the DID.
The parameters dictionary **MUST** only include items defined in this specification.

::: example

An example of the parameters item in the first DID Log entry for a DID:

`{"method":"did:tdw:1","scid":"ke465curdwjzrrp5x5ut92te"}`

:::

The permitted parameter items and (where applicable) enumerated values for those
items are defined below.

- `method`: Defines the version of the [[ref: DID Log]] processing specification
  to use when processing a given DID's log file. As new versions of the
  processing specifications are defined, additional values will be added to the
  list of acceptable values.
  - This item **MUST** appear in the first [[ref: DID Log]] entry.
  - This item **MAY** appear in later [[ref: DID Log]] entries to indicate that
    the processing rules for that and later entries have been changed to a
    different version.
  - Acceptable values for this specification are:
    - `did:tdw:1`: Requires that the rules defined in this specification be used
      in processing the log.
- `scid`: The value of the [[ref: SCID]] for this DID.
  - This item **MUST** appear in the first [[ref: DID log entry]].
- `hash`: The hashing algorithm to use when executing hashes.
  - By default, the value is initialized to `sha256`.
  - Acceptable values:
    - `sha256`: Use the `SHA-256` algorithm from [[spec:rfc4634]].
- `pre-rotation`: A boolean value indicating that subsequent keys added to the DIDDoc (after this version) **MUST** have their hash included in a `nextKeys` parameters item.
  - The value is initialized to `false` until the item is included in an [[ref: DID log entry]].
  - Once the value is set to `true` in a [[ref: DID log entry]] it **MUST NOT** be set to `false` in a subsequent entry.
- `nextKeys`: An array of strings that are hashes of future keys to be added to the DIDDoc.
  - The process for generating the hashes is defined in the [Pre-Rotation Key Hash Generation and Validation](#pre-rotation-key-hash-generation-and-validation) section of this specification.
  - If the parameter `pre-rotation` has been set to `true`, all keys added to a version of the DIDDoc after version 1 **MUST** have a corresponding hash listed in the `nextKeys` items from a previous [[ref: DID log entries]].
  - See the section of this specification [Using Pre-Rotation Keys](#using-pre-rotation-keys) for non-normative guidance in using pre-rotation keys.

#### SCID Generation and Validation

To generate the required [[ref: SCID]] for a `did:tdw` DID, the DID Controller **MUST** execute the following function:

 `left(base32_lower(hash(JCS(initial DIDDoc with placeholders))), 24)`

Where:

1. The `initial DIDDoc with placeholders` is the initial DID Doc defined by the [[ref: DID Controller]] with the placeholder `{SCID}` put everywhere the [[ref: SCID]] will be used in the resolved version 1 DIDDoc. At minimum, the `{SCID}` **MUST** appear in the top level `id` item of the DIDDoc. It **MAY** occur elsewhere in the DIDDoc.
2. `JCS` is an implementation of the [[ref: JSON Canonicalization Scheme]] ([[spec:rfc8785]]). Its output is a canonicalized representation of its input.
3. `hash` is either [sha256] or an alternative hash algorithm defined in the `hash` item in the [[ref: parameters]]. Its output is the hash of its input.
4. `base32_lower` as defined by the [[ref: base32_lower]] function. Its output is the lower case of the Base32 encoded string of its input.
5. `left` extracts the defined number of characters (in this case, `24`) from the string input.

To validate the [[ref: SCID]] of a `did:tdw` DID being resolved, the resolver **MUST** execute the following process:

1. Extract from the [[ref: parameters]] in the first [[ref: DID log entry]] for the DID the `scid` item's value.
2. Extract from the first [[ref: DID log entry]] the `value` item's value, which is the initial DIDDoc.
3. Treat the `value`s value as a string and do a text replacement of the `scid` from the first step with `{SCID}`. This results in the `initial DIDDoc with placeholders` data needed for the next step.
4. Execute the function defined above to generate the `calulatedSCID`.
5. Verify that the `scid` value extracted from the [[ref: DID log entry]] from step 1 matches the `calulatedSCID` in step 5.

#### Entry Hash Generation and Validation

The `entryHash` is the first item in each [[ref: DID log entry]] and is a hash calculate across the entry, excluding the [[ref: Data Integrity]] proof.

To generate the required hash for a `did:tdw` DID entry, the DID Controller **MUST** execute the following process:

1. Make the value of the `entryHash` for this entry to the `entryHash` of the previous entry. For the first entry in the log, set the value of `entryHash` to the [[ref: SCID]] for the DID.
2. Create the full entry JSON array with elements `entryHash`, `versionId`, `versionTime`, and `didDocVersion` (which is either a `value` or `patch`). See an example below.
3. Calculate the hash string as `base32_lower(hash(JCS(entry)))`, where:
   1. `JCS` is an implementation of the [[ref: JSON Canonicalization Scheme]] ([[spec:rfc8785]]). Its output is a canonicalized representation of its input.
   2. `hash` is either [sha256] or an alternative hash algorithm defined in the `hash` item in the [[ref: parameters]]. Its output is the hash of its input JCS content.
   3. `base32_lower` as defined by the [[ref: base32_lower]] function. Its output is the lower case of the Base32 encoded string of the input hash.
4. Replace the `entryHash` value in the entry with the calculated value from step 3.

Example of a [[DID log entry]] that is processed in step 3 to produce a hash. As this is a first entry in a DID Log, the `entryHash` is the SCID of the DID.

```json
["ke465curdwjzrrp5x5ut92te",1,"2024-04-03T03:47:51Z",{"method":"did:tdw:1","scid":"ke465curdwjzrrp5x5ut92te"},{"value":{"@context":["https://www.w3.org/ns/did/v1","https://w3id.org/security/multikey/v1"],"id":"did:tdw:example.com:ke465curdwjzrrp5x5ut92te","controller":"did:tdw:example.com:ke465curdwjzrrp5x5ut92te","authentication":["did:tdw:example.com:ke465curdwjzrrp5x5ut92te#FFhXVfsx"],"assertionMethod":["did:tdw:example.com:ke465curdwjzrrp5x5ut92te#CPixwJ8x"],"verificationMethod":[{"id":"did:tdw:example.com:ke465curdwjzrrp5x5ut92te#FFhXVfsx","controller":"did:tdw:example.com:ke465curdwjzrrp5x5ut92te","type":"Multikey","publicKeyMultibase":"z6MkkXKMSiE7mXvGcR2KUpeJXwT7MPXZSBC6HZw9FFhXVfsx"},{"id":"did:tdw:example.com:ke465curdwjzrrp5x5ut92te#CPixwJ8x","controller":"did:tdw:example.com:ke465curdwjzrrp5x5ut92te","type":"Multikey","publicKeyMultibase":"z6Mkg8FdKNRt4NLXm5YSUZVGWzK8vvS3DJByxAqHCPixwJ8x"}]}}]
```

Resulting entry hash: `xkuu1nwynw5ymfv4f1np2xbmg21k4vn1rrvg3ngpdmx482c2ce20`

To verify the `entryHash` for a `did:tdw` DID entry, a DID Resolver **MUST** execute the following process:

1. Extract the first item in the [[ref: DID log entry]] as the `entryHash`
2. Remove the [[ref: Data Integrity]] proof (5th item) from the entry array.
3. Set the first value of the entry to the `entryHash` of the previous entry. If this is the first entry in the log, set the value to the [[ref: SCID]] for the DID.
4. Calculate the hash string as `base32_lower(hash(JCS(entry)))`, where:
   1. `JCS` is an implementation of the [[ref: JSON Canonicalization Scheme]] ([[spec:rfc8785]]). Its output is a canonicalized representation of its input.
   2. `hash` is either [sha256] or an alternative hash algorithm defined in the `hash` item in the [[ref: parameters]]. Its output is the hash of its input JCS content.
   3. `base32_lower` as defined by the [[ref: base32_lower]] function. Its output is the lower case of the Base32 encoded string of the input hash.
5. Verify that the calculated value from Step 4 matches the extracted value from Step 1.

#### Authorized Keys

Each entry in the [[ref: DID Log]] MUST include a [[ref: Data Integrity]] proof signed by a key **authorized** to control (create, update, deactivate) the DID. For `did:tdw`, the following defines the process for collecting the authorized keys.

1. Retrieve the DIDDoc in which the set of authorized controller DIDs is found. For the first version (`1`) of the DID, that is the first (and only) DIDDoc. For all subsequent versions of the DID, the **previous** DIDDoc version is used.
2. From the DIDDoc, the top-level `controller` item is retrieved to create a (possibly empty) array of controller DIDs from the DIDDoc.
   1. If the list of controller DIDs is empty, the DID being signed is added to the array.
3. For each DID in the list, the set of `authentication` key type references are collected from within the DIDDoc.
   1. If there are no `authentication` key type references, the `verificationMethod` key references are collected.
   2. If the controller DID is for an **external** DID, the key references **MUST** be present in the DIDDoc being processed.

The controller of the DID **MUST** use a key from the resulting key references to sign the [[ref: DID Log]] entry.

A resolver of the DID **MUST** verify that the key used for signing the [[ref: DID Log]] entry is in the list of authorized DID key references, and **MUST** verify the proof.


::: note https://github.com/decentralized-identity/presentation-exchange/issues/119

- The following is some non-normative background on the process listed above:
   - [[spec: DID-CORE]] is not clear (at least to the authors of this specification) on what key types define those authorized to update a DID.
   - The requirement to have the key reference for external DIDs (not the controlled DID) copied into the DIDDoc is to prevent an implementation from having to resolve external DIDs (that could use any [[ref: DID Method]]) during the resolution of a DID. This *might* be too restrictive and could be changed in an update to this specification. For example, it might be reasonable to require that external DIDs of certain [[ref: DID Methods]] (such as `did:tdw` or `did:web`) be resolved as part of resolving the controlled DID.
   - In a future version of the specification, the authors would like to require support for [[ref: verifiableConditions]] key types, to enable [[ref: multi-sig]] DID control support, such as requiring "N of M" signatures must be in a proof for it to be valid.

:::

#### Generating and Applying a JSON Patch

Each time a new `did:tdw` version is created, the [[ref: DID Controller]]
**MAY** generate a [[ref: JSON Patch]] to concisely define the changes in the
DIDDoc from the previous version. A [[ref: DID log entry]] that uses [[ref: JSON Patch]] has as its fourth item a JSON item `patch`, with its value the [[ref:
JSON Patch]]. A [[ref: DID Controller]] **MAY** set the fourth item of a [[ref: DID log entry]] to be the JSON item `value`, with its value the complete DIDDoc.
Typically (but not required), a [[ref: DID Controller]] will use `value` for the first [[ref: DID log entry]]
and `patch` for all subsequent entries.

To create the value for a `patch` item for a [[ref: DID log entry]], the [[ref: DID Controller]] **MUST**:

1. Have the fully resolved previous version of the DIDDoc.
2. The updated new version of the DIDDoc to be added.
3. Execute an implementation of [[ref: JSON Patch]] that takes the two DIDDocs as inputs (previous before, new after) and outputs the resulting [[ref: JSON Patch]] from before to after.
4. Set the fourth item of the [[ref: DID log entry]] to `{"patch": "<patch>"}`, removing all extraneous whitespace from the `<patch>`.

When processing a [[ref: DID log entry]] with a `patch` , a resolver **MUST**:

1. Have the fully resolved previous version of the DIDDoc.
2. Execute an implementation of [[ref: JSON Patch]] that takes the previous DIDDoc and the patch as inputs, and outputs the resulting new version of the DIDDoc.

#### Publishing a Parallel `did:web` DID

Each time a `did:tdw` version is created, the [[ref: DID Controller]] **MAY** generate a corresponding `did:web` to publish along with the `did:tdw`. To do so, the [[ref: DID Controller]] **MUST**:

1. Start with the resolved DIDDoc from `did:tdw`.
2. Execute a text replacement across the DIDDoc of `did:tdw` to `did:web`.
3. Add to the DIDDoc `alsoKnownAs` array, the full `did:tdw` DID. If the `alsoKnownAs` array does not exist in the DIDDoc, it **MUST** be added.
4. Publish the resulting DIDDoc as the file `did.json` at the web location determined by the specified `did:web` DID to HTTP transformation.

Note that the [[ref: SCID]] remains in the `did:web` DID string.

The benefit of doing this is that resolvers that have not be updated to support `did:tdw` can continue to resolve the [[ref: DID Controller]]'s DIDs. `did:web` resolvers that are aware of `did:tdw` features can use
that knowledge, and the existence of the `alsoKnownAs` `did:tdw` data in the DIDDoc to get the verifiable history of the DID.

The risk of publishing the `did:web` in parallel with the `did:tdw` is that the added security and convenience of using `did:tdw` are lost.

#### Pre-Rotation Key Hash Generation and Validation

Pre-rotation is a term defining how a [[ref: DID Controller]] can commit to the
keys that will be added ("rotated to") in future versions of the DIDDoc. The
purpose of committing to future keys is that if the currently active keys are
compromised by an attacker, the attacker should not be able to rotate the
compromised keys to new ones only the attacker controls to take over the control
of the DID. The effectiveness of pre-rotation is based on the idea that an
attacker cannot compromised the future keys. See the non-normative section about
[Using Pre-Rotation Keys](#using-pre-rotation-keys) in the implementors guide
section of this specification.

As described in the [parameters](#did-generation-and-validation-parameters)
section of this specification, a [[ref: DID Controller]] **MAY** define that
`pre-rotation` is active for the DID. When that is the case, all additions of
new keys in future versions of the DIDDoc **MUST** have their hash in one or
more of the `nextKeys` arrays of previous [[ref: DID log entry]] parameters.

To create a hash to be included in the nextKeys array, the [[ref: DID Controller]] **MUST** execute out the following process:

1. Generate a new key pair.
2. Create the JSON dict [Verification Material](https://www.w3.org/TR/did-core/#verification-material), defined in the [[spec:DID-CORE]], for the new key. An example of such an entry is defined below.
3. Calculate the hash string as `base32_lower(hash(JCS(verificationMaterial)))`, where:
   1. `JCS` is an implementation of the [[ref: JSON Canonicalization Scheme]] ([[spec:rfc8785]]). Its output is a canonicalized representation of its input.
   2. `hash` is either [sha256] or an alternative hash algorithm defined in the `hash` item in the [[ref: parameters]]. Its output is the hash of its input JCS content.
   3. `base32_lower` as defined by the [[ref: base32_lower]] function. Its output is the lower case of the Base32 encoded string of the input hash.
4. Add the hash calculated in Step 3 to a [[ref: DID log entry]] `nextKeys` item in the parameters (4th item of the entry array).
5. The JSON dict from Step 2 can be inserted into a future version of the DIDDoc.

When processing a [[ref: DID log entry]] where the `pre-rotation` parameter is active , a resolver **MUST**:

1. When processing each [[ref: DID log entry]], after verifying a DIDDoc, add an optional array of `nextKeys` from the parameters into an array of hash strings.
   1. The collection of the `nextKeys` from the current entry must occur after the processing and verification of that entries` DIDDoc version so that a new key and its pre-rotation hash cannot be added in the same entry.
2. For all DIDDoc versions after versionId 1, detect when a new key [Verification Material](https://www.w3.org/TR/did-core/#verification-material) is added to a version of a DIDDoc. If so, for each new key:
   1. Extract the Verification Material JSON dict for the new key from the new DIDDoc.
   2. Calculate the hash string as `base32_lower(hash(JCS(verificationMaterial)))`, where:
      1. `JCS` is an implementation of the [[ref: JSON Canonicalization Scheme]] ([[spec:rfc8785]]). Its output is a canonicalized representation of its input.
      2. `hash` is either [sha256] or an alternative hash algorithm defined in the `hash` item in the [[ref: parameters]]. Its output is the hash of its input JCS content.
      3. `base32_lower` as defined by the [[ref: base32_lower]] function. Its output is the lower case of the Base32 encoded string of the input hash.
   3. Check to see if the hash string is listed in te collected array of `nextKeys`.
      1. If so, the new key is verified.
      2. If not, the verification process failed.

### DID URL Resolution

The `did:tdw` DID Method embraces the power and usefulness of DID URLs, along with the semantic simplicity
of using them in a web-based DID method. Specifically, a `did:tdw` implementation
**MUST**:

- Resolve the `/whois` DID URL path using a [[spec:LINKED-VP]] service, whether or not it exists in the `did:tdw` DIDDoc, returning a `Verifiable Presentation`, if published by the [[ref: DID Controller]], found at the web location `whois.vp` beside where the `didlog.txt` file is found.
  - For example, `did:tdw:{SCID}.example.com/whois` returns the verifiable presentation `https://{SCID}.example.com/.well-known/whois.vp`
- Resolve any`did:tdw` DID URL using a [[spec:DID-CORE]] `relativeRef` DID paraemeters, whether or not a supporting service exists in the `did:tdw` DIDDoc, returning the file, if published by the [[ref: DID Controller]], found at the web location relative to where the `didlog.txt` file is found.
  - For example, `did:tdw:{SCID}.example.com/governance/issuers.vc` returns the file `https://{SCID}.example.com/.well-known/governance/issuer.vc`

In both cases, a [[ref: DID Controller]] **MAY** define services in the DIDDoc that override the default services that **MUST** be resolved by the `did:tdw` DID Method.

The sections below formalize the services that exist by default in `did:tdw` and how a [[ref: DID Controller]] can override them.

#### whois LinkedVP Service

The `#whois` service enables those that receive a `did:tdw` DID to retrieve and
verify a [[xref:VCDM,VCDM Presentation]] (and embedded
[[xref:VCDM,VCDM Credential]]s) the [[ref: DID Controller]] has decided to
publish about itself. The intention is that anyone interested in a particular
`did:tdw` DID can resolve the a `<did>/whois` DID URL, and if returned, if it
contains any useful (to the resolver) Verifiable Credentials that might help in
learning more about who is the controller of the DID and if they should be
trusted. It is up to the [[ref: DID Controller]] to decide to publish a `whois.vp`
verifiable presentation and if so, which verifiable credentials to put into the
verifiable presentation.

`did:tdw` DIDs **automatically** supports a `#whois` service endpoint with the
following definition based on the [[xref:LINKED-VP,Linked VP Specification]], with the `serviceEndpoint`
matching the `did:tdw` DID-to-HTTPS DIDDoc transformation and `didlog.txt`
changed to `whois.vp`.

```json
{
   "@context": "https://identity.foundation/linked-vp/contexts/v1",
   "id": "#whois",
   "type": "LinkedVerifiablePresentation",
   "serviceEndpoint": "https://example.com/dids/<scid>/whois.json"
}
```

A [[ref: DID Controller]] **MAY** explicitly add to their DIDDoc a `did:tdw` service with the
`"id": "#whois"`. Such an entry **MUST** override the implicit `service` above.

To resolve the DID URL `<did:tdw DID>/whois`, the resolver **MUST**:

1. Resolve the given `did:tdw` DID by retrieving, processing, and verifying the [[ref: DID log]] for the `did:tdw` as defined in this specification.
2. Find the DIDDoc `service` with the `id` `#whois`, if any, or use the implicit service (above).
3. Resolve the `serviceEndpoint` URL, if possible, and return the document found.
   1. If the `serviceEndpoint` URL can't be resolved by the resolver (such as if the URL protocol is not supported by the resolver), the error `Error XXX: YYY` **MUST** be returned.
   2. If the file at the defined `serviceEndpoint` is not found, return `Error 404: Not Found` **MUST** be returned.

##### The `whois` Use Case

This section is informative.

The following is a use case for the `whois` capability. Consider an example of the `did:tdw` controller being an educational institution that issues "degree" verifiable credentials to its graduate students. A graduate from the school submits as part of their job application to a company a [[ref: Verifiable Presentation]] derived from the verifiable credential they received from the school. The company receiving the presentation can verify the cryptography of the presentation, but can they trust the the usefulness of a degree from the school that issued the verifiable credential? If the school issued the verifiable credential using its `did:tdw` DID, the company can resolve the DID. It can also resolve the DID's `/whois` DID URL Path where it might find VCs from issuers it trusts with the `did:tdw` DID as the subject. For example:

- A verifiable credential issued by the Legal Entity Registrar for the jurisdiction in which the school is headquartered.
  - Since the company knows about the Legal Entity Registrar, they can automate this lookup to get more information about the school from the verifiable credential -- its legal name, when it was registered, contact information, etc.
- A verifiable credential issued by the "Association of Colleges and Universities" for the jurisdiction of the school.
  - Perhaps the company does not know about the Association for that jurisdiction. The company can repeat the `whois` resolution process for the issuer of _that_ credential. The company might (for example), resolve and verify the `did:tdw` DID for the Association, and then resolve the `/whois` DID URL to find a verifiable credential issued by the government of the jurisdiction. The company recognizes and trusts that government's authority, and so can decide to recognize and trust the Association.
- A verifiable credential issued by US News magazine about the school's placement on the [US News Rankings of Colleges and Universities].

Such checks can all be done with a handful of HTTPS requests and the processing of the DIDs and verifiable presentations. The result is an efficient, verifiable, credential-based, decentralized, multi-domain trust registry.

[US News Rankings of Colleges and Universities]: https://www.usnews.com/education/best-global-universities

#### DID URL Path Resolution Service

The automatic resolution of `did:tdw` DID URL paths follows the [[spec:DID-CORE]] `relativeRef` specification, as follows:

- a DID path, such as example 2 in [section 3.2 DID URL Syntax] gives the example: `did:example:123456/resume.pdf`
- In turn, that can be treated as the following, as shown in example 8 in the same section: `did:example:123456?service=files&relativeRef=/resume.pdf`
- The `#files` service defined below then defines the `serviceEndpoint` for the `relativeRef`.
  - For `did:tdw`, that service is implicitly defined, with the
    `serviceEndpoint` matching the `did:tdw` DID-to-HTTPS DIDDoc transformation
    and `didlog.txt` replaced by the DID URL Path.

Thus, the implicit service for DID `did:tdw:example.com:dids:<scid>` is:

```json
{
   "id": "#files",
   "type": "relativeRef",
   "serviceEndpoint": "https://example.com/dids/<scid>"
}
```

A [[ref: DID Controller]] **MAY** explicitly add to their DIDDoc a service with the
`"id": "#files"`. Such an entry **MUST** override the implicit `service` defined above.

To resolve the DID URL `<did:tdw DID>/path/to/file`, the resolver **MUST**:

1. Resolve the given `did:tdw` DID by retrieving, processing, and verifying the [[ref: DID log]] for the `did:tdw` as defined in this specification.
2. Find the DIDDoc `service` with the `id` `#files`, if any, or use the implicit service (above).
3. Resolve the `serviceEndpoint` URL with the DID URL Path appended, if possible, and return the document found at that location.
   1. If the `serviceEndpoint` URL can't be resolved by the resolver (such as if the URL protocol is not supported by the resolver), the error `Error XXX: YYY` **MUST** be returned.
   2. If the file at the path appended to the defined `serviceEndpoint` is not found, the error `Error 404: Not Found` **MUST** be returned.
