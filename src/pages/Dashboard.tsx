import { useEffect, useRef, useState, type AnimationEvent, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, MoreHorizontal } from "lucide-react";
import { typeLabel } from "../i18n";
import { useAuth } from "../context/Auth";
import { usePrefs } from "../context/Prefs";
import { useT } from "../lib/useT";
import { PlanUsageBlock } from "../components/PlanUsageBlock";
import { GlassCluster } from "../components/GlassCluster";
import { aggregateStats } from "../lib/scrapFilters";
import { saveScrap } from "../lib/scraps";
import { loadTypeCatalog, mergeTypeNames, saveTypeCatalog } from "../lib/typeCatalog";
import { useDialog } from "../lib/dialog";
import { formatWhen } from "../lib/time";
import { prefersReducedMotion, sheetGenieClass, usePresence } from "../lib/presence";
import type { Scrap } from "../lib/types";

type Props = { scraps: Scrap[]; onScrapsChange: (next: Scrap[]) => void };

function RowMenu({
  open,
  label,
  onToggle,
  children,
}: {
  open: boolean;
  label: string;
  onToggle: () => void;
  children: ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);
  const presence = usePresence(open);

  useEffect(() => {
    if (!open) return;
    function onDoc(event: MouseEvent) {
      if (!root.current?.contains(event.target as Node)) onToggle();
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onToggle();
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onToggle]);

  return (
    <div className="dashboard-row-menu" ref={root}>
      <GlassCluster className="liquid-hit" label={label}>
        <button
          type="button"
          className="dashboard-row-menu-btn"
          aria-label={label}
          aria-expanded={open}
          aria-haspopup="menu"
          onClick={onToggle}
        >
          <MoreHorizontal className="size-4" strokeWidth={1.8} />
        </button>
      </GlassCluster>
      {presence.shown ? (
        <div
          className={"dashboard-row-menu-pop" + sheetGenieClass(presence.closing, "corner")}
          role="menu"
          onAnimationEnd={(event) => presence.onEnd(event, "sheet-genie-out")}
        >
          <GlassCluster className="dashboard-menu-cluster">{children}</GlassCluster>
        </div>
      ) : null}
    </div>
  );
}

function replaceTag(tags: string[], from: string, to: string) {
  const next: string[] = [];
  for (const tag of tags) {
    const value = tag === from ? to : tag;
    if (!value || next.includes(value)) continue;
    next.push(value);
  }
  return next;
}

export function Dashboard({ scraps, onScrapsChange }: Props) {
  const { lang } = usePrefs();
  const t = useT();
  const { user } = useAuth();
  const { alert, confirm } = useDialog();
  const navigate = useNavigate();
  const stats = aggregateStats(scraps);
  const recent = [...scraps].sort((a, b) => b.createdAt - a.createdAt).slice(0, 10);
  const [catalog, setCatalog] = useState<string[]>([]);
  const [editingTag, setEditingTag] = useState("");
  const [editingType, setEditingType] = useState("");
  const [tagDraft, setTagDraft] = useState("");
  const [typeDraft, setTypeDraft] = useState("");
  const [addingType, setAddingType] = useState(false);
  const [addClosing, setAddClosing] = useState(false);
  const [editClosing, setEditClosing] = useState(false);
  const [arrived, setArrived] = useState("");
  const [leaving, setLeaving] = useState<{ kind: "type" | "tag"; name: string } | null>(null);
  const [typesOpen, setTypesOpen] = useState(false);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [menu, setMenu] = useState("");
  const [busy, setBusy] = useState(false);
  const pendingEdit = useRef<(() => Promise<void>) | null>(null);
  const leaveJob = useRef<(() => Promise<void>) | null>(null);
  const leaveLock = useRef(false);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    void loadTypeCatalog(user).then((names) => {
      if (alive) setCatalog(names);
    });
    return () => {
      alive = false;
    };
  }, [user]);

  async function persistTag(from: string, to: string) {
    if (!user || busy) return;
    const changed = scraps.filter((item) => item.tags.includes(from));
    if (!changed.length) return;
    setBusy(true);
    const next = scraps.map((item) =>
      item.tags.includes(from) ? { ...item, tags: replaceTag(item.tags, from, to) } : item,
    );
    try {
      for (const item of next) {
        const prev = scraps.find((scrap) => scrap.id === item.id);
        if (!prev || prev.tags.join("\0") === item.tags.join("\0")) continue;
        await saveScrap(user, item);
      }
      onScrapsChange(next);
      setEditingTag("");
      setTagDraft("");
    } catch {
      await alert(t("syncError"));
      if (to) {
        setEditingTag(from);
        setTagDraft(to);
      }
    } finally {
      setBusy(false);
    }
  }

  async function removeTag(tag: string) {
    const ok = await confirm({ body: t("tagDeleteConfirm"), danger: true, confirmLabel: t("deleteTag") });
    if (!ok) return;
    beginLeave("tag", tag, () => persistTag(tag, ""));
  }

  const typeNames = mergeTypeNames(
    catalog,
    scraps.map((item) => item.type),
  );
  const unknownCount = scraps.filter((item) => item.type === "unknown").length;
  const typeRows = unknownCount ? [...typeNames, "unknown"] : typeNames;
  const shownTypes = typesOpen ? typeRows : typeRows.slice(0, 6);
  const shownTags = tagsOpen ? stats.byTag : stats.byTag.slice(0, 8);

  async function writeCatalog(names: string[]) {
    if (!user) return;
    setCatalog(names);
    await saveTypeCatalog(user, names);
  }

  async function renameType(from: string, to: string) {
    if (!user || busy) return;
    const nextName = to.trim();
    if (!from || !nextName || nextName === from) {
      setEditingType("");
      setTypeDraft("");
      return;
    }
    setBusy(true);
    const next = scraps.map((item) => (item.type === from ? { ...item, type: nextName } : item));
    try {
      for (const item of next) {
        if (item.type !== nextName || !scraps.some((scrap) => scrap.id === item.id && scrap.type === from)) continue;
        await saveScrap(user, item);
      }
      await writeCatalog(
        catalog.includes(from) ? catalog.map((name) => (name === from ? nextName : name)) : [...catalog, nextName],
      );
      onScrapsChange(next);
      setEditingType("");
      setTypeDraft("");
    } catch {
      await alert(t("syncError"));
      setEditingType(from);
      setTypeDraft(to);
    } finally {
      setBusy(false);
    }
  }

  async function removeType(name: string) {
    if (!user || busy) return;
    const count = scraps.filter((item) => item.type === name).length;
    const ok = await confirm({
      body: t(count ? "typeDeleteConfirm" : "typeDeleteEmptyConfirm"),
      danger: true,
      confirmLabel: t("deleteType"),
    });
    if (!ok) return;
    beginLeave("type", name, () => commitRemoveType(name));
  }

  async function commitRemoveType(name: string) {
    if (!user) return;
    const count = scraps.filter((item) => item.type === name).length;
    setBusy(true);
    const next = scraps.map((item) => (item.type === name ? { ...item, type: "unknown" } : item));
    try {
      if (count) {
        for (const item of next) {
          if (item.type !== "unknown" || !scraps.some((scrap) => scrap.id === item.id && scrap.type === name)) continue;
          await saveScrap(user, item);
        }
        onScrapsChange(next);
      }
      await writeCatalog(catalog.filter((row) => row !== name));
    } catch {
      await alert(t("syncError"));
    } finally {
      setBusy(false);
    }
  }

  async function addType(name: string) {
    if (!user || busy) return;
    const nextName = name.trim();
    if (!nextName || catalog.includes(nextName) || typeNames.includes(nextName)) {
      cancelAdd();
      return;
    }
    setBusy(true);
    try {
      await writeCatalog([...catalog, nextName]);
      setAddingType(false);
      setAddClosing(false);
      setTypeDraft("");
      setTypesOpen(true);
      setArrived(nextName);
    } catch {
      await alert(t("syncError"));
    } finally {
      setBusy(false);
    }
  }

  function cancelAdd() {
    if (prefersReducedMotion()) {
      setAddingType(false);
      setTypeDraft("");
      setAddClosing(false);
      return;
    }
    setAddClosing(true);
  }

  function finishAddClose(event?: AnimationEvent<HTMLFormElement>) {
    if (event && (event.target !== event.currentTarget || event.animationName !== "accordion-fold")) return;
    setAddingType(false);
    setTypeDraft("");
    setAddClosing(false);
  }

  function requestEditClose(job?: () => Promise<void>) {
    pendingEdit.current = job ?? null;
    if (prefersReducedMotion()) {
      finishEditClose();
      return;
    }
    setEditClosing(true);
  }

  function finishEditClose(event?: AnimationEvent<HTMLFormElement>) {
    if (event && (event.target !== event.currentTarget || event.animationName !== "accordion-fold")) return;
    const job = pendingEdit.current;
    pendingEdit.current = null;
    setEditClosing(false);
    setEditingType("");
    setEditingTag("");
    setTypeDraft("");
    setTagDraft("");
    if (job) void job();
  }

  function beginLeave(kind: "type" | "tag", name: string, job: () => Promise<void>) {
    if (prefersReducedMotion()) {
      void job();
      return;
    }
    leaveJob.current = job;
    leaveLock.current = false;
    setLeaving({ kind, name });
  }

  async function finishLeave(event?: AnimationEvent<HTMLLIElement>) {
    if (event && (event.target !== event.currentTarget || event.animationName !== "accordion-fold")) return;
    if (!leaving || leaveLock.current) return;
    leaveLock.current = true;
    const job = leaveJob.current;
    leaveJob.current = null;
    try {
      await job?.();
    } finally {
      setLeaving(null);
      leaveLock.current = false;
    }
  }

  useEffect(() => {
    if (!addClosing && !editClosing && !leaving) return;
    const id = window.setTimeout(() => {
      if (addClosing) finishAddClose();
      if (editClosing) finishEditClose();
      if (leaving) void finishLeave();
    }, 420);
    return () => window.clearTimeout(id);
  }, [addClosing, editClosing, leaving]);

  function rowClass(kind: "type" | "tag", name: string) {
    if (leaving?.kind === kind && leaving.name === name) return "dashboard-fold is-out";
    if (kind === "type" && arrived === name) return "dashboard-row-in";
    return "";
  }

  function onRowEnd(event: AnimationEvent<HTMLLIElement>, kind: "type" | "tag", name: string) {
    if (event.target !== event.currentTarget) return;
    if (event.animationName === "accordion-fold" && leaving?.kind === kind && leaving.name === name) {
      void finishLeave(event);
    }
    if (event.animationName === "accordion-unfold" && kind === "type" && arrived === name) setArrived("");
  }

  return (
    <div className="dashboard-door">
      <div className="dashboard-head">
        <h1 className="dashboard-title">{t("dashboardTitle")}</h1>
      </div>

      <section className="dashboard-panel" aria-label={t("planLabel")}>
        <p className="list-tools-label">{t("planLabel")}</p>
        <PlanUsageBlock planUpgradeHint={false} />
      </section>

      <section className="dashboard-panel" aria-label={t("statsByType")}>
        <p className="list-tools-label">{t("statsByType")}</p>
        {typeRows.length ? (
          <ul className="dashboard-manage-list">
            {shownTypes.map((type) =>
              editingType === type ? (
                <li key={type}>
                  <form
                    className={"dashboard-tag-edit dashboard-fold" + (editClosing ? " is-out" : "")}
                    onAnimationEnd={finishEditClose}
                    onSubmit={(e) => {
                      e.preventDefault();
                      const next = typeDraft.trim();
                      if (!next || next === type) requestEditClose();
                      else requestEditClose(() => renameType(type, next));
                    }}
                  >
                    <input
                      value={typeDraft}
                      onChange={(e) => setTypeDraft(e.target.value)}
                      className="dashboard-tag-input"
                      aria-label={t("renameType")}
                      disabled={busy || editClosing}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Escape") requestEditClose();
                      }}
                    />
                  </form>
                </li>
              ) : (
                <li
                  key={type}
                  className={"dashboard-manage-row " + rowClass("type", type)}
                  onAnimationEnd={(event) => onRowEnd(event, "type", type)}
                >
                  <button
                    type="button"
                    className="dashboard-manage-main"
                    onClick={() => navigate("/search?type=" + encodeURIComponent(type))}
                  >
                    <span>{typeLabel(lang, type)}</span>
                    <strong>{stats.byType.get(type) || 0}</strong>
                  </button>
                  <RowMenu
                    open={menu === "type:" + type}
                    label={t("rowMenu")}
                    onToggle={() => setMenu((current) => (current === "type:" + type ? "" : "type:" + type))}
                  >
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => navigate("/search?type=" + encodeURIComponent(type))}
                    >
                      {t("viewInSearch")}
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      disabled={busy}
                      onClick={() => {
                        setMenu("");
                        setEditClosing(false);
                        setEditingType(type);
                        setTypeDraft(type);
                      }}
                    >
                      {t("renameType")}
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      disabled={busy}
                      onClick={() => {
                        setMenu("");
                        void removeType(type);
                      }}
                    >
                      {t("deleteType")}
                    </button>
                  </RowMenu>
                </li>
              ),
            )}
          </ul>
        ) : (
          <div className="shelf-empty shelf-empty--compact">
            <p className="shelf-empty-title">—</p>
          </div>
        )}
        {typeRows.length > 6 ? (
          <GlassCluster className="liquid-hit liquid-hit--wide">
            <button
              type="button"
              className="dashboard-expand"
              aria-expanded={typesOpen}
              onClick={() => setTypesOpen((open) => !open)}
            >
              <ChevronDown className={"size-[18px]" + (typesOpen ? " is-open" : "")} strokeWidth={1.8} />
              <span className="sr-only">{t(typesOpen ? "tagsLess" : "tagsMore")}</span>
            </button>
          </GlassCluster>
        ) : null}
        {addingType ? (
          <form
            className={"dashboard-add-form dashboard-fold" + (addClosing ? " is-out" : "")}
            onAnimationEnd={finishAddClose}
            onSubmit={(e) => {
              e.preventDefault();
              void addType(typeDraft);
            }}
          >
            <input
              value={typeDraft}
              onChange={(e) => setTypeDraft(e.target.value)}
              className="dashboard-tag-input"
              aria-label={t("typeName")}
              placeholder={t("typeName")}
              disabled={busy || addClosing}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Escape") cancelAdd();
              }}
            />
            <button type="button" className="dashboard-add-cancel" disabled={busy || addClosing} onClick={cancelAdd}>
              {t("cancel")}
            </button>
          </form>
        ) : (
          <GlassCluster className="liquid-hit liquid-hit--wide">
            <button type="button" className="dashboard-add-type" disabled={busy} onClick={() => setAddingType(true)}>
              {t("addType")}
            </button>
          </GlassCluster>
        )}
      </section>

      <section className="dashboard-panel" aria-label={t("statsByTag")}>
        <p className="list-tools-label">{t("statsByTag")}</p>
        {stats.byTag.length ? (
          <ul className="dashboard-manage-list">
            {shownTags.map(([tag, count]) =>
              editingTag === tag ? (
                <li key={tag}>
                  <form
                    className={"dashboard-tag-edit dashboard-fold" + (editClosing ? " is-out" : "")}
                    onAnimationEnd={finishEditClose}
                    onSubmit={(e) => {
                      e.preventDefault();
                      const next = tagDraft.trim();
                      if (!next || next === tag) requestEditClose();
                      else requestEditClose(() => persistTag(tag, next));
                    }}
                  >
                    <input
                      value={tagDraft}
                      onChange={(e) => setTagDraft(e.target.value)}
                      className="dashboard-tag-input"
                      aria-label={t("renameTag")}
                      disabled={busy || editClosing}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Escape") requestEditClose();
                      }}
                    />
                  </form>
                </li>
              ) : (
                <li
                  key={tag}
                  className={"dashboard-manage-row " + rowClass("tag", tag)}
                  onAnimationEnd={(event) => onRowEnd(event, "tag", tag)}
                >
                  <button
                    type="button"
                    className="dashboard-manage-main"
                    onClick={() => navigate("/search?tag=" + encodeURIComponent(tag))}
                  >
                    <span>{tag}</span>
                    <strong>{count}</strong>
                  </button>
                  <RowMenu
                    open={menu === "tag:" + tag}
                    label={t("rowMenu")}
                    onToggle={() => setMenu((current) => (current === "tag:" + tag ? "" : "tag:" + tag))}
                  >
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => navigate("/search?tag=" + encodeURIComponent(tag))}
                    >
                      {t("viewInSearch")}
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      disabled={busy}
                      onClick={() => {
                        setMenu("");
                        setEditClosing(false);
                        setEditingTag(tag);
                        setTagDraft(tag);
                      }}
                    >
                      {t("renameTag")}
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      disabled={busy}
                      onClick={() => {
                        setMenu("");
                        void removeTag(tag);
                      }}
                    >
                      {t("deleteTag")}
                    </button>
                  </RowMenu>
                </li>
              ),
            )}
          </ul>
        ) : (
          <div className="shelf-empty shelf-empty--compact">
            <p className="shelf-empty-title">—</p>
          </div>
        )}
        {stats.byTag.length > 8 ? (
          <GlassCluster className="liquid-hit liquid-hit--wide">
            <button
              type="button"
              className="dashboard-expand"
              aria-expanded={tagsOpen}
              onClick={() => setTagsOpen((open) => !open)}
            >
              <ChevronDown className={"size-[18px]" + (tagsOpen ? " is-open" : "")} strokeWidth={1.8} />
              <span className="sr-only">{t(tagsOpen ? "tagsLess" : "tagsMore")}</span>
            </button>
          </GlassCluster>
        ) : null}
      </section>

      <section className="dashboard-panel" aria-label={t("statsTimeline")}>
        <p className="list-tools-label">{t("statsTimeline")}</p>
        {recent.length ? (
          <ul className="dashboard-timeline">
            {recent.map((item) => (
              <li key={item.id}>
                <Link to={"/scrap/" + item.id} className="dashboard-timeline-item no-underline">
                  <p className="dashboard-timeline-title">{item.title || t("untitled")}</p>
                  <p className="dashboard-timeline-meta">
                    {typeLabel(lang, item.type)} · {formatWhen(item.createdAt, lang)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="shelf-empty shelf-empty--compact">
            <p className="shelf-empty-title">{t("empty")}</p>
          </div>
        )}
      </section>

      <section className="dashboard-panel" aria-label={t("statsByDay")}>
        <p className="list-tools-label">{t("statsByDay")}</p>
        {stats.topDays.length ? (
          <ul className="dashboard-day-list">
            {stats.topDays.map(([day, count]) => (
              <li key={day}>
                <button
                  type="button"
                  className="dashboard-day-row"
                  onClick={() => navigate("/search?day=" + encodeURIComponent(day))}
                >
                  <span>{day}</span>
                  <strong>{count}</strong>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="shelf-empty shelf-empty--compact">
            <p className="shelf-empty-title">—</p>
          </div>
        )}
      </section>
    </div>
  );
}
