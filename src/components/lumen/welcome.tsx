import { useI18n } from "@/lib/i18n";
import { useFinance } from "@/lib/store";

/** First launch: choose between a clean start and made-up sample data. */
export function Welcome() {
  const begin = useFinance((s) => s.begin);
  const { t } = useI18n();
  return (
    <div className="screen-plain absolute inset-0 z-20 flex flex-col justify-center px-6">
      <h1 className="text-3xl font-semibold tracking-tight">{t("welcomeTitle")}</h1>
      <p className="mt-3 leading-relaxed text-muted">{t("welcomeBody")}</p>
      <button type="button" className="mt-8 w-full rounded-2xl bg-cyan py-4 font-semibold text-bg" onClick={() => begin("own")}>
        {t("startOwn")}
      </button>
      <button type="button" className="mt-3 w-full rounded-2xl bg-white/10 py-4 font-semibold" onClick={() => begin("demo")}>
        {t("startDemo")}
      </button>
      <p className="mt-4 text-sm text-muted">{t("startDemoHint")}</p>
    </div>
  );
}
