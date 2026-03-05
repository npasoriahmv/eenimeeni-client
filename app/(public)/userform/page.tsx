"use client";

import { useEffect, useState } from "react";
import { Trash2, Phone, Mail, MapPin, ChevronRight, Loader2, Facebook, Linkedin, Edit2, Instagram, CirclePlus, X, SquarePen } from "lucide-react";

// ─── Config (easy to change) ────────────────────────────────────────────────
const MIN_CHILD_AGE_YEARS = 1; // kids must be older than this
const MAX_CHILDREN = 6;
// ─────────────────────────────────────────────────────────────────────────────

type Child = {
  name: string;
  dob: string;
  allergy: string;
};

const emptyChild = (): Child => ({ name: "", dob: "", allergy: "" });

export default function RegisterPage() {
  const [form, setForm] = useState({
    parentName: "",
    phone: "",
    email: "",
    address: "",
  });

  const [children, setChildren] = useState<Child[]>([emptyChild()]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", ""]);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpExpiresAt, setOtpExpiresAt] = useState<number | null>(null);
  const [success, setSuccess] = useState(false);
  const [editingChildIndex, setEditingChildIndex] = useState<number | null>(0);
  const [editingChildSnapshot, setEditingChildSnapshot] = useState<Child | null>(emptyChild());

  // ── Helpers ────────────────────────────────────────────────────────────────

  function getMinDOB() {
    // child must be born more than MIN_CHILD_AGE_YEARS ago
    const d = new Date();
    d.setFullYear(d.getFullYear() - MIN_CHILD_AGE_YEARS);
    return d.toISOString().split("T")[0];
  }

  function updateChild(i: number, field: keyof Child, value: string) {
    setChildren((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  }

  function addChild() {
    if (children.length < MAX_CHILDREN) {
      const newIndex = children.length;
      const newChild = emptyChild();
      setChildren((p) => [...p, newChild]);
      setEditingChildIndex(newIndex);
      setEditingChildSnapshot(newChild);
    }
  }

  function removeChild(i: number) {
    setChildren((p) => p.filter((_, idx) => idx !== i));
  }

  useEffect(() => {
    if (!otpSent || otpVerified || otpTimer <= 0) return;

    const timer = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [otpSent, otpVerified, otpTimer]);

  function updateOtpDigit(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    setOtpDigits((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
  }

  async function verifyOtp() {
    const enteredOtp = otpDigits.join("");
    if (enteredOtp.length !== 4) return;

    if (!otpExpiresAt || Date.now() > otpExpiresAt) {
      setErrors((prev) => ({ ...prev, phone: "OTP expired. Please resend OTP." }));
      setOtpSent(false);
      setOtpDigits(["", "", "", ""]);
      setGeneratedOtp("");
      return;
    }

    if (enteredOtp === generatedOtp) {
      setOtpVerified(true);
      setErrors((prev) => {
        const next = { ...prev };
        delete next.phone;
        return next;
      });
      return;
    }

    setErrors((prev) => ({ ...prev, phone: "Invalid OTP. Please try again." }));
  }

  const sendSms = async () => {
    if (!/^\d{10}$/.test(form.phone)) {
      setErrors((prev) => ({ ...prev, phone: "Enter a valid 10-digit phone number." }));
      return;
    }

    const otp = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
    setSendingOtp(true);
    try {
      const res = await fetch("/api/sms-sendotp", {
        method: "POST",
        body: JSON.stringify({ mobile: `91${form.phone}`, message: `Welcome to Eeni Meeni Miny Moe. ${otp} is your verification code for registration. This OTP is valid for 5 minutes. If you did not request this, please ignore this message.` }),
      });

      if (!res.ok) {
        let errorMessage = "Unable to send OTP. Please try again.";
        try {
          const payload = await res.json();
          if (payload && typeof payload.error === "string" && payload.error.trim()) {
            errorMessage = payload.error;
          }
        } catch {
        }
        throw new Error(errorMessage);
      }

      setGeneratedOtp(otp);
      setOtpSent(true);
      setOtpVerified(false);
      setOtpDigits(["", "", "", ""]);
      setOtpTimer(30);
      setOtpExpiresAt(Date.now() + 5 * 60 * 1000);
      setErrors((prev) => {
        const next = { ...prev };
        delete next._global;
        return next;
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to send OTP. Please try again.";
      setErrors((prev) => ({ ...prev, _global: message }));
    } finally {
      setSendingOtp(false);
    }
  };

  // ── Validation ─────────────────────────────────────────────────────────────

  function validate() {
    const e: Record<string, string> = {};

    if (!form.parentName.trim()) e.parentName = "Parent name is required.";
    if (!/^\d{10}$/.test(form.phone)) e.phone = "Enter a valid 10-digit phone number.";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email address.";

    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - MIN_CHILD_AGE_YEARS);

    // Only validate children if any have been added — children are optional
    children.forEach((child, i) => {
      if (!child.name.trim()) e[`child_${i}_name`] = "Child name is required.";
      if (!child.dob) {
        e[`child_${i}_dob`] = "Date of birth is required.";
      } else {
        const dob = new Date(child.dob);
        if (dob > new Date()) e[`child_${i}_dob`] = "Date of birth cannot be in the future.";
        else if (dob > minDate)
          e[`child_${i}_dob`] = `Child must be older than ${MIN_CHILD_AGE_YEARS} year(s).`;
      }
    });

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!otpVerified) {
      setErrors((prev) => ({ ...prev, phone: "Please verify your phone number before registering." }));
      return;
    }
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/userform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, children }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.fieldErrors) setErrors(data.fieldErrors);
        else setErrors({ _global: data.error || "Something went wrong." });
      } else {
        setSuccess(true);
      }
    } catch {
      setErrors({ _global: "Network error. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  // ── Success screen ─────────────────────────────────────────────────────────

  if (success) {
    return (
      <div className="min-h-screen bg-[#EEE8DF] flex items-center justify-center p-6">
        <div className="bg-[#F7F2EA] rounded-3xl shadow-xl p-10 max-w-md w-full text-center border border-[#DBD0C4]">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="font-display text-3xl font-bold text-[#6C594C] mb-3">
            You&apos;re all set!
          </h2>
          <p className="text-[#7D6A5E] text-lg">
            We&apos;ve saved your details. 
            <br />See you soon!
          </p>
        </div>
      </div>
    );
  }

  // ── Main form ──────────────────────────────────────────────────────────────

  return (
    <div className="-mt-20 min-h-screen bg-[#FFF9EF] text-[#6E5A4D] font-body">
      {/* Header */}
      <header className="pt-6 pb-6 px-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="flex items-center gap-3">
            <EeniMeeniLogo className="h-18 w-auto" />
            <MinyMoeWordmark className="h-17 w-auto" />
          </div>
        </div>
        <h1 className="font-display text-3xl  tracking-tight text-[#6A5548]">
          Join Us Now!
        </h1>
        <p className="text-[#6D5A4D] mt-2 text-2xl">
          Big smiles start with one click.
        </p>
      </header>

      <form onSubmit={handleSubmit} noValidate className="max-w-[460px] mx-auto px-5 py-2 space-y-8">
        {errors._global && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl px-5 py-4 text-sm">
            {errors._global}
          </div>
        )}

        {/* ── Parent Details ─────────────────────────────────────────────── */}
        <section className="bg-[#F3E4D5] rounded-[24px] p-6 space-y-5 border border-[#D1C4B7] shadow-sm">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="font-display text-[22px] leading-none text-[#6E594C]">
              Parent / Guardian&apos;s Details
            </h2>
          </div>

          <div className="pt-2">
            <Field
              label="Full Name *"
              error={errors.parentName}
            >
              <input
              type="text"
              placeholder="e.g. Priya Sharma"
              value={form.parentName}
              onChange={(e) => setForm({ ...form, parentName: e.target.value })}
              className={input(errors.parentName)}
            />
            </Field>
          </div>

          <Field label="Phone Number *" error={errors.phone}>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 flex items-center gap-1 text-sm">
                <Phone size={14} /> +91
              </span>
              <input
                type="tel"
                placeholder="98765 003210"
                value={form.phone}
                onChange={(e) => {
                  const nextPhone = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setForm({ ...form, phone: nextPhone });
                  setOtpSent(false);
                  setOtpVerified(false);
                  setOtpDigits(["", "", "", ""]);
                  setGeneratedOtp("");
                  setOtpTimer(0);
                  setOtpExpiresAt(null);
                }}
                className={input(errors.phone) + " pl-20 pr-28"}
              />
              {otpVerified ? (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 border border-green-300">
                  Verified
                </span>
              ) : (
                <button
                  type="button"
                  onClick={otpSent ? verifyOtp : sendSms}
                  disabled={sendingOtp || !/^\d{10}$/.test(form.phone) || (otpSent && otpDigits.join("").length !== 4)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-[#7A6456] px-3 py-1 text-xs font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#6E5A4D] transition-colors"
                >
                  {sendingOtp ? "Sending..." : otpSent ? "Verify" : "Send otp"}
                </button>
              )}
            </div>

            {otpSent && !otpVerified && (
              <div className="mt-3">
                <div className="flex items-center gap-2">
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => {
                        updateOtpDigit(index, e.target.value);
                        if (e.target.value && e.currentTarget.nextElementSibling instanceof HTMLInputElement) {
                          e.currentTarget.nextElementSibling.focus();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Backspace" && !otpDigits[index] && e.currentTarget.previousElementSibling instanceof HTMLInputElement) {
                          e.currentTarget.previousElementSibling.focus();
                        }
                      }}
                      className="h-11 w-11 rounded-xl border border-[#D1C4B7] bg-white text-center text-lg font-semibold text-[#6E5A4D] outline-none focus:ring-2 focus:ring-[#7A6456]"
                    />
                  ))}
                </div>

                <div className="mt-2 text-sm text-[#6D5A4D]">
                  {otpTimer > 0 ? (
                    <span>Resend OTP in 00:{String(otpTimer).padStart(2, "0")}</span>
                  ) : (
                    <button
                      type="button"
                      onClick={sendSms}
                      className="font-semibold text-[#6A5548] hover:text-[#6E5A4D]"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              </div>
            )}
          </Field>

          <Field label="Email Address (optional)" error={errors.email}>
            <div className="relative">
              <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="priya@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={input(errors.email) + " pl-10"}
              />
            </div>
          </Field>
        </section>

        {/* ── Children ──────────────────────────────────────────────────── */}
        <section className="space-y-4">
          {/* Show all children - edit mode for the one being edited, view mode for others */}
          {children.map((child, i) => (
            <div key={i} className="mb-8">
              {editingChildIndex === i ? (
                // Edit Mode
                <div className="bg-[#F3E4D5] border border-[#D1C4B7] rounded-3xl shadow-sm p-6 space-y-5">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="h-11 w-11 rounded-full bg-[#7B6456] text-white flex items-center justify-center text-xl font-bold">
                      {i + 1}
                    </div>
                    <h3 className="font-display text-[20px] leading-none text-[#6E594C]">
                      Children&apos;s Details
                    </h3>
                  </div>

                  <Field label="Child's Name *" error={errors[`child_${i}_name`]}>
                    <input
                      type="text"
                      placeholder="e.g. Arjun Sharma"
                      value={children[i].name}
                      onChange={(e) => updateChild(i, "name", e.target.value)}
                      className={input(errors[`child_${i}_name`])}
                    />
                  </Field>

                  <Field
                    label={`Date of Birth * (${MIN_CHILD_AGE_YEARS} year or older)`}
                    error={errors[`child_${i}_dob`]}
                  >
                    <div className="w-full min-w-0 overflow-hidden">
                      <input
                        type="date"
                        max={getMinDOB()}
                        value={children[i].dob}
                        onChange={(e) => {
                          const selectedDate = e.target.value;
                          const maxDate = getMinDOB();

                          if (selectedDate > maxDate) {
                            return; // block invalid future/underage date
                          }
                          updateChild(i, "dob",selectedDate)}}
                        className={`${input(errors[`child_${i}_dob`])} mobile-date-input`}
                      />
                    </div>
                  </Field>

                  <Field label="Allergies / Special Notes (optional)" error="">
                    <input
                      type="text"
                      placeholder="e.g. Peanut Allergy"
                      value={children[i].allergy}
                      onChange={(e) => updateChild(i, "allergy", e.target.value)}
                      className={input("")}
                    />
                  </Field>

                  {/* Edit Mode Buttons */}
                  <div className="flex items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setChildren((prev) => {
                          if (editingChildSnapshot === null || !prev[i]) return prev;
                          const next = [...prev];
                          next[i] = editingChildSnapshot;

                          if (!editingChildSnapshot.name.trim() && !editingChildSnapshot.dob && !editingChildSnapshot.allergy.trim()) {
                            return next.filter((_, idx) => idx !== i);
                          }

                          return next;
                        });
                        setEditingChildIndex(null);
                        setEditingChildSnapshot(null);
                      }}
                      className="text-[#6A5548] font-semibold text-[18px] hover:text-[#6E5A4D] transition-colors"
                    >
                      Back
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (children[i].name.trim() && children[i].dob) {
                          setEditingChildIndex(null);
                          setEditingChildSnapshot(null);
                        }
                      }}
                      disabled={!children[i].name.trim() || !children[i].dob}
                      className="shrink-0 bg-[#7A6456] hover:bg-[#6E5A4D] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-[18px] px-7 py-3 rounded-full flex items-center justify-center gap-2 transition-all"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="bg-[#F3E4D5] border border-[#D1C4B7] rounded-3xl shadow-sm p-6 space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-full bg-[#7B6456] text-white flex items-center justify-center text-xl font-bold">
                        {i + 1}
                      </div>
                      <h3 className="font-display text-[20px] leading-none text-[#6E594C]">
                        {i === 0 ? "Child's Details" : "Child's Details"}
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingChildIndex(i);
                          setEditingChildSnapshot({ ...children[i] });
                        }}
                        className="text-[#6A5548] hover:text-[#6E5A4D] transition-colors p-1 rounded-lg hover:bg-[#D1C4B7]"
                      >
                        <SquarePen size={18} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => removeChild(i)}
                        className="text-red-500 hover:text-red-600 transition-colors p-1 rounded-lg hover:bg-red-100"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>

                  {/* View Mode - Two Column Layout */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-[14px] font-bold text-[#6D5A4D] mb-2">Child's Name</p>
                      <p className="text-[16px] text-[#6E5A4D]">{child.name}</p>
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-[#6D5A4D] mb-2">Date of Birth</p>
                      <p className="text-[16px] text-[#6E5A4D]">{child.dob}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[14px] font-bold text-[#6D5A4D] mb-2">Allergies / Special Notes</p>
                    <p className="text-[16px] text-[#6E5A4D]">{child.allergy}</p>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Action Row */}
          <div className="flex flex-col items-end justify-between gap-3 -mt-2">
            <button
              type="button"
              onClick={addChild}
              disabled={children.length >= MAX_CHILDREN || editingChildIndex !== null}
              className="text-[18px] leading-none font-display text-[#6A5548] disabled:opacity-50 disabled:cursor-not-allowed mt-2 mb-4 mr-6 flex items-center gap-1 hover:text-[#6E5A4D] transition-colors"
            >
              <CirclePlus size={30} className="flex flex-col inline-block items-center mr-1"/>
              {children.length === 0 ? "Add Your Child's Details" : "Add Another Child's Details"}
            </button>

            <button
              type="submit"
              disabled={submitting || editingChildIndex !== null || !form.parentName.trim() || !/^\d{10}$/.test(form.phone) || !otpVerified}
              className="shrink-0 bg-[#7A6456] hover:bg-[#6E5A4D] disabled:opacity-60 text-white font-bold text-[18px] px-7 py-3 rounded-full flex items-center justify-center gap-2 transition-all"
            >
              {submitting ? (
                <><Loader2 size={20} className="animate-spin" /> Saving…</>
              ) : (
                <>Register Now <ChevronRight size={22} /></>
              )}
            </button>
          </div>
        </section>
      </form>

      <section className="mt-6 sm:mt-8 text-[#F7EFE6] px-3 sm:px-5 relative overflow-hidden">
        {/* Decorative SVG Background */}
        <svg 
          className="absolute inset-0 w-full h-full" 
          viewBox="0 0 440 414" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMin slice"
        >
          <g clipPath="url(#clip0_1_69)">
            <rect y="64" width="440" height="350" fill="#6A5548"/>
            <circle cx="78.2517" cy="84.2517" r="84.2517" fill="#6A5548"/>
            <circle cx="221.755" cy="84.2517" r="84.2517" fill="#6A5548"/>
            <circle cx="365.259" cy="84.2517" r="84.2517" fill="#6A5548"/>
            <g clipPath="url(#clip1_1_69)">
              <path opacity="0.1" d="M372.5 -343L372.5 349L451.5 349L451.5 -343L372.5 -343Z" fill="url(#paint0_linear_1_69)" style={{mixBlendMode: 'multiply'}}/>
              <path opacity="0.1" d="M254.5 -343L254.5 349L333.5 349L333.5 -343L254.5 -343Z" fill="url(#paint1_linear_1_69)" style={{mixBlendMode: 'multiply'}}/>
              <path opacity="0.1" d="M136.5 -343L136.5 349L215.5 349L215.5 -343L136.5 -343Z" fill="url(#paint2_linear_1_69)" style={{mixBlendMode: 'multiply'}}/>
              <path opacity="0.1" d="M18.5 -343L18.5 349L97.5 349L97.5 -343L18.5 -343Z" fill="url(#paint3_linear_1_69)" style={{mixBlendMode: 'multiply'}}/>
            </g>
            <g opacity="0.5">
              <path d="M4.17536 417.063L94.9922 417.062C94.1294 386.891 74.0908 362.685 49.5838 362.685C25.0686 362.685 5.02997 386.891 4.17536 417.063Z" stroke="#F3E3D4" strokeWidth="1.06737" strokeMiterlimit="10"/>
              <path d="M121.444 399.19L98.5727 404.293C99.4273 408.444 99.9238 412.758 100.046 417.186L123.234 416.014C123.12 410.235 122.502 404.602 121.444 399.19Z" stroke="#F3E3D4" strokeWidth="1.06737" strokeMiterlimit="10"/>
              <path d="M108.734 367.577L89.0374 380.836C90.1931 382.569 91.2512 384.376 92.2279 386.257C94.1162 389.887 95.7034 393.777 96.9487 397.871L119.445 393.37C117.752 386.444 115.327 379.908 112.283 373.909C111.176 371.728 109.988 369.612 108.726 367.577L108.734 367.577Z" stroke="#F3E3D4" strokeWidth="1.06737" strokeMiterlimit="10"/>
              <path d="M68.0528 361.88C73.5874 364.541 78.65 368.358 83.0289 373.104L102.164 360.268C95.6934 351.551 87.7089 344.6 78.7151 340.059L68.0528 361.888L68.0528 361.88Z" stroke="#F3E3D4" strokeWidth="1.06737" strokeMiterlimit="10"/>
              <path d="M18.6417 340.953L31.9737 361.545C37.4758 359.022 43.4337 357.638 49.6438 357.638C52.6228 357.638 55.5447 357.956 58.3853 358.566L66.1094 335.044C60.4771 333.066 54.5436 332.008 48.4067 332.008C37.6874 332.008 27.5623 335.231 18.6336 340.945L18.6417 340.953Z" stroke="#F3E3D4" strokeWidth="1.06737" strokeMiterlimit="10"/>
              <path d="M-15.815 382.385L5.94096 388.521C10.0919 379.739 15.9603 372.325 22.9844 366.961L8.33387 348.07C-1.62847 356.119 -10.6467 369.012 -15.8232 382.385L-15.815 382.385Z" stroke="#F3E3D4" strokeWidth="1.06737" strokeMiterlimit="10"/>
              <path d="M-22.9993 416.705L-0.754907 417.186C-0.592124 411.252 0.262492 405.53 1.70312 400.134L-19.4994 392.638C-21.6075 400.215 -22.8283 408.306 -22.9911 416.705L-22.9993 416.705Z" stroke="#F3E3D4" strokeWidth="1.06737" strokeMiterlimit="10"/>
              <path d="M98.5742 404.285L112.883 400.354" stroke="#F3E3D4" strokeWidth="1.06737" strokeMiterlimit="10"/>
              <path d="M174.643 114.24C174.543 114.176 174.408 114.197 174.336 114.291C173.754 115.04 173.291 115.723 172.983 116.294C171.144 119.702 172.172 122.146 173.356 123.593C173.612 123.908 174.207 124.435 174.942 124.937C175.676 125.438 176.384 125.802 176.77 125.925C178.548 126.503 181.198 126.573 183.705 123.621C184.133 123.12 184.606 122.428 185.101 121.6C185.162 121.494 185.133 121.361 185.034 121.294L174.643 114.24Z" fill="#F3E3D4"/>
              <path d="M167.302 146.677L157.457 139.95C157.128 139.725 157.107 139.346 157.259 139.084C157.409 138.825 157.746 138.651 158.105 138.819L161.048 140.196C162.093 140.692 163.33 140.355 163.987 139.393L172.261 127.285C172.79 126.511 172.72 125.406 172.095 124.66C170.883 123.214 169.187 120.154 171.453 115.906C173.079 112.854 178.757 107.03 183.606 103.439C183.748 103.334 183.944 103.332 184.089 103.431L191.645 108.594C191.793 108.696 191.86 108.877 191.813 109.047C190.23 114.87 186.868 122.276 184.616 124.9C181.481 128.555 178.014 128.087 176.227 127.483C175.304 127.172 174.252 127.511 173.724 128.284L165.45 140.393C164.792 141.355 164.926 142.628 165.765 143.419L168.12 145.662C168.407 145.936 168.37 146.315 168.18 146.547C167.992 146.783 167.631 146.902 167.302 146.677Z" stroke="#F3E3D4" strokeWidth="0.799047" strokeMiterlimit="10"/>
              <path d="M183.828 133.276C183.752 133.255 183.671 133.294 183.643 133.368C183.419 133.955 183.258 134.477 183.173 134.898C182.665 137.413 183.788 138.763 184.818 139.451C185.041 139.601 185.52 139.821 186.082 139.997C186.644 140.173 187.163 140.266 187.431 140.27C188.67 140.293 190.363 139.826 191.381 137.471C191.556 137.071 191.722 136.542 191.876 135.922C191.894 135.843 191.85 135.764 191.775 135.741L183.828 133.276Z" fill="#F3E3D4"/>
              <path d="M185.437 155.249L177.9 152.887C177.649 152.808 177.562 152.571 177.608 152.376C177.653 152.183 177.833 152.008 178.093 152.045L180.223 152.349C180.981 152.462 181.7 152.01 181.931 151.274L184.837 142.004C185.023 141.411 184.765 140.725 184.225 140.372C183.178 139.69 181.513 138.078 182.128 134.949C182.57 132.701 185.044 127.915 187.424 124.703C187.493 124.609 187.617 124.57 187.729 124.605L193.513 126.418C193.626 126.454 193.704 126.556 193.707 126.673C193.827 130.668 193.126 136.01 192.206 138.108C190.925 141.029 188.638 141.401 187.388 141.364C186.744 141.345 186.142 141.762 185.957 142.355L183.051 151.625C182.82 152.361 183.15 153.142 183.835 153.481L185.76 154.448C185.995 154.566 186.044 154.814 185.969 154.997C185.895 155.183 185.689 155.328 185.437 155.249Z" stroke="#F3E3D4" strokeWidth="0.799047" strokeMiterlimit="10"/>
              <path d="M33.0093 49.8718C33.0093 49.8718 42.5282 67.32 52.7039 71.6844C62.8796 76.0488 68.43 68.6377 65.3588 62.8341C62.2876 57.0305 57.9583 54.7688 57.9583 54.7688C57.9583 54.7688 66.2469 55.7782 70.6872 51.4325C76.3671 45.8718 71.1034 36.629 60.1599 38.1711C46.0434 40.1523 33 49.8811 33 49.8811L33.0093 49.8718Z" fill="#F3E3D4"/>
              <path d="M365.998 72.8612C365.998 72.8612 387.185 70.2573 395.541 66.8841C403.542 63.6528 404.323 57.8532 399.707 55.1665C394.653 52.2193 384.368 57.6993 384.368 57.6993C384.368 57.6993 391.244 46.8694 385.954 42.2534C381.634 38.4777 377.065 43.5435 372.662 53.3556C368.377 62.8717 365.998 72.873 365.998 72.873L365.998 72.8612Z" fill="#F3E3D4"/>
              <path d="M237.114 33.3057C241.351 41.6677 238.007 51.8793 229.645 56.1159C221.283 60.3525 211.068 57.0083 206.831 48.6463C202.595 40.2843 205.942 30.0726 214.304 25.836C222.663 21.5995 232.878 24.9437 237.114 33.3057Z" fill="#F3E3D4"/>
              <path d="M223.519 48.5658C223.519 48.5658 217.374 45.6941 215.657 42.3036C213.944 38.9131 216.33 36.838 218.372 37.7613C220.416 38.6815 221.28 40.1143 221.28 40.1143C221.28 40.1143 220.749 37.292 222.123 35.6708C223.88 33.5957 227.138 35.1891 226.869 38.981C226.52 43.8691 223.519 48.5658 223.519 48.5658Z" fill="#6A5548"/>
              <path d="M419.596 111.125L413.455 112.142C413.175 112.188 412.895 112.073 412.737 111.849L410.164 108.147C409.996 107.904 409.597 107.977 409.539 108.263L408.646 112.645C408.588 112.931 408.34 113.148 408.034 113.182L403.303 113.712C402.974 113.748 402.885 114.162 403.176 114.314L408.123 116.917C408.386 117.055 408.528 117.335 408.476 117.615L407.552 122.62C407.498 122.918 407.866 123.117 408.112 122.922L412.377 119.539C412.587 119.374 412.875 119.336 413.123 119.439L417.628 121.332C417.925 121.458 418.223 121.159 418.072 120.888L415.71 116.623C415.572 116.374 415.615 116.069 415.815 115.862L419.908 111.663C420.13 111.436 419.919 111.072 419.596 111.125Z" stroke="#F3E3D4" strokeWidth="1.20715" strokeMiterlimit="10"/>
              <path d="M249.631 228.335C249.631 228.335 244.637 221.967 244.641 217.434C244.644 212.896 248.302 211.975 249.979 214.061C251.656 216.142 251.806 218.134 251.806 218.134C251.806 218.134 252.761 214.843 255.097 213.858C258.088 212.597 260.697 216.052 258.365 219.942C255.359 224.955 249.631 228.335 249.631 228.335Z" fill="#E4B4BB"/>
              <path d="M240.894 235.346C240.894 235.346 236.394 232.744 235.312 230.041C234.23 227.335 236.192 225.912 237.689 226.751C239.187 227.593 239.752 228.746 239.752 228.746C239.752 228.746 239.535 226.556 240.692 225.407C242.174 223.943 244.555 225.377 244.094 228.256C243.503 231.962 240.894 235.346 240.894 235.346Z" fill="#E4B4BB"/>
              <path d="M140.425 222.14C141.157 224.687 143.164 226.692 145.711 227.425C143.164 228.157 141.157 230.164 140.425 232.711C139.692 230.164 137.687 228.157 135.14 227.425C137.687 226.692 139.692 224.687 140.425 222.14Z" fill="#F3E3D4" stroke="#F3E3D4" strokeWidth="0.604687"/>
              <path d="M150.836 234.851C149.396 234.851 148.232 236.018 148.232 237.455C148.232 236.018 147.066 234.851 145.629 234.851C147.066 234.851 148.232 233.687 148.232 232.248C148.232 233.687 149.396 234.851 150.836 234.851Z" stroke="#F3E3D4" strokeWidth="0.604687" strokeMiterlimit="10"/>
              <path d="M86.204 115.341L85.9766 114.633C85.9829 114.627 86.362 114.507 87.0003 114.254L87.2783 114.943C86.6084 115.215 86.2166 115.335 86.204 115.341Z" fill="#F3E3D4"/>
              <path d="M89.2959 114.026L88.961 113.363C89.6013 113.038 90.2312 112.693 90.8505 112.326L91.2295 112.964C90.5934 113.344 89.9489 113.697 89.2959 114.026ZM93.0876 111.764L92.6578 111.151C93.2518 110.734 93.8247 110.3 94.3766 109.849L94.8506 110.424C94.2861 110.887 93.6985 111.334 93.0876 111.764ZM96.5001 108.951L95.9818 108.414C96.5042 107.909 96.9972 107.389 97.4606 106.853L98.023 107.34C97.5469 107.892 97.0393 108.429 96.5001 108.951ZM99.4008 105.602L98.794 105.166C99.211 104.581 99.5987 103.98 99.9568 103.365L100.601 103.738C100.231 104.374 99.8305 104.996 99.4008 105.602ZM101.619 101.766L100.943 101.457C101.238 100.808 101.501 100.144 101.733 99.466L102.434 99.7062C102.198 100.41 101.926 101.096 101.619 101.766ZM103.047 97.5764L102.32 97.4059C102.485 96.7149 102.615 96.0113 102.712 95.2951L103.451 95.3962C103.35 96.1335 103.216 96.8602 103.047 97.5764ZM103.66 93.1907L102.914 93.1528C102.935 92.761 102.946 92.3755 102.946 91.9963C102.946 91.6635 102.94 91.3349 102.927 91.0105L103.666 90.9726C103.683 91.3096 103.692 91.6509 103.692 91.9963C103.692 92.3882 103.681 92.7863 103.66 93.1907ZM102.706 88.8809C102.584 88.152 102.419 87.4632 102.213 86.8144L102.921 86.5869C103.14 87.2694 103.312 87.994 103.439 88.7608L102.706 88.8809ZM92.2913 88.6471L91.5518 88.5523C91.6572 87.7729 91.813 87.0418 92.0195 86.3593L92.7337 86.5743C92.5399 87.2188 92.3924 87.9098 92.2913 88.6471ZM101.391 84.8743C101.033 84.217 100.625 83.6609 100.165 83.2059L100.696 82.6751C101.202 83.1807 101.653 83.7937 102.049 84.5141L101.391 84.8743ZM93.5552 84.6531L92.9106 84.274C93.1381 83.8779 93.393 83.5135 93.6753 83.1807C93.8901 82.9279 94.1113 82.6983 94.3388 82.4918L94.8379 83.0416C94.6357 83.227 94.4378 83.4335 94.244 83.661C93.9912 83.9601 93.7617 84.2908 93.5552 84.6531ZM98.4906 82.119C97.8587 81.8978 97.2016 81.8725 96.5633 82.0495L96.3674 81.3291C97.1447 81.1142 97.9599 81.1458 98.7309 81.4112L98.4906 82.119Z" fill="#F3E3D4"/>
              <path d="M92.2951 92.9693L91.5429 92.1604C91.5429 92.1541 91.2522 91.8445 90.7656 91.4021L91.2649 90.8523C91.3155 90.8944 91.3618 90.9365 91.4039 90.9787C91.4039 90.9155 91.4039 90.8523 91.4039 90.7891H92.1496C92.1496 91.4463 92.1875 91.8634 92.1875 91.8697L92.2951 92.9693Z" fill="#F3E3D4"/>
              <path d="M98.1938 104.591L98.1812 103.845C98.9311 103.837 99.6641 103.788 100.38 103.7L100.469 104.439C99.7274 104.532 98.969 104.583 98.1938 104.591ZM95.9189 104.509C95.1816 104.446 94.4296 104.349 93.6628 104.218L93.7892 103.479C94.5349 103.609 95.2658 103.704 95.982 103.763L95.9189 104.509ZM102.719 104.029L102.535 103.302C103.247 103.125 103.945 102.904 104.627 102.638L104.899 103.333C104.187 103.611 103.46 103.843 102.719 104.029ZM91.4383 103.75C90.8485 103.603 90.2481 103.437 89.6372 103.251C89.5108 103.213 89.3845 103.173 89.2582 103.131L89.4856 102.423C89.6077 102.461 89.73 102.499 89.8521 102.537C90.4504 102.718 91.0402 102.883 91.6216 103.03L91.4383 103.75ZM106.972 102.379L106.618 101.722C107.256 101.381 107.869 101.008 108.495 100.572L108.918 101.185C108.267 101.633 107.629 102.025 106.972 102.379ZM87.1221 102.322C86.3932 101.998 85.7171 101.644 85.0936 101.261L85.4854 100.629C86.0795 100.995 86.7261 101.332 87.4254 101.64L87.1221 102.322ZM83.2357 99.8955C82.6332 99.3647 82.1108 98.796 81.6684 98.1893L82.2751 97.7469C82.6838 98.3114 83.1683 98.8423 83.7286 99.3394L83.2357 99.8955ZM110.732 99.8197L110.264 99.2383C110.485 99.0613 110.706 98.8718 110.978 98.6443C111.303 98.3705 111.621 98.084 111.932 97.7849L112.444 98.3283C112.124 98.6317 111.795 98.9266 111.458 99.2131C111.187 99.4406 110.959 99.6364 110.732 99.8197ZM114.018 96.6853L113.462 96.1923C113.938 95.6446 114.397 95.0696 114.839 94.4671L115.44 94.9095C114.985 95.5288 114.511 96.1207 114.018 96.6853ZM80.5436 96.1481C80.2571 95.4109 80.0758 94.6525 80 93.8731L80.7395 93.8035C80.8069 94.5113 80.9733 95.2023 81.2388 95.8764L80.5436 96.1481ZM116.716 93.0263L116.078 92.6345C116.466 92.0151 116.834 91.3747 117.184 90.7133L117.841 91.0609C117.483 91.7392 117.108 92.3943 116.716 93.0263ZM80.8406 91.6802L80.1076 91.5285C80.2719 90.707 80.5688 89.9424 80.9669 89.3231L81.5925 89.7275C81.245 90.2647 80.9859 90.9408 80.8406 91.6802ZM89.0496 90.0245C88.4092 89.5737 87.7857 89.2072 87.179 88.9249L87.4887 88.2488C88.1375 88.5521 88.801 88.9418 89.4792 89.4179L89.0496 90.0245ZM118.833 89.0197L118.151 88.7101C118.454 88.0402 118.736 87.3556 118.998 86.6562L119.693 86.9216C119.427 87.6336 119.141 88.333 118.833 89.0197ZM83.122 88.4889L82.8564 87.7937C83.5895 87.5157 84.3858 87.4356 85.2452 87.5536L85.1505 88.293C84.4132 88.1919 83.7371 88.2572 83.122 88.4889Z" fill="#F3E3D4"/>
              <path d="M120.442 84.7672L119.734 84.546C119.844 84.1921 119.947 83.8383 120.044 83.4844L120.758 83.6866C120.661 84.0447 120.556 84.4049 120.442 84.7672Z" fill="#F3E3D4"/>
              <path d="M120.31 83.8754C119.375 84.4505 117.795 84.4631 116.746 84.2482C118.389 83.5341 119.925 82.4724 120.986 81C121.258 82.7884 122.244 84.381 123.337 85.7965C122.25 85.4427 120.961 84.8549 120.31 83.8754Z" fill="#F3E3D4"/>
              <path d="M327.858 76.3214C325.935 76.0245 324.218 77.5462 323.516 79.2998C323.04 80.4782 322.923 81.74 322.95 83.0112C323.615 83.1411 324.281 83.3267 324.919 83.5772C327.283 84.5143 329.701 86.6948 328.811 89.5711C328.461 90.6938 327.535 91.6031 326.366 91.6959C325.224 91.7887 324.128 91.1763 323.391 90.2948C322.492 89.2185 322.204 87.734 322.015 86.3607C321.916 85.5999 321.826 84.8391 321.772 84.0782C319.336 83.8463 316.774 84.4679 314.725 85.6927C313.754 86.268 312.864 87.0102 312.1 87.8731C313.161 88.2628 314.167 88.801 315.03 89.5154C317.017 91.1392 318.141 93.8949 317.026 96.4001C316.046 98.6084 313.61 99.3692 311.533 98.3022C309.403 97.2073 308.396 94.9248 308.639 92.5217C308.783 91.1206 309.295 89.8031 310.014 88.6154C309.987 88.6154 309.951 88.5969 309.924 88.5969C307.974 88.2072 305.96 88.2814 304.027 88.7546C301.15 89.4598 298.112 91.2412 296.269 93.7928C297.456 94.2011 298.544 94.832 299.389 95.7599C301.007 97.5135 301.231 100.9 298.885 102.143C296.988 103.146 294.696 101.744 293.86 99.9352C293.069 98.2279 293.5 96.2795 294.336 94.6279C294.309 94.6279 294.273 94.6186 294.247 94.6093C292.224 94.266 290.093 94.4887 288.224 95.398C286.453 96.2609 285.05 97.7733 284.493 99.7218C284.007 101.438 284.16 103.433 285.041 105.001C285.491 105.799 286.129 106.421 286.893 106.885C287.585 107.293 286.83 108.314 286.156 107.905C284.232 106.764 283.162 104.547 283.019 102.31C282.866 99.9445 283.657 97.6341 285.302 95.964C287.073 94.164 289.599 93.2639 292.053 93.1897C293.015 93.1619 294.04 93.2361 295.038 93.4495C295.127 93.3196 295.217 93.1897 295.307 93.0691C296.764 91.102 298.723 89.5618 300.899 88.5319C303.074 87.502 305.483 87.0102 307.875 87.0845C308.846 87.1123 309.843 87.2422 310.814 87.4834C311.192 87.0102 311.605 86.5556 312.046 86.1473C314.635 83.7256 318.258 82.5195 321.737 82.8256C321.737 82.6308 321.737 82.4452 321.737 82.2504C321.799 79.7452 322.671 77.1657 324.829 75.7925C325.8 75.1709 326.897 74.874 328.029 75.0503C328.82 75.1709 328.667 76.442 327.876 76.3214L327.858 76.3214ZM295.02 96.1681C294.408 97.9125 294.642 99.9723 296.377 100.891C297.024 101.234 297.833 101.345 298.472 100.928C299.29 100.399 299.505 99.2949 299.362 98.3764C299.065 96.5114 297.285 95.4629 295.559 94.9341C295.352 95.333 295.163 95.7413 295.011 96.1681L295.02 96.1681ZM310.742 89.8587C309.87 91.5567 309.376 93.8392 310.392 95.5928C311.201 96.9939 313.071 98.0424 314.617 97.2908C316.451 96.3908 316.577 93.7 315.642 92.0948C314.707 90.4897 313.017 89.5154 311.282 88.9587C311.093 89.2463 310.904 89.5433 310.742 89.8587ZM324.281 89.4134C324.802 90.0907 325.719 90.6474 326.573 90.3691C327.463 90.0814 327.831 88.9865 327.75 88.1144C327.643 86.9453 326.762 86.0546 325.845 85.4607C324.973 84.904 324.02 84.5236 323.022 84.3009C323.076 84.8855 323.148 85.4607 323.22 86.036C323.373 87.2051 323.552 88.4762 324.281 89.4226L324.281 89.4134Z" fill="#F3E3D4"/>
              <path d="M0.0841505 281.786C-0.391059 279.337 1.19415 276.959 3.63049 276.48C3.90474 276.426 4.17664 276.398 4.44617 276.398C4.27358 276.189 4.1187 275.961 3.98157 275.716C2.77582 273.531 3.55607 270.782 5.72288 269.568C7.8897 268.354 10.6275 269.136 11.8332 271.321C11.968 271.566 12.0779 271.817 12.163 272.074C12.3072 271.846 12.4739 271.628 12.663 271.421C14.3511 269.593 17.1917 269.489 19.011 271.192C20.8267 272.892 20.9295 275.752 19.2379 277.58C19.0488 277.787 18.8455 277.97 18.628 278.13C18.8904 278.196 19.1481 278.289 19.4011 278.408C21.6494 279.462 22.6247 282.15 21.5821 284.414C20.5359 286.678 17.8655 287.663 15.6136 286.61C15.363 286.491 15.1277 286.353 14.9079 286.196C14.9244 286.465 14.9161 286.738 14.883 287.017C14.5851 289.498 12.3474 291.266 9.88273 290.962C7.42157 290.662 5.66967 288.409 5.96756 285.928C6.00066 285.649 6.05739 285.38 6.13778 285.121C5.88953 285.223 5.6283 285.301 5.35405 285.353C2.92126 285.835 0.55936 284.239 0.0841505 281.786Z" fill="#F3E3D4"/>
              <path d="M36.9856 194.844L2.67792 174.564L2.93749 174.125L37.2452 194.405L36.9856 194.844Z" fill="#F3E3D4"/>
              <path d="M36.5014 194.854L36.4546 199.829L37.4605 200.423L37.5072 195.449L38.5131 196.043L38.4612 201.015L39.4672 201.61L39.5139 196.635L40.5198 197.229L40.4731 202.204L41.4739 202.796L41.5258 197.824L42.5521 198.431L43.0713 197.553L42.0449 196.946L46.3787 194.498L45.3779 193.907L41.0389 196.351L40.033 195.757L44.372 193.312L43.366 192.718L39.0323 195.165L38.0264 194.57L42.3652 192.126L41.3594 191.531L37.0205 193.976L36.5014 194.854Z" fill="#F3E3D4"/>
              <path d="M-2.51623 171.197C0.540193 171.75 4.58838 172 7.51151 171.461L3.50884 174.759L2.54934 179.855C1.61228 177.035 -0.558481 173.608 -2.51623 171.197Z" fill="#F3E3D4"/>
              <path d="M445.637 321.704C444.709 324.284 446.048 327.127 448.627 328.055L447.334 331.649C444.755 330.721 441.911 332.059 440.983 334.638C440.055 337.218 441.396 340.055 443.975 340.983L442.68 344.582C440.101 343.654 437.259 344.987 436.329 347.572C435.401 350.152 436.742 352.989 439.321 353.917L438.029 357.51C435.449 356.582 432.606 357.921 431.678 360.5C430.749 363.079 432.088 365.923 434.667 366.851L433.375 370.444C430.795 369.516 427.952 370.855 427.024 373.434C426.096 376.013 427.437 378.85 430.016 379.778L428.721 383.378C426.142 382.45 423.298 383.789 422.37 386.368C421.444 388.941 422.783 391.784 425.362 392.712L424.069 396.305C421.49 395.377 418.646 396.716 417.718 399.295C416.79 401.874 418.129 404.718 420.708 405.646L419.415 409.239C416.836 408.311 413.992 409.65 413.064 412.229C412.136 414.808 413.475 417.652 416.054 418.58L414.764 422.167C412.184 421.239 409.338 422.584 408.413 425.157C407.484 427.736 408.823 430.58 411.402 431.508L410.11 435.101C407.53 434.173 404.687 435.511 403.759 438.091C402.831 440.67 404.169 443.514 406.749 444.442L404.605 450.398L399.935 448.718C400.863 446.139 399.53 443.297 396.951 442.369C394.366 441.439 391.528 442.78 390.6 445.359L387.001 444.064C387.929 441.485 386.597 438.643 384.011 437.713C381.438 436.787 378.594 438.126 377.666 440.705L373.414 439.175C374.342 436.596 373.003 433.752 370.424 432.824C367.845 431.896 365.001 433.235 364.073 435.814L360.48 434.521C361.408 431.942 360.07 429.098 357.49 428.17C354.911 427.242 352.067 428.581 351.139 431.16L347.553 429.87C348.481 427.29 347.136 424.445 344.563 423.519C341.984 422.591 339.14 423.929 338.212 426.509L334.619 425.216C335.547 422.637 334.208 419.793 331.629 418.865C329.05 417.937 326.206 419.276 325.278 421.855L321.685 420.562C322.613 417.983 321.274 415.139 318.695 414.211C316.122 413.285 313.272 414.622 312.344 417.201L308.757 415.91C309.685 413.331 308.347 410.487 305.767 409.559C303.188 408.631 300.345 409.97 299.417 412.549L293.681 410.486L295.825 404.529C298.404 405.457 301.248 404.118 302.176 401.539C303.104 398.96 301.765 396.116 299.186 395.188L300.479 391.595C303.058 392.523 305.902 391.184 306.83 388.605C307.756 386.032 306.419 383.182 303.84 382.254L305.13 378.667C307.71 379.595 310.553 378.257 311.481 375.677C312.409 373.098 311.071 370.255 308.491 369.326L309.784 365.733C312.364 366.661 315.207 365.323 316.135 362.743C317.063 360.164 315.725 357.321 313.145 356.393L314.438 352.799C317.017 353.727 319.861 352.389 320.787 349.816C321.715 347.237 320.376 344.393 317.797 343.465L319.092 339.866C321.671 340.794 324.513 339.461 325.441 336.882C326.369 334.303 325.03 331.459 322.451 330.531L323.744 326.938C326.323 327.866 329.167 326.527 330.095 323.948C331.023 321.369 329.684 318.525 327.105 317.597L328.398 314.004C330.977 314.932 333.818 313.6 334.746 311.021C335.677 308.435 334.336 305.598 331.756 304.67L333.052 301.07C335.631 301.998 338.472 300.666 339.4 298.087C340.328 295.507 338.99 292.664 336.41 291.736L337.703 288.143C340.282 289.071 343.126 287.732 344.054 285.153C344.982 282.574 343.641 279.736 341.062 278.808L343.148 273.01L348.883 275.073C347.953 277.659 349.294 280.496 351.873 281.424C354.452 282.352 357.294 281.02 358.224 278.434L361.811 279.725C360.881 282.31 362.228 285.15 364.801 286.076C367.38 287.004 370.221 285.672 371.152 283.086L374.745 284.379C373.815 286.964 375.156 289.802 377.735 290.73C380.314 291.658 383.155 290.325 384.086 287.74L387.679 289.033C386.749 291.618 388.09 294.456 390.669 295.384C393.242 296.31 396.089 294.979 397.02 292.394L400.606 293.684C399.676 296.27 401.017 299.107 403.596 300.035C406.176 300.963 409.017 299.631 409.947 297.045L413.54 298.338C412.61 300.924 413.951 303.761 416.53 304.689C419.109 305.617 421.951 304.285 422.881 301.699L427.133 303.229C426.203 305.815 427.544 308.652 430.117 309.578C432.702 310.508 435.537 309.174 436.468 306.588L440.067 307.883C439.137 310.469 440.472 313.304 443.057 314.234C445.636 315.162 448.471 313.828 449.402 311.242L454.072 312.923L451.986 318.721C449.407 317.793 446.565 319.125 445.637 321.704Z" stroke="#F3E3D4" strokeWidth="0.67348" strokeMiterlimit="10"/>
              <path d="M396.795 432.579L311.454 401.871L351.258 291.252L436.599 321.96L396.795 432.579Z" stroke="#F3E3D4" strokeWidth="0.67348" strokeMiterlimit="10"/>
              <path d="M364.65 355.53C364.65 351.073 368.262 347.46 372.719 347.46C377.176 347.46 380.789 351.073 380.789 355.53C380.789 359.987 377.176 363.6 372.719 363.6C368.262 363.6 364.65 359.987 364.65 355.53Z" fill="#F3E3D4"/>
              <path d="M375.418 371.705C375.418 369.474 377.227 367.664 379.459 367.664C381.691 367.664 383.5 369.474 383.5 371.705C383.5 373.937 381.691 375.746 379.459 375.746C377.227 375.746 375.418 373.937 375.418 371.705Z" fill="#F3E3D4"/>
              <path d="M258.999 160.277C258.999 156.811 261.809 154.001 265.275 154.001C268.741 154.001 271.551 156.811 271.551 160.277C271.551 163.743 268.741 166.553 265.275 166.553C261.809 166.553 258.999 163.743 258.999 160.277Z" fill="#F3E3D4"/>
              <path d="M267.375 172.855C267.375 171.12 268.782 169.713 270.517 169.713C272.253 169.713 273.66 171.12 273.66 172.855C273.66 174.591 272.253 175.998 270.517 175.998C268.782 175.998 267.375 174.591 267.375 172.855Z" fill="#F3E3D4"/>
            </g>
          </g>
          <defs>
            <linearGradient id="paint0_linear_1_69" x1="412" y1="349" x2="412" y2="-343" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6A5548"/>
              <stop offset="1" stopColor="#D44C47" stopOpacity="0"/>
            </linearGradient>
            <linearGradient id="paint1_linear_1_69" x1="294" y1="349" x2="294" y2="-343" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6A5548"/>
              <stop offset="1" stopColor="#D44C47" stopOpacity="0"/>
            </linearGradient>
            <linearGradient id="paint2_linear_1_69" x1="176" y1="349" x2="176" y2="-343" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6A5548"/>
              <stop offset="1" stopColor="#D44C47" stopOpacity="0"/>
            </linearGradient>
            <linearGradient id="paint3_linear_1_69" x1="58" y1="349" x2="58" y2="-343" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6A5548"/>
              <stop offset="1" stopColor="#D44C47" stopOpacity="0"/>
            </linearGradient>
            <clipPath id="clip0_1_69">
              <rect width="440" height="414" fill="white"/>
            </clipPath>
            <clipPath id="clip1_1_69">
              <rect width="285" height="576" fill="white" transform="matrix(-4.37114e-08 -1 -1 4.37114e-08 523 349)"/>
            </clipPath>
          </defs>
        </svg>

        {/* Content on top of SVG background */}
        <div className="relative z-10 max-w-[460px] mx-auto pb-3">
          <div className="grid grid-cols-2 gap-6 items-end pt-25 mb-8 mx-3">
            <div>
              <EeniMeeniLogoWhite className="h-20 w-auto" />
            </div>
            <div className="text-right">
              <MinyMoeFooterWhite className="h-20 w-auto ml-auto" />
            </div>
          </div>

          <a
            href="tel:+919996664249"
            className="text-center text-[22px] font-semibold mb-3 block border border-[#E7DED4] hover:text-[#E3D6C7] transition-colors"
          >
            Contact Us: +91 9996664249
          </a>

          <p className="text-center text-[16px] mb-3">
            © 2026 minymoe, eenimeeni. All Rights Reserved.
          </p>

          <div className="flex items-center justify-center gap-4">
            <a href="https://www.instagram.com/emmm.world" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="h-14 w-14 rounded-full border-2 border-[#E7DED4] flex items-center justify-center hover:bg-[#816C5F] transition-colors">
              <Instagram size={24} />
            </a>
            <a href="https://www.facebook.com/profile.php?id=61581327863909&name=xhp_nt__fb__action__open_user" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="h-14 w-14 rounded-full border-2 border-[#E7DED4] flex items-center justify-center hover:bg-[#816C5F] transition-colors">
              <Facebook size={24} />
            </a>
            <a href="https://wa.me/919996664249" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="h-14 w-14 rounded-full border-2 border-[#E7DED4] flex items-center justify-center hover:bg-[#816C5F] transition-colors">
              <svg width="22" height="22" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.0786 4.35833e-05C3.66327 4.35833e-05 0.0646936 3.59862 0.0646936 8.01395C0.0646936 9.42912 0.436681 10.8039 1.13214 12.0169L0 16.1734L4.24551 15.0575C5.41808 15.6963 6.73621 16.0359 8.0786 16.0359C12.4939 16.0359 16.0925 12.4374 16.0925 8.02204C16.0925 5.87906 15.2596 3.86548 13.7474 2.35327C13.0059 1.60453 12.1228 1.01085 11.1495 0.606838C10.1763 0.202824 9.13236 -0.00344749 8.0786 4.35833e-05ZM8.08669 1.35052C9.86576 1.35052 11.5316 2.04598 12.7931 3.3075C13.4121 3.92655 13.9028 4.66162 14.2372 5.47062C14.5717 6.27962 14.7432 7.14664 14.742 8.02204C14.742 11.6934 11.75 14.6774 8.0786 14.6774C6.88177 14.6774 5.7092 14.362 4.69028 13.7474L4.44768 13.6099L1.92463 14.273L2.59583 11.8147L2.43409 11.5559C1.76657 10.4953 1.41329 9.26717 1.41517 8.01395C1.42326 4.34259 4.40724 1.35052 8.08669 1.35052ZM5.24017 4.31025C5.11078 4.31025 4.89244 4.35877 4.70645 4.56093C4.52854 4.7631 4.00291 5.25639 4.00291 6.23488C4.00291 7.22145 4.72262 8.1676 4.81158 8.30507C4.92479 8.44254 6.23483 10.4642 8.24842 11.3214C8.72553 11.5397 9.09752 11.661 9.38864 11.75C9.86576 11.9036 10.3024 11.8794 10.6502 11.8309C11.0383 11.7743 11.8308 11.3457 12.0006 10.8766C12.1705 10.4076 12.1705 10.0114 12.1219 9.92241C12.0653 9.84154 11.9359 9.79302 11.7338 9.70407C11.5316 9.59085 10.545 9.10565 10.3671 9.04096C10.1811 8.97626 10.0679 8.94392 9.91428 9.138C9.78489 9.34017 9.39673 9.79302 9.28351 9.92241C9.16221 10.0599 9.049 10.0761 8.85492 9.97901C8.64467 9.87389 7.99773 9.66363 7.23758 8.98435C6.63917 8.45063 6.24292 7.79561 6.12162 7.59344C6.02458 7.39936 6.11353 7.27806 6.21057 7.18911C6.29953 7.10015 6.42891 6.95459 6.50978 6.83329C6.61491 6.72008 6.64725 6.63113 6.71195 6.50174C6.77664 6.36427 6.7443 6.25105 6.69578 6.15401C6.64725 6.06506 6.24292 5.06231 6.0731 4.66606C5.91137 4.2779 5.74963 4.32642 5.62025 4.31833C5.50703 4.31833 5.37765 4.31025 5.24017 4.31025Z" fill="white"/>
              </svg>
            </a>
          </div>
        </div>
      </section>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Fredoka+One&display=swap');
        .font-display { font-family: 'Fredoka One', cursive; }
        .font-body { font-family: 'Nunito', sans-serif; }
        .mobile-date-input {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          display: block;
          -webkit-appearance: none;
          appearance: none;
        }
        .mobile-date-input::-webkit-date-and-time-value {
          text-align: left;
        }
        .mobile-date-input::-webkit-calendar-picker-indicator {
          margin: 0;
          padding: 0;
        }
      `}</style>
    </div>
  );
}

// ── Tiny helpers ─────────────────────────────────────────────────────────────

function EeniMeeniLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      width="78"
      height="50"
      viewBox="0 0 78 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Eeni Meeni"
    >
      <path d="M14.0137 20.7051C14.0137 20.7051 14.0015 20.7097 14 20.7127C14 20.7127 14.0015 20.7107 14.0046 20.7066C14.0066 20.7066 14.0097 20.7066 14.0137 20.7066V20.7051Z" fill="#010101"/>
      <path d="M21.9935 21.087C21.9946 21.087 21.9925 21.0896 21.9874 21.0947C21.9884 21.0916 21.9874 21.0881 21.9844 21.084C21.9874 21.084 21.9905 21.084 21.9935 21.084V21.087Z" fill="#010101"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M15.581 15.4777C15.581 15.4777 15.5778 15.5031 15.5746 15.5174C15.0084 17.6921 12.5349 20.3663 9.0276 20.0959C4.80767 19.7698 1.83956 17.078 2.1879 12.541C2.53466 8.05319 5.36439 4.87946 9.07691 5.16422C13.7088 5.52216 15.0338 9.25905 14.7284 13.2123C14.6743 13.9393 14.2989 14.0936 13.9235 14.0793C13.9066 14.0793 13.8891 14.0793 13.8711 14.0793C13.7852 14.0984 12.9994 14.0873 7.21587 13.7739C7.07749 13.7643 6.96615 13.89 6.99001 14.0268C7.23656 15.4045 8.15594 15.9501 9.04669 16.0201C9.89608 16.0838 10.7073 15.7099 10.8934 15.1865C10.957 14.9718 11.1368 14.8636 11.4533 14.8875C14.0047 15.0354 15.1992 15.0529 15.247 15.0561C15.4871 15.0736 15.6017 15.204 15.5858 15.3981L15.581 15.4745V15.4777ZM8.84945 9.70766C8.16389 9.65516 7.59126 9.99561 7.28268 10.8881C7.23337 11.0265 7.33517 11.1728 7.48151 11.176C8.46293 11.2046 9.64317 11.2333 9.73384 11.2396C9.80542 11.2444 9.83246 11.2221 9.84041 11.1267C9.89608 10.422 9.60182 9.76493 8.85263 9.70766H8.84945Z" fill="#F1A21E"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M30.6895 13.6291C30.6895 13.6466 30.6927 13.6625 30.6895 13.68C30.5909 15.9613 28.714 19.1414 25.1764 19.6298C20.9167 20.2168 17.3935 18.1821 16.7636 13.6005C16.1417 9.07296 18.2652 5.3106 22.0111 4.79676C26.6875 4.15406 28.8062 7.57757 29.355 11.569C29.4568 12.2992 29.1196 12.5362 28.7458 12.6014C28.7257 12.6046 28.7071 12.6094 28.6901 12.6158C28.5979 12.6555 27.7835 12.8194 22.0699 13.7373C21.9045 13.7644 21.8059 13.9409 21.8727 14.0984C22.4215 15.3711 23.4363 15.702 24.3223 15.5827C25.1796 15.4634 25.9034 14.9177 25.9765 14.3562C25.9924 14.1303 26.1499 13.9839 26.4664 13.9409C29.0305 13.5369 30.2187 13.2982 30.268 13.2935C30.513 13.2585 30.6514 13.3651 30.6784 13.5607L30.6864 13.6323L30.6895 13.6291ZM22.7682 9.35612C22.0906 9.44998 21.5991 9.89383 21.4735 10.8102C21.4512 10.9851 21.6055 11.1299 21.7789 11.0981C22.7507 10.9151 23.8864 10.7004 23.9771 10.6877C24.0487 10.6797 24.0725 10.6511 24.0582 10.5508C23.9596 9.84292 23.5285 9.25272 22.7698 9.35612H22.7682Z" fill="#F1A21E"/>
      <path d="M45.5803 19.3192C45.5803 19.4321 45.4865 19.526 45.3735 19.526L41.3334 19.5626C41.2029 19.5626 40.9946 19.4496 40.88 19.3192C39.5964 17.6949 37.7863 14.5403 36.9162 12.9192C36.8796 12.8429 36.7651 12.7124 36.614 12.7124C36.4629 12.7124 36.3324 12.8428 36.3324 13.0703L35.8616 19.6421C35.8441 19.7551 35.7487 19.8314 35.6357 19.8314L31.5955 19.6039C31.4826 19.6039 31.4062 19.5117 31.4062 19.4146C31.8214 15.77 32.1618 9.53866 32.2 4.96976C32.2 4.85522 32.2922 4.80114 32.4068 4.80114L37.3202 5.00636H37.3441C37.492 5.03341 37.6717 5.14316 37.7099 5.25452C38.4273 7.0299 39.6362 10.5027 40.8259 12.259C40.9007 12.3895 40.9946 12.4849 41.09 12.4849C41.2411 12.4849 41.354 12.3338 41.354 12.1286L41.4304 4.57682C41.4304 4.48137 41.5051 4.4082 41.599 4.4082C42.3545 4.55933 43.3916 4.63409 44.3746 4.63409C44.9409 4.63409 45.4117 4.58001 45.978 4.55933C46.0718 4.53864 46.1084 4.68978 46.1084 4.74865L45.5803 19.3255V19.3192Z" fill="#43B44D"/>
      <path d="M52.036 19.376C52.036 19.5271 51.904 19.6401 51.7704 19.6401H51.7529L48.3362 19.5446C48.1676 19.5446 48.0547 19.4126 48.034 19.2615L47.7891 9.99001C47.7891 9.83888 47.9036 9.72593 48.0547 9.72593L52.001 9.7832C52.1521 9.7832 52.2826 9.91365 52.2826 10.0648L52.0376 19.376H52.036ZM50.4709 8.8971C49.2811 8.8971 48.3172 7.87738 48.3172 6.61265C48.3172 5.34793 49.2795 4.3457 50.4709 4.3457C51.6622 4.3457 52.6421 5.36543 52.6421 6.61265C52.6421 7.85988 51.6797 8.8971 50.4709 8.8971Z" fill="#D44C47"/>
      <path d="M75.1551 43.204C75.1201 43.1743 75.084 43.1462 75.0469 43.1197C71.371 40.5998 66.8282 39.6007 62.4158 39.6469C56.47 39.6294 52.0067 40.7843 46.3902 43.0401C41.2795 44.833 36.0432 48.9883 28.3016 45.0812C24.8022 43.091 25.4846 40.5043 26.501 37.3529C26.9193 36.0595 27.7162 34.0805 27.8355 32.6615C28.7915 24.1139 22.7344 22.7187 18.3061 25.9067C18.1947 26.0054 18.0229 25.991 17.9339 25.8749C16.8029 24.1711 13.9955 24.2236 12.0947 24.7884C11.9579 24.8281 11.802 24.6913 11.6557 24.5323C11.3996 24.2443 11.118 23.977 10.8222 23.7321L9.9696 23.0241C8.38692 21.7069 5.91668 22.9366 6.13459 24.9856C6.13459 24.9888 6.13459 24.9915 6.13459 24.9936C6.12028 25.0111 6.46226 37.9001 6.45431 37.9224C6.45431 38.1212 6.62451 38.2915 6.82334 38.2915L11.4091 38.414C11.6063 38.414 11.7527 38.2421 11.7527 38.0449L11.7288 31.104C11.7145 29.1648 12.074 28.223 13.0777 28.258C15.5559 27.4037 14.5474 36.6258 14.5251 38.2167C14.5156 38.3217 14.5888 38.4378 14.6953 38.4378L19.3813 38.7798C19.5849 38.7926 19.6979 38.6907 19.7233 38.5364C19.8219 37.8508 19.9221 36.1327 19.9221 33.1387C19.9683 31.9297 19.5086 30.0859 20.4677 29.0598C20.7175 28.7925 21.0467 28.6191 21.4014 28.5316C26.3928 27.2733 23.5186 37.399 23.3849 37.8762C22.2111 42.0379 23.4183 46.68 27.9023 48.6478C36.1736 52.2766 45.6187 47.6742 53.8311 45.7191C59.8914 44.1346 65.2916 43.0067 72.3969 47.407C73.364 48.099 74.4011 48.2088 75.1344 48.1722C75.8661 48.134 76.5182 47.8142 76.9891 47.2797C76.9891 47.2797 76.9938 47.2733 76.997 47.2702C78.5702 45.4566 76.5087 44.3319 75.163 43.204H75.1551Z" fill="#D44C47"/>
      <path d="M40.879 39.8852L30.0293 40.7888C29.7939 40.8095 29.6746 40.6122 29.6364 40.3959C29.3437 38.4312 29.3438 35.7983 29.3438 33.7923C29.3438 31.3169 29.3835 27.9157 29.8543 25.5183C29.8957 25.2828 30.0325 25.084 30.2886 25.084L40.4097 25.2622C40.6086 25.2622 40.782 25.4181 40.782 25.6344C40.782 26.2246 40.5068 27.6389 40.4272 28.3086C40.4081 28.5234 40.1918 28.7413 39.9564 28.7413L34.8282 29.0341C34.5928 29.0341 34.3749 29.2329 34.3161 29.4684C34.2381 29.8597 34.0027 30.9622 34.0027 31.3344C34.0027 31.5317 34.1586 31.6478 34.3367 31.6478C36.2232 31.6478 38.1495 31.3917 40.0359 31.3917C40.2507 31.3917 40.4272 31.5889 40.4272 31.8053L40.3493 34.0659C40.3286 34.3013 40.1521 34.5193 39.9167 34.5368L34.2747 35.1842C34.0393 35.2049 33.8834 35.5565 33.8834 35.7951C33.8834 36.0895 33.9407 36.5635 34.3367 36.5428L40.7247 36.3281C40.9394 36.3281 41.1367 36.5253 41.1573 36.7401C41.1987 37.6851 41.2766 38.5107 41.2766 39.4525C41.2766 39.6673 41.0985 39.8645 40.8837 39.8852H40.879Z" fill="#5D66AD"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M55.5158 33.5512C55.5158 33.5682 55.5147 33.5852 55.5126 33.6021C55.1086 35.8341 52.8276 38.7119 49.2789 38.7119C45.0065 38.7119 41.8125 36.2318 41.8125 31.639C41.8125 27.0463 44.4164 23.6816 48.1718 23.6816C52.8626 23.6816 54.4803 27.3406 54.4803 31.3431C54.4803 32.0749 54.1176 32.261 53.739 32.2754C53.7199 32.2743 53.7019 32.2775 53.6849 32.2849C53.5879 32.3104 52.7656 32.3629 47.0139 32.4917C46.8452 32.4933 46.7275 32.6572 46.7737 32.8163C47.1395 34.1414 48.0923 34.6107 48.9815 34.6107C49.8706 34.6107 50.6278 34.1685 50.7757 33.6276C50.825 33.4065 50.9968 33.284 51.3165 33.284C53.8933 33.2347 55.0974 33.1631 55.1467 33.1631C55.3901 33.1631 55.5158 33.284 55.5158 33.4828V33.5544V33.5512ZM48.2927 28.2696C47.6135 28.2696 47.0695 28.6419 46.823 29.5264C46.7768 29.695 46.9105 29.8573 47.0838 29.8493C48.0637 29.8016 49.2153 29.7412 49.3012 29.7412C49.3743 29.7412 49.3998 29.7173 49.3998 29.6187C49.3998 28.9076 49.0578 28.268 48.2959 28.268L48.2927 28.2696Z" fill="#F1A21E"/>
      <path d="M70.635 36.2895C70.635 36.4041 70.5428 36.4963 70.4282 36.4963L66.3896 36.5345C66.2576 36.5345 66.0492 36.4216 65.9363 36.2895C64.6511 34.6653 62.8409 31.5122 61.9709 29.8896C61.9343 29.8148 61.8198 29.6828 61.6686 29.6828C61.5175 29.6828 61.3871 29.8148 61.3871 30.0407L60.9163 36.6125C60.8988 36.727 60.8033 36.8018 60.6904 36.8018L56.6502 36.5743C56.5373 36.5743 56.4609 36.482 56.4609 36.3866C56.8761 32.742 57.2165 26.5122 57.2547 21.9401C57.2547 21.8272 57.3469 21.7715 57.4614 21.7715L62.3749 21.9783C62.3749 21.9783 62.3908 21.9783 62.3988 21.9783C62.5467 22.0006 62.7264 22.1119 62.7646 22.2217C63.4836 23.9987 64.6924 27.4715 65.8806 29.2278C65.9554 29.3582 66.0492 29.4537 66.1447 29.4537C66.2958 29.4537 66.4087 29.3025 66.4087 29.0957L66.4851 21.5456C66.4851 21.4517 66.5598 21.377 66.6537 21.377C67.4092 21.5281 68.4463 21.6029 69.4293 21.6029C69.9956 21.6029 70.4664 21.5472 71.0327 21.5281C71.1265 21.5106 71.1647 21.6585 71.1647 21.7158L70.635 36.2927V36.2895Z" fill="#5D66AD"/>
      <path d="M76.9501 39.0811C76.9501 39.2322 76.8181 39.3467 76.6845 39.3467H76.667L73.2503 39.2529C73.0817 39.2529 72.9688 39.1224 72.9481 38.9713L72.7031 29.6999C72.7031 29.5487 72.8176 29.4342 72.9688 29.4342L76.9151 29.4899C77.0662 29.4899 77.1966 29.6203 77.1966 29.7714L76.9517 39.0811H76.9501ZM75.3849 28.6038C74.1951 28.6038 73.2312 27.5825 73.2312 26.3193C73.2312 25.0546 74.1935 24.0508 75.3849 24.0508C76.5763 24.0508 77.5561 25.0721 77.5561 26.3193C77.5561 27.565 76.5938 28.6038 75.3849 28.6038Z" fill="#43B44D"/>
      <path d="M5.59102 3.26848C5.47173 2.88191 5.17109 2.58442 4.80207 2.41579C4.30261 2.18671 4.11333 1.09379 3.14941 0.355638C2.19026 -0.37774 0.609176 0.0120163 0.114491 1.62831C-0.486766 3.59937 1.35518 5.85997 3.8811 5.93951C5.45582 5.8552 5.95368 4.4473 5.58784 3.26848H5.59102Z" fill="#D44C47"/>
      <path d="M26.3378 3.26996C26.4571 2.88339 26.7562 2.5859 27.1252 2.41727C27.6246 2.18819 27.8139 1.09527 28.7794 0.357118C29.7418 -0.377851 31.3197 0.0103306 31.8128 1.62663C32.4156 3.59768 30.5721 5.85986 28.0462 5.93781C26.4714 5.85349 25.9752 4.44718 26.341 3.26678L26.3378 3.26996Z" fill="#D44C47"/>
      <path d="M16.3625 23.1754C15.0582 23.0242 13.3706 20.875 14.0243 20.1162H14.0275C14.791 19.2317 19.3227 19.6644 19.5772 20.7287C19.8365 21.7929 18.0518 23.3711 16.3625 23.1754Z" fill="#D44C47"/>
    </svg>
  );
}

function MinyMoeWordmark({ className = "" }: { className?: string }) {
  return (
    <svg
      width="57"
      height="44"
      viewBox="0 0 57 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Miny Moe"
    >
      <path d="M19.3684 8.15951C19.3684 11.9167 18.4787 15.6177 18.4787 19.3469L18.5067 19.8751L16.0025 20.0138C15.9745 19.7909 15.9745 19.5961 15.9745 19.3733C15.9745 15.6161 16.8642 11.9431 16.8642 8.18592C16.8642 7.43481 16.8081 4.4568 15.7235 4.4568C13.4967 4.4568 11.2714 13.9455 10.8538 15.9215L8.37764 15.56C8.60049 12.9715 8.93394 10.3848 8.93394 7.79633C8.93394 6.96104 8.82335 2.73173 7.68102 2.73173C4.95395 4.12334 3.25696 17.0077 2.72707 20.1789L0.25092 19.8173C0.6405 16.6165 0.807227 13.3892 0.807227 10.1338C0.807227 8.10172 0.779161 2.8704 0 1.17339L2.2533 0.115234C2.92186 1.53491 3.11665 4.03915 3.19918 5.62555C3.86775 3.73375 5.23128 0.227496 7.67937 0.227496C10.4906 0.227496 11.1856 3.59508 11.3523 5.82034C12.1876 4.09527 13.5792 1.95256 15.7219 1.95256C18.9491 1.95256 19.3668 5.70974 19.3668 8.15786L19.3684 8.15951Z" fill="#6A5548"/>
      <path d="M23.2624 0C24.2363 0 25.0716 0.807237 25.0716 1.80926C25.0716 2.81129 24.2363 3.61852 23.2624 3.61852C22.2884 3.61852 21.4531 2.81129 21.4531 1.80926C21.4531 0.807237 22.2603 0 23.2624 0ZM21.9269 6.17723H24.5698V20.0917H21.9269V6.17723Z" fill="#6A5548"/>
      <path d="M38.6965 12.6661C38.6965 15.1704 38.2227 17.6465 38.1121 20.1524L35.6904 20.0418C35.801 17.5656 36.2748 15.0878 36.2748 12.5836C36.2748 11.471 36.2187 8.38068 34.6059 8.38068C33.4652 8.38068 32.0736 11.4412 31.684 12.3888C30.5995 14.9772 29.959 17.7043 29.264 20.4033L26.8984 19.9576C27.2038 17.4534 27.3986 14.9211 27.3986 12.3888C27.3986 10.497 27.3144 8.60354 26.9248 6.7398L29.2623 6.23797C29.5958 7.6857 29.7361 9.18792 29.7906 10.6621C30.6539 8.7422 32.1842 5.95898 34.6042 5.95898C38.1385 5.95898 38.6948 9.93902 38.6948 12.6661H38.6965Z" fill="#6A5548"/>
      <path d="M55.0451 4.62054C55.0451 6.76326 54.7942 8.90598 54.3782 10.9926C55.296 11.326 56.1313 11.8279 56.7999 12.5228L54.9906 14.276C54.6853 13.9425 54.2957 13.6635 53.878 13.4687C53.183 16.4468 51.7073 20.5919 48.0343 20.5919C46.1145 20.5919 44.8335 19.0897 44.8335 17.2243C44.8335 13.4952 48.3678 10.7681 51.9021 10.6294C52.2636 8.8482 52.4864 7.03894 52.5426 5.20327C50.7614 8.04262 47.3113 12.9388 43.5822 12.9388C41.3834 12.9388 40.1602 11.4086 40.1602 9.26585C40.1602 6.53875 42.1922 2.11465 43.8612 0L45.8371 1.55834C44.5017 3.22893 42.6363 7.09672 42.6363 9.21137C42.6363 9.93441 42.775 10.4363 43.6103 10.4363C46.755 10.4363 51.0684 2.94995 52.432 0.389582L54.7694 0.807236C54.9642 2.06018 55.0484 3.33953 55.0484 4.61889L55.0451 4.62054ZM51.3441 13.2195C49.3962 13.5249 47.3096 15.0849 47.3096 17.1995C47.3096 17.6733 47.5044 18.1173 48.0327 18.1173C50.0367 18.1173 50.9826 14.7498 51.3441 13.2195Z" fill="#6A5548"/>
      <path d="M0.105469 22.2305H3.20892L10.6654 38.9381L18.0939 22.2305H21.1957V42.1521H18.3497V28.2905L12.1742 42.1521H9.12856L2.95304 28.2905V42.1521H0.105469V22.2305Z" fill="#6A5548"/>
      <path d="M24.3828 29.9895C24.3828 25.1312 27.199 21.9766 31.5917 21.9766C35.9844 21.9766 38.8006 25.1329 38.8006 29.9895C38.8006 34.8461 35.953 38.0337 31.5917 38.0337C27.2304 38.0337 24.3828 34.8774 24.3828 29.9895ZM38.4771 42.1557H24.7097V39.5937H38.4771V42.1557ZM27.478 29.9895C27.478 31.9704 28.0029 35.2489 31.5934 35.2489C35.1838 35.2489 35.7087 31.9704 35.7087 29.9895C35.7087 28.0085 35.1524 24.7598 31.5934 24.7598C28.0343 24.7598 27.478 28.0382 27.478 29.9895Z" fill="#6A5548"/>
      <path d="M55.9077 36.203C55.9374 36.4655 55.9671 36.7593 55.9671 37.0532C55.9671 41.2478 51.8617 43.0653 48.1937 43.0653C44.8789 43.0653 40.6562 41.4525 40.6562 37.5517C40.6562 34.8527 42.1816 32.918 44.557 31.802C43.0036 31.0113 41.83 29.7204 41.83 27.9309C41.83 23.9707 45.9354 21.9766 49.4268 21.9766C52.3899 21.9766 55.6733 23.4441 55.6733 26.8447C55.6733 28.0184 55.2622 29.1327 54.7059 30.1595L52.3882 28.8686C52.7399 28.2528 53.0337 27.5777 53.0337 26.8447C53.0337 25.0553 50.8035 24.6145 49.3971 24.6145C47.4607 24.6145 44.4695 25.5538 44.4695 27.9293C44.4695 29.8937 49.1032 30.3642 50.541 30.5705L50.3644 33.1804C47.6654 33.2399 43.2958 34.0884 43.2958 37.5517C43.2958 39.7522 46.4934 40.4554 48.2234 40.4554C50.2769 40.4554 53.3275 39.6053 53.3275 37.0532C53.3275 36.8765 53.3275 36.7016 53.2978 36.5249L55.9077 36.203Z" fill="#6A5548"/>
    </svg>
  );
}

function EeniMeeniLogoWhite({ className = "" }: { className?: string }) {
  return (
    <svg
      width="125"
      height="81"
      viewBox="0 0 125 81"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Eeni Meeni White"
    >
      <path d="M22.5782 33.3652C22.5782 33.3652 22.5573 33.3757 22.5547 33.3809C22.5547 33.3792 22.5573 33.3757 22.5625 33.3705C22.566 33.3705 22.5712 33.3705 22.5782 33.3705V33.3652Z" fill="white"/>
      <path d="M35.4452 33.9831C35.447 33.9831 35.4435 33.9883 35.4349 33.9986C35.4366 33.9917 35.4349 33.9857 35.4297 33.9805C35.4349 33.9805 35.4401 33.9805 35.4452 33.9805V33.9831Z" fill="white"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M25.1233 24.9423C25.1233 24.9423 25.1181 24.9833 25.113 25.0089C24.2003 28.511 20.2138 32.8207 14.5608 32.3848C7.75932 31.8618 2.97546 27.524 3.53691 20.2122C4.0958 12.9798 8.65662 7.86263 14.6403 8.32154C22.1058 8.89838 24.2413 14.9232 23.7491 21.2941C23.662 22.4631 23.0569 22.7119 22.4519 22.6888C22.4245 22.6888 22.3963 22.6888 22.3673 22.6888C22.2288 22.7221 20.9624 22.7041 11.6408 22.1965C11.4177 22.1837 11.2383 22.3837 11.2767 22.6042C11.6741 24.8244 13.1559 25.7063 14.5916 25.8191C15.9606 25.9217 17.2681 25.3166 17.568 24.4732C17.6706 24.127 17.9603 23.9552 18.4705 23.9911C22.5826 24.2296 24.508 24.2578 24.5849 24.2629C24.972 24.2911 25.1566 24.5013 25.1309 24.8167L25.1233 24.9372V24.9423ZM14.2737 15.6436C13.1687 15.5615 12.2458 16.1076 11.7484 17.5459C11.669 17.7715 11.833 18.0048 12.0689 18.0099C13.6507 18.0561 15.553 18.1048 15.6991 18.1125C15.8145 18.1227 15.858 18.0843 15.8709 17.9305C15.9606 16.7973 15.4863 15.7384 14.2788 15.6436H14.2737Z" fill="white"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M49.4698 21.9632C49.4698 21.9914 49.4749 22.0145 49.4698 22.0427C49.3108 25.7191 46.2857 30.844 40.584 31.6311C33.7184 32.5771 28.0398 29.2981 27.0246 21.9171C26.0222 14.6181 29.4447 8.55736 35.4822 7.7267C43.0195 6.69351 46.4344 12.2107 47.3188 18.6431C47.4829 19.8173 46.9394 20.2019 46.3369 20.3045C46.3045 20.3096 46.2746 20.3172 46.2472 20.3275C46.0985 20.3942 44.7859 20.6557 35.5771 22.1375C35.3105 22.1785 35.1515 22.4631 35.2592 22.7169C36.1437 24.7679 37.7793 25.3038 39.2073 25.1115C40.5891 24.9192 41.7556 24.0373 41.8736 23.1348C41.8992 22.7682 42.153 22.5349 42.6632 22.4631C46.7959 21.8145 48.7109 21.4299 48.7904 21.4197C49.1852 21.3632 49.4083 21.5376 49.4518 21.8504L49.4647 21.9683L49.4698 21.9632ZM36.7026 15.077C35.6104 15.2257 34.8182 15.9435 34.6157 17.4202C34.5798 17.6997 34.8285 17.933 35.1079 17.8817C36.6744 17.5869 38.5048 17.2408 38.651 17.2228C38.7663 17.2074 38.8048 17.1613 38.7817 17.0024C38.6228 15.8589 37.928 14.9078 36.7051 15.077H36.7026Z" fill="white"/>
      <path d="M73.4545 31.1355C73.4545 31.3201 73.3032 31.4688 73.1212 31.4688L66.6094 31.5303C66.3992 31.5303 66.0634 31.3483 65.8788 31.1355C63.8099 28.5179 60.8924 23.4365 59.49 20.8215C59.4311 20.701 59.2465 20.4882 59.0029 20.4882C58.7594 20.4882 58.5492 20.701 58.5492 21.0651L57.7903 31.6559C57.7621 31.8405 57.6083 31.961 57.4263 31.961L50.9145 31.597C50.7324 31.597 50.6094 31.4456 50.6094 31.2918C51.2785 25.4183 51.8271 15.3735 51.8887 8.01045C51.8887 7.82842 52.0374 7.73871 52.2219 7.73871L60.1412 8.07198H60.1797C60.4181 8.113 60.7078 8.29247 60.7693 8.46937C61.9255 11.3305 63.874 16.9297 65.7916 19.7575C65.9121 19.9703 66.0634 20.1242 66.2172 20.1242C66.4607 20.1242 66.6428 19.8806 66.6428 19.5473L66.7658 7.37721C66.7658 7.22338 66.8863 7.10547 67.0376 7.10547C68.2553 7.34902 69.9269 7.47207 71.5112 7.47207C72.4239 7.47207 73.1828 7.38234 74.0954 7.34901C74.2467 7.31825 74.3057 7.56179 74.3057 7.65408L73.4545 31.1457V31.1355Z" fill="white"/>
      <path d="M83.892 31.2242C83.892 31.4678 83.6792 31.6498 83.4638 31.6498H83.4356L77.9288 31.496C77.657 31.496 77.475 31.2857 77.4417 31.0422L77.0469 16.0981C77.0469 15.8546 77.2315 15.6725 77.475 15.6725L83.8355 15.7674C84.0791 15.7674 84.2893 15.9776 84.2893 16.2212L83.8945 31.2242H83.892ZM81.3693 14.3368C79.4516 14.3368 77.898 12.6935 77.898 10.6553C77.898 8.61968 79.4491 7.00195 81.3693 7.00195C83.2895 7.00195 84.8687 8.64788 84.8687 10.6553C84.8687 12.6653 83.3177 14.3368 81.3693 14.3368Z" fill="white"/>
      <path d="M121.117 69.6315C121.061 69.5836 121.003 69.5383 120.943 69.4956C115.018 65.4346 107.696 63.822 100.585 63.8964C91.0016 63.8708 83.8079 65.732 74.7554 69.3648C66.5183 72.2567 58.0786 78.9507 45.601 72.6541C39.9609 69.4494 41.0607 65.2782 42.6989 60.202C43.3732 58.1177 44.6576 54.9258 44.8499 52.6415C46.3907 38.8639 36.6281 36.6155 29.4907 41.7558C29.3113 41.9148 29.0344 41.8892 28.8908 41.702C27.068 38.9588 22.5431 39.0434 19.4795 39.951C19.259 40.0176 19.0078 39.7972 18.7719 39.5382C18.3592 39.0742 17.9054 38.6435 17.4285 38.2512L16.0544 37.1078C13.5035 34.985 9.52209 36.9667 9.87332 40.2689C9.87332 40.274 9.87332 40.2791 9.87332 40.2843C9.85024 40.3125 10.4014 61.0814 10.3886 61.1198C10.3886 61.4377 10.6629 61.7146 10.9834 61.7146L18.3745 61.9121C18.6924 61.9121 18.9283 61.6352 18.9283 61.3172L18.8899 50.129C18.8668 47.0064 19.4462 45.4887 21.0639 45.5451C25.0581 44.1658 23.4327 59.0304 23.3968 61.5916C23.3814 61.7608 23.4994 61.9479 23.6711 61.9479L31.2238 62.5017C31.552 62.5196 31.734 62.3556 31.775 62.1069C31.9339 61.0019 32.0955 58.233 32.0955 53.4081C32.1698 51.4596 31.4289 48.4908 32.9748 46.8372C33.3773 46.4065 33.908 46.1245 34.4797 45.9835C42.5246 43.9555 37.892 60.2764 37.6766 61.0455C35.7846 67.7522 37.7305 75.2332 44.9575 78.4046C58.2888 84.2499 73.512 76.8356 86.7484 73.6822C96.5161 71.1287 105.22 69.3136 116.672 76.4049C118.231 77.5176 119.902 77.697 121.084 77.6355C122.263 77.5739 123.314 77.0587 124.073 76.1972C124.073 76.1972 124.081 76.1895 124.086 76.1844C126.622 73.2617 123.299 71.4492 121.13 69.6315H121.117Z" fill="white"/>
      <path d="M65.8732 64.2705L48.3862 65.7292C48.0068 65.76 47.8145 65.4421 47.753 65.096C47.2812 61.9298 47.2812 57.6868 47.2812 54.4539C47.2812 50.4621 47.3453 44.9808 48.1042 41.1173C48.1709 40.7378 48.3913 40.4199 48.8041 40.4199L65.1169 40.7045C65.4374 40.7045 65.7168 40.9583 65.7168 41.3044C65.7168 42.2556 65.2733 44.5373 65.1451 45.6141C65.1143 45.9602 64.7657 46.3114 64.3863 46.3114L56.1209 46.7857C55.7415 46.7857 55.3902 47.1036 55.2954 47.4831C55.1698 48.1163 54.7903 49.8904 54.7903 50.4903C54.7903 50.8082 55.0416 50.9954 55.3287 50.9954C58.3693 50.9954 61.4739 50.5852 64.5144 50.5852C64.8605 50.5852 65.1451 50.9031 65.1451 51.2492L65.0195 54.8948C64.9862 55.2743 64.7016 55.6255 64.3222 55.6537L55.2287 56.6971C54.8493 56.7305 54.5981 57.2971 54.5981 57.6817C54.5981 58.1534 54.6903 58.9174 55.3287 58.884L65.6245 58.5379C65.9706 58.5379 66.2885 58.8558 66.3219 59.2019C66.3885 60.7248 66.5141 62.0554 66.5141 63.5731C66.5141 63.9192 66.227 64.2397 65.8809 64.2705H65.8732Z" fill="white"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M89.5003 54.0702C89.5003 54.0975 89.4986 54.124 89.4952 54.1497C88.844 57.7466 85.1677 62.3844 79.4481 62.3844C72.562 62.3844 67.4141 58.3901 67.4141 50.9885C67.4141 43.587 71.6108 38.1621 77.6637 38.1621C85.2241 38.1621 87.8314 44.0588 87.8314 50.5092C87.8314 51.691 87.2468 51.991 86.6367 52.014C86.6059 52.0123 86.5769 52.0166 86.5495 52.0269C86.3931 52.0705 85.0677 52.1551 75.7974 52.3602C75.5256 52.3653 75.3359 52.6268 75.4102 52.8857C75.9999 55.0213 77.5356 55.775 78.9687 55.775C80.4018 55.775 81.6221 55.0623 81.8605 54.1907C81.94 53.8369 82.2169 53.6395 82.7322 53.6395C86.8854 53.56 88.8261 53.4421 88.9056 53.4421C89.2978 53.4421 89.5003 53.6395 89.5003 53.9574V54.0753V54.0702ZM77.8586 45.5585C76.7639 45.5585 75.8871 46.1584 75.4897 47.5813C75.4154 47.8531 75.6307 48.1171 75.9102 48.1018C77.4894 48.0274 79.3455 47.9274 79.484 47.9274C79.6019 47.9274 79.6429 47.8916 79.6429 47.7326C79.6429 46.584 79.0917 45.5534 77.8637 45.5534L77.8586 45.5585Z" fill="white"/>
      <path d="M113.845 58.4883C113.845 58.6703 113.696 58.8216 113.512 58.8216L107.003 58.8805C106.79 58.8805 106.454 58.6985 106.272 58.4883C104.2 55.8707 101.283 50.7868 99.8807 48.1743C99.8217 48.0512 99.6371 47.841 99.3936 47.841C99.15 47.841 98.9398 48.0512 98.9398 48.4178L98.1809 59.0087C98.1527 59.1907 97.9989 59.3138 97.8169 59.3138L91.3051 58.9472C91.1231 58.9472 91 58.7985 91 58.6421C91.6691 52.7686 92.2178 42.7315 92.2793 35.3633C92.2793 35.1787 92.428 35.0915 92.6126 35.0915L100.532 35.4222C100.532 35.4222 100.557 35.4222 100.57 35.4222C100.809 35.4607 101.098 35.6376 101.16 35.8171C102.319 38.6782 104.267 44.2749 106.182 47.1052C106.303 47.3155 106.454 47.4718 106.608 47.4718C106.851 47.4718 107.033 47.2283 107.033 46.895L107.156 34.7249C107.156 34.5762 107.277 34.4531 107.428 34.4531C108.646 34.6967 110.317 34.8197 111.902 34.8197C112.815 34.8197 113.573 34.73 114.486 34.6967C114.637 34.6685 114.699 34.9069 114.699 35.0018L113.845 58.4934V58.4883Z" fill="white"/>
      <path d="M124.017 62.984C124.017 63.2276 123.804 63.4096 123.589 63.4096H123.561L118.054 63.2609C117.782 63.2609 117.6 63.0507 117.567 62.8071L117.172 47.863C117.172 47.6195 117.356 47.4374 117.6 47.4374L123.961 47.5272C124.204 47.5272 124.414 47.7374 124.414 47.9809L124.02 62.984H124.017ZM121.494 46.0966C119.577 46.0966 118.023 44.4532 118.023 42.4151C118.023 40.3769 119.574 38.7617 121.494 38.7617C123.414 38.7617 124.994 40.4051 124.994 42.4151C124.994 44.425 123.443 46.0966 121.494 46.0966Z" fill="white"/>
      <path d="M9.01135 5.26951C8.81908 4.64652 8.33453 4.16967 7.73975 3.89791C6.93475 3.52617 6.62968 1.76486 5.07607 0.575277C3.53016 -0.604047 0.981842 0.0240737 0.184531 2.62884C-0.784547 5.80276 2.18422 9.4484 6.25538 9.57402C8.79344 9.43814 9.59587 7.17181 9.00622 5.26951H9.01135Z" fill="white"/>
      <path d="M42.4528 5.26914C42.645 4.64614 43.127 4.16929 43.7218 3.89754C44.5268 3.52579 44.8319 1.76448 46.388 0.574899C47.9391 -0.609552 50.4823 0.0185635 51.277 2.62333C52.2487 5.79981 49.2773 9.44292 45.2062 9.56854C42.6681 9.43267 41.8682 7.1663 42.4579 5.264L42.4528 5.26914Z" fill="white"/>
      <path d="M26.4014 37.3514C24.2992 37.1079 21.5791 33.6417 22.6328 32.4188H22.6379C23.8685 30.9959 31.1725 31.6932 31.5827 33.4084C32.0005 35.1209 29.1241 37.6668 26.4014 37.3514Z" fill="white"/>
    </svg>
  );
}

function MinyMoeFooterWhite({ className = "" }: { className?: string }) {
  return (
    <svg
      width="92"
      height="80"
      viewBox="0 0 92 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Miny Moe White"
    >
      <g clipPath="url(#clip0_1548_6278)">
        <path d="M31.376 13.263C31.376 19.3732 29.9335 25.3935 29.9335 31.46L29.9795 32.3204L25.9233 32.5465C25.8772 32.1843 25.8772 31.8684 25.8772 31.5063C25.8772 25.3961 27.3197 19.4194 27.3197 13.3093C27.3197 12.0867 27.2302 7.24274 25.4706 7.24274C21.8645 7.24274 18.2583 22.6787 17.5831 25.8918L13.5703 25.3036C13.9309 21.094 14.4706 16.8845 14.4706 12.6749C14.4706 11.3162 14.289 4.4355 12.4425 4.4355C8.02557 6.69824 5.27622 27.6588 4.41944 32.8187L0.40665 32.2305C1.03836 27.0244 1.30691 21.7747 1.30691 16.4786C1.30691 13.1731 1.26087 4.66408 0 1.90307L3.65473 0.179688C4.73657 2.48866 5.05115 6.56212 5.1867 9.14334C6.26854 6.06642 8.4757 0.362043 12.4425 0.362043C16.9949 0.362043 18.1228 5.8404 18.3913 9.46182C19.7442 6.65458 21.9974 3.16929 25.468 3.16929C30.6957 3.16929 31.3734 9.27947 31.3734 13.263H31.376Z" fill="white"/>
        <path d="M37.6809 0C39.2589 0 40.6119 1.31244 40.6119 2.94337C40.6119 4.57429 39.2589 5.88673 37.6809 5.88673C36.1029 5.88673 34.75 4.57429 34.75 2.94337C34.75 1.31244 36.0569 0 37.6809 0ZM35.5173 10.0501H39.7986V32.6827H35.5173V10.0501Z" fill="white"/>
        <path d="M62.6568 20.596C62.6568 24.6695 61.8896 28.6993 61.7106 32.7727L57.7898 32.5904C57.9714 28.5606 58.7361 24.5334 58.7361 20.4599C58.7361 18.6492 58.6466 13.6254 56.0328 13.6254C54.1837 13.6254 51.9305 18.6055 51.2988 20.144C49.5418 24.3536 48.5034 28.7892 47.3781 33.1811L43.5469 32.4568C44.043 28.3834 44.3576 24.2637 44.3576 20.144C44.3576 17.0645 44.2221 13.9876 43.5904 10.9543L47.3781 10.1402C47.9177 12.4954 48.1453 14.9379 48.2349 17.3368C49.6313 14.2136 52.1121 9.68555 56.0328 9.68555C61.7566 9.68555 62.6594 16.1579 62.6594 20.596H62.6568Z" fill="white"/>
        <path d="M89.1645 7.51509C89.1645 11.0004 88.7579 14.4857 88.0827 17.8811C89.5712 18.4256 90.9216 19.2398 92.0034 20.3698L89.0725 23.2208C88.5763 22.6788 87.9446 22.2242 87.2694 21.9083C86.1415 26.7523 83.7528 33.4969 77.8039 33.4969C74.6939 33.4969 72.6198 31.0518 72.6198 28.0185C72.6198 21.952 78.3436 17.5164 84.0699 17.2904C84.6556 14.3932 85.0162 11.4499 85.1057 8.46282C82.2208 13.0808 76.6326 21.0479 70.5916 21.0479C67.0315 21.0479 65.0469 18.5591 65.0469 15.0738C65.0469 10.6382 68.3384 3.44163 71.0418 0L74.2412 2.53499C72.0776 5.25234 69.0571 11.5423 69.0571 14.9839C69.0571 16.1603 69.2822 16.9744 70.6351 16.9744C75.7297 16.9744 82.7144 4.79774 84.9241 0.631822L88.7093 1.30988C89.0239 3.3466 89.1594 5.42956 89.1594 7.51252L89.1645 7.51509ZM83.1696 21.5025C80.0136 22.0008 76.6325 24.5358 76.6325 27.9748C76.6325 28.7453 76.9471 29.4696 77.8039 29.4696C81.0494 29.4696 82.5814 23.9913 83.1671 21.5025H83.1696Z" fill="white"/>
        <path d="M0.179688 36.1602H5.20526L17.2845 63.3388L29.3178 36.1602H34.3434V68.568H29.7321V46.0202L19.7296 68.568H14.7961L4.7935 46.0202V68.568H0.179688V36.1602Z" fill="white"/>
        <path d="M39.4922 48.7767C39.4922 40.8738 44.0523 35.7422 51.1674 35.7422C58.2825 35.7422 62.8426 40.879 62.8426 48.7767C62.8426 56.6745 58.2313 61.8626 51.1674 61.8626C44.1034 61.8626 39.4922 56.7259 39.4922 48.7767ZM62.3234 68.5687H40.0216V64.4002H62.3234V68.5687ZM44.5075 48.7767C44.5075 52.0001 45.3592 57.332 51.1751 57.332C56.9909 57.332 57.8426 51.9975 57.8426 48.7767C57.8426 45.556 56.9398 40.2702 51.1751 40.2702C45.4103 40.2702 44.5075 45.6048 44.5075 48.7767Z" fill="white"/>
        <path d="M90.5574 58.882C90.606 59.3109 90.6521 59.7861 90.6521 60.2638C90.6521 67.088 83.9999 70.0442 78.0613 70.0442C72.693 70.0442 65.8516 67.4193 65.8516 61.0728C65.8516 56.6809 68.3222 53.5346 72.1713 51.7213C69.6546 50.4346 67.7518 48.3336 67.7518 45.4237C67.7518 38.9822 74.404 35.7383 80.0562 35.7383C84.8541 35.7383 90.1764 38.1243 90.1764 43.6592C90.1764 45.5675 89.5114 47.3833 88.6086 49.0502L84.8541 46.9493C85.4245 45.9476 85.9002 44.8483 85.9002 43.6566C85.9002 40.7466 82.2889 40.0301 80.0101 40.0301C76.872 40.0301 72.028 41.5582 72.028 45.4211C72.028 48.6187 79.5344 49.3815 81.8618 49.718L81.5753 53.9635C77.2019 54.0586 70.1252 55.4403 70.1252 61.0728C70.1252 64.6506 75.3043 65.7961 78.1073 65.7961C81.4347 65.7961 86.3733 64.4143 86.3733 60.2612C86.3733 59.9735 86.3733 59.6885 86.3247 59.4008L90.5523 58.8768L90.5574 58.882Z" fill="white"/>
      </g>
      <defs>
        <clipPath id="clip0_1548_6278">
          <rect width="92" height="80" fill="white"/>
        </clipPath>
      </defs>
    </svg>
  );
}

function input(error: string | undefined) {
  return `w-full rounded-2xl border border-[#C4B8AC] bg-[#F0EEEB] px-5 py-4 text-[18px] text-[#7D6A5E] placeholder:text-[#A09286] outline-none transition-all focus:ring-2 ${
    error
      ? "border-red-300 bg-red-50 focus:ring-red-200"
      : "focus:ring-[#E0D2C4] focus:border-[#B7A89B]"
  }`;
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[18px] font-bold text-[#6D5A4D]">{label}</label>
      {children}
      {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
    </div>
  );
}