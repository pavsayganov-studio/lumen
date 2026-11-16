import { categoryById, formatSigned, todayISO, type Transaction } from "@/lib/finance";
import { catLabel, dayHeading, useI18n } from "@/lib/i18n";
import { TxnAvatar } from "@/components/lumen/widgets";

export function TxnList({ txns, onOpen }: { txns: Transaction[]; onOpen: (id: string) => void }) {
  const { t, locale } = useI18n();
  const today = todayISO();
  if (!txns.length) return <p className="py-8 text-center text-sm text-muted">{t("noTransactions")}</p>;
  const groups: { date: string; items: Transaction[] }[] = [];
  for (const tx of txns) {
    const last = groups[groups.length - 1];
    if (!last || last.date !== tx.date) groups.push({ date: tx.date, items: [tx] });
    else last.items.push(tx);
  }
  return (
    <div className="space-y-4">
      {groups.map((g) => (
        <section key={g.date}>
          <h3 className="mb-2 text-sm text-muted">{dayHeading(locale, g.date, today)}</h3>
          <div className="space-y-2">
            {g.items.map((tx) => {
              const cat = tx.categoryId ? categoryById(tx.categoryId) : null;
              const signed = tx.kind === "income" ? tx.amount : tx.kind === "transfer" && !tx.categoryId ? 0 : -tx.amount;
              return (
                <button key={tx.id} type="button" className="txn w-full text-left" onClick={() => onOpen(tx.id)}>
                  <TxnAvatar title={tx.title} color={cat?.color ?? "var(--color-cyan)"} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{tx.title}</span>
                    <span className="block truncate text-sm text-muted">{cat ? catLabel(locale, cat.id) : tx.kind === "income" ? t("income") : t("transfer")}</span>
                  </span>
                  <span className={`shrink-0 ${signed > 0 ? "text-good" : ""}`}>{tx.kind === "transfer" && !tx.categoryId ? formatSigned(0, 2) : formatSigned(signed, 2)}</span>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
