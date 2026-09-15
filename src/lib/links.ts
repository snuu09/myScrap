import type { User } from "@supabase/supabase-js";
import { saveScrap } from "./scraps";
import type { Scrap } from "./types";

function uniqueIds(ids: string[]) {
  return [...new Set(ids.filter(Boolean))];
}

export function resolveLinked(item: Scrap, all: Scrap[]) {
  const ids = uniqueIds(item.linkedIds || []);
  const byId = new Map(all.map((row) => [row.id, row]));
  return ids.map((id) => byId.get(id)).filter((row): row is Scrap => Boolean(row));
}

/** Bidirectional link: both scraps store each other's id. */
export async function linkScraps(user: User, a: Scrap, b: Scrap) {
  if (a.id === b.id) return { a, b };
  const nextA: Scrap = {
    ...a,
    linkedIds: uniqueIds([...(a.linkedIds || []), b.id]),
    updatedAt: Date.now(),
  };
  const nextB: Scrap = {
    ...b,
    linkedIds: uniqueIds([...(b.linkedIds || []), a.id]),
    updatedAt: Date.now(),
  };
  await saveScrap(user, nextA);
  await saveScrap(user, nextB);
  return { a: nextA, b: nextB };
}

/** Remove the link from both sides when the peer still exists. */
export async function unlinkScrap(user: User, a: Scrap, bId: string, all: Scrap[]) {
  const nextA: Scrap = {
    ...a,
    linkedIds: uniqueIds((a.linkedIds || []).filter((id) => id !== bId)),
    updatedAt: Date.now(),
  };
  await saveScrap(user, nextA);
  const peer = all.find((row) => row.id === bId);
  let nextPeer: Scrap | null = null;
  if (peer) {
    nextPeer = {
      ...peer,
      linkedIds: uniqueIds((peer.linkedIds || []).filter((id) => id !== a.id)),
      updatedAt: Date.now(),
    };
    await saveScrap(user, nextPeer);
  }
  return { a: nextA, peer: nextPeer };
}

/** Clear this scrap from every peer's linkedIds before delete. */
export async function detachAllLinks(user: User, doomed: Scrap, all: Scrap[]) {
  const peers = resolveLinked(doomed, all);
  for (const peer of peers) {
    const cleaned: Scrap = {
      ...peer,
      linkedIds: uniqueIds((peer.linkedIds || []).filter((id) => id !== doomed.id)),
      updatedAt: Date.now(),
    };
    await saveScrap(user, cleaned);
  }
}
