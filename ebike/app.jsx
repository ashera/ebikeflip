/* global React, ReactDOM, Topbar, Button, Badge, Spec, Icon, Segmented, ListingCard, FilterPanel, TrustPanel, MessageThread, BrowseScreen, DetailScreen, ProfileScreen */

const { useState } = React;

/* ===== HERO ===== */
const Hero = () => (
  <section className="hero">
    <div className="hero-grid">
      <div>
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          <Badge variant="volt-soft" icon="bolt">v1.0 — Apr 2026</Badge>
          <Badge>Peer-to-peer marketplace</Badge>
        </div>
        <h1>The eBike marketplace,<br/><span className="accent">designed</span> end to end.</h1>
        <p className="sub">Voltra's design system covers tokens, components, and the screens that turn a peer-to-peer transaction into a confident one — from browse to handoff.</p>
      </div>
      <div className="meta-grid">
        <div><b>11</b><span>Color tokens</span></div>
        <div><b>4</b><span>Type families</span></div>
        <div><b>24+</b><span>Components</span></div>
        <div><b>3</b><span>Sample screens</span></div>
      </div>
    </div>
    <div className="hero-photo" style={{ backgroundImage: `url(${PHOTOS.hero})` }}>
      <div className="hero-photo-caption">
        <span className="eyebrow" style={{ color: "white", opacity: 0.7, margin: 0 }}>Listing imagery</span>
        <div style={{ fontFamily: "var(--font-display)", color: "white", fontSize: 32, letterSpacing: "-0.02em", lineHeight: 1.05, marginTop: 8 }}>
          Photography is <span style={{ color: "var(--volt-300)" }}>product</span>.
        </div>
        <p style={{ color: "rgba(255,255,255,0.75)", maxWidth: "44ch", marginTop: 12, fontSize: 14 }}>
          On a peer-to-peer marketplace, the photograph is the spec sheet. Aim for natural light, clean backgrounds, and at least four angles per listing.
        </p>
      </div>
    </div>
  </section>
);

/* ===== SECTION HEADERS ===== */
const SectionHead = ({ eyebrow, title, accent, body }) => (
  <div className="section-head">
    <div className="meta">
      <div className="eyebrow">{eyebrow}</div>
      <h2>{title} {accent && <span className="accent">{accent}</span>}</h2>
    </div>
    <p>{body}</p>
  </div>
);

