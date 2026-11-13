import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, ArrowRight, CheckCircle2, Download, GraduationCap, School, BookOpenCheck, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaymentOptionButton } from "@/components/payment-option-button";
import { adminUpdateEducationRegistration, getReferralCoordinator, lookupEducationRegistration, saveEducationProgress, startEducationRegistration, submitEducationPaymentReference, submitEducationRegistration } from "@/lib/education-support.functions";
import { applicationTypeKeys, applicationTypes, educationBasicSchema, educationCoreSchema, educationPrivateSchema, eduStepFields, eduStepKeys, firstDetailsStep, isMinor, stepErrors, type ApplicationType, type EducationLookup, type EduStepKey, type StudentCategory } from "@/lib/education-support/rules";
import { coordinatorTypes, coursesFor, educationSectors, genders, guardianRelationships, indianStates, pgYears, schoolBoards, schoolClasses, schoolTypes, studyModes, ugYears } from "@/lib/education-support/catalog";
import { eduSteps, lbl, type EduLang } from "@/lib/education-support/labels";
import { educationPaymentKey } from "@/lib/payment-options";

type Values = Record<string, string | boolean>;
const DRAFT_KEY = "riloyd-education-support-draft-v2";
const privateKeys = ["bankHolder", "bankName", "bankAccount", "bankAccountConfirm", "bankIfsc", "aadhaarNumber", "kycConsent"];
const boolFields = ["guardianConsent", "withoutCoordinator", "confirmAccurate", "agreeTerms", "consentVerification", "authorizeContact", "understandFees", "kycConsent", "changePrivateDetails"];
const referralKeys = ["coordinatorName", "coordinatorMobile", "coordinatorEmail", "coordinatorType", "coordinatorCode"];
const emptyValues = (): Values => {
  const v: Values = { nationality: "Indian" };
  for (const f of Object.values(eduStepFields).flat()) v[f] = boolFields.includes(f) ? false : (v[f] ?? "");
  return v;
};
const withoutPrivate = (v: Values) => { const c = { ...v }; for (const k of privateKeys) delete c[k]; return c; };

const inputClass = "mt-1.5 w-full rounded-lg border border-edu-navy/20 bg-edu-paper px-3 py-2.5 text-sm text-edu-ink outline-none transition focus:border-edu-royal focus:ring-2 focus:ring-edu-royal/20 aria-[invalid=true]:border-destructive read-only:bg-edu-sky/60";

/** A registration that already has an acknowledgement number. */
type Session = { verify: EducationLookup; paymentStatus: string; hasPrivateDetails: boolean; createdAt: string };
type Done = { ackNumber: string; createdAt: string; paymentStatus: string; applicationType: ApplicationType };
type Referral = { code: string; name: string; mobile: string; email: string; type: string };

export type EducationAdminEdit = { id: string; values: Values; onDone: () => void; onCancel: () => void };

