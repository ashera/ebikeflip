/* global React, Icon, Button, Badge, Spec, Segmented */
const { useState: useStateMP } = React;

/* ---------- LISTING CARD ---------- */
const ListingCard = ({
  title = "Sondors X Premium",
  year = "2023",
  price = "$1,890",
  was,
  loc = "Brooklyn · NY",
  range = "62",
  battery = "720",
  speed = "28",
  miles = "412",
  condition = "Excellent",
  badge,
  sellerInitials = "JM",
  sellerName = "Jordan M.",
  verified = true,
  imgLabel = "Bike photo",
  photo,
}) => (
  <article className="listing">
    <div className="img-wrap">
      {photo
        ? <div className="photo" style={{ backgroundImage: `url(${photo})` }} />
        : <div className="img">{imgLabel}</div>}
      <div className="img-flag">
        {badge && <Badge variant="volt">{badge}</Badge>}
        <Badge variant="ink">{condition}</Badge>
      </div>
      <button className="img-fav" aria-label="Save"><Icon name="heart" className="ico sm" /></button>
    </div>
    <div className="body">
      <div className="meta-row">
        <div className="seller">
          <span className="avatar">{sellerInitials}</span>
          <span>{sellerName}</span>
          {verified && <Icon name="verified" className="ico sm" style={{ color: "var(--volt-500)" }} />}
        </div>
        <span className="loc">{loc}</span>
      </div>
      <h3 className="title">{title} <span style={{ color: "var(--ink-4)", fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 500 }}>'{year.slice(-2)}</span></h3>
      <div className="specs">
        <Spec k="Range" v={range} unit="mi" />
        <Spec k="Battery" v={battery} unit="wh" />
        <Spec k="Top" v={speed} unit="mph" />
      </div>
      <div className="price-row">
        <div className="price">{price}{was && <span className="was">{was}</span>}</div>
        <span className="loc">{miles} mi · 1 owner</span>
      </div>
    </div>
  </article>
);

