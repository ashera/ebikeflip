/* global React */
const { useState } = React;

/* ---------- ICON SET ---------- */
const Icon = ({ name, className = "ico" }) => {
  const paths = {
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
    heart: <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />,
    bolt: <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />,
    battery: <><rect x="2" y="7" width="18" height="10" rx="2"/><path d="M22 11v2"/><path d="M6 10v4M10 10v4M14 10v4"/></>,
    speed: <><path d="M12 14v-4"/><circle cx="12" cy="14" r="8"/><path d="M5 6 4 4M19 6l1-2"/></>,
    range: <><path d="M3 12h18"/><path d="m14 5 7 7-7 7"/></>,
    location: <><path d="M12 22s7-7.6 7-13a7 7 0 1 0-14 0c0 5.4 7 13 7 13z"/><circle cx="12" cy="9" r="2.5"/></>,
    shield: <path d="M12 2 4 5v6c0 5 3.5 9.4 8 11 4.5-1.6 8-6 8-11V5l-8-3z"/>,
    check: <path d="m4 12 5 5L20 6"/>,
    star: <path d="m12 3 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8 6.2 21l1.1-6.5L2.6 9.8l6.5-.9L12 3z"/>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></>,
    msg: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>,
    cart: <><circle cx="9" cy="20" r="1.5"/><circle cx="17" cy="20" r="1.5"/><path d="M3 4h2l3 12h12l2-8H6"/></>,
    chev: <path d="m6 9 6 6 6-6"/>,
    plus: <><path d="M12 5v14"/><path d="M5 12h14"/></>,
    arrow: <path d="M5 12h14m-5-5 5 5-5 5"/>,
    grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    list: <><path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3.5" cy="6" r="1"/><circle cx="3.5" cy="12" r="1"/><circle cx="3.5" cy="18" r="1"/></>,
    filter: <path d="M3 5h18l-7 9v6l-4-2v-4z"/>,
    send: <path d="m22 2-7 20-4-9-9-4 20-7z"/>,
    paperclip: <path d="m21 11-9 9a5 5 0 0 1-7-7l9-9a3 3 0 0 1 5 5l-9 9a1.5 1.5 0 1 1-2.1-2.1L15 9"/>,
    verified: <><path d="m4.5 9 2-3 3.5.5L12 3l2 3.5 3.5-.5 2 3-1.5 3 1.5 3-2 3-3.5-.5L12 21l-2-3.5-3.5.5-2-3 1.5-3z"/><path d="m9 12 2 2 4-4"/></>,
    pin: <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/></>,
    eye: <><path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z"/><circle cx="12" cy="12" r="3"/></>,
    moon: <path d="M21 12.5A9 9 0 1 1 11.5 3a7 7 0 0 0 9.5 9.5z"/>,
  };
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      {paths[name]}
    </svg>
  );
};

/* ---------- BUTTONS ---------- */
const Button = ({ variant = "dark", size, icon, iconRight, block, children, ...rest }) => {
  const cls = ["btn", `--${variant}`];
  if (size) cls.push(`--${size}`);
  if (block) cls.push("--block");
  return (
    <button className={cls.join(" ")} {...rest}>
      {icon && <Icon name={icon} className="ico sm" />}
      {children}
      {iconRight && <Icon name={iconRight} className="ico sm" />}
    </button>
  );
};

/* ---------- BADGE ---------- */
const Badge = ({ variant = "default", icon, size, children }) => {
  const cls = ["badge"];
  if (variant !== "default") cls.push(`--${variant}`);
  if (size) cls.push(`--${size}`);
  return <span className={cls.join(" ")}>{icon && <Icon name={icon} className="ico sm" />} {children}</span>;
};

/* ---------- SPEC CHIP ---------- */
const Spec = ({ k, v, unit }) => (
  <div className="spec">
    <div className="v">{v}{unit && <small>{unit}</small>}</div>
    <div className="k">{k}</div>
  </div>
);

/* ---------- SEGMENTED ---------- */
const Segmented = ({ options, value, onChange }) => (
  <div className="segmented">
    {options.map(o => (
      <button key={o.value} className={value === o.value ? "is-active" : ""} onClick={() => onChange(o.value)}>{o.label}</button>
    ))}
  </div>
);

/* ---------- TOPBAR ---------- */
const Topbar = () => (
  <header className="topbar">
    <div className="brand">
      <span className="brand-mark">V</span>
      VOLTRA
    </div>
    <nav>
      <a href="#">Browse</a>
      <a href="#">Sell</a>
      <a href="#">How it works</a>
      <a href="#">Trust & Safety</a>
      <a href="#">Help</a>
    </nav>
    <div className="actions">
      <Button variant="ghost" size="sm" icon="msg">Inbox</Button>
      <Button variant="dark" size="sm" icon="plus">List your bike</Button>
    </div>
  </header>
);

Object.assign(window, { Icon, Button, Badge, Spec, Segmented, Topbar });
