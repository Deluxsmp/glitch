import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
export async function loadCommands(client) {
  const dir=path.resolve('bot/commands');
  for (const file of await fs.readdir(dir)) {
    if (!file.endsWith('.js')) continue;
    const mod=await import(pathToFileURL(path.join(dir,file)));
    if (mod.data && mod.execute) client.commands.set(mod.data.name,mod);
  }
}
