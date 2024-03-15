import { CreateDIDInterface, DIDDoc, SignDIDDocInterface, UpdateDIDDocInterface, VerificationMethod } from "./interfaces";
import { nanoid } from 'nanoid';
import { sha256 } from 'multiformats/hashes/sha2';
import { base58btc } from "multiformats/bases/base58";
import { CID } from 'multiformats/cid';
import * as raw from 'multiformats/codecs/raw';
import { canonicalize } from 'json-canonicalize';
import { signDocument } from "./data-integrity";

const PLACEHOLDER = "{{SCID}}";
const METHOD = "best";

export const createSCID = async (doc: any): Promise<{scid: string}> => {
  delete doc['proof'];
  const data = canonicalize(doc);
  const hash = await sha256.digest(Buffer.from(data));
  const cid = CID.create(1, raw.code, hash);
  return {scid: cid.toString(base58btc.encoder)};
}

export const createDID = async (options: CreateDIDInterface): Promise<{did: string, doc: any}> => {
  const {doc} = await createDIDDoc(options);
  const {scid} = await createSCID(doc);
  const doc2 = JSON.parse(JSON.stringify(doc).replaceAll(PLACEHOLDER, scid.slice(-24)));
  doc2.versionId = 1;
  doc2.previousHash = scid;
  const authKey = options.VMs?.find(vm => vm.type === 'authentication');
  const signedDoc = await signDocument(doc2, authKey!);

  return {did: doc2.id, doc: signedDoc}
}

export const createDIDDoc = async (options: CreateDIDInterface): Promise<{doc: DIDDoc}> => {
  const all = normalizeVMs(`did:${METHOD}:${PLACEHOLDER}`, options.VMs);
  return {
    doc: {
      "@context": [
        "https://www.w3.org/ns/did/v1",
        "https://w3id.org/security/multikey/v1",
        {"@vocab": "https://to-be-replaced-vocab.com#"},
        "https://w3id.org/security/data-integrity/v2"
      ],
      id: `did:${METHOD}:${PLACEHOLDER}`,
      ...all
    }
  };
}

export const updateDIDDoc = async (options: UpdateDIDDocInterface): Promise<{doc: any}> => {
  const {currentDoc, newVMs, newServices, authKey} = options;
  const all = normalizeVMs(currentDoc.id, newVMs);
  const {scid} = await createSCID(currentDoc);
  const newDoc = {
    '@context': currentDoc['@context'],
    id: currentDoc.id,
    ...all,
    versionId: currentDoc.versionId + 1,
    previousHash: scid
  }
  const signedDoc = await signDocument(newDoc, authKey);

  return {doc: signedDoc}
}

export const normalizeVMs = (did: string, verificationMethod: VerificationMethod[] | undefined) => {
  if (!verificationMethod) {
    return {};
  }
  const all: any = {};
  const authentication = verificationMethod
    ?.filter(vm => vm.type === 'authentication').map(vm => createVMID(did, vm))
  if (authentication && authentication?.length > 0) {
    all.authentication = authentication;
  }
  const assertionMethod = verificationMethod
    ?.filter(vm => vm.type === 'assertionMethod').map(vm => createVMID(did, vm))
  if (assertionMethod && assertionMethod?.length > 0) {
    all.assertionMethod = assertionMethod;
  }
  const keyAgreement = verificationMethod
    ?.filter(vm => vm.type === 'keyAgreement').map(vm => createVMID(did, vm));
  if (keyAgreement && keyAgreement?.length > 0) {
    all.keyAgreement = keyAgreement;
  }
  const capabilityDelegation = verificationMethod
    ?.filter(vm => vm.type === 'capabilityDelegation').map(vm => createVMID(did, vm));
  if (capabilityDelegation && capabilityDelegation?.length > 0) {
    all.capabilityDelegation = capabilityDelegation;
  }
  const capabilityInvocation = verificationMethod
  ?.filter(vm => vm.type === 'capabilityInvocation').map(vm => createVMID(did, vm));
  if (capabilityInvocation && capabilityInvocation?.length > 0) {
    all.capabilityInvocation = capabilityInvocation;
  }
  if(verificationMethod && verificationMethod.length > 0) {
    all.verificationMethod = verificationMethod?.map(vm => ({
      id: createVMID(did, vm),
      controller: did,
      type: 'Multikey',
      publicKeyMultibase: vm.publicKeyMultibase
    }))
  }
  return all;
}

export const createVMID = (did: string, vm: VerificationMethod) => {
  return `${did}#${vm.publicKeyMultibase?.slice(-8) || nanoid(8)}`
}