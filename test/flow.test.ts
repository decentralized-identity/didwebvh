import { test, expect, beforeAll } from "bun:test";
import { createDID, LOG_FORMAT, PROTOCOL, resolveDID, updateDID } from "../src/method";
import fs from 'node:fs';
import { genKeys } from "../src/keys";

let docFile: string, logFile: string;
let did: string;
let availableKeys: VerificationMethod[];

const writeFilesToDisk = (_log: DIDLog, _doc: any, version: number) => {
  const id = _doc.id.split(':').at(-1);
  docFile = `./out/${id}/did.${version}.json`;
  logFile = `./out/${id}/log.${version}.txt`;
  fs.mkdirSync(`./out/${id}`, {recursive: true});
  fs.writeFileSync(docFile, JSON.stringify(_doc, null, 2));
  fs.writeFileSync(logFile, JSON.stringify(_log.shift()) + '\n');
  for (const entry of _log) {
    fs.appendFileSync(logFile, JSON.stringify(entry) + '\n');
  }
}

const readFilesFromDisk = (version: number) => {
  return {
    doc: JSON.parse(fs.readFileSync(docFile, 'utf8')),
    log: fs.readFileSync(logFile, 'utf8').trim().split('\n').map(l => JSON.parse(l))
  }
}

const readKeysFromDisk = () => {
  return {keys: fs.readFileSync('./in/keys.json', 'utf8')}
}

beforeAll(async () => {
  const {keys} = readKeysFromDisk();
  availableKeys = JSON.parse(keys);
});

test("Create DID", async () => {
  const {did: newDID, doc: newDoc, meta, log: newLog} = await createDID({VMs: [
    {type: 'authentication', ...availableKeys.shift()},
    {type: 'assertionMethod', ...availableKeys.shift()},
  ]});
  did = newDID;

  expect(newDID.split(':').length).toBe(3);
  expect(newDID.split(':').at(-1)?.length).toBe(24);
  expect(newDoc.verificationMethod.length).toBe(2);
  expect(newDoc.id).toBe(newDID);
  expect(newLog.length).toBe(2);
  
  // header
  expect(newLog[0][0]).toBe(LOG_FORMAT as any);
  expect(newLog[0][1]).toBe(PROTOCOL as any);
  expect(newLog[0][2]).toBe(newDID.split(':').at(-1) as any);

  // entry
  expect(newLog[1][1]).toBe(meta.versionId);
  expect(newLog[1][2]).toBe(meta.created);
  expect(Object.entries(newLog[1][3]).length).toBe(5);

  writeFilesToDisk(newLog, newDoc, 1);
});

test("Resolve DID", async () => {
  const {log: didLog, doc: any} = readFilesFromDisk(1);
  const {did: resolvedDID, doc: resolvedDoc, meta} = await resolveDID(didLog);
  
  expect(resolvedDID).toBe(resolvedDoc.id);
  expect(resolvedDoc.id).toBe(did);
  expect(meta.versionId).toBe(1);
});

test("Update DID", async () => {
  const newVMs = await genKeys();
  const {log: didLog, doc: any} = readFilesFromDisk(1);


  const {did: updatedDID, doc: updatedDoc, meta, log: updatedLog} =
    await updateDID({log: didLog, authKey: {type: 'authentication'}, newVMs: [
      {type: 'authentication', ...availableKeys.shift()},
      {type: 'assertionMethod', ...availableKeys.shift()},
    ]});
  expect(updatedDID).toBe(did);
  expect(meta.versionId).toBe(2);

  writeFilesToDisk(updatedLog, updatedDoc, 2);
});

test("Resolve DID", async () => {
  const {log: didLog, doc: any} = readFilesFromDisk(2);
  const {did: resolvedDID, doc: resolvedDoc, meta} = await resolveDID(didLog);
  
  expect(resolvedDID).toBe(resolvedDoc.id);
  expect(resolvedDoc.id).toBe(did);
  expect(meta.versionId).toBe(2);
});

test("Update DID again", async () => {
  const newVMs = await genKeys();
  const {log: didLog, doc: any} = readFilesFromDisk(2);

  const {did: updatedDID, doc: updatedDoc, meta, log: updatedLog} =
    await updateDID({log: didLog, authKey: {type: 'authentication'}, newVMs: [
      {type: 'authentication', ...availableKeys.shift()},
      {type: 'assertionMethod', ...availableKeys.shift()},
    ]});
  expect(updatedDID).toBe(did);
  expect(meta.versionId).toBe(3);

  writeFilesToDisk(updatedLog, updatedDoc, 3);
});

test("Resolve DID", async () => {
  const {log: didLog, doc: any} = readFilesFromDisk(3);
  const {did: resolvedDID, doc: resolvedDoc, meta} = await resolveDID(didLog);
  
  expect(resolvedDID).toBe(resolvedDoc.id);
  expect(resolvedDoc.id).toBe(did);
  expect(meta.versionId).toBe(3);
});

test("Update DID again again", async () => {
  const newVMs = await genKeys();
  const {log: didLog, doc: any} = readFilesFromDisk(3);

  const {did: updatedDID, doc: updatedDoc, meta, log: updatedLog} =
    await updateDID({log: didLog, authKey: {type: 'authentication'}, newVMs: [
      {type: 'authentication', ...availableKeys.shift()},
      {type: 'assertionMethod', ...availableKeys.shift()},
    ]});
  expect(updatedDID).toBe(did);
  expect(meta.versionId).toBe(4);

  writeFilesToDisk(updatedLog, updatedDoc, 4);
});

test("Resolve DID", async () => {
  const {log: didLog, doc: any} = readFilesFromDisk(4);
  const {did: resolvedDID, doc: resolvedDoc, meta} = await resolveDID(didLog);
  
  expect(resolvedDID).toBe(resolvedDoc.id);
  expect(resolvedDoc.id).toBe(did);
  expect(meta.versionId).toBe(4);
});