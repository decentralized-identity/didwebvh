import chalk from "chalk";
import { genKeys } from "./keys"
import { createSCID, createDID } from "./method"

console.log(chalk.blue(`Starting Flow...\n\n`))

console.log(chalk.yellow(`Generating Keys...\n`))

const VMs = await genKeys();

console.log(VMs, '\n')

console.log(chalk.yellow(`Creating DID...\n`))

const {did, doc} = await createDID({VMs});

console.log(chalk.green(`${did}\n`))

console.log(doc, '\n')

const scid = await createSCID(doc)
console.log(scid, '\n')
