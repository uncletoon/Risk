import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import {
  validateFullName,
  validateEmail,
  validatePhoneNumber,
  validateOrgName,
  validateLocationName,
  validateBusinessCategory,
  validateRequired,
} from "../lib/validation";
import {
  Building2,
  Save,
  CheckCircle2,
  AlertCircle,
  User,
  Mail,
  Phone,
  UserCheck,
  MapPin,
  Briefcase,
  Package,
} from "lucide-react";

export default function OrganizationProfile() {
  const { user, updateCurrentUser } = useAuth();
  const [org, setOrg] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // User Information Form State
  const [fullName, setFullName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [gender, setGender] = useState("Male");

  // User Errors State
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [savingUser, setSavingUser] = useState(false);
  const [userSuccessMsg, setUserSuccessMsg] = useState<string | null>(null);

  // Organization Form State
  const [orgName, setOrgName] = useState("");
  const [industry, setIndustry] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [district, setDistrict] = useState("");
  const [sector, setSector] = useState("");
  const [streetNumber, setStreetNumber] = useState("");
  const [productTypes, setProductTypes] = useState("");
  const [description, setDescription] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  // Org Errors State
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
  const [savingOrg, setSavingOrg] = useState(false);
  const [orgSuccessMsg, setOrgSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, [user]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      if (user) {
        setFullName(user.full_name || "");
        setUserEmail(user.email || "");
        setPhoneNumber(user.phone_number || "");
        setGender(user.gender || "Male");
      }

      const orgs = await api.getOrganizations();
      if (orgs.length > 0) {
        const currentOrg =
          orgs.find((o) => o.id === user?.organization_id) || orgs[0];
        setOrg(currentOrg);
        setOrgName(currentOrg.name || "");
        setIndustry(currentOrg.industry || "Financial & Enterprise Services");
        setBusinessType(
          currentOrg.business_type || "Microfinance & Digital Lending",
        );
        setDistrict(currentOrg.district || "Nyarugenge");
        setSector(currentOrg.sector || "Nyarugenge");
        setStreetNumber(currentOrg.street_number || "");
        setProductTypes(currentOrg.product_types || "");
        setDescription(currentOrg.description || "");
        setContactEmail(currentOrg.contact_email || "");
      }
    } catch (err) {
      console.error("Failed to load profile details:", err);
    } finally {
      setLoading(false);
    }
  };

  // User Field Handlers with Live Validation
  const handleNameChange = (val: string) => {
    setFullName(val);
    const res = validateFullName(val);
    setNameError(res.error);
  };

  const handleEmailChange = (val: string) => {
    setUserEmail(val);
    const res = validateEmail(val, true);
    setEmailError(res.error);
  };

  const handlePhoneChange = (val: string) => {
    setPhoneNumber(val);
    const res = validatePhoneNumber(val);
    setPhoneError(res.error);
  };

  // Org Field Handlers with Live Validation
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

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();

    const nameRes = validateFullName(fullName);
    const emailRes = validateEmail(userEmail, true);
    const phoneRes = validatePhoneNumber(phoneNumber);

    setNameError(nameRes.error);
    setEmailError(emailRes.error);
    setPhoneError(phoneRes.error);

    if (!nameRes.isValid || !emailRes.isValid || !phoneRes.isValid) {
      return;
    }

    try {
      setSavingUser(true);
      setUserSuccessMsg(null);

      const updated = await api.updateUserProfile({
        full_name: fullName,
        email: userEmail,
        phone_number: phoneNumber,
        gender,
      });

      updateCurrentUser({
        full_name: updated.full_name,
        email: updated.email,
        phone_number: updated.phone_number,
        gender: updated.gender,
      });

      setUserSuccessMsg(
        "User information saved successfully. Your name and profile have been updated.",
      );
      setTimeout(() => setUserSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(`Error updating user information: ${err.message}`);
    } finally {
      setSavingUser(false);
    }
  };

  const handleSaveOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!org) return;

    const orgNameRes = validateOrgName(orgName);
    const industryRes = validateBusinessCategory(industry, "Industry sector");
    const bTypeRes = validateBusinessCategory(businessType, "Type of business");
    const districtRes = validateLocationName(district, "District");
    const sectorRes = validateLocationName(sector, "Sector");
    const emailRes = validateEmail(contactEmail, false);
    const descRes = validateRequired(description, "Business description", 10);

    setOrgNameError(orgNameRes.error);
    setIndustryError(industryRes.error);
    setBusinessTypeError(bTypeRes.error);
    setDistrictError(districtRes.error);
    setSectorError(sectorRes.error);
    setContactEmailError(emailRes.error);
    setDescriptionError(descRes.error);

    if (
      !orgNameRes.isValid ||
      !industryRes.isValid ||
      !bTypeRes.isValid ||
      !districtRes.isValid ||
      !sectorRes.isValid ||
      !emailRes.isValid ||
      !descRes.isValid
    ) {
      return;
    }

    try {
      setSavingOrg(true);
      setOrgSuccessMsg(null);

      const updated = await api.updateOrganization(org.id, {
        name: orgName,
        industry,
        business_type: businessType,
        district,
        sector,
        street_number: streetNumber,
        product_types: productTypes,
        description,
        contact_email: contactEmail,
      });

      setOrg(updated);
      updateCurrentUser({ organization_name: updated.name });

      setOrgSuccessMsg("Organization profile updated and synced successfully.");
      setTimeout(() => setOrgSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(`Error updating organization profile: ${err.message}`);
    } finally {
      setSavingOrg(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[350px] text-xs font-bold text-primary">
        Loading profile and enterprise information...
      </div>
    );
  }

  const hasUserErrors = Boolean(nameError || emailError || phoneError);
  const hasOrgErrors = Boolean(
    orgNameError ||
      industryError ||
      businessTypeError ||
      districtError ||
      sectorError ||
      contactEmailError ||
      descriptionError,
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Page Header */}
      <div className="bg-surface-container-lowest p-5 sm:p-6 rounded-2xl border border-outline-variant shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-primary tracking-tight">
                Business & User Profile Settings
              </h1>
              <p className="text-xs sm:text-sm text-on-surface-variant font-medium mt-0.5">
                Manage your account credentials and enterprise business
                parameters for AI risk extraction.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-center px-3 py-1.5 rounded-xl bg-surface-container border border-outline-variant/60 text-xs font-bold text-primary">
            <UserCheck className="w-4 h-4 text-secondary" />
            <span>Active: {user?.full_name || "Authenticated User"}</span>
          </div>
        </div>
      </div>

      {/* 1. USER INFORMATION SECTION */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5 px-1">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-black text-primary tracking-tight">
              User Information
            </h2>
            <p className="text-xs text-on-surface-variant">
              Manage personal identity and contact details displayed on
              assessments and audit logs.
            </p>
          </div>
        </div>

        {userSuccessMsg && (
          <div className="p-4 rounded-xl bg-tertiary-container/20 text-on-tertiary-container text-xs font-bold flex items-center gap-2 border border-tertiary-fixed-dim/40 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-secondary" />
            <span>{userSuccessMsg}</span>
          </div>
        )}

        <form
          onSubmit={handleSaveUser}
          noValidate
          className="bg-surface-container-lowest p-5 sm:p-6 rounded-2xl border border-outline-variant shadow-xs space-y-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-primary">
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
                  placeholder="e.g. Dr. Marcus Vance"
                />
                <User
                  className={`w-4 h-4 absolute left-3 top-3 ${nameError ? "text-red-500" : "text-on-surface-variant"}`}
                />
              </div>
              {nameError && (
                <div className="mt-1.5 p-2 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-1.5 text-xs font-bold text-red-600 animate-in fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-600" />
                  <span>{nameError}</span>
                </div>
              )}
            </div>

            {/* Email Address */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-primary">
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
                  value={userEmail}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none transition-all ${
                    emailError
                      ? "border-2 border-red-500 bg-red-500/10 text-red-700 placeholder:text-red-300 focus:ring-2 focus:ring-red-400"
                      : "bg-surface-container-low border border-outline-variant text-primary focus:ring-2 focus:ring-primary"
                  }`}
                  placeholder="e.g. marcus@eridss.com"
                />
                <Mail
                  className={`w-4 h-4 absolute left-3 top-3 ${emailError ? "text-red-500" : "text-on-surface-variant"}`}
                />
              </div>
              {emailError && (
                <div className="mt-1.5 p-2 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-1.5 text-xs font-bold text-red-600 animate-in fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-600" />
                  <span>{emailError}</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Phone Number */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-primary">
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
                  placeholder="e.g. +250 788 123 456"
                />
                <Phone
                  className={`w-4 h-4 absolute left-3 top-3 ${phoneError ? "text-red-500" : "text-on-surface-variant"}`}
                />
              </div>
              {phoneError && (
                <div className="mt-1.5 p-2 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-1.5 text-xs font-bold text-red-600 animate-in fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-600" />
                  <span>{phoneError}</span>
                </div>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-primary mb-1.5">
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

          <div className="flex justify-end pt-3 border-t border-outline-variant">
            <button
              type="submit"
              disabled={savingUser || hasUserErrors}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 disabled:opacity-50 transition-all cursor-pointer shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>
                {savingUser ? "Updating User Info..." : "Save User Information"}
              </span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. ENTERPRISE ORGANIZATION PROFILE SECTION */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5 px-1">
          <div className="w-8 h-8 rounded-lg bg-secondary/15 text-secondary flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-black text-primary tracking-tight">
              Enterprise Organization Profile
            </h2>
            <p className="text-xs text-on-surface-variant">
              Manage your business profile details used by Gemini AI during
              document extraction and risk contextualization.
            </p>
          </div>
        </div>

        {orgSuccessMsg && (
          <div className="p-4 rounded-xl bg-tertiary-container/20 text-on-tertiary-container text-xs font-bold flex items-center gap-2 border border-tertiary-fixed-dim/40 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-secondary" />
            <span>{orgSuccessMsg}</span>
          </div>
        )}

        <form
          onSubmit={handleSaveOrg}
          noValidate
          className="bg-surface-container-lowest p-5 sm:p-6 rounded-2xl border border-outline-variant shadow-xs space-y-5"
        >
          {/* Org Legal Name */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-primary">
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
              placeholder="e.g. MONEY KABUHARIWE"
            />
            {orgNameError && (
              <div className="mt-1.5 p-2 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-1.5 text-xs font-bold text-red-600 animate-in fade-in">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-600" />
                <span>{orgNameError}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Industry Sector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-primary">
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
                placeholder="e.g. Financial & Enterprise Services"
              />
              {industryError && (
                <div className="mt-1.5 p-2 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-1.5 text-xs font-bold text-red-600 animate-in fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-600" />
                  <span>{industryError}</span>
                </div>
              )}
            </div>

            {/* Type of Business */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-primary">
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
                  placeholder="e.g. Microfinance Institution, Digital Lending, Fintech"
                />
                <Briefcase
                  className={`w-4 h-4 absolute left-3 top-3 ${businessTypeError ? "text-red-500" : "text-on-surface-variant"}`}
                />
              </div>
              {businessTypeError && (
                <div className="mt-1.5 p-2 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-1.5 text-xs font-bold text-red-600 animate-in fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-600" />
                  <span>{businessTypeError}</span>
                </div>
              )}
            </div>
          </div>

          {/* Location Details */}
          <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/60 space-y-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-primary">
              <MapPin className="w-4 h-4 text-secondary" />
              <span>Business Location</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* District */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-on-surface">
                    District <span className="text-secondary">*</span>
                  </label>
                  {districtError && (
                    <span className="text-[10px] font-bold text-red-500">
                      Invalid
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  required
                  value={district}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg text-xs font-semibold focus:outline-none transition-all ${
                    districtError
                      ? "border-2 border-red-500 bg-red-500/10 text-red-700 placeholder:text-red-300 focus:ring-2 focus:ring-red-400"
                      : "bg-surface-container-lowest border border-outline-variant text-primary focus:ring-2 focus:ring-primary"
                  }`}
                  placeholder="e.g. Nyarugenge"
                />
                {districtError && (
                  <p className="text-[10px] text-red-500 font-bold mt-1">
                    {districtError}
                  </p>
                )}
              </div>

              {/* Sector */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-on-surface">
                    Sector <span className="text-secondary">*</span>
                  </label>
                  {sectorError && (
                    <span className="text-[10px] font-bold text-red-500">
                      Invalid
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  required
                  value={sector}
                  onChange={(e) => handleSectorChange(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg text-xs font-semibold focus:outline-none transition-all ${
                    sectorError
                      ? "border-2 border-red-500 bg-red-500/10 text-red-700 placeholder:text-red-300 focus:ring-2 focus:ring-red-400"
                      : "bg-surface-container-lowest border border-outline-variant text-primary focus:ring-2 focus:ring-primary"
                  }`}
                  placeholder="e.g. Nyarugenge"
                />
                {sectorError && (
                  <p className="text-[10px] text-red-500 font-bold mt-1">
                    {sectorError}
                  </p>
                )}
              </div>

              {/* Street Number */}
              <div>
                <label className="block text-[11px] font-bold text-on-surface mb-1">
                  Street Number{" "}
                  <span className="text-on-surface-variant font-normal">
                    (Optional)
                  </span>
                </label>
                <input
                  type="text"
                  value={streetNumber}
                  onChange={(e) => setStreetNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. KN 4 Ave, Plot 12"
                />
              </div>
            </div>
          </div>

          {/* Type of Products / Services */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-primary mb-1.5">
              Type of Products / Services Provided
            </label>
            <div className="relative">
              <input
                type="text"
                value={productTypes}
                onChange={(e) => setProductTypes(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-xs font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g. Micro-loans, SME Working Capital, Savings Accounts, Digital Payments"
              />
              <Package className="w-4 h-4 text-on-surface-variant absolute left-3 top-3" />
            </div>
          </div>

          {/* Risk & Compliance Contact Email */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-primary">
                Risk & Compliance Contact Email
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
                placeholder="e.g. compliance@moneykabuhariwe.rw"
              />
              <Mail
                className={`w-4 h-4 absolute left-3 top-3 ${contactEmailError ? "text-red-500" : "text-on-surface-variant"}`}
              />
            </div>
            {contactEmailError && (
              <div className="mt-1.5 p-2 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-1.5 text-xs font-bold text-red-600 animate-in fade-in">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-600" />
                <span>{contactEmailError}</span>
              </div>
            )}
          </div>

          {/* Operational Scope & Business Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-primary">
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
              rows={4}
              required
              value={description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-medium focus:outline-none transition-all ${
                descriptionError
                  ? "border-2 border-red-500 bg-red-500/10 text-red-700 placeholder:text-red-300 focus:ring-2 focus:ring-red-400"
                  : "bg-surface-container-low border border-outline-variant text-on-surface focus:ring-2 focus:ring-primary"
              }`}
              placeholder="Describe lines of business, digital infrastructure, operational models, and key risk boundaries..."
            />
            {descriptionError && (
              <div className="mt-1.5 p-2 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-1.5 text-xs font-bold text-red-600 animate-in fade-in">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-600" />
                <span>{descriptionError}</span>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-3 border-t border-outline-variant">
            <button
              type="submit"
              disabled={savingOrg || hasOrgErrors}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 disabled:opacity-50 transition-all cursor-pointer shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>
                {savingOrg
                  ? "Updating Profile..."
                  : "Save Organization Profile"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
