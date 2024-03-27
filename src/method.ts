import { documentLoader, jdl } from "./data-integrity";

import { nanoid } from 'nanoid';
import { sha256 } from 'multiformats/hashes/sha2';
import { base32 } from 'multiformats/bases/base32';
import { CID } from 'multiformats/cid';
import * as Ed25519Multikey from '@digitalbazaar/ed25519-multikey';
import {DataIntegrityProof} from '@digitalbazaar/data-integrity';
import { canonicalize } from 'json-canonicalize';
import * as jsonpatch from 'fast-json-patch/index.mjs';
import {cryptosuite as eddsa2022CryptoSuite} from
  '@digitalbazaar/eddsa-2022-cryptosuite';
import jsigs from 'jsonld-signatures';
import chalk from "chalk";
import { base58btc } from "multiformats/bases/base58";
import fs from 'node:fs';
import { clone } from "./utils";

export const PLACEHOLDER = "{{SCID}}";
export const METHOD = "tdw";
export const PROTOCOL = `did:${METHOD}:1`;
export const LOG_FORMAT = `history:1`;

const CONTEXT = ["https://www.w3.org/ns/did/v1", "https://w3id.org/security/multikey/v1"];
const {purposes: {AuthenticationProofPurpose}} = jsigs;

export const createSCID = async (logEntryHash: string): Promise<{scid: string}> => {
  return {scid: `${logEntryHash.slice(-24)}`};
}

export const createLogEntryHash = async (input: any): Promise<{logEntryHash: string}> => {
  const data = canonicalize(input);
  const hash = await sha256.digest(Buffer.from(data));
  return {logEntryHash: base58btc.encode(hash.digest)};
}

export const createDID = async (options: CreateDIDInterface): Promise<{did: string, doc: any, meta: any, log: DIDLog}> => {
  let {doc} = await createDIDDoc(options);

  const {logEntryHash} = await createLogEntryHash(doc);
  const {scid} = await createSCID(logEntryHash);
  const logHeader: DIDLogHeader = [LOG_FORMAT, PROTOCOL, scid, {}];
  doc = JSON.parse(JSON.stringify(doc).replaceAll(PLACEHOLDER, scid));
  const authKey = options.VMs?.find(vm => vm.type === 'authentication');
  if (!authKey) {
    throw new Error('Auth key not supplied')
  }
  const patch = jsonpatch.compare({}, doc);
  const signedDoc = await signDocument({...doc}, authKey, logEntryHash);
  const logEntry: DIDLogEntry = [
    logEntryHash,
    1,
    (new Date).toISOString().slice(0,-5)+'Z',
    patch,
    signedDoc.proof
  ];
  return {
    did: doc.id!,
    doc,
    meta: {
      versionId: 1,
      created: logEntry[2],
      updated: logEntry[2]
    },
    log: [
      logHeader,
      logEntry
    ]
  }
}

export const createDIDDoc = async (options: CreateDIDInterface): Promise<{doc: DIDDoc}> => {
  const {all} = normalizeVMs(`did:${METHOD}:${PLACEHOLDER}`, options.VMs);
  return {
    doc: {
      "@context": [
        "https://www.w3.org/ns/did/v1",
        "https://w3id.org/security/multikey/v1"
      ],
      id: `did:${METHOD}:${PLACEHOLDER}`,
      ...all
    }
  };
}

export const resolveDID = async (log: DIDLog): Promise<{did: string, doc: any, meta: any}> => {
  const resolutionLog = clone(log);
  const [logFormat, protocol, scid, extensions] = (resolutionLog as any).shift();
  if(logFormat !== LOG_FORMAT) {
    throw new Error(`'${logFormat}' log format unknown.`);
  }
  if(protocol !== PROTOCOL) {
    throw new Error(`'${protocol}' protocol unknown.`);
  }
  let versionId = 0;
  let doc: any = {};
  let did = '';
  let created = '';
  let updated = '';
  let previousLogEntryHash = '';
  for (const entry of resolutionLog) {
    // versionId
    if (entry[1] !== versionId + 1) {
      throw new Error(`versionId '${entry[1]}' in log doesn't match expected '${versionId}'.`);
    }
    versionId = entry[1];

    // created & updated
    if (entry[2]) {
      // TODO check timestamps make sense
    }
    updated = entry[2];
    if(versionId === 1) {
      created = entry[2];
    }

    // doc patches & proof
    const newDoc = jsonpatch.applyPatch(doc, entry[3], false, false).newDocument;
    if (versionId === 1) {
      did = newDoc.id;
      if (did.split(':').at(-1) !== scid) {
        throw new Error(`SCID '${scid}' not found in DID '${did}'`);
      }
      const {logEntryHash} = await createLogEntryHash(
        JSON.parse(JSON.stringify(newDoc).replaceAll(scid, PLACEHOLDER))
      );
      previousLogEntryHash = logEntryHash;
      if (!logEntryHash.includes(scid)) {
        throw new Error(`SCID '${scid}' not found in logEntryHash '${logEntryHash}'`);
      }
      const authKey = newDoc.verificationMethod.find((vm: VerificationMethod) => vm.id === entry[4].verificationMethod);
      const valid = isDocumentStateValid(authKey, {...newDoc, proof: entry[4]});
      if (!valid) {
        throw new Error(`version ${versionId} failed verification of the proof.`)
      }
    } else {
      const {logEntryHash} = await createLogEntryHash([previousLogEntryHash, entry[1], entry[2], entry[3]]);
      previousLogEntryHash = logEntryHash;
      if (logEntryHash !== entry[0]) {
        throw new Error(`Hash chain broken at '${versionId}'`);
      }
      const authKey = doc.verificationMethod.find((vm: VerificationMethod) => vm.id === entry[4].verificationMethod);
      const valid = isDocumentStateValid(authKey, {...newDoc, proof: entry[4]});
      if (!valid) {
        throw new Error(`version ${versionId} failed verification of the proof.`)
      }
    }
    doc = newDoc;
  }
  return {did, doc, meta: {versionId, created, updated, previousLogEntryHash}}
}

