import { CreateDIDInterface, DIDDoc, SignDIDDocInterface, UpdateDIDDocInterface, VerificationMethod } from "./interfaces";
import { nanoid } from 'nanoid';
import { sha256 } from 'multiformats/hashes/sha2';
import { base58btc } from "multiformats/bases/base58";
import { base32 } from 'multiformats/bases/base32';
import { CID } from 'multiformats/cid';
import * as raw from 'multiformats/codecs/raw';
import { canonicalize } from 'json-canonicalize';
import { signDocument } from "./data-integrity";
import * as jsonpatch from 'fast-json-patch/index.mjs';

const PLACEHOLDER = "{{SCID}}";
const METHOD = "best";

export const createSCID = async (cid: CID): Promise<{scid: string}> => {
  return {scid: `1${cid.toString(base32.encoder).slice(-24)}`};
}

export const deriveCID = async (doc: any): Promise<{cid: CID}> => {
  const data = canonicalize(doc);
  const hash = await sha256.digest(Buffer.from(data));
  return {cid: CID.create(1, 46593, hash)}
}

export const createDID = async (options: CreateDIDInterface): Promise<{did: string, doc: any, patch: any[]}> => {
  const {doc} = await createDIDDoc(options);
  const {cid} = await deriveCID(doc);
  const {scid} = await createSCID(cid);
  const doc2 = JSON.parse(JSON.stringify(doc).replaceAll(PLACEHOLDER, scid));
  doc2.versionId = 1;
  doc2.previousHash = cid.toString();
  const authKey = options.VMs?.find(vm => vm.type === 'authentication');
  const signedDoc = await signDocument(doc2, authKey!);
  const patch = jsonpatch.compare(doc, signedDoc)
  return {did: doc2.id, doc: signedDoc, patch}
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

export const updateDIDDoc = async (options: UpdateDIDDocInterface): Promise<{doc: any, patch: any[]}> => {
  const {currentDoc, newVMs, newServices, authKey} = options;
  const all = normalizeVMs(currentDoc.id, newVMs);
  const {cid} = await deriveCID(currentDoc);
  const newDoc = {
    '@context': currentDoc['@context'],
    id: currentDoc.id,
    ...all,
    versionId: currentDoc.versionId + 1,
    previousHash: cid.toString()
  }
  const signedDoc = await signDocument(newDoc, authKey);
  const patch = jsonpatch.compare(currentDoc, signedDoc);
  return {doc: signedDoc, patch}
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