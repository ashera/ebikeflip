/* global React, Icon, Button, Badge, Spec, Segmented, ListingCard, FilterPanel */
const { useState: useStateSC } = React;

/* ---------- BROWSE SCREEN ---------- */
const BrowseScreen = () => {
  const [view, setView] = useStateSC("grid");
  const [sort, setSort] = useStateSC("recent");

  const listings = [
    { title: "Sondors X Premium", year: "2023", price: "$1,890", was: "$2,200", loc: "Brooklyn · NY", range: "62", battery: "720", speed: "28", miles: "412", condition: "Excellent", badge: "Voltra Pick", sellerInitials: "JM", sellerName: "Jordan M.", photo: PHOTOS.sondors },
    { title: "Aventon Level.2", year: "2022", price: "$1,450", loc: "Oakland · CA", range: "55", battery: "672", speed: "28", miles: "1,108", condition: "Good", sellerInitials: "PK", sellerName: "Priya K.", photo: PHOTOS.aventon },
    { title: "Trek Allant+ 7", year: "2021", price: "$2,790", loc: "Portland · OR", range: "70", battery: "625", speed: "28", miles: "892", condition: "Excellent", badge: "Reduced", sellerInitials: "MT", sellerName: "Marcus T.", photo: PHOTOS.trek },
    { title: "Specialized Turbo Vado", year: "2023", price: "$2,650", loc: "Chicago · IL", range: "80", battery: "710", speed: "28", miles: "240", condition: "Like New", sellerInitials: "AR", sellerName: "Aisha R.", photo: PHOTOS.specialized },
    { title: "Rad Power RadCity 5", year: "2022", price: "$1,120", loc: "Austin · TX", range: "45", battery: "672", speed: "20", miles: "1,690", condition: "Good", sellerInitials: "DL", sellerName: "Diego L.", photo: PHOTOS.rad },
    { title: "Tern GSD S10", year: "2023", price: "$3,890", loc: "Seattle · WA", range: "90", battery: "800", speed: "20", miles: "180", condition: "Like New", badge: "Cargo", sellerInitials: "EC", sellerName: "Eli C.", photo: PHOTOS.tern },
  ];

  return (
    <div className="screen">
      <div className="screen-bar">
        <span className="dot" /><span className="dot" /><span className="dot" />
        <span className="url">voltra.bike / browse / commuter</span>
      </div>
      <div className="browse-grid">
        <FilterPanel />
        <div>
          <div className="browse-toolbar">
            <div className="left">
              <h3>Commuter eBikes</h3>
              <span className="count">312 results · within 50mi of NYC</span>
            </div>
            <div className="left">
              <div className="search-input" style={{ width: 240 }}>
                <span className="icon"><Icon name="search" className="ico sm" /></span>
                <input className="input" placeholder="Brand or model" />
              </div>
              <Segmented options={[{ value: "recent", label: "Newest" }, { value: "low", label: "Price ↑" }, { value: "high", label: "Price ↓" }]} value={sort} onChange={setSort} />
              <Segmented options={[{ value: "grid", label: "Grid" }, { value: "list", label: "List" }]} value={view} onChange={setView} />
            </div>
          </div>
          <div className="results-grid">
            {listings.map((l, i) => <ListingCard key={i} {...l} />)}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------- DETAIL SCREEN ---------- */
const DetailScreen = () => (
  <div className="screen">
    <div className="screen-bar">
      <span className="dot" /><span className="dot" /><span className="dot" />
      <span className="url">voltra.bike / listings / sondors-x-premium-23-bk-jm</span>
    </div>
    <div className="detail">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-4)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Browse / Commuter / Sondors X Premium
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="ghost" size="sm" icon="heart">Save</Button>
          <Button variant="ghost" size="sm">Share</Button>
        </div>
      </div>

      <div className="detail-head">
        <div className="detail-gallery">
          <div className="main" style={{ backgroundImage: `url(${PHOTOS.detailMain})`, backgroundSize: "cover", backgroundPosition: "center" }}></div>
          <div className="thumb" style={{ backgroundImage: `url(${PHOTOS.detail2})`, backgroundSize: "cover", backgroundPosition: "center" }}></div>
          <div className="thumb" style={{ backgroundImage: `url(${PHOTOS.detail3})`, backgroundSize: "cover", backgroundPosition: "center" }}></div>
          <div className="thumb" style={{ backgroundImage: `url(${PHOTOS.detail4})`, backgroundSize: "cover", backgroundPosition: "center" }}></div>
          <div className="thumb">+4 more</div>
        </div>

        <div className="detail-side">
          <div>
            <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
              <Badge variant="volt" icon="bolt">Voltra Pick</Badge>
              <Badge variant="ok" icon="verified">Verified seller</Badge>
              <Badge>Excellent condition</Badge>
            </div>
            <h1>Sondors X Premium <span style={{ color: "var(--ink-4)" }}>'23</span></h1>
            <div className="sub">Step-thru · Matte black · Size M · 1 owner</div>
          </div>

          <div className="price-block">
            <div className="price">$1,890<span className="was">$2,200</span></div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--volt-700)", marginTop: 6 }}>↓ Saved $310 · price drop 4 days ago</div>
          </div>

          <div className="spec-grid">
            <Spec k="Range" v="62" unit="mi" />
            <Spec k="Battery" v="720" unit="wh" />
            <Spec k="Top speed" v="28" unit="mph" />
            <Spec k="Odometer" v="412" unit="mi" />
            <Spec k="Motor" v="750" unit="w" />
            <Spec k="Class" v="3" />
            <Spec k="Weight" v="62" unit="lb" />
            <Spec k="Brakes" v="Hyd" />
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="primary" size="lg" block icon="msg">Message seller</Button>
            <Button variant="dark" size="lg" icon="bolt">Make offer</Button>
          </div>

          <div style={{ background: "var(--surface-sunken)", borderRadius: "var(--r-3)", padding: 16, display: "flex", gap: 12, alignItems: "flex-start" }}>
            <Icon name="shield" className="ico" style={{ color: "var(--volt-500)", flex: "none", marginTop: 2 }} />
            <div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5 }}>
              <b style={{ color: "var(--ink-1)" }}>Voltra Escrow available</b><br/>
              We hold payment until you've inspected the bike. <a href="#" style={{ color: "var(--volt-700)" }}>How escrow works →</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