/* ===== COLOR ===== */
const ColorSection = () => {
  const voltScale = ["50","100","200","300","400","500","600","700","800"];
  const inkScale = [["1","headlines"],["2","body"],["3","secondary"],["4","tertiary"]];
  const surfaces = [["paper","page"],["surface","cards"],["surface-sunken","tonal"],["hairline","dividers"]];
  const status = [["ok","success"],["warn","warning"],["danger","error"],["info","info"]];

  return (
    <section className="section">
      <SectionHead eyebrow="01 — Color" title="Volt orange," accent="warm neutrals." body="A near-monochrome ink scale on warm paper, with a single signature orange that does the heavy lifting for CTAs, focus, and brand moments." />

      <div style={{ display: "grid", gap: 28 }}>
        <div>
          <div className="lbl" style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-4)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Volt — primary accent</div>
          <div className="swatch-row">
            {voltScale.map((s, i) => (
              <div key={s} className={`swatch ${i >= 5 ? "dark" : ""}`} style={{ "--c": `var(--volt-${s})` }}>
                <span className="name">volt/{s}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid-2">
          <div>
            <div className="lbl" style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-4)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Ink — text scale</div>
            <div style={{ background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: "var(--r-4)" }}>
              {inkScale.map(([s, role]) => (
                <div className="swatch-line" key={s}>
                  <div className="chip" style={{ background: `var(--ink-${s})` }}></div>
                  <div><div className="label">ink/{s}</div><div className="role">{role}</div></div>
                  <div className="val">--ink-{s}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="lbl" style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-4)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Surface & line</div>
            <div style={{ background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: "var(--r-4)" }}>
              {surfaces.map(([s, role]) => (
                <div className="swatch-line" key={s}>
                  <div className="chip" style={{ background: `var(--${s})` }}></div>
                  <div><div className="label">{s}</div><div className="role">{role}</div></div>
                  <div className="val">--{s}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="lbl" style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-4)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Status</div>
          <div className="grid-4">
            {status.map(([s, role]) => (
              <div className="token-card" key={s}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ width: 44, height: 44, borderRadius: "var(--r-2)", background: `var(--${s}-500)` }}></div>
                  <div>
                    <div className="name">{s}/500</div>
                    <div className="val">{role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

/* ===== TYPE ===== */
const TypeSection = () => (
  <section className="section">
    <SectionHead eyebrow="02 — Type" title="Bold display," accent="quiet body." body="Archivo Black for headlines and prices — the same heavy grotesque the brand uses on hero pages. Inter for UI. JetBrains Mono for spec callouts and data labels." />

    <div style={{ background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: "var(--r-4)", padding: "var(--s-7)" }}>
      <div className="type-row">
        <div className="meta"><b>Display / XL</b>Archivo Black · 96 / 86 · -3% tracking</div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 86, lineHeight: 0.9, letterSpacing: "-0.03em", color: "var(--ink-1)" }}>Discover your <span style={{ color: "var(--volt-500)" }}>ride</span>.</div>
      </div>
      <div className="type-row">
        <div className="meta"><b>Display / L</b>Archivo Black · 56 / 56 · -2% tracking</div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 56, lineHeight: 1, letterSpacing: "-0.02em", color: "var(--ink-1)" }}>Trusted seller. Test ride today.</div>
      </div>
      <div className="type-row">
        <div className="meta"><b>H1 — Page title</b>Archivo Black · 40 / 44</div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 40, lineHeight: 1.1, letterSpacing: "-0.02em", color: "var(--ink-1)" }}>Sondors X Premium '23</div>
      </div>
      <div className="type-row">
        <div className="meta"><b>H3 — Card title</b>Archivo Black · 22 / 24</div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 22, letterSpacing: "-0.015em", color: "var(--ink-1)" }}>Aventon Level.2</div>
      </div>
      <div className="type-row">
        <div className="meta"><b>Body L</b>Inter · 18 / 28 · 400</div>
        <div style={{ fontSize: 18, lineHeight: 1.55, color: "var(--ink-2)", maxWidth: "60ch" }}>Built for the daily commute, used on weekends, kept indoors. The battery has 412 cycles and holds 92% of original capacity — measured at the shop last week.</div>
      </div>
      <div className="type-row">
        <div className="meta"><b>Body</b>Inter · 15 / 22 · 400</div>
        <div style={{ fontSize: 15, color: "var(--ink-2)", maxWidth: "60ch" }}>Includes original key, charger, and rear rack. Pickup in Brooklyn or shipping via BikeFlights at buyer's cost.</div>
      </div>
      <div className="type-row">
        <div className="meta"><b>Caption / Mono</b>JetBrains Mono · 11 / 16 · uppercase</div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-4)", textTransform: "uppercase", letterSpacing: "0.12em" }}>RANGE · 62 MI &nbsp;·&nbsp; BATTERY · 720 WH &nbsp;·&nbsp; CLASS 3</div>
      </div>
      <div className="type-row" style={{ borderBottom: 0 }}>
        <div className="meta"><b>Price</b>Archivo Black · 26–48 · -2% tracking</div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 48, color: "var(--ink-1)", letterSpacing: "-0.03em", lineHeight: 1 }}>$1,890<span style={{ fontSize: 16, color: "var(--ink-4)", marginLeft: 12, textDecoration: "line-through", fontFamily: "var(--font-mono)" }}>$2,200</span></div>
      </div>
    </div>
  </section>
);

