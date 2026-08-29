import { useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/Auth";
import { PrefsProvider } from "./context/Prefs";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { AuthSheet } from "./components/AuthSheet";
import { SettingsSheet } from "./components/SettingsSheet";
import { Intro } from "./pages/Intro";
import { Shelf } from "./pages/Shelf";
import { Legal } from "./pages/Legal";
import { t } from "./i18n";
import { usePrefs } from "./context/Prefs";

function Home() {
  const { user, ready } = useAuth();
  const { lang } = usePrefs();
  const [enter, setEnter] = useState(false);
  const [settings, setSettings] = useState(false);

  return (
    <div className="grid min-h-dvh grid-rows-[auto_1fr_auto]">
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
          <Intro onEnter={() => setEnter(true)} />
        )}
      </main>
      <Footer />
      <AuthSheet open={enter} onClose={() => setEnter(false)} />
      <SettingsSheet open={settings} onClose={() => setSettings(false)} />
    </div>
  );
}

function LegalLayout() {
  const { lang } = usePrefs();
  const [enter, setEnter] = useState(false);
  const [settings, setSettings] = useState(false);
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
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/terms" element={<LegalLayout />} />
            <Route path="/privacy" element={<LegalLayout />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </PrefsProvider>
  );
}
