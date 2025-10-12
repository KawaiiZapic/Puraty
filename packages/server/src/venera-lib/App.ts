const UI = {
  showMessage: (message: string) => {
    throw new Error("Calling not implemented method showMessage(message: string): void");
  },
  showDialog: (title: string, content: string, actions: unknown) => {
    throw new Error("Calling not implemented method showDialog(title: string, content: string, actions: unknown): Promise<void>");
  },
  launchUrl: (url: string) => {
    throw new Error("Calling not implemented method launchUrl(url: string): void");
  },
  showLoading: (onCancel: unknown): number => {
    throw new Error("Calling not implemented method showLoading(onCancel: unknown): number");
  },
  cancelLoading: (id: number) => {
    throw new Error("Calling not implemented method cancelLoading(id: number): void");
  },

  showInputDialog: (title: string, validator: (input: string) => string | null | undefined, image: string | null): Promise<string | null> => {
    throw new Error("Calling not implemented method showInputDialog(): void");
  },

  showSelectDialog: (title: string, options: string[], initialIndex: number | null): Promise<number | null> => {
    throw new Error("Calling not implemented method showSelectDialog(): void");
  }
}

const APP = {
  get version(): string {
    return "1.2.0";
  },

  get locale(): string {
    return "zh_CN";
  },

  get platform(): string {
    return "kindle";
  }
}

export { APP };