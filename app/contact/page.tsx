"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Mail,
  X,
  MapPin,
  Clock,
  CheckCircle2,
  Facebook,
  Instagram,
  Send,
  Shield,
  Star,
  Zap,
  Calendar,
  AlertCircle,
} from "lucide-react";

function useReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function Reveal({
  children,
  delay = 0,
  dir = "up",
}: {
  children: React.ReactNode;
  delay?: number;
  dir?: "up" | "left" | "right";
}) {
  const { ref, visible } = useReveal();
  const t =
    dir === "left"
      ? "translateX(-50px)"
      : dir === "right"
        ? "translateX(50px)"
        : "translateY(45px)";
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : t,
        transition: `opacity .7s ease ${delay}ms, transform .7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${3 + (i % 4) * 2}px`,
            height: `${3 + (i % 4) * 2}px`,
            left: `${(i * 10.3) % 100}%`,
            top: `${(i * 13.7) % 100}%`,
            background:
              i % 2 === 0 ? "rgba(231,76,60,0.4)" : "rgba(255,255,255,0.15)",
            animation: `float-p${i % 3} ${4 + (i % 3) * 2}s ease-in-out infinite`,
            animationDelay: `${i * 0.4}s`,
          }}
        />
      ))}
    </div>
  );
}

type FormState = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};
const EMPTY: FormState = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

// ── Validation helpers ──────────────────────────────────────────────────────
function validateEmail(email: string): string {
  if (!email) return "";
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email)
    ? ""
    : "Please enter a valid email address (e.g. user@example.com).";
}

function validatePhone(phone: string): string {
  if (!phone) return ""; // phone is optional — only validate when filled
  if (!/^\d+$/.test(phone))
    return "Phone number must contain digits only (no letters or symbols).";
  if (phone.length !== 11) return "Phone number must be exactly 11 digits.";
  return "";
}

function validateRequired(value: string, label: string): string {
  return value.trim() ? "" : `${label} is required.`;
}
// ────────────────────────────────────────────────────────────────────────────

