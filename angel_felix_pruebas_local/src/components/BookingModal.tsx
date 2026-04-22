import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { X, Check, CreditCard } from "lucide-react";
import { saveBookingLead, updateBookingLeadStatus } from "@/lib/metricsClient";

const paypalOptions = {
  clientId: "test",
  currency: "USD",
  intent: "capture",
};

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedHunt?: string;
}

const BookingModal = ({ isOpen, onClose, selectedHunt = "General Deposit" }: BookingModalProps) => {
  const [step, setStep] = useState(1);
  const [isSavingLead, setIsSavingLead] = useState(false);
  const [formError, setFormError] = useState("");
  const [leadId, setLeadId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    hunt: selectedHunt,
  });

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setIsSavingLead(false);
      setFormError("");
      setLeadId(null);
      setFormData((prev) => ({ ...prev, hunt: selectedHunt }));
    }
  }, [isOpen, selectedHunt]);

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formData.phone.trim()) {
      setFormError("Phone number is required.");
      return;
    }

    try {
      setIsSavingLead(true);
      const id = await saveBookingLead({
        fullName: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        hunt: formData.hunt,
        sourcePath: window.location.hash || "#/",
      });
      setLeadId(id);
      setStep(2);
    } catch {
      setFormError("We could not save your contact info. Please try again.");
    } finally {
      setIsSavingLead(false);
    }
  };

  const handlePaymentSuccess = async (details: any) => {
    try {
      if (leadId) {
        const ref = details?.id || details?.payer?.payer_id || undefined;
        await updateBookingLeadStatus(leadId, "paypal_paid", "paypal", ref);
      }
    } catch {
      // Non-blocking, booking still continues.
    }
    setStep(3);
  };

  const handleStripeRedirect = async () => {
    try {
      if (leadId) {
        await updateBookingLeadStatus(leadId, "stripe_redirected", "stripe");
      }
    } catch {
      // Non-blocking, booking still continues.
    }
    window.open("https://buy.stripe.com/test_placeholder", "_blank");
    setStep(3);
  };

  return (
    <PayPalScriptProvider options={paypalOptions}>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm"
            />

            <div className="pointer-events-none fixed inset-0 z-[70] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="pointer-events-auto relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-xl bg-zinc-900 p-6 shadow-2xl ring-1 ring-white/10"
              >
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="font-display text-2xl text-white">
                    {step === 1 && "Start Your Adventure"}
                    {step === 2 && "Secure Deposit"}
                    {step === 3 && "Booking Confirmed"}
                  </h3>
                  <button
                    onClick={onClose}
                    className="rounded-full p-1 text-gray-400 hover:bg-white/10 hover:text-white"
                  >
                    <X size={20} />
                  </button>
                </div>

                {step === 1 && (
                  <form onSubmit={handleNext} className="space-y-4">
                    <div>
                      <label className="mb-1 block text-xs uppercase tracking-widest text-gray-400">
                        Full Name
                      </label>
                      <input
                        required
                        type="text"
                        className="w-full rounded-md border border-white/10 bg-black/50 p-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs uppercase tracking-widest text-gray-400">
                        Email
                      </label>
                      <input
                        required
                        type="email"
                        className="w-full rounded-md border border-white/10 bg-black/50 p-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs uppercase tracking-widest text-gray-400">
                        Phone Number
                      </label>
                      <input
                        required
                        type="tel"
                        className="w-full rounded-md border border-white/10 bg-black/50 p-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="+1 480 251 0258"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs uppercase tracking-widest text-gray-400">
                        Selected Hunt
                      </label>
                      <input
                        disabled
                        type="text"
                        className="w-full cursor-not-allowed rounded-md border border-white/10 bg-white/5 p-3 text-gray-400"
                        value={formData.hunt}
                      />
                    </div>
                    {formError ? <p className="text-sm text-red-400">{formError}</p> : null}

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={isSavingLead}
                        className="w-full rounded-md bg-primary py-3 font-body text-sm font-bold uppercase tracking-widest text-white transition-transform hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isSavingLead ? "Saving..." : "Continue to Payment"}
                      </button>
                    </div>
                  </form>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <div className="rounded-lg bg-white/5 p-4 text-center">
                      <p className="text-sm text-gray-400">Booking Deposit</p>
                      <p className="font-display text-4xl text-white">
                        $500.00 <span className="text-sm text-gray-500">USD</span>
                      </p>
                    </div>

                    <div className="space-y-3">
                      <p className="text-xs uppercase tracking-widest text-gray-400">Select Payment Method</p>

                      <div className="relative z-0">
                        <PayPalButtons
                          style={{ layout: "vertical", color: "gold", shape: "rect", label: "pay" }}
                          createOrder={(data, actions) => {
                            return actions.order.create({
                              intent: "CAPTURE",
                              purchase_units: [
                                {
                                  description: `Deposit for ${formData.hunt}`,
                                  amount: {
                                    currency_code: "USD",
                                    value: "500.00",
                                  },
                                },
                              ],
                            });
                          }}
                          onApprove={async (data, actions) => {
                            if (actions.order) {
                              const details = await actions.order.capture();
                              await handlePaymentSuccess(details);
                            }
                          }}
                        />
                      </div>

                      <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-white/10"></div>
                        <span className="mx-4 flex-shrink-0 text-xs uppercase text-gray-500">
                          Or Pay with Card
                        </span>
                        <div className="flex-grow border-t border-white/10"></div>
                      </div>

                      <button
                        onClick={handleStripeRedirect}
                        className="flex w-full items-center justify-center gap-3 rounded-md bg-[#635BFF] py-3 font-sans text-sm font-bold text-white shadow-lg transition-transform hover:scale-[1.02] hover:bg-[#5851E1]"
                      >
                        <CreditCard size={18} />
                        Pay with Visa / Mastercard
                      </button>
                      <p className="text-center text-[10px] text-gray-500">
                        Processed securely via Stripe Checkout
                      </p>
                    </div>

                    <button
                      onClick={() => setStep(1)}
                      className="w-full text-xs text-gray-400 hover:text-white hover:underline"
                    >
                      Back to details
                    </button>
                  </div>
                )}

                {step === 3 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20 text-green-500">
                      <Check size={40} />
                    </div>
                    <h4 className="mb-2 font-display text-2xl text-white">Payment Successful!</h4>
                    <p className="mb-8 text-gray-400">
                      Thank you, {formData.name}. Your deposit for <strong>{formData.hunt}</strong> has been
                      received. We will contact you at {formData.email} and {formData.phone} if needed.
                    </p>
                    <button
                      onClick={onClose}
                      className="w-full rounded-md border border-white/20 bg-transparent py-3 font-body text-sm font-bold uppercase tracking-widest text-white hover:bg-white/10"
                    >
                      Close
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </PayPalScriptProvider>
  );
};

export default BookingModal;

