"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Phone,
  Mail,
  X,
  MapPin,
  Send,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface FooterContact {
  id: number;
  type: "address" | "phone" | "email";
  value: string;
  href: string | null;
  is_active: boolean;
  sort_order: number;
}

const CONTACT_ICON = {
  address: MapPin,
  phone: Phone,
  email: Mail,
};

export function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const [contacts, setContacts] = useState<FooterContact[]>([]);
  const [policyModal, setPolicyModal] = useState<"privacy" | "notice" | null>(
    null,
  );

  useEffect(() => {
    fetch("/api/footer-contacts")
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setContacts(data))
      .catch(() => { });
  }, []);

  if (pathname?.startsWith("/admin")) return null;

  const handleSubscribe = async () => {
    if (!email.trim()) return;

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error ?? "Something went wrong.");
      }

      setStatus("success");
      setMessage(data.message ?? "Subscribed! Check your inbox.");
      setEmail("");
    } catch (err: unknown) {
      setStatus("error");
      setMessage(
        err instanceof Error
          ? err.message
          : "Failed to subscribe."
      );
    }
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
    <footer
      className="relative overflow-hidden"
      style={{
        background:
          "linear-gradient(160deg, #590e0e 0%, #5e0c12 30%, #3b0f0f 70%, #370505 100%)",
      }}
    >
      {/* Top border glow */}
      <div
        className="absolute top-0 left-0 w-full h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,120,120,0.5), transparent)",
        }}
      />

      {/* Dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">

          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2.5 mb-3">
              <div className="w-14 h-14 p-1 bg-white rounded-full overflow-hidden ring-2 ring-white/20 flex-shrink-0">
                <img
                  src="/alfima.png"
                  alt="Alfima Realty"
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <p className="font-black text-sm text-white">
                  ALFIMA REALTY INC.
                </p>

                <p className="text-[10px] text-red-200/70 tracking-widest uppercase">
                  Brokerage Company
                </p>
              </div>
            </Link>

            <p className="text-xs text-white/65 leading-relaxed mb-4">
              Helping Filipinos find their dream homes with integrity and
              expertise.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-4 h-0.5 bg-red-300 inline-block rounded-full" />
              Links
            </h4>

            <ul className="space-y-2.5">
              {[
                { label: "Properties", href: "/properties" },
                { label: "Agents", href: "/agents" },
                { label: "About Us", href: "/about" },
                { label: "Contact Us", href: "/contact" },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-xs text-white/70 hover:text-white transition-colors hover:underline underline-offset-2"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Dynamic Contacts */}
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-4 h-0.5 bg-red-300 inline-block rounded-full" />
              Contact
            </h4>

            <ul className="space-y-3">
              {contacts.map((contact) => {
                const Icon = CONTACT_ICON[contact.type];

                const resolvedHref =
                  contact.type === "phone"
                    ? `tel:${contact.value.replace(/\s+/g, "")}`
                    : contact.type === "email"
                      ? `mailto:${contact.value.trim()}`
                      : contact.href;

                if (resolvedHref) {
                  return (
                    <li key={contact.id}>
                      <a
                        href={resolvedHref}
                        target={
                          contact.type === "address"
                            ? "_blank"
                            : undefined
                        }
                        rel={
                          contact.type === "address"
                            ? "noopener noreferrer"
                            : undefined
                        }
                        className="flex items-start gap-2.5 group"
                      >
                        <Icon className="w-3.5 h-3.5 text-red-200 flex-shrink-0 mt-0.5 group-hover:text-white transition-colors" />

                        <span className="text-xs text-white/70 leading-relaxed group-hover:text-white transition-colors">
                          {contact.value}
                        </span>
                      </a>
                    </li>
                  );
                }

                return (
                  <li
                    key={contact.id}
                    className="flex items-start gap-2.5"
                  >
                    <Icon className="w-3.5 h-3.5 text-red-200 flex-shrink-0 mt-0.5" />

                    <span className="text-xs text-white/70 leading-relaxed">
                      {contact.value}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-4 h-0.5 bg-red-300 inline-block rounded-full" />
              Newsletter
            </h4>

            <p className="text-xs text-white/70 mb-3 leading-relaxed">
              Get the latest listings delivered to your inbox.
            </p>

            {status === "success" ? (
              <div
                className="flex items-start gap-2.5 p-3 rounded-lg border border-green-400/30"
                style={{ background: "rgba(0,200,100,0.1)" }}
              >
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />

                <p className="text-xs text-green-300 leading-relaxed">
                  {message}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setStatus("idle");
                    setMessage("");
                  }}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleSubscribe()
                  }
                  placeholder="Your email address"
                  disabled={status === "loading"}
                  className="w-full px-3 py-2.5 rounded-lg text-xs text-white placeholder-white focus:outline-none border border-white/20 focus:border-white/40 transition-all disabled:opacity-50"
                  style={{ background: "rgba(0,0,0,0.25)" }}
                />

                {status === "error" && (
                  <div className="flex items-center gap-1.5">
                    <AlertCircle className="w-3 h-3 text-red-300 flex-shrink-0" />

                    <p className="text-[11px] text-red-300">
                      {message}
                    </p>
                  </div>
                )}

                <button
                  onClick={handleSubscribe}
                  disabled={
                    status === "loading" || !email.trim()
                  }
                  className="w-full py-2.5 rounded-lg text-white text-xs font-bold transition-all border border-white/20 hover:border-white/40 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{
                    background:
                      "linear-gradient(135deg, #c0392b, #96281b)",
                  }}
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Subscribing…
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Subscribe
                    </>
                  )}
                </button>
              </div>
            )}

            <p className="text-[10px] text-white/40 mt-2">
              No spam. Unsubscribe anytime.
            </p>
          </div>
        </div>

        <div className="h-px w-full mb-5 bg-white/15" />

        <div className="flex flex-row justify-between gap-3 text-[11px] text-white/55">
          <div className="flex flex-col justify-between items-start gap-2">
            <p>
              © {currentYear} ALFIMA REALTY INC. All rights reserved.
            </p>

            <a
              href="https://www.infinitechphil.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-white/40 hover:text-white/70 transition-colors group"
            >
              <span>Powered by</span>

              <span className="font-semibold text-white/55 group-hover:text-white/80 transition-colors tracking-wide">
                Infinitech Advertising Corporation
              </span>
            </a>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setPolicyModal("privacy")}
              className="text-red-400 hover:text-red-300"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => setPolicyModal("notice")}
              className="text-red-400 hover:text-red-300"
            >
              Privacy Notice
            </button>
          </div>
        </div>
      </div>

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
    </footer>
  );
}

