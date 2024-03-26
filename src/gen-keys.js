import fs from 'node:fs';
import {generate as generateEd25519} from '@digitalbazaar/ed25519-multikey';

export const genKeys = async (count) => {
  let i = 0;
  const keys = [];
  while(i < count) {
    const {publicKeyMultibase, secretKeyMultibase} = await generateEd25519();
    keys.push({publicKeyMultibase, secretKeyMultibase});
    i++;
  }
  fs.writeFileSync('./in/keys.json', JSON.stringify(keys, null, 2))
}

await genKeys(100);