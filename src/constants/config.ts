import Constants from "expo-constants";
import appJson from "../../app.json";

type AppConfig = {
  apiBaseUrl: string;
};

const getExpoPublicApiUrl = (): string | undefined => {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (typeof fromEnv === "string" && fromEnv.trim().length > 0) {
    return fromEnv.trim();
  }
  return undefined;
};

type ExpoExtra = { apiBaseUrl?: string };

const getExpoExtra = (): ExpoExtra | undefined => {
  // `expo-constants` differs between dev/prod and platforms.
  // Prefer `expoConfig`, fallback to `manifest2` / `manifest`.
  const maybe =
    (Constants.expoConfig?.extra as ExpoExtra | undefined) ??
    ((Constants as unknown as { manifest2?: { extra?: unknown } }).manifest2
      ?.extra as ExpoExtra | undefined) ??
    ((Constants as unknown as { manifest?: { extra?: unknown } }).manifest
      ?.extra as ExpoExtra | undefined);
  return maybe;
};

const getApiBaseUrl = (): string => {
  const envUrl = getExpoPublicApiUrl();
  if (envUrl) return envUrl.replace(/\/+$/, "");

  const fromExtra = getExpoExtra()?.apiBaseUrl;
  if (typeof fromExtra === "string" && fromExtra.trim().length > 0) {
    return fromExtra.trim().replace(/\/+$/, "");
  }

  const fromAppJson = (appJson as { expo?: { extra?: ExpoExtra } } | undefined)
    ?.expo?.extra?.apiBaseUrl;
  if (typeof fromAppJson === "string" && fromAppJson.trim().length > 0) {
    return fromAppJson.trim().replace(/\/+$/, "");
  }

  // Final fallback (avoid accidental localhost in production/dev-web)
  return "https://finalproject-production-9752.up.railway.app";
 };

export const APP_CONFIG: AppConfig = {
  apiBaseUrl: getApiBaseUrl(),
};