/* ---------- PROFILE SCREEN ---------- */
const ProfileScreen = () => (
  <div className="screen">
    <div className="screen-bar">
      <span className="dot" /><span className="dot" /><span className="dot" />
      <span className="url">voltra.bike / sellers / jordan-m</span>
    </div>
    <div className="profile-page">
      <div className="profile-head">
        <div className="avatar-xl">JM</div>
        <div>
          <h2>Jordan M.</h2>
          <div className="meta">Brooklyn, NY · Member since Mar 2022</div>
          <div className="badges">
            <Badge variant="ok" icon="verified">ID verified</Badge>
            <Badge variant="volt-soft" icon="bolt">Top seller</Badge>
            <Badge icon="check">Phone confirmed</Badge>
            <Badge icon="check">Escrow eligible</Badge>
          </div>
        </div>
        <div className="stats">
          <div><b>23</b><span>Sold</span></div>
          <div><b>4.9</b><span>Rating</span></div>
          <div><b>47</b><span>Reviews</span></div>
          <div><b>2h</b><span>Reply</span></div>
        </div>
      </div>

      <div className="profile-body">
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--ink-1)", margin: 0, letterSpacing: "-0.02em" }}>Active listings <span style={{ color: "var(--ink-4)", fontSize: 14, fontFamily: "var(--font-mono)", fontWeight: 500 }}>4</span></h3>
            <Segmented options={[{ value: "active", label: "Active" }, { value: "sold", label: "Sold" }, { value: "reviews", label: "Reviews" }]} value="active" onChange={() => {}} />
          </div>
          <div className="profile-listings">
            <ListingCard title="Sondors X Premium" year="2023" price="$1,890" was="$2,200" loc="Brooklyn · NY" range="62" battery="720" speed="28" miles="412" condition="Excellent" badge="Voltra Pick" sellerInitials="JM" sellerName="Jordan M." photo={PHOTOS.sondors} />
            <ListingCard title="Vanmoof S3" year="2021" price="$1,250" loc="Brooklyn · NY" range="37" battery="504" speed="20" miles="2,340" condition="Good" sellerInitials="JM" sellerName="Jordan M." photo={PHOTOS.vanmoof} />
            <ListingCard title="Cannondale Quick Neo" year="2022" price="$2,100" loc="Brooklyn · NY" range="60" battery="500" speed="20" miles="610" condition="Like New" sellerInitials="JM" sellerName="Jordan M." photo={PHOTOS.cannondale} />
            <ListingCard title="Brompton Electric C-Line" year="2023" price="$2,990" loc="Brooklyn · NY" range="45" battery="300" speed="15" miles="180" condition="Like New" badge="Folding" sellerInitials="JM" sellerName="Jordan M." photo={PHOTOS.brompton} />
          </div>
        </div>

        <aside style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="seller-card">
            <h4 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 18, color: "var(--ink-1)", letterSpacing: "-0.01em" }}>About</h4>
            <p style={{ margin: 0, fontSize: 14, color: "var(--ink-2)", lineHeight: 1.55 }}>
              Bike mechanic by trade, eBike collector by hobby. Every bike I list has been serviced, tuned, and tested on the same Brooklyn streets you'll ride it on.
            </p>
            <div className="trust-list">
              <div className="row"><span>Languages</span><span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-3)" }}>EN · ES</span></div>
              <div className="row"><span>Pickup</span><span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-3)" }}>Williamsburg</span></div>
              <div className="row"><span>Ships</span><span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-3)" }}>BikeFlights</span></div>
            </div>
          </div>
          <div className="seller-card">
            <h4 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 18, color: "var(--ink-1)", letterSpacing: "-0.01em" }}>Recent review</h4>
            <div className="stars" style={{ color: "var(--volt-500)", letterSpacing: 2 }}>★★★★★</div>
            <p style={{ margin: 0, fontSize: 14, color: "var(--ink-2)", lineHeight: 1.55 }}>
              "Jordan was responsive, transparent about wear, and even threw in a spare key. The bike rode exactly as described."
            </p>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-4)", textTransform: "uppercase", letterSpacing: "0.1em" }}>— Sam W. · 2 weeks ago</div>
          </div>
        </aside>
      </div>
    </div>
  </div>
);

Object.assign(window, { BrowseScreen, DetailScreen, ProfileScreen });
