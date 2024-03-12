# The fractal DID Method

## Intro

All DIDs within the fractal DID method are rotations from the following init DID Document:

```json
{
  "id": "did:fractal:init",
  "authentication": ["did:fractal:init#genesis"],
  "verificationMethod": [{
    "id": "did:fractal:init#genesis",
    "type": "Multikey",
    "controller": "did:fractal:init",
    "publicKeyMultibase": "z6MkwZsL8ZoYEuBA3bmc2tk4WogZsaJwoUNDoeM4T4xwehdY"
  }]
}
```

which has the following `secretKeyMultibase` value: `zrv1tP7p7zSQNcMzYKsJSmTAsANM4DdHdZPhPXzxZedtbLtu8Zjvy3BJtmMy2ysGoEEiPff4R9zDWivBq287UiBsTHQ`.

## DID Creation

1. To create a new DID insert a `nextRotation` property into the init DID document above with the value of the sha256 hash of the first `publicKeyMultibase` that will be used for rotation of the new DID.

    ```json
    {
      ...
      "nextRotation": "e7071d9191af602414d27a5d6e34b3c55f6fb370f7cf6c27c210aef416c3791d"
    }
    ```

1. Prepare and sign the `DataIntegrityProof` options using the `did:fractal:init#genesis` verification method with the secret key leaked above.

    ```json
    {
      "type": "DataIntegrityProof",
      "cryptosuite": "eddsa-jcs-2022",
      "created": "2024-04-01T19:23:24Z",
      "verificationMethod": "did:fractal:init#genesis",
      "proofPurpose": "assertionMethod",
      "proofValue": "z5C5b1uzYJN6pDR3aWgAqUMoSB1JY29epA74qyjaie9qh4okm9DZP6y77eTNq5NfYyMwNu9bpQQWUHKH5zAmEtszK"
    }
    ```

1. Store the resulting document.

1. Take the `proofValue` result and calculate the sha256 hash of it to find the self-certifying identifier for your DID. The new DID will be `did:fractal:<sha256(proof.proofValue)>`. For this example the DID is `did:fractal:6168960849b6be602886bd5e97ba35410e5a6de053e103f8755ea83ccb01aa44`.

## DID Updating

1. To make this new DID useful an update is required to introduce the desired keys and services. Generate the new DID items (e.g., `verificationMethod`, `authentication`, etc.) for each key and service to be published in the DIDDoc.

1. Create a new JSON document:

    ```json
    {
      "prev": "6168960849b6be602886bd5e97ba35410e5a6de053e103f8755ea83ccb01aa44", // previous version scid
      "nextRotation": "279e5da846ff1ffd17bf443f14fbc6a16ba58c886165e92d04b3e3addf26bc53", // hash of next rotation publicKeyMultibase
      "id": "did:fractal:6168960849b6be602886bd5e97ba35410e5a6de053e103f8755ea83ccb01aa44",
      "controller": "did:fractal:6168960849b6be602886bd5e97ba35410e5a6de053e103f8755ea83ccb01aa44", // should be the previous version scid
      "authentication": ["did:fractal:6168960849b6be602886bd5e97ba35410e5a6de053e103f8755ea83ccb01aa44#16c3791d"],
      "assertionMethod": ["did:fractal:6168960849b6be602886bd5e97ba35410e5a6de053e103f8755ea83ccb01aa44#z6Mko4t2y5Pbx96hbQP5p8JkJXA3z16nAq7VpUyZGcjhd9ra"],
      "verificationMethod": [{
        "id": "did:fractal:6168960849b6be602886bd5e97ba35410e5a6de053e103f8755ea83ccb01aa44#z6Mko4t2y5Pbx96hbQP5p8JkJXA3z16nAq7VpUyZGcjhd9ra",
        "type": "Multikey",
        "controller": "did:fractal:6168960849b6be602886bd5e97ba35410e5a6de053e103f8755ea83ccb01aa44",
        "publicKeyMultibase": "z6Mko4t2y5Pbx96hbQP5p8JkJXA3z16nAq7VpUyZGcjhd9ra"
      }, {
        "id": "did:fractal:6168960849b6be602886bd5e97ba35410e5a6de053e103f8755ea83ccb01aa44#16c3791d",
        "type": "Multikey",
        "controller": "did:fractal:6168960849b6be602886bd5e97ba35410e5a6de053e103f8755ea83ccb01aa44",
        "publicKeyMultibase": "z6MkuvAPEfFWekUrDrsjcvxmiH6TTSpKQ8LvLDSB5fJYJwLe"
      }]
    }
    ```

1. Prepare and sign the `DataIntegrityProof` options using the authentication key that matches the previous  `nextRotation` (ie `did:fractal:6168960849b6be602886bd5e97ba35410e5a6de053e103f8755ea83ccb01aa44#16c3791d`).

    ```json
    {
      "type": "DataIntegrityProof",
      "cryptosuite": "eddsa-jcs-2022",
      "created": "2024-04-01T19:23:24Z",
      "verificationMethod": "did:fractal:6168960849b6be602886bd5e97ba35410e5a6de053e103f8755ea83ccb01aa44#16c3791d",
      "proofPurpose": "assertionMethod",
      "proofValue": "z4oey5q2M3XKaxup3tmzN4DRFTLVqpLMweBrSxMY2xHX5XTYVQeVbY8nQAVHMrXFkXJpmEcqdoDwLWxaqA3Q1geV6"
    }
    ```

1. Store the resulting document.

1. Take the `proofValue` result and calculate the sha256 hash of it to find a new self-certifying identifier that will be used as the `controller` of the next rotation.

## DID Resolution

1. Retrieve the latest DID Document from the `alsoKnownAs` web location being resolved and verify the proof.

1. If the verification is successful, resolve the previous version using the `prev` property.

1. Ensure that the `nextRotation` was in fact used in the verified proof above.

1. Continue repeating this process until you retrieve and verify the initial DID document.

## DID Deactivation

1. To deactivate a DID perform an update operation that does not introduce a new `controller`.