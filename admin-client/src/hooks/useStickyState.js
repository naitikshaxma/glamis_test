import { useState, useEffect } from "react";

let isPageUnloading = false;
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    isPageUnloading = true;
  });
}

export function useClearOnNavigate(prefix) {
  useEffect(() => {
    return () => {
      if (!isPageUnloading) {
        clearStickyStatePrefix(prefix);
      }
    };
  }, [prefix]);
}

export function useStickyState(defaultValue, key) {
  const [value, setValue] = useState(() => {
    try {
      const stickyValue = window.sessionStorage.getItem(key);
      return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
    } catch (error) {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Error setting sessionStorage", error);
    }
  }, [key, value]);

  return [value, setValue];
}

export function clearStickyStatePrefix(prefix) {
  try {
    const keysToRemove = [];
    for (let i = 0; i < window.sessionStorage.length; i++) {
      const key = window.sessionStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => window.sessionStorage.removeItem(k));
  } catch (error) {
    console.error("Error clearing sessionStorage", error);
  }
}
