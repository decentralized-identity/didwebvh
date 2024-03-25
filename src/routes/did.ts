import { verifyDocument } from "../method";
import {readdirSync} from 'node:fs';

export const getLatestDIDDoc = async ({params: {id}, set}: {params: {id: string;}; set: any;}) => {
  console.log(`Resolving ${id}...`);
  let currentDoc: any;
  try {
    currentDoc = await Bun.file(`./out/${id}/did.json`).json();
    const didLog = await Bun.file(`./out/${id}/log.txt`).text();
    // console.log(didLog)
    // const logLine: string = '[{"op":"replace","path":"/proof/proofValue","value":"z128ss1..."}]';
    const logEntries: DIDOperation[][] = didLog.split('\n').map(l => JSON.parse(l));
    const {verified, errors, latest} = await verifyDocument(currentDoc, logEntries);
    if (!verified) {
      set.status = 500;
      return {errors}
    }
    return latest
  } catch (e) {
    console.error(e)
    return currentDoc
  }
}