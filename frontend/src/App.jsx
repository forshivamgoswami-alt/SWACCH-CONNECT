import LocationMap from "./LocationMap";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import "./App.css";

const API =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";
const CATEGORY_OPTIONS = {
  "Garbage & Waste": [
    "Garbage dumps",
    "Overflowing bins",
    "Plastic waste",
    "Illegal dumping",
  ],
  "Roads & Infrastructure": [
    "Potholes",
    "Damaged roads",
    "Broken footpaths",
  ],
  "Drainage & Sewage": [
    "Blocked drains",
    "Overflowing sewage",
    "Waterlogging",
    "Open manholes",
  ],
  "Water Supply": [
    "Water leakage",
    "Contaminated water",
    "Irregular water supply",
  ],
  "Streetlights & Electricity": [
    "Non-working streetlights",
    "Damaged electric poles",
    "Exposed electrical wires",
  ],
  "Public Sanitation": [
    "Dirty public toilets",
    "Unhygienic public spaces",
  ],
  "Environmental Issues": [
    "Air pollution",
    "Noise pollution",
    "Tree damage",
    "Open burning",
  ],
  "Public Property": [
    "Damaged benches",
    "Damaged bus stops",
    "Damaged parks",
    "Damaged public facilities",
  ],
  "Animal-related Issues": [
    "Stray animal concerns",
    "Animal waste",
  ],
  "Other Civic Issues": [
    "Other civic problems",
  ],
};

const CATEGORIES = Object.keys(CATEGORY_OPTIONS);
const NAV_ITEMS = [
  ["home", "Home"],
  ["report", "Report an Issue"],
  ["track", "Track Report"],
  ["schemes", "Government Schemes"],
  ["mission", "Our Mission"],
  ["team", "Our Team"],
  ["contact", "Contact Us"],
  ["qr", "QR Scan"],
];
/* =====================================================
   REPEATING TYPEWRITER ANIMATION
===================================================== */

function Typewriter() {
  const heading = "WELCOME TO SWACCH CONNECT";
  const [typed, setTyped] = useState("");

  useEffect(() => {
    let index = 0;
    let deleting = false;
    let timeoutId;

    function tick() {
      if (!deleting) {
        index += 1;
        setTyped(heading.slice(0, index));

        if (index >= heading.length) {
          deleting = true;
          timeoutId = window.setTimeout(tick, 1800);
        } else {
          timeoutId = window.setTimeout(tick, 85);
        }
      } else {
        index -= 1;
        setTyped(heading.slice(0, index));

        if (index <= 0) {
          deleting = false;
          timeoutId = window.setTimeout(tick, 500);
        } else {
          timeoutId = window.setTimeout(tick, 38);
        }
      }
    }

    timeoutId = window.setTimeout(tick, 300);

    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <span className="typewriter" aria-label={heading}>
      <span>{typed}</span>
      <span className="typewriter-cursor" aria-hidden="true">
        |
      </span>
    </span>
  );
}

/* =====================================================
   HEADER
===================================================== */

function Header({ page, navigate, apiStatus }) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [page]);

  return (
    <header className="site-header">
      <a
        className="brand"
        href="#home"
        onClick={(event) => {
          event.preventDefault();
          navigate("home");
        }}
      >
        <span className="brand-mark">
          <span>SC</span>
        </span>

        <span className="brand-copy">
          <strong>SWACCH CONNECT</strong>
          <small>Report • Track • Clean • Together</small>
        </span>
      </a>

      <button
        className="menu-toggle"
        onClick={() => setMenuOpen((previous) => !previous)}
        aria-label="Toggle navigation"
        aria-expanded={menuOpen}
      >
        ☰
      </button>

      <nav
        className={menuOpen ? "main-nav open" : "main-nav"}
        aria-label="Main navigation"
      >
        {NAV_ITEMS.map(([key, label]) => (
          <a
            key={key}
            href={`#${key}`}
            className={page === key ? "nav-link active" : "nav-link"}
            onClick={(event) => {
              event.preventDefault();
              navigate(key);
              setMenuOpen(false);
            }}
          >
            {label}
          </a>
        ))}
      </nav>

      <span className={`api-status ${apiStatus}`}>
        <i />
        {apiStatus === "online"
          ? "System online"
          : apiStatus === "offline"
            ? "API offline"
            : "Checking system"}
      </span>
    </header>
  );
}

