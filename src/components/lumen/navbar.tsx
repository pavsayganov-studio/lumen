import { House, List, Settings, Target, Wallet } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { TAB_ROUTE, type Go, type Tab } from "@/components/lumen/nav";

const TABS: { id: Tab; icon: typeof House; label: string }[] = [
  { id: "home", icon: House, label: "home" },
  { id: "transactions", icon: List, label: "transactions" },
  { id: "accounts", icon: Wallet, label: "accounts" },
  { id: "projects", icon: Target, label: "goals" },
  { id: "settings", icon: Settings, label: "settings" },
];

/** Bottom bar with the five sections. Add stays the floating button on Home and Transactions. */
export function NavBar({ tab, go }: { tab: Tab; go: Go }) {
  const { t } = useI18n();
  return (
    <nav className="navbar" aria-label="Lumen">
      {TABS.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          type="button"
          className="navbar-tab"
          data-on={tab === id}
          aria-current={tab === id ? "page" : undefined}
          onClick={() => go(TAB_ROUTE[id])}
        >
          <Icon size={21} strokeWidth={tab === id ? 2.4 : 1.9} />
          <span className="truncate">{t(label)}</span>
        </button>
      ))}
    </nav>
  );
}
