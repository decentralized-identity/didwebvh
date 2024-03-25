interface DIDDoc {
  id?: string;
  controller?: string | string[];
  alsoKnownAs?: string[];
  authentication?: string[];
  assertionMethod?: string[];
  keyAgreement?: string[];
  capabilityInvocation?: string[];
  capabilityDelegation?: string[];
  verificationMethod?: VerificationMethod[];
  service?: ServiceEndpoint[];
}

interface DIDOperation {
  op: string;
  path: string;
  value: any;
}

type DIDLogHeader = [
  logFormat: string,
  baseProtocol: string,
  scid: string,
  extensions: any
];
type DIDLogEntry = [
  logEntryHash: string,
  versionId: number,
  timestamp: string,
  patch: DIDOperation[],
  proof: any
];
type DIDLog = (DIDLogHeader | DIDLogEntry)[];

interface ServiceEndpoint {
  id?: string;
  type: string | string[];
  serviceEndpoint?: string | string[] | any;
}

interface VerificationMethod {
  id?: string;
  type: string;
  controller?: string;
  publicKeyJWK?: any;
  publicKeyMultibase?: string;
  secretKeyMultibase?: string;
  use?: string;
}

interface CreateDIDInterface {
  controller?: string;
  VMs?: VerificationMethod[];
  domains?: string[];
}

interface SignDIDDocInterface {
  document: any;
  proof: any;
  verificationMethod: VerificationMethod
}

interface UpdateDIDInterface {
  log: DIDLog;
  authKey: VerificationMethod;
  newVMs?: VerificationMethod[];
  newServices?: ServiceEndpoint[];
}
