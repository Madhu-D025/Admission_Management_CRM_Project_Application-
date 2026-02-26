import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
const config = require("../../services/config.json");

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const extractArray = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.result)) return data.result;
  return [];
};

const formatTime = (date) =>
  date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

const formatDate = (date) =>
  date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

// ─────────────────────────────────────────────────────────────────────────────
// INLINE STYLES — executive design system
// ─────────────────────────────────────────────────────────────────────────────
const styles = {
  // Layout
  page: {
    background: "#f0f2f5",
    minHeight: "100vh",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    padding: "0",
  },
  // Header
  header: {
    background: "linear-gradient(135deg, #0f2044 0%, #1a3a6e 60%, #1e4d8c 100%)",
    padding: "20px 28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "16px",
    boxShadow: "0 4px 20px rgba(15,32,68,0.35)",
  },
  headerLeft: {
    display: "flex",
    flexDirection: "column",
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: "22px",
    fontWeight: "700",
    margin: 0,
    letterSpacing: "-0.3px",
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.65)",
    fontSize: "12px",
    marginTop: "2px",
    fontWeight: "400",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  },
  headerCenter: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  filterSelect: {
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.25)",
    borderRadius: "8px",
    color: "#ffffff",
    padding: "7px 12px",
    fontSize: "13px",
    outline: "none",
    cursor: "pointer",
    minWidth: "160px",
    backdropFilter: "blur(4px)",
  },
  headerRight: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
  },
  refreshLabel: {
    color: "rgba(255,255,255,0.5)",
    fontSize: "10px",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    marginBottom: "2px",
  },
  refreshTime: {
    color: "#7dd3fc",
    fontSize: "13px",
    fontWeight: "600",
  },
  // Content
  content: {
    padding: "24px 28px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  // KPI Cards
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "16px",
  },
  kpiCard: (color) => ({
    background: "#ffffff",
    borderRadius: "12px",
    padding: "20px",
    display: "flex",
    alignItems: "flex-start",
    gap: "14px",
    boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
    borderLeft: `4px solid ${color}`,
    transition: "box-shadow 0.2s",
  }),
  kpiIconWrap: (bg) => ({
    width: "44px",
    height: "44px",
    borderRadius: "10px",
    background: bg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  }),
  kpiIcon: (color) => ({
    fontSize: "20px",
    color: color,
  }),
  kpiBody: {
    flex: 1,
  },
  kpiNumber: (color) => ({
    fontSize: "28px",
    fontWeight: "800",
    color: color,
    lineHeight: 1,
    marginBottom: "4px",
  }),
  kpiLabel: {
    fontSize: "12px",
    color: "#6b7280",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  // Section cards
  sectionCard: {
    background: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
    overflow: "hidden",
  },
  sectionHeader: {
    padding: "16px 20px",
    borderBottom: "1px solid #f0f0f0",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  sectionIcon: (color) => ({
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    background: color,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }),
  sectionTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#111827",
    margin: 0,
  },
  sectionBody: {
    padding: "20px",
  },
  // Two column
  twoCol: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
  },
  // Table
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "13px",
  },
  th: {
    background: "#f8fafc",
    padding: "10px 14px",
    textAlign: "left",
    fontSize: "11px",
    fontWeight: "700",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.6px",
    borderBottom: "1px solid #e5e7eb",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "10px 14px",
    borderBottom: "1px solid #f3f4f6",
    color: "#374151",
    fontSize: "13px",
  },
  tdHighlight: {
    padding: "10px 14px",
    borderBottom: "1px solid #f3f4f6",
    color: "#374151",
    fontSize: "13px",
    background: "#fff7f7",
  },
  // Badges
  badge: (bg, color) => ({
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "600",
    background: bg,
    color: color,
    letterSpacing: "0.3px",
  }),
  // Loading skeleton
  skeleton: {
    background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.5s infinite",
    borderRadius: "6px",
    height: "20px",
    margin: "4px 0",
  },
  // Empty state
  emptyState: {
    padding: "40px",
    textAlign: "center",
    color: "#9ca3af",
    fontSize: "13px",
  },
  // Error state
  errorState: {
    padding: "20px",
    background: "#fef2f2",
    borderRadius: "8px",
    color: "#dc2626",
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  // Progress bar
  progressBar: (pct, color) => ({
    height: "6px",
    borderRadius: "3px",
    background: "#e5e7eb",
    marginTop: "8px",
    overflow: "hidden",
  }),
  progressFill: (pct, color) => ({
    height: "100%",
    width: `${Math.min(pct, 100)}%`,
    background: color,
    borderRadius: "3px",
    transition: "width 0.8s ease",
  }),
};

