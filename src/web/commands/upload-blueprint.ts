import vscode from 'vscode';
import JSZip from 'jszip';

function zip(filename: string, contents: string) {
  const jszip = JSZip();
  return jszip.file(filename, contents);
}

export function uploadBlueprint() {
  const manifest = vscode.workspace.findFiles('manifest.yml').then((uris) => {
    // assuming there is only one manifest file # TODO: handle multiple files
    const uri = uris[0];
    // find lua file defined in manifest at .communication_module.lua_file # TODO: handle multiple files
  });
}