export default function ContactPage() {
  const [formData, setFormData] = useState<FormState>(EMPTY);
  const [fieldErrors, setFieldErrors] = useState<Partial<FormState>>({});
  const [touched, setTouched] = useState<
    Partial<Record<keyof FormState, boolean>>
  >({});
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [heroIn, setHeroIn] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [policyModal, setPolicyModal] = useState<"privacy" | "notice" | null>(
    null,
  );

  useEffect(() => {
    setTimeout(() => setHeroIn(true), 80);
  }, []);

  // Live-validate a single field and update fieldErrors
  function runFieldValidation(name: keyof FormState, value: string): string {
    if (name === "name") return validateRequired(value, "Name");
    if (name === "email") return validateEmail(value);
    if (name === "phone") return validatePhone(value);
    if (name === "subject") return validateRequired(value, "Subject");
    if (name === "message") return validateRequired(value, "Message");
    return "";
  }

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    // For phone: strip any non-digit characters as the user types
    const sanitized = name === "phone" ? value.replace(/\D/g, "") : value;

    setFormData((prev) => ({ ...prev, [name]: sanitized }));

    // Only show live error after the field has been touched
    if (touched[name as keyof FormState]) {
      const err = runFieldValidation(name as keyof FormState, sanitized);
      setFieldErrors((prev) => ({ ...prev, [name]: err }));
    }
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const err = runFieldValidation(name as keyof FormState, value);
    setFieldErrors((prev) => ({ ...prev, [name]: err }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all required fields and format-specific fields.
    const nameErr = validateRequired(formData.name, "Name");
    const emailErr = validateEmail(formData.email);
    const phoneErr = validatePhone(formData.phone);
    const subjectErr = validateRequired(formData.subject, "Subject");
    const messageErr = validateRequired(formData.message, "Message");

    setTouched({
      name: true,
      email: true,
      phone: true,
      subject: true,
      message: true,
    });
    setFieldErrors({
      name: nameErr,
      email: emailErr,
      phone: phoneErr,
      subject: subjectErr,
      message: messageErr,
    });

    if (nameErr || emailErr || phoneErr || subjectErr || messageErr) return;

    if (!agreedToTerms) {
      setErrorMsg(
        "Please agree to the Privacy Policy and Privacy Notice.",
      );
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          agreed_to_terms: agreedToTerms,
          marketing_consent: marketingConsent,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.error ?? "Something went wrong. Please try again.",
        );
      }

      setStatus("success");
      setFormData(EMPTY);
      setFieldErrors({});
      setTouched({});
      setAgreedToTerms(false);
      setMarketingConsent(false);
      setTimeout(() => setStatus("idle"), 6000);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Unexpected error. Please try again.",
      );
      setStatus("error");
    }
  };

  const trustBadges = [
    { icon: <Shield className="w-3 h-3" />, text: "PRC Licensed" },
    { icon: <Star className="w-3 h-3" />, text: "4.9★ Rated" },
    { icon: <CheckCircle2 className="w-3 h-3" />, text: "HLURB Accredited" },
  ];

  const quickInfo = [
    { icon: <Zap className="w-3.5 h-3.5" />, text: "Fast Response" },
  ];

  // Reusable inline error component
  const FieldError = ({ msg }: { msg?: string }) =>
    msg ? (
      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-300 font-medium">
        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
        {msg}
      </p>
    ) : null;

  // Helper: border colour based on validation state
  const fieldBorder = (name: keyof FormState) => {
    if (!touched[name]) return "border-red-400/40";
    return fieldErrors[name]
      ? "border-red-400 ring-1 ring-red-400/70"
      : "border-green-400/60";
  };

  const policyContent = policyModal === "privacy"
    ? {
      title: "ALFIMA Realty Inc. Privacy Policy",
      body: [
        "ALFIMA Realty Inc. respects your privacy and is committed to protecting the personal information entrusted to us.\n\nThis Privacy Policy explains how ALFIMA Realty Inc. collects, uses, stores, discloses, and protects personal information when you interact with ALFIMA Realty Inc., including through our website, social media channels, property inquiries, roadshows, booths, in-person interactions, and real estate services.\n\nALFIMA Realty Inc. processes personal information in accordance with Republic Act No. 10173, or the Data Privacy Act of 2012, its Implementing Rules and Regulations, and applicable issuances of the National Privacy Commission.",
        "1. Personal Information We Collect\n\nDepending on how you interact with ALFIMA Realty Inc., we may collect the following information:\n\n- Full name\n- Email address\n- Mobile number\n- Address\n- Location preferences\n- Unit size\n- Property or inquiry details voluntarily provided\n- Other information reasonably necessary to respond to or process a property inquiry or transaction\n\nWebsite features such as Contact, Send an Inquiry, Schedule a Tour, Connect to an Agent, and chatbot functions may collect information that you voluntarily provide.\n\nALFIMA Realty Inc. may also collect certain technical and website activity information through cookies, analytics tools, browser storage, and similar technologies, as further described in this Privacy Policy.",
        "2. How We Collect Personal Information\n\nALFIMA Realty Inc. may collect personal information through:\n\n- Website and online inquiry forms\n- Website chatbot\n- Social media platforms and messaging channels\n- Property inquiries and requests for viewings\n- Roadshows, booths, and property-related events\n- In-person inquiries and interactions with prospective clients\n- Phone calls, email, SMS, Messenger, Viber, WhatsApp, and similar communication channels\n- Information manually entered into the authorized customer relationship management system\n- Other interactions initiated by you in connection with the real estate services of ALFIMA Realty Inc.",
        "3. Why We Process Your Personal Information\n\nALFIMA Realty Inc. may process personal information for legitimate and appropriate business purposes, including to:\n\n- Receive, evaluate, and respond to property inquiries\n- Understand your property requirements and preferences\n- Recommend properties that may match your stated requirements\n- Connect you with an authorized salesperson or representative of ALFIMA Realty Inc.\n- Schedule property viewings, tours, meetings, or consultations\n- Communicate with you regarding your inquiry\n- Facilitate and process property transactions\n- Coordinate with relevant property developers when necessary for a transaction\n- Maintain and manage client and inquiry records\n- Improve the website, services, and client experience of ALFIMA Realty Inc.\n- Measure website activity and the effectiveness of online marketing\n- Maintain the security and proper operation of systems\n- Comply with applicable legal and regulatory requirements\n- Establish, exercise, or defend legal claims when necessary\n\nWhere consent is required by applicable law, ALFIMA Realty Inc. will request your consent before carrying out the relevant processing activity.",
        "4. Marketing Communications\n\nProviding personal information for a property inquiry does not automatically mean that you agree to receive unrelated promotional or marketing communications from ALFIMA Realty Inc.\n\nWhere ALFIMA Realty Inc. offers optional marketing communications, separate consent may be requested.\n\nYou may withdraw your marketing consent or request that promotional communications stop by reaching ALFIMA Realty Inc. through the information provided in this Privacy Policy.\n\nWithdrawal of marketing consent will not affect the processing of personal information that remains necessary for an existing inquiry, transaction, legal obligation, or other lawful purpose.",
        "5. Access to Personal Information Within ALFIMA Realty Inc.\n\nAccess to personal information is limited to authorized personnel of ALFIMA Realty Inc. who require the information to perform legitimate business responsibilities.\n\nDepending on the inquiry or transaction, authorized personnel may include those performing functions relating to:\n\n- Management\n- Administration\n- Marketing and inquiry management\n- Sales and client servicing\n\nFor property inquiries, authorized personnel may initially receive, review, and qualify an inquiry before relevant information is provided to the appropriate salesperson or sales team for further assistance.\n\nAccess to personal information is provided according to an individual's role and responsibilities.",
        "6. Disclosure to Property Developers and Service Providers\n\nALFIMA Realty Inc. does not sell your personal information.\n\nRelevant personal information may be provided to the applicable property developer when necessary to facilitate, process, or complete your property inquiry or transaction.\n\nALFIMA Realty Inc. may also use authorized technology, customer relationship management, hosting, backup, website, and infrastructure service providers that process or store information on behalf of ALFIMA Realty Inc. as necessary to provide their services.\n\nThe customer relationship management infrastructure used by ALFIMA Realty Inc. is hosted through iGotSolutions. Based on the services provided to ALFIMA Realty Inc., customer relationship management information is backed up and encrypted.\n\nPersonal information under the control of ALFIMA Realty Inc. is required to be handled with appropriate confidentiality and security safeguards.\n\nALFIMA Realty Inc. may also disclose personal information when required or permitted by applicable law, regulation, legal process, or a lawful request from a competent authority.",
        "7. Website Analytics, Cookies, and Tracking Technologies\n\nThe website of ALFIMA Realty Inc. may use cookies, browser storage, analytics tools, and similar technologies to operate website features, understand website usage, improve the user experience, and measure the performance of online activities.\n\nGoogle Analytics\n\nALFIMA Realty Inc. uses Google Analytics to better understand how visitors interact with the website.\n\nInformation generated through analytics may include:\n\n- Website visits\n- Page views\n- Pages visited\n- Referring websites or sources\n- General geographic information, such as country\n- Device type\n- Browser information\n- Scrolling and other website interactions\n- Form interactions\n\nThis information helps ALFIMA Realty Inc. understand website performance and improve its website and services.\n\nMeta Pixel\n\nThe website of ALFIMA Realty Inc. uses the Meta Pixel, which may collect information about visitors' activity on the website for measurement, analytics, and advertising-related purposes.\n\nThe Meta Pixel may operate across different areas of the website. Specific website actions, such as submitting an inquiry, requesting connection with an agent, or scheduling a tour, may be measured when the corresponding events are configured and activated.\n\nInformation collected through Meta technologies may also be processed by Meta according to its applicable privacy practices.\n\nChatbot and Browser Storage\n\nThe website chatbot may temporarily store basic information in your browser or use similar technologies to maintain the conversation and provide chatbot functionality during your interaction with the website.\n\nWhere appropriate, ALFIMA Realty Inc. may provide cookie or tracking controls for technologies used on the website.",
        "8. Storage and Security\n\nPersonal information may be stored within authorized website systems, customer relationship management systems, and other systems used by ALFIMA Realty Inc. for legitimate business operations.\n\nALFIMA Realty Inc. implements reasonable and appropriate organizational, physical, and technical safeguards designed to protect personal information against unauthorized access, use, disclosure, alteration, loss, or destruction.\n\nThese measures may include:\n\n- Restricting access to authorized personnel\n- Account-based access controls\n- Appropriate confidentiality practices\n- Encryption and system security measures where applicable\n- Secure storage and backup practices\n- Reasonable measures for protecting systems used to process personal information\n\nWhile ALFIMA Realty Inc. takes reasonable measures to protect personal information, no electronic storage, transmission, or information system can be guaranteed to be completely secure.",
        "9. Retention of Personal Information\n\nFor general property inquiries or leads that do not proceed to an active transaction, ALFIMA Realty Inc. retains personal information for up to six (6) months from the last meaningful interaction with the prospective client.\n\nAfter this period, the information will be securely deleted, disposed of, anonymized, or otherwise securely handled, unless continued retention is required by law or is necessary for the establishment, exercise, or defense of legal claims.\n\nIf an inquiry proceeds to an active property transaction or client relationship, relevant information may be retained for a longer period as necessary to:\n\n- Facilitate or complete the transaction\n- Maintain appropriate business and transaction records\n- Fulfill contractual obligations\n- Comply with legal, regulatory, accounting, or reporting requirements\n- Establish, exercise, or defend legal claims\n\nWhen personal information is no longer reasonably necessary for the purpose for which it was collected, ALFIMA Realty Inc. will dispose of, delete, anonymize, or otherwise securely handle the information in accordance with applicable requirements and company procedures.",
        "10. Your Rights as a Data Subject\n\nUnder the Data Privacy Act of 2012 and applicable regulations, you may exercise your rights as a data subject, as applicable to your circumstances, including:\n\n- Right to be informed about the collection and processing of your personal information\n- Right to access personal information concerning you that is being processed\n- Right to object to certain processing of your personal information\n- Right to rectify inaccurate or incomplete personal information\n- Right to erasure or blocking under circumstances provided by law\n- Right to data portability, where applicable\n- Right to damages where provided by law\n- Right to file a complaint with the National Privacy Commission\n\nYou may reach ALFIMA Realty Inc. using the information below if you wish to exercise your rights or raise a concern regarding the processing of your personal information.\n\nALFIMA Realty Inc. may need to reasonably verify your identity before acting on a request to protect your information from unauthorized access or disclosure.",
        "11. Third-Party Platforms and Services\n\nYou may interact with ALFIMA Realty Inc. through third-party platforms such as Facebook, Instagram, Messenger, WhatsApp, Viber, or other external services.\n\nThese third-party platforms may separately collect and process information according to their respective privacy policies and practices. ALFIMA Realty Inc. does not control the independent processing activities of these third-party platforms.\n\nWhen you leave the website of ALFIMA Realty Inc. or use a third-party service, you are encouraged to review the applicable privacy information provided by that service.",
        "12. Children's Personal Information\n\nThe real estate services of ALFIMA Realty Inc. are generally intended for adults who are legally capable of entering into property-related transactions.\n\nALFIMA Realty Inc. does not intentionally use its website to solicit personal information from children for independent property transactions.\n\nIf personal information involving a minor must be processed in connection with a legitimate transaction, ALFIMA Realty Inc. will handle such information in accordance with applicable law and appropriate safeguards.",
        "13. Changes to This Privacy Policy\n\nALFIMA Realty Inc. may update this Privacy Policy from time to time to reflect changes in business operations, website technologies, services, privacy practices, or applicable legal and regulatory requirements.\n\nWhen material updates are made, the revised version will be posted on the website and the Last Updated date will be changed accordingly.\n\nVisitors and clients are encouraged to review this Privacy Policy periodically.",
        "14. Privacy Questions, Requests, and Concerns\n\nFor questions, requests, complaints, or concerns regarding your personal information or this Privacy Policy, you may reach:\n\nALFIMA Realty Inc.\nIBP Building\nJulia Vargas Avenue and Jade Drive\nOrtigas Center, Pasig City, Philippines\n\nEmail: sales@alfimarealtyinc.com\nMobile Number: 0917 174 2419\n\nThe information above currently serves as the official channel of ALFIMA Realty Inc. for privacy and personal data concerns.",
      ],
    }
    : policyModal === "notice"
      ? {
        title: "Website Form Privacy Notice",
        body: [
          "ALFIMA Realty Inc. will use the personal information you provide to respond to your inquiry, understand your property requirements, connect you with the appropriate representative of ALFIMA Realty Inc., schedule requested consultations or viewings, and facilitate property-related services.\n\nWhen necessary to facilitate, process, or complete a property transaction, relevant information may be provided to the applicable property developer.\n\nFor more information about how ALFIMA Realty Inc. collects, uses, stores, shares, and protects personal information, please read the Privacy Policy of ALFIMA Realty Inc.",
        ],
      }
      : null;

  return (
    <div
      className="w-full min-h-screen"
      style={{
        background:
          "linear-gradient(145deg,#3d1818 0%,#4a1f1f 50%,#2d1212 100%)",
      }}
    >
      <style>{`
        @keyframes float-p0{0%,100%{transform:translateY(0)}50%{transform:translateY(-18px)}}
        @keyframes float-p1{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
        @keyframes float-p2{0%,100%{transform:translateY(0)}50%{transform:translateY(-22px)}}
        @keyframes shimmer{0%{left:-100%}100%{left:200%}}
      `}</style>

      {/* ── HERO ── */}
      <section className="relative pt-32 pb-28 bg-gradient-to-tr from-red-800/80 from-[10%] via-[#3d0012]/90 via-[70%] to-red-800/60 to-[100%] overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px,rgba(255,255,255,0.5) 1px,transparent 0)",
            backgroundSize: "30px 30px",
          }}
        />
        <div
          className="absolute top-0 right-0 w-[600px] h-[600px] opacity-30"
          style={{
            background: "radial-gradient(circle,#e74c3c 0%,transparent 65%)",
          }}
        />
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "-100%",
              width: "50%",
              height: "100%",
              background:
                "linear-gradient(90deg,transparent,rgba(255,255,255,0.05),transparent)",
              animation: "shimmer 5s ease-in-out infinite",
            }}
          />
        </div>
        <FloatingParticles />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* LEFT */}
            <div>
              <div
                style={{
                  opacity: heroIn ? 1 : 0,
                  transform: heroIn ? "none" : "translateY(35px)",
                  transition: "opacity .8s ease 0ms, transform .8s ease 0ms",
                }}
              >
                <div className="inline-flex items-center gap-2 mb-5">
                  <div
                    className="h-px w-10"
                    style={{
                      background: "linear-gradient(90deg,#e8a8a0,#d4a5a0)",
                    }}
                  />
                  <span className="text-red-200 text-xs font-black tracking-[0.2em] uppercase">
                    We&apos;d Love to Hear From You
                  </span>
                </div>
              </div>

              <div
                style={{
                  opacity: heroIn ? 1 : 0,
                  transform: heroIn ? "none" : "translateY(35px)",
                  transition:
                    "opacity .8s ease 150ms, transform .8s ease 150ms",
                }}
              >
                <h1 className="text-5xl sm:text-6xl font-black text-white leading-tight mb-5 drop-shadow-xl">
                  Get in
                  <br />
                  <span className="text-red-300">Touch</span>{" "}
                  <span className="text-white/50">With Us</span>
                </h1>
              </div>

              <div
                style={{
                  opacity: heroIn ? 1 : 0,
                  transform: heroIn ? "none" : "translateY(35px)",
                  transition:
                    "opacity .8s ease 250ms, transform .8s ease 250ms",
                }}
              >
                <p className="text-white/80 text-lg leading-relaxed max-w-lg mb-5">
                  Have a question, want to schedule a viewing, or just want to
                  say hello? Our team at Alfima Realty Inc. is ready to help.
                </p>
              </div>

              <div
                style={{
                  opacity: heroIn ? 1 : 0,
                  transform: heroIn ? "none" : "translateY(35px)",
                  transition:
                    "opacity .8s ease 330ms, transform .8s ease 330ms",
                }}
              >
                <div className="flex flex-wrap gap-2 mb-5">
                  {trustBadges.map(({ icon, text }) => (
                    <span
                      key={text}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white/90 border border-white/20 hover:border-white/40 transition-all cursor-default"
                      style={{
                        background: "rgba(255,255,255,0.1)",
                        backdropFilter: "blur(8px)",
                      }}
                    >
                      <span className="text-red-300">{icon}</span>
                      {text}
                    </span>
                  ))}
                </div>
              </div>

              <div
                style={{
                  opacity: heroIn ? 1 : 0,
                  transform: heroIn ? "none" : "translateY(35px)",
                  transition:
                    "opacity .8s ease 410ms, transform .8s ease 410ms",
                }}
              >
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-7">
                  {quickInfo.map(({ icon, text }, i) => (
                    <span
                      key={text}
                      className="inline-flex items-center gap-1.5 text-white/55 text-sm"
                    >
                      <span className="text-red-300/80">{icon}</span>
                      {text}
                      {i < quickInfo.length - 1 && (
                        <span className="ml-4 text-white/20 hidden sm:inline">
                          ·
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>

              <div
                style={{
                  opacity: heroIn ? 1 : 0,
                  transform: heroIn ? "none" : "translateY(35px)",
                  transition:
                    "opacity .8s ease 490ms, transform .8s ease 490ms",
                }}
              >
                <div className="flex gap-4 flex-wrap">
                  <a href="#contact-form">
                    <button className="inline-flex items-center gap-2 bg-white text-red-800 font-black px-7 py-3.5 rounded-full hover:bg-red-50 shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-200">
                      <Send className="w-4 h-4" /> Send a Message
                    </button>
                  </a>
                </div>
              </div>
            </div>

            {/* RIGHT — image */}
            <div className="flex items-center justify-center">
              <Reveal dir="right" delay={200}>
                <img
                  src="/contact/get-in-touch.png"
                  alt="Alfima Realty Contact Stats"
                  className="w-full max-w-md rounded-3xl shadow-2xl hover:scale-105 transition-transform duration-300"
                />
              </Reveal>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
          <svg
            viewBox="0 0 1440 48"
            preserveAspectRatio="none"
            className="w-full h-12"
            fill="#ffffff"
          >
            <path d="M0,48 C480,0 960,48 1440,16 L1440,48 Z" />
          </svg>
        </div>
      </section>

      {/* ── CONTACT SECTION ── */}
      <section
        id="contact-form"
        className="py-20 bg-gradient-to-b from-red-800/40 from-[20%] via-[#8b1a1a]/80 via-[60%] to-red-500/70 to-[100%] backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar */}
            <Reveal dir="left">
              <div className="space-y-4">
                <div
                  className="rounded-2xl p-6 border-2 border-red-400/40 shadow-sm"
                  style={{
                    background: "rgba(61,24,24,0.5)",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <div
                    className="h-1 w-12 rounded-full mb-5"
                    style={{
                      background: "linear-gradient(90deg,#e74c3c,#ff8080)",
                    }}
                  />
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden ring-2 ring-red-400/60 bg-white flex items-center justify-center p-1">
                      <img
                        src="/alfima.png"
                        alt="Alfima"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <p className="text-white font-black">
                        Alfima Realty Inc.
                      </p>
                      <p className="text-red-400 text-xs font-medium">
                        Brokerage Company
                      </p>
                    </div>
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed">
                    Helping Filipinos find their dream properties since day one.
                    Reach out — let&apos;s talk about what you need.
                  </p>
                </div>

                {[
                  {
                    icon: <MapPin className="w-5 h-5" />,
                    label: "Visit Us",
                    lines: [
                      "10th Floor IBP Tower Jade Drive Brgy San Antonio, Pasig, Philippines",
                    ],
                  },
                  {
                    icon: <Mail className="w-5 h-5" />,
                    label: "Email Us",
                    lines: ["sales@alfimarealtyinc.com"],
                    links: ["mailto:sales@alfimarealtyinc.com"],
                  },
                  {
                    icon: <Clock className="w-5 h-5" />,
                    label: "Business Hours",
                    lines: ["Monday – Sunday: 9:00 AM – 6:00 PM"],
                  },
                ].map(({ icon, label, lines, links }, i) => (
                  <Reveal key={label} delay={i * 80}>
                    <div
                      className="rounded-2xl p-5 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group border border-red-400/40 shadow-sm"
                      style={{
                        background: "rgba(61,24,24,0.5)",
                        backdropFilter: "blur(12px)",
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
                          style={{ background: "rgba(231,76,60,0.6)" }}
                        >
                          {icon}
                        </div>
                        <div>
                          <p className="text-red-300/70 text-xs font-black uppercase tracking-widest mb-1">
                            {label}
                          </p>
                          {lines.map((line, j) =>
                            links?.[j] ? (
                              <a
                                key={j}
                                href={links[j]}
                                className="block text-white/80 hover:text-red-400 text-sm font-medium transition-colors"
                              >
                                {line}
                              </a>
                            ) : (
                              <p key={j} className="text-white/70 text-sm">
                                {line}
                              </p>
                            ),
                          )}
                        </div>
                      </div>
                    </div>
                  </Reveal>
                ))}

                <Reveal delay={320}>
                  <div
                    className="rounded-2xl p-5 border border-red-400/40 shadow-sm"
                    style={{
                      background: "rgba(61,24,24,0.5)",
                      backdropFilter: "blur(12px)",
                    }}
                  >
                    <p className="text-red-300/70 text-xs font-black uppercase tracking-widest mb-3">
                      Follow Us
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {[
                        {
                          icon: <Facebook className="w-4 h-4" />,
                          label: "Facebook",
                          href: "https://www.facebook.com/p/Alfima-Realty-Inc-61579807227114/",
                          bg: "#1877F2",
                        },
                        {
                          icon: <Instagram className="w-4 h-4" />,
                          label: "Instagram",
                          href: "https://www.instagram.com/alfimarealtyinc/",
                          bg: "linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)",
                        },
                        {
                          icon: (
                            <svg
                              className="w-4 h-4"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                          ),
                          label: "WhatsApp",
                          href: "https://wa.me/639171742419",
                          bg: "#25D366",
                        },
                        {
                          icon: (
                            <svg
                              className="w-4 h-4"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L6.918 14.41l-2.938-.919c-.638-.203-.65-.638.136-.943l11.495-4.431c.531-.194.994.131.951.131z" />
                            </svg>
                          ),
                          label: "Telegram",
                          href: "https://t.me/+639171742419",
                          bg: "#26A5E4",
                        },
                        {
                          icon: (
                            <svg
                              className="w-4 h-4"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M12 0C5.383 0 0 5.09 0 11.377c0 3.69 1.876 6.97 4.799 9.093V24l4.367-2.395a13.24 13.24 0 003.834.563c6.617 0 12-5.09 12-11.378C24 5.09 18.617 0 12 0zm1.21 15.32l-3.068-3.274-5.993 3.274L10.7 8.48l3.14 3.274 5.922-3.274-6.552 6.84z" />
                            </svg>
                          ),
                          label: "Viber",
                          href: "viber://chat?number=%2B639171742419",
                          bg: "#7360F2",
                        },
                      ].map(({ icon, label, href, bg }) => (
                        <a
                          key={label}
                          href={href}
                          target={label !== "Viber" ? "_blank" : undefined}
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-bold transition-transform hover:scale-105"
                          style={{ background: bg }}
                        >
                          {icon} {label}
                        </a>
                      ))}
                    </div>
                  </div>
                </Reveal>
              </div>
            </Reveal>

            {/* Form */}
            <div className="lg:col-span-2">
              <Reveal dir="right" delay={100}>
                <div className="rounded-3xl overflow-hidden shadow-xl border border-red-400/40">
                  <div
                    className="px-10 pt-10 pb-6 border-b border-red-900/20"
                    style={{
                      background: "linear-gradient(135deg,#c0392b,#96281b)",
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                        <Send className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-white">
                          Send Us a Message
                        </h2>
                        <p className="text-white/70 text-sm">
                          We&apos;ll get back to you within 24 hours
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className="p-10"
                    style={{
                      background: "rgba(61,24,24,0.5)",
                      backdropFilter: "blur(12px)",
                    }}
                  >
                    {status === "success" ? (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 bg-green-600/30">
                          <CheckCircle2 className="w-10 h-10 text-green-400" />
                        </div>
                        <h3 className="text-white text-2xl font-black mb-2">
                          Message Sent!
                        </h3>
                        <p className="text-white/70 max-w-sm">
                          Thank you for reaching out. Our team will get back to
                          you within 24 hours.
                        </p>
                      </div>
                    ) : (
                      <form
                        onSubmit={handleSubmit}
                        className="space-y-6"
                        noValidate
                      >
                        {/* Error banner */}
                        {status === "error" && (
                          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-800/40 border border-red-500/60 text-red-200">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <p>{errorMsg}</p>
                          </div>
                        )}

                        <div>
                          <label className="block text-sm font-bold text-white/80 mb-3">
                            Your Name
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required
                            className={`w-full px-4 py-3 rounded-xl border bg-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-red-400/60 transition-all ${fieldBorder("name")}`}
                            placeholder="John Doe"
                          />
                          <FieldError msg={fieldErrors.name} />
                        </div>

                        {/* Email */}
                        <div>
                          <label className="block text-sm font-bold text-white/80 mb-3">
                            Email Address
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required
                            className={`w-full px-4 py-3 rounded-xl border bg-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-red-400/60 transition-all ${fieldBorder("email")}`}
                            placeholder="john@example.com"
                          />
                          <FieldError msg={fieldErrors.email} />
                        </div>

                        {/* Phone */}
                        <div>
                          <label className="block text-sm font-bold text-white/80 mb-3">
                            Phone Number
                            <span className="ml-2 text-white/40 text-xs font-normal">
                              (11 digits, optional)
                            </span>
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            maxLength={11}
                            inputMode="numeric"
                            className={`w-full px-4 py-3 rounded-xl border bg-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-red-400/60 transition-all ${fieldBorder("phone")}`}
                            placeholder="09123456789"
                          />
                          <FieldError msg={fieldErrors.phone} />
                          {/* Character counter */}
                          {formData.phone.length > 0 && (
                            <p
                              className={`mt-1 text-xs text-right font-medium ${formData.phone.length === 11 ? "text-green-400" : "text-white/40"}`}
                            >
                              {formData.phone.length}/11
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-white/80 mb-3">
                            Subject
                          </label>
                          <input
                            type="text"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required
                            className={`w-full px-4 py-3 rounded-xl border bg-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-red-400/60 transition-all ${fieldBorder("subject")}`}
                            placeholder="How can we help?"
                          />
                          <FieldError msg={fieldErrors.subject} />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-white/80 mb-3">
                            Message
                          </label>
                          <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required
                            rows={5}
                            className={`w-full px-4 py-3 rounded-xl border bg-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-red-400/60 transition-all resize-none ${fieldBorder("message")}`}
                            placeholder="Tell us more..."
                          />
                          <FieldError msg={fieldErrors.message} />
                        </div>

                        <div className="space-y-4 rounded-2xl border border-red-400/30 bg-black/10 p-4">
                          <label className="flex items-start gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={agreedToTerms}
                              onChange={(e) => setAgreedToTerms(e.target.checked)}
                              className="mt-1 w-3.5 h-3.5 accent-red-600 flex-shrink-0"
                            />
                            <span className="text-sm leading-relaxed text-white/80">
                              I acknowledge that I have read and understood the{" "}
                              <button
                                type="button"
                                onClick={() => setPolicyModal("privacy")}
                                className="text-red-400 underline hover:text-red-300"
                              >
                                Privacy Policy
                              </button>
                              {" "}and{" "}
                              <button
                                type="button"
                                onClick={() => setPolicyModal("notice")}
                                className="text-red-400 underline hover:text-red-300"
                              >
                                Privacy Notice
                              </button>
                              {" "}of ALFIMA Realty Inc.
                            </span>
                          </label>

                          <div className="space-y-2">
                            <p className="text-sm font-semibold text-white/90">
                              Marketing Consent &#40;Optional&#41;
                            </p>
                            <div className="flex items-start gap-3">
                              <input
                                id="marketing-consent"
                                type="checkbox"
                                checked={marketingConsent}
                                onChange={(e) => setMarketingConsent(e.target.checked)}
                                className="mt-0.5 h-4 w-4 accent-red-600"
                              />
                              <label
                                htmlFor="marketing-consent"
                                className="text-sm leading-relaxed text-white/80"
                              >
                                I agree to receive promotional communications and
                                property updates from ALFIMA Realty Inc. through
                                the information I provided. I understand that this
                                is optional and that I may withdraw my consent at
                                any time.
                              </label>
                            </div>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={status === "loading"}
                          className="w-full py-4 rounded-xl font-black text-lg transition-all disabled:opacity-50 text-white border border-transparent"
                          style={{
                            background:
                              "linear-gradient(135deg, #d4a5a0 0%, #c49890 100%)",
                          }}
                        >
                          {status === "loading" ? "Sending..." : "Send Message"}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {policyContent && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-neutral-950 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <h3 className="text-base font-bold text-white">
                {policyContent.title}
              </h3>
              <button
                type="button"
                onClick={() => setPolicyModal(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                aria-label="Close policy modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto px-5 py-4 text-sm leading-6 text-white/75">
              {policyContent.body.map((paragraph, index) => (
                <p
                  key={`${policyContent.title}-${index}`}
                  className="mb-3 last:mb-0"
                  style={{ whiteSpace: "pre-line" }}
                >
                  {paragraph}
                </p>
              ))}
              <div className="mt-4 rounded-xl border border-red-500/20 bg-red-600/5 p-3 text-xs text-red-200">
                For questions, contact us at sales@alfimarealtyinc.com or call
                09171742419.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
