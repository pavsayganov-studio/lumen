import { useState } from "react";
import { Car, Home, Plane, Plus, Target, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  defaultSavingId,
  defaultSpendingId,
  formatMoney,
  projectCategory,
  projectPlan,
  scheduleRows,
  todayISO,
  type PlanRow,
  type Project,
  type ProjectItem,
  type ProjectKind,
} from "@/lib/finance";
import { fullDate, useI18n } from "@/lib/i18n";
import { useFinance } from "@/lib/store";
import { ScreenHeader } from "@/components/lumen/screens";
import { parseMoney } from "@/components/lumen/forms";
import { TxnList } from "@/components/lumen/lists";
import type { Go } from "@/components/lumen/nav";

const KINDS: ProjectKind[] = ["home", "car", "trip", "other"];
const KIND_KEY: Record<ProjectKind, string> = { home: "kindHome", car: "kindCar", trip: "kindTrip", other: "kindOther" };
const MAX_INSTALLMENT_ROWS = 3;

function KindIcon({ kind }: { kind: ProjectKind }) {
  if (kind === "home") return <Home size={14} />;
  if (kind === "car") return <Car size={14} />;
  if (kind === "trip") return <Plane size={14} />;
  return <Target size={14} />;
}

function ProgressBar({ value }: { value: number }) {
  return (
    <span className="block h-2 overflow-hidden rounded-full bg-white/10">
      <span className="block h-full rounded-full bg-[#f6c445]" style={{ width: `${Math.round(value * 100)}%` }} />
    </span>
  );
}

