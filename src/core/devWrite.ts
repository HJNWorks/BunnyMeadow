export async function writeRepoFile(relativePath: string, contents: string): Promise<boolean> {
  if (!import.meta.env.DEV) {
    return false
  }
  try {
    const res = await fetch("/__bm/write", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: relativePath, contents }),
    })
    return res.ok
  } catch {
    return false
  }
}
