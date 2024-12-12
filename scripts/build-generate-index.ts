import {
    appendFile,
    readdir,
    writeFile
} from 'node:fs/promises';
import {
    basename,
    extname,
    join
} from 'node:path/posix';

async function main(): Promise<void> {
    await generateIndex('src', '.d.ts');
    await generateIndex('src/obsidian', '.d.ts');
    await generateIndex('src/obsidian/augmentations', '.d.ts');
    await generateIndex('src/obsidian/implementations', '.ts');
    await appendFile('src/obsidian/implementations/index.ts', 'import \'../../index.js\';\n', 'utf-8');
}

async function generateIndex(dir: string, extension: string): Promise<void> {
    const files = (await readdir(dir, { recursive: true })).filter(file => {
        const fileExtension = getExtension(file);
        return fileExtension === extension && basename(file, extension) !== 'index';
    });
    const lines = files.map(file => generateExportLine(file));
    const prefix = '/* THIS IS A GENERATED/BUNDLED FILE BY BUILD SCRIPT */\n\n';
    const indexFile = join(dir, 'index' + extension);
    await writeFile(indexFile, prefix + lines.join('\n') + '\n', 'utf-8');
}

function generateExportLine(file: string): string {
    file = file.replace(/\\/g, '/');
    const jsFile = file.replace(getExtension(file), '.js');
    return `export * from './${jsFile}';`;
}

function getExtension(file: string): string {
    if (file.endsWith('.d.ts')) {
        return '.d.ts';
    }

    return extname(file);
}

await main();