export function EducationSupportForm({ lang, initialCode, adminEdit }: { lang: EduLang; initialCode?: string | undefined; adminEdit?: EducationAdminEdit }) {
  const [values, setValues] = useState<Values>(() => adminEdit ? { ...emptyValues(), ...adminEdit.values, changePrivateDetails: false } : emptyValues());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState(0);
  const [session, setSession] = useState<Session | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const [done, setDone] = useState<Done | null>(null);
  const [referral, setReferral] = useState<Referral | null>(null);
  const [reopen, setReopen] = useState(false);
  const start = useServerFn(startEducationRegistration);
  const saveProgress = useServerFn(saveEducationProgress);
  const submitFull = useServerFn(submitEducationRegistration);
  const adminSave = useServerFn(adminUpdateEducationRegistration);
  const lookupReferral = useServerFn(getReferralCoordinator);
  const t = (k: string) => lbl(lang, k);
  const isAdmin = Boolean(adminEdit);

  // Resume an unfinished registration saved on this device (never bank or Aadhaar details).
  useEffect(() => {
    if (adminEdit) { setLoaded(true); return; }
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as { values?: Values; step?: number; session?: Session };
        if (parsed.values) setValues(v => ({ ...v, ...parsed.values }));
        if (parsed.session?.verify?.ackNumber) { setSession(parsed.session); if (typeof parsed.step === "number") setStep(parsed.step); }
      }
    } catch { /* ignore a broken draft */ }
    setLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { if (loaded && !done && !adminEdit) localStorage.setItem(DRAFT_KEY, JSON.stringify({ values: withoutPrivate(values), step, session })); }, [values, step, session, loaded, done, adminEdit]);

  // Referral link: fill and lock the coordinator details.
  useEffect(() => {
    if (adminEdit || !initialCode) return;
    let cancelled = false;
    void lookupReferral({ data: { code: initialCode } }).then(r => {
      if (cancelled) return;
      if (r) { setReferral(r); setValues(v => ({ ...v, withoutCoordinator: false, coordinatorCode: r.code, coordinatorName: r.name, coordinatorMobile: r.mobile, coordinatorEmail: r.email, coordinatorType: r.type })); }
      else setValues(v => ({ ...v, coordinatorCode: initialCode.toUpperCase().slice(0, 40) }));
    }).catch(() => setValues(v => ({ ...v, coordinatorCode: initialCode.toUpperCase().slice(0, 40) })));
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCode]);

  const dob = String(values["dateOfBirth"] ?? "");
  const minor = /^\d{4}-\d{2}-\d{2}$/.test(dob) && isMinor(dob);
  const hasPrivate = isAdmin || Boolean(session?.hasPrivateDetails);
  const steps = useMemo(() => eduStepKeys(minor).filter(k => !(isAdmin && k === "payment")).map(key => ({
    key, fields: key === "bank" && hasPrivate && values["changePrivateDetails"] !== true ? [] : eduStepFields[key],
  })), [minor, isAdmin, hasPrivate, values]);
  const current = steps[Math.min(step, steps.length - 1)] ?? { key: "basic" as EduStepKey, fields: eduStepFields.basic };
  const paymentStatus = session?.paymentStatus ?? "pending";
  const typeLocked = !isAdmin && paymentStatus !== "pending";

  const set = (name: string, value: string | boolean) => { setValues(v => ({ ...v, [name]: value })); setErrors(e => { const { [name]: _, ...rest } = e; return rest; }); };
  const goTo = (n: number) => { setStep(n); setFormError(""); document.getElementById("registration-form")?.scrollIntoView({ behavior: "smooth", block: "start" }); };
  const fail = (e: unknown) => setFormError(e instanceof Error ? e.message : "Something went wrong. Please try again.");

  async function next() {
    const errs = stepErrors(values, current.fields);
    setErrors(errs);
    if (Object.keys(errs).length) { document.getElementById(`edu-${Object.keys(errs)[0]}`)?.focus(); return; }
    setFormError(""); setNotice("");
    if (current.key === "basic" && !isAdmin) {
      const basic = educationBasicSchema.safeParse({ ...values, coordinatorCode: String(values["coordinatorCode"] ?? "") });
      if (!basic.success) { setFormError(basic.error.issues[0]?.message ?? "Please check the form."); return; }
      setSending(true);
      try {
        if (!session) {
          const r = await start({ data: basic.data });
          setValues(v => ({ ...v, ...r.values }));
          setSession({ verify: { ackNumber: r.ackNumber, dateOfBirth: basic.data.dateOfBirth, state: basic.data.state }, paymentStatus: "pending", hasPrivateDetails: false, createdAt: r.createdAt });
        } else {
          const r = await saveProgress({ data: { verify: session.verify, values: withoutPrivate(values) } });
          setSession({ ...session, verify: r.verify });
        }
        goTo(step + 1);
      } catch (e) { fail(e); } finally { setSending(false); }
      return;
    }
    if (session && !isAdmin && current.key !== "payment") {
      // Progress is saved in the background; the final submission is what counts.
      void saveProgress({ data: { verify: session.verify, values: withoutPrivate(values) } }).catch(() => setNotice(lang === "en" ? "Your progress could not be saved online yet. Keep going — everything is saved when you submit." : "प्रगति अभी ऑनलाइन सेव नहीं हुई। आगे बढ़ें — जमा करने पर सब सेव होगा।"));
    }
    goTo(step + 1);
  }

  async function submit() {
    setFormError("");
    const changePrivateDetails = !hasPrivate || values["changePrivateDetails"] === true;
    const core = educationCoreSchema.safeParse(values);
    const priv = changePrivateDetails ? educationPrivateSchema.safeParse(values) : null;
    const issue = !core.success ? core.error.issues[0] : priv && !priv.success ? priv.error.issues[0] : undefined;
    if (issue) {
      const idx = steps.findIndex(s => s.fields.includes(String(issue.path[0])));
      setErrors(stepErrors(values, steps[idx]?.fields ?? []));
      if (idx >= 0) goTo(idx);
      setFormError(issue.message);
      return;
    }
    setSending(true);
    try {
      if (adminEdit) { await adminSave({ data: { id: adminEdit.id, changePrivateDetails, values } }); adminEdit.onDone(); return; }
      if (!session) { goTo(0); return; }
      const r = await submitFull({ data: { verify: session.verify, changePrivateDetails, values } });
      setDone({ ackNumber: r.ackNumber, createdAt: r.createdAt || session.createdAt, paymentStatus: r.paymentStatus, applicationType: r.applicationType });
      localStorage.removeItem(DRAFT_KEY);
      document.getElementById("registration-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (e) { fail(e); } finally { setSending(false); }
  }

  function resetAll() { localStorage.removeItem(DRAFT_KEY); setDone(null); setSession(null); setValues(emptyValues()); setStep(0); setReferral(null); setErrors({}); setFormError(""); }

  if (done) return <RegistrationDone lang={lang} done={done} values={values} onNew={resetAll} />;

  const field = (name: string, opts: { type?: string; options?: readonly string[]; required?: boolean; label?: string; full?: boolean; placeholder?: string; list?: string; inputMode?: "numeric" | "tel" | "email"; readOnly?: boolean } = {}) => {
    const id = `edu-${name}`; const err = errors[name];
    const common = { id, name, "aria-invalid": err ? true : undefined, "aria-describedby": err ? `${id}-err` : undefined, className: inputClass };
    return <label key={name} htmlFor={id} className={`block text-sm font-semibold text-edu-ink ${opts.full ? "sm:col-span-2" : ""}`}>
      {opts.label ?? t(name)}{opts.required !== false ? <span className="text-edu-royal"> *</span> : <span className="font-normal text-edu-ink/55"> ({t("optional")})</span>}
      {opts.options ? <select {...common} disabled={opts.readOnly} value={String(values[name] ?? "")} onChange={e => set(name, e.target.value)}><option value="">{t("select")}</option>{opts.options.map(o => <option key={o} value={o}>{name === "currentClass" ? `Class ${o}` : o}</option>)}</select>
        : opts.type === "textarea" ? <textarea {...common} rows={2} maxLength={300} value={String(values[name] ?? "")} onChange={e => set(name, e.target.value)} />
        : <input {...common} readOnly={opts.readOnly} type={opts.type ?? "text"} list={opts.list} inputMode={opts.inputMode} placeholder={opts.placeholder} maxLength={name === "coordinatorCode" ? 40 : 200} value={String(values[name] ?? "")} onChange={e => set(name, name === "coordinatorCode" ? e.target.value.toUpperCase() : e.target.value)} />}
      {err && <span id={`${id}-err`} className="mt-1 block text-xs font-semibold text-destructive">{err}</span>}
    </label>;
  };
  const check = (name: string, label?: ReactNode) => <label key={name} htmlFor={`edu-${name}`} className="flex items-start gap-3 rounded-lg border border-edu-navy/10 bg-edu-sky/50 p-3 text-sm text-edu-ink sm:col-span-2">
    <input id={`edu-${name}`} type="checkbox" checked={values[name] === true} onChange={e => set(name, e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--edu-royal)]" />
    <span>{label ?? t(name)}{errors[name] && <span className="mt-1 block text-xs font-semibold text-destructive">{errors[name]}</span>}</span>
  </label>;

  const category = values["studentCategory"] as StudentCategory | "";
  const level = category === "pg" ? "pg" : "ug";
  const courses = category && category !== "school" ? coursesFor(level, String(values["educationSector"])) : [];
  const appType = values["applicationType"] as ApplicationType | "";
  const referralLocked = Boolean(referral) && !isAdmin;

  return <div id="registration-form" className="scroll-mt-6 rounded-3xl border border-edu-navy/10 bg-edu-paper p-4 shadow-[0_20px_60px_-30px_rgba(11,31,75,0.35)] sm:p-8">
    {!isAdmin && !session && step === 0 && <ReopenPanel lang={lang} open={reopen} setOpen={setReopen} onOpened={(r, verify) => {
      setValues({ ...emptyValues(), ...r.values, changePrivateDetails: false });
      setSession({ verify, paymentStatus: r.paymentStatus, hasPrivateDetails: r.hasPrivateDetails, createdAt: "" });
      setReopen(false);
      goTo(firstDetailsStep);
    }} />}
    {session && <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-edu-sky px-4 py-3 text-sm text-edu-navy">
      <span>{lang === "en" ? "Acknowledgement number" : "पावती संख्या"}: <strong className="select-all">{session.verify.ackNumber}</strong></span>
      <button type="button" onClick={resetAll} className="text-xs font-semibold underline">{lang === "en" ? "Start a new registration" : "नया पंजीकरण शुरू करें"}</button>
    </div>}
    {isAdmin && <p className="mb-4 rounded-lg bg-edu-sky px-3 py-2 text-sm font-semibold text-edu-navy">Editing as admin</p>}
    <ol className="flex gap-1.5" aria-label="Registration progress">
      {steps.map((s, i) => <li key={s.key} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-edu-royal" : "bg-edu-navy/10"}`} aria-current={i === step ? "step" : undefined}><span className="sr-only">{eduSteps[s.key]?.[lang === "en" ? 0 : 1]}</span></li>)}
    </ol>
    <p className="mt-4 text-xs font-bold uppercase tracking-wider text-edu-royal [&:lang(hi)]:tracking-normal">{lang === "en" ? `Step ${step + 1} of ${steps.length}` : `चरण ${step + 1} / ${steps.length}`}</p>
    <h3 className="mt-1 text-2xl font-black text-edu-navy">{eduSteps[current.key]?.[lang === "en" ? 0 : 1]}</h3>

    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      {current.key === "basic" && <>
        {field("studentName", { full: true })}{field("dateOfBirth", { type: "date" })}{field("mobile", { type: "tel", inputMode: "tel" })}
        {field("email", { type: "email", inputMode: "email", full: true })}{field("state", { options: indianStates })}{field("district")}
        <fieldset className="sm:col-span-2"><legend className="text-sm font-semibold text-edu-ink">{t("studentCategory")}<span className="text-edu-royal"> *</span></legend>
          <div className="mt-2 grid gap-3 sm:grid-cols-3">{(["school", "ug", "pg"] as const).map(c => { const Icon = c === "school" ? School : c === "ug" ? BookOpenCheck : GraduationCap; return <label key={c} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 text-sm font-bold transition ${category === c ? "border-edu-royal bg-edu-sky text-edu-navy ring-2 ring-edu-royal/20" : "border-edu-navy/15 text-edu-ink hover:border-edu-royal/50"}`}>
            <input type="radio" name="studentCategory" id={c === "school" ? "edu-studentCategory" : undefined} value={c} checked={category === c} onChange={() => set("studentCategory", c)} className="sr-only" /><Icon className="h-5 w-5 text-edu-royal" aria-hidden="true" />{t(c)}</label>; })}</div>
          {errors["studentCategory"] && <span className="mt-1 block text-xs font-semibold text-destructive">{errors["studentCategory"]}</span>}
        </fieldset>
        <fieldset className="sm:col-span-2"><legend className="text-sm font-semibold text-edu-ink">{t("applicationType")}<span className="text-edu-royal"> *</span></legend>
          <div className="mt-2 grid gap-4 md:grid-cols-3">{applicationTypeKeys.map(k => { const a = applicationTypes[k]; const on = appType === k; return <label key={k} className={`relative flex flex-col rounded-2xl border-2 p-5 transition ${typeLocked && !on ? "cursor-not-allowed opacity-50" : "cursor-pointer"} ${on ? "border-edu-royal bg-edu-sky" : "border-edu-navy/10 hover:border-edu-royal/40"}`}>
            <input type="radio" name="applicationType" id={k === "sponsorship" ? "edu-applicationType" : undefined} value={k} checked={on} disabled={typeLocked && !on} onChange={() => set("applicationType", k)} className="sr-only" />
            {on && <CheckCircle2 className="absolute right-4 top-4 h-5 w-5 text-edu-royal" aria-hidden="true" />}
            <span className="text-base font-black text-edu-navy">{lang === "en" ? a.en : a.hi}</span>
            <span className="mt-3 text-3xl font-black text-edu-royal">₹{a.fee}</span>
            <span className="text-xs text-edu-ink/60">{lang === "en" ? "registration fee" : "पंजीकरण शुल्क"}</span>
            {a.maxAward && <span className="mt-3 text-xs text-edu-ink/75">{lang === "en" ? `Maximum potential award: ₹${a.maxAward.toLocaleString("en-IN")}` : `अधिकतम संभावित राशि: ₹${a.maxAward.toLocaleString("en-IN")}`}</span>}
          </label>; })}</div>
          {errors["applicationType"] && <span className="mt-2 block text-xs font-semibold text-destructive">{errors["applicationType"]}</span>}
          {typeLocked && <p className="mt-3 rounded-lg bg-edu-sky px-3 py-2 text-xs text-edu-navy">{lang === "en" ? "You have already shared a payment ID, so the application type cannot be changed now." : "आप पेमेंट आईडी भेज चुके हैं, इसलिए अब आवेदन का प्रकार नहीं बदला जा सकता।"}</p>}
          <p className="mt-3 text-xs leading-relaxed text-edu-ink/70">{lang === "en" ? "Scholarship amounts are maximum potential awards, not guaranteed payments. Final eligibility and amounts depend on the selection criteria and the official decision." : "छात्रवृत्ति राशि अधिकतम संभावित राशि है, गारंटीशुदा भुगतान नहीं। अंतिम पात्रता और राशि चयन मानदंड और आधिकारिक निर्णय पर निर्भर है।"}</p>
        </fieldset>
        {referral && <p className="rounded-lg bg-edu-sky px-3 py-2 text-sm text-edu-navy sm:col-span-2">{lang === "en" ? `Referred by ${referral.name || referral.code}` : `${referral.name || referral.code} द्वारा रेफ़र किया गया`}</p>}
        {!session && !isAdmin && <p className="text-xs text-edu-ink/70 sm:col-span-2">{lang === "en" ? "When you continue, you get your acknowledgement number. Keep it with your date of birth and state to reopen this form later." : "आगे बढ़ने पर आपको पावती संख्या मिलेगी। बाद में फ़ॉर्म खोलने के लिए इसे अपनी जन्म तिथि और राज्य के साथ रखें।"}</p>}
      </>}

      {current.key === "payment" && session && appType && <div className="space-y-5 sm:col-span-2">
        <div className="rounded-2xl bg-edu-navy p-5 text-edu-paper">
          <p className="text-sm font-semibold">{lang === "en" ? applicationTypes[appType].en : applicationTypes[appType].hi} · ₹{applicationTypes[appType].fee}</p>
          <div className="mt-4"><PaymentOptionButton optionKey={educationPaymentKey(appType)} fallbackLink={applicationTypes[appType].paymentLink} label={lang === "en" ? `Pay ₹${applicationTypes[appType].fee} securely` : `₹${applicationTypes[appType].fee} सुरक्षित रूप से भरें`} className="inline-flex h-11 items-center gap-2 rounded-full bg-edu-paper px-6 text-sm font-black text-edu-navy hover:bg-edu-sky" /></div>
          <p className="mt-3 text-xs text-edu-paper/75">{lang === "en" ? `Please mention your acknowledgement number ${session.verify.ackNumber} and the same email/mobile on the payment page if asked.` : `पूछे जाने पर भुगतान पेज पर अपनी पावती संख्या ${session.verify.ackNumber} और वही ईमेल/मोबाइल डालें।`}</p>
        </div>
        <PaymentReference lang={lang} verify={session.verify} status={paymentStatus} onSaved={() => setSession({ ...session, paymentStatus: "reference_submitted" })} />
        <p className="text-xs text-edu-ink/70">{lang === "en" ? "You can continue now and share the payment ID later. Your form is complete only after the final step." : "आप अभी आगे बढ़ सकते हैं और पेमेंट आईडी बाद में भेज सकते हैं। अंतिम चरण के बाद ही फ़ॉर्म पूरा होगा।"}</p>
      </div>}

      {current.key === "education" && <>
        {category === "school" && <>
          {field("currentClass", { options: schoolClasses })}{field("schoolName")}{field("schoolType", { options: schoolTypes })}{field("schoolBoard", { options: schoolBoards })}
          {field("schoolAddress", { type: "textarea", full: true })}{field("schoolCity")}{field("schoolState", { options: indianStates })}{field("schoolPin", { inputMode: "numeric" })}
          {field("academicSession", { placeholder: "2026-27" })}{field("educationSector", { options: educationSectors, required: false, label: t("educationSectorSchool"), full: true })}
        </>}
        {(category === "ug" || category === "pg") && <>
          {field("educationSector", { options: educationSectors, full: true })}
          {field("courseName", { list: "edu-course-list", placeholder: t("coursePlaceholder") })}
          <datalist id="edu-course-list">{courses.map(c => <option key={c.name} value={c.name} />)}</datalist>
          {field("courseSpecialization", { required: false })}{field("collegeName", { full: true })}{field("enrollmentNumber", { required: false })}
          {field("currentYear", { options: category === "pg" ? pgYears : ugYears })}{field("currentSemester", { required: false })}{field("studyMode", { options: studyModes })}
          {field("collegeState", { options: indianStates })}{field("collegeCity")}{field("academicSession", { placeholder: "2026-27" })}
        </>}
      </>}

      {current.key === "personal" && <>
        {field("fatherName")}{field("motherName")}{field("gender", { options: genders })}{field("nationality")}{field("whatsapp", { type: "tel", inputMode: "tel", required: false })}
        {field("permanentAddress", { type: "textarea", full: true })}
        <label className="flex items-center gap-2 text-sm text-edu-ink sm:col-span-2"><input type="checkbox" className="h-4 w-4 accent-[var(--edu-royal)]" checked={values["currentAddress"] !== "" && values["currentAddress"] === values["permanentAddress"]} onChange={e => set("currentAddress", e.target.checked ? String(values["permanentAddress"]) : "")} />{t("sameAddress")}</label>
        {field("currentAddress", { type: "textarea", full: true })}{field("city")}{field("pinCode", { inputMode: "numeric" })}
      </>}

      {current.key === "guardian" && <>
        <p className="rounded-lg bg-edu-sky px-3 py-2 text-sm text-edu-navy sm:col-span-2">{lang === "en" ? "The student is under 18, so a parent or legal guardian must complete or supervise this registration." : "विद्यार्थी की आयु 18 वर्ष से कम है, इसलिए माता-पिता या कानूनी अभिभावक को यह पंजीकरण भरना या देखना होगा।"}</p>
        {field("guardianName", { full: true })}{field("guardianRelationship", { options: guardianRelationships })}{field("guardianMobile", { type: "tel", inputMode: "tel" })}{field("guardianEmail", { type: "email", required: false, full: true })}
        {check("guardianConsent")}
      </>}

      {current.key === "coordinator" && <>
        {referralLocked && <p className="rounded-lg bg-edu-sky px-3 py-2 text-sm text-edu-navy sm:col-span-2">{lang === "en" ? "These details come from your referral link." : "ये जानकारी आपके रेफ़रल लिंक से भरी गई है।"}</p>}
        {!referralLocked && check("withoutCoordinator")}
        {values["withoutCoordinator"] !== true && <>
          {field("coordinatorName", { readOnly: referralLocked })}{field("coordinatorType", { options: coordinatorTypes, readOnly: referralLocked })}{field("coordinatorMobile", { type: "tel", inputMode: "tel", readOnly: referralLocked })}{field("coordinatorWhatsapp", { type: "tel", inputMode: "tel", required: false })}
          {field("coordinatorEmail", { type: "email", required: false, readOnly: referralLocked })}{field("coordinatorInstitution", { required: false })}{field("coordinatorIdText", { required: false, label: t("coordinatorIdText").replace(/ \((optional|वैकल्पिक)\)/, "") })}{field("coordinatorCode", { required: false, readOnly: referralLocked, label: t("coordinatorCode").replace(/ \((optional|वैकल्पिक)\)/, "") })}
        </>}
      </>}

      {current.key === "bank" && hasPrivate && <label htmlFor="edu-changePrivateDetails" className="flex items-start gap-3 rounded-lg border border-edu-royal/30 bg-edu-sky p-3 text-sm font-semibold text-edu-navy sm:col-span-2">
        <input id="edu-changePrivateDetails" type="checkbox" checked={values["changePrivateDetails"] === true} onChange={e => set("changePrivateDetails", e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--edu-royal)]" />
        <span>{lang === "en" ? "I want to change bank or Aadhaar details. Leave unticked to keep the details already saved." : "मुझे बैंक या आधार जानकारी बदलनी है। पहले से सेव जानकारी रखने के लिए इसे खाली छोड़ें।"}</span>
      </label>}
      {current.key === "bank" && (!hasPrivate || values["changePrivateDetails"] === true) && <>
        <p className="text-sm text-edu-ink sm:col-span-2">{lang === "en" ? "Enter bank and Aadhaar details as text. No document uploads. These details are encrypted and available only to authorised administrators; they are not saved in your device draft or printed on the acknowledgement." : "बैंक और आधार जानकारी लिखकर भरें। दस्तावेज़ अपलोड नहीं करें। यह जानकारी एन्क्रिप्टेड है और केवल अधिकृत एडमिन देख सकते हैं; डिवाइस ड्राफ्ट या पावती में नहीं रखी जाती।"}</p>
        {field("bankHolder")}{field("bankName")}{field("bankAccount", { inputMode: "numeric", type: "password" })}{field("bankAccountConfirm", { inputMode: "numeric", type: "password" })}{field("bankIfsc")}{field("aadhaarNumber", { inputMode: "numeric", type: "password" })}{check("kycConsent")}
      </>}
      {current.key === "declaration" && <>{eduStepFields.declaration.map(k => check(k))}</>}

      {current.key === "review" && <div className="space-y-3 text-sm sm:col-span-2">
        {[[t("studentName"), String(values["studentName"])], [t("studentCategory"), category ? t(category) : "—"], [category === "school" ? t("currentClass") : t("courseName"), category === "school" ? `Class ${values["currentClass"]}` : String(values["courseName"])], [category === "school" ? t("schoolName") : t("collegeName"), String(category === "school" ? values["schoolName"] : values["collegeName"])], [t("mobile"), String(values["mobile"])], [t("email"), String(values["email"])], [t("coordinatorName"), values["withoutCoordinator"] ? (lang === "en" ? "Without a coordinator" : "बिना कोऑर्डिनेटर") : String(values["coordinatorName"])], [t("applicationType"), appType ? (lang === "en" ? applicationTypes[appType].en : applicationTypes[appType].hi) : "—"]].map(([k, v]) => <div key={k} className="flex flex-wrap justify-between gap-2 border-b border-edu-navy/10 pb-2"><span className="text-edu-ink/60">{k}</span><span className="font-bold text-edu-navy">{v}</span></div>)}
        {!isAdmin && <p className="text-xs text-edu-ink/70">{lang === "en" ? "Check your details, then submit. You can reopen and edit the form until your payment is confirmed." : "जानकारी जाँचें, फिर जमा करें। भुगतान की पुष्टि होने तक आप फ़ॉर्म खोलकर बदल सकते हैं।"}</p>}
      </div>}
    </div>

    {notice && <p className="mt-4 text-xs font-semibold text-edu-navy">{notice}</p>}
    {formError && <p role="alert" className="mt-4 text-sm font-semibold text-destructive">{formError}</p>}
    <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
      <div className="flex gap-2">
        <Button type="button" variant="outline" disabled={step === 0 || sending} onClick={() => goTo(step - 1)} className="h-11 rounded-full border-edu-navy/20 bg-transparent px-6 text-edu-navy hover:bg-edu-sky hover:text-edu-navy"><ArrowLeft className="h-4 w-4" />{t("back")}</Button>
        {adminEdit && <Button type="button" variant="ghost" disabled={sending} onClick={adminEdit.onCancel} className="h-11 rounded-full text-edu-navy">Cancel</Button>}
      </div>
      {current.key === "review"
        ? <Button type="button" disabled={sending} onClick={() => void submit()} className="h-11 rounded-full bg-edu-royal px-8 text-edu-paper hover:bg-edu-royal/90">{sending ? t("submitting") : isAdmin ? "Save changes" : t("submit")}</Button>
        : <Button type="button" disabled={sending} onClick={() => void next()} className="h-11 rounded-full bg-edu-royal px-8 text-edu-paper hover:bg-edu-royal/90">{sending ? t("submitting") : current.key === "basic" && !session && !isAdmin ? (lang === "en" ? "Get acknowledgement number" : "पावती संख्या प्राप्त करें") : t("next")}<ArrowRight className="h-4 w-4" /></Button>}
    </div>
  </div>;
}

type Opened = Awaited<ReturnType<typeof lookupEducationRegistration>>;
function ReopenPanel({ lang, open, setOpen, onOpened }: { lang: EduLang; open: boolean; setOpen: (v: boolean) => void; onOpened: (r: Opened, verify: EducationLookup) => void }) {
  const lookup = useServerFn(lookupEducationRegistration);
  const [ack, setAck] = useState(""); const [dob, setDob] = useState(""); const [state, setState] = useState("");
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  async function go(e: React.FormEvent) {
    e.preventDefault(); setError(""); setBusy(true);
    const verify = { ackNumber: ack.trim().toUpperCase(), dateOfBirth: dob, state };
    try { onOpened(await lookup({ data: verify }), verify); }
    catch (err) { setError(err instanceof Error ? err.message : "Please try again."); }
    finally { setBusy(false); }
  }
  if (!open) return <button type="button" onClick={() => setOpen(true)} className="mb-5 inline-flex items-center gap-2 rounded-full border border-edu-navy/20 px-4 py-2 text-sm font-bold text-edu-navy hover:bg-edu-sky"><FolderOpen className="h-4 w-4" aria-hidden="true" />{lang === "en" ? "Already have an acknowledgement number? Open your form" : "पावती संख्या है? अपना फ़ॉर्म खोलें"}</button>;
  return <form onSubmit={e => void go(e)} className="mb-6 grid gap-3 rounded-2xl border border-edu-royal/30 bg-edu-sky/60 p-4 sm:grid-cols-3">
    <p className="text-sm font-bold text-edu-navy sm:col-span-3">{lang === "en" ? "Open your registration" : "अपना पंजीकरण खोलें"}</p>
    <label className="text-sm font-semibold text-edu-ink">{lang === "en" ? "Acknowledgement number" : "पावती संख्या"}<input required value={ack} onChange={e => setAck(e.target.value)} maxLength={20} className={inputClass} /></label>
    <label className="text-sm font-semibold text-edu-ink">{lbl(lang, "dateOfBirth")}<input required type="date" value={dob} onChange={e => setDob(e.target.value)} className={inputClass} /></label>
    <label className="text-sm font-semibold text-edu-ink">{lbl(lang, "state")}<select required value={state} onChange={e => setState(e.target.value)} className={inputClass}><option value="">{lbl(lang, "select")}</option>{indianStates.map(s => <option key={s} value={s}>{s}</option>)}</select></label>
    {error && <p role="alert" className="text-sm font-semibold text-destructive sm:col-span-3">{error}</p>}
    <div className="flex gap-2 sm:col-span-3">
      <Button type="submit" disabled={busy} className="h-10 rounded-full bg-edu-royal px-6 text-edu-paper hover:bg-edu-royal/90">{busy ? "…" : lang === "en" ? "Open form" : "फ़ॉर्म खोलें"}</Button>
      <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="h-10 rounded-full text-edu-navy">{lang === "en" ? "Cancel" : "रद्द करें"}</Button>
    </div>
  </form>;
}

function PaymentReference({ lang, verify, status, onSaved }: { lang: EduLang; verify: EducationLookup; status: string; onSaved: () => void }) {
  const saveRef = useServerFn(submitEducationPaymentReference);
  const [reference, setReference] = useState("");
  const [state, setState] = useState<{ busy: boolean; error?: string }>({ busy: false });
  if (status === "paid") return <p className="rounded-2xl border border-edu-navy/10 bg-edu-sky/60 p-5 text-sm text-edu-navy">{lang === "en" ? "Payment confirmed." : "भुगतान की पुष्टि हो गई।"}</p>;
  async function send(e: React.FormEvent) {
    e.preventDefault(); setState({ busy: true });
    try { await saveRef({ data: { verify, reference: reference.trim() } }); setState({ busy: false }); onSaved(); }
    catch (err) { setState({ busy: false, error: err instanceof Error ? err.message : "Please try again." }); }
  }
  return <div className="rounded-2xl border border-edu-navy/10 bg-edu-sky/60 p-5">
    <p className="text-sm font-semibold text-edu-navy">{lang === "en" ? "Share your payment ID" : "अपनी पेमेंट आईडी भेजें"}</p>
    {status === "reference_submitted" && <p className="mt-2 text-sm text-edu-ink">{lang === "en" ? "Payment ID received. Our team will match your payment and confirm it. You can send a corrected ID below." : "पेमेंट आईडी मिल गई। हमारी टीम मिलान करके पुष्टि करेगी। ज़रूरत हो तो नीचे सही आईडी भेजें।"}</p>}
    <form onSubmit={e => void send(e)} className="mt-3 flex flex-col gap-2 sm:flex-row">
      <label className="sr-only" htmlFor="edu-payment-ref">Payment ID</label>
      <input id="edu-payment-ref" value={reference} onChange={e => setReference(e.target.value)} placeholder="pay_XXXXXXXXXXXX" maxLength={60} className={`${inputClass} mt-0 sm:flex-1`} />
      <Button type="submit" disabled={state.busy || reference.trim().length < 6} className="h-11 rounded-full bg-edu-royal px-6 text-edu-paper hover:bg-edu-royal/90">{state.busy ? "…" : lang === "en" ? "Send payment ID" : "आईडी भेजें"}</Button>
    </form>
    {state.error && <p role="alert" className="mt-2 text-xs font-semibold text-destructive">{state.error}</p>}
    <p className="mt-2 text-xs text-edu-ink/60">{lang === "en" ? "Find it in the Razorpay receipt email/SMS after paying." : "भुगतान के बाद Razorpay की रसीद ईमेल/SMS में मिलेगी।"}</p>
  </div>;
}

function RegistrationDone({ lang, done, values, onNew }: { lang: EduLang; done: Done; values: Values; onNew: () => void }) {
  const app = applicationTypes[done.applicationType];
  const [pdfUrl, setPdfUrl] = useState("");
  const category = String(values["studentCategory"]);
  // Prepare the PDF before the click so phone downloads keep the tap.
  useEffect(() => {
    let url = ""; let cancelled = false;
    const payStatus = (["pending", "reference_submitted", "paid", "failed"].includes(done.paymentStatus) ? done.paymentStatus : "pending") as "pending";
    void import("@/lib/education-support/acknowledgement").then(m => m.buildAcknowledgementPdf({
      ackNumber: done.ackNumber, studentName: String(values["studentName"]), createdAt: done.createdAt || new Date().toISOString(),
      category: category === "school" ? "School student" : category === "ug" ? "Undergraduate (UG)" : "Postgraduate (PG)",
      classOrCourse: category === "school" ? `Class ${values["currentClass"]}` : String(values["courseName"]), sector: String(values["educationSector"]),
      applicationType: done.applicationType, coordinatorName: values["withoutCoordinator"] ? "" : String(values["coordinatorName"]), paymentStatus: payStatus,
    })).then(blob => { if (cancelled) return; url = URL.createObjectURL(blob); setPdfUrl(url); });
    return () => { cancelled = true; if (url) URL.revokeObjectURL(url); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <div id="registration-form" role="status" className="scroll-mt-6 rounded-3xl border border-edu-navy/10 bg-edu-paper p-5 text-edu-ink shadow-[0_20px_60px_-30px_rgba(11,31,75,0.35)] sm:p-8">
    <CheckCircle2 className="h-12 w-12 text-edu-royal" aria-hidden="true" />
    <h3 className="mt-3 text-2xl font-black text-edu-navy">{lang === "en" ? "Registration submitted" : "पंजीकरण जमा हो गया"}</h3>
    <p className="mt-2 text-sm text-edu-ink/75">{lang === "en" ? "Your acknowledgement number:" : "आपकी पावती संख्या:"}</p>
    <p className="mt-1 select-all break-all text-2xl font-black text-edu-royal sm:text-3xl">{done.ackNumber}</p>
    <p className="mt-2 text-xs text-edu-ink/60">{lang === "en" ? "Save this number. With your date of birth and state you can reopen and edit the form until payment is confirmed." : "यह संख्या सुरक्षित रखें। जन्म तिथि और राज्य के साथ आप भुगतान की पुष्टि तक फ़ॉर्म खोलकर बदल सकते हैं।"}</p>
    {done.paymentStatus === "pending" && app && <div className="mt-6 rounded-2xl bg-edu-navy p-5 text-edu-paper">
      <p className="text-sm font-semibold">{lang === "en" ? "Registration fee still to pay" : "पंजीकरण शुल्क अभी बाकी है"} · ₹{app.fee}</p>
      <div className="mt-4"><PaymentOptionButton optionKey={educationPaymentKey(done.applicationType)} fallbackLink={app.paymentLink} label={lang === "en" ? `Pay ₹${app.fee} securely` : `₹${app.fee} सुरक्षित रूप से भरें`} className="inline-flex h-11 items-center gap-2 rounded-full bg-edu-paper px-6 text-sm font-black text-edu-navy hover:bg-edu-sky" /></div>
    </div>}
    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
      <Button asChild variant="outline" className="h-11 rounded-full border-edu-navy/20 bg-transparent text-edu-navy hover:bg-edu-sky hover:text-edu-navy" disabled={!pdfUrl}>
        <a href={pdfUrl || undefined} download={`${done.ackNumber}.pdf`} aria-disabled={!pdfUrl}><Download className="h-4 w-4" />{lang === "en" ? "Download acknowledgement (PDF)" : "पावती डाउनलोड करें (PDF)"}</a>
      </Button>
      <Button type="button" variant="ghost" onClick={onNew} className="h-11 rounded-full text-edu-navy hover:bg-edu-sky hover:text-edu-navy">{lang === "en" ? "Register another student" : "दूसरे विद्यार्थी का पंजीकरण"}</Button>
    </div>
  </div>;
}
