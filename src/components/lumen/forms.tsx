import { useState } from "react";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { BackupError, exportBackup, importBackup, type Snapshot } from "@/lib/backup";
import {
  CATEGORIES,
  CURRENCIES,
  CURRENCY_IDS,
  budgetOf,
  defaultSavingId,
  defaultSpendingId,
  formatMoney,
  todayISO,
  type Account,
  type CategoryId,
  type InsightId,
  type Transaction,
  type TxKind,
} from "@/lib/finance";
import { accountTitle, catLabel, monthLabel, monthShortLabel, useI18n } from "@/lib/i18n";
import { useFinance, type LocaleMode, type ThemeMode } from "@/lib/store";
import { ScreenHeader } from "@/components/lumen/screens";
import { TxnList } from "@/components/lumen/lists";
import type { TxDraft } from "@/components/lumen/nav";

export function parseMoney(raw: string) {
  let s = raw.replace(/[^\d.,-]/g, "");
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
  const budgets = useFinance((s) => s.budgets);
  const budget = budgetOf(budgets, month);
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

/** A row of exclusive choices, one highlighted. */
function Choices<T extends string>({
  value,
  options,
  onChange,
  columns,
}: {
  value: T;
  options: { id: T; label: string }[];
  onChange: (id: T) => void;
  columns: string;
}) {
  return (
    <div className={`mt-3 grid gap-2 text-sm ${columns}`}>
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          data-on={value === o.id}
          aria-pressed={value === o.id}
          className={`rounded-2xl px-2 py-3 font-semibold ${value === o.id ? "bg-cyan text-bg" : "bg-white/5"}`}
          onClick={() => onChange(o.id)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function SettingsScreen({ onClose }: { onClose: () => void }) {
  const erase = useFinance((s) => s.erase);
  const restoreSnapshot = useFinance((s) => s.restoreSnapshot);
  const mode = useFinance((s) => s.localeMode);
  const setLocaleMode = useFinance((s) => s.setLocaleMode);
  const themeMode = useFinance((s) => s.themeMode);
  const setThemeMode = useFinance((s) => s.setThemeMode);
  const currency = useFinance((s) => s.currency);
  const setCurrency = useFinance((s) => s.setCurrency);
  const { t } = useI18n();
  const [phrase, setPhrase] = useState("");
  const [code, setCode] = useState("");
  const [paste, setPaste] = useState("");
  const [armed, setArmed] = useState(false);
  const [eraseArmed, setEraseArmed] = useState(false);

  const eraseAll = () => {
    if (!eraseArmed) {
      setEraseArmed(true);
      return;
    }
    erase();
    toast(t("erased"));
    onClose();
  };

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
          <Choices<LocaleMode>
            value={mode}
            columns="grid-cols-2"
            onChange={setLocaleMode}
            options={[
              { id: "auto", label: t("langAuto") },
              { id: "en", label: t("langEn") },
              { id: "ru", label: t("langRu") },
              { id: "be", label: t("langBe") },
            ]}
          />
        </section>
        <section>
          <h2 className="font-semibold">{t("theme")}</h2>
          <p className="mt-1 text-sm text-muted">{t("themeHelp")}</p>
          <Choices<ThemeMode>
            value={themeMode}
            columns="grid-cols-3"
            onChange={setThemeMode}
            options={[
              { id: "auto", label: t("langAuto") },
              { id: "light", label: t("themeLight") },
              { id: "dark", label: t("themeDark") },
            ]}
          />
        </section>
        <section>
          <h2 className="font-semibold">{t("currency")}</h2>
          <p className="mt-1 text-sm text-muted">{t("currencyHelp")}</p>
          <Choices
            value={currency}
            columns="grid-cols-4"
            onChange={setCurrency}
            options={CURRENCY_IDS.map((id) => ({ id, label: `${CURRENCIES[id].symbol} ${id}` }))}
          />
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
        <section className="space-y-3">
          <h2 className="font-semibold">{t("dataHeading")}</h2>
          <button type="button" className="w-full rounded-2xl bg-white/10 py-4 font-semibold text-danger" onClick={eraseAll}>
            {eraseArmed ? t("tapAgain") : t("eraseAll")}
          </button>
        </section>
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
  draft,
  onClose,
}: {
  id?: string;
  date?: string;
  seed?: Transaction;
  draft?: TxDraft;
  onClose: () => void;
}) {
  const accounts = useFinance((s) => s.accounts);
  const projects = useFinance((s) => s.projects);
  const stored = useFinance((s) => (id && !id.startsWith("proj-") ? s.transactions.find((t) => t.id === id) : undefined));
  const base: TxDraft | undefined = stored ?? seed ?? draft;
  const add = useFinance((s) => s.addTransaction);
  const update = useFinance((s) => s.updateTransaction);
  const remove = useFinance((s) => s.deleteTransaction);
  const { t, locale } = useI18n();
  const [kind, setKind] = useState<TxKind>(base?.kind ?? "expense");
  const [amount, setAmount] = useState(base?.amount ? String(base.amount).replace(".", ",") : "");
  const [title, setTitle] = useState(base?.title ?? "");
  // "" means no category: income, or money moved between two of your own accounts.
  const [categoryId, setCategoryId] = useState<CategoryId | "">(base ? base.categoryId ?? "" : "food");
  const [accountId, setAccountId] = useState(base?.accountId ?? defaultSpendingId(accounts));
  const [toAccountId, setToAccountId] = useState(base?.toAccountId ?? defaultSavingId(accounts));
  const [when, setWhen] = useState(base?.date ?? date ?? todayISO());
  const [recurring, setRecurring] = useState(!!base?.recurring);
  const [projectId, setProjectId] = useState(base?.projectId ?? "");

  const chooseKind = (k: TxKind) => {
    setKind(k);
    if (k === "expense" && !categoryId) setCategoryId("food");
    if (k === "transfer" && !base) setCategoryId(accounts.find((a) => a.id === toAccountId)?.kind === "saving" ? "savings" : "");
  };

  const chooseTarget = (target: string) => {
    setToAccountId(target);
    // A new transfer into a saving account counts as "Savings" in the budget; between spending accounts it counts as nothing.
    if (!stored && (categoryId === "" || categoryId === "savings")) {
      setCategoryId(accounts.find((a) => a.id === target)?.kind === "saving" ? "savings" : "");
    }
  };

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
    if (kind === "transfer" && (!toAccountId || toAccountId === accountId)) {
      toast(t("sameAccount"));
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
      flow: base?.flow,
      projectId: projectId || undefined,
      // The row a payment settles stays attached only while it still points at the same project.
      planRef: projectId && projectId === base?.projectId ? base?.planRef : undefined,
    };
    if (stored) update(stored.id, payload);
    else add(payload);
    toast(stored ? t("txUpdated") : t("txAdded"));
    onClose();
  };

  const accountOptions = accounts.map((a) => (
    <option key={a.id} value={a.id}>
      {accountTitle(locale, a)}
    </option>
  ));

  return (
    <div className="screen-plain absolute inset-0 z-10 flex flex-col">
      <ScreenHeader
        title={stored ? t("editTx") : t("newTx")}
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
            <button key={k} type="button" data-on={kind === k} className="flex-1" onClick={() => chooseKind(k)}>
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
                className={`min-w-0 truncate rounded-2xl px-3 py-3 text-left text-sm ${categoryId === c.id ? "bg-white/15 ring-1 ring-white/30" : "bg-white/5"}`}
              >
                <span className="mr-2 inline-block size-2 rounded-full" style={{ background: c.color }} />
                {catLabel(locale, c.id)}
              </button>
            ))}
            {kind === "transfer" ? (
              <button
                type="button"
                onClick={() => setCategoryId("")}
                className={`min-w-0 truncate rounded-2xl px-3 py-3 text-left text-sm ${categoryId === "" ? "bg-white/15 ring-1 ring-white/30" : "bg-white/5"}`}
              >
                {t("noCategory")}
              </button>
            ) : null}
          </div>
        ) : null}
        <label className="block text-sm text-muted">
          {t("account")}
          <select className="field mt-1" value={accountId} onChange={(e) => setAccountId(e.target.value)}>
            {accountOptions}
          </select>
        </label>
        {kind === "transfer" ? (
          <label className="block text-sm text-muted">
            {t("to")}
            <select className="field mt-1" value={toAccountId} onChange={(e) => chooseTarget(e.target.value)}>
              {accountOptions}
            </select>
          </label>
        ) : null}
        <label className="block text-sm text-muted">
          {t("date")}
          <input className="field mt-1" type="date" value={when} onChange={(e) => setWhen(e.target.value)} />
        </label>
        {projects.length > 0 && kind !== "income" ? (
          <label className="block text-sm text-muted">
            {t("projectFor")}
            <select className="field mt-1" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
              <option value="">{t("noProject")}</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {kind === "expense" ? (
          <button type="button" className="sheet-card flex w-full items-center justify-between px-4 py-3" onClick={() => setRecurring((v) => !v)}>
            <span>{t("repeats")}</span>
            <span className={`text-sm font-semibold ${recurring ? "text-cyan" : "text-muted"}`}>{recurring ? t("on") : t("off")}</span>
          </button>
        ) : null}
        {stored ? (
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 py-3 text-danger"
            onClick={() => {
              remove(stored.id);
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
