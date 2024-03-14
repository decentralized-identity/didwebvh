export interface DIDDoc {
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

export interface ServiceEndpoint {
  id?: string;
  type: string | string[];
  serviceEndpoint?: string | string[] | any;
}

export interface VerificationMethod {
  id?: string;
  type: string;
  controller?: string;
  publicKeyJWK?: any;
  publicKeyMultibase?: string;
  secretKeyMultibase?: string;
  use?: string;
}

export interface CreateDIDInterface {
  controller?: string;
  VMs?: VerificationMethod[];
  domains?: string[];
}

export interface SignDIDDocInterface {
  document: any;
  proof: any;
  verificationMethod: VerificationMethod
}

export interface UpdateDIDDocInterface {
  currentDoc: any;
  newVMs?: VerificationMethod[];
  newServices?: ServiceEndpoint[];
  authKey: VerificationMethod
}
