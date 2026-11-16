import { useState } from "react";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { BackupError, exportBackup, importBackup, type Snapshot } from "@/lib/backup";
import {
  CATEGORIES,
  formatMoney,
  todayISO,
  type Account,
  type CategoryId,
  type InsightId,
  type Transaction,
  type TxKind,
} from "@/lib/finance";
import { accountTitle, catLabel, monthLabel, monthShortLabel, useI18n } from "@/lib/i18n";
import { useFinance, type LocaleMode } from "@/lib/store";
import { ScreenHeader } from "@/components/lumen/screens";
import { TxnList } from "@/components/lumen/lists";

export function parseMoney(raw: string) {
  let s = raw.trim().replace(/[€\s]/g, "");
  if (!s) return Number.NaN;
  if (s.includes(",") && s.includes(".")) s = s.replace(/\./g, "").replace(",", ".");
  else if (s.includes(",")) s = s.replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) ? n : Number.NaN;
}

export function MonthPicker({ month, onClose }: { month: string; onClose: () => void }) {
  const setMonth = useFinance((s) => s.setMonth);
  const { t, locale } = useI18n();
  const year = Number(month.slice(0, 4));
  const [y, setY] = useState(year);
  return (
    <div className="screen-plain absolute inset-0 z-10 flex flex-col">
      <ScreenHeader title={t("month")} subtitle={t("jump")} onClose={onClose} />
      <div className="flex items-center justify-between px-6 pt-6">
        <button type="button" className="icon-btn" onClick={() => setY((v) => v - 1)} aria-label={t("previousYear")}>
          <ChevronLeft size={18} />
        </button>
        <p className="text-xl font-semibold">{y}</p>
        <button type="button" className="icon-btn" onClick={() => setY((v) => v + 1)} aria-label={t("nextYear")}>
          <ChevronRight size={18} />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-3 px-5 pt-6">
        {Array.from({ length: 12 }, (_, i) => {
          const key = `${y}-${String(i + 1).padStart(2, "0")}`;
          const on = key === month;
          return (
            <button
              key={key}
              type="button"
              data-on={on}
              className={`rounded-2xl py-4 text-sm font-semibold ${on ? "bg-cyan text-bg" : "bg-white/5"}`}
              onClick={() => {
                setMonth(key);
                onClose();
              }}
            >
              {monthShortLabel(locale, i + 1)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function BudgetScreen({ onClose }: { onClose: () => void }) {
  const month = useFinance((s) => s.month);
  const budget = useFinance((s) => s.budgets[month] ?? 3900);
  const allocation = useFinance((s) => s.allocations[month] ?? {});
  const setBudget = useFinance((s) => s.setBudget);
  const setAllocation = useFinance((s) => s.setAllocation);
  const { t, locale } = useI18n();
  const allocated = Object.values(allocation).reduce((s, n) => s + (n ?? 0), 0);
  const available = budget - allocated;
  return (
    <div className="screen-plain absolute inset-0 z-10 flex flex-col">
      <ScreenHeader title={t("budget")} subtitle={monthLabel(locale, month)} onClose={onClose} />
      <div className="phone-scroll px-5 pb-10">
        <label className="mt-6 block text-sm text-muted" htmlFor="budget-total">
          {t("monthlyBudget")}
        </label>
        <input
          id="budget-total"
          className="field mt-2 text-2xl font-semibold"
          inputMode="decimal"
          defaultValue={String(budget).replace(".", ",")}
          key={month + budget}
          onBlur={(e) => {
            const n = parseMoney(e.target.value);
            if (Number.isFinite(n)) setBudget(month, n);
          }}
        />
        <p className={`mt-3 text-sm ${available < 0 ? "text-danger" : "text-muted"}`}>
          {t("allocatedLine", { allocated: formatMoney(allocated), available: formatMoney(available) })}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted">{t("budgetHelp")}</p>
        <div className="mt-6 space-y-3">
          {CATEGORIES.map((c) => (
            <label key={c.id} className="sheet-card flex items-center gap-3 px-3 py-3">
              <span className="size-2.5 rounded-full" style={{ background: c.color }} />
              <span className="flex-1 text-sm">{catLabel(locale, c.id)}</span>
              <input
                className="field w-28 py-2 text-right"
                inputMode="decimal"
                defaultValue={String(allocation[c.id] ?? 0).replace(".", ",")}
                key={`${month}-${c.id}-${allocation[c.id] ?? 0}`}
                aria-label={t("allocationFor", { name: catLabel(locale, c.id) })}
                onBlur={(e) => {
                  const n = parseMoney(e.target.value);
                  if (Number.isFinite(n)) setAllocation(month, c.id, n);
                }}
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SettingsScreen({ onClose }: { onClose: () => void }) {
  const reset = useFinance((s) => s.reset);
  const restoreSnapshot = useFinance((s) => s.restoreSnapshot);
  const mode = useFinance((s) => s.localeMode);
  const setLocaleMode = useFinance((s) => s.setLocaleMode);
  const { t } = useI18n();
  const [phrase, setPhrase] = useState("");
  const [code, setCode] = useState("");
  const [paste, setPaste] = useState("");
  const [armed, setArmed] = useState(false);

  const copy = async () => {
    const state = useFinance.getState();
    const snapshot: Snapshot = {
      v: 1,
      accounts: state.accounts,
      transactions: state.transactions,
      budgets: state.budgets,
      allocations: state.allocations,
      projects: state.projects,
      month: state.month,
      insightOrder: state.insightOrder,
      hiddenInsights: state.hiddenInsights,
    };
    const text = await exportBackup(snapshot, phrase);
    setCode(text);
    try {
      await navigator.clipboard.writeText(text);
      toast(t("copied"));
    } catch {
      toast(t("copyFailed"));
    }
  };

  const restore = async () => {
    if (!armed) {
      setArmed(true);
      return;
    }
    try {
      restoreSnapshot(await importBackup(paste, phrase));
      toast(t("restored"));
      onClose();
    } catch (error) {
      setArmed(false);
      toast(error instanceof BackupError && error.code === "passphrase" ? t("needsPhrase") : t("badCode"));
    }
  };

  return (
    <div className="screen-plain absolute inset-0 z-10 flex flex-col">
      <ScreenHeader title={t("settings")} subtitle="Lumen" onClose={onClose} />
      <div className="phone-scroll space-y-4 px-5 pb-12 pt-5">
        <p className="text-sm leading-relaxed text-muted">{t("settingsBlurb")}</p>
        <section>
          <h2 className="font-semibold">{t("language")}</h2>
          <p className="mt-1 text-sm text-muted">{t("languageHelp")}</p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
            {(["auto", "en", "ru"] as LocaleMode[]).map((id) => (
              <button
                key={id}
                type="button"
                data-on={mode === id}
                className={`rounded-2xl px-2 py-3 font-semibold ${mode === id ? "bg-cyan text-bg" : "bg-white/5"}`}
                onClick={() => setLocaleMode(id)}
              >
                {t(id === "auto" ? "langAuto" : id === "en" ? "langEn" : "langRu")}
              </button>
            ))}
          </div>
        </section>
        <section className="sheet-card space-y-3 p-4">
          <h2 className="font-semibold">{t("backup")}</h2>
          <p className="text-sm leading-relaxed text-muted">{t("backupHelp")}</p>
          <input
            className="field"
            type="password"
            autoComplete="off"
            placeholder={t("passphrase")}
            aria-label={t("passphrase")}
            value={phrase}
            onChange={(e) => setPhrase(e.target.value)}
          />
          <p className="text-sm text-muted">{t("passphraseHint")}</p>
          <button type="button" className="w-full rounded-2xl bg-white/10 py-3 font-semibold" onClick={() => void copy()}>
            {t("copyCode")}
          </button>
          {code ? (
            <textarea className="field min-h-28 text-xs" readOnly value={code} aria-label={t("backup")} />
          ) : null}
          <textarea
            className="field min-h-28 text-xs"
            placeholder={t("pasteCode")}
            aria-label={t("pasteCode")}
            value={paste}
            onChange={(e) => {
              setPaste(e.target.value);
              setArmed(false);
            }}
          />
          <button type="button" className="w-full rounded-2xl bg-cyan py-3 font-semibold text-bg" onClick={() => void restore()} disabled={!paste.trim()}>
            {armed ? t("restoreAsk") : t("restore")}
          </button>
        </section>
        <button
          type="button"
          className="w-full rounded-2xl bg-white/10 py-4 font-semibold"
          onClick={() => {
            reset();
            toast(t("resetDone"));
            onClose();
          }}
        >
          {t("reset")}
        </button>
      </div>
    </div>
  );
}

export function InsightsEditor({ onClose }: { onClose: () => void }) {
  const order = useFinance((s) => s.insightOrder);
  const hidden = useFinance((s) => s.hiddenInsights);
  const toggle = useFinance((s) => s.toggleInsight);
  const move = useFinance((s) => s.moveInsight);
  const { t } = useI18n();
  const label: Record<InsightId, string> = {
    trend: t("trend"),
    top: t("top"),
    upcoming: t("upcoming"),
    saving: t("saving"),
    flow: t("flow"),
    accounts: t("accounts"),
    projects: t("goals"),
  };
  return (
    <div className="screen-plain absolute inset-0 z-10 flex flex-col">
      <ScreenHeader title={t("insights")} subtitle={t("showHide")} onClose={onClose} />
      <div className="space-y-2 px-5 pt-4">
        {order.map((id) => {
          const on = !hidden.includes(id);
          return (
            <div key={id} className="sheet-card flex items-center gap-2 px-3 py-3">
              <button type="button" className="flex-1 text-left font-medium" onClick={() => toggle(id)}>
                {label[id]}
                <span className="mt-0.5 block text-sm text-muted">{on ? t("shown") : t("hidden")}</span>
              </button>
              <button type="button" className="icon-btn" aria-label={t("moveUp")} onClick={() => move(id, -1)}>
                <ChevronLeft className="rotate-90" size={16} />
              </button>
              <button type="button" className="icon-btn" aria-label={t("moveDown")} onClick={() => move(id, 1)}>
                <ChevronRight className="rotate-90" size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TransactionEditor({
  id,
  date,
  seed,
  onClose,
}: {
  id?: string;
  date?: string;
  seed?: Transaction;
  onClose: () => void;
}) {
  const accounts = useFinance((s) => s.accounts);
  const stored = useFinance((s) => (id && !id.startsWith("proj-") ? s.transactions.find((t) => t.id === id) : undefined));
  const existing = stored ?? seed;
  const add = useFinance((s) => s.addTransaction);
  const update = useFinance((s) => s.updateTransaction);
  const remove = useFinance((s) => s.deleteTransaction);
  const { t, locale } = useI18n();
  const projected = !stored;
  const [kind, setKind] = useState<TxKind>(existing?.kind ?? "expense");
  const [amount, setAmount] = useState(existing ? String(existing.amount).replace(".", ",") : "");
  const [title, setTitle] = useState(existing?.title ?? "");
  const [categoryId, setCategoryId] = useState<CategoryId | "">(existing?.categoryId ?? "food");
  const [accountId, setAccountId] = useState(existing?.accountId ?? accounts.find((a) => a.isDefault && a.kind === "spending")?.id ?? accounts[0]?.id);
  const [toAccountId, setToAccountId] = useState(existing?.toAccountId ?? accounts.find((a) => a.kind === "saving")?.id ?? "");
  const [when, setWhen] = useState(existing?.date ?? date ?? todayISO());
  const [recurring, setRecurring] = useState(!!existing?.recurring);

  const save = () => {
    const value = parseMoney(amount);
    if (!Number.isFinite(value) || value <= 0) {
      toast(t("enterAmount"));
      return;
    }
    if (!title.trim()) {
      toast(t("addName"));
      return;
    }
    const payload = {
      title: title.trim(),
      amount: value,
      kind,
      date: when,
      accountId,
      categoryId: kind === "income" ? undefined : categoryId || undefined,
      toAccountId: kind === "transfer" ? toAccountId : undefined,
      recurring: kind === "expense" ? recurring : undefined,
      flow: existing?.flow,
    };
    if (existing && !projected) update(existing.id, payload);
    else add(payload);
    toast(existing && !projected ? t("txUpdated") : t("txAdded"));
    onClose();
  };

  return (
    <div className="screen-plain absolute inset-0 z-10 flex flex-col">
      <ScreenHeader
        title={existing && !projected ? t("editTx") : t("newTx")}
        onClose={onClose}
        right={
          <button type="button" className="text-sm font-semibold text-cyan" onClick={save}>
            {t("save")}
          </button>
        }
      />
      <div className="phone-scroll space-y-4 px-5 pb-16 pt-4">
        <div className="segmented">
          {(["expense", "income", "transfer"] as TxKind[]).map((k) => (
            <button key={k} type="button" data-on={kind === k} className="flex-1" onClick={() => setKind(k)}>
              {t(k)}
            </button>
          ))}
        </div>
        <input className="field text-3xl font-semibold" inputMode="decimal" placeholder="0,00" value={amount} onChange={(e) => setAmount(e.target.value)} aria-label={t("amount")} />
        <input className="field" placeholder={t("name")} value={title} onChange={(e) => setTitle(e.target.value)} aria-label={t("name")} />
        {kind !== "income" ? (
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategoryId(c.id)}
                className={`rounded-2xl px-3 py-3 text-left text-sm ${categoryId === c.id ? "bg-white/15 ring-1 ring-white/30" : "bg-white/5"}`}
              >
                <span className="mr-2 inline-block size-2 rounded-full" style={{ background: c.color }} />
                {catLabel(locale, c.id)}
              </button>
            ))}
          </div>
        ) : null}
        <label className="block text-sm text-muted">
          {t("account")}
          <select className="field mt-1" value={accountId} onChange={(e) => setAccountId(e.target.value)}>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {accountTitle(locale, a)}
              </option>
            ))}
          </select>
        </label>
        {kind === "transfer" ? (
          <label className="block text-sm text-muted">
            {t("to")}
            <select className="field mt-1" value={toAccountId} onChange={(e) => setToAccountId(e.target.value)}>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {accountTitle(locale, a)}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <label className="block text-sm text-muted">
          {t("date")}
          <input className="field mt-1" type="date" value={when} onChange={(e) => setWhen(e.target.value)} />
        </label>
        {kind === "expense" ? (
          <button type="button" className="sheet-card flex w-full items-center justify-between px-4 py-3" onClick={() => setRecurring((v) => !v)}>
            <span>{t("repeats")}</span>
            <span className={`text-sm font-semibold ${recurring ? "text-cyan" : "text-muted"}`}>{recurring ? t("on") : t("off")}</span>
          </button>
        ) : null}
        {existing && !projected ? (
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 py-3 text-danger"
            onClick={() => {
              remove(existing.id);
              toast(t("txDeleted"));
              onClose();
            }}
          >
            <Trash2 size={16} /> {t("delete")}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function TransactionsScreen({ txns, onOpen, onClose }: { txns: Transaction[]; onOpen: (id: string) => void; onClose: () => void }) {
  const [q, setQ] = useState("");
  const { t } = useI18n();
  const today = todayISO();
  const filtered = txns
    .filter((t) => t.date <= today)
    .filter((t) => !q || t.title.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => b.date.localeCompare(a.date) || a.amount - b.amount);
  return (
    <div className="screen-plain absolute inset-0 z-10 flex flex-col">
      <ScreenHeader title={t("transactions")} onClose={onClose} />
      <div className="px-5 pt-3">
        <input className="field" placeholder={t("search")} value={q} onChange={(e) => setQ(e.target.value)} aria-label={t("search")} />
      </div>
      <div className="phone-scroll px-5 pb-10 pt-3">
        <TxnList txns={filtered} onOpen={onOpen} />
      </div>
    </div>
  );
}

export function CategoryScreen({
  id,
  scope,
  txns,
  onOpen,
  onClose,
}: {
  id: CategoryId;
  scope: "month" | "year";
  txns: Transaction[];
  onOpen: (txId: string) => void;
  onClose: () => void;
}) {
  const month = useFinance((s) => s.month);
  const { t, locale } = useI18n();
  const today = todayISO();
  const mine = txns.filter((tx) => {
    if (tx.categoryId !== id) return false;
    if (tx.date > today) return false;
    if (scope === "month") return tx.date.startsWith(month);
    return tx.date.startsWith(month.slice(0, 4));
  });
  const total = mine.reduce((s, t) => s + t.amount, 0);
  return (
    <div className="screen-break absolute inset-0 z-10 flex flex-col">
      <ScreenHeader title={catLabel(locale, id)} subtitle={scope === "year" ? month.slice(0, 4) : monthLabel(locale, month)} onClose={onClose} />
      <div className="px-5 pt-4">
        <p className="text-3xl font-semibold">{formatMoney(total, 2)}</p>
        <p className="text-sm text-muted">{t("spent")}</p>
      </div>
      <div className="phone-scroll px-5 pb-8 pt-4">
        <TxnList txns={[...mine].sort((a, b) => b.date.localeCompare(a.date))} onOpen={onOpen} />
      </div>
    </div>
  );
}

export function AccountScreen({ id, txns, onOpen, onClose }: { id: string; txns: Transaction[]; onOpen: (txId: string) => void; onClose: () => void }) {
  const account = useFinance((s) => s.accounts.find((a) => a.id === id));
  const rename = useFinance((s) => s.renameAccount);
  const remove = useFinance((s) => s.deleteAccount);
  const { t, locale } = useI18n();
  const [name, setName] = useState(account?.name ?? "");
  if (!account) return null;
  const mine = txns.filter((t) => t.accountId === id || t.toAccountId === id).sort((a, b) => b.date.localeCompare(a.date));
  return (
    <div className="screen-accounts absolute inset-0 z-10 flex flex-col">
      <ScreenHeader title={accountTitle(locale, account)} subtitle={account.kind === "saving" ? t("savingKind") : t("spending")} onClose={onClose} />
      <div className="phone-scroll px-5 pb-10 pt-4">
        <label className="text-sm text-muted" htmlFor="acc-name">
          {t("name")}
        </label>
        <input
          id="acc-name"
          className="field mt-1"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => name.trim() && rename(id, name.trim())}
        />
        <div className="mt-4">
          <TxnList txns={mine} onOpen={onOpen} />
        </div>
        <button
          type="button"
          className="mt-6 text-sm text-danger"
          onClick={() => {
            const ok = remove(id);
            toast(ok ? t("accountRemoved") : t("accountBusy"));
            if (ok) onClose();
          }}
        >
          {t("removeAccount")}
        </button>
      </div>
    </div>
  );
}

export function AddAccountScreen({ onClose }: { onClose: () => void }) {
  const add = useFinance((s) => s.addAccount);
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [kind, setKind] = useState<Account["kind"]>("spending");
  const [balance, setBalance] = useState("0");
  const colors = ["#4C8DFF", "#3AD7FF", "#34D399", "#FF8A3D", "#E15CF0"];
  const [color, setColor] = useState(colors[0]);
  return (
    <div className="screen-accounts absolute inset-0 z-10 flex flex-col">
      <ScreenHeader
        title={t("newAccount")}
        onClose={onClose}
        right={
          <button
            type="button"
            className="text-sm font-semibold text-good"
            onClick={() => {
              const n = parseMoney(balance);
              if (!name.trim() || !Number.isFinite(n)) {
                toast(t("nameBalance"));
                return;
              }
              add({ name: name.trim(), kind, color, balance: n });
              onClose();
            }}
          >
            {t("save")}
          </button>
        }
      />
      <div className="space-y-4 px-5 pt-5">
        <input className="field" placeholder={t("accountName")} value={name} onChange={(e) => setName(e.target.value)} aria-label={t("accountName")} />
        <div className="segmented">
          <button type="button" data-on={kind === "spending"} onClick={() => setKind("spending")}>
            {t("spending")}
          </button>
          <button type="button" data-on={kind === "saving"} onClick={() => setKind("saving")}>
            {t("savingKind")}
          </button>
        </div>
        <input className="field" inputMode="decimal" placeholder={t("opening")} value={balance} onChange={(e) => setBalance(e.target.value)} aria-label={t("opening")} />
        <div className="flex gap-3">
          {colors.map((c) => (
            <button key={c} type="button" aria-label={c} className="size-9 rounded-full ring-2 ring-offset-2 ring-offset-bg" style={{ background: c, boxShadow: color === c ? `0 0 0 2px ${c}` : undefined }} onClick={() => setColor(c)} />
          ))}
        </div>
      </div>
    </div>
  );
}
