export type ChunkId = string

export class ChunkAssembler {
  assemble(_ids: ChunkId[]): { width: number; height: number; chunks: ChunkId[] } {
    return { width: 0, height: 0, chunks: [] }
  }
}
