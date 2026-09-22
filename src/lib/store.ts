"use client";

import { create } from "zustand";
import type {
  Application,
  Document,
  User,
  AuditEntry,
  ApplicationStatus,
  SchemeId,
  FormStepData,
} from "./types";
import {
  mockApplications,
  mockDocuments,
  mockAuditTrail,
} from "./data/mock-data";

interface DemoMode {
  enabled: boolean;
  scenario: "valid_nos" | "deficient" | "nfst_pvtg" | null;
}

interface AppState {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;

  applications: Application[];
  setApplications: (apps: Application[]) => void;
  updateApplicationStatus: (appId: string, status: ApplicationStatus) => void;

  documents: Document[];
  setDocuments: (docs: Document[]) => void;
  addDocument: (doc: Document) => void;
  removeDocument: (docId: string) => void;

  auditTrail: AuditEntry[];
  addAuditEntry: (entry: Omit<AuditEntry, "id" | "timestamp">) => void;

  demoMode: DemoMode;
  setDemoMode: (mode: DemoMode) => void;
  loadValidNosScenario: () => void;
  loadDeficientScenario: () => void;
  loadNfstPvtgScenario: () => void;
  resetDemo: () => void;

  selectedApplication: Application | null;
  setSelectedApplication: (app: Application | null) => void;
  reviewDrawerOpen: boolean;
  setReviewDrawerOpen: (open: boolean) => void;

  deficiencyDrawerOpen: boolean;
  setDeficiencyDrawerOpen: (open: boolean) => void;
  deficiencyApplicationId: string | null;
  setDeficiencyApplicationId: (id: string | null) => void;

