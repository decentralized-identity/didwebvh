import {generate as generateEd25519} from '@digitalbazaar/ed25519-multikey';

export const genKeys = async () => {
  const auth = await generateEd25519();
  const assertion = await generateEd25519();
  return [
    {
      type: 'authentication',
      publicKeyMultibase: auth.publicKeyMultibase,
      secretKeyMultibase: auth.secretKeyMultibase
    },
    {
      type: 'assertionMethod',
      publicKeyMultibase: assertion.publicKeyMultibase,
      secretKeyMultibase: auth.secretKeyMultibase
    }
  ]
}