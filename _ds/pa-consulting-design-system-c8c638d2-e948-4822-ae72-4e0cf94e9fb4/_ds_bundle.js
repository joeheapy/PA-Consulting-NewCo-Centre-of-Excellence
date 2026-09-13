/* @ds-bundle: {"format":4,"namespace":"PAConsultingDesignSystem_c8c638","components":[{"name":"Badge","sourcePath":"components/display/Badge.jsx"},{"name":"Card","sourcePath":"components/display/Card.jsx"},{"name":"Tag","sourcePath":"components/display/Tag.jsx"},{"name":"Tooltip","sourcePath":"components/display/Tooltip.jsx"},{"name":"Alert","sourcePath":"components/feedback/Alert.jsx"},{"name":"Dialog","sourcePath":"components/feedback/Dialog.jsx"},{"name":"Progress","sourcePath":"components/feedback/Progress.jsx"},{"name":"Toast","sourcePath":"components/feedback/Toast.jsx"},{"name":"Button","sourcePath":"components/forms/Button.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"IconButton","sourcePath":"components/forms/IconButton.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Radio","sourcePath":"components/forms/Radio.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"Tabs","sourcePath":"components/navigation/Tabs.jsx"}],"sourceHashes":{"components/display/Badge.jsx":"c5f93837a87c","components/display/Card.jsx":"57896eeb67ca","components/display/Tag.jsx":"74cee5ceaf83","components/display/Tooltip.jsx":"c8fdaeed4d0d","components/feedback/Alert.jsx":"0359a83b5294","components/feedback/Dialog.jsx":"d144cc790a23","components/feedback/Progress.jsx":"3a3e1bbc85db","components/feedback/Toast.jsx":"d715d5ea1a24","components/forms/Button.jsx":"af775250225c","components/forms/Checkbox.jsx":"d8f1c1880bb4","components/forms/IconButton.jsx":"50e9ed45ef20","components/forms/Input.jsx":"62b2fb0b908f","components/forms/Radio.jsx":"1e59c26e0dc6","components/forms/Select.jsx":"3b1812cecfbc","components/forms/Switch.jsx":"bfa45a335ea4","components/navigation/Tabs.jsx":"acb594bba690"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.PAConsultingDesignSystem_c8c638 = window.PAConsultingDesignSystem_c8c638 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/display/Badge.jsx
try { (() => {
function Badge({
  tone = 'neutral',
  children,
  style
}) {
  const t = {
    neutral: {
      background: 'var(--pa-grey-01,#E8ECF2)',
      color: 'var(--pa-grey-04,#36465A)'
    },
    info: {
      background: 'var(--pa-aqua-01,#CDECF2)',
      color: 'var(--pa-aqua-05,#024D78)'
    },
    success: {
      background: 'var(--pa-success,#008471)',
      color: '#fff'
    },
    warning: {
      background: 'var(--pa-warning,#FF6C3B)',
      color: 'var(--pa-dark-blue,#00172D)'
    },
    error: {
      background: 'var(--pa-error,#CC1D63)',
      color: '#fff'
    }
  }[tone];
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-block',
      font: '400 11px/1 var(--font-ancillary,monospace)',
      letterSpacing: '.04em',
      padding: '5px 9px',
      borderRadius: 'var(--radius-sm,2px)',
      ...t,
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Badge.jsx", error: String((e && e.message) || e) }); }

// components/display/Card.jsx
try { (() => {
function Card({
  title,
  eyebrow,
  children,
  footer,
  variant = 'border',
  onClick,
  style
}) {
  const surf = variant === 'shadow' ? {
    boxShadow: 'var(--shadow-card,0 1px 3px rgba(0,23,45,.08))',
    borderRadius: 'var(--radius-md,4px)'
  } : variant === 'dark' ? {
    background: 'var(--pa-dark-blue,#00172D)',
    borderRadius: 'var(--radius-sm,2px)'
  } : {
    border: '1px solid var(--pa-grey-01,#E8ECF2)',
    borderRadius: 'var(--radius-sm,2px)'
  };
  const dark = variant === 'dark';
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClick,
    style: {
      background: dark ? undefined : '#fff',
      padding: '20px 22px',
      cursor: onClick ? 'pointer' : undefined,
      ...surf,
      ...style
    }
  }, eyebrow && /*#__PURE__*/React.createElement("div", {
    style: {
      font: '400 11px/1 var(--font-ancillary,monospace)',
      letterSpacing: '.08em',
      textTransform: 'uppercase',
      color: dark ? 'var(--pa-grey-02,#A2B3C9)' : 'var(--pa-grey-03,#64778A)',
      marginBottom: 10
    }
  }, eyebrow), title && /*#__PURE__*/React.createElement("div", {
    style: {
      font: '550 20px/1.3 var(--font-companion,serif)',
      color: dark ? '#fff' : 'var(--pa-aqua-05,#024D78)',
      marginBottom: children ? 8 : 0
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      font: '400 15px/1.6 var(--font-companion,serif)',
      color: dark ? 'var(--pa-grey-01,#E8ECF2)' : 'var(--pa-dark-blue,#00172D)'
    }
  }, children), footer && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14
    }
  }, footer));
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Card.jsx", error: String((e && e.message) || e) }); }

