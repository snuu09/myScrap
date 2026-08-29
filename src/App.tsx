import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/Auth";
import { PlanProvider } from "./context/Plan";
import { PrefsProvider } from "./context/Prefs";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { AuthSheet } from "./components/AuthSheet";
import { SettingsSheet } from "./components/SettingsSheet";
import { Intro } from "./pages/Intro";
import { Shelf } from "./pages/Shelf";
import { Dashboard } from "./pages/Dashboard";
import { ScrapDetail } from "./pages/ScrapDetail";
import { Legal } from "./pages/Legal";
import { loadScraps } from "./lib/scraps";
import type { Scrap } from "./lib/types";
import { t } from "./i18n";
import { usePrefs } from "./context/Prefs";
import { usePlan } from "./context/Plan";

function Home() {
  const { user, ready, recoveryPending } = useAuth();
  const { lang } = usePrefs();
  const [enter, setEnter] = useState(false);
  const [settings, setSettings] = useState(false);

  useEffect(() => {
    if (recoveryPending) setEnter(true);
  }, [recoveryPending]);

  return (
    <div className="grid min-h-dvh grid-rows-[auto_1fr]">
      <a
        href="#main"
        className="absolute left-3 top-[-40px] z-20 rounded-[14px] bg-ink px-3 py-2 text-enamel focus:top-3"
      >
        {t(lang, "skip")}
      </a>
      <Header onEnter={() => setEnter(true)} onSettings={() => setSettings(true)} />
      <main id="main" className={user ? "min-h-0" : "min-h-0 p-0"}>
        {!ready ? (
          <p className="px-[var(--gutter)] py-8 text-muted">{t(lang, "authWorking")}</p>
        ) : user ? (
          <Shelf />
        ) : (
          <>
            <Intro onEnter={() => setEnter(true)} />
            <Footer />
          </>
        )}
      </main>
      <AuthSheet open={enter} onClose={() => setEnter(false)} />
      <SettingsSheet open={settings} onClose={() => setSettings(false)} />
    </div>
  );
}

function DashboardPage() {
  const { user, ready } = useAuth();
  const { lang } = usePrefs();
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

  if (!ready) {
    return <p className="px-[var(--gutter)] py-8 text-muted">{t(lang, "authWorking")}</p>;
  }
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="grid min-h-dvh grid-rows-[auto_1fr_auto]">
      <Header onEnter={() => setEnter(true)} onSettings={() => setSettings(true)} />
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
  const { lang } = usePrefs();
  const [enter, setEnter] = useState(false);
  const [settings, setSettings] = useState(false);

  if (!ready) {
    return <p className="px-[var(--gutter)] py-8 text-muted">{t(lang, "authWorking")}</p>;
  }
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="grid min-h-dvh grid-rows-[auto_1fr_auto]">
      <Header onEnter={() => setEnter(true)} onSettings={() => setSettings(true)} />
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

  return (
    <div className="grid min-h-dvh grid-rows-[auto_1fr_auto]">
      <Header onEnter={() => setEnter(true)} onSettings={() => setSettings(true)} />
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
        </PlanProvider>
      </AuthProvider>
    </PrefsProvider>
  );
}
