import chalk from "chalk";
import { genKeys } from "./keys"
import { createSCID, createDID, updateDIDDoc } from "./method"
import fs from 'node:fs';
console.log(chalk.blue(`Starting Flow...\n\n`))

console.log(chalk.yellow(`Generating Keys...\n`))

// let VMs = [
//   {
//     type: 'authentication',
//     publicKeyMultibase: 'z6MkpM2PEcqPZgGW5RUc3bB7iNUd9XD9BgoSRu8y8QJqnPFF',
//     secretKeyMultibase: 'zrv4TX25xCGYTKg17dPHL4zbLLWmFoSdDeoxR9mkgoBwkASLbWFcz4VXVVc3mhdaKMWne8QmEzZehA3mGNPFBpeTRCV'
//   },
//   {
//     type: 'assertionMethod',
//     publicKeyMultibase: 'z6MksudZk7NtBD9Tn2kMCAX68LmQCWiTsVnWJrUPmQiQDj7U',
//     secretKeyMultibase: 'zrv4TX25xCGYTKg17dPHL4zbLLWmFoSdDeoxR9mkgoBwkASLbWFcz4VXVVc3mhdaKMWne8QmEzZehA3mGNPFBpeTRCV'
//   }
// ];
let VMs = await genKeys();

console.log(VMs, '\n')

console.log(chalk.yellow(`Creating DID...\n`))

let {did, doc, patch} = await createDID({VMs});
const id = did.split(':').at(-1)
try {
  fs.mkdirSync(`./output/${id}`);
} catch(e) {

}

fs.writeFileSync(`./output/${id}.log.txt`, JSON.stringify(patch));
fs.writeFileSync(`./output/${id}/did.1.json`, JSON.stringify(doc, null, 2));

console.log(chalk.green(`${did}\n`))

let i = 2;
while(i < 21) {
  VMs = await genKeys();
  const authKey = VMs?.find(vm => vm.type === 'authentication');
  
  const {doc: doc2, patch} = await updateDIDDoc({currentDoc: doc, newVMs: VMs, authKey: authKey!})
  doc = doc2;
  // console.log(doc2);
  fs.appendFileSync(`./output/${id}.log.txt`, '\n' + JSON.stringify(patch));
  fs.writeFileSync(`./output/${id}/did.${i}.json`, JSON.stringify(doc2, null, 2));
  i++;
}
// const scid = await createSCID(doc)
// console.log(scid, '\n')