// components/display/Tag.jsx
try { (() => {
function Tag({
  children,
  onRemove,
  dark,
  style
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      font: '400 12px/1 var(--font-ancillary,monospace)',
      padding: '7px 11px',
      border: `1px solid ${dark ? 'var(--pa-grey-03,#64778A)' : 'var(--pa-grey-02,#A2B3C9)'}`,
      color: dark ? '#fff' : 'var(--pa-dark-blue,#00172D)',
      background: 'transparent',
      ...style
    }
  }, children, onRemove && /*#__PURE__*/React.createElement("button", {
    type: 'button',
    onClick: onRemove,
    "aria-label": "Remove",
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 24,
      minHeight: 24,
      margin: '-6px -8px -6px -2px',
      background: 'none',
      border: 'none',
      font: 'inherit',
      cursor: 'pointer',
      color: 'var(--pa-grey-03,#64778A)'
    }
  }, "\xD7"));
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Tag.jsx", error: String((e && e.message) || e) }); }

// components/display/Tooltip.jsx
try { (() => {
function Tooltip({
  label,
  children,
  style
}) {
  const [v, setV] = React.useState(false);
  return /*#__PURE__*/React.createElement("span", {
    onMouseEnter: () => setV(true),
    onMouseLeave: () => setV(false),
    style: {
      position: 'relative',
      display: 'inline-block',
      ...style
    }
  }, children, v && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      bottom: 'calc(100% + 8px)',
      left: '50%',
      transform: 'translateX(-50%)',
      whiteSpace: 'nowrap',
      background: 'var(--pa-dark-blue,#00172D)',
      color: '#fff',
      font: '400 12px/1.3 var(--font-primary,sans-serif)',
      padding: '7px 10px',
      borderRadius: 'var(--radius-sm,2px)',
      zIndex: 10
    }
  }, label));
}
Object.assign(__ds_scope, { Tooltip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Tooltip.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Alert.jsx
try { (() => {
const TONES = {
  success: {
    c: 'var(--pa-success,#008471)',
    label: 'SUCCESS'
  },
  warning: {
    c: 'var(--pa-warning,#FF6C3B)',
    label: 'WARNING'
  },
  error: {
    c: 'var(--pa-error,#CC1D63)',
    label: 'ERROR'
  }
};
function Alert({
  tone = 'success',
  title,
  children,
  onDismiss,
  style
}) {
  const t = TONES[tone];
  return /*#__PURE__*/React.createElement("div", {
    role: "alert",
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 14,
      background: '#fff',
      border: '1px solid var(--pa-grey-01,#E8ECF2)',
      borderRadius: 'var(--radius-sm,2px)',
      padding: '14px 16px',
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 10,
      height: 10,
      flex: 'none',
      marginTop: 3,
      background: t.c
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '400 11px/1 var(--font-ancillary,monospace)',
      letterSpacing: '.08em',
      color: t.c
    }
  }, t.label), title && /*#__PURE__*/React.createElement("div", {
    style: {
      font: '450 15px/1.3 var(--font-primary,sans-serif)',
      color: 'var(--pa-dark-blue,#00172D)',
      marginTop: 6
    }
  }, title), children && /*#__PURE__*/React.createElement("div", {
    style: {
      font: '400 14px/1.5 var(--font-companion,serif)',
      color: 'var(--pa-grey-03,#64778A)',
      marginTop: 4
    }
  }, children)), onDismiss && /*#__PURE__*/React.createElement("button", {
    onClick: onDismiss,
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: 'var(--pa-grey-03,#64778A)',
      fontSize: 16,
      lineHeight: 1,
      padding: 0
    }
  }, "\xD7"));
}
Object.assign(__ds_scope, { Alert });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Alert.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Dialog.jsx
try { (() => {
function Dialog({
  open,
  title,
  children,
  footer,
  onClose,
  width = 480,
  style
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,23,45,.55)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      width,
      maxWidth: '90vw',
      background: '#fff',
      borderRadius: 'var(--radius-md,4px)',
      boxShadow: 'var(--shadow-overlay,0 8px 40px rgba(0,23,45,.18))',
      padding: '26px 28px',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '400 24px/1.25 var(--font-primary,sans-serif)',
      color: 'var(--pa-dark-blue,#00172D)'
    }
  }, title), onClose && /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: 'var(--pa-grey-03,#64778A)',
      fontSize: 20,
      lineHeight: 1,
      padding: 0
    }
  }, "\xD7")), /*#__PURE__*/React.createElement("div", {
    style: {
      font: '400 15px/1.6 var(--font-companion,serif)',
      color: 'var(--pa-dark-blue,#00172D)',
      marginTop: 12
    }
  }, children), footer && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      justifyContent: 'flex-end',
      marginTop: 22
    }
  }, footer)));
}
Object.assign(__ds_scope, { Dialog });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Dialog.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Progress.jsx
try { (() => {
function Progress({
  value = 0,
  level,
  label,
  showValue,
  style
}) {
  const lv = level || (value >= 67 ? 'high' : value >= 34 ? 'medium' : 'low');
  const c = {
    high: 'var(--pa-success,#008471)',
    medium: 'var(--pa-warning,#FF6C3B)',
    low: 'var(--pa-error,#CC1D63)'
  }[lv];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      ...style
    }
  }, (label || showValue) && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: 8
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      font: '450 13px/1 var(--font-primary,sans-serif)',
      color: 'var(--pa-dark-blue,#00172D)'
    }
  }, label), showValue && /*#__PURE__*/React.createElement("span", {
    style: {
      font: '400 12px/1 var(--font-ancillary,monospace)',
      color: 'var(--pa-grey-03,#64778A)'
    }
  }, Math.round(value), "%")), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 8,
      background: 'var(--pa-grey-01,#E8ECF2)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      width: `${Math.min(100, Math.max(0, value))}%`,
      background: c,
      transition: 'width .3s'
    }
  })));
}
Object.assign(__ds_scope, { Progress });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Progress.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Toast.jsx
try { (() => {
const C = {
  success: 'var(--pa-success,#008471)',
  warning: 'var(--pa-warning,#FF6C3B)',
  error: 'var(--pa-error,#CC1D63)',
  info: 'var(--pa-aqua-04,#0580A7)'
};
function Toast({
  tone = 'info',
  children,
  onDismiss,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    role: "status",
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 12,
      background: 'var(--pa-dark-blue,#00172D)',
      color: '#fff',
      padding: '12px 16px',
      borderRadius: 'var(--radius-sm,2px)',
      boxShadow: 'var(--shadow-overlay,0 8px 40px rgba(0,23,45,.18))',
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      background: C[tone],
      flex: 'none'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '400 14px/1.4 var(--font-primary,sans-serif)'
    }
  }, children), onDismiss && /*#__PURE__*/React.createElement("button", {
    onClick: onDismiss,
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: 'var(--pa-grey-02,#A2B3C9)',
      fontSize: 15,
      lineHeight: 1,
      padding: 0
    }
  }, "\xD7"));
}
Object.assign(__ds_scope, { Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Toast.jsx", error: String((e && e.message) || e) }); }

// components/forms/Button.jsx
try { (() => {
function Button({
  variant = 'primary',
  size = 'md',
  disabled,
  children,
  onClick,
  style
}) {
  const [h, setH] = React.useState(false);
  const pad = {
    sm: '8px 14px',
    md: '11px 20px',
    lg: '14px 26px'
  }[size];
  const fs = {
    sm: 14,
    md: 16,
    lg: 18
  }[size];
  const red = 'var(--pa-red-accessible,#EA0027)',
    redDark = '#C40021';
  const base = {
    font: `450 ${fs}px/1 var(--font-primary,sans-serif)`,
    padding: pad,
    borderRadius: 'var(--radius-sm,2px)',
    cursor: disabled ? 'default' : 'pointer',
    border: '1px solid transparent',
    transition: 'background .15s,color .15s,border-color .15s',
    opacity: disabled ? .45 : 1,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8
  };
  const v = {
    primary: {
      background: h && !disabled ? redDark : red,
      color: '#fff'
    },
    secondary: {
      background: h && !disabled ? 'rgba(234,0,39,.06)' : 'transparent',
      color: red,
      borderColor: red
    },
    ghost: {
      background: 'transparent',
      color: h && !disabled ? redDark : red
    },
    dark: {
      background: h && !disabled ? '#0B2A47' : 'var(--pa-dark-blue,#00172D)',
      color: '#fff'
    }
  }[variant];
  return /*#__PURE__*/React.createElement("button", {
    disabled: disabled,
    onClick: onClick,
    onMouseEnter: () => setH(true),
    onMouseLeave: () => setH(false),
    style: {
      ...base,
      ...v,
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Button.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function Checkbox({
  label,
  checked,
  onChange,
  disabled,
  style
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      cursor: disabled ? 'default' : 'pointer',
      opacity: disabled ? .45 : 1,
      font: '400 15px/1.3 var(--font-primary,sans-serif)',
      color: 'var(--pa-dark-blue,#00172D)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 18,
      height: 18,
      flex: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: `1px solid ${checked ? 'var(--pa-red-accessible,#EA0027)' : 'var(--pa-grey-02,#A2B3C9)'}`,
      background: checked ? 'var(--pa-red-accessible,#EA0027)' : '#fff',
      borderRadius: 'var(--radius-sm,2px)',
      color: '#fff',
      fontSize: 12,
      transition: 'background .15s'
    }
  }, checked ? '✓' : ''), /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: !!checked,
    onChange: onChange,
    disabled: disabled,
    style: {
      position: 'absolute',
      opacity: 0,
      width: 0
    }
  }), label);
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/IconButton.jsx
try { (() => {
function IconButton({
  label,
  children,
  onClick,
  variant = 'ghost',
  disabled,
  style
}) {
  const [h, setH] = React.useState(false);
  const v = {
    ghost: {
      background: h ? 'var(--pa-grey-01,#E8ECF2)' : 'transparent',
      color: 'var(--pa-dark-blue,#00172D)'
    },
    primary: {
      background: h ? '#C40021' : 'var(--pa-red-accessible,#EA0027)',
      color: '#fff'
    }
  }[variant];
  return /*#__PURE__*/React.createElement("button", {
    "aria-label": label,
    title: label,
    disabled: disabled,
    onClick: onClick,
    onMouseEnter: () => setH(true),
    onMouseLeave: () => setH(false),
    style: {
      width: 40,
      height: 40,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: 'none',
      borderRadius: 'var(--radius-sm,2px)',
      cursor: disabled ? 'default' : 'pointer',
      transition: 'background .15s',
      opacity: disabled ? .45 : 1,
      ...v,
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function Input({
  label,
  hint,
  error,
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled,
  style
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'block',
      font: '450 14px/1.3 var(--font-primary,sans-serif)',
      color: 'var(--pa-dark-blue,#00172D)',
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      marginBottom: 6
    }
  }, label), /*#__PURE__*/React.createElement("input", {
    type: type,
    value: value,
    onChange: onChange,
    placeholder: placeholder,
    disabled: disabled,
    style: {
      display: 'block',
      width: '100%',
      boxSizing: 'border-box',
      font: '400 16px/1.4 var(--font-companion,serif)',
      color: 'var(--pa-dark-blue,#00172D)',
      padding: '10px 12px',
      background: disabled ? 'var(--pa-grey-01,#E8ECF2)' : '#fff',
      border: `1px solid ${error ? 'var(--pa-error,#CC1D63)' : 'var(--pa-grey-03,#64778A)'}`,
      borderRadius: 'var(--radius-sm,2px)',
      outlineColor: 'var(--pa-aqua-04,#0580A7)'
    }
  }), error ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      marginTop: 6,
      font: '400 12px/1.4 var(--font-primary,sans-serif)',
      color: 'var(--pa-error,#CC1D63)'
    }
  }, error) : hint ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      marginTop: 6,
      font: '400 12px/1.4 var(--font-primary,sans-serif)',
      color: 'var(--pa-grey-03,#64778A)'
    }
  }, hint) : null);
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Radio.jsx
try { (() => {
function Radio({
  label,
  checked,
  onChange,
  name,
  disabled,
  style
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      cursor: disabled ? 'default' : 'pointer',
      opacity: disabled ? .45 : 1,
      font: '400 15px/1.3 var(--font-primary,sans-serif)',
      color: 'var(--pa-dark-blue,#00172D)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 18,
      height: 18,
      flex: 'none',
      borderRadius: '50%',
      border: `1px solid ${checked ? 'var(--pa-red-accessible,#EA0027)' : 'var(--pa-grey-02,#A2B3C9)'}`,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'border-color .15s'
    }
  }, checked && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 10,
      height: 10,
      borderRadius: '50%',
      background: 'var(--pa-red-accessible,#EA0027)'
    }
  })), /*#__PURE__*/React.createElement("input", {
    type: "radio",
    name: name,
    checked: !!checked,
    onChange: onChange,
    disabled: disabled,
    style: {
      position: 'absolute',
      opacity: 0,
      width: 0
    }
  }), label);
}
Object.assign(__ds_scope, { Radio });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Radio.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function Select({
  label,
  options = [],
  value,
  onChange,
  disabled,
  style
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'block',
      font: '450 14px/1.3 var(--font-primary,sans-serif)',
      color: 'var(--pa-dark-blue,#00172D)',
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      marginBottom: 6
    }
  }, label), /*#__PURE__*/React.createElement("select", {
    value: value,
    onChange: onChange,
    disabled: disabled,
    style: {
      display: 'block',
      width: '100%',
      font: '400 16px/1.4 var(--font-primary,sans-serif)',
      color: 'var(--pa-dark-blue,#00172D)',
      padding: '10px 12px',
      background: disabled ? 'var(--pa-grey-01,#E8ECF2)' : '#fff',
      border: '1px solid var(--pa-grey-02,#A2B3C9)',
      borderRadius: 'var(--radius-sm,2px)'
    }
  }, options.map(o => typeof o === 'string' ? /*#__PURE__*/React.createElement("option", {
    key: o,
    value: o
  }, o) : /*#__PURE__*/React.createElement("option", {
    key: o.value,
    value: o.value
  }, o.label))));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
