import { CAREER_FORMAT, CAREER_VERSION, type CareerState } from "./types.ts";

export const saveCareer = (state: CareerState): string => JSON.stringify(state);

/** Reads a saved career; refuses files from another game or a newer version. */
export function loadCareer(text: string): CareerState {
  const data = JSON.parse(text) as Partial<CareerState>;
  if (data.format !== CAREER_FORMAT) throw new Error("Not an Online Manager save");
  /* No migration yet: a save from another version of the rules cannot be read. */
  if (data.version !== CAREER_VERSION) {
    throw new Error(`Save version ${data.version} does not match this game (${CAREER_VERSION})`);
  }
  return data as CareerState;
}
