import { createVerifyData, hash } from "./canon";
import { CreateDIDInterface, DIDDoc, VerificationMethod } from "./interfaces";
import { nanoid } from 'nanoid'

export const createSCID = async (doc: any): Promise<string> => {
  const proof = {
    '@context': [
      'https://w3id.org/security/data-integrity/v2'
    ],
    type: 'DataIntegrityProof',
    created: Date.now(),
  };
  const data = await createVerifyData({document: doc, proof});
  return hash(data).toString('hex');
}

export const createDID = async (options: CreateDIDInterface): Promise<{did: string, doc: any}> => {
  const did = `did:best:genesis`;
  // const hash = await selfHash(doc);
  const doc = await createDIDDoc({...options, controller: did});
  return {did, doc: {...doc, id: did}}
}

export const createDIDDoc = async (options: CreateDIDInterface): Promise<DIDDoc> => {
  let {controller} = options;
  if(!controller) {
    controller = `did:best:placeholder`;
  }
  const verificationMethod = options.VMs?.map(vm => ({
    id: `${controller}#${vm.publicKeyMultibase?.slice(-8) || nanoid(8)}`,
    controller,
    ...vm,
    type: 'Multikey'
  }));
  const all: any = {};
  const authentication = verificationMethod?.filter(vm => vm.type === 'authentication').map(vm => vm.id)
  if (authentication && authentication?.length > 0) {
    all.authentication = authentication;
  }
  const assertionMethod = verificationMethod?.filter(vm => vm.type === 'assertionMethod').map(vm => vm.id)
  if (assertionMethod && assertionMethod?.length > 0) {
    all.assertionMethod = assertionMethod;
  }
  const keyAgreement = verificationMethod?.filter(vm => vm.type === 'keyAgreement').map(vm => vm.id)
  if (keyAgreement && keyAgreement?.length > 0) {
    all.keyAgreement = keyAgreement;
  }
  const capabilityDelegation = verificationMethod?.filter(vm => vm.type === 'capabilityDelegation').map(vm => vm.id)
  if (capabilityDelegation && capabilityDelegation?.length > 0) {
    all.capabilityDelegation = capabilityDelegation;
  }
  const capabilityInvocation = verificationMethod?.filter(vm => vm.type === 'capabilityInvocation').map(vm => vm.id)
  if (capabilityInvocation && capabilityInvocation?.length > 0) {
    all.capabilityInvocation = capabilityInvocation;
  }

  return {
    "@context": [
      "https://www.w3.org/ns/did/v1",
      "https://w3id.org/security/multikey/v1"
    ],
    id: controller,
    ...all,
    verificationMethod,
  };
}

export const signDIDDoc = async () => {
  
}

export const publishDIDDoc = async () => {
  
}