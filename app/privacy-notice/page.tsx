export default function PrivacyNoticePage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-green-900/40 to-transparent py-12">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                <div className="rounded-2xl border border-white/20 bg-white/10 p-8 backdrop-blur-md sm:p-12">
                    {/* Header */}
                    <div className="mb-10">
                        <h1 className="mb-4 text-4xl font-bold text-white sm:text-5xl">
                            Website Form Privacy Notice
                        </h1>

                        <p className="text-sm text-green-200">
                            ALFIMA Realty Inc.
                        </p>
                    </div>

                    <div className="space-y-8 text-green-50">
                        {/* Main Notice */}
                        <section>
                            <p className="leading-relaxed">
                                ALFIMA Realty Inc. will use the personal information you
                                provide through this website form to respond to your inquiry,
                                understand your property requirements, connect you with the
                                appropriate representative of ALFIMA Realty Inc., schedule
                                requested consultations or viewings, and facilitate
                                property-related services.
                            </p>

                            <p className="mt-5 leading-relaxed">
                                When necessary to facilitate, process, or complete a property
                                transaction, relevant information may be provided to the
                                applicable property developer.
                            </p>

                            <p className="mt-5 leading-relaxed">
                                Your personal information will be handled in accordance with
                                applicable data privacy laws and ALFIMA Realty Inc.'s privacy
                                practices.
                            </p>
                        </section>

                        {/* Information We May Collect */}
                        <section>
                            <h2 className="mb-4 text-2xl font-bold text-white">
                                Information We May Collect
                            </h2>

                            <p className="mb-4 leading-relaxed">
                                Depending on the form or service you use, the information you
                                provide may include:
                            </p>

                            <ul className="ml-4 list-disc space-y-2">
                                <li>Full name</li>
                                <li>Email address</li>
                                <li>Mobile number</li>
                                <li>Property preferences</li>
                                <li>Location preferences</li>
                                <li>Unit size or property requirements</li>
                                <li>Preferred viewing or consultation details</li>
                                <li>Other information you voluntarily provide</li>
                            </ul>
                        </section>

                        {/* How We Use Your Information */}
                        <section>
                            <h2 className="mb-4 text-2xl font-bold text-white">
                                How We Use Your Information
                            </h2>

                            <p className="mb-4 leading-relaxed">
                                The information you provide may be used to:
                            </p>

                            <ul className="ml-4 list-disc space-y-2">
                                <li>Respond to your property inquiry</li>
                                <li>Understand your property requirements</li>
                                <li>Connect you with an appropriate ALFIMA representative</li>
                                <li>Schedule property viewings or consultations</li>
                                <li>Provide information about relevant properties</li>
                                <li>Facilitate property-related services and transactions</li>
                                <li>
                                    Coordinate with applicable property developers when necessary
                                </li>
                            </ul>
                        </section>

                        {/* Sharing */}
                        <section>
                            <h2 className="mb-4 text-2xl font-bold text-white">
                                Sharing of Information
                            </h2>

                            <p className="leading-relaxed">
                                ALFIMA Realty Inc. does not sell your personal information.
                                When necessary to facilitate, process, or complete a property
                                inquiry or transaction, relevant information may be shared with
                                the applicable property developer or authorized service
                                providers.
                            </p>
                        </section>

                        {/* Consent */}
                        <section>
                            <h2 className="mb-4 text-2xl font-bold text-white">
                                Your Consent
                            </h2>

                            <p className="leading-relaxed">
                                By submitting information through an ALFIMA Realty Inc.
                                website form, you acknowledge that you have read and understood
                                this Privacy Notice and that your information may be processed
                                for the purposes described above, subject to applicable law.
                            </p>
                        </section>

                        {/* Full Privacy Policy */}
                        <section>
                            <h2 className="mb-4 text-2xl font-bold text-white">
                                More Information
                            </h2>

                            <p className="leading-relaxed">
                                For more information about how ALFIMA Realty Inc. collects,
                                uses, stores, shares, retains, and protects personal
                                information, please read our full Privacy Policy.
                            </p>

                            <div className="mt-5">
                                <a
                                    href="/privacy-policy"
                                    className="inline-flex items-center rounded-lg bg-lime-300 px-5 py-3 font-semibold text-green-950 transition hover:bg-lime-400"
                                >
                                    Read Full Privacy Policy
                                </a>
                            </div>
                        </section>

                        {/* Contact */}
                        <section>
                            <h2 className="mb-4 text-2xl font-bold text-white">
                                Privacy Questions and Concerns
                            </h2>

                            <p className="leading-relaxed">
                                If you have questions, requests, or concerns regarding the
                                processing of your personal information, you may contact ALFIMA
                                Realty Inc. through the following:
                            </p>

                            <div className="mt-5 rounded-xl border border-white/10 bg-black/10 p-5">
                                <p className="font-semibold text-lime-300">
                                    ALFIMA Realty Inc.
                                </p>

                                <p className="mt-2 leading-7">
                                    IBP Building
                                    <br />
                                    Julia Vargas Avenue and Jade Drive
                                    <br />
                                    Ortigas Center, Pasig City, Philippines
                                </p>

                                <p className="mt-4">
                                    Email:{" "}
                                    <a
                                        href="mailto:sales@alfimarealtyinc.com"
                                        className="text-lime-300 underline hover:text-lime-400"
                                    >
                                        sales@alfimarealtyinc.com
                                    </a>
                                </p>

                                <p className="mt-2">
                                    Mobile Number:{" "}
                                    <a
                                        href="tel:+639171742419"
                                        className="text-lime-300 underline hover:text-lime-400"
                                    >
                                        0917 174 2419
                                    </a>
                                </p>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