export const updateDID = async (options: UpdateDIDInterface): Promise<{did: string, doc: any, meta: any, log: DIDLog}> => {
  const {log, authKey, context, vms, services, alsoKnownAs} = options;
  let {did, doc, meta} = await resolveDID(log);
  const {all} = normalizeVMs(did, vms);
  const newDoc = {
    ...(context ? {'@context': Array.from(new Set([...context, ...CONTEXT]))} : {'@context': CONTEXT}),
    id: did,
    ...all,
    ...(services ? {service: services} : {}),
    ...(alsoKnownAs ? {alsoKnownAs} : {})
  }
  meta.versionId++;
  meta.updated = (new Date).toISOString().slice(0,-5)+'Z';
  const patch = jsonpatch.compare(doc, newDoc);
  const logEntry = [meta.previousLogEntryHash, meta.versionId, meta.updated, clone(patch)];
  const {logEntryHash} = await createLogEntryHash(logEntry);
  if(!authKey) {
    throw new Error(`No auth key`);
  }
  const signedDoc = await signDocument(newDoc, authKey, logEntryHash);
  return {
    did,
    doc: newDoc,
    meta: {
      versionId: meta.versionId,
      created: meta.created,
      updated: meta.updated,
      previousLogEntryHash: meta.previousLogEntryHash
    },
    log: [
      ...clone(log),
      [logEntryHash, meta.versionId, meta.updated, patch, signedDoc.proof]
    ]
  };
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
  return {all};
}

export const createVMID = (did: string, vm: VerificationMethod) => {
  return `${did}#${vm.publicKeyMultibase?.slice(-8) || nanoid(8)}`
}

export const signDocument = async (doc: any, vm: VerificationMethod, challenge: string) => {
  try {
    const keyPair = await Ed25519Multikey.from({
      '@context': 'https://w3id.org/security/multikey/v1',
      type: 'Multikey',
      controller: doc.id,
      id: createVMID(doc.id, vm),
      publicKeyMultibase: vm.publicKeyMultibase,
      secretKeyMultibase: vm.secretKeyMultibase
    });
    const suite = new DataIntegrityProof({
      signer: keyPair.signer(), cryptosuite: eddsa2022CryptoSuite
    });
    
    const signedDoc = await jsigs.sign(doc, {
      suite,
      purpose: new AuthenticationProofPurpose({challenge}),
      documentLoader
    });
    return signedDoc;
  } catch (e: any) {
    console.error(e.details)
    return null;
  }
}

export const isDocumentStateValid = async (authKey: VerificationMethod, doc: any): Promise<boolean> => {
  // TODO verify key is allowed to update
  jdl.addStatic(doc.id, doc);
  jdl.addStatic(doc.proof.verificationMethod, authKey);
  const docLoader = jdl.build();
  const {document: keyPairDoc} = await docLoader(authKey.id);
  const keyPair = await Ed25519Multikey.from(keyPairDoc);
  
  const suite = new DataIntegrityProof({
    verifier: keyPair.verifier(), cryptosuite: eddsa2022CryptoSuite
  });
  const {verified} = await jsigs.verify(doc, {
    suite,
    purpose: new AuthenticationProofPurpose({challenge: doc.proof.challenge}),
    documentLoader: docLoader
  });
  return verified;
}

// export const applyLogEntriesAndValidate = async (doc: any, logEntries: DIDOperation[][]): Promise<{latest: DIDDoc, errors: string[]}> => {
//   let errors = [];
//   let verifiedEntries = 0;
//   for (const entry of logEntries) {
//     for (const operation of entry) {
//       const originalDoc = JSON.parse(JSON.stringify(doc)); // Deep clone the document before modification for potential rollback
//       const result = jsonpatch.applyPatch(doc, [operation], true); // Apply operation
//       if (result.newDocument && await isDocumentStateValid(originalDoc, result.newDocument)) {
//         doc = result.newDocument; // Accept the new document if valid
//       } else {
//         errors.push(`Operation resulted in invalid document state: ${JSON.stringify(operation)}`)
//         doc = originalDoc; // Rollback to the original document
//       }
//     }
//     verifiedEntries++;
//   }
//   // if (doc.previousHash != previousHash) {
//   //   errors.push(`Document hash chain broken at versionId: ${doc.versionId}.`)
//   // }
//   console.log(`verified ${verifiedEntries} log entries`)
//   return { latest: doc, errors};
// }

// export const verifyDocument = async (doc: any, log: DIDOperation[][]) => {
//   const {latest, errors} = await applyLogEntriesAndValidate(doc, log);
//   // console.log(chalk.green(JSON.parse(latest)))
//   return {verified: errors.length === 0, errors, latest}
// }