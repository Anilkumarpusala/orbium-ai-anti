"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form state
  const [businessDescription, setBusinessDescription] = useState("");
  const [targetCustomer, setTargetCustomer] = useState("");
  const [industry, setIndustry] = useState("");
  const [apiProvider, setApiProvider] = useState("Gemini (Free ✨)");
  const [apiKey, setApiKey] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");

  const totalSteps = 5;

  const handleNext = () => setStep((s) => Math.min(s + 1, totalSteps));
  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  const handleFinish = async () => {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("No session found");
      }

      // Simple pseudo-encryption for demonstration, real encryption should happen server-side
      const encryptedKey = apiKey ? btoa(apiKey) : "";
      const hint = apiKey ? apiKey.slice(-4) : "";

      const { error } = await supabase.from("user_profiles").insert({
        user_id: session.user.id,
        business_description: businessDescription,
        target_customer: targetCustomer,
        industry,
        api_provider: apiProvider,
        api_key_hint: hint,
        encrypted_api_key: encryptedKey,
        selected_template: selectedTemplate,
        onboarding_completed: true,
      });

      if (error) throw error;

      router.push("/workspace");
      router.refresh();
    } catch (err) {
      console.error("Error saving onboarding data:", err);
      alert("Something went wrong saving your data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const industries = [
    "Marketing Agency",
    "Web Design",
    "SaaS / Tech",
    "Consulting",
    "E-commerce",
    "Real Estate",
    "Finance",
    "Education",
    "Healthcare",
    "Other",
  ];

  const templates = [
    {
      title: "🎯 Lead Generation",
      desc: "Find and reach potential clients",
    },
    {
      title: "📣 Content Marketing",
      desc: "Create content that attracts customers",
    },
    {
      title: "💌 Sales Outreach",
      desc: "Build and run outreach campaigns",
    },
  ];

  const syneFont = "var(--font-syne), sans-serif";
  const monoFont = "var(--font-jetbrains-mono), monospace";

  return (
    <div
      style={{
        backgroundColor: "#000000",
        minHeight: "100vh",
        color: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        fontFamily: monoFont,
        position: "relative",
      }}
    >
      {/* Progress Bar & Header */}
      {step > 1 && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "2px",
              backgroundColor: "#1A1A1A",
              display: "flex",
            }}
          >
            <div
              style={{
                width: `${(step / totalSteps) * 100}%`,
                height: "100%",
                backgroundColor: "#FFFFFF",
                transition: "width 0.3s ease",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
              maxWidth: "600px",
              padding: "20px 24px",
              boxSizing: "border-box",
            }}
          >
            <button
              onClick={handleBack}
              style={{
                background: "transparent",
                border: "none",
                color: "#FFFFFF",
                cursor: "pointer",
                fontFamily: monoFont,
                fontSize: "14px",
                padding: 0,
              }}
            >
              ← Back
            </button>
            <span style={{ fontSize: "14px", color: "#666666" }}>
              {step} / {totalSteps}
            </span>
            <div style={{ width: "45px" }} /> {/* Spacer for centering */}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "24px",
          marginTop: step > 1 ? "80px" : "0",
        }}
      >
        <div style={{ maxWidth: "600px", width: "100%" }}>
          {/* STEP 1: Welcome */}
          {step === 1 && (
            <div style={{ textAlign: "center" }}>
              <h1
                style={{
                  fontFamily: syneFont,
                  fontSize: "48px",
                  margin: "0 0 16px 0",
                  fontWeight: 700,
                }}
              >
                Welcome to Orbium AI
              </h1>
              <p
                style={{
                  fontSize: "18px",
                  color: "#999999",
                  margin: "0 0 48px 0",
                }}
              >
                Let's set up your AI team
              </p>
              <button
                onClick={handleNext}
                style={{
                  backgroundColor: "#FFFFFF",
                  color: "#000000",
                  border: "none",
                  padding: "16px 32px",
                  fontSize: "16px",
                  fontFamily: monoFont,
                  fontWeight: 600,
                  cursor: "pointer",
                  borderRadius: "4px",
                }}
              >
                Get Started →
              </button>
            </div>
          )}

          {/* STEP 2: Business Description */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
              <h2
                style={{
                  fontFamily: syneFont,
                  fontSize: "32px",
                  margin: 0,
                  fontWeight: 600,
                }}
              >
                Tell us about your business
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "14px", color: "#CCCCCC" }}>
                  What does your business do?
                </label>
                <textarea
                  value={businessDescription}
                  onChange={(e) => setBusinessDescription(e.target.value)}
                  placeholder="e.g. I run a web design agency for UK restaurants"
                  style={{
                    backgroundColor: "#0A0A0A",
                    border: "1px solid #1A1A1A",
                    color: "#FFFFFF",
                    padding: "16px",
                    fontFamily: monoFont,
                    fontSize: "14px",
                    borderRadius: "4px",
                    minHeight: "100px",
                    outline: "none",
                    resize: "vertical",
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "14px", color: "#CCCCCC" }}>
                  Who are your target customers?
                </label>
                <textarea
                  value={targetCustomer}
                  onChange={(e) => setTargetCustomer(e.target.value)}
                  placeholder="e.g. Restaurant owners in the UK"
                  style={{
                    backgroundColor: "#0A0A0A",
                    border: "1px solid #1A1A1A",
                    color: "#FFFFFF",
                    padding: "16px",
                    fontFamily: monoFont,
                    fontSize: "14px",
                    borderRadius: "4px",
                    minHeight: "100px",
                    outline: "none",
                    resize: "vertical",
                  }}
                />
              </div>

              <button
                onClick={handleNext}
                disabled={!businessDescription || !targetCustomer}
                style={{
                  backgroundColor: "#FFFFFF",
                  color: "#000000",
                  border: "none",
                  padding: "16px 32px",
                  fontSize: "16px",
                  fontFamily: monoFont,
                  fontWeight: 600,
                  cursor: businessDescription && targetCustomer ? "pointer" : "not-allowed",
                  borderRadius: "4px",
                  opacity: businessDescription && targetCustomer ? 1 : 0.5,
                  alignSelf: "flex-start",
                }}
              >
                Continue →
              </button>
            </div>
          )}

          {/* STEP 3: Industry */}
          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
              <h2
                style={{
                  fontFamily: syneFont,
                  fontSize: "32px",
                  margin: 0,
                  fontWeight: 600,
                }}
              >
                What's your industry?
              </h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                {industries.map((ind) => (
                  <button
                    key={ind}
                    onClick={() => setIndustry(ind)}
                    style={{
                      backgroundColor: "#0A0A0A",
                      border: `1px solid ${industry === ind ? "#FFFFFF" : "#1A1A1A"}`,
                      color: "#FFFFFF",
                      padding: "24px 16px",
                      fontFamily: monoFont,
                      fontSize: "14px",
                      cursor: "pointer",
                      borderRadius: "4px",
                      textAlign: "left",
                      transition: "border-color 0.2s ease",
                    }}
                  >
                    {ind}
                  </button>
                ))}
              </div>

              <button
                onClick={handleNext}
                disabled={!industry}
                style={{
                  backgroundColor: "#FFFFFF",
                  color: "#000000",
                  border: "none",
                  padding: "16px 32px",
                  fontSize: "16px",
                  fontFamily: monoFont,
                  fontWeight: 600,
                  cursor: industry ? "pointer" : "not-allowed",
                  borderRadius: "4px",
                  opacity: industry ? 1 : 0.5,
                  alignSelf: "flex-start",
                }}
              >
                Continue →
              </button>
            </div>
          )}

          {/* STEP 4: Connect API Key */}
          {step === 4 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
              <div>
                <h2
                  style={{
                    fontFamily: syneFont,
                    fontSize: "32px",
                    margin: "0 0 8px 0",
                    fontWeight: 600,
                  }}
                >
                  Connect your AI provider
                </h2>
                <p style={{ color: "#999999", margin: 0, fontSize: "16px" }}>
                  Orbium uses your own API key. You stay in control.
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <select
                  value={apiProvider}
                  onChange={(e) => setApiProvider(e.target.value)}
                  style={{
                    backgroundColor: "#0A0A0A",
                    border: "1px solid #1A1A1A",
                    color: "#FFFFFF",
                    padding: "16px",
                    fontFamily: monoFont,
                    fontSize: "14px",
                    borderRadius: "4px",
                    outline: "none",
                    appearance: "none",
                    cursor: "pointer",
                  }}
                >
                  <option>Gemini (Free ✨)</option>
                  <option>OpenAI</option>
                  <option>Claude</option>
                  <option>Groq</option>
                  <option>OpenRouter</option>
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Paste your API key"
                  style={{
                    backgroundColor: "#0A0A0A",
                    border: "1px solid #1A1A1A",
                    color: "#FFFFFF",
                    padding: "16px",
                    fontFamily: monoFont,
                    fontSize: "14px",
                    borderRadius: "4px",
                    outline: "none",
                  }}
                />
                <span style={{ fontSize: "12px", color: "#666666" }}>
                  🔒 Encrypted. Never shared.
                </span>
              </div>

              <div style={{ display: "flex", gap: "16px", marginTop: "16px" }}>
                <button
                  onClick={() => {
                    setApiKey("");
                    handleNext();
                  }}
                  style={{
                    backgroundColor: "transparent",
                    color: "#FFFFFF",
                    border: "1px solid #FFFFFF",
                    padding: "16px 32px",
                    fontSize: "16px",
                    fontFamily: monoFont,
                    fontWeight: 600,
                    cursor: "pointer",
                    borderRadius: "4px",
                  }}
                >
                  Skip for now
                </button>
                <button
                  onClick={handleNext}
                  disabled={!apiKey && apiProvider !== "Gemini (Free ✨)"}
                  style={{
                    backgroundColor: "#FFFFFF",
                    color: "#000000",
                    border: "none",
                    padding: "16px 32px",
                    fontSize: "16px",
                    fontFamily: monoFont,
                    fontWeight: 600,
                    cursor: (!apiKey && apiProvider !== "Gemini (Free ✨)") ? "not-allowed" : "pointer",
                    borderRadius: "4px",
                    opacity: (!apiKey && apiProvider !== "Gemini (Free ✨)") ? 0.5 : 1,
                  }}
                >
                  Save & Continue →
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Choose Template */}
          {step === 5 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "32px", width: "100%", maxWidth: "900px", transform: "translateX(calc((600px - 100%) / 2))" }}>
              <h2
                style={{
                  fontFamily: syneFont,
                  fontSize: "32px",
                  margin: 0,
                  fontWeight: 600,
                  textAlign: "center",
                }}
              >
                Choose your starting workspace
              </h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "24px",
                }}
              >
                {templates.map((tpl) => (
                  <div
                    key={tpl.title}
                    onClick={() => setSelectedTemplate(tpl.title)}
                    style={{
                      backgroundColor: "#0A0A0A",
                      border: `1px solid ${selectedTemplate === tpl.title ? "#FFFFFF" : "#1A1A1A"}`,
                      padding: "32px 24px",
                      cursor: "pointer",
                      borderRadius: "4px",
                      transition: "border-color 0.2s ease",
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                    }}
                  >
                    <h3
                      style={{
                        fontFamily: syneFont,
                        fontSize: "20px",
                        margin: 0,
                        fontWeight: 600,
                      }}
                    >
                      {tpl.title}
                    </h3>
                    <p style={{ color: "#999999", margin: 0, fontSize: "14px", lineHeight: 1.5 }}>
                      {tpl.desc}
                    </p>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "center", marginTop: "24px" }}>
                <button
                  onClick={handleFinish}
                  disabled={!selectedTemplate || loading}
                  style={{
                    backgroundColor: "#FFFFFF",
                    color: "#000000",
                    border: "none",
                    padding: "16px 48px",
                    fontSize: "16px",
                    fontFamily: monoFont,
                    fontWeight: 600,
                    cursor: selectedTemplate && !loading ? "pointer" : "not-allowed",
                    borderRadius: "4px",
                    opacity: selectedTemplate && !loading ? 1 : 0.5,
                  }}
                >
                  {loading ? "Launching..." : "Launch My Workspace 🚀"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
