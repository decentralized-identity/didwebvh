import chalk from "chalk";
import { genKeys } from "./keys"
import { createSCID, createDID, updateDIDDoc } from "./method"
import fs from 'node:fs';
console.log(chalk.blue(`Starting Flow...\n\n`))

console.log(chalk.yellow(`Generating Keys...\n`))

let VMs = await genKeys();

console.log(VMs, '\n')

console.log(chalk.yellow(`Creating DID...\n`))

const {did, doc} = await createDID({VMs});
fs.writeFileSync('./output/did.1.json', JSON.stringify(doc, null, 2));

console.log(chalk.green(`${did}\n`))

console.log(doc, '\n')

VMs = await genKeys();
const authKey = VMs?.find(vm => vm.type === 'authentication');

const {doc: doc2} = await updateDIDDoc({currentDoc: doc, newVMs: VMs, authKey: authKey!})
console.log(doc2);
fs.writeFileSync('./output/did.2.json', JSON.stringify(doc2, null, 2));
// const scid = await createSCID(doc)
// console.log(scid, '\n')