function Switch({
  label,
  checked,
  onChange,
  disabled,
  style
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      cursor: disabled ? 'default' : 'pointer',
      opacity: disabled ? .45 : 1,
      font: '400 15px/1.3 var(--font-primary,sans-serif)',
      color: 'var(--pa-dark-blue,#00172D)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    onClick: disabled ? undefined : onChange,
    style: {
      width: 38,
      height: 22,
      flex: 'none',
      borderRadius: 11,
      background: checked ? 'var(--pa-success,#008471)' : 'var(--pa-grey-02,#A2B3C9)',
      position: 'relative',
      transition: 'background .15s'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 2,
      left: checked ? 18 : 2,
      width: 18,
      height: 18,
      borderRadius: '50%',
      background: '#fff',
      transition: 'left .15s'
    }
  })), label);
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Tabs.jsx
try { (() => {
function Tabs({
  tabs = [],
  active,
  onChange,
  dark,
  style
}) {
  const [i, setI] = React.useState(0);
  const cur = active !== undefined ? active : i;
  const set = n => {
    setI(n);
    onChange && onChange(n);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 28,
      borderBottom: `1px solid ${dark ? 'var(--pa-grey-03,#64778A)' : 'var(--pa-grey-01,#E8ECF2)'}`,
      ...style
    }
  }, tabs.map((t, n) => /*#__PURE__*/React.createElement("button", {
    key: n,
    onClick: () => set(n),
    style: {
      font: `${n === cur ? 450 : 400} 15px/1 var(--font-primary,sans-serif)`,
      color: n === cur ? dark ? '#fff' : 'var(--pa-dark-blue,#00172D)' : dark ? 'var(--pa-grey-02,#A2B3C9)' : 'var(--pa-grey-03,#64778A)',
      background: 'none',
      border: 'none',
      borderBottom: `2px solid ${n === cur ? 'var(--pa-red-accessible,#EA0027)' : 'transparent'}`,
      padding: '10px 2px 12px',
      marginBottom: -1,
      cursor: 'pointer',
      transition: 'color .15s'
    }
  }, t)));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Tabs.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.Tooltip = __ds_scope.Tooltip;

__ds_ns.Alert = __ds_scope.Alert;

__ds_ns.Dialog = __ds_scope.Dialog;

__ds_ns.Progress = __ds_scope.Progress;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Radio = __ds_scope.Radio;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Tabs = __ds_scope.Tabs;

})();
