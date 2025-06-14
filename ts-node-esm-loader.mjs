// ts-node-esm-loader.mjs
import { resolve as resolveTs } from "ts-node/esm";
import * as tsConfigPaths from "tsconfig-paths";

export { resolve, load, transformSource } from "ts-node/esm";

const { absoluteBaseUrl, paths } = tsConfigPaths.loadConfig();
const matchPath = tsConfigPaths.createMatchPath(absoluteBaseUrl, paths);

export function resolve(specifier, context, defaultResolve) {
  const mappedSpecifier = matchPath(specifier);
  if (mappedSpecifier) {
    return resolveTs(mappedSpecifier, context, defaultResolve);
  }
  return resolveTs(specifier, context, defaultResolve);
}
