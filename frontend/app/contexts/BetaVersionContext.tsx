"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { IS_BETA } from "@/lib/seo";
import { setBetaVersion, clearCache } from "@/lib/fetch-cache";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const STORAGE_KEY = "spire-codex-beta-version";

interface VersionInfo {
  version: string;
  is_latest: boolean;
}

interface BetaVersionContextType {
  version: string | null; // null = latest
  versions: VersionInfo[];
  setVersion: (v: string | null) => void;
}

const BetaVersionContext = createContext<BetaVersionContextType>({
  version: null,
  versions: [],
  setVersion: () => {},
});

export function BetaVersionProvider({ children }: { children: ReactNode }) {
  const [version, setVersionState] = useState<string | null>(null);
  const [versions, setVersions] = useState<VersionInfo[]>([]);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Fetch available versions on mount (only on beta)
  useEffect(() => {
    if (!IS_BETA) return;
    fetch(`${API}/api/versions`)
      .then((r) => r.json())
      .then((data: VersionInfo[]) => {
        setVersions(data);
      })
      .catch(() => {});
  }, []);

  // On mount + URL change: URL param takes priority, then localStorage
  useEffect(() => {
    if (!IS_BETA) return;
    const urlVersion = searchParams.get("version");
    if (urlVersion && urlVersion !== "latest") {
      setVersionState(urlVersion);
      setBetaVersion(urlVersion);
      localStorage.setItem(STORAGE_KEY, urlVersion);
    } else if (!urlVersion) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && stored !== "latest") {
        setVersionState(stored);
        setBetaVersion(stored);
      }
    }
  }, [searchParams]);

  const setVersion = (v: string | null) => {
    setVersionState(v);
    setBetaVersion(v);
    clearCache();
    if (v) {
      localStorage.setItem(STORAGE_KEY, v);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    // Update URL with version param
    const params = new URLSearchParams(searchParams.toString());
    if (v) {
      params.set("version", v);
    } else {
      params.delete("version");
    }
    const qs = params.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  // Key changes on version switch, forcing all children to remount and re-fetch
  const versionKey = version || "latest";

  return (
    <BetaVersionContext.Provider value={{ version, versions, setVersion }}>
      <div key={versionKey}>{children}</div>
    </BetaVersionContext.Provider>
  );
}

export function useBetaVersion() {
  return useContext(BetaVersionContext);
}
