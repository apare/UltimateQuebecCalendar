export function encodeParams(...params: any[]) {
  return params.map(value => JSON.stringify(value)).join(",");
}
