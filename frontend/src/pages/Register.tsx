import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  validateFullName,
  validateEmail,
  validatePhoneNumber,
  validatePassword,
  validateOrgName,
  validateLocationName,
  validateBusinessCategory,
  validateRequired,
} from "../lib/validation";
import {
  ShieldAlert,
  Building2,
  User,
  Mail,
  Phone,
  Lock,
  MapPin,
  Briefcase,
  Package,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

export default function Register() {
  const { register, loading, error: authError } = useAuth();
  const navigate = useNavigate();

  // Wizard Step State (1: Account Details, 2: Business Info)
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1: User Account Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [gender, setGender] = useState("Male");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Step 1 Errors
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<
    string | null
  >(null);

  // Step 2: Enterprise Business Form State
  const [orgName, setOrgName] = useState("");
  const [industry, setIndustry] = useState("Financial & Enterprise Services");
  const [businessType, setBusinessType] = useState(
    "Microfinance & Digital Lending",
  );
  const [district, setDistrict] = useState("Nyarugenge");
  const [sector, setSector] = useState("Nyarugenge");
  const [streetNumber, setStreetNumber] = useState("");
  const [productTypes, setProductTypes] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [description, setDescription] = useState("");

  // Step 2 Errors
  const [orgNameError, setOrgNameError] = useState<string | null>(null);
  const [industryError, setIndustryError] = useState<string | null>(null);
  const [businessTypeError, setBusinessTypeError] = useState<string | null>(
    null,
  );
  const [districtError, setDistrictError] = useState<string | null>(null);
  const [sectorError, setSectorError] = useState<string | null>(null);
  const [contactEmailError, setContactEmailError] = useState<string | null>(
    null,
  );
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  // Live Handlers for Step 1
  const handleNameChange = (val: string) => {
    setFullName(val);
    const res = validateFullName(val);
    setNameError(res.error);
  };

  const handleEmailChange = (val: string) => {
    setEmail(val);
    const res = validateEmail(val, true);
    setEmailError(res.error);
  };

  const handlePhoneChange = (val: string) => {
    setPhoneNumber(val);
    const res = validatePhoneNumber(val);
    setPhoneError(res.error);
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    const res = validatePassword(val);
    setPasswordError(res.error);
    if (confirmPassword && val !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
    } else if (confirmPassword && val === confirmPassword) {
      setConfirmPasswordError(null);
    }
  };

  const handleConfirmPasswordChange = (val: string) => {
    setConfirmPassword(val);
    if (val !== password) {
      setConfirmPasswordError("Passwords do not match.");
    } else {
      setConfirmPasswordError(null);
    }
  };

  // Live Handlers for Step 2
  const handleOrgNameChange = (val: string) => {
    setOrgName(val);
    const res = validateOrgName(val);
    setOrgNameError(res.error);
  };

  const handleIndustryChange = (val: string) => {
    setIndustry(val);
    const res = validateBusinessCategory(val, "Industry sector");
    setIndustryError(res.error);
  };

  const handleBusinessTypeChange = (val: string) => {
    setBusinessType(val);
    const res = validateBusinessCategory(val, "Type of business");
    setBusinessTypeError(res.error);
  };

  const handleDistrictChange = (val: string) => {
    setDistrict(val);
    const res = validateLocationName(val, "District");
    setDistrictError(res.error);
  };

  const handleSectorChange = (val: string) => {
    setSector(val);
    const res = validateLocationName(val, "Sector");
    setSectorError(res.error);
  };

  const handleContactEmailChange = (val: string) => {
    setContactEmail(val);
    const res = validateEmail(val, false);
    setContactEmailError(res.error);
  };

  const handleDescriptionChange = (val: string) => {
    setDescription(val);
    const res = validateRequired(val, "Business description", 10);
    setDescriptionError(res.error);
  };

  // Step 1 -> Step 2 Transition
  const handleContinueToStep2 = (e: React.FormEvent) => {
    e.preventDefault();

    const nRes = validateFullName(fullName);
    const eRes = validateEmail(email, true);
    const pRes = validatePhoneNumber(phoneNumber);
    const passRes = validatePassword(password);
    const match = password === confirmPassword;

    setNameError(nRes.error);
    setEmailError(eRes.error);
    setPhoneError(pRes.error);
    setPasswordError(passRes.error);
    if (!match) setConfirmPasswordError("Passwords do not match.");

    if (
      !nRes.isValid ||
      !eRes.isValid ||
      !pRes.isValid ||
      !passRes.isValid ||
      !match
    ) {
      return;
    }

    setServerError(null);
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Step 2 Submission
  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();

    const oRes = validateOrgName(orgName);
    const indRes = validateBusinessCategory(industry, "Industry sector");
    const bRes = validateBusinessCategory(businessType, "Type of business");
    const dRes = validateLocationName(district, "District");
    const sRes = validateLocationName(sector, "Sector");
    const cEmailRes = validateEmail(contactEmail, false);
    const descRes = validateRequired(description, "Business description", 10);

    setOrgNameError(oRes.error);
    setIndustryError(indRes.error);
    setBusinessTypeError(bRes.error);
    setDistrictError(dRes.error);
    setSectorError(sRes.error);
    setContactEmailError(cEmailRes.error);
    setDescriptionError(descRes.error);

    if (
      !oRes.isValid ||
      !indRes.isValid ||
      !bRes.isValid ||
      !dRes.isValid ||
      !sRes.isValid ||
      !cEmailRes.isValid ||
      !descRes.isValid
    ) {
      return;
    }

    setServerError(null);

    const payload = {
      fullName,
      email,
      phoneNumber,
      gender,
      password,
      organization: {
        name: orgName,
        industry,
        businessType,
        district,
        sector,
        streetNumber,
        productTypes,
        contactEmail,
        description,
      },
    };

    const success = await register(payload);
    if (success) {
      navigate("/dashboard");
    }
  };

  const hasStep1Errors = Boolean(
    nameError ||
      emailError ||
      phoneError ||
      passwordError ||
      confirmPasswordError,
  );
  const hasStep2Errors = Boolean(
    orgNameError ||
      industryError ||
      businessTypeError ||
      districtError ||
      sectorError ||
      contactEmailError ||
      descriptionError,
  );

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-10 sm:px-6 lg:px-8 text-on-surface">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center px-4 mb-6">
        <div className="w-13 h-13 rounded-2xl bg-secondary-container text-on-secondary-container flex items-center justify-center mx-auto shadow-lg mb-3">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-primary">
          ERIDSS Registration
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-on-surface-variant font-bold">
          Register New Organization & Officer Account
        </p>

        {/* Wizard Progress Indicator */}
        <div className="mt-5 max-w-md mx-auto">
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <span
              className={
                step === 1 ? "text-primary" : "text-on-surface-variant"
              }
            >
              1. Officer Account
            </span>
            <span
              className={
                step === 2 ? "text-primary" : "text-on-surface-variant"
              }
            >
              2. Enterprise Business
            </span>
          </div>
          <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden border border-outline-variant/60">
            <div
              className="bg-primary h-full transition-all duration-300 rounded-full"
              style={{ width: step === 1 ? "50%" : "100%" }}
            />
          </div>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl px-4">
        <div className="bg-surface-container-lowest py-7 px-6 sm:px-9 shadow-xl rounded-2xl border border-outline-variant">
          {(authError || serverError) && (
            <div className="mb-5 p-3.5 rounded-xl bg-error-container text-on-error-container text-xs font-bold flex items-center gap-2 border border-error/40 animate-in fade-in">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{authError || serverError}</span>
            </div>
          )}

          {/* STEP 1: USER ACCOUNT INFORMATION */}
          {step === 1 && (
            <form
              onSubmit={handleContinueToStep2}
              noValidate
              className="space-y-4 text-xs"
            >
              <div className="flex items-center gap-2 pb-2 border-b border-outline-variant">
                <User className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-black text-primary uppercase tracking-wide">
                  Step 1: Risk Officer Account Details
                </h3>
              </div>

              {/* Full Name */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-black uppercase tracking-wider text-primary text-[11px]">
                    Full Name <span className="text-secondary">*</span>
                  </label>
                  {nameError && (
                    <span className="text-[10px] font-bold text-red-500">
                      Invalid
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none transition-all ${
                      nameError
                        ? "border-2 border-red-500 bg-red-500/10 text-red-700 placeholder:text-red-300 focus:ring-2 focus:ring-red-400"
                        : "bg-surface-container-low border border-outline-variant text-primary focus:ring-2 focus:ring-primary"
                    }`}
                    placeholder="e.g. Jean Damascene"
                  />
                  <User
                    className={`w-4 h-4 absolute left-3 top-3 ${nameError ? "text-red-500" : "text-on-surface-variant"}`}
                  />
                </div>
                {nameError && (
                  <div className="mt-1.5 p-2 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-1.5 text-[11px] font-bold text-red-600 animate-in fade-in">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-600" />
                    <span>{nameError}</span>
                  </div>
                )}
              </div>

              {/* Corporate Email */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-black uppercase tracking-wider text-primary text-[11px]">
                    Email Address <span className="text-secondary">*</span>
                  </label>
                  {emailError && (
                    <span className="text-[10px] font-bold text-red-500">
                      Invalid
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none transition-all ${
                      emailError
                        ? "border-2 border-red-500 bg-red-500/10 text-red-700 placeholder:text-red-300 focus:ring-2 focus:ring-red-400"
                        : "bg-surface-container-low border border-outline-variant text-primary focus:ring-2 focus:ring-primary"
                    }`}
                    placeholder="e.g. officer@enterprise.rw"
                  />
                  <Mail
                    className={`w-4 h-4 absolute left-3 top-3 ${emailError ? "text-red-500" : "text-on-surface-variant"}`}
                  />
                </div>
                {emailError && (
                  <div className="mt-1.5 p-2 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-1.5 text-[11px] font-bold text-red-600 animate-in fade-in">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-600" />
                    <span>{emailError}</span>
                  </div>
                )}
              </div>

              {/* Phone & Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-black uppercase tracking-wider text-primary text-[11px]">
                      Phone Number
                    </label>
                    {phoneError && (
                      <span className="text-[10px] font-bold text-red-500">
                        Invalid
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none transition-all ${
                        phoneError
                          ? "border-2 border-red-500 bg-red-500/10 text-red-700 placeholder:text-red-300 focus:ring-2 focus:ring-red-400"
                          : "bg-surface-container-low border border-outline-variant text-primary focus:ring-2 focus:ring-primary"
                      }`}
                      placeholder="+250 788 123 456"
                    />
                    <Phone
                      className={`w-4 h-4 absolute left-3 top-3 ${phoneError ? "text-red-500" : "text-on-surface-variant"}`}
                    />
                  </div>
                  {phoneError && (
                    <div className="mt-1.5 p-2 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-1.5 text-[11px] font-bold text-red-600 animate-in fade-in">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-600" />
                      <span>{phoneError}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-black uppercase tracking-wider text-primary text-[11px] mb-1">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-xs font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-black uppercase tracking-wider text-primary text-[11px]">
                      Password <span className="text-secondary">*</span>
                    </label>
                    {passwordError && (
                      <span className="text-[10px] font-bold text-red-500">
                        Invalid
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none transition-all ${
                        passwordError
                          ? "border-2 border-red-500 bg-red-500/10 text-red-700 placeholder:text-red-300 focus:ring-2 focus:ring-red-400"
                          : "bg-surface-container-low border border-outline-variant text-primary focus:ring-2 focus:ring-primary"
                      }`}
                      placeholder="••••••••"
                    />
                    <Lock
                      className={`w-4 h-4 absolute left-3 top-3 ${passwordError ? "text-red-500" : "text-on-surface-variant"}`}
                    />
                  </div>
                  {passwordError && (
                    <p className="text-[10px] text-red-500 font-bold mt-1">
                      {passwordError}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-black uppercase tracking-wider text-primary text-[11px]">
                      Confirm Password <span className="text-secondary">*</span>
                    </label>
                    {confirmPasswordError && (
                      <span className="text-[10px] font-bold text-red-500">
                        Mismatch
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) =>
                        handleConfirmPasswordChange(e.target.value)
                      }
                      className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none transition-all ${
                        confirmPasswordError
                          ? "border-2 border-red-500 bg-red-500/10 text-red-700 placeholder:text-red-300 focus:ring-2 focus:ring-red-400"
                          : "bg-surface-container-low border border-outline-variant text-primary focus:ring-2 focus:ring-primary"
                      }`}
                      placeholder="••••••••"
                    />
                    <Lock
                      className={`w-4 h-4 absolute left-3 top-3 ${confirmPasswordError ? "text-red-500" : "text-on-surface-variant"}`}
                    />
                  </div>
                  {confirmPasswordError && (
                    <p className="text-[10px] text-red-500 font-bold mt-1">
                      {confirmPasswordError}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-outline-variant flex justify-end">
                <button
                  type="submit"
                  disabled={hasStep1Errors}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-xs font-bold text-on-primary bg-primary hover:bg-primary/90 disabled:opacity-50 transition-all cursor-pointer shadow-md"
                >
                  <span>Continue to Business Profile</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: ENTERPRISE BUSINESS INFORMATION */}
          {step === 2 && (
            <form
              onSubmit={handleSubmitRegistration}
              noValidate
              className="space-y-4 text-xs"
            >
              <div className="flex items-center gap-2 pb-2 border-b border-outline-variant">
                <Building2 className="w-4 h-4 text-secondary" />
                <h3 className="text-sm font-black text-primary uppercase tracking-wide">
                  Step 2: Enterprise Business Profile (Unique)
                </h3>
              </div>

              {/* Organization Legal / Trade Name */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-black uppercase tracking-wider text-primary text-[11px]">
                    Organization Legal / Trade Name{" "}
                    <span className="text-secondary">*</span>
                  </label>
                  {orgNameError && (
                    <span className="text-[10px] font-bold text-red-500">
                      Invalid
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  required
                  value={orgName}
                  onChange={(e) => handleOrgNameChange(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none transition-all ${
                    orgNameError
                      ? "border-2 border-red-500 bg-red-500/10 text-red-700 placeholder:text-red-300 focus:ring-2 focus:ring-red-400"
                      : "bg-surface-container-low border border-outline-variant text-primary focus:ring-2 focus:ring-primary"
                  }`}
                  placeholder="e.g. KIGALI MICROFINANCE PLC"
                />
                {orgNameError && (
                  <div className="mt-1.5 p-2 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-1.5 text-[11px] font-bold text-red-600 animate-in fade-in">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-600" />
                    <span>{orgNameError}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Industry Sector */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-black uppercase tracking-wider text-primary text-[11px]">
                      Industry Sector <span className="text-secondary">*</span>
                    </label>
                    {industryError && (
                      <span className="text-[10px] font-bold text-red-500">
                        Invalid
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    value={industry}
                    onChange={(e) => handleIndustryChange(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none transition-all ${
                      industryError
                        ? "border-2 border-red-500 bg-red-500/10 text-red-700 placeholder:text-red-300 focus:ring-2 focus:ring-red-400"
                        : "bg-surface-container-low border border-outline-variant text-primary focus:ring-2 focus:ring-primary"
                    }`}
                    placeholder="Financial & Enterprise Services"
                  />
                  {industryError && (
                    <p className="text-[10px] text-red-500 font-bold mt-1">
                      {industryError}
                    </p>
                  )}
                </div>

                {/* Type of Business */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-black uppercase tracking-wider text-primary text-[11px]">
                      Type of Business <span className="text-secondary">*</span>
                    </label>
                    {businessTypeError && (
                      <span className="text-[10px] font-bold text-red-500">
                        Invalid
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={businessType}
                      onChange={(e) => handleBusinessTypeChange(e.target.value)}
                      className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none transition-all ${
                        businessTypeError
                          ? "border-2 border-red-500 bg-red-500/10 text-red-700 placeholder:text-red-300 focus:ring-2 focus:ring-red-400"
                          : "bg-surface-container-low border border-outline-variant text-primary focus:ring-2 focus:ring-primary"
                      }`}
                      placeholder="Microfinance & Digital Lending"
                    />
                    <Briefcase
                      className={`w-4 h-4 absolute left-3 top-3 ${businessTypeError ? "text-red-500" : "text-on-surface-variant"}`}
                    />
                  </div>
                  {businessTypeError && (
                    <p className="text-[10px] text-red-500 font-bold mt-1">
                      {businessTypeError}
                    </p>
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant space-y-3">
                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-primary">
                  <MapPin className="w-3.5 h-3.5 text-secondary" />
                  <span>Business Location</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-on-surface mb-1">
                      District <span className="text-secondary">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={district}
                      onChange={(e) => handleDistrictChange(e.target.value)}
                      className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Nyarugenge"
                    />
                    {districtError && (
                      <p className="text-[10px] text-red-500 font-bold mt-0.5">
                        {districtError}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-on-surface mb-1">
                      Sector <span className="text-secondary">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={sector}
                      onChange={(e) => handleSectorChange(e.target.value)}
                      className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Nyarugenge"
                    />
                    {sectorError && (
                      <p className="text-[10px] text-red-500 font-bold mt-0.5">
                        {sectorError}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-on-surface mb-1">
                      Street (Optional)
                    </label>
                    <input
                      type="text"
                      value={streetNumber}
                      onChange={(e) => setStreetNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="KN 4 Ave, Plot 12"
                    />
                  </div>
                </div>
              </div>

              {/* Products & Compliance Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-black uppercase tracking-wider text-primary text-[11px] mb-1">
                    Products & Services
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={productTypes}
                      onChange={(e) => setProductTypes(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-xs font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="SME Loans, Savings, Payments"
                    />
                    <Package className="w-4 h-4 absolute left-3 top-3 text-on-surface-variant" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-black uppercase tracking-wider text-primary text-[11px]">
                      Compliance Email
                    </label>
                    {contactEmailError && (
                      <span className="text-[10px] font-bold text-red-500">
                        Invalid
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => handleContactEmailChange(e.target.value)}
                      className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none transition-all ${
                        contactEmailError
                          ? "border-2 border-red-500 bg-red-500/10 text-red-700 placeholder:text-red-300 focus:ring-2 focus:ring-red-400"
                          : "bg-surface-container-low border border-outline-variant text-primary focus:ring-2 focus:ring-primary"
                      }`}
                      placeholder="compliance@enterprise.rw"
                    />
                    <Mail
                      className={`w-4 h-4 absolute left-3 top-3 ${contactEmailError ? "text-red-500" : "text-on-surface-variant"}`}
                    />
                  </div>
                  {contactEmailError && (
                    <p className="text-[10px] text-red-500 font-bold mt-1">
                      {contactEmailError}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-black uppercase tracking-wider text-primary text-[11px]">
                    Operational Scope & Business Description{" "}
                    <span className="text-secondary">*</span>
                  </label>
                  {descriptionError && (
                    <span className="text-[10px] font-bold text-red-500">
                      Invalid
                    </span>
                  )}
                </div>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => handleDescriptionChange(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-medium focus:outline-none transition-all ${
                    descriptionError
                      ? "border-2 border-red-500 bg-red-500/10 text-red-700 placeholder:text-red-300 focus:ring-2 focus:ring-red-400"
                      : "bg-surface-container-low border border-outline-variant text-on-surface focus:ring-2 focus:ring-primary"
                  }`}
                  placeholder="Describe core business model, financial services, credit operations, and compliance scope..."
                />
                {descriptionError && (
                  <div className="mt-1.5 p-2 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-1.5 text-[11px] font-bold text-red-600 animate-in fade-in">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-600" />
                    <span>{descriptionError}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-outline-variant flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-primary bg-surface-container hover:bg-surface-container-high transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="submit"
                  disabled={loading || hasStep2Errors}
                  className="flex items-center gap-2 py-3 px-6 rounded-xl text-xs font-bold text-on-primary bg-primary hover:bg-primary/90 disabled:opacity-50 transition-all cursor-pointer shadow-md"
                >
                  {loading ? (
                    <span>Provisioning Organization...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Complete Registration & Launch</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Footer link to Login */}
          <div className="mt-6 pt-4 border-t border-outline-variant text-center">
            <p className="text-xs text-on-surface-variant font-medium">
              Already have an enterprise account?{" "}
              <Link
                to="/login"
                className="font-bold text-primary hover:underline"
              >
                Sign in to Risk Portal
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
