import { Req } from ".";

export const Command = {
  exit: () => {
    return Req.post<void>("/command/exit");
  }
};