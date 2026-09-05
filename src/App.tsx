import { useCallback, useEffect, useRef, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, isBrowseUser, useAuth } from "./context/Auth";
import { PlanProvider } from "./context/Plan";
import { PrefsProvider } from "./context/Prefs";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { AuthSheet } from "./components/AuthSheet";
import { GuestMigrateSheet } from "./components/GuestMigrateSheet";
import { SettingsSheet } from "./components/SettingsSheet";
import { ShelfReveal } from "./components/ShelfReveal";
import { AuthWaiting } from "./components/AuthWaiting";
import { CLOSE_OVERLAYS_EVENT } from "./components/StickDock";
import { Intro } from "./pages/Intro";
import { Shelf } from "./pages/Shelf";
import { Dashboard } from "./pages/Dashboard";
import { ScrapDetail } from "./pages/ScrapDetail";
import { Legal } from "./pages/Legal";
import { loadScraps } from "./lib/scraps";
import { guestMigrateAsked, hasLocalScraps } from "./lib/localScraps";
import type { Scrap } from "./lib/types";
import { DialogProvider } from "./lib/dialog";
import { t } from "./i18n";
import { usePrefs } from "./context/Prefs";
import { usePlan } from "./context/Plan";

function openSheet(setter: (v: boolean) => void) {
  window.dispatchEvent(new Event(CLOSE_OVERLAYS_EVENT));
  setter(true);
}

function Home() {
  const { user, ready, recoveryPending } = useAuth();
  const { lang } = usePrefs();
  const [enter, setEnter] = useState(false);
  const [settings, setSettings] = useState(false);
  const [migrate, setMigrate] = useState(false);
  const [reveal, setReveal] = useState(false);
  const hadUser = useRef(false);

  useEffect(() => {
    if (recoveryPending) setEnter(true);
  }, [recoveryPending]);

  useEffect(() => {
    if (!user || isBrowseUser(user)) return;
    if (!hasLocalScraps() || guestMigrateAsked()) return;
    setMigrate(true);
  }, [user]);

  useEffect(() => {
    if (user && !hadUser.current) {
      setReveal(true);
    }
    hadUser.current = Boolean(user);
    if (!user) setReveal(false);
  }, [user]);

  const endReveal = useCallback(() => setReveal(false), []);

  useEffect(() => {
    function onCloseOverlays() {
      setEnter(false);
      setSettings(false);
    }
    window.addEventListener(CLOSE_OVERLAYS_EVENT, onCloseOverlays);
    return () => window.removeEventListener(CLOSE_OVERLAYS_EVENT, onCloseOverlays);
  }, []);

  return (
    <div className="grid min-h-dvh grid-rows-[auto_1fr]">
      <a
        href="#main"
        className="absolute left-3 top-[-40px] z-20 rounded-[14px] bg-ink px-3 py-2 text-enamel focus:top-3"
      >
        {t(lang, "skip")}
      </a>
      <Header onEnter={() => openSheet(setEnter)} onSettings={() => openSheet(setSettings)} />
      <main id="main" className={user ? "min-h-0" : "min-h-0 p-0"}>
        {!ready ? (
          <AuthWaiting />
        ) : user ? (
          <Shelf onEnter={() => openSheet(setEnter)} />
        ) : (
          <>
            <Intro onEnter={() => openSheet(setEnter)} />
            <Footer />
          </>
        )}
      </main>
      <AuthSheet open={enter} onClose={() => setEnter(false)} />
      <SettingsSheet open={settings} onClose={() => setSettings(false)} />
      <GuestMigrateSheet open={migrate} onClose={() => setMigrate(false)} />
      <ShelfReveal active={Boolean(user) && reveal} onDone={endReveal} />
    </div>
  );
}

function DashboardPage() {
  const { user, ready } = useAuth();
  const { setScrapsForUsage } = usePlan();
  const [scraps, setScraps] = useState<Scrap[]>([]);
  const [enter, setEnter] = useState(false);
  const [settings, setSettings] = useState(false);

  useEffect(() => {
    if (!user) return;
    void loadScraps(user)
      .then((next) => {
        setScraps(next);
        setScrapsForUsage(next);
      })
      .catch(() => setScraps([]));
  }, [user, setScrapsForUsage]);

  useEffect(() => {
    function onCloseOverlays() {
      setEnter(false);
      setSettings(false);
    }
    window.addEventListener(CLOSE_OVERLAYS_EVENT, onCloseOverlays);
    return () => window.removeEventListener(CLOSE_OVERLAYS_EVENT, onCloseOverlays);
  }, []);

  if (!ready) {
    return <AuthWaiting />;
  }
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="grid min-h-dvh grid-rows-[auto_1fr_auto]">
      <Header onEnter={() => openSheet(setEnter)} onSettings={() => openSheet(setSettings)} />
      <main id="main" className="min-h-0">
        <Dashboard scraps={scraps} />
      </main>
      <Footer />
      <AuthSheet open={enter} onClose={() => setEnter(false)} />
      <SettingsSheet open={settings} onClose={() => setSettings(false)} />
    </div>
  );
}

function ScrapDetailPage() {
  const { user, ready } = useAuth();
  const [enter, setEnter] = useState(false);
  const [settings, setSettings] = useState(false);

  useEffect(() => {
    function onCloseOverlays() {
      setEnter(false);
      setSettings(false);
    }
    window.addEventListener(CLOSE_OVERLAYS_EVENT, onCloseOverlays);
    return () => window.removeEventListener(CLOSE_OVERLAYS_EVENT, onCloseOverlays);
  }, []);

  if (!ready) {
    return <AuthWaiting />;
  }
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="grid min-h-dvh grid-rows-[auto_1fr_auto]">
      <Header onEnter={() => openSheet(setEnter)} onSettings={() => openSheet(setSettings)} />
      <main id="main" className="min-h-0">
        <ScrapDetail />
      </main>
      <Footer />
      <AuthSheet open={enter} onClose={() => setEnter(false)} />
      <SettingsSheet open={settings} onClose={() => setSettings(false)} />
    </div>
  );
}

function LegalLayout() {
  const { lang } = usePrefs();
  const { recoveryPending } = useAuth();
  const [enter, setEnter] = useState(false);
  const [settings, setSettings] = useState(false);

  useEffect(() => {
    if (recoveryPending) setEnter(true);
  }, [recoveryPending]);

  useEffect(() => {
    function onCloseOverlays() {
      setEnter(false);
      setSettings(false);
    }
    window.addEventListener(CLOSE_OVERLAYS_EVENT, onCloseOverlays);
    return () => window.removeEventListener(CLOSE_OVERLAYS_EVENT, onCloseOverlays);
  }, []);

  return (
    <div className="grid min-h-dvh grid-rows-[auto_1fr_auto]">
      <Header onEnter={() => openSheet(setEnter)} onSettings={() => openSheet(setSettings)} />
      <main id="main">
        <Legal />
      </main>
      <Footer />
      <AuthSheet open={enter} onClose={() => setEnter(false)} />
      <SettingsSheet open={settings} onClose={() => setSettings(false)} />
      <span className="sr-only">{t(lang, "appName")}</span>
    </div>
  );
}

export default function App() {
  return (
    <PrefsProvider>
      <AuthProvider>
        <PlanProvider>
          <DialogProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/scrap/:id" element={<ScrapDetailPage />} />
                <Route path="/terms" element={<LegalLayout />} />
                <Route path="/privacy" element={<LegalLayout />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </DialogProvider>
        </PlanProvider>
      </AuthProvider>
    </PrefsProvider>
  );
}
