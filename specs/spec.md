# The new DID Method

## Intro

All DIDs within the new DID method use the following placeholder value:

Selected Placeholder: `did:new:init`

## DID Creation

1. Generate the DID items (e.g., `verificationMethod`, `authentication`, etc.) for each key and service to be published in the DIDDoc. Use the placeholder `did:new:init` value in place of the id. Include any desired pre-rotation key hashes as a `nextKey` value in the verification method item.

    ```json
    {
      "authentication": ["did:new:init#z6Mko4t2y5Pbx96hbQP5p8JkJXA3z16nAq7VpUyZGcjhd9ra"],
      "assertionMethod": ["did:new:init#z6Mko4t2y5Pbx96hbQP5p8JkJXA3z16nAq7VpUyZGcjhd9ra"],
      "verificationMethod": [{
        "id": "did:new:init#z6Mko4t2y5Pbx96hbQP5p8JkJXA3z16nAq7VpUyZGcjhd9ra",
        "type": "Multikey",
        "controller": "did:new:init",
        "nextKeyHash": "0df0e885e20a2cf44b8e71b45f2402818c51dad0855151895cecf8780dfceeed",
        "publicKeyMultibase": "z6Mko4t2y5Pbx96hbQP5p8JkJXA3z16nAq7VpUyZGcjhd9ra"
      }]
    }
    ```

1. Set the `id` and `controller` items as the placeholder value `did:new:init`.

    ```json
    {
      ...
      "id": "did:new:init",
      "controller": "did:new:init"
    }
    ```

1. Set the list of `alsoKnownAs` items, including the placholder value as desired.

    ```json
    {
      ...
      "alsoKnownAs": ["did:new:init:web:example.com", "did:new:init:web:example.ca"]
    }
    ```

1. Set the `versionId` to 0.

    ```json
    {
      ...
      "versionId": 0
    }
    ```

1. Set the `@context` value to the proper JSON-LD vocabulary URIs.

    ```json
    {
      "@context": [
        "https://www.w3.org/ns/did/v1",
        "https://w3id.org/security/multikey/v1"
      ]
    }
    ```

1. Prepare the `DataIntegrityProof` options using the placeholder reference to the `verificationMethod`.

    ```json
    {
      "type": "DataIntegrityProof",
      "cryptosuite": "eddsa-jcs-2022",
      "created": "2024-04-01T19:23:24Z",
      "verificationMethod": "did:new:init#z6Mko4t2y5Pbx96hbQP5p8JkJXA3z16nAq7VpUyZGcjhd9ra",
      "proofPurpose": "assertionMethod",
    }
    ```

1. Depending on the cryptosuite being used, calculate the `verifyData` accordingly (the data that is being signed). The hash of this value will become the self-certifying identifier. The `id` of this DID will be `did:new:<sha256(verifyData)>`.

1. Sign the `DataIntegrityProof`, and afterwards replace every instance of the placeholder string with the new `id` property (`did:new:<sha256(verifyData)>`).

1. Store the document in desired locations, according to the `alsoKnownAs` property created earlier.

## DID Updating

1. Copy the previously stored DID document and remove the `proof`.

1. Generate the new DID items (e.g., `verificationMethod`, `authentication`, etc.) for each key and service to be published in the DIDDoc, keeping in mind any keys with a `nextKey` property will require the appropriate key.

1. Increment the `versionId` by 1.

1. Create a new `DataIntegrityProof` and sign it using an `authentication` verification method from the previous DID document.

1. Store the document in desired locations, according to the `alsoKnownAs` property.

## DID Resolution

1. Retrieve the latest DID Document from the web location being resolved.

1. If you are looking at `versionId` 0 find the `id` property of the document and replace every instance of that string with the placeholder value `did:new:init`. Verify the `proof` and if the verification is successful you have your DID Document.

1. If the `versionId` is greater than 0, verify the `proof`.

1. Resolve the previous version and ensure any keys that had `nextKey` values are using those values in the previously verified DID Document.

1. Continue this process until you retrieve `versionId` 0 and successfully verify it. If the entire history is valid, the originally resolved DID Document from step 1 is your current DID Document.