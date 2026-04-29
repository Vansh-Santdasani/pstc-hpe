"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Check, Calendar, Clock, MapPin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

/* ============================================================
   REGISTRATION FORM
   No backend — saves to localStorage. For an internal HPE
   audience this is fine; the actual signup link can be swapped
   to a Microsoft Forms / SharePoint URL later by editing
   FORMS_FALLBACK_URL below.
   ============================================================ */

// If/when you have a real form (MS Forms, Google Forms, etc.),
// drop the URL here and the component will redirect to it instead.
const FORMS_FALLBACK_URL: string | null = null;

const STORAGE_KEY = "pstc.registrations.v1";

interface Registration {
  name: string;
  email: string;
  team: string;
  experience: string;
  ts: number;
}

export function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [team, setTeam] = useState("");
  const [experience, setExperience] = useState("intermediate");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (FORMS_FALLBACK_URL) {
      window.open(FORMS_FALLBACK_URL, "_blank");
      setSubmitted(true);
      return;
    }

    const reg: Registration = { name, email, team, experience, ts: Date.now() };
    try {
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      existing.push(reg);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    } catch {
      /* ignore quota / disabled */
    }
    setSubmitted(true);
  };

  return (
    <section className="relative py-24 md:py-32 border-t border-obsidian-line/60 overflow-hidden">
      {/* Decorative backdrop */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 60% at 30% 50%, rgba(1,169,130,0.10), transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-12 gap-8 mb-12"
        >
          <div className="md:col-span-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-hpe">
              [05] Register
            </span>
          </div>
          <div className="md:col-span-10">
            <h2 className="font-display text-3xl md:text-5xl font-semibold text-fg leading-[1.05]">
              Save your seat for{" "}
              <span className="text-hpe italic">30 April</span>.
            </h2>
            <p className="mt-4 text-fg-muted max-w-2xl leading-relaxed">
              60 minutes. Hands-on. All experience levels. You&apos;ll write
              real post-quantum encryption code, build attack chains in
              CyberBlocks, and walk away with the materials.
            </p>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-12 gap-6">
          {/* Left: event card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="md:col-span-5 bg-obsidian-2 border border-hpe/30 rounded-lg p-6 md:p-8 self-start"
          >
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-hpe-bright mb-4">
              ◆ Next Session
            </div>
            <h3 className="font-display text-2xl font-semibold text-fg leading-tight">
              Quantum Securities
            </h3>
            <p className="mt-3 font-mono text-xs uppercase tracking-wider text-fg-muted">
              HPE Gen12 · CyberBlocks · MITRE ATT&CK
            </p>

            <ul className="mt-6 space-y-3">
              <Detail icon={Calendar} label="Date" value="30 April 2026 (Thursday)" />
              <Detail icon={Clock} label="Time" value="60 minutes · 17:00 - 18:00 hours" />
              <Detail icon={MapPin} label="Venue" value="HPE Pune · Sindhudurg Training Room, 5th floor" />
              <Detail
                icon={Sparkles}
                label="Format"
                value="Hands-on · all levels"
              />
            </ul>

            <div className="mt-6 pt-6 border-t border-obsidian-line/60">
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-fg-muted mb-2">
                You&apos;ll walk away with
              </div>
              <ul className="text-sm text-fg space-y-1.5">
                <li>· Live PQC code you ran yourself</li>
                <li>· Attack chains you built in CyberBlocks</li>
                <li>· MITRE ATT&CK quick-ref + Gen12 security map</li>
                <li>· Open-source project links + repo</li>
              </ul>
            </div>
          </motion.div>

          {/* Right: form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="md:col-span-7"
          >
            {submitted ? (
              <SubmittedState
                name={name}
                onReset={() => {
                  setSubmitted(false);
                  setName("");
                  setEmail("");
                  setTeam("");
                }}
              />
            ) : (
              <form
                onSubmit={handleSubmit}
                className="bg-obsidian-2 border border-obsidian-line rounded-lg p-6 md:p-8"
              >
                <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-fg-muted mb-6">
                  Fill once — we&apos;ll add you to the invite list
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <Field label="Full Name" required>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Priya Sharma"
                      className="w-full h-11 px-3 bg-obsidian border border-obsidian-line rounded-md focus:outline-none focus:border-hpe transition text-fg"
                    />
                  </Field>
                  <Field label="HPE Email" required>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="priya.sharma@hpe.com"
                      className="w-full h-11 px-3 bg-obsidian border border-obsidian-line rounded-md focus:outline-none focus:border-hpe transition text-fg"
                    />
                  </Field>
                </div>

                <Field label="Team / Function" required>
                  <input
                    type="text"
                    required
                    value={team}
                    onChange={(e) => setTeam(e.target.value)}
                    placeholder="Storage · Security · ProServ · Sales · ..."
                    className="w-full h-11 px-3 bg-obsidian border border-obsidian-line rounded-md focus:outline-none focus:border-hpe transition text-fg"
                  />
                </Field>

                <Field label="Experience Level">
                  <div className="grid grid-cols-3 gap-2">
                    {(["beginner", "intermediate", "advanced"] as const).map(
                      (lvl) => (
                        <label
                          key={lvl}
                          className={`relative flex items-center justify-center h-11 rounded-md border cursor-pointer transition ${
                            experience === lvl
                              ? "border-hpe bg-hpe/10 text-hpe-bright"
                              : "border-obsidian-line text-fg-muted hover:border-fg-muted"
                          }`}
                        >
                          <input
                            type="radio"
                            name="experience"
                            value={lvl}
                            checked={experience === lvl}
                            onChange={(e) => setExperience(e.target.value)}
                            className="sr-only"
                          />
                          <span className="font-mono text-xs uppercase tracking-wider">
                            {lvl}
                          </span>
                        </label>
                      )
                    )}
                  </div>
                </Field>

                <Button type="submit" size="lg" className="w-full mt-6">
                  Confirm Registration →
                </Button>

                <p className="mt-4 text-center font-mono text-[10px] text-fg-dim uppercase tracking-widest">
                  Internal · HPE confidential · No external sharing
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="grid place-items-center w-8 h-8 rounded border border-hpe/30 bg-hpe/5 text-hpe shrink-0">
        <Icon size={14} />
      </span>
      <div>
        <div className="font-mono text-[10px] uppercase tracking-wider text-fg-muted">
          {label}
        </div>
        <div className="text-sm text-fg">{value}</div>
      </div>
    </li>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block mb-4 last:mb-0">
      <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-fg-muted mb-2">
        {label}
        {required && <span className="text-hpe ml-1">*</span>}
      </span>
      {children}
    </label>
  );
}

function SubmittedState({
  name,
  onReset,
}: {
  name: string;
  onReset: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-obsidian-2 border border-hpe/40 rounded-lg p-8 md:p-12 text-center glow-hpe"
    >
      <div className="mx-auto w-16 h-16 rounded-full border-2 border-hpe bg-hpe/15 grid place-items-center mb-6">
        <Check size={28} className="text-hpe" strokeWidth={2.5} />
      </div>
      <h3 className="font-display text-3xl font-bold text-fg mb-2">
        You&apos;re in, {name.split(" ")[0] || "engineer"}.
      </h3>
      <p className="text-fg-muted leading-relaxed max-w-md mx-auto">
        We&apos;ve saved your details locally. The PSTC organising team will
        reach out with the calendar invite and venue confirmation closer to{" "}
        <span className="text-fg">30 April</span>.
      </p>
      <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-fg-dim">
        Want to register someone else?{" "}
        <button
          onClick={onReset}
          className="text-hpe hover:text-hpe-bright transition underline-offset-4 hover:underline"
        >
          Start again
        </button>
      </p>
    </motion.div>
  );
}