/* =====================================================
   FOOTER
===================================================== */

function Footer({ navigate }) {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div>
          <a
            className="footer-brand"
            href="#home"
            onClick={(event) => {
              event.preventDefault();
              navigate("home");
            }}
          >
            SWACCH CONNECT
          </a>

          <p>
            Promoting cleaner communities through transparent reporting, efficient resolution, and civic accountability.
          </p>
        </div>

        <div className="footer-links">
          <a href="#report" onClick={(e) => {
            e.preventDefault();
            navigate("report");
          }}>
            Report an issue
          </a>

          <a href="#track" onClick={(e) => {
            e.preventDefault();
            navigate("track");
          }}>
            Track a report
          </a>

          <a href="#mission" onClick={(e) => {
            e.preventDefault();
            navigate("mission");
          }}>
            Our mission
          </a>
        </div>

        <div className="footer-note">
          <span className="india-stripe">
            <i />
            <i />
            <i />
          </span>

          <small>Built for cleaner communities</small>
          <small>© {new Date().getFullYear()} Swacch Connect</small>
        </div>
      </div>
    </footer>
  );
}

/* =====================================================
   HOME PAGE
===================================================== */

function HomePage({ navigate }) {
  return (
    <>
      <section className="hero section-wrap">
        <div className="hero-copy">
          <span className="eyebrow">
            <span className="eyebrow-dot" />
            A cleaner tomorrow starts today
          </span>

          <h1>
            <Typewriter />
          </h1>

          <p className="hero-lead">
            Together, we can build cleaner, healthier communities.
          </p>

          <p className="hero-description">
            Report civic issues, track their progress, and help build a
            cleaner, healthier community—together.
          </p>

          <div className="hero-actions">
            <button
              className="btn btn-primary"
              onClick={() => navigate("report")}
            >
              Report an Issue <span>↗</span>
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => navigate("track")}
            >
              Track Your Report
            </button>
          </div>

          <div className="trust-row">
            <span className="trust-icon">✓</span>
            <span>Easy reporting</span>
            <span className="trust-divider" />
            <span className="trust-icon">✓</span>
            <span>Transparent tracking</span>
          </div>
        </div>

        <div
          className="hero-art"
          aria-label="Illustration of a clean green city"
          role="img"
        >
          <div className="art-orbit orbit-one" />
          <div className="art-orbit orbit-two" />
          <div className="sun" />

          <div className="cloud cloud-one" />
          <div className="cloud cloud-two" />

          <div className="city-building building-one">
            <span /><span /><span /><span />
          </div>

          <div className="city-building building-two">
            <span /><span /><span />
            <span /><span /><span />
          </div>

          <div className="city-building building-three">
            <span /><span /><span /><span />
          </div>

          <div className="tree tree-one">
            <i />
            <b />
          </div>

          <div className="tree tree-two">
            <i />
            <b />
          </div>

          <div className="ground" />

          <div className="art-label">
            <span className="label-check">✓</span>
            <span>
              <strong>Small actions.</strong>
              <small>Big change.</small>
            </span>
          </div>

          <div className="floating-leaf leaf-one"></div>
          <div className="floating-leaf leaf-two"></div>
        </div>
      </section>

      <section className="stats-strip section-wrap">
        <div className="stat-item">
          <span className="stat-icon green">◎</span>
          <div>
            <strong>Simple reporting</strong>
            <small>Share a local issue in minutes</small>
          </div>
        </div>

        <div className="stat-item">
          <span className="stat-icon blue">↗</span>
          <div>
            <strong>Track progress</strong>
            <small>Follow your report status</small>
          </div>
        </div>

        <div className="stat-item">
          <span className="stat-icon orange">♧</span>
          <div>
            <strong>Community first</strong>
            <small>Better streets start with us</small>
          </div>
        </div>
      </section>

      <section className="content-section section-wrap">
        <div className="section-heading">
          <span className="eyebrow">HOW IT WORKS</span>

          <h2>
            One report can make a <span>real difference.</span>
          </h2>

          <p>
            Three simple steps to help improve your neighbourhood.
          </p>
        </div>

        <div className="steps-grid">
          <article className="step-card">
            <span className="step-number">01</span>
            <div className="step-symbol">✎</div>
            <h3>Report an issue</h3>
            <p>
              Tell us what needs attention and where it is happening.
            </p>

            <button
              className="text-button"
              onClick={() => navigate("report")}
            >
              Start a report <span>→</span>
            </button>
          </article>

          <article className="step-card">
            <span className="step-number">02</span>
            <div className="step-symbol blue-symbol">⌕</div>
            <h3>Track progress</h3>
            <p>
              Use your unique reference number to check the latest status.
            </p>

            <button
              className="text-button"
              onClick={() => navigate("track")}
            >
              Track a report <span>→</span>
            </button>
          </article>

          <article className="step-card">
            <span className="step-number">03</span>
            <div className="step-symbol orange-symbol">♧</div>
            <h3>Build a cleaner city</h3>
            <p>
              Keep civic concerns visible and encourage collective action.
            </p>

            <button
              className="text-button"
              onClick={() => navigate("mission")}
            >
              Our mission <span>→</span>
            </button>
          </article>
        </div>
      </section>

      <section className="cta-band section-wrap">
        <div>
          <span className="eyebrow light-eyebrow">
            YOUR COMMUNITY NEEDS YOU
          </span>

          <h2>See a problem? Help us fix it.</h2>

          <p>
            Every useful report is a step towards a cleaner neighbourhood.
          </p>
        </div>

        <button
          className="btn btn-white"
          onClick={() => navigate("report")}
        >
          Report an Issue <span>↗</span>
        </button>
      </section>
    </>
  );
}

