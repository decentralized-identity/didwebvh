import { Elysia } from 'elysia'
import {readdirSync} from 'node:fs';
import { verifyDocument } from './src/data-integrity';

const getMaxVersionId = (max: number, name: string) => {
  const pattern = /\d+(?=.json)/;
  const match = name.match(pattern);
  if (match) {
    const num = parseInt(match[0], 10);
    return Math.max(max, num);
  }
  return max;
}

const getLatestDIDDoc = async ({params: {id}, set}: {params: {id: string;}; set: any;}) => {
  console.log(`Resolving ${id}...`);
  const dir = readdirSync(`./output/${id}`);
  let previousHash;
  let currentDoc;
  // const maxNumber = dir.reduce(getMaxVersionId, 0);
  let i = 1;
  while(true) {
    try {
      currentDoc = await Bun.file(`./output/${id}/did.${i}.json`).json();
      const {verified, errors, docHash} = await verifyDocument(currentDoc, previousHash);
      if (!verified) {
        set.status = 500;
        return {errors}
      }
      previousHash = docHash;
      i++;
    } catch (e) {
      return currentDoc;
    }
  }
}

const app = new Elysia()
	.get('/:id', ({params, set}) => getLatestDIDDoc({params, set}))
  .get('/:id/:version', ({params: {id, version}}) => {
    console.log(version)
  })
  .get('/:id/versions', ({params: {id}}) => {
    console.log('versions')
  })
	.listen(8000)

console.log(`🔍 Resolver is running at on port ${app.server?.port}...`)