  formStep: number;
  setFormStep: (step: number) => void;
  selectedScheme: SchemeId | null;
  setSelectedScheme: (scheme: SchemeId | null) => void;
  formData: FormStepData;
  setFormData: (data: Partial<FormStepData>) => void;
  submitApplication: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),

  applications: mockApplications,
  setApplications: (apps) => set({ applications: apps }),
  updateApplicationStatus: (appId, status) => {
    const state = get();
    const app = state.applications.find((a) => a.id === appId);
    set((s) => ({
      applications: s.applications.map((a) =>
        a.id === appId
          ? { ...a, status, updated_at: new Date().toISOString() }
          : a
      ),
    }));
    if (app) {
      const label =
        status === "official_approved"
          ? "Approved by official"
          : status === "deficiency_flagged"
            ? "Deficiency raised â€” student notified"
            : status === "disbursed"
              ? "Fund disbursal sanctioned"
              : `Status changed to ${status}`;
      get().addAuditEntry({
        application_id: appId,
        action: label,
        performed_by: "Dr. Meera Nair",
        notes: `Application ${app.application_no} â€” ${app.scheme_id}`,
      });
    }
  },

  documents: mockDocuments,
  setDocuments: (docs) => set({ documents: docs }),
  addDocument: (doc) =>
    set((state) => ({ documents: [...state.documents, doc] })),
  removeDocument: (docId) =>
    set((state) => ({
      documents: state.documents.filter((d) => d.id !== docId),
    })),

  auditTrail: mockAuditTrail,
  addAuditEntry: (entry) =>
    set((state) => ({
      auditTrail: [
        {
          ...entry,
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
        },
        ...state.auditTrail,
      ],
    })),

  demoMode: { enabled: false, scenario: null },
  setDemoMode: (mode) => set({ demoMode: mode }),

  loadValidNosScenario: () => {
    const validDocs: Document[] = [
      {
        id: "demo-doc-v1",
        application_id: "demo-app-1",
        doc_type: "income_cert",
        file_name: "Income_Certificate_2025.pdf",
        file_url: "/docs/income_cert.pdf",
        quality_score: 95,
        ocr_extracted_payload: {
          applicant_name: "Vivek Verma",
          gross_annual_income: 320000,
          issue_date: "2025-04-15",
          issuing_authority: "District Magistrate, Bhopal",
        },
        is_valid: true,
        defect_reason: null,
      },
      {
        id: "demo-doc-v2",
        application_id: "demo-app-1",
        doc_type: "caste_cert",
        file_name: "Caste_Certificate_Gond.pdf",
        file_url: "/docs/caste_cert.pdf",
        quality_score: 96,
        ocr_extracted_payload: {
          applicant_name: "Vivek Verma",
          certificate_no: "CC-MP-2024-11023",
          tribal_group: "Gond",
        },
        is_valid: true,
        defect_reason: null,
      },
      {
        id: "demo-doc-v3",
        application_id: "demo-app-1",
        doc_type: "admission_letter",
        file_name: "Admission_Letter_Melbourne.pdf",
        file_url: "/docs/admission.pdf",
        quality_score: 98,
        ocr_extracted_payload: {
          applicant_name: "Vivek Verma",
          institution_name: "University of Melbourne",
          course_type: "Masters",
        },
        is_valid: true,
        defect_reason: null,
      },
      {
        id: "demo-doc-v4",
        application_id: "demo-app-1",
        doc_type: "qs_rank_proof",
        file_name: "QS_Ranking_Melbourne.pdf",
        file_url: "/docs/qs_rank.pdf",
        quality_score: 93,
        ocr_extracted_payload: {
          institution_name: "University of Melbourne",
          qs_ranking: 13,
        },
        is_valid: true,
        defect_reason: null,
      },
    ];

    const validApp: Application = {
      id: "demo-app-1",
      user_id: "user-1",
      scheme_id: "NOS",
      application_no: "NOS/2025/DEMO1",
      status: "ai_verified",
      ai_confidence_score: 96,
      annual_income: 320000,
      age: 27,
      qualifying_marks: 78,
      university_name: "University of Melbourne",
      course_type: "Masters",
      net_qualification: null,
      applicant_name: "Vivek Verma",
      email: "priya.sharma@email.com",
      created_at: "2025-07-01T10:00:00Z",
      updated_at: new Date().toISOString(),
    };

    set({
      documents: validDocs,
      applications: [
        validApp,
        ...get().applications.filter((a) => a.id !== "demo-app-1"),
      ],
      demoMode: { enabled: true, scenario: "valid_nos" },
    });
  },

  loadDeficientScenario: () => {
    const flaggedDocs: Document[] = [
      {
        id: "demo-doc-d1",
        application_id: "demo-app-2",
        doc_type: "income_cert",
        file_name: "Income_Certificate_BLURRY.jpg",
        file_url: "/docs/income_blur.jpg",
        quality_score: 22,
        ocr_extracted_payload: {
          applicant_name: "Jalaj Sharma",
          gross_annual_income: 850000,
          issue_date: "2023-03-28",
          issuing_authority: "SDM Office, Ranchi",
        },
        is_valid: false,
        defect_reason:
          "Image too blurry or low contrast. Upload a clear, flat scan. Ensure all four corners are visible and text is readable at 300 DPI.",
      },
      {
        id: "demo-doc-d2",
        application_id: "demo-app-2",
        doc_type: "caste_cert",
        file_name: "Caste_Certificate_MISMATCH.pdf",
        file_url: "/docs/caste_mismatch.pdf",
        quality_score: 78,
        ocr_extracted_payload: {
          applicant_name: "Jalaj Kumar",
          certificate_no: "CC-JH-2024-8842",
          tribal_group: "Santhal",
        },
        is_valid: false,
        defect_reason:
          'Name mismatch: profile says "Jalaj Sharma" but certificate shows "Jalaj Kumar". Ensure all documents use the exact name as on your profile.',
      },
    ];

    const flaggedApp: Application = {
      id: "demo-app-2",
      user_id: "user-2",
      scheme_id: "NOS",
      application_no: "NOS/2025/DEMO2",
      status: "deficiency_flagged",
      ai_confidence_score: 28,
      annual_income: 850000,
      age: 26,
      qualifying_marks: 62,
      university_name: "Ranchi University",
      course_type: "Masters",
      net_qualification: null,
      applicant_name: "Jalaj Sharma",
      email: "rahul.k@email.com",
      created_at: "2025-07-15T14:30:00Z",
      updated_at: new Date().toISOString(),
    };

    set({
      documents: flaggedDocs,
      applications: [
        flaggedApp,
        ...get().applications.filter((a) => a.id !== "demo-app-2"),
      ],
      demoMode: { enabled: true, scenario: "deficient" },
    });
  },

  loadNfstPvtgScenario: () => {
    const nfstDocs: Document[] = [
      {
        id: "demo-doc-n1",
        application_id: "demo-app-3",
        doc_type: "caste_cert",
        file_name: "Caste_Cert_Oraon_PVTG.pdf",
        file_url: "/docs/caste_pvtg.pdf",
        quality_score: 94,
        ocr_extracted_payload: {
          applicant_name: "Anushka",
          certificate_no: "CC-JH-2023-5501",
          tribal_group: "Oraon (PVTG)",
        },
        is_valid: true,
        defect_reason: null,
      },
      {
        id: "demo-doc-n2",
        application_id: "demo-app-3",
        doc_type: "net_scorecard",
        file_name: "UGC_NET_Scorecard_JRF.pdf",
        file_url: "/docs/net_score.pdf",
        quality_score: 97,
        ocr_extracted_payload: {
          applicant_name: "Anushka",
          net_roll_no: "NET2024-78451",
          net_score: "JRF Qualified â€” Rank 42",
          qualifying_exam: "UGC-NET",
        },
        is_valid: true,
        defect_reason: null,
      },
      {
        id: "demo-doc-n3",
        application_id: "demo-app-3",
        doc_type: "admission_letter",
        file_name: "PhD_Admission_JNU.pdf",
        file_url: "/docs/phd_jnu.pdf",
        quality_score: 95,
        ocr_extracted_payload: {
          applicant_name: "Anushka",
          institution_name: "Jawaharlal Nehru University",
          course_type: "Ph.D",
        },
        is_valid: true,
        defect_reason: null,
      },
    ];

    const nfstApp: Application = {
      id: "demo-app-3",
      user_id: "user-3",
      scheme_id: "NFST",
      application_no: "NFST/2025/DEMO1",
      status: "ai_verified",
      ai_confidence_score: 97,
      annual_income: null,
      age: 29,
      qualifying_marks: 82,
      university_name: "Jawaharlal Nehru University",
      course_type: "Ph.D",
      net_qualification: "UGC-NET 2024 â€” JRF",
      applicant_name: "Anushka",
      email: "lakshmi.o@email.com",
      created_at: "2025-06-20T09:00:00Z",
      updated_at: new Date().toISOString(),
    };

    set({
      documents: nfstDocs,
      applications: [
        nfstApp,
        ...get().applications.filter((a) => a.id !== "demo-app-3"),
      ],
      demoMode: { enabled: true, scenario: "nfst_pvtg" },
    });
  },

  resetDemo: () => {
    set({
      documents: mockDocuments,
      applications: mockApplications,
      demoMode: { enabled: false, scenario: null },
      selectedApplication: null,
      reviewDrawerOpen: false,
    });
  },

  selectedApplication: null,
  setSelectedApplication: (app) => set({ selectedApplication: app }),
  reviewDrawerOpen: false,
  setReviewDrawerOpen: (open) => set({ reviewDrawerOpen: open }),

  deficiencyDrawerOpen: false,
  setDeficiencyDrawerOpen: (open) => set({ deficiencyDrawerOpen: open }),
  deficiencyApplicationId: null,
  setDeficiencyApplicationId: (id) => set({ deficiencyApplicationId: id }),

  formStep: 0,
  setFormStep: (step) => set({ formStep: step }),
  selectedScheme: null,
  setSelectedScheme: (scheme) => set({ selectedScheme: scheme }),
  formData: {
    personal: {
      full_name: "",
      email: "",
      phone: "",
      date_of_birth: "",
      st_caste_name: "",
      pvtg_status: false,
    },
    educational: {
      qualifying_marks: 0,
      university_name: "",
      course_type: "",
      net_roll_no: "",
      net_score: "",
      qs_ranking: null,
    },
    documents: {
      uploaded: [],
    },
  },
  setFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data } as FormStepData,
    })),
  submitApplication: () => {
    const state = get();
    const newApp: Application = {
      id: `app-new-${Date.now()}`,
      user_id: "user-1",
      scheme_id: state.selectedScheme || "NOS",
      application_no: `${state.selectedScheme || "NOS"}/2025/${String(Math.floor(Math.random() * 99999) + 1).padStart(5, "0")}`,
      status: "submitted",
      ai_confidence_score: 0,
      annual_income: state.formData.personal.pvtg_status ? null : 320000,
      age: 27,
      qualifying_marks: state.formData.educational.qualifying_marks || 78,
      university_name: state.formData.educational.university_name || "University",
      course_type: state.formData.educational.course_type || "Masters",
      net_qualification: state.formData.educational.net_roll_no || null,
      applicant_name: state.formData.personal.full_name || "Student",
      email: state.formData.personal.email || "student@email.com",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    set((s) => ({
      applications: [newApp, ...s.applications],
    }));
    get().addAuditEntry({
      application_id: newApp.id,
      action: "Application submitted",
      performed_by: state.formData.personal.full_name || "Student",
      notes: `${newApp.scheme_id} application â€” ${newApp.university_name}`,
    });
  },
}));
