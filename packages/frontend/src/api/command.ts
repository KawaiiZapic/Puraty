export const Command = {
  exit: () => {
    return fetch("/command/exit", {
      method: "POST"
    });
  }
};