/* ===== ELEVATION & SHAPE ===== */
const ShapeSection = () => (
  <section className="section">
    <SectionHead eyebrow="03 — Shape" title="Rounded but" accent="grown-up." body="Pill buttons echo the hero CTA on the brand page. Cards use 16px radii — soft enough to feel friendly, restrained enough to read as marketplace, not toy." />

    <div className="grid-2" style={{ gap: 32 }}>
      <div className="cgroup">
        <div className="heading"><h3>Radius</h3><span className="lbl">--r-1 → --r-pill</span></div>
        <div className="grid-3">
          {[["r-2","8px"],["r-3","12px"],["r-4","16px"],["r-5","20px"],["r-6","28px"],["r-pill","999"]].map(([k, v]) => (
            <div key={k}>
              <div className="radius-demo" style={{ borderRadius: `var(--${k})` }}>{k}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-4)", marginTop: 8 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="cgroup">
        <div className="heading"><h3>Elevation</h3><span className="lbl">--e-1 → --e-4</span></div>
        <div className="grid-2">
          {[["e-1","Resting card"],["e-2","Hover / chip"],["e-3","Listing hover"],["e-4","Modal"]].map(([k, role]) => (
            <div className={`elev-card ${k}`} key={k}>
              <span className="label">--{k}</span>
              <span className="name">{role}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

/* ===== BUTTONS / INPUTS / BADGES ===== */
const ControlsSection = () => (
  <section className="section">
    <SectionHead eyebrow="04 — Controls" title="Buttons," accent="inputs, badges." body="Pill-shaped CTAs across three weights: Volt for the most-wanted action, Ink (near-black) for primary, Ghost for secondary. Compact spec chips for data, status badges for trust." />

    <div className="grid-2" style={{ gap: 32 }}>
      <div className="cgroup">
        <div className="heading"><h3>Buttons</h3><span className="lbl">.btn</span></div>
        <div className="row-flex">
          <Button variant="primary" icon="bolt">Make offer</Button>
          <Button variant="dark" icon="msg">Message seller</Button>
          <Button variant="ghost">View details</Button>
          <Button variant="quiet">Save</Button>
        </div>
        <div className="row-flex">
          <Button variant="primary" size="lg" icon="bolt">Make an offer</Button>
          <Button variant="dark" size="sm">List your bike</Button>
          <Button variant="ghost" size="sm" icon="heart">Save</Button>
          <Button variant="dark" size="sm" icon="plus" />
        </div>
      </div>

      <div className="cgroup">
        <div className="heading"><h3>Inputs</h3><span className="lbl">.input</span></div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
          <div>
            <label className="field-label">Search</label>
            <div className="search-input">
              <span className="icon"><Icon name="search" className="ico sm" /></span>
              <input className="input" placeholder="Brand, model, or location" />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input className="input" placeholder="Min price" />
            <input className="input" placeholder="Max price" />
          </div>
          <Segmented value="all" onChange={() => {}} options={[{ value: "all", label: "All" }, { value: "new", label: "Like new" }, { value: "good", label: "Good" }, { value: "fair", label: "Fair" }]} />
        </div>
      </div>

      <div className="cgroup">
        <div className="heading"><h3>Badges</h3><span className="lbl">.badge</span></div>
        <div className="row-flex">
          <Badge variant="volt" icon="bolt">Voltra Pick</Badge>
          <Badge variant="volt-soft">Reduced</Badge>
          <Badge variant="ok" icon="verified">ID verified</Badge>
          <Badge variant="warn">Pending offer</Badge>
          <Badge variant="info">New arrival</Badge>
          <Badge variant="ink">Class 3</Badge>
          <Badge>Excellent</Badge>
        </div>
      </div>

      <div className="cgroup">
        <div className="heading"><h3>Spec chips</h3><span className="lbl">.spec</span></div>
        <div className="row-flex">
          <Spec k="Range" v="62" unit="mi" />
          <Spec k="Battery" v="720" unit="wh" />
          <Spec k="Top speed" v="28" unit="mph" />
          <Spec k="Odometer" v="412" unit="mi" />
          <Spec k="Motor" v="750" unit="w" />
        </div>
      </div>
    </div>
  </section>
);

/* ===== MARKETPLACE COMPONENTS ===== */
const MarketplaceSection = () => (
  <section className="section">
    <SectionHead eyebrow="05 — Components" title="The marketplace" accent="kit." body="Listing cards do most of the work. Filters keep the rail quiet. Trust components surface the seller's verification without shouting it. Messaging pins the listing to the conversation." />

    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <div className="cgroup">
        <div className="heading"><h3>Listing card</h3><span className="lbl">3-up grid · default</span></div>
        <div className="grid-3">
          <ListingCard title="Sondors X Premium" year="2023" price="$1,890" was="$2,200" loc="Brooklyn · NY" range="62" battery="720" speed="28" miles="412" condition="Excellent" badge="Voltra Pick" sellerInitials="JM" sellerName="Jordan M." photo={PHOTOS.sondors} />
          <ListingCard title="Aventon Level.2" year="2022" price="$1,450" loc="Oakland · CA" range="55" battery="672" speed="28" miles="1,108" condition="Good" sellerInitials="PK" sellerName="Priya K." photo={PHOTOS.aventon} />
          <ListingCard title="Specialized Turbo Vado" year="2023" price="$2,650" loc="Chicago · IL" range="80" battery="710" speed="28" miles="240" condition="Like New" badge="Reduced" sellerInitials="AR" sellerName="Aisha R." photo={PHOTOS.specialized} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 32 }}>
        <div className="cgroup">
          <div className="heading"><h3>Filter rail</h3><span className="lbl">.filters</span></div>
          <FilterPanel />
        </div>
        <div className="cgroup">
          <div className="heading"><h3>Seller / trust card</h3><span className="lbl">.seller-card</span></div>
          <TrustPanel />
        </div>
      </div>

      <div className="cgroup">
        <div className="heading"><h3>Messaging</h3><span className="lbl">.thread</span></div>
        <MessageThread />
      </div>
    </div>
  </section>
);

/* ===== SCREENS ===== */
const ScreensSection = () => (
  <section className="section">
    <SectionHead eyebrow="06 — In context" title="Sample" accent="screens." body="Tokens and components together. Browse, listing detail, and seller profile — the three screens a peer-to-peer transaction lives on." />
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <BrowseScreen />
      <DetailScreen />
      <ProfileScreen />
    </div>
  </section>
);

/* ===== FOOTER ===== */
const Footer = () => (
  <footer className="footer">
    <div className="page">
      <div className="grid">
        <div>
          <div className="brand-line">VOLTRA</div>
          <p style={{ marginTop: 16, maxWidth: "36ch" }}>The peer-to-peer eBike marketplace. Verified sellers, escrow-backed payments, every bike inspected.</p>
        </div>
        <div><h5>Marketplace</h5><ul><li><a>Browse</a></li><li><a>Sell your bike</a></li><li><a>Local pickup</a></li><li><a>Shipping</a></li></ul></div>
        <div><h5>Trust</h5><ul><li><a>Voltra Escrow</a></li><li><a>Verification</a></li><li><a>Inspection guide</a></li><li><a>Dispute resolution</a></li></ul></div>
        <div><h5>Company</h5><ul><li><a>About</a></li><li><a>Press</a></li><li><a>Careers</a></li><li><a>Contact</a></li></ul></div>
      </div>
      <div className="copyright">
        <span>VOLTRA / DESIGN SYSTEM v1.0 / APR 2026</span>
        <span>© 2026 VOLTRA, INC.</span>
      </div>
    </div>
  </footer>
);

/* ===== APP ===== */
const App = () => (
  <div data-screen-label="00 Design system">
    <div className="page">
      <Topbar />
      <Hero />
    </div>
    <div className="page">
      <ColorSection />
      <TypeSection />
      <ShapeSection />
      <ControlsSection />
      <MarketplaceSection />
      <ScreensSection />
    </div>
    <Footer />
  </div>
);

ReactDOM.createRoot(document.getElementById("app")).render(<App />);
