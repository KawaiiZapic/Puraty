interface Kindle {
  appmgr: KindleAppManager;
}

interface KindleAppManager {
  start: (app: string) => void
}

declare global {
  var kindle: Kindle;
}

export {};