export function ProjectsScreen({ onOpen, onClose, onNew }: { onOpen: (id: string) => void; onNew: () => void; onClose: () => void }) {
  const { t } = useI18n();
  const projects = useFinance((s) => s.projects);
  const txns = useFinance((s) => s.transactions);
  const today = todayISO();
  return (
    <div className="pb-8">
      <ScreenHeader
        title={t("goals")}
        onClose={onClose}
        right={
          <button type="button" className="icon-btn" aria-label={t("newGoal")} onClick={onNew}>
            <Plus size={18} />
          </button>
        }
      />
      <div className="px-5">
        <p className="mt-4 text-sm leading-relaxed text-muted">{t("goalsHelp")}</p>
        <div className="mt-4 space-y-3">
          {projects.map((project) => {
            const plan = projectPlan(project, today, txns);
            return (
              <button key={project.id} type="button" className="sheet-card w-full p-4 text-left" onClick={() => onOpen(project.id)}>
                <span className="flex items-center gap-2 text-sm text-muted">
                  <KindIcon kind={project.kind} />
                  {t(KIND_KEY[project.kind])}
                  <span className="ml-auto">{project.installment ? t("inParts") : t("saveUp")}</span>
                </span>
                <span className="mt-1 flex items-center gap-2">
                  <span className="min-w-0 flex-1 truncate text-lg font-semibold">{project.name}</span>
                  {plan.dueCount > 0 ? <span className="shrink-0 rounded-full bg-danger/20 px-2 py-0.5 text-micro text-danger">{t("due")}</span> : null}
                </span>
                <span className="mt-3 block">
                  <ProgressBar value={plan.progress} />
                </span>
                <span className="mt-2 flex justify-between gap-3 text-sm text-muted">
                  <span className="min-w-0 truncate">{t("ofPrice", { saved: formatMoney(plan.saved), price: formatMoney(plan.price) })}</span>
                  <span className="shrink-0">{Math.round(plan.progress * 100)}%</span>
                </span>
              </button>
            );
          })}
          {projects.length === 0 ? (
            <button type="button" className="sheet-card w-full px-4 py-8 text-center text-muted" onClick={onNew}>
              {t("addGoal")}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** One project: where it stands, what is due, what was paid. Money moves through the normal transaction editor. */
export function ProjectView({ id, go, onClose }: { id: string; go: Go; onClose: () => void }) {
  const { t, locale } = useI18n();
  const project = useFinance((s) => s.projects.find((p) => p.id === id));
  const txns = useFinance((s) => s.transactions);
  const accounts = useFinance((s) => s.accounts);
  if (!project) return null;
  const today = todayISO();
  const title = project.name;
  const plan = projectPlan(project, today, txns);
  const rows = scheduleRows(project, txns, today);
  const mine = txns.filter((tx) => tx.projectId === project.id).sort((a, b) => b.date.localeCompare(a.date));

  const base = { projectId: project.id, accountId: defaultSpendingId(accounts), date: today };
  const setAside = () =>
    go({
      name: "edit",
      draft: { ...base, kind: "transfer", title, categoryId: "savings", toAccountId: defaultSavingId(accounts), amount: project.monthlySave > 0 ? project.monthlySave : undefined },
    });
  const record = () => go({ name: "edit", draft: { ...base, kind: "expense", title, categoryId: projectCategory(project.kind) } });
  const pay = (row: PlanRow) =>
    go({
      name: "edit",
      draft: {
        ...base,
        kind: "expense",
        title: row.installment ? title : `${title}: ${row.title}`,
        amount: row.amount,
        categoryId: projectCategory(project.kind),
        planRef: row.ref,
      },
    });

  // Setting money aside makes sense while saving up, or while the down payment is still short.
  const canSetAside = plan.mode === "save" || plan.downGap > 0;
  const upcomingInstallments = rows.filter((r) => r.installment && !r.paid);
  const shown = rows.filter((r) => !r.installment || upcomingInstallments.slice(0, MAX_INSTALLMENT_ROWS).includes(r));
  const hiddenInstallments = upcomingInstallments.length - MAX_INSTALLMENT_ROWS;

  return (
    <div className="screen-projects absolute inset-0 z-10 flex flex-col">
      <ScreenHeader
        title={title}
        subtitle={t(KIND_KEY[project.kind])}
        onClose={onClose}
        right={
          <button type="button" className="text-sm font-semibold text-cyan" onClick={() => go({ name: "project-edit", id: project.id })}>
            {t("edit")}
          </button>
        }
      />
      <div className="phone-scroll space-y-4 px-5 pb-16 pt-4">
        <div className="sheet-card space-y-2 p-4 text-sm">
          <ProgressBar value={plan.progress} />
          <p className="flex justify-between gap-3">
            <span className="min-w-0 truncate">{t("ofPrice", { saved: formatMoney(Math.min(plan.saved, plan.price)), price: formatMoney(plan.price) })}</span>
            <span className="shrink-0">{Math.round(plan.progress * 100)}%</span>
          </p>
          <p className="text-muted">{t("stillToPay")} · {formatMoney(plan.left)}</p>
          {plan.left === 0 ? <p className="text-good">{t("goalReached")}</p> : null}
          {plan.monthly > 0 ? <p className="text-muted">{t("eachMonth")} · {formatMoney(plan.monthly)}</p> : null}
          {plan.mode === "save" && plan.monthsLeft != null && plan.left > 0 ? <p className="text-muted">{t("monthsLeft", { n: plan.monthsLeft })}</p> : null}
          {plan.deadline ? <p className="text-muted">{t("deadline")} · {fullDate(locale, plan.deadline)}</p> : null}
          {plan.needMonthly != null ? (
            <p className={plan.monthly >= plan.needMonthly ? "text-good" : ""}>
              {plan.monthly >= plan.needMonthly ? t("onTrack") : t("needMonthly", { n: formatMoney(plan.needMonthly) })}
            </p>
          ) : null}
          {plan.mode === "installment" ? (
            <p className="text-muted">
              {t("paidSoFar")} · {plan.paidCount}/{plan.months}
              {plan.nextDate ? ` · ${fullDate(locale, plan.nextDate)}` : ""}
            </p>
          ) : null}
          {plan.mode === "installment" && plan.downGap > 0 ? <p>{t("downGap", { n: formatMoney(plan.downGap) })}</p> : null}
          {plan.scheduled > 0 ? <p className="text-muted">{t("scheduledLeft")} · {formatMoney(plan.scheduled)}</p> : null}
        </div>

        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="sheet-card min-w-0 p-3">
            <p className="truncate text-sm text-muted">{t("statSaved")}</p>
            <p className="truncate text-lg font-semibold">{formatMoney(plan.saved)}</p>
          </div>
          <div className="sheet-card min-w-0 p-3">
            <p className="truncate text-sm text-muted">{t("statPaid")}</p>
            <p className="truncate text-lg font-semibold">{formatMoney(plan.paid)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm font-semibold">
          {canSetAside ? (
            <button type="button" className="rounded-2xl bg-cyan px-3 py-3 text-bg" onClick={setAside}>
              {t("setAsideNow")}
            </button>
          ) : null}
          <button type="button" className={`rounded-2xl bg-white/10 px-3 py-3 ${canSetAside ? "" : "col-span-2"}`} onClick={record}>
            {t("recordPayment")}
          </button>
        </div>

        {shown.length > 0 ? (
          <section>
            <h2 className="mb-2 font-semibold">{t("schedule")}</h2>
            <div className="sheet-card divide-y divide-white/5">
              {shown.map((row) => (
                <div key={row.ref} className="flex items-center gap-3 px-3 py-3">
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate font-medium ${row.paid ? "text-muted line-through" : ""}`}>{row.title}</span>
                    <span className="block truncate text-sm text-muted">{fullDate(locale, row.date)}</span>
                  </span>
                  <span className="shrink-0 text-sm">{formatMoney(row.amount, 2)}</span>
                  {row.paid ? (
                    <span className="shrink-0 text-micro text-good">{t("paidTag")}</span>
                  ) : (
                    <button
                      type="button"
                      className={`shrink-0 rounded-full px-3 py-1 text-sm font-semibold ${row.date <= today ? "bg-danger/20 text-danger" : "bg-white/10"}`}
                      onClick={() => pay(row)}
                    >
                      {row.date <= today ? t("due") : t("payNow")}
                    </button>
                  )}
                </div>
              ))}
            </div>
            {hiddenInstallments > 0 ? <p className="mt-2 text-sm text-muted">{t("moreInstallments", { n: hiddenInstallments })}</p> : null}
          </section>
        ) : null}

        {project.notes ? (
          <section>
            <h2 className="mb-2 font-semibold">{t("notes")}</h2>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted">{project.notes}</p>
          </section>
        ) : null}

        <section>
          <h2 className="mb-2 font-semibold">{t("history")}</h2>
          {mine.length ? <TxnList txns={mine} onOpen={(txId) => go({ name: "edit", id: txId })} /> : <p className="text-sm text-muted">{t("noHistory")}</p>}
        </section>
      </div>
    </div>
  );
}

interface CostDraft {
  id: string;
  title: string;
  amount: string;
  date: string;
}

export function ProjectEditor({ id, onClose }: { id?: string; onClose: () => void }) {
  const { t, locale } = useI18n();
  const existing = useFinance((s) => s.projects.find((p) => p.id === id));
  const txns = useFinance((s) => s.transactions);
  const saveProject = useFinance((s) => s.saveProject);
  const deleteProject = useFinance((s) => s.deleteProject);
  const [name, setName] = useState(existing ? existing.name : "");
  const [kind, setKind] = useState<ProjectKind>(existing?.kind ?? "home");
  const [installment, setInstallment] = useState(existing?.installment ?? false);
  const [target, setTarget] = useState(existing ? money(existing.target) : "");
  const [saved, setSaved] = useState(existing ? money(existing.saved) : "");
  const [monthlySave, setMonthlySave] = useState(existing ? money(existing.monthlySave) : "");
  const [down, setDown] = useState(existing ? money(existing.downPayment) : "");
  const [months, setMonths] = useState(String(existing?.months ?? 36));
  const [apr, setApr] = useState(String(existing?.apr ?? 0).replace(".", ","));
  const [start, setStart] = useState(existing?.start ?? todayISO());
  const [paidBefore, setPaidBefore] = useState(String(existing?.paidBefore ?? 0));
  const [deadline, setDeadline] = useState(existing?.deadline ?? "");
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [costs, setCosts] = useState<CostDraft[]>((existing?.items ?? []).map((i) => ({ ...i, amount: money(i.amount) })));
  const [armed, setArmed] = useState(false);

  const items: ProjectItem[] = costs
    .filter((c) => c.title.trim() && num(c.amount) > 0)
    .map((c) => ({ id: c.id, title: c.title.trim(), amount: num(c.amount), date: c.date || todayISO() }));
  const itemsTotal = items.reduce((s, i) => s + i.amount, 0);

  const draft: Project = {
    id: existing?.id ?? "draft",
    name: name.trim() || t("newGoal"),
    kind,
    target: num(target) || itemsTotal,
    saved: num(saved),
    monthlySave: num(monthlySave),
    installment,
    downPayment: num(down),
    months: Math.max(1, Math.round(num(months) || 1)),
    apr: num(apr),
    start,
    paidBefore: Math.round(num(paidBefore)),
    deadline: !installment && deadline ? deadline : undefined,
    notes: notes.trim() || undefined,
    items,
  };
  const plan = projectPlan(draft, todayISO(), txns);

  const save = () => {
    if (!name.trim()) {
      toast(t("addName"));
      return;
    }
    if (!(draft.target > 0)) {
      toast(t("needPrice"));
      return;
    }
    saveProject({ ...draft, id: existing?.id ?? `goal-${Date.now()}`, name: name.trim() });
    toast(t("goalSaved"));
    onClose();
  };

  const setCost = (costId: string, patch: Partial<CostDraft>) => setCosts((list) => list.map((c) => (c.id === costId ? { ...c, ...patch } : c)));

  return (
    <div className="screen-projects absolute inset-0 z-20 flex flex-col">
      <ScreenHeader
        title={existing ? t("editGoal") : t("newGoal")}
        onClose={onClose}
        right={
          <button type="button" className="text-sm font-semibold text-cyan" onClick={save}>
            {t("save")}
          </button>
        }
      />
      <div className="phone-scroll space-y-4 px-5 pb-16 pt-4">
        <input className="field" placeholder={t("name")} aria-label={t("name")} value={name} onChange={(e) => setName(e.target.value)} />
        <div className="segmented text-sm">
          {KINDS.map((k) => (
            <button key={k} type="button" data-on={kind === k} className="min-w-0 flex-1 truncate" onClick={() => setKind(k)}>
              {t(KIND_KEY[k])}
            </button>
          ))}
        </div>
        <div className="segmented text-sm">
          <button type="button" data-on={!installment} className="flex-1" onClick={() => setInstallment(false)}>
            {t("saveUp")}
          </button>
          <button type="button" data-on={installment} className="flex-1" onClick={() => setInstallment(true)}>
            {t("inParts")}
          </button>
        </div>
        <Field label={t("price")} value={target} onChange={setTarget} />
        <Field label={t("alreadySaved")} value={saved} onChange={setSaved} />
        {installment ? (
          <>
            <Field label={t("down")} value={down} onChange={setDown} />
            <Field label={t("months")} value={months} onChange={setMonths} />
            <Field label={t("rate")} value={apr} onChange={setApr} />
            <p className="text-sm text-muted">{t("rateHelp")}</p>
            <label className="block text-sm text-muted">
              {t("nextPayment")}
              <input className="field mt-1" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
            </label>
            <Field label={t("paidBefore")} value={paidBefore} onChange={setPaidBefore} />
          </>
        ) : (
          <>
            <Field label={t("setAside")} value={monthlySave} onChange={setMonthlySave} />
            <label className="block text-sm text-muted">
              {t("deadline")}
              <input className="field mt-1" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </label>
          </>
        )}

        <section className="space-y-3">
          <div>
            <h2 className="font-semibold">{t("costs")}</h2>
            <p className="text-sm text-muted">{t("costsHelp")}</p>
          </div>
          {costs.map((c) => (
            <div key={c.id} className="sheet-card space-y-2 p-3">
              <div className="flex items-center gap-2">
                <input className="field min-w-0 flex-1" placeholder={t("costName")} aria-label={t("costName")} value={c.title} onChange={(e) => setCost(c.id, { title: e.target.value })} />
                <button type="button" className="icon-btn shrink-0" aria-label={t("delete")} onClick={() => setCosts((list) => list.filter((x) => x.id !== c.id))}>
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input className="field min-w-0" inputMode="decimal" placeholder="0,00" aria-label={t("amount")} value={c.amount} onChange={(e) => setCost(c.id, { amount: e.target.value })} />
                <input className="field min-w-0" type="date" aria-label={t("date")} value={c.date} onChange={(e) => setCost(c.id, { date: e.target.value })} />
              </div>
            </div>
          ))}
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white/10 py-3 text-sm font-semibold"
            onClick={() => setCosts((list) => [...list, { id: `c${Date.now()}${list.length}`, title: "", amount: "", date: todayISO() }])}
          >
            <Plus size={16} /> {t("addCost")}
          </button>
        </section>

        <textarea className="field min-h-24" placeholder={t("notes")} aria-label={t("notes")} value={notes} onChange={(e) => setNotes(e.target.value)} />

        <div className="sheet-card space-y-2 p-4 text-sm">
          <ProgressBar value={plan.progress} />
          <p>{t("ofPrice", { saved: formatMoney(Math.min(plan.saved, plan.price)), price: formatMoney(plan.price) })}</p>
          <p className="text-muted">{t("stillToPay")} · {formatMoney(plan.left)}</p>
          {plan.monthly > 0 ? <p className="text-muted">{t("eachMonth")} · {formatMoney(plan.monthly)}</p> : null}
          {plan.mode === "save" && plan.monthsLeft != null && plan.left > 0 ? <p className="text-muted">{t("monthsLeft", { n: plan.monthsLeft })}</p> : null}
          {plan.needMonthly != null ? <p className={plan.monthly >= plan.needMonthly ? "text-good" : ""}>{plan.monthly >= plan.needMonthly ? t("onTrack") : t("needMonthly", { n: formatMoney(plan.needMonthly) })}</p> : null}
          {plan.left === 0 ? <p className="text-good">{t("goalReached")}</p> : null}
          {plan.mode === "installment" && plan.downGap > 0 ? <p>{t("downGap", { n: formatMoney(plan.downGap) })}</p> : null}
          {plan.mode === "installment" ? (
            <p className="text-muted">
              {t("paidSoFar")} · {plan.paidCount}/{plan.months}
              {plan.nextDate ? ` · ${fullDate(locale, plan.nextDate)}` : ""}
            </p>
          ) : null}
          {plan.mode === "installment" && plan.monthly > 0 ? <p className="text-muted">{t("addsBills", { n: formatMoney(plan.monthly) })}</p> : null}
        </div>

        {existing ? (
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 py-3 text-danger"
            onClick={() => {
              if (!armed) {
                setArmed(true);
                return;
              }
              deleteProject(existing.id);
              onClose();
            }}
          >
            <Trash2 size={16} /> {armed ? t("tapAgain") : t("removeGoal")}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block text-sm text-muted">
      {label}
      <input className="field mt-1" inputMode="decimal" aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function money(n: number) {
  return String(n).replace(".", ",");
}

function num(raw: string) {
  const n = parseMoney(raw);
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}