// ─────────────────────────────────────────────────────────────────────────────
// BADGE HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const SeatStatusBadge = ({ remaining }) => {
  if (remaining > 50)
    return <span style={styles.badge("#dcfce7", "#16a34a")}>Available</span>;
  if (remaining >= 10)
    return <span style={styles.badge("#fff7ed", "#c2410c")}>Almost Full</span>;
  return <span style={styles.badge("#fee2e2", "#dc2626")}>Full</span>;
};

const DocumentStatusBadge = ({ status }) => {
  if (status === "Submitted")
    return <span style={styles.badge("#fef9c3", "#ca8a04")}>Submitted</span>;
  if (status === "Verified")
    return <span style={styles.badge("#dcfce7", "#16a34a")}>Verified</span>;
  return <span style={styles.badge("#f3f4f6", "#6b7280")}>{status}</span>;
};

const FeeStatusBadge = ({ status }) => {
  if (status === "Pending")
    return <span style={styles.badge("#fee2e2", "#dc2626")}>Pending</span>;
  if (status === "Paid")
    return <span style={styles.badge("#dcfce7", "#16a34a")}>Paid</span>;
  return <span style={styles.badge("#f3f4f6", "#6b7280")}>{status}</span>;
};

// ─────────────────────────────────────────────────────────────────────────────
// SKELETON LOADER
// ─────────────────────────────────────────────────────────────────────────────
const SkeletonRows = ({ rows = 4, cols = 4 }) => (
  <tbody>
    {Array.from({ length: rows }).map((_, i) => (
      <tr key={i}>
        {Array.from({ length: cols }).map((_, j) => (
          <td key={j} style={styles.td}>
            <div style={{ ...styles.skeleton, width: `${60 + Math.random() * 30}%` }} />
          </td>
        ))}
      </tr>
    ))}
  </tbody>
);

const KpiSkeleton = () => (
  <div style={styles.kpiGrid}>
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} style={styles.kpiCard("#e5e7eb")}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: "#f3f4f6" }} />
        <div style={{ flex: 1 }}>
          <div style={{ ...styles.skeleton, width: "60%", height: 28 }} />
          <div style={{ ...styles.skeleton, width: "80%", marginTop: 8 }} />
        </div>
      </div>
    ))}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// ERROR BANNER