/* ---------- FILTER PANEL ---------- */
const FilterPanel = () => {
  const [bikeType, setBikeType] = useStateMP(["commuter"]);
  const toggle = (v) => setBikeType(b => b.includes(v) ? b.filter(x => x !== v) : [...b, v]);

  return (
    <aside className="filters">
      <div className="filter-group">
        <h4>Type <span className="clear">Clear</span></h4>
        <div className="chip-row">
          {["Commuter", "Cargo", "Mountain", "Folding", "Road", "Cruiser"].map(t => {
            const v = t.toLowerCase();
            return <button key={t} className={`chip ${bikeType.includes(v) ? "is-active" : ""}`} onClick={() => toggle(v)}>{t}</button>;
          })}
        </div>
      </div>

      <div className="filter-group">
        <h4>Price</h4>
        <div className="range">
          <input className="input" placeholder="$500" />
          <span style={{ color: "var(--ink-4)" }}>—</span>
          <input className="input" placeholder="$5,000" />
        </div>
        <input type="range" className="slider" defaultValue="60" />
      </div>

      <div className="filter-group">
        <h4>Range (mi)</h4>
        <div className="range">
          <input className="input" placeholder="20+" />
          <span style={{ color: "var(--ink-4)" }}>—</span>
          <input className="input" placeholder="80+" />
        </div>
      </div>

      <div className="filter-group">
        <h4>Condition</h4>
        <div className="checks">
          {[["Like New", 28], ["Excellent", 142], ["Good", 89], ["Fair", 31]].map(([c, n]) => (
            <label className="check" key={c}>
              <span className="left"><input type="checkbox" defaultChecked={c === "Excellent"} /> {c}</span>
              <span className="count">{n}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <h4>Brand</h4>
        <div className="checks">
          {[["Specialized", 64], ["Trek", 51], ["Rad Power", 37], ["Aventon", 28], ["Sondors", 19]].map(([c, n]) => (
            <label className="check" key={c}>
              <span className="left"><input type="checkbox" /> {c}</span>
              <span className="count">{n}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <h4>Seller</h4>
        <div className="checks">
          <label className="check"><span className="left"><input type="checkbox" defaultChecked /> ID-verified only</span></label>
          <label className="check"><span className="left"><input type="checkbox" /> 4★+ rating</span></label>
          <label className="check"><span className="left"><input type="checkbox" /> Local pickup</span></label>
        </div>
      </div>
    </aside>
  );
};

/* ---------- TRUST PANEL ---------- */
const TrustPanel = () => (
  <div className="seller-card" style={{ maxWidth: 420 }}>
    <div className="head">
      <div className="avatar-lg">JM</div>
      <div>
        <div className="name">Jordan M.</div>
        <div className="stars">★★★★★ <span style={{ color: "var(--ink-3)", fontFamily: "var(--font-mono)", fontSize: 11, marginLeft: 4 }}>4.9 (47)</span></div>
        <div className="since">Member since Mar 2022 · Brooklyn, NY</div>
      </div>
    </div>
    <div className="stat-row">
      <div className="stat"><b>23</b><span>Sold</span></div>
      <div className="stat"><b>2h</b><span>Reply time</span></div>
      <div className="stat"><b>98%</b><span>Response</span></div>
    </div>
    <div className="trust-list">
      <div className="row"><span>ID verified</span><Icon name="check" className="ico sm check-mark" /></div>
      <div className="row"><span>Phone confirmed</span><Icon name="check" className="ico sm check-mark" /></div>
      <div className="row"><span>Bank account linked</span><Icon name="check" className="ico sm check-mark" /></div>
      <div className="row"><span>Voltra escrow eligible</span><Icon name="check" className="ico sm check-mark" /></div>
    </div>
    <div style={{ display: "flex", gap: 8 }}>
      <Button variant="dark" block icon="msg">Message Jordan</Button>
      <Button variant="ghost" icon="user" />
    </div>
  </div>
);

/* ---------- MESSAGE THREAD ---------- */
const MessageThread = () => (
  <div className="thread">
    <div className="thread-list">
      <div className="head">Inbox</div>
      {[
        { name: "Jordan M.", initials: "JM", time: "2h", listing: "Sondors X Premium '23", preview: "Yeah, you can swing by Saturday morning to test ride.", active: true },
        { name: "Priya K.", initials: "PK", time: "1d", listing: "Aventon Level.2 '22", preview: "I dropped the price. Still interested?" },
        { name: "Marcus T.", initials: "MT", time: "3d", listing: "Trek Allant+ 7 '21", preview: "Thanks! Want me to ship it via BikeFlights?" },
      ].map((t, i) => (
        <div key={i} className={`thread-item ${t.active ? "is-active" : ""}`}>
          <div className="avatar">{t.initials}</div>
          <div className="meta">
            <div className="listing-tag">{t.listing}</div>
            <div className="name">{t.name} <span className="time">{t.time}</span></div>
            <div className="preview">{t.preview}</div>
          </div>
        </div>
      ))}
    </div>
    <div className="thread-pane">
      <div className="head">
        <div className="listing-mini">
          <div className="ph"></div>
          <div>
            <div style={{ fontWeight: 600, color: "var(--ink-1)", fontSize: 14 }}>Sondors X Premium '23</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-4)" }}>$1,890 · Brooklyn</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Badge variant="ok" icon="check">Verified buyer</Badge>
          <Button variant="ghost" size="sm">View listing</Button>
        </div>
      </div>
      <div className="messages">
        <div className="bubble --in">Hey, is this still available? Looking for something for my Manhattan commute.<span className="ts">10:24 AM</span></div>
        <div className="bubble --out">Yes! It's in great shape — only used for weekend rides. Want to come test ride?<span className="ts">10:31 AM</span></div>
        <div className="bubble --in">Definitely. Are you free Saturday?<span className="ts">10:34 AM</span></div>
        <div className="bubble --out">Yeah, you can swing by Saturday morning. I'll send my address through Voltra's secure share.<span className="ts">10:41 AM</span></div>
      </div>
      <div className="composer">
        <Button variant="ghost" size="sm" icon="paperclip" />
        <input className="input" placeholder="Write a message…" />
        <Button variant="primary" size="sm" iconRight="send">Send</Button>
      </div>
    </div>
  </div>
);

Object.assign(window, { ListingCard, FilterPanel, TrustPanel, MessageThread });
