import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import { useAuth } from "../hooks/useAuth";

export type Currency = "USD" | "CAD" | "CNY";

export type CurrencyContextValue = {
    currency: Currency;
    setCurrency: (c: Currency) => void;
    currencyInitialized: boolean;
};

export const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export const useCurrency = () => {
    const ctx = useContext(CurrencyContext);
    if (!ctx) {
        throw new Error("useCurrency must be used within a CurrencyProvider");
    }
    return ctx;
};

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
    const { accessToken } = useAuth();

    // Prefer localStorage immediately so refresh keeps user selection
    const [currency, setCurrencyState] = useState<Currency>(() => {
        const saved = localStorage.getItem("mf_display_currency");
        if (saved === "USD" || saved === "CAD" || saved === "CNY") {
            return saved;
        }
        return "USD";
    });

    const [currencyInitialized, setCurrencyInitialized] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("mf_display_currency");
        const hasLocalPreference = saved === "USD" || saved === "CAD" || saved === "CNY";

        if (hasLocalPreference) {
            setCurrencyState(saved);
            setCurrencyInitialized(true);
            return; // user already chose locally; do not override from server
        }

        const fetchUserInfo = async () => {
            try {
                if (!accessToken) {
                    setCurrencyInitialized(true);
                    return;
                }

                const res = await fetch("http://localhost:8000/users/me", {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });

                if (!res.ok) {
                    setCurrencyInitialized(true);
                    return;
                }

                const data = await res.json();
                const serverCurrency = data?.default_display_currency;

                if (
                    serverCurrency === "USD" ||
                    serverCurrency === "CAD" ||
                    serverCurrency === "CNY"
                ) {
                    setCurrencyState(serverCurrency);
                    localStorage.setItem("mf_display_currency", serverCurrency);
                }
            } catch {
                // ignore and fall back to USD
            } finally {
                setCurrencyInitialized(true);
            }
        };

        fetchUserInfo();
    }, [accessToken]);

    const setCurrency = (next: Currency) => {
        setCurrencyState(next);
        localStorage.setItem("mf_display_currency", next);
        // Same-tab notification (optional but useful for any legacy listeners)
        window.dispatchEvent(
            new CustomEvent("mf_display_currency_changed", { detail: next })
        );
    };

    // Safety net: keep localStorage in sync once initialized
    useEffect(() => {
        if (!currencyInitialized) return;
        localStorage.setItem("mf_display_currency", currency);
    }, [currency, currencyInitialized]);

    const value = useMemo(
        () => ({ currency, setCurrency, currencyInitialized }),
        [currency, currencyInitialized]
    );

    return (
        <CurrencyContext.Provider value={value}>
            {children}
        </CurrencyContext.Provider>
    );
};
