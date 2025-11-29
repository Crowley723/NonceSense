import { createHelia } from 'helia';
import { unixfs } from '@helia/unixfs';
import type { Helia } from 'helia';
import type { UnixFS } from '@helia/unixfs';

let heliaInstance: Helia | null = null;
let fsInstance: UnixFS | null = null;

// Initialize Helia in local-only mode (no network)
export async function initHelia(): Promise<{ helia: Helia; fs: UnixFS }> {
  if (heliaInstance && fsInstance) {
    return { helia: heliaInstance, fs: fsInstance };
  }

  // Create Helia node for local storage only (no P2P networking)
  heliaInstance = await createHelia({
    start: false  // Don't start libp2p networking
  });

  fsInstance = unixfs(heliaInstance);

  return { helia: heliaInstance, fs: fsInstance };
}

  // Cleanup when done
  export async function stopHelia() {
    if (heliaInstance) {
      await heliaInstance.stop();
      heliaInstance = null;
      fsInstance = null;
    }
  }

