const KEY = "mybrary.skipPageGenie";
const ARRIVE = "mybrary.arriveGenie";
export const ARRIVE_GENIE_EVENT = "mybrary-arrive-genie";

export function markSkipPageGenie() {
  try {
    sessionStorage.setItem(KEY, "1");
  } catch {
    /* ignore */
  }
}

export function takeSkipPageGenie() {
  try {
    if (sessionStorage.getItem(KEY) !== "1") return false;
    sessionStorage.removeItem(KEY);
    return true;
  } catch {
    return false;
  }
}

/** Play the landing genie once. Same-page login also dispatches; logout only stores. */
export function markArriveGenie(dispatch = true) {
  try {
    sessionStorage.setItem(ARRIVE, "1");
  } catch {
    /* ignore */
  }
  if (dispatch) window.dispatchEvent(new Event(ARRIVE_GENIE_EVENT));
}

export function takeArriveGenie() {
  try {
    if (sessionStorage.getItem(ARRIVE) !== "1") return false;
    sessionStorage.removeItem(ARRIVE);
    return true;
  } catch {
    return false;
  }
}