// ─────────────────────────────────────────────────────────────────────────────
const ErrorBanner = ({ message }) => (
  <div style={styles.errorState}>
    <i className="fas fa-exclamation-circle" />
    {message || "Failed to load data. Please try again."}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOM RECHARTS TOOLTIP
// ─────────────────────────────────────────────────────────────────────────────
const QuotaTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const filled    = payload.find((p) => p.dataKey === "filledSeats")?.value ?? 0;
  const remaining = payload.find((p) => p.dataKey === "remainingQuota")?.value ?? 0;
  return (
    <div style={{
      background: "#fff", border: "1px solid #e5e7eb",
      borderRadius: 8, padding: "10px 14px", fontSize: 12,
      boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
    }}>
      <p style={{ fontWeight: 700, marginBottom: 6, color: "#111827" }}>{label}</p>
      <p style={{ color: "#16a34a", margin: "2px 0" }}>Filled: <b>{filled}</b></p>
      <p style={{ color: "#ea580c", margin: "2px 0" }}>Remaining: <b>{remaining}</b></p>
      <p style={{ color: "#6b7280", margin: "2px 0", borderTop: "1px solid #f0f0f0", paddingTop: 4, marginTop: 4 }}>
        Total: <b>{filled + remaining}</b>
      </p>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN DASHBOARD COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function ManagementDashboard() {
  const personalInfo = useSelector((state) => state.personalInformationReducer);

  // ── Filter state ──────────────────────────────────────────────────────────
  const [selectedYear,    setSelectedYear]    = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [academicYears,   setAcademicYears]   = useState([]);
  const [programs,        setPrograms]        = useState([]);

  // ── API data state ────────────────────────────────────────────────────────
  const [kpiData,          setKpiData]          = useState(null);
  const [quotaData,        setQuotaData]        = useState([]);
  const [remainingSeats,   setRemainingSeats]   = useState([]);
  const [pendingDocs,      setPendingDocs]      = useState([]);
  const [feePending,       setFeePending]       = useState([]);

  // ── Loading state per section ─────────────────────────────────────────────
  const [loading, setLoading] = useState({
    kpi: true, quota: true, seats: true, docs: true, fees: true,
  });

  // ── Error state per section ───────────────────────────────────────────────
  const [errors, setErrors] = useState({
    kpi: null, quota: null, seats: null, docs: null, fees: null,
  });

  // ── Last refreshed ────────────────────────────────────────────────────────
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  // ─── Filter dropdown sources ──────────────────────────────────────────────
  useEffect(() => {
    fetchFilterSources();
  }, []);

  const fetchFilterSources = async () => {
    try {
      const [yearRes, progRes] = await Promise.allSettled([
        axios.get(`${config.API_URL}MasterController/GetAllAcademicYear`),
        axios.get(`${config.API_URL}MasterController/GetAllProgramBranch`),
      ]);
      if (yearRes.status === "fulfilled" && yearRes.value.data.success)
        setAcademicYears(extractArray(yearRes.value.data.data));
      if (progRes.status === "fulfilled" && progRes.value.data.success) {
        const raw = progRes.value.data.data;
        setPrograms(Array.isArray(raw?.result) ? raw.result : extractArray(raw));
      }
    } catch (_) {}
  };

  // ─── Core data fetchers ───────────────────────────────────────────────────
  const buildParams = () => {
    const params = {};
    if (selectedYear)    params.academicYearId = selectedYear;
    if (selectedProgram) params.programId      = selectedProgram;
    return params;
  };

  const fetchKpi = useCallback(async () => {
    setLoading((p) => ({ ...p, kpi: true }));
    setErrors((p)  => ({ ...p, kpi: null }));
    try {
      const res = await axios.get(
        `${config.API_URL}Management/GetTotalIntakeVsAdmitted`,
        { params: buildParams() }
      );
      if (res.data.success) {
        const d = res.data.data?.result ?? res.data.data;
        setKpiData(d);
      } else {
        setErrors((p) => ({ ...p, kpi: res.data.message }));
      }
    } catch (err) {
      setErrors((p) => ({ ...p, kpi: "Failed to load KPI data" }));
    } finally {
      setLoading((p) => ({ ...p, kpi: false }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear, selectedProgram]);

  const fetchQuota = useCallback(async () => {
    setLoading((p) => ({ ...p, quota: true }));
    setErrors((p)  => ({ ...p, quota: null }));
    try {
      const res = await axios.get(
        `${config.API_URL}Management/GetQuotaWiseSeatStatus`,
        { params: buildParams() }
      );
      if (res.data.success) {
        setQuotaData(extractArray(res.data.data?.result ?? res.data.data));
      } else {
        setErrors((p) => ({ ...p, quota: res.data.message }));
      }
    } catch {
      setErrors((p) => ({ ...p, quota: "Failed to load quota data" }));
    } finally {
      setLoading((p) => ({ ...p, quota: false }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear, selectedProgram]);

  const fetchSeats = useCallback(async () => {
    setLoading((p) => ({ ...p, seats: true }));
    setErrors((p)  => ({ ...p, seats: null }));
    try {
      const res = await axios.get(
        `${config.API_URL}Management/GetRemainingSeats`,
        { params: buildParams() }
      );
      if (res.data.success) {
        setRemainingSeats(extractArray(res.data.data?.result ?? res.data.data));
      } else {
        setErrors((p) => ({ ...p, seats: res.data.message }));
      }
    } catch {
      setErrors((p) => ({ ...p, seats: "Failed to load seat data" }));
    } finally {
      setLoading((p) => ({ ...p, seats: false }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear, selectedProgram]);

  const fetchDocs = useCallback(async () => {
    setLoading((p) => ({ ...p, docs: true }));
    setErrors((p)  => ({ ...p, docs: null }));
    try {
      const res = await axios.get(
        `${config.API_URL}Management/GetApplicantsWithPendingDocuments`,
        { params: buildParams() }
      );
      if (res.data.success) {
        setPendingDocs(extractArray(res.data.data?.result ?? res.data.data));
      } else {
        setErrors((p) => ({ ...p, docs: res.data.message }));
      }
    } catch {
      setErrors((p) => ({ ...p, docs: "Failed to load document data" }));
    } finally {
      setLoading((p) => ({ ...p, docs: false }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear, selectedProgram]);

  const fetchFees = useCallback(async () => {
    setLoading((p) => ({ ...p, fees: true }));
    setErrors((p)  => ({ ...p, fees: null }));
    try {
      const res = await axios.get(
        `${config.API_URL}Management/GetFeePendingApplicants`,
        { params: buildParams() }
      );
      if (res.data.success) {
        setFeePending(extractArray(res.data.data?.result ?? res.data.data));
      } else {
        setErrors((p) => ({ ...p, fees: res.data.message }));
      }
    } catch {
      setErrors((p) => ({ ...p, fees: "Failed to load fee data" }));
    } finally {
      setLoading((p) => ({ ...p, fees: false }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear, selectedProgram]);

  // ─── Load all data on filter change ──────────────────────────────────────
  const loadAll = useCallback(() => {
    Promise.all([fetchKpi(), fetchQuota(), fetchSeats(), fetchDocs(), fetchFees()]);
    setLastRefreshed(new Date());
  }, [fetchKpi, fetchQuota, fetchSeats, fetchDocs, fetchFees]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // ─── KPI Derived Metrics ──────────────────────────────────────────────────
  const admissionPct = useMemo(() => {
    if (!kpiData?.totalIntake || kpiData.totalIntake === 0) return 0;
    return ((kpiData.totalAdmitted / kpiData.totalIntake) * 100).toFixed(1);
  }, [kpiData]);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={styles.page}>
      {/* ── HEADER ── */}
      <div style={styles.header}>
        {/* Left */}
        <div style={styles.headerLeft}>
          <h1 style={styles.headerTitle}>
            <i className="fas fa-tachometer-alt" style={{ marginRight: 8, opacity: 0.8 }} />
            Admission Dashboard
          </h1>
          <span style={styles.headerSubtitle}>Academic Admission Overview</span>
        </div>

        {/* Center — Filters */}
        <div style={styles.headerCenter}>
          <select
            style={styles.filterSelect}
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="">All Academic Years</option>
            {academicYears.map((y) => (
              <option key={y.academicYearId} value={y.academicYearId}>
                {y.yearLabel}
              </option>
            ))}
          </select>

          <select
            style={styles.filterSelect}
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
          >
            <option value="">All Programs</option>
            {programs.map((p) => (
              <option key={p.programId} value={p.programId}>
                {p.programName}
              </option>
            ))}
          </select>

          <button
            onClick={loadAll}
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: "8px",
              color: "#fff",
              padding: "7px 14px",
              cursor: "pointer",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <i className="fas fa-sync-alt" />
            Refresh
          </button>
        </div>

        {/* Right — Timestamp */}
        <div style={styles.headerRight}>
          <span style={styles.refreshLabel}>Last Refreshed</span>
          <span style={styles.refreshTime}>
            {formatDate(lastRefreshed)} · {formatTime(lastRefreshed)}
          </span>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={styles.content}>

        {/* ── SECTION 1: KPI CARDS ── */}
        {loading.kpi ? (
          <KpiSkeleton />
        ) : errors.kpi ? (
          <ErrorBanner message={errors.kpi} />
        ) : (
          <div style={styles.kpiGrid}>
            {/* Total Intake */}
            <div style={styles.kpiCard("#3b82f6")}>
              <div style={styles.kpiIconWrap("#eff6ff")}>
                <i className="fas fa-users" style={styles.kpiIcon("#3b82f6")} />
              </div>
              <div style={styles.kpiBody}>
                <div style={styles.kpiNumber("#3b82f6")}>{kpiData?.totalIntake ?? 0}</div>
                <div style={styles.kpiLabel}>Total Intake</div>
              </div>
            </div>

            {/* Total Admitted */}
            <div style={styles.kpiCard("#16a34a")}>
              <div style={styles.kpiIconWrap("#f0fdf4")}>
                <i className="fas fa-user-check" style={styles.kpiIcon("#16a34a")} />
              </div>
              <div style={styles.kpiBody}>
                <div style={styles.kpiNumber("#16a34a")}>{kpiData?.totalAdmitted ?? 0}</div>
                <div style={styles.kpiLabel}>Total Admitted</div>
              </div>
            </div>

            {/* Remaining Seats */}
            <div style={styles.kpiCard("#ea580c")}>
              <div style={styles.kpiIconWrap("#fff7ed")}>
                <i className="fas fa-chair" style={styles.kpiIcon("#ea580c")} />
              </div>
              <div style={styles.kpiBody}>
                <div style={styles.kpiNumber("#ea580c")}>{kpiData?.remainingSeats ?? 0}</div>
                <div style={styles.kpiLabel}>Remaining Seats</div>
              </div>
            </div>

            {/* Admission Progress */}
            <div style={styles.kpiCard("#0891b2")}>
              <div style={styles.kpiIconWrap("#ecfeff")}>
                <i className="fas fa-chart-pie" style={styles.kpiIcon("#0891b2")} />
              </div>
              <div style={styles.kpiBody}>
                <div style={styles.kpiNumber("#0891b2")}>{admissionPct}%</div>
                <div style={styles.kpiLabel}>Admission Progress</div>
                <div style={styles.progressBar()}>
                  <div style={styles.progressFill(admissionPct, "#0891b2")} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── SECTION 2: QUOTA-WISE SEAT FILLING ── */}
        <div style={styles.sectionCard}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionIcon("rgba(99,102,241,0.1)")}>
              <i className="fas fa-chart-bar" style={{ color: "#6366f1", fontSize: 14 }} />
            </div>
            <h2 style={styles.sectionTitle}>Quota-wise Seat Filling</h2>
          </div>
          <div style={{ ...styles.sectionBody, ...styles.twoCol }}>
            {/* Bar Chart */}
            <div>
              {loading.quota ? (
                <div style={{ height: 260, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ ...styles.skeleton, width: "100%", height: "100%" }} />
                </div>
              ) : errors.quota ? (
                <ErrorBanner message={errors.quota} />
              ) : quotaData.length === 0 ? (
                <div style={styles.emptyState}>No quota data available</div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={quotaData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="quotaName"
                      tick={{ fontSize: 11, fill: "#6b7280" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#6b7280" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<QuotaTooltip />} />
                    <Legend
                      wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                    />
                    <Bar dataKey="filledSeats"    name="Filled Seats"    fill="#16a34a" radius={[4,4,0,0]} />
                    <Bar dataKey="remainingQuota" name="Remaining Seats" fill="#f97316" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Summary Table */}
            <div style={{ overflowX: "auto" }}>
              {loading.quota ? (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      {["Quota Name","Total","Filled","Remaining"].map((h) => (
                        <th key={h} style={styles.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <SkeletonRows rows={4} cols={4} />
                </table>
              ) : errors.quota ? (
                <ErrorBanner message={errors.quota} />
              ) : (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Quota Name</th>
                      <th style={styles.th}>Total Quota</th>
                      <th style={styles.th}>Filled Seats</th>
                      <th style={styles.th}>Remaining Seats</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotaData.length === 0 ? (
                      <tr><td colSpan={4} style={styles.emptyState}>No data</td></tr>
                    ) : quotaData.map((row, i) => (
                      <tr key={i}>
                        <td style={styles.td}><b>{row.quotaName}</b></td>
                        <td style={styles.td}>{row.totalQuota}</td>
                        <td style={styles.td}>
                          <span style={{ color: "#16a34a", fontWeight: 600 }}>{row.filledSeats}</span>
                        </td>
                        <td style={styles.td}>
                          <span style={{ color: "#ea580c", fontWeight: 600 }}>{row.remainingQuota}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* ── SECTION 3: REMAINING SEATS BY PROGRAM ── */}
        <div style={styles.sectionCard}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionIcon("rgba(234,88,12,0.1)")}>
              <i className="fas fa-graduation-cap" style={{ color: "#ea580c", fontSize: 14 }} />
            </div>
            <h2 style={styles.sectionTitle}>Remaining Seats — Program View</h2>
          </div>
          <div style={styles.sectionBody}>
            {loading.seats ? (
              <table style={styles.table}>
                <thead>
                  <tr>
                    {["Program Name","Academic Year","Remaining Seats","Status"].map((h) => (
                      <th key={h} style={styles.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <SkeletonRows rows={5} cols={4} />
              </table>
            ) : errors.seats ? (
              <ErrorBanner message={errors.seats} />
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Program Name</th>
                    <th style={styles.th}>Academic Year</th>
                    <th style={styles.th}>Remaining Seats</th>
                    <th style={styles.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {remainingSeats.length === 0 ? (
                    <tr><td colSpan={4} style={styles.emptyState}>No data available</td></tr>
                  ) : remainingSeats.map((row, i) => (
                    <tr key={i}>
                      <td style={styles.td}>{row.programName}</td>
                      <td style={styles.td}>{row.academicYear}</td>
                      <td style={{ ...styles.td, fontWeight: 700 }}>{row.remainingSeats}</td>
                      <td style={styles.td}><SeatStatusBadge remaining={row.remainingSeats} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ── BOTTOM ROW: Docs + Fees side by side ── */}
        <div style={styles.twoCol}>

          {/* ── SECTION 4: PENDING DOCUMENTS ── */}
          <div style={styles.sectionCard}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionIcon("rgba(202,138,4,0.1)")}>
                <i className="fas fa-file-alt" style={{ color: "#ca8a04", fontSize: 14 }} />
              </div>
              <h2 style={styles.sectionTitle}>Pending Document Verification</h2>
              {!loading.docs && (
                <span style={{
                  marginLeft: "auto",
                  background: "#fef9c3",
                  color: "#854d0e",
                  borderRadius: "20px",
                  padding: "2px 10px",
                  fontSize: 11,
                  fontWeight: 700,
                }}>
                  {pendingDocs.length} pending
                </span>
              )}
            </div>
            <div style={{ ...styles.sectionBody, padding: 0, maxHeight: 340, overflowY: "auto" }}>
              {loading.docs ? (
                <table style={{ ...styles.table, margin: "20px" }}>
                  <thead>
                    <tr>
                      {["ID","Name","Program","Status"].map((h) => (
                        <th key={h} style={styles.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <SkeletonRows rows={4} cols={4} />
                </table>
              ) : errors.docs ? (
                <div style={{ padding: 16 }}><ErrorBanner message={errors.docs} /></div>
              ) : (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Applicant ID</th>
                      <th style={styles.th}>Applicant Name</th>
                      <th style={styles.th}>Program</th>
                      <th style={styles.th}>Document Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingDocs.length === 0 ? (
                      <tr><td colSpan={4} style={styles.emptyState}>No pending documents</td></tr>
                    ) : pendingDocs.map((row, i) => (
                      <tr key={i}>
                        <td style={styles.td} title={row.applicantId}>
                          <span style={{ fontFamily: "monospace", fontSize: 11, color: "#6b7280" }}>
                            {String(row.applicantId).slice(0, 8)}…
                          </span>
                        </td>
                        <td style={styles.td}>{row.applicantName}</td>
                        <td style={styles.td}>{row.programName}</td>
                        <td style={styles.td}><DocumentStatusBadge status={row.documentStatus} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* ── SECTION 5: FEE PENDING ── */}
          <div style={styles.sectionCard}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionIcon("rgba(220,38,38,0.08)")}>
                <i className="fas fa-rupee-sign" style={{ color: "#dc2626", fontSize: 14 }} />
              </div>
              <h2 style={styles.sectionTitle}>Fee Pending Applicants</h2>
              {!loading.fees && (
                <span style={{
                  marginLeft: "auto",
                  background: "#fee2e2",
                  color: "#991b1b",
                  borderRadius: "20px",
                  padding: "2px 10px",
                  fontSize: 11,
                  fontWeight: 700,
                }}>
                  {feePending.length} pending
                </span>
              )}
            </div>
            <div style={{ ...styles.sectionBody, padding: 0, maxHeight: 340, overflowY: "auto" }}>
              {loading.fees ? (
                <table style={{ ...styles.table, margin: "20px" }}>
                  <thead>
                    <tr>
                      {["ID","Name","Program","Quota","Fee Status"].map((h) => (
                        <th key={h} style={styles.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <SkeletonRows rows={4} cols={5} />
                </table>
              ) : errors.fees ? (
                <div style={{ padding: 16 }}><ErrorBanner message={errors.fees} /></div>
              ) : (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Applicant ID</th>
                      <th style={styles.th}>Applicant Name</th>
                      <th style={styles.th}>Program</th>
                      <th style={styles.th}>Quota</th>
                      <th style={styles.th}>Fee Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feePending.length === 0 ? (
                      <tr><td colSpan={5} style={styles.emptyState}>No pending fees</td></tr>
                    ) : feePending.map((row, i) => (
                      <tr key={i} style={row.feeStatus === "Pending" ? { background: "#fff7f7" } : {}}>
                        <td style={styles.td} title={row.applicantId}>
                          <span style={{ fontFamily: "monospace", fontSize: 11, color: "#6b7280" }}>
                            {String(row.applicantId).slice(0, 8)}…
                          </span>
                        </td>
                        <td style={styles.td}>{row.applicantName}</td>
                        <td style={styles.td}>{row.programName}</td>
                        <td style={styles.td}>{row.quotaName}</td>
                        <td style={styles.td}><FeeStatusBadge status={row.feeStatus} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>{/* end bottom row */}
      </div>{/* end content */}

      {/* Shimmer keyframe via style tag */}
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        /* Responsive grid breakpoints */
        @media (max-width: 1024px) {
          .kpi-grid    { grid-template-columns: repeat(2, 1fr) !important; }
          .two-col     { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .kpi-grid    { grid-template-columns: 1fr !important; }
        }
        /* Hide scrollbar but keep scroll */
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
        select option { background: #1a3a6e; color: #fff; }
      `}</style>
    </div>
  );
}

export default ManagementDashboard;