/* =====================================================
   REUSABLE PAGE TITLE
===================================================== */

function PageTitle({ eyebrow, title, description }) {
  return (
    <div className="page-title">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </div>
  );
}

/* =====================================================
   REPORT ISSUE PAGE
===================================================== */

function ReportPage({
  form,
  updateForm,
  submitComplaint,
  submitting,
  submitted,
  error,
  navigate,
}) {
  const selectedSubcategories = CATEGORY_OPTIONS[form.category] || [];

  return (
    <main className="inner-page section-wrap">
      <PageTitle
        eyebrow="MAKE YOUR VOICE COUNT"
        title={<>Report a civic <span>issue.</span></>}
        description="Report local issues. Track progress. Make your community better."
      />

      <div className="form-layout">
        <form className="panel report-form" onSubmit={submitComplaint}>
          <div className="panel-heading">
            <div>
              <h2>Complaint Registration</h2>
              <p>Complete all mandatory fields marked with *.</p>
            </div>
            <span className="form-step">FORM 01</span>
          </div>

          <h3 className="form-section-title">Personal Information</h3>

          <label>
            Full Name <span>*</span>
            <input name="name" value={form.name} onChange={updateForm}
              placeholder="Enter your full name" minLength={2}
              maxLength={100} autoComplete="name" required />
          </label>

          <label>
            Email Address <span>*</span>
            <input type="email" name="email" value={form.email}
              onChange={updateForm} placeholder="example@email.com"
              autoComplete="email" required />
          </label>

          <label>
            Mobile Number <span>*</span>
            <input type="tel" name="mobile" value={form.mobile}
              onChange={updateForm} placeholder="10-digit Indian mobile number"
              pattern="[6-9][0-9]{9}" maxLength={10}
              autoComplete="tel" required />
          </label>

          <h3 className="form-section-title">Complaint Details</h3>

          <label>
            Issue Category <span>*</span>
            <select name="category" value={form.category}
              onChange={updateForm} required>
              {CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </label>

          <label>
            Problem Subcategory <span>*</span>
            <select name="subcategory" value={form.subcategory}
              onChange={updateForm} required>
              {selectedSubcategories.map(item => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>

          <h3 className="form-section-title">Location Information</h3>

          <label>
            State <span>*</span>
            <input name="state" value={form.state} onChange={updateForm}
              placeholder="Enter state" required />
          </label>

          <label>
            City <span>*</span>
            <input name="city" value={form.city} onChange={updateForm}
              placeholder="Enter city" required />
          </label>

          <label>
            Area / Locality <span>*</span>
            <input name="area" value={form.area} onChange={updateForm}
              placeholder="Enter area or locality" required />
          </label>

          <label>
            Street / Road <span>*</span>
            <input name="street" value={form.street} onChange={updateForm}
              placeholder="Enter street or road name" required />
          </label>

          <label>
            Landmark <span>*</span>
            <input name="landmark" value={form.landmark} onChange={updateForm}
              placeholder="Enter nearby landmark" required />
          </label>

          <h3 className="form-section-title">GPS Coordinates</h3>

          <label>
            Latitude <span>*</span>
            <input type="number" name="latitude" value={form.latitude}
              onChange={updateForm} placeholder="Select on map or enter latitude"
              min="-90" max="90" step="any" required />
          </label>

          <label>
            Longitude <span>*</span>
            <input type="number" name="longitude" value={form.longitude}
              onChange={updateForm} placeholder="Select on map or enter longitude"
              min="-180" max="180" step="any" required />
          </label>

          <h3 className="form-section-title">Problem Description</h3>

          <label>
            Detailed Description <span>*</span>
            <textarea name="description" value={form.description}
              onChange={updateForm}
              placeholder="Describe the civic issue, its condition and how it affects the community."
              minLength={10} maxLength={3000} rows={5} required />
            <small className="field-hint">Maximum 3000 characters.</small>
          </label>

          <label className="evidence-upload">
            Supporting Photo <small>(Optional)</small>
            <input type="file" name="evidence"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              onChange={event => {
                const file = event.target.files?.[0];
                if (!file) return;

                if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
                  event.target.value = "";
                  window.alert("Please select a JPG, PNG or WEBP image.");
                  return;
                }

                if (file.size > 5 * 1024 * 1024) {
                  event.target.value = "";
                  window.alert("The image must be 5 MB or smaller.");
                  return;
                }

                updateForm({
                  target: { name: "evidence", value: file },
                });
              }}
            />
            <small>JPG, JPEG, PNG or WEBP · Maximum 5 MB</small>
          </label>

          <label className="consent-row">
            <input type="checkbox" checked={!!form.consent}
              onChange={event => updateForm({
                target: {
                  name: "consent",
                  value: event.target.checked ? "true" : "",
                },
              })}
              required />
            <span>
              I confirm that the information provided is accurate and
              consent to its use for processing this civic complaint. *
            </span>
          </label>

          {error && (
            <div className="form-error" role="alert">{error}</div>
          )}

          {submitted && (
            <div className="form-success" role="status">
              <strong>Report submitted successfully!</strong>
              <p>Reference number: <b>{submitted.reference_id}</b></p>
              <p>Status: {submitted.status || "Received"}</p>
              <button type="button" onClick={() => navigate("track")}>
                Track this report →
              </button>
            </div>
          )}

          <button className="btn btn-primary submit-btn"
            type="submit" disabled={submitting}>
            {submitting ? "Submitting…" : "Submit Report ↗"}
          </button>

          <p className="privacy-note">
            Your personal information is used to process your complaint
            and is not displayed publicly.
          </p>
        </form>

        <aside className="report-map-aside">
          <LocationMap
            onLocationSelect={coordinates => {
              if (!coordinates) return;

              updateForm({
                target: {
                  name: "latitude",
                  value: String(coordinates.lat),
                },
              });

              updateForm({
                target: {
                  name: "longitude",
                  value: String(coordinates.lng),
                },
              });
            }}
          />

          <div className="map-address-note">
            <strong>Helpful tip</strong>
            <p>
              Select the exact issue location on the map, then complete
              the address and GPS fields.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}

/* =====================================================
   TRACK REPORT PAGE
===================================================== */

function TrackPage({
  reference,
  setReference,
  trackComplaint,
  tracking,
  complaint,
  error,
}) {
  return (
    <main className="inner-page section-wrap">
      <PageTitle
        eyebrow="STAY IN THE LOOP"
        title={<>Track your <span>report.</span></>}
        description="Enter the reference number you received after submitting your civic issue."
      />

      <form className="panel track-panel" onSubmit={trackComplaint}>
        <div className="track-icon">⌕</div>

        <h2>Find your report</h2>

        <p>
          Your reference number looks like{" "}
          <code>SWC-YYYYMMDD-XXXXXXXX</code>.
        </p>

        <div className="track-input-row">
          <input
            aria-label="Complaint reference number"
            value={reference}
            onChange={(event) => setReference(event.target.value)}
            placeholder="Enter reference number"
            required
          />

          <button
            className="btn btn-primary"
            type="submit"
            disabled={tracking}
          >
            {tracking ? "Searching…" : "Track Report"} <span>→</span>
          </button>
        </div>

        {error && (
          <div className="alert alert-error" role="alert">
            {error}
          </div>
        )}
      </form>

      {complaint && (
        <section className="panel result-panel" aria-live="polite">
          <div className="result-top">
            <div>
              <span className="eyebrow">REPORT DETAILS</span>
              <h2>{complaint.reference_id}</h2>
            </div>

            <span
              className={`status-badge ${
                String(complaint.status || "Received")
                  .toLowerCase()
                  .replace(/\s+/g, "-")
              }`}
            >
              {complaint.status || "Received"}
            </span>
          </div>

          <div className="result-grid">
            <div>
              <small>Issue category</small>
              <strong>{complaint.category}</strong>
            </div>

            <div>
              <small>Priority</small>
              <strong>{complaint.priority || "Normal"}</strong>
            </div>

            <div>
              <small>Location</small>
              <strong>{complaint.location}</strong>
            </div>

            <div>
              <small>Date submitted</small>
              <strong>
                {complaint.created_at
                  ? new Date(complaint.created_at).toLocaleString()
                  : "Not available"}
              </strong>
            </div>
          </div>

          <div className="result-description">
            <small>Description</small>
            <p>{complaint.description}</p>
          </div>

          <div className="status-timeline">
            <span className="timeline-dot" />
            <div>
              <strong>{complaint.status || "Received"}</strong>
              <p>Your report's current recorded status.</p>
            </div>
          </div>
        </section>
      )}

      <div className="track-help">
        <span>?</span>
        <p>
          <strong>Can't find your report?</strong>
          <br />
          Check the reference number and try again. Reference numbers are not case-sensitive.
        </p>
      </div>
    </main>
  );
}

/* =====================================================
   QR CODE PAGE
===================================================== */

function QrPage({
  qrData,
  qrLoading,
  qrError,
  generateQr,
  downloadQr,
  copyLink,
  copied,
  navigate,
}) {
  const reportUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${window.location.pathname}#report`
      : "#report";

  return (
    <main className="inner-page section-wrap">
      <PageTitle
        eyebrow="SCAN • REPORT • IMPROVE"
        title={<>Make reporting <span>easy.</span></>}
        description="Create a QR code that opens the report form on this website."
      />

      <div className="qr-layout panel">
        <div className="qr-copy">
          <span className="eyebrow">COMMUNITY ACCESS</span>

          <h2>Share the report form.</h2>

          <p>
            Display the QR code on a notice board or share it with your community.
            Anyone who scans it can open the report form on this site.
          </p>

          <div className="qr-url">
            <small>Report form link</small>
            <span>{reportUrl}</span>
          </div>

          <div className="qr-actions">
            <button
              className="btn btn-primary"
              onClick={generateQr}
              disabled={qrLoading}
            >
              {qrLoading ? "Generating…" : "Generate QR Code"}
            </button>

            <button className="btn btn-secondary" onClick={copyLink}>
              {copied ? "Link copied ✓" : "Copy report link"}
            </button>
          </div>

          {qrError && (
            <div className="alert alert-error">{qrError}</div>
          )}

          <p className="field-hint">
            This link is accessible to others only after the website is deployed publicly.
          </p>
        </div>

        <div className="qr-preview">
          {qrData ? (
            <>
              <img
                src={qrData}
                alt="QR code linking to the report form"
              />

              <strong>Scan to report an issue</strong>

              <div className="qr-actions centered">
                <button
                  className="btn btn-secondary"
                  onClick={downloadQr}
                >
                  Download PNG
                </button>

                <button
                  className="btn btn-secondary"
                  onClick={() => window.print()}
                >
                  Print
                </button>
              </div>
            </>
          ) : (
            <div className="qr-placeholder">
              <span>▦</span>
              <strong>Your QR code appears here</strong>
              <small>Generate it when you're ready to share.</small>
            </div>
          )}
        </div>
      </div>

      <button
        className="text-button back-home"
        onClick={() => navigate("home")}
      >
        ← Back to home
      </button>
    </main>
  );
}

/* =====================================================
   INFORMATION PAGES
===================================================== */

function InfoPage({ page, navigate }) {
  const content = {
    schemes: {
      eyebrow: "PUBLIC RESOURCES",
      title: <>Government <span>schemes.</span></>,
      description:
        "Explore official resources for sanitation, urban development, and public welfare.",
      cards: [
        [
          "Swachh Bharat Mission",
          "Official mission resources and updates.",
          "https://swachhbharatmission.ddws.gov.in/",
        ],
        [
          "Ministry of Housing and Urban Affairs",
          "Policies and programmes for urban development.",
          "https://mohua.gov.in/",
        ],
        [
          "myScheme",
          "Discover government schemes and eligibility information.",
          "https://www.myscheme.gov.in/",
        ],
      ],
    },

    mission: {
      eyebrow: "WHY WE EXIST",
      title: <>Cleaner places, <span>together.</span></>,
      description:
        "Swacch Connect aims to make civic reporting easier and improve visibility into local concerns.",
      cards: [
        [
          "Report",
          "Make it easier for people to share civic concerns with clear information.",
        ],
        [
          "Track",
          "Give each submitted report a reference number for status lookup.",
        ],
        [
          "Connect",
          "Encourage community participation and responsible civic action.",
        ],
      ],
    },

    team: {
      eyebrow: "PEOPLE BEHIND THE IDEA",
      title: <>Our <span>team.</span></>,
      description:
        "A student-led civic technology project focused on practical community reporting.",
      cards: [
        [
          "PAWAN SINGH",
          "",
        ],
        [
          "RISHABH GUPTA",
          "",
        ],
        [
          "KOUSTUK SINGH",
            "",
        ],
        [

          "VIJAY KANOJIYE",
          ""
        
        ]
      ],
    },

    contact: {
      eyebrow: "WE'RE HERE TO HELP",
      title: <>Get in <span>touch.</span></>,
      description:
        "For questions about this project, reach out through the contact channel below.",
      cards: [
        [
          "Project email",
          "swacchbharat49@gmail.com",
          "mailto:swacchbharat49@gmail.com",
        ],
        [
          "Report a civic issue",
          "Use the online form to submit a new report.",
        ],
        [
          "Track an existing report",
          "Keep your reference number handy to check progress.",
        ],
      ],
    },
  };

  const data = content[page] || content.mission;

  return (
    <main className="inner-page section-wrap">
      <PageTitle
        eyebrow={data.eyebrow}
        title={data.title}
        description={data.description}
      />

      <div className="info-grid">
        {data.cards.map(([title, description, link], index) => (
          <article className="info-card" key={title}>
            <span className="info-card-number">
              0{index + 1}
            </span>

            <div className="info-card-icon">
              {["PS", "RG", "KS","VK"][index % 4]}
            </div>

            <h2>{title}</h2>
            <p>{description}</p>

            {link ? (
              <a
                className="text-button"
                href={link}
                target={link.startsWith("http") ? "_blank" : undefined}
                rel={link.startsWith("http") ? "noreferrer" : undefined}
              >
                Explore resource ↗
              </a>
            ) : (
              <button
                className="text-button"
                onClick={() =>
                  navigate(page === "contact" ? "report" : "home")
                }
              >
                {page === "contact"
                  ? "Open report form →"
                  : "Explore Swacch Connect →"}
              </button>
            )}
          </article>
        ))}
      </div>

      <div className="info-note">
        <span>i</span>
        <p>
          Swacch Connect is a civic reporting project and is not an official
          government website. Government scheme links above lead to external resources.
        </p>
      </div>
    </main>
  );
}

/* =====================================================
   MAIN APPLICATION
===================================================== */

export default function App() {
  const [page, setPage] = useState("home");
  const [error, setError] = useState("");
  const [apiStatus, setApiStatus] = useState("checking");

  const [form, setForm] = useState({
    name: "",
    category: CATEGORIES[0],
    location: "",
    description: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);

  const [reference, setReference] = useState("");
  const [tracking, setTracking] = useState(false);
  const [complaint, setComplaint] = useState(null);

  const [qrData, setQrData] = useState("");
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState("");
  const [copied, setCopied] = useState(false);

  /* Check backend connection and refresh periodically. */
  useEffect(() => {
    let alive = true;

    async function checkHealth() {
      try {
        const response = await fetch(`${API}/api/health`);

        if (!response.ok) {
          throw new Error("API unavailable");
        }

        await response.json();

        if (alive) setApiStatus("online");
      } catch {
        if (alive) setApiStatus("offline");
      }
    }

    checkHealth();

    const intervalId = window.setInterval(checkHealth, 30000);

    return () => {
      alive = false;
      window.clearInterval(intervalId);
    };
  }, []);

  /* Support browser hash navigation. */
  useEffect(() => {
    function handleHash() {
      const hash = window.location.hash.replace("#", "") || "home";
      const knownPages = NAV_ITEMS.map(([key]) => key);

      setPage(knownPages.includes(hash) ? hash : "home");
    }

    window.addEventListener("hashchange", handleHash);
    handleHash();

    return () => {
      window.removeEventListener("hashchange", handleHash);
    };
  }, []);

  function navigate(target) {
    setPage(target);
    setError("");

    if (window.location.hash !== `#${target}`) {
      window.location.hash = target;
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function updateForm(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  /* Submit a new civic complaint to Flask. */
  async function submitComplaint(event) {
    event.preventDefault();

    if (submitting) return;

    setSubmitting(true);
    setError("");
    setSubmitted(null);

    try {
      const payload = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          payload.append(key, value);
        }
      });

      const response = await fetch(`${API}/api/complaints`, {
        method: "POST",
        body: payload,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error ||
          data.message ||
          "Unable to submit your report."
        );
      }

      setSubmitted(data);
      setReference(data.reference_id || "");

      setForm({
        name: "",
        email: "",
        mobile: "",
        category: CATEGORIES[0],
        subcategory: CATEGORY_OPTIONS[CATEGORIES[0]][0],
        state: "",
        city: "",
        area: "",
        street: "",
        landmark: "",
        location: "",
        latitude: "",
        longitude: "",
        description: "",
        evidence: null,
        consent: false,
      });

    } catch (submitError) {
      setError(
        submitError.message ||
        "Cannot connect to the server. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }
  /* Look up an existing complaint by reference ID. */
  async function trackComplaint(event) {
    event.preventDefault();

    setTracking(true);
    setComplaint(null);
    setError("");

    try {
      const id = reference.trim().toUpperCase();

      if (!id) {
        throw new Error("Enter your complaint reference number.");
      }

      const response = await fetch(
        `${API}/api/complaints/${encodeURIComponent(id)}`
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error ||
          data.message ||
          "Complaint not found. Check the reference number."
        );
      }

      setComplaint(data);
    } catch (trackError) {
      setError(
        trackError.message ||
        "Cannot connect to the server. Please try again."
      );
    } finally {
      setTracking(false);
    }
  }

  /* Generate a QR code for the report form. */
  async function generateQr() {
    setQrLoading(true);
    setQrError("");

    try {
      const url =
        `${window.location.origin}${window.location.pathname}#report`;

      const dataUrl = await QRCode.toDataURL(url, {
        width: 320,
        margin: 2,
        errorCorrectionLevel: "H",
        color: {
          dark: "#15352a",
          light: "#ffffff",
        },
      });

      setQrData(dataUrl);
    } catch {
      setQrError("Could not generate the QR code. Please try again.");
    } finally {
      setQrLoading(false);
    }
  }

  /* Copy the report link. */
  async function copyLink() {
    const url =
      `${window.location.origin}${window.location.pathname}#report`;

    try {
      await navigator.clipboard.writeText(url);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      setQrError(
        "Clipboard access was blocked. Copy the report link manually."
      );
    }
  }

  /* Download the QR code as PNG. */
  function downloadQr() {
    if (!qrData) return;

    const anchor = document.createElement("a");

    anchor.href = qrData;
    anchor.download = "swacch-connect-report-qr.png";

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }

  /* Render the selected page. Components are declared outside App
     so normal state updates do not recreate the page component types. */
  let content;

  if (page === "report") {
    content = (
      <ReportPage
        form={form}
        updateForm={updateForm}
        submitComplaint={submitComplaint}
        submitting={submitting}
        submitted={submitted}
        error={error}
        navigate={navigate}
      />
    );
  } else if (page === "track") {
    content = (
      <TrackPage
        reference={reference}
        setReference={setReference}
        trackComplaint={trackComplaint}
        tracking={tracking}
        complaint={complaint}
        error={error}
      />
    );
  } else if (page === "qr") {
    content = (
      <QrPage
        qrData={qrData}
        qrLoading={qrLoading}
        qrError={qrError}
        generateQr={generateQr}
        downloadQr={downloadQr}
        copyLink={copyLink}
        copied={copied}
        navigate={navigate}
      />
    );
  } else if (
    ["schemes", "mission", "team", "contact"].includes(page)
  ) {
    content = <InfoPage page={page} navigate={navigate} />;
  } else {
    content = <HomePage navigate={navigate} />;
  }

  return (
    <div className="app-shell">
      <div className="top-ribbon">
        <span>
          <i />
          Civic reporting, made simple
        </span>

        <span className="ribbon-right">
          A cleaner community is a shared responsibility <b></b>
        </span>
      </div>

      <Header
        page={page}
        navigate={navigate}
        apiStatus={apiStatus}
      />

      <div className="page-content">{content}</div>

      <Footer navigate={navigate} />
    </div>
  );
}

