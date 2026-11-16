import { useState } from "react";
import { Car, Home, Plus, Target, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatMoney, projectPlan, todayISO, type Project, type ProjectKind } from "@/lib/finance";
import { fullDate, projectTitle, useI18n } from "@/lib/i18n";
import { useFinance } from "@/lib/store";
import { ScreenHeader } from "@/components/lumen/screens";
import { parseMoney } from "@/components/lumen/forms";

export function GoalsScreen({ onOpen, onClose }: { onOpen: (id?: string) => void; onClose: () => void }) {
  const { t, locale } = useI18n();
  const projects = useFinance((s) => s.projects);
  const today = todayISO();
  return (
    <div className="pb-8">
      <ScreenHeader
        title={t("goals")}
        onClose={onClose}
        right={
          <button type="button" className="icon-btn" aria-label={t("newGoal")} onClick={() => onOpen(undefined)}>
            <Plus size={18} />
          </button>
        }
      />
      <div className="px-5">
        <p className="mt-4 text-sm leading-relaxed text-muted">{t("goalsHelp")}</p>
        <div className="mt-4 space-y-3">
          {projects.map((project) => {
            const plan = projectPlan(project, today);
            return (
              <button key={project.id} type="button" className="sheet-card w-full p-4 text-left" onClick={() => onOpen(project.id)}>
                <span className="flex items-center gap-2 text-sm text-muted">
                  <KindIcon kind={project.kind} />
                  {t(project.kind === "home" ? "kindHome" : project.kind === "car" ? "kindCar" : "kindOther")}
                  <span className="ml-auto">{project.installment ? t("inParts") : t("saveUp")}</span>
                </span>
                <span className="mt-1 block truncate text-lg font-semibold">{projectTitle(locale, project)}</span>
                <span className="mt-3 block h-2 overflow-hidden rounded-full bg-white/10">
                  <span className="block h-full rounded-full bg-[#f6c445]" style={{ width: `${Math.round(plan.progress * 100)}%` }} />
                </span>
                <span className="mt-2 flex justify-between text-sm text-muted">
                  <span>{t("ofPrice", { saved: formatMoney(plan.saved), price: formatMoney(plan.price) })}</span>
                  <span>{Math.round(plan.progress * 100)}%</span>
                </span>
              </button>
            );
          })}
          {projects.length === 0 ? (
            <button type="button" className="sheet-card w-full px-4 py-8 text-center text-muted" onClick={() => onOpen(undefined)}>
              {t("addGoal")}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function KindIcon({ kind }: { kind: ProjectKind }) {
  if (kind === "home") return <Home size={14} />;
  if (kind === "car") return <Car size={14} />;
  return <Target size={14} />;
}

export function ProjectEditor({ id, onClose }: { id?: string; onClose: () => void }) {
  const { t, locale } = useI18n();
  const existing = useFinance((s) => s.projects.find((p) => p.id === id));
  const saveProject = useFinance((s) => s.saveProject);
  const deleteProject = useFinance((s) => s.deleteProject);
  const [name, setName] = useState(existing ? projectTitle(locale, existing) : "");
  const [kind, setKind] = useState<ProjectKind>(existing?.kind ?? "home");
  const [installment, setInstallment] = useState(existing?.installment ?? false);
  const [target, setTarget] = useState(existing ? money(existing.target) : "");
  const [saved, setSaved] = useState(existing ? money(existing.saved) : "");
  const [monthlySave, setMonthlySave] = useState(existing ? money(existing.monthlySave) : "");
  const [down, setDown] = useState(existing ? money(existing.downPayment) : "");
  const [months, setMonths] = useState(String(existing?.months ?? 36));
  const [apr, setApr] = useState(String(existing?.apr ?? 0).replace(".", ","));
  const [start, setStart] = useState(existing?.start ?? todayISO());

  const draft: Project = {
    id: existing?.id ?? "draft",
    name: name.trim() || t("newGoal"),
    kind,
    target: num(target),
    saved: num(saved),
    monthlySave: num(monthlySave),
    installment,
    downPayment: num(down),
    months: Math.max(1, Math.round(num(months) || 1)),
    apr: num(apr),
    start,
  };
  const plan = projectPlan(draft);

  const save = () => {
    if (!(draft.target > 0)) {
      toast(t("needPrice"));
      return;
    }
    if (!name.trim()) {
      toast(t("addName"));
      return;
    }
    saveProject({ ...draft, id: existing?.id ?? `goal-${Date.now()}`, name: name.trim() });
    toast(t("goalSaved"));
    onClose();
  };

  return (
    <div className="screen-projects absolute inset-0 z-10 flex flex-col">
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
          {(["home", "car", "other"] as ProjectKind[]).map((k) => (
            <button key={k} type="button" data-on={kind === k} className="flex-1" onClick={() => setKind(k)}>
              {t(k === "home" ? "kindHome" : k === "car" ? "kindCar" : "kindOther")}
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
          </>
        ) : (
          <Field label={t("setAside")} value={monthlySave} onChange={setMonthlySave} />
        )}
        <div className="sheet-card space-y-2 p-4 text-sm">
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-[#f6c445]" style={{ width: `${Math.round(plan.progress * 100)}%` }} />
          </div>
          <p>{t("ofPrice", { saved: formatMoney(Math.min(plan.saved, plan.price)), price: formatMoney(plan.price) })}</p>
          <p className="text-muted">{t("stillToPay")} · {formatMoney(plan.left)}</p>
          {plan.monthly > 0 ? <p className="text-muted">{t("eachMonth")} · {formatMoney(plan.monthly)}</p> : null}
          {plan.mode === "save" && plan.monthsLeft != null && plan.left > 0 ? <p className="text-muted">{t("monthsLeft", { n: plan.monthsLeft })}</p> : null}
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
              deleteProject(existing.id);
              onClose();
            }}
          >
            <Trash2 size={16} /> {t("removeGoal")}
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
