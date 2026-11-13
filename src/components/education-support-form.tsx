import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, ArrowRight, CheckCircle2, Download, ExternalLink, GraduationCap, School, BookOpenCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminUpdateEducationRegistration, submitEducationPaymentReference, submitEducationSupport, updateEducationRegistration } from "@/lib/education-support.functions";
import { applicationTypeKeys, applicationTypes, educationCoreSchema, educationPrivateSchema, educationSupportSchema, isMinor, stepErrors, stepFields, type ApplicationType, type EducationLookup, type StudentCategory } from "@/lib/education-support/rules";
import { coordinatorTypes, coursesFor, educationSectors, genders, guardianRelationships, indianStates, pgYears, schoolBoards, schoolClasses, schoolTypes, studyModes, ugYears } from "@/lib/education-support/catalog";
import { eduSteps, lbl, type EduLang } from "@/lib/education-support/labels";

type Values = Record<string, string | boolean>;
const DRAFT_KEY = "riloyd-education-support-draft";
const boolFields = ["guardianConsent", "withoutCoordinator", "confirmAccurate", "agreeTerms", "consentVerification", "authorizeContact", "understandFees", "kycConsent"];
const emptyValues = (): Values => {
  const v: Values = { nationality: "Indian" };
  for (const step of stepFields) for (const f of step) v[f] = boolFields.includes(f) ? false : (v[f] ?? "");
  v["studentCategory"] = "";
  v["applicationType"] = "";
  return v;
};

const inputClass = "mt-1.5 w-full rounded-lg border border-edu-navy/20 bg-edu-paper px-3 py-2.5 text-sm text-edu-ink outline-none transition focus:border-edu-royal focus:ring-2 focus:ring-edu-royal/20 aria-[invalid=true]:border-destructive";

type Result = { ackNumber: string; createdAt: string; receiptToken: string; fee: number; applicationType: ApplicationType; coordinatorName: string };
type EditSavedResult = { ackNumber: string; paymentStatus: string; fee: number; applicationType: ApplicationType };

/** Editing an existing registration: by the student (verified by acknowledgement no., mobile and date of birth) or by an admin. */
export type EducationEditMode =
  | { kind: "student"; verify: EducationLookup; values: Values; paymentStatus: string; onCancel: () => void }
  | { kind: "admin"; id: string; values: Values; onDone: () => void; onCancel: () => void };

