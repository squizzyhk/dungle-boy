export function joinAssetUrl(base: string, path: string): string {
  return `${base.replace(/\/*$/, '/')}${path.replace(/^\/*/, '')}`
}

export function assetUrl(path: string): string {
  return joinAssetUrl(import.meta.env.BASE_URL, path)
}
