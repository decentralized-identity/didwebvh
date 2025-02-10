## `did:webvh` AnonCreds Method Specification

### Overview

The `did:webvh` AnonCreds Method defines how AnonCreds objects ([[ref: Schemas]], [[ref: CredDefs]], [[ref: RevRegDefs]], and [[ref: RevRegEntries]]) are registered (published, written) by a [[ref: DID Controller]] using a `did:webvh` DID, and how others can resolve and verify those objects. The method makes use of [[ref: Attested Resources]], resources (objects, files) that are generated with a deterministic ID, attested to by the [[ref: DID Controller]], and published at a resolvable web location -- typically (but not necessarily) to the same web server as the [[ref: DID Controller]]'s `did:webvh` DID Log. The next section of the specification focuses on the publication and resolution of the AnonCreds objects.

The specification of an [[ref: Attested Resource]] is found [later in this specification](#attested-resources) and may later be extracted into a standalone specification.  For those unfamiliar with [[ref: Attested Resources]], here is a brief summary of their important attributes:

- [[ref: Attested Resources]] are a JSON structure that embed a complete resource (e.g., an AnonCred object, an encoded image, a [Bitstring Status List](https://www.w3.org/TR/vc-bitstring-status-list/), an [OCA Bundle](https://bcgov.github.io/aries-oca-bundles/), or any other resource published by the [[ref: DID Controller]]), plus metadata about the resource.
  - Note that a `did:webvh` using [[ref: DID Controller]] does not have to publish resources as [[ref: Attested Resources]]. It is just a usefully verifiable data model.
- The identifier from an Attested Resource is resolvable and contains a deterministic hash of the resource, allowing a resolver to verify that the content of the identified resource has not been altered.
- The Attested Resource includes a [[ref: Data Integrity]] proof signed by the [[ref: DID Controller]] of the Attested Resource JSON (the resource, and metadata).
- A `did:webvh` [[ref: Attested Resource]] is typically found at a relative path on the DID's web server. However, the DID's DIDDoc **MAY** use a DID `service` ([[spec:DID-CORE]]) to indicate the resources are based on a different URI.

### AnonCreds Objects as Attested Resources

Each `didwebvh` rooted AnonCreds object is the resource in an [[ref: Attested Resource]] published to the `did:webvh`. The identifier for each resource consists of three parts -- `<did>/path/to/resource/<hash>`, as follows:

- `<did>`: The `did:webvh` DID.
- `/path/to/file`: The location relative a base URI of a DIDDoc service where the [[ref: Attested Resource]] is located. Unless explicitly overridden in the `did:webvh` DIDDoc, the base URI is defined by the [`did:webvh` DID-to-HTTP Transformation].
- `<hash>`: The deterministic hash of the [[ref: Attested Resource]] (based on this [generation algorithm](#creation-and-publishing)).

[`did:webvh` DID-to-HTTP Transformation]: https://identity.foundation/didwebvh/#the-did-to-https-transformation

Each `did:webvh` AnonCreds object is created by an AnonCreds verifiable credential Issuer, used to generate an [[ref: Attested Resource]], and published. Generating the [[ref: Attested Resource]] produces the object's identifier, and that identifier is in turn embedded into other objects (such as issued verifiable credentials) available to parties (Holders, Verifiers) that need to resolve the object.

The following sections define how each AnonCreds object type is published as an [[ref: Attested Resource]].

#### AnonCreds Schema

An [[ref: AnonCreds Schema]] is the resource embedded in an [[ref: Attested Resource]]. The resulting [[ref: schema]] identifier is placed into an Issuer's [[ref: AnonCreds CredDef]] based on the [[ref: Schema]]. Holders and Verifiers resolve the [[ref: schema]] identifier retrieved from a resolved [[ref: AnonCreds CredDef]].  The `resourceType` **MUST** be `anonCredsSchema`. The `resourceName` **SHOULD** be the `name` of the [[ref: Schema]].

The following is an example [[ref: AnonCreds Schema]] [[ref: Attested Resource]], with the identifier: `did:webvh:QmdhkLDvMUxSmf8LweLPergW5refqjL1S1YKpBihwvmXs6:id.anoncreds.vc:demo:8d2bebfe-6492-4915-b53c-4c3bf2c9711a/resources/zQmSPbRK7h8SCQKMXyNvtHZuSQnqL6yCCQ8UMe2Rfa4ucP9`

```json
{
  "@context": [
    "https://w3id.org/security/data-integrity/v2"
  ],
  "type": [
    "AttestedResource"
  ],
  "id": "did:webvh:QmdhkLDvMUxSmf8LweLPergW5refqjL1S1YKpBihwvmXs6:id.anoncreds.vc:demo:8d2bebfe-6492-4915-b53c-4c3bf2c9711a/resources/zQmSPbRK7h8SCQKMXyNvtHZuSQnqL6yCCQ8UMe2Rfa4ucP9",
  "content": {
    "issuerId": "did:webvh:QmdhkLDvMUxSmf8LweLPergW5refqjL1S1YKpBihwvmXs6:id.anoncreds.vc:demo:8d2bebfe-6492-4915-b53c-4c3bf2c9711a",
    "attrNames": [
      "attributeClaim",
      "predicateClaim"
    ],
    "name": "Demo Credential",
    "version": "1.0"
  },
  "metadata": {
    "resourceId": "zQmSPbRK7h8SCQKMXyNvtHZuSQnqL6yCCQ8UMe2Rfa4ucP9",
    "resourceType": "anonCredsSchema",
    "resourceName": "Demo Credential"
  },
  "proof": {
    "type": "DataIntegrityProof",
    "cryptosuite": "eddsa-jcs-2022",
    "proofPurpose": "assertionMethod",
    "proofValue": "z5ZTaBaz8pQz2Ne5S2aNAJW2K41eZmbXNqiyhNK3ejXiobAjVpYbKN3NLPVj9bXeYJdkA8Tfw7hbE5kTr52QxGzjK",
    "verificationMethod": "did:webvh:QmdhkLDvMUxSmf8LweLPergW5refqjL1S1YKpBihwvmXs6:id.anoncreds.vc:demo:8d2bebfe-6492-4915-b53c-4c3bf2c9711a#key-01"
  }
}
```

#### AnonCreds CredDef

An [[ref: AnonCreds CredDef]] is the resource embedded in an [[ref: Attested Resource]]. The resulting [[ref: CredDef]] identifier is placed in the verifiable credentials issued by that Issuer. Holders retrieve the [[ref: CredDef]] identifier embedded in an AnonCreds verifiable credential and place the [[ref: CredDef]] identifier into verifiable presentations sent to Verifiers. Verifiers resolve the [[ref: CredDef]] identifier in the presentation to resolve the [[ref: CredDef]]. The `resourceType` **MUST** be `anonCredsCredDef`. The `resourceName` **SHOULD** be the `tag` of the [[ref: CredDef]].

The following is an example [[ref: AnonCreds CredDef]] [[ref: Attested Resource]] (with long values truncated with ellipses), with the identifier: `did:webvh:QmdhkLDvMUxSmf8LweLPergW5refqjL1S1YKpBihwvmXs6:id.anoncreds.vc:demo:8d2bebfe-6492-4915-b53c-4c3bf2c9711a/resources/zQma3iMYNvMzNNxPsj9cW1cHhN3R1cb3QNMmqhrvhtEhoQe`

```json
{
  "@context": [
    "https://w3id.org/security/data-integrity/v2"
  ],
  "type": [
    "AttestedResource"
  ],
  "id": "did:webvh:QmdhkLDvMUxSmf8LweLPergW5refqjL1S1YKpBihwvmXs6:id.anoncreds.vc:demo:8d2bebfe-6492-4915-b53c-4c3bf2c9711a/resources/zQma3iMYNvMzNNxPsj9cW1cHhN3R1cb3QNMmqhrvhtEhoQe",
  "content": {
    "issuerId": "did:webvh:QmdhkLDvMUxSmf8LweLPergW5refqjL1S1YKpBihwvmXs6:id.anoncreds.vc:demo:8d2bebfe-6492-4915-b53c-4c3bf2c9711a",
    "schemaId": "did:webvh:QmdhkLDvMUxSmf8LweLPergW5refqjL1S1YKpBihwvmXs6:id.anoncreds.vc:demo:8d2bebfe-6492-4915-b53c-4c3bf2c9711a/resources/zQmSPbRK7h8SCQKMXyNvtHZuSQnqL6yCCQ8UMe2Rfa4ucP9",
    "type": "CL",
    "tag": "Demo Credential",
    "value": {
      "primary": {
        "n": "10477...",
        "s": "95653...",
        "r": {
          "predicateclaim": "66593...",
          "attributeclaim": "16362...",
          "master_secret": "99918..."
        },
        "rctxt": "7455...",
        "z": "21627..."
      },
      "revocation": {
        "g": "1 210BA9...",
        "g_dash": "1 20817...",
        "h": "1 0230F...",
        "h0": "1 01772...",
        "h1": "1 203E6...8",
        "h2": "1 0956C...",
        "htilde": "1 1A344...",
        "h_cap": "1 19C5C...",
        "u": "1 1549...",
        "pk": "1 1921FF...",
        "y": "1 13DFD..."
      }
    }
  },
  "metadata": {
    "resourceId": "zQma3iMYNvMzNNxPsj9cW1cHhN3R1cb3QNMmqhrvhtEhoQe",
    "resourceType": "anonCredsCredDef",
    "resourceName": "Demo Credential"
  },
  "proof": {
    "type": "DataIntegrityProof",
    "cryptosuite": "eddsa-jcs-2022",
    "proofPurpose": "assertionMethod",
    "proofValue": "z3wmGc1ciG79i2w1WWKEczdPx5oSJb8txvL1sW8nR9zsmLPDtZt2YD5F7HwycYVRBGRMUjsDNENzZcLRypCxUfSnR",
    "verificationMethod": "did:webvh:QmdhkLDvMUxSmf8LweLPergW5refqjL1S1YKpBihwvmXs6:id.anoncreds.vc:demo:8d2bebfe-6492-4915-b53c-4c3bf2c9711a#key-01"
  }
}

```

#### AnonCreds RevRegDef

An [[ref: AnonCreds RevRegDef]] is the resource embedded in an [[ref: Attested Resource]]. The resulting [[ref: RevRegDef]] identifier is placed in the revocable verifiable credentials issued by its Issuer. Holders retrieve the [[ref: RevRegDef]] identifier embedded in an AnonCreds verifiable credential issued to them. Holders place the [[ref: RevRegDef]] identifier into verifiable presentations sent to Verifiers, who resolve the [[ref: RevRegDef]] identifier to retrieve the [[ref: RevRegDef]]. The `resourceType` **MUST** be `anonCredsRevocRegDef`. The `resourceName` **SHOULD** be the `tag` of the [[ref: RevRegDef]].

Unlike the other objects, the [[ref: RevRegDef]] [[ref: Attested Resource]] also contains required metadata in the [[ref: Attested Resource]] `links` field that is outside of the [[ref: RevRegDef]] itself. Notably, `links` contains the list of all [[ref: RevRegEntry]] timestamps and identifiers associated with the [[ref: RevRegDef]] (see the example below). Each time, a new [[ref: RevRegEntry]] is published by the Issuer, a new [[ref: RevRegDef]] must be created that adds the new [[ref: RevRegEntry]] to the `links` list. Since the `links` item is not part of the resource (the [[ref: RevRegDef]]) of the [[ref: AttestedResource]], the [[ref: RevRegDef]] identifier (and more specifically, the hash within the identifier) does not change. The [[ref: Data Integrity]] proof is updated, since the payload for the proof's signature includes the [[ref: RevRegEntry]] the resource and the metadata (including the `links` item).

The following is an example [[ref: AnonCreds RevRegDef]] [[ref: Attested Resource]] (with long values truncated with ellipses), with the identifier: `did:webvh:QmdhkLDvMUxSmf8LweLPergW5refqjL1S1YKpBihwvmXs6:id.anoncreds.vc:demo:8d2bebfe-6492-4915-b53c-4c3bf2c9711a/resources/zQmZBQmoX6dp6fwMVvR52VrQGz5yAyfMVAinoDAuVWrXMf4`. The [[ref: RevRegDef]] has four [[ref: RevRegEntries]].

```json
{
  "@context": [
    "https://w3id.org/security/data-integrity/v2"
  ],
  "type": [
    "AttestedResource"
  ],
  "id": "did:webvh:QmdhkLDvMUxSmf8LweLPergW5refqjL1S1YKpBihwvmXs6:id.anoncreds.vc:demo:8d2bebfe-6492-4915-b53c-4c3bf2c9711a/resources/zQmZBQmoX6dp6fwMVvR52VrQGz5yAyfMVAinoDAuVWrXMf4",
  "content": {
    "issuerId": "did:webvh:QmdhkLDvMUxSmf8LweLPergW5refqjL1S1YKpBihwvmXs6:id.anoncreds.vc:demo:8d2bebfe-6492-4915-b53c-4c3bf2c9711a",
    "revocDefType": "CL_ACCUM",
    "credDefId": "did:webvh:QmdhkLDvMUxSmf8LweLPergW5refqjL1S1YKpBihwvmXs6:id.anoncreds.vc:demo:8d2bebfe-6492-4915-b53c-4c3bf2c9711a/resources/zQma3iMYNvMzNNxPsj9cW1cHhN3R1cb3QNMmqhrvhtEhoQe",
    "tag": "0",
    "value": {
      "publicKeys": {
        "accumKey": {
          "z": "1 0EBD9..."
        }
      },
      "maxCredNum": 100,
      "tailsLocation": "https://tails.anoncreds.vc/hash/BKVA1GTg3FQC9yxQjzWWtXC3b5GXSVEem5a1rT2nSiC8",
      "tailsHash": "BKVA1GTg3FQC9yxQjzWWtXC3b5GXSVEem5a1rT2nSiC8"
    }
  },
  "metadata": {
    "resourceId": "zQmZBQmoX6dp6fwMVvR52VrQGz5yAyfMVAinoDAuVWrXMf4",
    "resourceType": "anonCredsRevocRegDef",
    "resourceName": "0"
  },
  "links": [
    {
      "id": "did:webvh:QmdhkLDvMUxSmf8LweLPergW5refqjL1S1YKpBihwvmXs6:id.anoncreds.vc:demo:8d2bebfe-6492-4915-b53c-4c3bf2c9711a/resources/zQmVsQB44FzYVcr6FnWnVTo2WtjrLyDTMTkJdExb7SFWQPm",
      "type": "anonCredsStatusList",
      "timestamp": 1739148281
    },
    {
      "id": "did:webvh:QmdhkLDvMUxSmf8LweLPergW5refqjL1S1YKpBihwvmXs6:id.anoncreds.vc:demo:8d2bebfe-6492-4915-b53c-4c3bf2c9711a/resources/zQmRhDPirwc4EPJmWkw61o5DFQKydmN11WNKCH18kBjC6ES",
      "type": "anonCredsStatusList",
      "timestamp": 1739150045
    },
    {
      "id": "did:webvh:QmdhkLDvMUxSmf8LweLPergW5refqjL1S1YKpBihwvmXs6:id.anoncreds.vc:demo:8d2bebfe-6492-4915-b53c-4c3bf2c9711a/resources/zQmZ1bZWBu9AHoydWPPkwvgvkAEUvunUvDHD14gY39TqWod",
      "type": "anonCredsStatusList",
      "timestamp": 1739150385
    },
    {
      "id": "did:webvh:QmdhkLDvMUxSmf8LweLPergW5refqjL1S1YKpBihwvmXs6:id.anoncreds.vc:demo:8d2bebfe-6492-4915-b53c-4c3bf2c9711a/resources/zQme7JEpPw2PjoReBhyWjLDbivAXUvFJ8NJCpTXBBzX1GJg",
      "type": "anonCredsStatusList",
      "timestamp": 1739212933
    }
  ],
  "proof": {
    "type": "DataIntegrityProof",
    "cryptosuite": "eddsa-jcs-2022",
    "proofPurpose": "assertionMethod",
    "proofValue": "z5eGXSAoDVN9NpX5R5dL6uvZ7wRCbvou4zFRUJo7xzUkP1mRVLC53mM86k34NuPDAAWzvH927K5RZN6VheBLz3z2F",
    "verificationMethod": "did:webvh:QmdhkLDvMUxSmf8LweLPergW5refqjL1S1YKpBihwvmXs6:id.anoncreds.vc:demo:8d2bebfe-6492-4915-b53c-4c3bf2c9711a#key-01"
  }
}

```

#### AnonCreds RevRegEntry

An [[ref: AnonCreds RevRegEntry]] is the resource embedded in an [[ref: Attested Resource]] -- an object that contains the full state of the revocation registry, the timestamp of the state, the associated accumulator, and the status of each verifiable credential in the [[ref: RevRegEntry]]. While a [[ref: RevRegEntry]] [[ref: Attested Resource]] is saved like other AnonCreds resources, the discovery of its identifier and the resolution of that identifier is more involved, as described below. The `resourceType` **MUST** be `anonCredsStatusList`. The `resourceName` **SHOULD** be the `tag` of the parent [[ref: RevRegDef]].

An Issuer adds the [[ref: RevRegEntry]] timestamp and identifier to the list of [[ref: RevRegEntry]] timestamp/identifier pairs listed in the [[ref: RevRegDef] [[ref: Attested Resource]]. A new version of the [[ref: Attested Resource]] for the object is generated and the old version is overwritten with the new. As noted earlier, since the [[ref: RevRegDef]] resource does not change, the identifier (and specifically, the hash embedded in the identifier) also does not change.

Holders, when generating a presentation using the revocable verifiable credential, retrieve the [[ref: RevRegDef]] identifier embedded in an AnonCreds verifiable credential issued to them. The Holder then finds the [[ref: RevRegEntry]] identifier associated with the appropriate timestamp (based on the requirements in the presentation request they received), and resolves the corresponding [[ref: RevRegEntry]] identifier. The Holder embeds the [[ref: RevRegDef]] identifier and the timestamp of the [[def: RevRegEntry]] used in generating the  verifiable presentation into the verifiable presentation and sends it to the Verifier.

The Verifier extracts the [[ref: RevRegDef]] identifier and `timestamp` from the verifiable presentation, resolves the identifier, finds within the [[ref: RevRegDef]] [[ref: Attested Resource]] the [[ref: RevRegEntry]] identifier associated with the `timestamp`. The Verifier then resolves the [[ref: RevRegEntry]] identifier, extracts the information necessary to verify the revocation part of the verifiable presentation.

The following is an example [[ref: AnonCreds RevRegDef]] [[ref: Attested Resource]], with the identifier: `did:webvh:QmdhkLDvMUxSmf8LweLPergW5refqjL1S1YKpBihwvmXs6:id.anoncreds.vc:demo:8d2bebfe-6492-4915-b53c-4c3bf2c9711a/resources/zQme7JEpPw2PjoReBhyWjLDbivAXUvFJ8NJCpTXBBzX1GJg`

```json
{
  "@context": [
    "https://w3id.org/security/data-integrity/v2"
  ],
  "type": [
    "AttestedResource"
  ],
  "id": "did:webvh:QmdhkLDvMUxSmf8LweLPergW5refqjL1S1YKpBihwvmXs6:id.anoncreds.vc:demo:8d2bebfe-6492-4915-b53c-4c3bf2c9711a/resources/zQme7JEpPw2PjoReBhyWjLDbivAXUvFJ8NJCpTXBBzX1GJg",
  "content": {
    "issuerId": "did:webvh:QmdhkLDvMUxSmf8LweLPergW5refqjL1S1YKpBihwvmXs6:id.anoncreds.vc:demo:8d2bebfe-6492-4915-b53c-4c3bf2c9711a",
    "revRegDefId": "did:webvh:QmdhkLDvMUxSmf8LweLPergW5refqjL1S1YKpBihwvmXs6:id.anoncreds.vc:demo:8d2bebfe-6492-4915-b53c-4c3bf2c9711a/resources/zQmZBQmoX6dp6fwMVvR52VrQGz5yAyfMVAinoDAuVWrXMf4",
    "revocationList": [0,1,1,1,...],
    "currentAccumulator": "21 12566...",
    "timestamp": 1739212933
  },
  "metadata": {
    "resourceId": "zQme7JEpPw2PjoReBhyWjLDbivAXUvFJ8NJCpTXBBzX1GJg",
    "resourceType": "anonCredsStatusList",
    "resourceName": "0"
  },
  "proof": {
    "type": "DataIntegrityProof",
    "cryptosuite": "eddsa-jcs-2022",
    "proofPurpose": "assertionMethod",
    "proofValue": "z5QkTd5MFQ952vmn6514ivt51vzY92kEa92kitX4ZZ9DYwVG9ZtsSx1FyC54KFYPJCgTUoRgy919A8rPsXVFhdffv",
    "verificationMethod": "did:webvh:QmdhkLDvMUxSmf8LweLPergW5refqjL1S1YKpBihwvmXs6:id.anoncreds.vc:demo:8d2bebfe-6492-4915-b53c-4c3bf2c9711a#key-01"
  }
}
```

### Attested Resources

[[ref: Attested Resources]] are JSON objects stored on a web server associated with a `did:webvh` with a deterministic identifier generated based on the hash of an embedded resource. The structure of the JSON object is defined (below), formalizing where an arbitrary resource is placed (`<resource>`). A [[ref: Data Integrity]] proof (an attestation, hence the `Attested Resource` name) is attached to the JSON object. The ID for the resource is derived from hashing the `<resource>`.

The key properties in the [[ref:  Attested Resource]] Data Model are:

- `id`
  - A DID URI value resolving to the attested resource. The right most path components of the URI MUST be the digestMultibase value of the `content` object.
- `content`
  - An arbitrary json object containing the subject of the attested resource, the `<resource>`. 
- `metadata`
  - An object borrowing attributes from the [DID linked resource metadata](https://w3c-ccg.github.io/DID-Linked-Resources/#examples). These should be used for dereferencing.
- `links`
  - An array of relate links objects. These object **MUST** contain an `id`, and a `type` and may contain other data specific to the `type` of the [[ref: Attested Resource]].

#### The Attested Resource Data Model

```json
{
    "@context": [
        "https://example.com/attested-resource/v1",
        "https://w3id.org/security/data-integrity/v2"
    ],
    "type": ["AttestedResource"],
    "id": "did:webvh:{SCID}:example.com/<path>/<to>/<resource>/{digestMultibase}",
    "content": {<resource>},
    "metadata": {
        "resourceId": "{digestMultibase}",
        "resourceType": "",
        "resourceName": ""
    },
    "links": [
        {
            "type": "RelatedLink",
            "id": "https://example.com",
            "digestMultibase": "{digestMultibase}"
        }
    ],
    "proof": {
        "type": "DataIntegrityProof",
        "cryptosuite": "eddsa-jcs-2022",
        "verificationMethod": "did:webvh:{SCID}:example.com#key-01"
    }
}
```

#### Calculating the Attested Resource `digestMultibase`

Both the [[ref: Attested Resource]] creator/publisher and resolver/verifier **MUST** calculate the `digestMultibase` using: `multibase(multihash(jcs(<resource>), 'sha-256'), 'b58btc')`. The calculation **MUST** apply these specifications:

- `jcs`: JSON Canonicalization Scheme, Specification: [[spec:rfc8785]] 
- `sha-256`: SHA-256 hashing, Specification: [[spec:rfc6234]]
- `b58btc`: Base58 (Bitcoin) Encoding Specification: [[spec:draft-msporny-base58-03]]
- `multihash`: MultiHash Specification: [[spec:multihash]]
- `multibase`: Multibase Specification: [[spec:multiformats]]

#### Data Integrity Proof Generation

The [[ref: Data Integrity]] proof ([[spec:VC-DATA-INTEGRITY]]) attached to [[ref: Attested Resources]] **MUST** use the `eddsa-jcs-2022` cryptosuite schema as referenced in [[spec:di-eddsa-v1.0]].

#### Creation and Publishing

The following process **MUST** be followed to create the an [[ref: Attested Resource]]. The input to this process is the resource -- a JSON item.

- Take the `<resource>` and calculate the `digestMultibase` value using the [`digestMultibase algorithm](#calculating-the-attested-resource-digestmultibase).
- Set the `metadata.ResourceId` to be the value of the calculated `digestMultibase`.
- Define the DID URL of the [[ref: Attested Resource]], which defines the resolvable location of the published resource. The DID **MUST** be the `did:webvh` of the Issuer and the last component of the DID URL **MUST** be the calculated `digestMultibase` value. Examples:
  - `did:webvh:{SCID}:example.com/` + `{digestMultibase}`
  - `did:webvh:{SCID}:example.com/path/to/resource/` + `{digestMultibase}`
  - `did:webvh:{SCID}:example.com:namespace:identifier/resources/` + `{digestMultibase}`
- Attach a [[ref: Data Integrity]] proof of the full object using a valid `verificationMethod` from the Issuer's DID as specified [here](#data-integrity-proof-generation).
- Upload the resulting [[ref: Attested Resource]] to a web server that **MUST** publish the resource at the location defined by its identifier.

#### Resolving Attested Resources

The following process **MUST** be followed to resolve an [[ref: Attested Resource]]. The input to this process is the `did:webvh` DID URL for the [[ref: Attested Resource]].

- Resolve the DID and validate the `did:webvh` DID Log.
- Do a DID URL to HTTP URL transformation on the [[ref: Attested Resource]] identifier using the the resolved DIDDoc. An example implicit `did:webvh` transformation:
  - `did:webvh:{SCID}:example.com/{digestMultibase}` to
  - `https://example.com/{digestMultibase}`
- Resolve the HTTP URL and retrieve the [[ref: Attested Resource]].
- The `digestMultibase` portion of the [[ref: Attested Resource]] identifier (the last component) **MUST** match the `metadata.resourceId` item in the resolved object.
- Verify the attached [[ref: Data Integrity]] proof, as specified [here](#data-integrity-proof-generation).
- Extract the `<resource>` from the [[ref: Attested Resource]] and calculate the `digestMultibase` value using the specified [`digestMultibase algorithm](#calculating-the-attested-resource-digestmultibase).
- The `digestMultibase` portion of the [[ref: Attested Resource]] identifier (the last component) **MUST** match the calculated `digestMultibase`.
- The `metadata.resourceType` **MUST** be the type of the expected resource.
- Process the `<resource>` as the expected object.
- If necessary, use the [[ref: Attested Resource]] object `links` JSON item in processing the result.

#### Attested Resource JSON-LD Context

The following is the [[spec:JSON-LD]] context file for an attested-resource object.

```json
{
    "@context": {
        "@protected": true,
        "id": "@id",
        "type": "@type",
        "undefined": "https://www.w3.org/ns/credentials/undefined-term#",
        "digestMultibase": {
          "@id": "https://w3id.org/security#digestMultibase",
          "@type": "https://w3id.org/security#multibase"
        },
        "mirrorLink": {
          "@id": "undefined:mirrorLink",
          "@type": "https://schema.org/URL"
        },
        "AttestedResource": {
            "@id": "undefined:AttestedResource",
            "@protected": true,
            "@context": {
                "content": {
                  "@id": "undefined:content",
                  "@type": "@id",
                  "@vocab": "undefined"
                },
                "metadata": {
                  "@id": "undefined:metadata",
                  "@type": "@id",
                  "@vocab": "undefined"
                },
                "links": {
                  "@id": "undefined:links",
                  "@type": "@id"
                }
            }
        }
    }
}
```