export function EducationSupportForm({ lang, initialCode, edit }: { lang: EduLang; initialCode?: string | undefined; edit?: EducationEditMode }) {
  const [values, setValues] = useState<Values>(() => edit ? { ...emptyValues(), ...edit.values, changePrivateDetails: false } : emptyValues());
  const [editSaved, setEditSaved] = useState<EditSavedResult | null>(null);
  const studentUpdate = useServerFn(updateEducationRegistration);
  const adminUpdate = useServerFn(adminUpdateEducationRegistration);
  const typeLocked = edit?.kind === "student" && edit.paymentStatus !== "pending";
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const submit = useServerFn(submitEducationSupport);
  const t = (k: string) => lbl(lang, k);

  // Resume an unfinished registration saved on this device.
  useEffect(() => {
    if (edit) { setLoaded(true); return; }
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) { const parsed = JSON.parse(saved) as { values?: Values; step?: number }; if (parsed.values) setValues(v => ({ ...v, ...parsed.values })); if (typeof parsed.step === "number") setStep(parsed.step); }
    } catch { /* ignore a broken draft */ }
    if (initialCode) setValues(v => ({ ...v, coordinatorCode: initialCode.toUpperCase().slice(0, 40) }));
    setLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCode]);
  useEffect(() => { if (loaded && !result && !edit) { const safeValues = { ...values }; for (const k of ['bankHolder','bankName','bankAccount','bankAccountConfirm','bankIfsc','aadhaarNumber','kycConsent']) delete safeValues[k]; localStorage.setItem(DRAFT_KEY, JSON.stringify({ values: safeValues, step })); } }, [values, step, loaded, result, edit]);

  const dob = String(values["dateOfBirth"] ?? "");
  const minor = /^\d{4}-\d{2}-\d{2}$/.test(dob) && isMinor(dob);
  const steps = useMemo(() => [
    { key: "education", fields: stepFields[0] ?? [] }, { key: "personal", fields: stepFields[1] ?? [] },
    ...(minor ? [{ key: "guardian", fields: stepFields[2] ?? [] }] : []),
    { key: "coordinator", fields: stepFields[3] ?? [] }, { key: "apply", fields: stepFields[4] ?? [] }, { key: 'bank', fields: edit && values["changePrivateDetails"] !== true ? [] : stepFields[6] ?? [] }, { key: "declaration", fields: stepFields[5] ?? [] }, { key: "review", fields: [] as string[] },
  ], [minor, edit, values["changePrivateDetails"]]);
  const current = steps[Math.min(step, steps.length - 1)] ?? { key: 'education', fields: stepFields[0] ?? [] };

  const set = (name: string, value: string | boolean) => { setValues(v => ({ ...v, [name]: value })); setErrors(e => { const { [name]: _, ...rest } = e; return rest; }); };
  const goTo = (n: number) => { setStep(n); document.getElementById("registration-form")?.scrollIntoView({ behavior: "smooth", block: "start" }); };
  function next() {
    const errs = stepErrors(values, current.fields);
    setErrors(errs);
    if (Object.keys(errs).length) { document.getElementById(`edu-${Object.keys(errs)[0]}`)?.focus(); return; }
    goTo(step + 1);
  }
  async function send() {
    setFormError("");
    if (edit) return void sendEdit();
    const parsed = educationSupportSchema.safeParse(values);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      const idx = steps.findIndex(s => s.fields.includes(String(first?.path[0])));
      setErrors(stepErrors(values, steps[idx]?.fields ?? []));
      if (idx >= 0) goTo(idx);
      setFormError(first?.message ?? "Please check the form.");
      return;
    }
    setSending(true);
    try {
      const r = await submit({ data: parsed.data });
      setResult(r);
      localStorage.removeItem(DRAFT_KEY);
      document.getElementById("registration-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (e) { setFormError(e instanceof Error ? e.message : "Something went wrong. Please try again."); }
    finally { setSending(false); }
  }

  async function sendEdit() {
    if (!edit) return;
    const changePrivateDetails = values["changePrivateDetails"] === true;
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
      if (edit.kind === "admin") { await adminUpdate({ data: { id: edit.id, changePrivateDetails, values } }); edit.onDone(); }
      else { setEditSaved(await studentUpdate({ data: { verify: edit.verify, changePrivateDetails, values } })); document.getElementById("registration-form")?.scrollIntoView({ behavior: "smooth", block: "start" }); }
    } catch (e) { setFormError(e instanceof Error ? e.message : "Something went wrong. Please try again."); }
    finally { setSending(false); }
  }

  if (editSaved) return <EditSaved lang={lang} result={editSaved} onClose={edit?.onCancel ?? (() => setEditSaved(null))} />;
  if (result) return <RegistrationDone lang={lang} result={result} values={values} onNew={() => { setResult(null); setValues(emptyValues()); setStep(0); }} />;

  const field = (name: string, opts: { type?: string; options?: readonly string[]; required?: boolean; label?: string; full?: boolean; placeholder?: string; list?: string; inputMode?: "numeric" | "tel" | "email" } = {}) => {
    const id = `edu-${name}`; const err = errors[name];
    const common = { id, name, "aria-invalid": err ? true : undefined, "aria-describedby": err ? `${id}-err` : undefined, className: inputClass };
    return <label key={name} htmlFor={id} className={`block text-sm font-semibold text-edu-ink ${opts.full ? "sm:col-span-2" : ""}`}>
      {opts.label ?? t(name)}{opts.required !== false ? <span className="text-edu-royal"> *</span> : <span className="font-normal text-edu-ink/55"> ({t("optional")})</span>}
      {opts.options ? <select {...common} value={String(values[name] ?? "")} onChange={e => set(name, e.target.value)}><option value="">{t("select")}</option>{opts.options.map(o => <option key={o} value={o}>{name === "currentClass" ? `Class ${o}` : o}</option>)}</select>
        : opts.type === "textarea" ? <textarea {...common} rows={2} maxLength={300} value={String(values[name] ?? "")} onChange={e => set(name, e.target.value)} />
        : <input {...common} type={opts.type ?? "text"} list={opts.list} inputMode={opts.inputMode} placeholder={opts.placeholder} maxLength={name === "coordinatorCode" ? 40 : 200} value={String(values[name] ?? "")} onChange={e => set(name, name === "coordinatorCode" ? e.target.value.toUpperCase() : e.target.value)} />}
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

  return <div id="registration-form" className="scroll-mt-6 rounded-3xl border border-edu-navy/10 bg-edu-paper p-4 shadow-[0_20px_60px_-30px_rgba(11,31,75,0.35)] sm:p-8">
    <ol className="flex gap-1.5" aria-label="Registration progress">
      {steps.map((s, i) => <li key={s.key} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-edu-royal" : "bg-edu-navy/10"}`} aria-current={i === step ? "step" : undefined}><span className="sr-only">{eduSteps[s.key]?.[lang === "en" ? 0 : 1]}</span></li>)}
    </ol>
    {edit && <p className="mt-4 rounded-lg bg-edu-sky px-3 py-2 text-sm font-semibold text-edu-navy">{lang === "en" ? "Editing registration" : "पंजीकरण एडिट हो रहा है"} {edit.kind === "student" ? edit.verify.ackNumber : ""}</p>}
    <p className="mt-4 text-xs font-bold uppercase tracking-wider text-edu-royal [&:lang(hi)]:tracking-normal">{lang === "en" ? `Step ${step + 1} of ${steps.length}` : `चरण ${step + 1} / ${steps.length}`}</p>
    <h3 className="mt-1 text-2xl font-black text-edu-navy">{eduSteps[current.key]?.[lang === "en" ? 0 : 1]}</h3>

    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      {current.key === "education" && <>
        <fieldset className="sm:col-span-2"><legend className="text-sm font-semibold text-edu-ink">{t("studentCategory")}<span className="text-edu-royal"> *</span></legend>
          <div className="mt-2 grid gap-3 sm:grid-cols-3">{(["school", "ug", "pg"] as const).map(c => { const Icon = c === "school" ? School : c === "ug" ? BookOpenCheck : GraduationCap; return <label key={c} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 text-sm font-bold transition ${category === c ? "border-edu-royal bg-edu-sky text-edu-navy ring-2 ring-edu-royal/20" : "border-edu-navy/15 text-edu-ink hover:border-edu-royal/50"}`}>
            <input type="radio" name="studentCategory" id={c === "school" ? "edu-studentCategory" : undefined} value={c} checked={category === c} onChange={() => set("studentCategory", c)} className="sr-only" /><Icon className="h-5 w-5 text-edu-royal" aria-hidden="true" />{t(c)}</label>; })}</div>
          {errors["studentCategory"] && <span className="mt-1 block text-xs font-semibold text-destructive">{errors["studentCategory"]}</span>}
        </fieldset>
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
        {field("studentName", { full: true })}{field("fatherName")}{field("motherName")}{field("dateOfBirth", { type: "date" })}{field("gender", { options: genders })}
        {field("nationality")}{field("email", { type: "email", inputMode: "email" })}{field("mobile", { type: "tel", inputMode: "tel" })}{field("whatsapp", { type: "tel", inputMode: "tel", required: false })}
        {field("permanentAddress", { type: "textarea", full: true })}
        <label className="flex items-center gap-2 text-sm text-edu-ink sm:col-span-2"><input type="checkbox" className="h-4 w-4 accent-[var(--edu-royal)]" checked={values["currentAddress"] !== "" && values["currentAddress"] === values["permanentAddress"]} onChange={e => set("currentAddress", e.target.checked ? String(values["permanentAddress"]) : "")} />{t("sameAddress")}</label>
        {field("currentAddress", { type: "textarea", full: true })}{field("state", { options: indianStates })}{field("district")}{field("city")}{field("pinCode", { inputMode: "numeric" })}
      </>}

      {current.key === "guardian" && <>
        <p className="rounded-lg bg-edu-sky px-3 py-2 text-sm text-edu-navy sm:col-span-2">{lang === "en" ? "The student is under 18, so a parent or legal guardian must complete or supervise this registration." : "विद्यार्थी की आयु 18 वर्ष से कम है, इसलिए माता-पिता या कानूनी अभिभावक को यह पंजीकरण भरना या देखना होगा।"}</p>
        {field("guardianName", { full: true })}{field("guardianRelationship", { options: guardianRelationships })}{field("guardianMobile", { type: "tel", inputMode: "tel" })}{field("guardianEmail", { type: "email", required: false, full: true })}
        {check("guardianConsent")}
      </>}

      {current.key === "coordinator" && <>
        {check("withoutCoordinator")}
        {values["withoutCoordinator"] !== true && <>
          {field("coordinatorName")}{field("coordinatorType", { options: coordinatorTypes })}{field("coordinatorMobile", { type: "tel", inputMode: "tel" })}{field("coordinatorWhatsapp", { type: "tel", inputMode: "tel", required: false })}
          {field("coordinatorEmail", { type: "email", required: false })}{field("coordinatorInstitution", { required: false })}{field("coordinatorIdText", { required: false, label: t("coordinatorIdText").replace(/ \((optional|वैकल्पिक)\)/, "") })}{field("coordinatorCode", { required: false, label: t("coordinatorCode").replace(/ \((optional|वैकल्पिक)\)/, "") })}
        </>}
      </>}

      {current.key === "apply" && <fieldset className="sm:col-span-2"><legend className="sr-only">{t("applicationType")}</legend>
        <div className="grid gap-4 md:grid-cols-3">{applicationTypeKeys.map(k => { const a = applicationTypes[k]; const on = appType === k; return <label key={k} className={`relative flex cursor-pointer flex-col rounded-2xl border-2 p-5 transition ${on ? "border-edu-royal bg-edu-sky" : "border-edu-navy/10 hover:border-edu-royal/40"}`}>
          <input type="radio" name="applicationType" id={k === "sponsorship" ? "edu-applicationType" : undefined} value={k} checked={on} disabled={typeLocked && !on} onChange={() => set("applicationType", k)} className="sr-only" />
          {on && <CheckCircle2 className="absolute right-4 top-4 h-5 w-5 text-edu-royal" aria-hidden="true" />}
          <span className="text-base font-black text-edu-navy">{lang === "en" ? a.en : a.hi}</span>
          <span className="mt-3 text-3xl font-black text-edu-royal">₹{a.fee}</span>
          <span className="text-xs text-edu-ink/60">{lang === "en" ? "registration fee" : "पंजीकरण शुल्क"}</span>
          {a.maxAward && <span className="mt-3 text-xs text-edu-ink/75">{lang === "en" ? `Maximum potential award: ₹${a.maxAward.toLocaleString("en-IN")}` : `अधिकतम संभावित राशि: ₹${a.maxAward.toLocaleString("en-IN")}`}</span>}
        </label>; })}</div>
        {errors["applicationType"] && <span className="mt-2 block text-xs font-semibold text-destructive">{errors["applicationType"]}</span>}
        {typeLocked && <p className="mt-3 rounded-lg bg-edu-sky px-3 py-2 text-xs text-edu-navy">{lang === "en" ? "You have already shared a payment ID, so the application type cannot be changed now." : "आप पेमेंट आईडी भेज चुके हैं, इसलिए अब आवेदन का प्रकार नहीं बदला जा सकता।"}</p>}
        <p className="mt-4 text-xs leading-relaxed text-edu-ink/70">{lang === "en" ? "Scholarship amounts are maximum potential awards, not guaranteed payments. Final eligibility and amounts depend on the selection criteria and the official decision." : "छात्रवृत्ति राशि अधिकतम संभावित राशि है, गारंटीशुदा भुगतान नहीं। अंतिम पात्रता और राशि चयन मानदंड और आधिकारिक निर्णय पर निर्भर है।"}</p>
      </fieldset>}

      {current.key === 'bank' && edit && <label htmlFor="edu-changePrivateDetails" className="flex items-start gap-3 rounded-lg border border-edu-royal/30 bg-edu-sky p-3 text-sm font-semibold text-edu-navy sm:col-span-2">
        <input id="edu-changePrivateDetails" type="checkbox" checked={values["changePrivateDetails"] === true} onChange={e => set("changePrivateDetails", e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--edu-royal)]" />
        <span>{lang === "en" ? "I want to change bank or Aadhaar details. Leave unticked to keep the details already saved." : "मुझे बैंक या आधार जानकारी बदलनी है। पहले से सेव जानकारी रखने के लिए इसे खाली छोड़ें।"}</span>
      </label>}
      {current.key === 'bank' && (!edit || values["changePrivateDetails"] === true) && <>
        <p className="text-sm text-edu-ink sm:col-span-2">{lang === 'en' ? 'Enter bank and Aadhaar details as text. No document uploads. These details are encrypted and available only to authorised administrators; they are not saved in your device draft or printed on the acknowledgement.' : 'बैंक और आधार जानकारी लिखकर भरें। दस्तावेज़ अपलोड नहीं करें। यह जानकारी एन्क्रिप्टेड है और केवल अधिकृत एडमिन देख सकते हैं; डिवाइस ड्राफ्ट या पावती में नहीं रखी जाती।'}</p>
        {field('bankHolder')}{field('bankName')}{field('bankAccount', { inputMode: 'numeric', type: 'password' })}{field('bankAccountConfirm', { inputMode: 'numeric', type: 'password' })}{field('bankIfsc')}{field('aadhaarNumber', { inputMode: 'numeric', type: 'password' })}{check('kycConsent')}
      </>}
      {current.key === "declaration" && <>{["confirmAccurate", "agreeTerms", "consentVerification", "authorizeContact", "understandFees"].map(k => check(k))}</>}

      {current.key === "review" && <div className="space-y-3 text-sm sm:col-span-2">
        {[[t("studentCategory"), category ? t(category) : "—"], [category === "school" ? t("currentClass") : t("courseName"), category === "school" ? `Class ${values["currentClass"]}` : String(values["courseName"])], [category === "school" ? t("schoolName") : t("collegeName"), String(category === "school" ? values["schoolName"] : values["collegeName"])], [t("studentName"), String(values["studentName"])], [t("mobile"), String(values["mobile"])], [t("email"), String(values["email"])], [t("coordinatorName"), values["withoutCoordinator"] ? (lang === "en" ? "Without a coordinator" : "बिना कोऑर्डिनेटर") : String(values["coordinatorName"])], [t("applicationType"), appType ? (lang === "en" ? applicationTypes[appType].en : applicationTypes[appType].hi) : "—"]].map(([k, v]) => <div key={k} className="flex flex-wrap justify-between gap-2 border-b border-edu-navy/10 pb-2"><span className="text-edu-ink/60">{k}</span><span className="font-bold text-edu-navy">{v}</span></div>)}
        {appType && <div className="flex items-center justify-between rounded-xl bg-edu-navy px-4 py-3 text-edu-paper"><span className="font-semibold">{lang === "en" ? "Registration fee to pay" : "देय पंजीकरण शुल्क"}</span><span className="text-2xl font-black">₹{applicationTypes[appType].fee}</span></div>}
        <p className="text-xs text-edu-ink/70">{lang === "en" ? "After you submit, you get your acknowledgement number and a secure Razorpay link to pay the fee." : "जमा करने के बाद आपको पावती संख्या और शुल्क भरने के लिए सुरक्षित Razorpay लिंक मिलेगा।"}</p>
      </div>}
    </div>

    {edit && <div className="mt-6"><Button type="button" variant="ghost" disabled={sending} onClick={edit.onCancel} className="h-9 rounded-full px-4 text-edu-navy hover:bg-edu-sky hover:text-edu-navy">{lang === "en" ? "Cancel editing" : "एडिट रद्द करें"}</Button></div>}
    {formError && <p role="alert" className="mt-4 text-sm font-semibold text-destructive">{formError}</p>}
    <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
      <Button type="button" variant="outline" disabled={step === 0 || sending} onClick={() => goTo(step - 1)} className="h-11 rounded-full border-edu-navy/20 bg-transparent px-6 text-edu-navy hover:bg-edu-sky hover:text-edu-navy"><ArrowLeft className="h-4 w-4" />{t("back")}</Button>
      {current.key === "review"
        ? <Button type="button" disabled={sending} onClick={() => void send()} className="h-11 rounded-full bg-edu-royal px-8 text-edu-paper hover:bg-edu-royal/90">{sending ? t("submitting") : edit ? (lang === "en" ? "Save changes" : "बदलाव सेव करें") : t("submit")}</Button>
        : <Button type="button" onClick={next} className="h-11 rounded-full bg-edu-royal px-8 text-edu-paper hover:bg-edu-royal/90">{t("next")}<ArrowRight className="h-4 w-4" /></Button>}
    </div>
  </div>;
}

function RegistrationDone({ lang, result, values, onNew }: { lang: EduLang; result: Result; values: Values; onNew: () => void }) {
  const app = applicationTypes[result.applicationType];
  const saveRef = useServerFn(submitEducationPaymentReference);
  const [reference, setReference] = useState("");
  const [refState, setRefState] = useState<{ status: "idle" | "sending" | "saved"; error?: string }>({ status: "idle" });
  const [pdfUrl, setPdfUrl] = useState("");
  const category = String(values["studentCategory"]);
  const ackData = { ackNumber: result.ackNumber, studentName: String(values["studentName"]), createdAt: result.createdAt, category: category === "school" ? "School student" : category === "ug" ? "Undergraduate (UG)" : "Postgraduate (PG)", classOrCourse: category === "school" ? `Class ${values["currentClass"]}` : String(values["courseName"]), sector: String(values["educationSector"]), applicationType: result.applicationType, coordinatorName: result.coordinatorName };
  const payStatus = refState.status === "saved" ? "reference_submitted" as const : "pending" as const;

  // Prepare the PDF before the click so phone downloads keep the tap.
  useEffect(() => {
    let url = ""; let cancelled = false;
    void import("@/lib/education-support/acknowledgement").then(m => m.buildAcknowledgementPdf({ ...ackData, paymentStatus: payStatus })).then(blob => { if (cancelled) return; url = URL.createObjectURL(blob); setPdfUrl(url); });
    return () => { cancelled = true; if (url) URL.revokeObjectURL(url); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payStatus]);

  async function sendRef() {
    setRefState({ status: "sending" });
    try { await saveRef({ data: { ackNumber: result.ackNumber, receiptToken: result.receiptToken, reference: reference.trim() } }); setRefState({ status: "saved" }); }
    catch (e) { setRefState({ status: "idle", error: e instanceof Error ? e.message : "Please try again." }); }
  }

  return <div id="registration-form" role="status" className="scroll-mt-6 rounded-3xl border border-edu-navy/10 bg-edu-paper p-5 text-edu-ink shadow-[0_20px_60px_-30px_rgba(11,31,75,0.35)] sm:p-8">
    <CheckCircle2 className="h-12 w-12 text-edu-royal" aria-hidden="true" />
    <h3 className="mt-3 text-2xl font-black text-edu-navy">{lang === "en" ? "Registration submitted" : "पंजीकरण जमा हो गया"}</h3>
    <p className="mt-2 text-sm text-edu-ink/75">{lang === "en" ? "Your acknowledgement number:" : "आपकी पावती संख्या:"}</p>
    <p className="mt-1 select-all break-all text-2xl font-black text-edu-royal sm:text-3xl">{result.ackNumber}</p>
    <p className="mt-2 text-xs text-edu-ink/60">{lang === "en" ? "Save this number for all communication." : "सभी संपर्क के लिए यह संख्या सुरक्षित रखें।"}</p>

    <div className="mt-6 rounded-2xl bg-edu-navy p-5 text-edu-paper">
      <p className="text-sm font-semibold">{lang === "en" ? "Step 1 — Pay your registration fee" : "चरण 1 — पंजीकरण शुल्क भरें"}</p>
      <p className="mt-1 text-xs text-edu-paper/75">{lang === "en" ? app.en : app.hi} · ₹{app.fee}</p>
      <a href={app.paymentLink} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex h-11 items-center gap-2 rounded-full bg-edu-paper px-6 text-sm font-black text-edu-navy hover:bg-edu-sky">{lang === "en" ? `Pay ₹${app.fee} securely` : `₹${app.fee} सुरक्षित रूप से भरें`}<ExternalLink className="h-4 w-4" aria-hidden="true" /></a>
      <p className="mt-3 text-xs text-edu-paper/75">{lang === "en" ? `Opens Razorpay. Please enter your acknowledgement number ${result.ackNumber} and the same email/mobile on the payment page if asked.` : `Razorpay खुलेगा। पूछे जाने पर भुगतान पेज पर अपनी पावती संख्या ${result.ackNumber} और वही ईमेल/मोबाइल डालें।`}</p>
    </div>

    <div className="mt-5 rounded-2xl border border-edu-navy/10 bg-edu-sky/60 p-5">
      <p className="text-sm font-semibold text-edu-navy">{lang === "en" ? "Step 2 — Share your payment ID" : "चरण 2 — अपनी पेमेंट आईडी भेजें"}</p>
      {refState.status === "saved" ? <p className="mt-2 text-sm text-edu-ink">{lang === "en" ? "Thank you. Our team will match your payment and confirm it." : "धन्यवाद। हमारी टीम आपके भुगतान का मिलान करके पुष्टि करेगी।"}</p>
        : <form onSubmit={e => { e.preventDefault(); void sendRef(); }} className="mt-3 flex flex-col gap-2 sm:flex-row">
          <label className="sr-only" htmlFor="edu-payment-ref">Payment ID</label>
          <input id="edu-payment-ref" value={reference} onChange={e => setReference(e.target.value)} placeholder="pay_XXXXXXXXXXXX" maxLength={60} className={`${inputClass} mt-0 sm:flex-1`} />
          <Button type="submit" disabled={refState.status === "sending" || reference.trim().length < 6} className="h-11 rounded-full bg-edu-royal px-6 text-edu-paper hover:bg-edu-royal/90">{refState.status === "sending" ? "…" : lang === "en" ? "Send payment ID" : "आईडी भेजें"}</Button>
        </form>}
      {refState.error && <p role="alert" className="mt-2 text-xs font-semibold text-destructive">{refState.error}</p>}
      <p className="mt-2 text-xs text-edu-ink/60">{lang === "en" ? "Find it in the Razorpay receipt email/SMS after paying." : "भुगतान के बाद Razorpay की रसीद ईमेल/SMS में मिलेगी।"}</p>
    </div>

    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
      <Button asChild variant="outline" className="h-11 rounded-full border-edu-navy/20 bg-transparent text-edu-navy hover:bg-edu-sky hover:text-edu-navy" disabled={!pdfUrl}>
        <a href={pdfUrl || undefined} download={`${result.ackNumber}.pdf`} aria-disabled={!pdfUrl}><Download className="h-4 w-4" />{lang === "en" ? "Download acknowledgement (PDF)" : "पावती डाउनलोड करें (PDF)"}</a>
      </Button>
      <Button type="button" variant="ghost" onClick={onNew} className="h-11 rounded-full text-edu-navy hover:bg-edu-sky hover:text-edu-navy">{lang === "en" ? "Register another student" : "दूसरे विद्यार्थी का पंजीकरण"}</Button>
    </div>
  </div>;
}

function EditSaved({ lang, result, onClose }: { lang: EduLang; result: EditSavedResult; onClose: () => void }) {
  const app = applicationTypes[result.applicationType];
  return <div id="registration-form" role="status" className="scroll-mt-6 rounded-3xl border border-edu-navy/10 bg-edu-paper p-5 text-edu-ink shadow-[0_20px_60px_-30px_rgba(11,31,75,0.35)] sm:p-8">
    <CheckCircle2 className="h-12 w-12 text-edu-royal" aria-hidden="true" />
    <h3 className="mt-3 text-2xl font-black text-edu-navy">{lang === "en" ? "Changes saved" : "बदलाव सेव हो गए"}</h3>
    <p className="mt-2 text-sm text-edu-ink/75">{lang === "en" ? "Your acknowledgement number stays the same:" : "आपकी पावती संख्या वही रहेगी:"}</p>
    <p className="mt-1 select-all break-all text-2xl font-black text-edu-royal sm:text-3xl">{result.ackNumber}</p>
    {result.paymentStatus === "pending" && app && <div className="mt-6 rounded-2xl bg-edu-navy p-5 text-edu-paper">
      <p className="text-sm font-semibold">{lang === "en" ? "Registration fee still to pay" : "पंजीकरण शुल्क अभी बाकी है"} · ₹{app.fee}</p>
      <a href={app.paymentLink} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex h-11 items-center gap-2 rounded-full bg-edu-paper px-6 text-sm font-black text-edu-navy hover:bg-edu-sky">{lang === "en" ? `Pay ₹${app.fee} securely` : `₹${app.fee} सुरक्षित रूप से भरें`}<ExternalLink className="h-4 w-4" aria-hidden="true" /></a>
    </div>}
    <Button type="button" variant="outline" onClick={onClose} className="mt-6 h-11 rounded-full border-edu-navy/20 bg-transparent text-edu-navy hover:bg-edu-sky hover:text-edu-navy">{lang === "en" ? "Done" : "ठीक है"}</Button>
  </div>;
}
