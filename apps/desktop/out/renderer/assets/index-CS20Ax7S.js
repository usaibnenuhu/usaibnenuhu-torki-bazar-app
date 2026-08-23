function _mergeNamespaces(n2, m2) {
  for (var i = 0; i < m2.length; i++) {
    const e = m2[i];
    if (typeof e !== "string" && !Array.isArray(e)) {
      for (const k2 in e) {
        if (k2 !== "default" && !(k2 in n2)) {
          const d = Object.getOwnPropertyDescriptor(e, k2);
          if (d) {
            Object.defineProperty(n2, k2, d.get ? d : {
              enumerable: true,
              get: () => e[k2]
            });
          }
        }
      }
    }
  }
  return Object.freeze(Object.defineProperty(n2, Symbol.toStringTag, { value: "Module" }));
}
function getDefaultExportFromCjs(x2) {
  return x2 && x2.__esModule && Object.prototype.hasOwnProperty.call(x2, "default") ? x2["default"] : x2;
}
var jsxRuntime = { exports: {} };
var reactJsxRuntime_production_min = {};
var react = { exports: {} };
var react_production_min = {};
/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var l$1 = Symbol.for("react.element"), n$1 = Symbol.for("react.portal"), p$2 = Symbol.for("react.fragment"), q$1 = Symbol.for("react.strict_mode"), r = Symbol.for("react.profiler"), t = Symbol.for("react.provider"), u = Symbol.for("react.context"), v$1 = Symbol.for("react.forward_ref"), w = Symbol.for("react.suspense"), x = Symbol.for("react.memo"), y = Symbol.for("react.lazy"), z$1 = Symbol.iterator;
function A$1(a) {
  if (null === a || "object" !== typeof a) return null;
  a = z$1 && a[z$1] || a["@@iterator"];
  return "function" === typeof a ? a : null;
}
var B$1 = { isMounted: function() {
  return false;
}, enqueueForceUpdate: function() {
}, enqueueReplaceState: function() {
}, enqueueSetState: function() {
} }, C$1 = Object.assign, D$1 = {};
function E$1(a, b, e) {
  this.props = a;
  this.context = b;
  this.refs = D$1;
  this.updater = e || B$1;
}
E$1.prototype.isReactComponent = {};
E$1.prototype.setState = function(a, b) {
  if ("object" !== typeof a && "function" !== typeof a && null != a) throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
  this.updater.enqueueSetState(this, a, b, "setState");
};
E$1.prototype.forceUpdate = function(a) {
  this.updater.enqueueForceUpdate(this, a, "forceUpdate");
};
function F() {
}
F.prototype = E$1.prototype;
function G$1(a, b, e) {
  this.props = a;
  this.context = b;
  this.refs = D$1;
  this.updater = e || B$1;
}
var H$1 = G$1.prototype = new F();
H$1.constructor = G$1;
C$1(H$1, E$1.prototype);
H$1.isPureReactComponent = true;
var I$1 = Array.isArray, J = Object.prototype.hasOwnProperty, K$1 = { current: null }, L$1 = { key: true, ref: true, __self: true, __source: true };
function M$1(a, b, e) {
  var d, c = {}, k2 = null, h = null;
  if (null != b) for (d in void 0 !== b.ref && (h = b.ref), void 0 !== b.key && (k2 = "" + b.key), b) J.call(b, d) && !L$1.hasOwnProperty(d) && (c[d] = b[d]);
  var g = arguments.length - 2;
  if (1 === g) c.children = e;
  else if (1 < g) {
    for (var f2 = Array(g), m2 = 0; m2 < g; m2++) f2[m2] = arguments[m2 + 2];
    c.children = f2;
  }
  if (a && a.defaultProps) for (d in g = a.defaultProps, g) void 0 === c[d] && (c[d] = g[d]);
  return { $$typeof: l$1, type: a, key: k2, ref: h, props: c, _owner: K$1.current };
}
function N$1(a, b) {
  return { $$typeof: l$1, type: a.type, key: b, ref: a.ref, props: a.props, _owner: a._owner };
}
function O$1(a) {
  return "object" === typeof a && null !== a && a.$$typeof === l$1;
}
function escape(a) {
  var b = { "=": "=0", ":": "=2" };
  return "$" + a.replace(/[=:]/g, function(a2) {
    return b[a2];
  });
}
var P$1 = /\/+/g;
function Q$1(a, b) {
  return "object" === typeof a && null !== a && null != a.key ? escape("" + a.key) : b.toString(36);
}
function R$1(a, b, e, d, c) {
  var k2 = typeof a;
  if ("undefined" === k2 || "boolean" === k2) a = null;
  var h = false;
  if (null === a) h = true;
  else switch (k2) {
    case "string":
    case "number":
      h = true;
      break;
    case "object":
      switch (a.$$typeof) {
        case l$1:
        case n$1:
          h = true;
      }
  }
  if (h) return h = a, c = c(h), a = "" === d ? "." + Q$1(h, 0) : d, I$1(c) ? (e = "", null != a && (e = a.replace(P$1, "$&/") + "/"), R$1(c, b, e, "", function(a2) {
    return a2;
  })) : null != c && (O$1(c) && (c = N$1(c, e + (!c.key || h && h.key === c.key ? "" : ("" + c.key).replace(P$1, "$&/") + "/") + a)), b.push(c)), 1;
  h = 0;
  d = "" === d ? "." : d + ":";
  if (I$1(a)) for (var g = 0; g < a.length; g++) {
    k2 = a[g];
    var f2 = d + Q$1(k2, g);
    h += R$1(k2, b, e, f2, c);
  }
  else if (f2 = A$1(a), "function" === typeof f2) for (a = f2.call(a), g = 0; !(k2 = a.next()).done; ) k2 = k2.value, f2 = d + Q$1(k2, g++), h += R$1(k2, b, e, f2, c);
  else if ("object" === k2) throw b = String(a), Error("Objects are not valid as a React child (found: " + ("[object Object]" === b ? "object with keys {" + Object.keys(a).join(", ") + "}" : b) + "). If you meant to render a collection of children, use an array instead.");
  return h;
}
function S$1(a, b, e) {
  if (null == a) return a;
  var d = [], c = 0;
  R$1(a, d, "", "", function(a2) {
    return b.call(e, a2, c++);
  });
  return d;
}
function T$1(a) {
  if (-1 === a._status) {
    var b = a._result;
    b = b();
    b.then(function(b2) {
      if (0 === a._status || -1 === a._status) a._status = 1, a._result = b2;
    }, function(b2) {
      if (0 === a._status || -1 === a._status) a._status = 2, a._result = b2;
    });
    -1 === a._status && (a._status = 0, a._result = b);
  }
  if (1 === a._status) return a._result.default;
  throw a._result;
}
var U$1 = { current: null }, V$1 = { transition: null }, W$1 = { ReactCurrentDispatcher: U$1, ReactCurrentBatchConfig: V$1, ReactCurrentOwner: K$1 };
function X$1() {
  throw Error("act(...) is not supported in production builds of React.");
}
react_production_min.Children = { map: S$1, forEach: function(a, b, e) {
  S$1(a, function() {
    b.apply(this, arguments);
  }, e);
}, count: function(a) {
  var b = 0;
  S$1(a, function() {
    b++;
  });
  return b;
}, toArray: function(a) {
  return S$1(a, function(a2) {
    return a2;
  }) || [];
}, only: function(a) {
  if (!O$1(a)) throw Error("React.Children.only expected to receive a single React element child.");
  return a;
} };
react_production_min.Component = E$1;
react_production_min.Fragment = p$2;
react_production_min.Profiler = r;
react_production_min.PureComponent = G$1;
react_production_min.StrictMode = q$1;
react_production_min.Suspense = w;
react_production_min.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = W$1;
react_production_min.act = X$1;
react_production_min.cloneElement = function(a, b, e) {
  if (null === a || void 0 === a) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + a + ".");
  var d = C$1({}, a.props), c = a.key, k2 = a.ref, h = a._owner;
  if (null != b) {
    void 0 !== b.ref && (k2 = b.ref, h = K$1.current);
    void 0 !== b.key && (c = "" + b.key);
    if (a.type && a.type.defaultProps) var g = a.type.defaultProps;
    for (f2 in b) J.call(b, f2) && !L$1.hasOwnProperty(f2) && (d[f2] = void 0 === b[f2] && void 0 !== g ? g[f2] : b[f2]);
  }
  var f2 = arguments.length - 2;
  if (1 === f2) d.children = e;
  else if (1 < f2) {
    g = Array(f2);
    for (var m2 = 0; m2 < f2; m2++) g[m2] = arguments[m2 + 2];
    d.children = g;
  }
  return { $$typeof: l$1, type: a.type, key: c, ref: k2, props: d, _owner: h };
};
react_production_min.createContext = function(a) {
  a = { $$typeof: u, _currentValue: a, _currentValue2: a, _threadCount: 0, Provider: null, Consumer: null, _defaultValue: null, _globalName: null };
  a.Provider = { $$typeof: t, _context: a };
  return a.Consumer = a;
};
react_production_min.createElement = M$1;
react_production_min.createFactory = function(a) {
  var b = M$1.bind(null, a);
  b.type = a;
  return b;
};
react_production_min.createRef = function() {
  return { current: null };
};
react_production_min.forwardRef = function(a) {
  return { $$typeof: v$1, render: a };
};
react_production_min.isValidElement = O$1;
react_production_min.lazy = function(a) {
  return { $$typeof: y, _payload: { _status: -1, _result: a }, _init: T$1 };
};
react_production_min.memo = function(a, b) {
  return { $$typeof: x, type: a, compare: void 0 === b ? null : b };
};
react_production_min.startTransition = function(a) {
  var b = V$1.transition;
  V$1.transition = {};
  try {
    a();
  } finally {
    V$1.transition = b;
  }
};
react_production_min.unstable_act = X$1;
react_production_min.useCallback = function(a, b) {
  return U$1.current.useCallback(a, b);
};
react_production_min.useContext = function(a) {
  return U$1.current.useContext(a);
};
react_production_min.useDebugValue = function() {
};
react_production_min.useDeferredValue = function(a) {
  return U$1.current.useDeferredValue(a);
};
react_production_min.useEffect = function(a, b) {
  return U$1.current.useEffect(a, b);
};
react_production_min.useId = function() {
  return U$1.current.useId();
};
react_production_min.useImperativeHandle = function(a, b, e) {
  return U$1.current.useImperativeHandle(a, b, e);
};
react_production_min.useInsertionEffect = function(a, b) {
  return U$1.current.useInsertionEffect(a, b);
};
react_production_min.useLayoutEffect = function(a, b) {
  return U$1.current.useLayoutEffect(a, b);
};
react_production_min.useMemo = function(a, b) {
  return U$1.current.useMemo(a, b);
};
react_production_min.useReducer = function(a, b, e) {
  return U$1.current.useReducer(a, b, e);
};
react_production_min.useRef = function(a) {
  return U$1.current.useRef(a);
};
react_production_min.useState = function(a) {
  return U$1.current.useState(a);
};
react_production_min.useSyncExternalStore = function(a, b, e) {
  return U$1.current.useSyncExternalStore(a, b, e);
};
react_production_min.useTransition = function() {
  return U$1.current.useTransition();
};
react_production_min.version = "18.3.1";
{
  react.exports = react_production_min;
}
var reactExports = react.exports;
const React$2 = /* @__PURE__ */ getDefaultExportFromCjs(reactExports);
const React$3 = /* @__PURE__ */ _mergeNamespaces({
  __proto__: null,
  default: React$2
}, [reactExports]);
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var f = reactExports, k = Symbol.for("react.element"), l = Symbol.for("react.fragment"), m$1 = Object.prototype.hasOwnProperty, n = f.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, p$1 = { key: true, ref: true, __self: true, __source: true };
function q(c, a, g) {
  var b, d = {}, e = null, h = null;
  void 0 !== g && (e = "" + g);
  void 0 !== a.key && (e = "" + a.key);
  void 0 !== a.ref && (h = a.ref);
  for (b in a) m$1.call(a, b) && !p$1.hasOwnProperty(b) && (d[b] = a[b]);
  if (c && c.defaultProps) for (b in a = c.defaultProps, a) void 0 === d[b] && (d[b] = a[b]);
  return { $$typeof: k, type: c, key: e, ref: h, props: d, _owner: n.current };
}
reactJsxRuntime_production_min.Fragment = l;
reactJsxRuntime_production_min.jsx = q;
reactJsxRuntime_production_min.jsxs = q;
{
  jsxRuntime.exports = reactJsxRuntime_production_min;
}
var jsxRuntimeExports = jsxRuntime.exports;
var client = {};
var reactDom = { exports: {} };
var reactDom_production_min = {};
var scheduler = { exports: {} };
var scheduler_production_min = {};
/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
(function(exports) {
  function f2(a, b) {
    var c = a.length;
    a.push(b);
    a: for (; 0 < c; ) {
      var d = c - 1 >>> 1, e = a[d];
      if (0 < g(e, b)) a[d] = b, a[c] = e, c = d;
      else break a;
    }
  }
  function h(a) {
    return 0 === a.length ? null : a[0];
  }
  function k2(a) {
    if (0 === a.length) return null;
    var b = a[0], c = a.pop();
    if (c !== b) {
      a[0] = c;
      a: for (var d = 0, e = a.length, w2 = e >>> 1; d < w2; ) {
        var m2 = 2 * (d + 1) - 1, C2 = a[m2], n2 = m2 + 1, x2 = a[n2];
        if (0 > g(C2, c)) n2 < e && 0 > g(x2, C2) ? (a[d] = x2, a[n2] = c, d = n2) : (a[d] = C2, a[m2] = c, d = m2);
        else if (n2 < e && 0 > g(x2, c)) a[d] = x2, a[n2] = c, d = n2;
        else break a;
      }
    }
    return b;
  }
  function g(a, b) {
    var c = a.sortIndex - b.sortIndex;
    return 0 !== c ? c : a.id - b.id;
  }
  if ("object" === typeof performance && "function" === typeof performance.now) {
    var l2 = performance;
    exports.unstable_now = function() {
      return l2.now();
    };
  } else {
    var p2 = Date, q2 = p2.now();
    exports.unstable_now = function() {
      return p2.now() - q2;
    };
  }
  var r2 = [], t2 = [], u2 = 1, v2 = null, y2 = 3, z2 = false, A2 = false, B2 = false, D2 = "function" === typeof setTimeout ? setTimeout : null, E2 = "function" === typeof clearTimeout ? clearTimeout : null, F2 = "undefined" !== typeof setImmediate ? setImmediate : null;
  "undefined" !== typeof navigator && void 0 !== navigator.scheduling && void 0 !== navigator.scheduling.isInputPending && navigator.scheduling.isInputPending.bind(navigator.scheduling);
  function G2(a) {
    for (var b = h(t2); null !== b; ) {
      if (null === b.callback) k2(t2);
      else if (b.startTime <= a) k2(t2), b.sortIndex = b.expirationTime, f2(r2, b);
      else break;
      b = h(t2);
    }
  }
  function H2(a) {
    B2 = false;
    G2(a);
    if (!A2) if (null !== h(r2)) A2 = true, I2(J2);
    else {
      var b = h(t2);
      null !== b && K2(H2, b.startTime - a);
    }
  }
  function J2(a, b) {
    A2 = false;
    B2 && (B2 = false, E2(L2), L2 = -1);
    z2 = true;
    var c = y2;
    try {
      G2(b);
      for (v2 = h(r2); null !== v2 && (!(v2.expirationTime > b) || a && !M2()); ) {
        var d = v2.callback;
        if ("function" === typeof d) {
          v2.callback = null;
          y2 = v2.priorityLevel;
          var e = d(v2.expirationTime <= b);
          b = exports.unstable_now();
          "function" === typeof e ? v2.callback = e : v2 === h(r2) && k2(r2);
          G2(b);
        } else k2(r2);
        v2 = h(r2);
      }
      if (null !== v2) var w2 = true;
      else {
        var m2 = h(t2);
        null !== m2 && K2(H2, m2.startTime - b);
        w2 = false;
      }
      return w2;
    } finally {
      v2 = null, y2 = c, z2 = false;
    }
  }
  var N2 = false, O2 = null, L2 = -1, P2 = 5, Q2 = -1;
  function M2() {
    return exports.unstable_now() - Q2 < P2 ? false : true;
  }
  function R2() {
    if (null !== O2) {
      var a = exports.unstable_now();
      Q2 = a;
      var b = true;
      try {
        b = O2(true, a);
      } finally {
        b ? S2() : (N2 = false, O2 = null);
      }
    } else N2 = false;
  }
  var S2;
  if ("function" === typeof F2) S2 = function() {
    F2(R2);
  };
  else if ("undefined" !== typeof MessageChannel) {
    var T2 = new MessageChannel(), U2 = T2.port2;
    T2.port1.onmessage = R2;
    S2 = function() {
      U2.postMessage(null);
    };
  } else S2 = function() {
    D2(R2, 0);
  };
  function I2(a) {
    O2 = a;
    N2 || (N2 = true, S2());
  }
  function K2(a, b) {
    L2 = D2(function() {
      a(exports.unstable_now());
    }, b);
  }
  exports.unstable_IdlePriority = 5;
  exports.unstable_ImmediatePriority = 1;
  exports.unstable_LowPriority = 4;
  exports.unstable_NormalPriority = 3;
  exports.unstable_Profiling = null;
  exports.unstable_UserBlockingPriority = 2;
  exports.unstable_cancelCallback = function(a) {
    a.callback = null;
  };
  exports.unstable_continueExecution = function() {
    A2 || z2 || (A2 = true, I2(J2));
  };
  exports.unstable_forceFrameRate = function(a) {
    0 > a || 125 < a ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : P2 = 0 < a ? Math.floor(1e3 / a) : 5;
  };
  exports.unstable_getCurrentPriorityLevel = function() {
    return y2;
  };
  exports.unstable_getFirstCallbackNode = function() {
    return h(r2);
  };
  exports.unstable_next = function(a) {
    switch (y2) {
      case 1:
      case 2:
      case 3:
        var b = 3;
        break;
      default:
        b = y2;
    }
    var c = y2;
    y2 = b;
    try {
      return a();
    } finally {
      y2 = c;
    }
  };
  exports.unstable_pauseExecution = function() {
  };
  exports.unstable_requestPaint = function() {
  };
  exports.unstable_runWithPriority = function(a, b) {
    switch (a) {
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
        break;
      default:
        a = 3;
    }
    var c = y2;
    y2 = a;
    try {
      return b();
    } finally {
      y2 = c;
    }
  };
  exports.unstable_scheduleCallback = function(a, b, c) {
    var d = exports.unstable_now();
    "object" === typeof c && null !== c ? (c = c.delay, c = "number" === typeof c && 0 < c ? d + c : d) : c = d;
    switch (a) {
      case 1:
        var e = -1;
        break;
      case 2:
        e = 250;
        break;
      case 5:
        e = 1073741823;
        break;
      case 4:
        e = 1e4;
        break;
      default:
        e = 5e3;
    }
    e = c + e;
    a = { id: u2++, callback: b, priorityLevel: a, startTime: c, expirationTime: e, sortIndex: -1 };
    c > d ? (a.sortIndex = c, f2(t2, a), null === h(r2) && a === h(t2) && (B2 ? (E2(L2), L2 = -1) : B2 = true, K2(H2, c - d))) : (a.sortIndex = e, f2(r2, a), A2 || z2 || (A2 = true, I2(J2)));
    return a;
  };
  exports.unstable_shouldYield = M2;
  exports.unstable_wrapCallback = function(a) {
    var b = y2;
    return function() {
      var c = y2;
      y2 = b;
      try {
        return a.apply(this, arguments);
      } finally {
        y2 = c;
      }
    };
  };
})(scheduler_production_min);
{
  scheduler.exports = scheduler_production_min;
}
var schedulerExports = scheduler.exports;
/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var aa = reactExports, ca = schedulerExports;
function p(a) {
  for (var b = "https://reactjs.org/docs/error-decoder.html?invariant=" + a, c = 1; c < arguments.length; c++) b += "&args[]=" + encodeURIComponent(arguments[c]);
  return "Minified React error #" + a + "; visit " + b + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
}
var da = /* @__PURE__ */ new Set(), ea = {};
function fa(a, b) {
  ha(a, b);
  ha(a + "Capture", b);
}
function ha(a, b) {
  ea[a] = b;
  for (a = 0; a < b.length; a++) da.add(b[a]);
}
var ia = !("undefined" === typeof window || "undefined" === typeof window.document || "undefined" === typeof window.document.createElement), ja = Object.prototype.hasOwnProperty, ka = /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/, la = {}, ma = {};
function oa(a) {
  if (ja.call(ma, a)) return true;
  if (ja.call(la, a)) return false;
  if (ka.test(a)) return ma[a] = true;
  la[a] = true;
  return false;
}
function pa(a, b, c, d) {
  if (null !== c && 0 === c.type) return false;
  switch (typeof b) {
    case "function":
    case "symbol":
      return true;
    case "boolean":
      if (d) return false;
      if (null !== c) return !c.acceptsBooleans;
      a = a.toLowerCase().slice(0, 5);
      return "data-" !== a && "aria-" !== a;
    default:
      return false;
  }
}
function qa(a, b, c, d) {
  if (null === b || "undefined" === typeof b || pa(a, b, c, d)) return true;
  if (d) return false;
  if (null !== c) switch (c.type) {
    case 3:
      return !b;
    case 4:
      return false === b;
    case 5:
      return isNaN(b);
    case 6:
      return isNaN(b) || 1 > b;
  }
  return false;
}
function v(a, b, c, d, e, f2, g) {
  this.acceptsBooleans = 2 === b || 3 === b || 4 === b;
  this.attributeName = d;
  this.attributeNamespace = e;
  this.mustUseProperty = c;
  this.propertyName = a;
  this.type = b;
  this.sanitizeURL = f2;
  this.removeEmptyString = g;
}
var z = {};
"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(a) {
  z[a] = new v(a, 0, false, a, null, false, false);
});
[["acceptCharset", "accept-charset"], ["className", "class"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"]].forEach(function(a) {
  var b = a[0];
  z[b] = new v(b, 1, false, a[1], null, false, false);
});
["contentEditable", "draggable", "spellCheck", "value"].forEach(function(a) {
  z[a] = new v(a, 2, false, a.toLowerCase(), null, false, false);
});
["autoReverse", "externalResourcesRequired", "focusable", "preserveAlpha"].forEach(function(a) {
  z[a] = new v(a, 2, false, a, null, false, false);
});
"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(a) {
  z[a] = new v(a, 3, false, a.toLowerCase(), null, false, false);
});
["checked", "multiple", "muted", "selected"].forEach(function(a) {
  z[a] = new v(a, 3, true, a, null, false, false);
});
["capture", "download"].forEach(function(a) {
  z[a] = new v(a, 4, false, a, null, false, false);
});
["cols", "rows", "size", "span"].forEach(function(a) {
  z[a] = new v(a, 6, false, a, null, false, false);
});
["rowSpan", "start"].forEach(function(a) {
  z[a] = new v(a, 5, false, a.toLowerCase(), null, false, false);
});
var ra = /[\-:]([a-z])/g;
function sa(a) {
  return a[1].toUpperCase();
}
"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(a) {
  var b = a.replace(
    ra,
    sa
  );
  z[b] = new v(b, 1, false, a, null, false, false);
});
"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(a) {
  var b = a.replace(ra, sa);
  z[b] = new v(b, 1, false, a, "http://www.w3.org/1999/xlink", false, false);
});
["xml:base", "xml:lang", "xml:space"].forEach(function(a) {
  var b = a.replace(ra, sa);
  z[b] = new v(b, 1, false, a, "http://www.w3.org/XML/1998/namespace", false, false);
});
["tabIndex", "crossOrigin"].forEach(function(a) {
  z[a] = new v(a, 1, false, a.toLowerCase(), null, false, false);
});
z.xlinkHref = new v("xlinkHref", 1, false, "xlink:href", "http://www.w3.org/1999/xlink", true, false);
["src", "href", "action", "formAction"].forEach(function(a) {
  z[a] = new v(a, 1, false, a.toLowerCase(), null, true, true);
});
function ta(a, b, c, d) {
  var e = z.hasOwnProperty(b) ? z[b] : null;
  if (null !== e ? 0 !== e.type : d || !(2 < b.length) || "o" !== b[0] && "O" !== b[0] || "n" !== b[1] && "N" !== b[1]) qa(b, c, e, d) && (c = null), d || null === e ? oa(b) && (null === c ? a.removeAttribute(b) : a.setAttribute(b, "" + c)) : e.mustUseProperty ? a[e.propertyName] = null === c ? 3 === e.type ? false : "" : c : (b = e.attributeName, d = e.attributeNamespace, null === c ? a.removeAttribute(b) : (e = e.type, c = 3 === e || 4 === e && true === c ? "" : "" + c, d ? a.setAttributeNS(d, b, c) : a.setAttribute(b, c)));
}
var ua = aa.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED, va = Symbol.for("react.element"), wa = Symbol.for("react.portal"), ya = Symbol.for("react.fragment"), za = Symbol.for("react.strict_mode"), Aa = Symbol.for("react.profiler"), Ba = Symbol.for("react.provider"), Ca = Symbol.for("react.context"), Da = Symbol.for("react.forward_ref"), Ea = Symbol.for("react.suspense"), Fa = Symbol.for("react.suspense_list"), Ga = Symbol.for("react.memo"), Ha = Symbol.for("react.lazy");
var Ia = Symbol.for("react.offscreen");
var Ja = Symbol.iterator;
function Ka(a) {
  if (null === a || "object" !== typeof a) return null;
  a = Ja && a[Ja] || a["@@iterator"];
  return "function" === typeof a ? a : null;
}
var A = Object.assign, La;
function Ma(a) {
  if (void 0 === La) try {
    throw Error();
  } catch (c) {
    var b = c.stack.trim().match(/\n( *(at )?)/);
    La = b && b[1] || "";
  }
  return "\n" + La + a;
}
var Na = false;
function Oa(a, b) {
  if (!a || Na) return "";
  Na = true;
  var c = Error.prepareStackTrace;
  Error.prepareStackTrace = void 0;
  try {
    if (b) if (b = function() {
      throw Error();
    }, Object.defineProperty(b.prototype, "props", { set: function() {
      throw Error();
    } }), "object" === typeof Reflect && Reflect.construct) {
      try {
        Reflect.construct(b, []);
      } catch (l2) {
        var d = l2;
      }
      Reflect.construct(a, [], b);
    } else {
      try {
        b.call();
      } catch (l2) {
        d = l2;
      }
      a.call(b.prototype);
    }
    else {
      try {
        throw Error();
      } catch (l2) {
        d = l2;
      }
      a();
    }
  } catch (l2) {
    if (l2 && d && "string" === typeof l2.stack) {
      for (var e = l2.stack.split("\n"), f2 = d.stack.split("\n"), g = e.length - 1, h = f2.length - 1; 1 <= g && 0 <= h && e[g] !== f2[h]; ) h--;
      for (; 1 <= g && 0 <= h; g--, h--) if (e[g] !== f2[h]) {
        if (1 !== g || 1 !== h) {
          do
            if (g--, h--, 0 > h || e[g] !== f2[h]) {
              var k2 = "\n" + e[g].replace(" at new ", " at ");
              a.displayName && k2.includes("<anonymous>") && (k2 = k2.replace("<anonymous>", a.displayName));
              return k2;
            }
          while (1 <= g && 0 <= h);
        }
        break;
      }
    }
  } finally {
    Na = false, Error.prepareStackTrace = c;
  }
  return (a = a ? a.displayName || a.name : "") ? Ma(a) : "";
}
function Pa(a) {
  switch (a.tag) {
    case 5:
      return Ma(a.type);
    case 16:
      return Ma("Lazy");
    case 13:
      return Ma("Suspense");
    case 19:
      return Ma("SuspenseList");
    case 0:
    case 2:
    case 15:
      return a = Oa(a.type, false), a;
    case 11:
      return a = Oa(a.type.render, false), a;
    case 1:
      return a = Oa(a.type, true), a;
    default:
      return "";
  }
}
function Qa(a) {
  if (null == a) return null;
  if ("function" === typeof a) return a.displayName || a.name || null;
  if ("string" === typeof a) return a;
  switch (a) {
    case ya:
      return "Fragment";
    case wa:
      return "Portal";
    case Aa:
      return "Profiler";
    case za:
      return "StrictMode";
    case Ea:
      return "Suspense";
    case Fa:
      return "SuspenseList";
  }
  if ("object" === typeof a) switch (a.$$typeof) {
    case Ca:
      return (a.displayName || "Context") + ".Consumer";
    case Ba:
      return (a._context.displayName || "Context") + ".Provider";
    case Da:
      var b = a.render;
      a = a.displayName;
      a || (a = b.displayName || b.name || "", a = "" !== a ? "ForwardRef(" + a + ")" : "ForwardRef");
      return a;
    case Ga:
      return b = a.displayName || null, null !== b ? b : Qa(a.type) || "Memo";
    case Ha:
      b = a._payload;
      a = a._init;
      try {
        return Qa(a(b));
      } catch (c) {
      }
  }
  return null;
}
function Ra(a) {
  var b = a.type;
  switch (a.tag) {
    case 24:
      return "Cache";
    case 9:
      return (b.displayName || "Context") + ".Consumer";
    case 10:
      return (b._context.displayName || "Context") + ".Provider";
    case 18:
      return "DehydratedFragment";
    case 11:
      return a = b.render, a = a.displayName || a.name || "", b.displayName || ("" !== a ? "ForwardRef(" + a + ")" : "ForwardRef");
    case 7:
      return "Fragment";
    case 5:
      return b;
    case 4:
      return "Portal";
    case 3:
      return "Root";
    case 6:
      return "Text";
    case 16:
      return Qa(b);
    case 8:
      return b === za ? "StrictMode" : "Mode";
    case 22:
      return "Offscreen";
    case 12:
      return "Profiler";
    case 21:
      return "Scope";
    case 13:
      return "Suspense";
    case 19:
      return "SuspenseList";
    case 25:
      return "TracingMarker";
    case 1:
    case 0:
    case 17:
    case 2:
    case 14:
    case 15:
      if ("function" === typeof b) return b.displayName || b.name || null;
      if ("string" === typeof b) return b;
  }
  return null;
}
function Sa(a) {
  switch (typeof a) {
    case "boolean":
    case "number":
    case "string":
    case "undefined":
      return a;
    case "object":
      return a;
    default:
      return "";
  }
}
function Ta(a) {
  var b = a.type;
  return (a = a.nodeName) && "input" === a.toLowerCase() && ("checkbox" === b || "radio" === b);
}
function Ua(a) {
  var b = Ta(a) ? "checked" : "value", c = Object.getOwnPropertyDescriptor(a.constructor.prototype, b), d = "" + a[b];
  if (!a.hasOwnProperty(b) && "undefined" !== typeof c && "function" === typeof c.get && "function" === typeof c.set) {
    var e = c.get, f2 = c.set;
    Object.defineProperty(a, b, { configurable: true, get: function() {
      return e.call(this);
    }, set: function(a2) {
      d = "" + a2;
      f2.call(this, a2);
    } });
    Object.defineProperty(a, b, { enumerable: c.enumerable });
    return { getValue: function() {
      return d;
    }, setValue: function(a2) {
      d = "" + a2;
    }, stopTracking: function() {
      a._valueTracker = null;
      delete a[b];
    } };
  }
}
function Va(a) {
  a._valueTracker || (a._valueTracker = Ua(a));
}
function Wa(a) {
  if (!a) return false;
  var b = a._valueTracker;
  if (!b) return true;
  var c = b.getValue();
  var d = "";
  a && (d = Ta(a) ? a.checked ? "true" : "false" : a.value);
  a = d;
  return a !== c ? (b.setValue(a), true) : false;
}
function Xa(a) {
  a = a || ("undefined" !== typeof document ? document : void 0);
  if ("undefined" === typeof a) return null;
  try {
    return a.activeElement || a.body;
  } catch (b) {
    return a.body;
  }
}
function Ya(a, b) {
  var c = b.checked;
  return A({}, b, { defaultChecked: void 0, defaultValue: void 0, value: void 0, checked: null != c ? c : a._wrapperState.initialChecked });
}
function Za(a, b) {
  var c = null == b.defaultValue ? "" : b.defaultValue, d = null != b.checked ? b.checked : b.defaultChecked;
  c = Sa(null != b.value ? b.value : c);
  a._wrapperState = { initialChecked: d, initialValue: c, controlled: "checkbox" === b.type || "radio" === b.type ? null != b.checked : null != b.value };
}
function ab(a, b) {
  b = b.checked;
  null != b && ta(a, "checked", b, false);
}
function bb(a, b) {
  ab(a, b);
  var c = Sa(b.value), d = b.type;
  if (null != c) if ("number" === d) {
    if (0 === c && "" === a.value || a.value != c) a.value = "" + c;
  } else a.value !== "" + c && (a.value = "" + c);
  else if ("submit" === d || "reset" === d) {
    a.removeAttribute("value");
    return;
  }
  b.hasOwnProperty("value") ? cb(a, b.type, c) : b.hasOwnProperty("defaultValue") && cb(a, b.type, Sa(b.defaultValue));
  null == b.checked && null != b.defaultChecked && (a.defaultChecked = !!b.defaultChecked);
}
function db(a, b, c) {
  if (b.hasOwnProperty("value") || b.hasOwnProperty("defaultValue")) {
    var d = b.type;
    if (!("submit" !== d && "reset" !== d || void 0 !== b.value && null !== b.value)) return;
    b = "" + a._wrapperState.initialValue;
    c || b === a.value || (a.value = b);
    a.defaultValue = b;
  }
  c = a.name;
  "" !== c && (a.name = "");
  a.defaultChecked = !!a._wrapperState.initialChecked;
  "" !== c && (a.name = c);
}
function cb(a, b, c) {
  if ("number" !== b || Xa(a.ownerDocument) !== a) null == c ? a.defaultValue = "" + a._wrapperState.initialValue : a.defaultValue !== "" + c && (a.defaultValue = "" + c);
}
var eb = Array.isArray;
function fb(a, b, c, d) {
  a = a.options;
  if (b) {
    b = {};
    for (var e = 0; e < c.length; e++) b["$" + c[e]] = true;
    for (c = 0; c < a.length; c++) e = b.hasOwnProperty("$" + a[c].value), a[c].selected !== e && (a[c].selected = e), e && d && (a[c].defaultSelected = true);
  } else {
    c = "" + Sa(c);
    b = null;
    for (e = 0; e < a.length; e++) {
      if (a[e].value === c) {
        a[e].selected = true;
        d && (a[e].defaultSelected = true);
        return;
      }
      null !== b || a[e].disabled || (b = a[e]);
    }
    null !== b && (b.selected = true);
  }
}
function gb(a, b) {
  if (null != b.dangerouslySetInnerHTML) throw Error(p(91));
  return A({}, b, { value: void 0, defaultValue: void 0, children: "" + a._wrapperState.initialValue });
}
function hb(a, b) {
  var c = b.value;
  if (null == c) {
    c = b.children;
    b = b.defaultValue;
    if (null != c) {
      if (null != b) throw Error(p(92));
      if (eb(c)) {
        if (1 < c.length) throw Error(p(93));
        c = c[0];
      }
      b = c;
    }
    null == b && (b = "");
    c = b;
  }
  a._wrapperState = { initialValue: Sa(c) };
}
function ib(a, b) {
  var c = Sa(b.value), d = Sa(b.defaultValue);
  null != c && (c = "" + c, c !== a.value && (a.value = c), null == b.defaultValue && a.defaultValue !== c && (a.defaultValue = c));
  null != d && (a.defaultValue = "" + d);
}
function jb(a) {
  var b = a.textContent;
  b === a._wrapperState.initialValue && "" !== b && null !== b && (a.value = b);
}
function kb(a) {
  switch (a) {
    case "svg":
      return "http://www.w3.org/2000/svg";
    case "math":
      return "http://www.w3.org/1998/Math/MathML";
    default:
      return "http://www.w3.org/1999/xhtml";
  }
}
function lb(a, b) {
  return null == a || "http://www.w3.org/1999/xhtml" === a ? kb(b) : "http://www.w3.org/2000/svg" === a && "foreignObject" === b ? "http://www.w3.org/1999/xhtml" : a;
}
var mb, nb = function(a) {
  return "undefined" !== typeof MSApp && MSApp.execUnsafeLocalFunction ? function(b, c, d, e) {
    MSApp.execUnsafeLocalFunction(function() {
      return a(b, c, d, e);
    });
  } : a;
}(function(a, b) {
  if ("http://www.w3.org/2000/svg" !== a.namespaceURI || "innerHTML" in a) a.innerHTML = b;
  else {
    mb = mb || document.createElement("div");
    mb.innerHTML = "<svg>" + b.valueOf().toString() + "</svg>";
    for (b = mb.firstChild; a.firstChild; ) a.removeChild(a.firstChild);
    for (; b.firstChild; ) a.appendChild(b.firstChild);
  }
});
function ob(a, b) {
  if (b) {
    var c = a.firstChild;
    if (c && c === a.lastChild && 3 === c.nodeType) {
      c.nodeValue = b;
      return;
    }
  }
  a.textContent = b;
}
var pb = {
  animationIterationCount: true,
  aspectRatio: true,
  borderImageOutset: true,
  borderImageSlice: true,
  borderImageWidth: true,
  boxFlex: true,
  boxFlexGroup: true,
  boxOrdinalGroup: true,
  columnCount: true,
  columns: true,
  flex: true,
  flexGrow: true,
  flexPositive: true,
  flexShrink: true,
  flexNegative: true,
  flexOrder: true,
  gridArea: true,
  gridRow: true,
  gridRowEnd: true,
  gridRowSpan: true,
  gridRowStart: true,
  gridColumn: true,
  gridColumnEnd: true,
  gridColumnSpan: true,
  gridColumnStart: true,
  fontWeight: true,
  lineClamp: true,
  lineHeight: true,
  opacity: true,
  order: true,
  orphans: true,
  tabSize: true,
  widows: true,
  zIndex: true,
  zoom: true,
  fillOpacity: true,
  floodOpacity: true,
  stopOpacity: true,
  strokeDasharray: true,
  strokeDashoffset: true,
  strokeMiterlimit: true,
  strokeOpacity: true,
  strokeWidth: true
}, qb = ["Webkit", "ms", "Moz", "O"];
Object.keys(pb).forEach(function(a) {
  qb.forEach(function(b) {
    b = b + a.charAt(0).toUpperCase() + a.substring(1);
    pb[b] = pb[a];
  });
});
function rb(a, b, c) {
  return null == b || "boolean" === typeof b || "" === b ? "" : c || "number" !== typeof b || 0 === b || pb.hasOwnProperty(a) && pb[a] ? ("" + b).trim() : b + "px";
}
function sb(a, b) {
  a = a.style;
  for (var c in b) if (b.hasOwnProperty(c)) {
    var d = 0 === c.indexOf("--"), e = rb(c, b[c], d);
    "float" === c && (c = "cssFloat");
    d ? a.setProperty(c, e) : a[c] = e;
  }
}
var tb = A({ menuitem: true }, { area: true, base: true, br: true, col: true, embed: true, hr: true, img: true, input: true, keygen: true, link: true, meta: true, param: true, source: true, track: true, wbr: true });
function ub(a, b) {
  if (b) {
    if (tb[a] && (null != b.children || null != b.dangerouslySetInnerHTML)) throw Error(p(137, a));
    if (null != b.dangerouslySetInnerHTML) {
      if (null != b.children) throw Error(p(60));
      if ("object" !== typeof b.dangerouslySetInnerHTML || !("__html" in b.dangerouslySetInnerHTML)) throw Error(p(61));
    }
    if (null != b.style && "object" !== typeof b.style) throw Error(p(62));
  }
}
function vb(a, b) {
  if (-1 === a.indexOf("-")) return "string" === typeof b.is;
  switch (a) {
    case "annotation-xml":
    case "color-profile":
    case "font-face":
    case "font-face-src":
    case "font-face-uri":
    case "font-face-format":
    case "font-face-name":
    case "missing-glyph":
      return false;
    default:
      return true;
  }
}
var wb = null;
function xb(a) {
  a = a.target || a.srcElement || window;
  a.correspondingUseElement && (a = a.correspondingUseElement);
  return 3 === a.nodeType ? a.parentNode : a;
}
var yb = null, zb = null, Ab = null;
function Bb(a) {
  if (a = Cb(a)) {
    if ("function" !== typeof yb) throw Error(p(280));
    var b = a.stateNode;
    b && (b = Db(b), yb(a.stateNode, a.type, b));
  }
}
function Eb(a) {
  zb ? Ab ? Ab.push(a) : Ab = [a] : zb = a;
}
function Fb() {
  if (zb) {
    var a = zb, b = Ab;
    Ab = zb = null;
    Bb(a);
    if (b) for (a = 0; a < b.length; a++) Bb(b[a]);
  }
}
function Gb(a, b) {
  return a(b);
}
function Hb() {
}
var Ib = false;
function Jb(a, b, c) {
  if (Ib) return a(b, c);
  Ib = true;
  try {
    return Gb(a, b, c);
  } finally {
    if (Ib = false, null !== zb || null !== Ab) Hb(), Fb();
  }
}
function Kb(a, b) {
  var c = a.stateNode;
  if (null === c) return null;
  var d = Db(c);
  if (null === d) return null;
  c = d[b];
  a: switch (b) {
    case "onClick":
    case "onClickCapture":
    case "onDoubleClick":
    case "onDoubleClickCapture":
    case "onMouseDown":
    case "onMouseDownCapture":
    case "onMouseMove":
    case "onMouseMoveCapture":
    case "onMouseUp":
    case "onMouseUpCapture":
    case "onMouseEnter":
      (d = !d.disabled) || (a = a.type, d = !("button" === a || "input" === a || "select" === a || "textarea" === a));
      a = !d;
      break a;
    default:
      a = false;
  }
  if (a) return null;
  if (c && "function" !== typeof c) throw Error(p(231, b, typeof c));
  return c;
}
var Lb = false;
if (ia) try {
  var Mb = {};
  Object.defineProperty(Mb, "passive", { get: function() {
    Lb = true;
  } });
  window.addEventListener("test", Mb, Mb);
  window.removeEventListener("test", Mb, Mb);
} catch (a) {
  Lb = false;
}
function Nb(a, b, c, d, e, f2, g, h, k2) {
  var l2 = Array.prototype.slice.call(arguments, 3);
  try {
    b.apply(c, l2);
  } catch (m2) {
    this.onError(m2);
  }
}
var Ob = false, Pb = null, Qb = false, Rb = null, Sb = { onError: function(a) {
  Ob = true;
  Pb = a;
} };
function Tb(a, b, c, d, e, f2, g, h, k2) {
  Ob = false;
  Pb = null;
  Nb.apply(Sb, arguments);
}
function Ub(a, b, c, d, e, f2, g, h, k2) {
  Tb.apply(this, arguments);
  if (Ob) {
    if (Ob) {
      var l2 = Pb;
      Ob = false;
      Pb = null;
    } else throw Error(p(198));
    Qb || (Qb = true, Rb = l2);
  }
}
function Vb(a) {
  var b = a, c = a;
  if (a.alternate) for (; b.return; ) b = b.return;
  else {
    a = b;
    do
      b = a, 0 !== (b.flags & 4098) && (c = b.return), a = b.return;
    while (a);
  }
  return 3 === b.tag ? c : null;
}
function Wb(a) {
  if (13 === a.tag) {
    var b = a.memoizedState;
    null === b && (a = a.alternate, null !== a && (b = a.memoizedState));
    if (null !== b) return b.dehydrated;
  }
  return null;
}
function Xb(a) {
  if (Vb(a) !== a) throw Error(p(188));
}
function Yb(a) {
  var b = a.alternate;
  if (!b) {
    b = Vb(a);
    if (null === b) throw Error(p(188));
    return b !== a ? null : a;
  }
  for (var c = a, d = b; ; ) {
    var e = c.return;
    if (null === e) break;
    var f2 = e.alternate;
    if (null === f2) {
      d = e.return;
      if (null !== d) {
        c = d;
        continue;
      }
      break;
    }
    if (e.child === f2.child) {
      for (f2 = e.child; f2; ) {
        if (f2 === c) return Xb(e), a;
        if (f2 === d) return Xb(e), b;
        f2 = f2.sibling;
      }
      throw Error(p(188));
    }
    if (c.return !== d.return) c = e, d = f2;
    else {
      for (var g = false, h = e.child; h; ) {
        if (h === c) {
          g = true;
          c = e;
          d = f2;
          break;
        }
        if (h === d) {
          g = true;
          d = e;
          c = f2;
          break;
        }
        h = h.sibling;
      }
      if (!g) {
        for (h = f2.child; h; ) {
          if (h === c) {
            g = true;
            c = f2;
            d = e;
            break;
          }
          if (h === d) {
            g = true;
            d = f2;
            c = e;
            break;
          }
          h = h.sibling;
        }
        if (!g) throw Error(p(189));
      }
    }
    if (c.alternate !== d) throw Error(p(190));
  }
  if (3 !== c.tag) throw Error(p(188));
  return c.stateNode.current === c ? a : b;
}
function Zb(a) {
  a = Yb(a);
  return null !== a ? $b(a) : null;
}
function $b(a) {
  if (5 === a.tag || 6 === a.tag) return a;
  for (a = a.child; null !== a; ) {
    var b = $b(a);
    if (null !== b) return b;
    a = a.sibling;
  }
  return null;
}
var ac = ca.unstable_scheduleCallback, bc = ca.unstable_cancelCallback, cc = ca.unstable_shouldYield, dc = ca.unstable_requestPaint, B = ca.unstable_now, ec = ca.unstable_getCurrentPriorityLevel, fc = ca.unstable_ImmediatePriority, gc = ca.unstable_UserBlockingPriority, hc = ca.unstable_NormalPriority, ic = ca.unstable_LowPriority, jc = ca.unstable_IdlePriority, kc = null, lc = null;
function mc(a) {
  if (lc && "function" === typeof lc.onCommitFiberRoot) try {
    lc.onCommitFiberRoot(kc, a, void 0, 128 === (a.current.flags & 128));
  } catch (b) {
  }
}
var oc = Math.clz32 ? Math.clz32 : nc, pc = Math.log, qc = Math.LN2;
function nc(a) {
  a >>>= 0;
  return 0 === a ? 32 : 31 - (pc(a) / qc | 0) | 0;
}
var rc = 64, sc = 4194304;
function tc(a) {
  switch (a & -a) {
    case 1:
      return 1;
    case 2:
      return 2;
    case 4:
      return 4;
    case 8:
      return 8;
    case 16:
      return 16;
    case 32:
      return 32;
    case 64:
    case 128:
    case 256:
    case 512:
    case 1024:
    case 2048:
    case 4096:
    case 8192:
    case 16384:
    case 32768:
    case 65536:
    case 131072:
    case 262144:
    case 524288:
    case 1048576:
    case 2097152:
      return a & 4194240;
    case 4194304:
    case 8388608:
    case 16777216:
    case 33554432:
    case 67108864:
      return a & 130023424;
    case 134217728:
      return 134217728;
    case 268435456:
      return 268435456;
    case 536870912:
      return 536870912;
    case 1073741824:
      return 1073741824;
    default:
      return a;
  }
}
function uc(a, b) {
  var c = a.pendingLanes;
  if (0 === c) return 0;
  var d = 0, e = a.suspendedLanes, f2 = a.pingedLanes, g = c & 268435455;
  if (0 !== g) {
    var h = g & ~e;
    0 !== h ? d = tc(h) : (f2 &= g, 0 !== f2 && (d = tc(f2)));
  } else g = c & ~e, 0 !== g ? d = tc(g) : 0 !== f2 && (d = tc(f2));
  if (0 === d) return 0;
  if (0 !== b && b !== d && 0 === (b & e) && (e = d & -d, f2 = b & -b, e >= f2 || 16 === e && 0 !== (f2 & 4194240))) return b;
  0 !== (d & 4) && (d |= c & 16);
  b = a.entangledLanes;
  if (0 !== b) for (a = a.entanglements, b &= d; 0 < b; ) c = 31 - oc(b), e = 1 << c, d |= a[c], b &= ~e;
  return d;
}
function vc(a, b) {
  switch (a) {
    case 1:
    case 2:
    case 4:
      return b + 250;
    case 8:
    case 16:
    case 32:
    case 64:
    case 128:
    case 256:
    case 512:
    case 1024:
    case 2048:
    case 4096:
    case 8192:
    case 16384:
    case 32768:
    case 65536:
    case 131072:
    case 262144:
    case 524288:
    case 1048576:
    case 2097152:
      return b + 5e3;
    case 4194304:
    case 8388608:
    case 16777216:
    case 33554432:
    case 67108864:
      return -1;
    case 134217728:
    case 268435456:
    case 536870912:
    case 1073741824:
      return -1;
    default:
      return -1;
  }
}
function wc(a, b) {
  for (var c = a.suspendedLanes, d = a.pingedLanes, e = a.expirationTimes, f2 = a.pendingLanes; 0 < f2; ) {
    var g = 31 - oc(f2), h = 1 << g, k2 = e[g];
    if (-1 === k2) {
      if (0 === (h & c) || 0 !== (h & d)) e[g] = vc(h, b);
    } else k2 <= b && (a.expiredLanes |= h);
    f2 &= ~h;
  }
}
function xc(a) {
  a = a.pendingLanes & -1073741825;
  return 0 !== a ? a : a & 1073741824 ? 1073741824 : 0;
}
function yc() {
  var a = rc;
  rc <<= 1;
  0 === (rc & 4194240) && (rc = 64);
  return a;
}
function zc(a) {
  for (var b = [], c = 0; 31 > c; c++) b.push(a);
  return b;
}
function Ac(a, b, c) {
  a.pendingLanes |= b;
  536870912 !== b && (a.suspendedLanes = 0, a.pingedLanes = 0);
  a = a.eventTimes;
  b = 31 - oc(b);
  a[b] = c;
}
function Bc(a, b) {
  var c = a.pendingLanes & ~b;
  a.pendingLanes = b;
  a.suspendedLanes = 0;
  a.pingedLanes = 0;
  a.expiredLanes &= b;
  a.mutableReadLanes &= b;
  a.entangledLanes &= b;
  b = a.entanglements;
  var d = a.eventTimes;
  for (a = a.expirationTimes; 0 < c; ) {
    var e = 31 - oc(c), f2 = 1 << e;
    b[e] = 0;
    d[e] = -1;
    a[e] = -1;
    c &= ~f2;
  }
}
function Cc(a, b) {
  var c = a.entangledLanes |= b;
  for (a = a.entanglements; c; ) {
    var d = 31 - oc(c), e = 1 << d;
    e & b | a[d] & b && (a[d] |= b);
    c &= ~e;
  }
}
var C = 0;
function Dc(a) {
  a &= -a;
  return 1 < a ? 4 < a ? 0 !== (a & 268435455) ? 16 : 536870912 : 4 : 1;
}
var Ec, Fc, Gc, Hc, Ic, Jc = false, Kc = [], Lc = null, Mc = null, Nc = null, Oc = /* @__PURE__ */ new Map(), Pc = /* @__PURE__ */ new Map(), Qc = [], Rc = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");
function Sc(a, b) {
  switch (a) {
    case "focusin":
    case "focusout":
      Lc = null;
      break;
    case "dragenter":
    case "dragleave":
      Mc = null;
      break;
    case "mouseover":
    case "mouseout":
      Nc = null;
      break;
    case "pointerover":
    case "pointerout":
      Oc.delete(b.pointerId);
      break;
    case "gotpointercapture":
    case "lostpointercapture":
      Pc.delete(b.pointerId);
  }
}
function Tc(a, b, c, d, e, f2) {
  if (null === a || a.nativeEvent !== f2) return a = { blockedOn: b, domEventName: c, eventSystemFlags: d, nativeEvent: f2, targetContainers: [e] }, null !== b && (b = Cb(b), null !== b && Fc(b)), a;
  a.eventSystemFlags |= d;
  b = a.targetContainers;
  null !== e && -1 === b.indexOf(e) && b.push(e);
  return a;
}
function Uc(a, b, c, d, e) {
  switch (b) {
    case "focusin":
      return Lc = Tc(Lc, a, b, c, d, e), true;
    case "dragenter":
      return Mc = Tc(Mc, a, b, c, d, e), true;
    case "mouseover":
      return Nc = Tc(Nc, a, b, c, d, e), true;
    case "pointerover":
      var f2 = e.pointerId;
      Oc.set(f2, Tc(Oc.get(f2) || null, a, b, c, d, e));
      return true;
    case "gotpointercapture":
      return f2 = e.pointerId, Pc.set(f2, Tc(Pc.get(f2) || null, a, b, c, d, e)), true;
  }
  return false;
}
function Vc(a) {
  var b = Wc(a.target);
  if (null !== b) {
    var c = Vb(b);
    if (null !== c) {
      if (b = c.tag, 13 === b) {
        if (b = Wb(c), null !== b) {
          a.blockedOn = b;
          Ic(a.priority, function() {
            Gc(c);
          });
          return;
        }
      } else if (3 === b && c.stateNode.current.memoizedState.isDehydrated) {
        a.blockedOn = 3 === c.tag ? c.stateNode.containerInfo : null;
        return;
      }
    }
  }
  a.blockedOn = null;
}
function Xc(a) {
  if (null !== a.blockedOn) return false;
  for (var b = a.targetContainers; 0 < b.length; ) {
    var c = Yc(a.domEventName, a.eventSystemFlags, b[0], a.nativeEvent);
    if (null === c) {
      c = a.nativeEvent;
      var d = new c.constructor(c.type, c);
      wb = d;
      c.target.dispatchEvent(d);
      wb = null;
    } else return b = Cb(c), null !== b && Fc(b), a.blockedOn = c, false;
    b.shift();
  }
  return true;
}
function Zc(a, b, c) {
  Xc(a) && c.delete(b);
}
function $c() {
  Jc = false;
  null !== Lc && Xc(Lc) && (Lc = null);
  null !== Mc && Xc(Mc) && (Mc = null);
  null !== Nc && Xc(Nc) && (Nc = null);
  Oc.forEach(Zc);
  Pc.forEach(Zc);
}
function ad(a, b) {
  a.blockedOn === b && (a.blockedOn = null, Jc || (Jc = true, ca.unstable_scheduleCallback(ca.unstable_NormalPriority, $c)));
}
function bd(a) {
  function b(b2) {
    return ad(b2, a);
  }
  if (0 < Kc.length) {
    ad(Kc[0], a);
    for (var c = 1; c < Kc.length; c++) {
      var d = Kc[c];
      d.blockedOn === a && (d.blockedOn = null);
    }
  }
  null !== Lc && ad(Lc, a);
  null !== Mc && ad(Mc, a);
  null !== Nc && ad(Nc, a);
  Oc.forEach(b);
  Pc.forEach(b);
  for (c = 0; c < Qc.length; c++) d = Qc[c], d.blockedOn === a && (d.blockedOn = null);
  for (; 0 < Qc.length && (c = Qc[0], null === c.blockedOn); ) Vc(c), null === c.blockedOn && Qc.shift();
}
var cd = ua.ReactCurrentBatchConfig, dd = true;
function ed(a, b, c, d) {
  var e = C, f2 = cd.transition;
  cd.transition = null;
  try {
    C = 1, fd(a, b, c, d);
  } finally {
    C = e, cd.transition = f2;
  }
}
function gd(a, b, c, d) {
  var e = C, f2 = cd.transition;
  cd.transition = null;
  try {
    C = 4, fd(a, b, c, d);
  } finally {
    C = e, cd.transition = f2;
  }
}
function fd(a, b, c, d) {
  if (dd) {
    var e = Yc(a, b, c, d);
    if (null === e) hd(a, b, d, id, c), Sc(a, d);
    else if (Uc(e, a, b, c, d)) d.stopPropagation();
    else if (Sc(a, d), b & 4 && -1 < Rc.indexOf(a)) {
      for (; null !== e; ) {
        var f2 = Cb(e);
        null !== f2 && Ec(f2);
        f2 = Yc(a, b, c, d);
        null === f2 && hd(a, b, d, id, c);
        if (f2 === e) break;
        e = f2;
      }
      null !== e && d.stopPropagation();
    } else hd(a, b, d, null, c);
  }
}
var id = null;
function Yc(a, b, c, d) {
  id = null;
  a = xb(d);
  a = Wc(a);
  if (null !== a) if (b = Vb(a), null === b) a = null;
  else if (c = b.tag, 13 === c) {
    a = Wb(b);
    if (null !== a) return a;
    a = null;
  } else if (3 === c) {
    if (b.stateNode.current.memoizedState.isDehydrated) return 3 === b.tag ? b.stateNode.containerInfo : null;
    a = null;
  } else b !== a && (a = null);
  id = a;
  return null;
}
function jd(a) {
  switch (a) {
    case "cancel":
    case "click":
    case "close":
    case "contextmenu":
    case "copy":
    case "cut":
    case "auxclick":
    case "dblclick":
    case "dragend":
    case "dragstart":
    case "drop":
    case "focusin":
    case "focusout":
    case "input":
    case "invalid":
    case "keydown":
    case "keypress":
    case "keyup":
    case "mousedown":
    case "mouseup":
    case "paste":
    case "pause":
    case "play":
    case "pointercancel":
    case "pointerdown":
    case "pointerup":
    case "ratechange":
    case "reset":
    case "resize":
    case "seeked":
    case "submit":
    case "touchcancel":
    case "touchend":
    case "touchstart":
    case "volumechange":
    case "change":
    case "selectionchange":
    case "textInput":
    case "compositionstart":
    case "compositionend":
    case "compositionupdate":
    case "beforeblur":
    case "afterblur":
    case "beforeinput":
    case "blur":
    case "fullscreenchange":
    case "focus":
    case "hashchange":
    case "popstate":
    case "select":
    case "selectstart":
      return 1;
    case "drag":
    case "dragenter":
    case "dragexit":
    case "dragleave":
    case "dragover":
    case "mousemove":
    case "mouseout":
    case "mouseover":
    case "pointermove":
    case "pointerout":
    case "pointerover":
    case "scroll":
    case "toggle":
    case "touchmove":
    case "wheel":
    case "mouseenter":
    case "mouseleave":
    case "pointerenter":
    case "pointerleave":
      return 4;
    case "message":
      switch (ec()) {
        case fc:
          return 1;
        case gc:
          return 4;
        case hc:
        case ic:
          return 16;
        case jc:
          return 536870912;
        default:
          return 16;
      }
    default:
      return 16;
  }
}
var kd = null, ld = null, md = null;
function nd() {
  if (md) return md;
  var a, b = ld, c = b.length, d, e = "value" in kd ? kd.value : kd.textContent, f2 = e.length;
  for (a = 0; a < c && b[a] === e[a]; a++) ;
  var g = c - a;
  for (d = 1; d <= g && b[c - d] === e[f2 - d]; d++) ;
  return md = e.slice(a, 1 < d ? 1 - d : void 0);
}
function od(a) {
  var b = a.keyCode;
  "charCode" in a ? (a = a.charCode, 0 === a && 13 === b && (a = 13)) : a = b;
  10 === a && (a = 13);
  return 32 <= a || 13 === a ? a : 0;
}
function pd() {
  return true;
}
function qd() {
  return false;
}
function rd(a) {
  function b(b2, d, e, f2, g) {
    this._reactName = b2;
    this._targetInst = e;
    this.type = d;
    this.nativeEvent = f2;
    this.target = g;
    this.currentTarget = null;
    for (var c in a) a.hasOwnProperty(c) && (b2 = a[c], this[c] = b2 ? b2(f2) : f2[c]);
    this.isDefaultPrevented = (null != f2.defaultPrevented ? f2.defaultPrevented : false === f2.returnValue) ? pd : qd;
    this.isPropagationStopped = qd;
    return this;
  }
  A(b.prototype, { preventDefault: function() {
    this.defaultPrevented = true;
    var a2 = this.nativeEvent;
    a2 && (a2.preventDefault ? a2.preventDefault() : "unknown" !== typeof a2.returnValue && (a2.returnValue = false), this.isDefaultPrevented = pd);
  }, stopPropagation: function() {
    var a2 = this.nativeEvent;
    a2 && (a2.stopPropagation ? a2.stopPropagation() : "unknown" !== typeof a2.cancelBubble && (a2.cancelBubble = true), this.isPropagationStopped = pd);
  }, persist: function() {
  }, isPersistent: pd });
  return b;
}
var sd = { eventPhase: 0, bubbles: 0, cancelable: 0, timeStamp: function(a) {
  return a.timeStamp || Date.now();
}, defaultPrevented: 0, isTrusted: 0 }, td = rd(sd), ud = A({}, sd, { view: 0, detail: 0 }), vd = rd(ud), wd, xd, yd, Ad = A({}, ud, { screenX: 0, screenY: 0, clientX: 0, clientY: 0, pageX: 0, pageY: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, getModifierState: zd, button: 0, buttons: 0, relatedTarget: function(a) {
  return void 0 === a.relatedTarget ? a.fromElement === a.srcElement ? a.toElement : a.fromElement : a.relatedTarget;
}, movementX: function(a) {
  if ("movementX" in a) return a.movementX;
  a !== yd && (yd && "mousemove" === a.type ? (wd = a.screenX - yd.screenX, xd = a.screenY - yd.screenY) : xd = wd = 0, yd = a);
  return wd;
}, movementY: function(a) {
  return "movementY" in a ? a.movementY : xd;
} }), Bd = rd(Ad), Cd = A({}, Ad, { dataTransfer: 0 }), Dd = rd(Cd), Ed = A({}, ud, { relatedTarget: 0 }), Fd = rd(Ed), Gd = A({}, sd, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }), Hd = rd(Gd), Id = A({}, sd, { clipboardData: function(a) {
  return "clipboardData" in a ? a.clipboardData : window.clipboardData;
} }), Jd = rd(Id), Kd = A({}, sd, { data: 0 }), Ld = rd(Kd), Md = {
  Esc: "Escape",
  Spacebar: " ",
  Left: "ArrowLeft",
  Up: "ArrowUp",
  Right: "ArrowRight",
  Down: "ArrowDown",
  Del: "Delete",
  Win: "OS",
  Menu: "ContextMenu",
  Apps: "ContextMenu",
  Scroll: "ScrollLock",
  MozPrintableKey: "Unidentified"
}, Nd = {
  8: "Backspace",
  9: "Tab",
  12: "Clear",
  13: "Enter",
  16: "Shift",
  17: "Control",
  18: "Alt",
  19: "Pause",
  20: "CapsLock",
  27: "Escape",
  32: " ",
  33: "PageUp",
  34: "PageDown",
  35: "End",
  36: "Home",
  37: "ArrowLeft",
  38: "ArrowUp",
  39: "ArrowRight",
  40: "ArrowDown",
  45: "Insert",
  46: "Delete",
  112: "F1",
  113: "F2",
  114: "F3",
  115: "F4",
  116: "F5",
  117: "F6",
  118: "F7",
  119: "F8",
  120: "F9",
  121: "F10",
  122: "F11",
  123: "F12",
  144: "NumLock",
  145: "ScrollLock",
  224: "Meta"
}, Od = { Alt: "altKey", Control: "ctrlKey", Meta: "metaKey", Shift: "shiftKey" };
function Pd(a) {
  var b = this.nativeEvent;
  return b.getModifierState ? b.getModifierState(a) : (a = Od[a]) ? !!b[a] : false;
}
function zd() {
  return Pd;
}
var Qd = A({}, ud, { key: function(a) {
  if (a.key) {
    var b = Md[a.key] || a.key;
    if ("Unidentified" !== b) return b;
  }
  return "keypress" === a.type ? (a = od(a), 13 === a ? "Enter" : String.fromCharCode(a)) : "keydown" === a.type || "keyup" === a.type ? Nd[a.keyCode] || "Unidentified" : "";
}, code: 0, location: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, repeat: 0, locale: 0, getModifierState: zd, charCode: function(a) {
  return "keypress" === a.type ? od(a) : 0;
}, keyCode: function(a) {
  return "keydown" === a.type || "keyup" === a.type ? a.keyCode : 0;
}, which: function(a) {
  return "keypress" === a.type ? od(a) : "keydown" === a.type || "keyup" === a.type ? a.keyCode : 0;
} }), Rd = rd(Qd), Sd = A({}, Ad, { pointerId: 0, width: 0, height: 0, pressure: 0, tangentialPressure: 0, tiltX: 0, tiltY: 0, twist: 0, pointerType: 0, isPrimary: 0 }), Td = rd(Sd), Ud = A({}, ud, { touches: 0, targetTouches: 0, changedTouches: 0, altKey: 0, metaKey: 0, ctrlKey: 0, shiftKey: 0, getModifierState: zd }), Vd = rd(Ud), Wd = A({}, sd, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }), Xd = rd(Wd), Yd = A({}, Ad, {
  deltaX: function(a) {
    return "deltaX" in a ? a.deltaX : "wheelDeltaX" in a ? -a.wheelDeltaX : 0;
  },
  deltaY: function(a) {
    return "deltaY" in a ? a.deltaY : "wheelDeltaY" in a ? -a.wheelDeltaY : "wheelDelta" in a ? -a.wheelDelta : 0;
  },
  deltaZ: 0,
  deltaMode: 0
}), Zd = rd(Yd), $d = [9, 13, 27, 32], ae = ia && "CompositionEvent" in window, be = null;
ia && "documentMode" in document && (be = document.documentMode);
var ce = ia && "TextEvent" in window && !be, de = ia && (!ae || be && 8 < be && 11 >= be), ee = String.fromCharCode(32), fe = false;
function ge(a, b) {
  switch (a) {
    case "keyup":
      return -1 !== $d.indexOf(b.keyCode);
    case "keydown":
      return 229 !== b.keyCode;
    case "keypress":
    case "mousedown":
    case "focusout":
      return true;
    default:
      return false;
  }
}
function he(a) {
  a = a.detail;
  return "object" === typeof a && "data" in a ? a.data : null;
}
var ie = false;
function je(a, b) {
  switch (a) {
    case "compositionend":
      return he(b);
    case "keypress":
      if (32 !== b.which) return null;
      fe = true;
      return ee;
    case "textInput":
      return a = b.data, a === ee && fe ? null : a;
    default:
      return null;
  }
}
function ke(a, b) {
  if (ie) return "compositionend" === a || !ae && ge(a, b) ? (a = nd(), md = ld = kd = null, ie = false, a) : null;
  switch (a) {
    case "paste":
      return null;
    case "keypress":
      if (!(b.ctrlKey || b.altKey || b.metaKey) || b.ctrlKey && b.altKey) {
        if (b.char && 1 < b.char.length) return b.char;
        if (b.which) return String.fromCharCode(b.which);
      }
      return null;
    case "compositionend":
      return de && "ko" !== b.locale ? null : b.data;
    default:
      return null;
  }
}
var le = { color: true, date: true, datetime: true, "datetime-local": true, email: true, month: true, number: true, password: true, range: true, search: true, tel: true, text: true, time: true, url: true, week: true };
function me(a) {
  var b = a && a.nodeName && a.nodeName.toLowerCase();
  return "input" === b ? !!le[a.type] : "textarea" === b ? true : false;
}
function ne(a, b, c, d) {
  Eb(d);
  b = oe(b, "onChange");
  0 < b.length && (c = new td("onChange", "change", null, c, d), a.push({ event: c, listeners: b }));
}
var pe = null, qe = null;
function re(a) {
  se(a, 0);
}
function te(a) {
  var b = ue(a);
  if (Wa(b)) return a;
}
function ve(a, b) {
  if ("change" === a) return b;
}
var we = false;
if (ia) {
  var xe;
  if (ia) {
    var ye = "oninput" in document;
    if (!ye) {
      var ze = document.createElement("div");
      ze.setAttribute("oninput", "return;");
      ye = "function" === typeof ze.oninput;
    }
    xe = ye;
  } else xe = false;
  we = xe && (!document.documentMode || 9 < document.documentMode);
}
function Ae() {
  pe && (pe.detachEvent("onpropertychange", Be), qe = pe = null);
}
function Be(a) {
  if ("value" === a.propertyName && te(qe)) {
    var b = [];
    ne(b, qe, a, xb(a));
    Jb(re, b);
  }
}
function Ce(a, b, c) {
  "focusin" === a ? (Ae(), pe = b, qe = c, pe.attachEvent("onpropertychange", Be)) : "focusout" === a && Ae();
}
function De(a) {
  if ("selectionchange" === a || "keyup" === a || "keydown" === a) return te(qe);
}
function Ee(a, b) {
  if ("click" === a) return te(b);
}
function Fe(a, b) {
  if ("input" === a || "change" === a) return te(b);
}
function Ge(a, b) {
  return a === b && (0 !== a || 1 / a === 1 / b) || a !== a && b !== b;
}
var He = "function" === typeof Object.is ? Object.is : Ge;
function Ie(a, b) {
  if (He(a, b)) return true;
  if ("object" !== typeof a || null === a || "object" !== typeof b || null === b) return false;
  var c = Object.keys(a), d = Object.keys(b);
  if (c.length !== d.length) return false;
  for (d = 0; d < c.length; d++) {
    var e = c[d];
    if (!ja.call(b, e) || !He(a[e], b[e])) return false;
  }
  return true;
}
function Je(a) {
  for (; a && a.firstChild; ) a = a.firstChild;
  return a;
}
function Ke(a, b) {
  var c = Je(a);
  a = 0;
  for (var d; c; ) {
    if (3 === c.nodeType) {
      d = a + c.textContent.length;
      if (a <= b && d >= b) return { node: c, offset: b - a };
      a = d;
    }
    a: {
      for (; c; ) {
        if (c.nextSibling) {
          c = c.nextSibling;
          break a;
        }
        c = c.parentNode;
      }
      c = void 0;
    }
    c = Je(c);
  }
}
function Le(a, b) {
  return a && b ? a === b ? true : a && 3 === a.nodeType ? false : b && 3 === b.nodeType ? Le(a, b.parentNode) : "contains" in a ? a.contains(b) : a.compareDocumentPosition ? !!(a.compareDocumentPosition(b) & 16) : false : false;
}
function Me() {
  for (var a = window, b = Xa(); b instanceof a.HTMLIFrameElement; ) {
    try {
      var c = "string" === typeof b.contentWindow.location.href;
    } catch (d) {
      c = false;
    }
    if (c) a = b.contentWindow;
    else break;
    b = Xa(a.document);
  }
  return b;
}
function Ne(a) {
  var b = a && a.nodeName && a.nodeName.toLowerCase();
  return b && ("input" === b && ("text" === a.type || "search" === a.type || "tel" === a.type || "url" === a.type || "password" === a.type) || "textarea" === b || "true" === a.contentEditable);
}
function Oe(a) {
  var b = Me(), c = a.focusedElem, d = a.selectionRange;
  if (b !== c && c && c.ownerDocument && Le(c.ownerDocument.documentElement, c)) {
    if (null !== d && Ne(c)) {
      if (b = d.start, a = d.end, void 0 === a && (a = b), "selectionStart" in c) c.selectionStart = b, c.selectionEnd = Math.min(a, c.value.length);
      else if (a = (b = c.ownerDocument || document) && b.defaultView || window, a.getSelection) {
        a = a.getSelection();
        var e = c.textContent.length, f2 = Math.min(d.start, e);
        d = void 0 === d.end ? f2 : Math.min(d.end, e);
        !a.extend && f2 > d && (e = d, d = f2, f2 = e);
        e = Ke(c, f2);
        var g = Ke(
          c,
          d
        );
        e && g && (1 !== a.rangeCount || a.anchorNode !== e.node || a.anchorOffset !== e.offset || a.focusNode !== g.node || a.focusOffset !== g.offset) && (b = b.createRange(), b.setStart(e.node, e.offset), a.removeAllRanges(), f2 > d ? (a.addRange(b), a.extend(g.node, g.offset)) : (b.setEnd(g.node, g.offset), a.addRange(b)));
      }
    }
    b = [];
    for (a = c; a = a.parentNode; ) 1 === a.nodeType && b.push({ element: a, left: a.scrollLeft, top: a.scrollTop });
    "function" === typeof c.focus && c.focus();
    for (c = 0; c < b.length; c++) a = b[c], a.element.scrollLeft = a.left, a.element.scrollTop = a.top;
  }
}
var Pe = ia && "documentMode" in document && 11 >= document.documentMode, Qe = null, Re = null, Se = null, Te = false;
function Ue(a, b, c) {
  var d = c.window === c ? c.document : 9 === c.nodeType ? c : c.ownerDocument;
  Te || null == Qe || Qe !== Xa(d) || (d = Qe, "selectionStart" in d && Ne(d) ? d = { start: d.selectionStart, end: d.selectionEnd } : (d = (d.ownerDocument && d.ownerDocument.defaultView || window).getSelection(), d = { anchorNode: d.anchorNode, anchorOffset: d.anchorOffset, focusNode: d.focusNode, focusOffset: d.focusOffset }), Se && Ie(Se, d) || (Se = d, d = oe(Re, "onSelect"), 0 < d.length && (b = new td("onSelect", "select", null, b, c), a.push({ event: b, listeners: d }), b.target = Qe)));
}
function Ve(a, b) {
  var c = {};
  c[a.toLowerCase()] = b.toLowerCase();
  c["Webkit" + a] = "webkit" + b;
  c["Moz" + a] = "moz" + b;
  return c;
}
var We = { animationend: Ve("Animation", "AnimationEnd"), animationiteration: Ve("Animation", "AnimationIteration"), animationstart: Ve("Animation", "AnimationStart"), transitionend: Ve("Transition", "TransitionEnd") }, Xe = {}, Ye = {};
ia && (Ye = document.createElement("div").style, "AnimationEvent" in window || (delete We.animationend.animation, delete We.animationiteration.animation, delete We.animationstart.animation), "TransitionEvent" in window || delete We.transitionend.transition);
function Ze(a) {
  if (Xe[a]) return Xe[a];
  if (!We[a]) return a;
  var b = We[a], c;
  for (c in b) if (b.hasOwnProperty(c) && c in Ye) return Xe[a] = b[c];
  return a;
}
var $e = Ze("animationend"), af = Ze("animationiteration"), bf = Ze("animationstart"), cf = Ze("transitionend"), df = /* @__PURE__ */ new Map(), ef = "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
function ff(a, b) {
  df.set(a, b);
  fa(b, [a]);
}
for (var gf = 0; gf < ef.length; gf++) {
  var hf = ef[gf], jf = hf.toLowerCase(), kf = hf[0].toUpperCase() + hf.slice(1);
  ff(jf, "on" + kf);
}
ff($e, "onAnimationEnd");
ff(af, "onAnimationIteration");
ff(bf, "onAnimationStart");
ff("dblclick", "onDoubleClick");
ff("focusin", "onFocus");
ff("focusout", "onBlur");
ff(cf, "onTransitionEnd");
ha("onMouseEnter", ["mouseout", "mouseover"]);
ha("onMouseLeave", ["mouseout", "mouseover"]);
ha("onPointerEnter", ["pointerout", "pointerover"]);
ha("onPointerLeave", ["pointerout", "pointerover"]);
fa("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" "));
fa("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));
fa("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]);
fa("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" "));
fa("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" "));
fa("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
var lf = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), mf = new Set("cancel close invalid load scroll toggle".split(" ").concat(lf));
function nf(a, b, c) {
  var d = a.type || "unknown-event";
  a.currentTarget = c;
  Ub(d, b, void 0, a);
  a.currentTarget = null;
}
function se(a, b) {
  b = 0 !== (b & 4);
  for (var c = 0; c < a.length; c++) {
    var d = a[c], e = d.event;
    d = d.listeners;
    a: {
      var f2 = void 0;
      if (b) for (var g = d.length - 1; 0 <= g; g--) {
        var h = d[g], k2 = h.instance, l2 = h.currentTarget;
        h = h.listener;
        if (k2 !== f2 && e.isPropagationStopped()) break a;
        nf(e, h, l2);
        f2 = k2;
      }
      else for (g = 0; g < d.length; g++) {
        h = d[g];
        k2 = h.instance;
        l2 = h.currentTarget;
        h = h.listener;
        if (k2 !== f2 && e.isPropagationStopped()) break a;
        nf(e, h, l2);
        f2 = k2;
      }
    }
  }
  if (Qb) throw a = Rb, Qb = false, Rb = null, a;
}
function D(a, b) {
  var c = b[of];
  void 0 === c && (c = b[of] = /* @__PURE__ */ new Set());
  var d = a + "__bubble";
  c.has(d) || (pf(b, a, 2, false), c.add(d));
}
function qf(a, b, c) {
  var d = 0;
  b && (d |= 4);
  pf(c, a, d, b);
}
var rf = "_reactListening" + Math.random().toString(36).slice(2);
function sf(a) {
  if (!a[rf]) {
    a[rf] = true;
    da.forEach(function(b2) {
      "selectionchange" !== b2 && (mf.has(b2) || qf(b2, false, a), qf(b2, true, a));
    });
    var b = 9 === a.nodeType ? a : a.ownerDocument;
    null === b || b[rf] || (b[rf] = true, qf("selectionchange", false, b));
  }
}
function pf(a, b, c, d) {
  switch (jd(b)) {
    case 1:
      var e = ed;
      break;
    case 4:
      e = gd;
      break;
    default:
      e = fd;
  }
  c = e.bind(null, b, c, a);
  e = void 0;
  !Lb || "touchstart" !== b && "touchmove" !== b && "wheel" !== b || (e = true);
  d ? void 0 !== e ? a.addEventListener(b, c, { capture: true, passive: e }) : a.addEventListener(b, c, true) : void 0 !== e ? a.addEventListener(b, c, { passive: e }) : a.addEventListener(b, c, false);
}
function hd(a, b, c, d, e) {
  var f2 = d;
  if (0 === (b & 1) && 0 === (b & 2) && null !== d) a: for (; ; ) {
    if (null === d) return;
    var g = d.tag;
    if (3 === g || 4 === g) {
      var h = d.stateNode.containerInfo;
      if (h === e || 8 === h.nodeType && h.parentNode === e) break;
      if (4 === g) for (g = d.return; null !== g; ) {
        var k2 = g.tag;
        if (3 === k2 || 4 === k2) {
          if (k2 = g.stateNode.containerInfo, k2 === e || 8 === k2.nodeType && k2.parentNode === e) return;
        }
        g = g.return;
      }
      for (; null !== h; ) {
        g = Wc(h);
        if (null === g) return;
        k2 = g.tag;
        if (5 === k2 || 6 === k2) {
          d = f2 = g;
          continue a;
        }
        h = h.parentNode;
      }
    }
    d = d.return;
  }
  Jb(function() {
    var d2 = f2, e2 = xb(c), g2 = [];
    a: {
      var h2 = df.get(a);
      if (void 0 !== h2) {
        var k3 = td, n2 = a;
        switch (a) {
          case "keypress":
            if (0 === od(c)) break a;
          case "keydown":
          case "keyup":
            k3 = Rd;
            break;
          case "focusin":
            n2 = "focus";
            k3 = Fd;
            break;
          case "focusout":
            n2 = "blur";
            k3 = Fd;
            break;
          case "beforeblur":
          case "afterblur":
            k3 = Fd;
            break;
          case "click":
            if (2 === c.button) break a;
          case "auxclick":
          case "dblclick":
          case "mousedown":
          case "mousemove":
          case "mouseup":
          case "mouseout":
          case "mouseover":
          case "contextmenu":
            k3 = Bd;
            break;
          case "drag":
          case "dragend":
          case "dragenter":
          case "dragexit":
          case "dragleave":
          case "dragover":
          case "dragstart":
          case "drop":
            k3 = Dd;
            break;
          case "touchcancel":
          case "touchend":
          case "touchmove":
          case "touchstart":
            k3 = Vd;
            break;
          case $e:
          case af:
          case bf:
            k3 = Hd;
            break;
          case cf:
            k3 = Xd;
            break;
          case "scroll":
            k3 = vd;
            break;
          case "wheel":
            k3 = Zd;
            break;
          case "copy":
          case "cut":
          case "paste":
            k3 = Jd;
            break;
          case "gotpointercapture":
          case "lostpointercapture":
          case "pointercancel":
          case "pointerdown":
          case "pointermove":
          case "pointerout":
          case "pointerover":
          case "pointerup":
            k3 = Td;
        }
        var t2 = 0 !== (b & 4), J2 = !t2 && "scroll" === a, x2 = t2 ? null !== h2 ? h2 + "Capture" : null : h2;
        t2 = [];
        for (var w2 = d2, u2; null !== w2; ) {
          u2 = w2;
          var F2 = u2.stateNode;
          5 === u2.tag && null !== F2 && (u2 = F2, null !== x2 && (F2 = Kb(w2, x2), null != F2 && t2.push(tf(w2, F2, u2))));
          if (J2) break;
          w2 = w2.return;
        }
        0 < t2.length && (h2 = new k3(h2, n2, null, c, e2), g2.push({ event: h2, listeners: t2 }));
      }
    }
    if (0 === (b & 7)) {
      a: {
        h2 = "mouseover" === a || "pointerover" === a;
        k3 = "mouseout" === a || "pointerout" === a;
        if (h2 && c !== wb && (n2 = c.relatedTarget || c.fromElement) && (Wc(n2) || n2[uf])) break a;
        if (k3 || h2) {
          h2 = e2.window === e2 ? e2 : (h2 = e2.ownerDocument) ? h2.defaultView || h2.parentWindow : window;
          if (k3) {
            if (n2 = c.relatedTarget || c.toElement, k3 = d2, n2 = n2 ? Wc(n2) : null, null !== n2 && (J2 = Vb(n2), n2 !== J2 || 5 !== n2.tag && 6 !== n2.tag)) n2 = null;
          } else k3 = null, n2 = d2;
          if (k3 !== n2) {
            t2 = Bd;
            F2 = "onMouseLeave";
            x2 = "onMouseEnter";
            w2 = "mouse";
            if ("pointerout" === a || "pointerover" === a) t2 = Td, F2 = "onPointerLeave", x2 = "onPointerEnter", w2 = "pointer";
            J2 = null == k3 ? h2 : ue(k3);
            u2 = null == n2 ? h2 : ue(n2);
            h2 = new t2(F2, w2 + "leave", k3, c, e2);
            h2.target = J2;
            h2.relatedTarget = u2;
            F2 = null;
            Wc(e2) === d2 && (t2 = new t2(x2, w2 + "enter", n2, c, e2), t2.target = u2, t2.relatedTarget = J2, F2 = t2);
            J2 = F2;
            if (k3 && n2) b: {
              t2 = k3;
              x2 = n2;
              w2 = 0;
              for (u2 = t2; u2; u2 = vf(u2)) w2++;
              u2 = 0;
              for (F2 = x2; F2; F2 = vf(F2)) u2++;
              for (; 0 < w2 - u2; ) t2 = vf(t2), w2--;
              for (; 0 < u2 - w2; ) x2 = vf(x2), u2--;
              for (; w2--; ) {
                if (t2 === x2 || null !== x2 && t2 === x2.alternate) break b;
                t2 = vf(t2);
                x2 = vf(x2);
              }
              t2 = null;
            }
            else t2 = null;
            null !== k3 && wf(g2, h2, k3, t2, false);
            null !== n2 && null !== J2 && wf(g2, J2, n2, t2, true);
          }
        }
      }
      a: {
        h2 = d2 ? ue(d2) : window;
        k3 = h2.nodeName && h2.nodeName.toLowerCase();
        if ("select" === k3 || "input" === k3 && "file" === h2.type) var na = ve;
        else if (me(h2)) if (we) na = Fe;
        else {
          na = De;
          var xa = Ce;
        }
        else (k3 = h2.nodeName) && "input" === k3.toLowerCase() && ("checkbox" === h2.type || "radio" === h2.type) && (na = Ee);
        if (na && (na = na(a, d2))) {
          ne(g2, na, c, e2);
          break a;
        }
        xa && xa(a, h2, d2);
        "focusout" === a && (xa = h2._wrapperState) && xa.controlled && "number" === h2.type && cb(h2, "number", h2.value);
      }
      xa = d2 ? ue(d2) : window;
      switch (a) {
        case "focusin":
          if (me(xa) || "true" === xa.contentEditable) Qe = xa, Re = d2, Se = null;
          break;
        case "focusout":
          Se = Re = Qe = null;
          break;
        case "mousedown":
          Te = true;
          break;
        case "contextmenu":
        case "mouseup":
        case "dragend":
          Te = false;
          Ue(g2, c, e2);
          break;
        case "selectionchange":
          if (Pe) break;
        case "keydown":
        case "keyup":
          Ue(g2, c, e2);
      }
      var $a;
      if (ae) b: {
        switch (a) {
          case "compositionstart":
            var ba = "onCompositionStart";
            break b;
          case "compositionend":
            ba = "onCompositionEnd";
            break b;
          case "compositionupdate":
            ba = "onCompositionUpdate";
            break b;
        }
        ba = void 0;
      }
      else ie ? ge(a, c) && (ba = "onCompositionEnd") : "keydown" === a && 229 === c.keyCode && (ba = "onCompositionStart");
      ba && (de && "ko" !== c.locale && (ie || "onCompositionStart" !== ba ? "onCompositionEnd" === ba && ie && ($a = nd()) : (kd = e2, ld = "value" in kd ? kd.value : kd.textContent, ie = true)), xa = oe(d2, ba), 0 < xa.length && (ba = new Ld(ba, a, null, c, e2), g2.push({ event: ba, listeners: xa }), $a ? ba.data = $a : ($a = he(c), null !== $a && (ba.data = $a))));
      if ($a = ce ? je(a, c) : ke(a, c)) d2 = oe(d2, "onBeforeInput"), 0 < d2.length && (e2 = new Ld("onBeforeInput", "beforeinput", null, c, e2), g2.push({ event: e2, listeners: d2 }), e2.data = $a);
    }
    se(g2, b);
  });
}
function tf(a, b, c) {
  return { instance: a, listener: b, currentTarget: c };
}
function oe(a, b) {
  for (var c = b + "Capture", d = []; null !== a; ) {
    var e = a, f2 = e.stateNode;
    5 === e.tag && null !== f2 && (e = f2, f2 = Kb(a, c), null != f2 && d.unshift(tf(a, f2, e)), f2 = Kb(a, b), null != f2 && d.push(tf(a, f2, e)));
    a = a.return;
  }
  return d;
}
function vf(a) {
  if (null === a) return null;
  do
    a = a.return;
  while (a && 5 !== a.tag);
  return a ? a : null;
}
function wf(a, b, c, d, e) {
  for (var f2 = b._reactName, g = []; null !== c && c !== d; ) {
    var h = c, k2 = h.alternate, l2 = h.stateNode;
    if (null !== k2 && k2 === d) break;
    5 === h.tag && null !== l2 && (h = l2, e ? (k2 = Kb(c, f2), null != k2 && g.unshift(tf(c, k2, h))) : e || (k2 = Kb(c, f2), null != k2 && g.push(tf(c, k2, h))));
    c = c.return;
  }
  0 !== g.length && a.push({ event: b, listeners: g });
}
var xf = /\r\n?/g, yf = /\u0000|\uFFFD/g;
function zf(a) {
  return ("string" === typeof a ? a : "" + a).replace(xf, "\n").replace(yf, "");
}
function Af(a, b, c) {
  b = zf(b);
  if (zf(a) !== b && c) throw Error(p(425));
}
function Bf() {
}
var Cf = null, Df = null;
function Ef(a, b) {
  return "textarea" === a || "noscript" === a || "string" === typeof b.children || "number" === typeof b.children || "object" === typeof b.dangerouslySetInnerHTML && null !== b.dangerouslySetInnerHTML && null != b.dangerouslySetInnerHTML.__html;
}
var Ff = "function" === typeof setTimeout ? setTimeout : void 0, Gf = "function" === typeof clearTimeout ? clearTimeout : void 0, Hf = "function" === typeof Promise ? Promise : void 0, Jf = "function" === typeof queueMicrotask ? queueMicrotask : "undefined" !== typeof Hf ? function(a) {
  return Hf.resolve(null).then(a).catch(If);
} : Ff;
function If(a) {
  setTimeout(function() {
    throw a;
  });
}
function Kf(a, b) {
  var c = b, d = 0;
  do {
    var e = c.nextSibling;
    a.removeChild(c);
    if (e && 8 === e.nodeType) if (c = e.data, "/$" === c) {
      if (0 === d) {
        a.removeChild(e);
        bd(b);
        return;
      }
      d--;
    } else "$" !== c && "$?" !== c && "$!" !== c || d++;
    c = e;
  } while (c);
  bd(b);
}
function Lf(a) {
  for (; null != a; a = a.nextSibling) {
    var b = a.nodeType;
    if (1 === b || 3 === b) break;
    if (8 === b) {
      b = a.data;
      if ("$" === b || "$!" === b || "$?" === b) break;
      if ("/$" === b) return null;
    }
  }
  return a;
}
function Mf(a) {
  a = a.previousSibling;
  for (var b = 0; a; ) {
    if (8 === a.nodeType) {
      var c = a.data;
      if ("$" === c || "$!" === c || "$?" === c) {
        if (0 === b) return a;
        b--;
      } else "/$" === c && b++;
    }
    a = a.previousSibling;
  }
  return null;
}
var Nf = Math.random().toString(36).slice(2), Of = "__reactFiber$" + Nf, Pf = "__reactProps$" + Nf, uf = "__reactContainer$" + Nf, of = "__reactEvents$" + Nf, Qf = "__reactListeners$" + Nf, Rf = "__reactHandles$" + Nf;
function Wc(a) {
  var b = a[Of];
  if (b) return b;
  for (var c = a.parentNode; c; ) {
    if (b = c[uf] || c[Of]) {
      c = b.alternate;
      if (null !== b.child || null !== c && null !== c.child) for (a = Mf(a); null !== a; ) {
        if (c = a[Of]) return c;
        a = Mf(a);
      }
      return b;
    }
    a = c;
    c = a.parentNode;
  }
  return null;
}
function Cb(a) {
  a = a[Of] || a[uf];
  return !a || 5 !== a.tag && 6 !== a.tag && 13 !== a.tag && 3 !== a.tag ? null : a;
}
function ue(a) {
  if (5 === a.tag || 6 === a.tag) return a.stateNode;
  throw Error(p(33));
}
function Db(a) {
  return a[Pf] || null;
}
var Sf = [], Tf = -1;
function Uf(a) {
  return { current: a };
}
function E(a) {
  0 > Tf || (a.current = Sf[Tf], Sf[Tf] = null, Tf--);
}
function G(a, b) {
  Tf++;
  Sf[Tf] = a.current;
  a.current = b;
}
var Vf = {}, H = Uf(Vf), Wf = Uf(false), Xf = Vf;
function Yf(a, b) {
  var c = a.type.contextTypes;
  if (!c) return Vf;
  var d = a.stateNode;
  if (d && d.__reactInternalMemoizedUnmaskedChildContext === b) return d.__reactInternalMemoizedMaskedChildContext;
  var e = {}, f2;
  for (f2 in c) e[f2] = b[f2];
  d && (a = a.stateNode, a.__reactInternalMemoizedUnmaskedChildContext = b, a.__reactInternalMemoizedMaskedChildContext = e);
  return e;
}
function Zf(a) {
  a = a.childContextTypes;
  return null !== a && void 0 !== a;
}
function $f() {
  E(Wf);
  E(H);
}
function ag(a, b, c) {
  if (H.current !== Vf) throw Error(p(168));
  G(H, b);
  G(Wf, c);
}
function bg(a, b, c) {
  var d = a.stateNode;
  b = b.childContextTypes;
  if ("function" !== typeof d.getChildContext) return c;
  d = d.getChildContext();
  for (var e in d) if (!(e in b)) throw Error(p(108, Ra(a) || "Unknown", e));
  return A({}, c, d);
}
function cg(a) {
  a = (a = a.stateNode) && a.__reactInternalMemoizedMergedChildContext || Vf;
  Xf = H.current;
  G(H, a);
  G(Wf, Wf.current);
  return true;
}
function dg(a, b, c) {
  var d = a.stateNode;
  if (!d) throw Error(p(169));
  c ? (a = bg(a, b, Xf), d.__reactInternalMemoizedMergedChildContext = a, E(Wf), E(H), G(H, a)) : E(Wf);
  G(Wf, c);
}
var eg = null, fg = false, gg = false;
function hg(a) {
  null === eg ? eg = [a] : eg.push(a);
}
function ig(a) {
  fg = true;
  hg(a);
}
function jg() {
  if (!gg && null !== eg) {
    gg = true;
    var a = 0, b = C;
    try {
      var c = eg;
      for (C = 1; a < c.length; a++) {
        var d = c[a];
        do
          d = d(true);
        while (null !== d);
      }
      eg = null;
      fg = false;
    } catch (e) {
      throw null !== eg && (eg = eg.slice(a + 1)), ac(fc, jg), e;
    } finally {
      C = b, gg = false;
    }
  }
  return null;
}
var kg = [], lg = 0, mg = null, ng = 0, og = [], pg = 0, qg = null, rg = 1, sg = "";
function tg(a, b) {
  kg[lg++] = ng;
  kg[lg++] = mg;
  mg = a;
  ng = b;
}
function ug(a, b, c) {
  og[pg++] = rg;
  og[pg++] = sg;
  og[pg++] = qg;
  qg = a;
  var d = rg;
  a = sg;
  var e = 32 - oc(d) - 1;
  d &= ~(1 << e);
  c += 1;
  var f2 = 32 - oc(b) + e;
  if (30 < f2) {
    var g = e - e % 5;
    f2 = (d & (1 << g) - 1).toString(32);
    d >>= g;
    e -= g;
    rg = 1 << 32 - oc(b) + e | c << e | d;
    sg = f2 + a;
  } else rg = 1 << f2 | c << e | d, sg = a;
}
function vg(a) {
  null !== a.return && (tg(a, 1), ug(a, 1, 0));
}
function wg(a) {
  for (; a === mg; ) mg = kg[--lg], kg[lg] = null, ng = kg[--lg], kg[lg] = null;
  for (; a === qg; ) qg = og[--pg], og[pg] = null, sg = og[--pg], og[pg] = null, rg = og[--pg], og[pg] = null;
}
var xg = null, yg = null, I = false, zg = null;
function Ag(a, b) {
  var c = Bg(5, null, null, 0);
  c.elementType = "DELETED";
  c.stateNode = b;
  c.return = a;
  b = a.deletions;
  null === b ? (a.deletions = [c], a.flags |= 16) : b.push(c);
}
function Cg(a, b) {
  switch (a.tag) {
    case 5:
      var c = a.type;
      b = 1 !== b.nodeType || c.toLowerCase() !== b.nodeName.toLowerCase() ? null : b;
      return null !== b ? (a.stateNode = b, xg = a, yg = Lf(b.firstChild), true) : false;
    case 6:
      return b = "" === a.pendingProps || 3 !== b.nodeType ? null : b, null !== b ? (a.stateNode = b, xg = a, yg = null, true) : false;
    case 13:
      return b = 8 !== b.nodeType ? null : b, null !== b ? (c = null !== qg ? { id: rg, overflow: sg } : null, a.memoizedState = { dehydrated: b, treeContext: c, retryLane: 1073741824 }, c = Bg(18, null, null, 0), c.stateNode = b, c.return = a, a.child = c, xg = a, yg = null, true) : false;
    default:
      return false;
  }
}
function Dg(a) {
  return 0 !== (a.mode & 1) && 0 === (a.flags & 128);
}
function Eg(a) {
  if (I) {
    var b = yg;
    if (b) {
      var c = b;
      if (!Cg(a, b)) {
        if (Dg(a)) throw Error(p(418));
        b = Lf(c.nextSibling);
        var d = xg;
        b && Cg(a, b) ? Ag(d, c) : (a.flags = a.flags & -4097 | 2, I = false, xg = a);
      }
    } else {
      if (Dg(a)) throw Error(p(418));
      a.flags = a.flags & -4097 | 2;
      I = false;
      xg = a;
    }
  }
}
function Fg(a) {
  for (a = a.return; null !== a && 5 !== a.tag && 3 !== a.tag && 13 !== a.tag; ) a = a.return;
  xg = a;
}
function Gg(a) {
  if (a !== xg) return false;
  if (!I) return Fg(a), I = true, false;
  var b;
  (b = 3 !== a.tag) && !(b = 5 !== a.tag) && (b = a.type, b = "head" !== b && "body" !== b && !Ef(a.type, a.memoizedProps));
  if (b && (b = yg)) {
    if (Dg(a)) throw Hg(), Error(p(418));
    for (; b; ) Ag(a, b), b = Lf(b.nextSibling);
  }
  Fg(a);
  if (13 === a.tag) {
    a = a.memoizedState;
    a = null !== a ? a.dehydrated : null;
    if (!a) throw Error(p(317));
    a: {
      a = a.nextSibling;
      for (b = 0; a; ) {
        if (8 === a.nodeType) {
          var c = a.data;
          if ("/$" === c) {
            if (0 === b) {
              yg = Lf(a.nextSibling);
              break a;
            }
            b--;
          } else "$" !== c && "$!" !== c && "$?" !== c || b++;
        }
        a = a.nextSibling;
      }
      yg = null;
    }
  } else yg = xg ? Lf(a.stateNode.nextSibling) : null;
  return true;
}
function Hg() {
  for (var a = yg; a; ) a = Lf(a.nextSibling);
}
function Ig() {
  yg = xg = null;
  I = false;
}
function Jg(a) {
  null === zg ? zg = [a] : zg.push(a);
}
var Kg = ua.ReactCurrentBatchConfig;
function Lg(a, b, c) {
  a = c.ref;
  if (null !== a && "function" !== typeof a && "object" !== typeof a) {
    if (c._owner) {
      c = c._owner;
      if (c) {
        if (1 !== c.tag) throw Error(p(309));
        var d = c.stateNode;
      }
      if (!d) throw Error(p(147, a));
      var e = d, f2 = "" + a;
      if (null !== b && null !== b.ref && "function" === typeof b.ref && b.ref._stringRef === f2) return b.ref;
      b = function(a2) {
        var b2 = e.refs;
        null === a2 ? delete b2[f2] : b2[f2] = a2;
      };
      b._stringRef = f2;
      return b;
    }
    if ("string" !== typeof a) throw Error(p(284));
    if (!c._owner) throw Error(p(290, a));
  }
  return a;
}
function Mg(a, b) {
  a = Object.prototype.toString.call(b);
  throw Error(p(31, "[object Object]" === a ? "object with keys {" + Object.keys(b).join(", ") + "}" : a));
}
function Ng(a) {
  var b = a._init;
  return b(a._payload);
}
function Og(a) {
  function b(b2, c2) {
    if (a) {
      var d2 = b2.deletions;
      null === d2 ? (b2.deletions = [c2], b2.flags |= 16) : d2.push(c2);
    }
  }
  function c(c2, d2) {
    if (!a) return null;
    for (; null !== d2; ) b(c2, d2), d2 = d2.sibling;
    return null;
  }
  function d(a2, b2) {
    for (a2 = /* @__PURE__ */ new Map(); null !== b2; ) null !== b2.key ? a2.set(b2.key, b2) : a2.set(b2.index, b2), b2 = b2.sibling;
    return a2;
  }
  function e(a2, b2) {
    a2 = Pg(a2, b2);
    a2.index = 0;
    a2.sibling = null;
    return a2;
  }
  function f2(b2, c2, d2) {
    b2.index = d2;
    if (!a) return b2.flags |= 1048576, c2;
    d2 = b2.alternate;
    if (null !== d2) return d2 = d2.index, d2 < c2 ? (b2.flags |= 2, c2) : d2;
    b2.flags |= 2;
    return c2;
  }
  function g(b2) {
    a && null === b2.alternate && (b2.flags |= 2);
    return b2;
  }
  function h(a2, b2, c2, d2) {
    if (null === b2 || 6 !== b2.tag) return b2 = Qg(c2, a2.mode, d2), b2.return = a2, b2;
    b2 = e(b2, c2);
    b2.return = a2;
    return b2;
  }
  function k2(a2, b2, c2, d2) {
    var f3 = c2.type;
    if (f3 === ya) return m2(a2, b2, c2.props.children, d2, c2.key);
    if (null !== b2 && (b2.elementType === f3 || "object" === typeof f3 && null !== f3 && f3.$$typeof === Ha && Ng(f3) === b2.type)) return d2 = e(b2, c2.props), d2.ref = Lg(a2, b2, c2), d2.return = a2, d2;
    d2 = Rg(c2.type, c2.key, c2.props, null, a2.mode, d2);
    d2.ref = Lg(a2, b2, c2);
    d2.return = a2;
    return d2;
  }
  function l2(a2, b2, c2, d2) {
    if (null === b2 || 4 !== b2.tag || b2.stateNode.containerInfo !== c2.containerInfo || b2.stateNode.implementation !== c2.implementation) return b2 = Sg(c2, a2.mode, d2), b2.return = a2, b2;
    b2 = e(b2, c2.children || []);
    b2.return = a2;
    return b2;
  }
  function m2(a2, b2, c2, d2, f3) {
    if (null === b2 || 7 !== b2.tag) return b2 = Tg(c2, a2.mode, d2, f3), b2.return = a2, b2;
    b2 = e(b2, c2);
    b2.return = a2;
    return b2;
  }
  function q2(a2, b2, c2) {
    if ("string" === typeof b2 && "" !== b2 || "number" === typeof b2) return b2 = Qg("" + b2, a2.mode, c2), b2.return = a2, b2;
    if ("object" === typeof b2 && null !== b2) {
      switch (b2.$$typeof) {
        case va:
          return c2 = Rg(b2.type, b2.key, b2.props, null, a2.mode, c2), c2.ref = Lg(a2, null, b2), c2.return = a2, c2;
        case wa:
          return b2 = Sg(b2, a2.mode, c2), b2.return = a2, b2;
        case Ha:
          var d2 = b2._init;
          return q2(a2, d2(b2._payload), c2);
      }
      if (eb(b2) || Ka(b2)) return b2 = Tg(b2, a2.mode, c2, null), b2.return = a2, b2;
      Mg(a2, b2);
    }
    return null;
  }
  function r2(a2, b2, c2, d2) {
    var e2 = null !== b2 ? b2.key : null;
    if ("string" === typeof c2 && "" !== c2 || "number" === typeof c2) return null !== e2 ? null : h(a2, b2, "" + c2, d2);
    if ("object" === typeof c2 && null !== c2) {
      switch (c2.$$typeof) {
        case va:
          return c2.key === e2 ? k2(a2, b2, c2, d2) : null;
        case wa:
          return c2.key === e2 ? l2(a2, b2, c2, d2) : null;
        case Ha:
          return e2 = c2._init, r2(
            a2,
            b2,
            e2(c2._payload),
            d2
          );
      }
      if (eb(c2) || Ka(c2)) return null !== e2 ? null : m2(a2, b2, c2, d2, null);
      Mg(a2, c2);
    }
    return null;
  }
  function y2(a2, b2, c2, d2, e2) {
    if ("string" === typeof d2 && "" !== d2 || "number" === typeof d2) return a2 = a2.get(c2) || null, h(b2, a2, "" + d2, e2);
    if ("object" === typeof d2 && null !== d2) {
      switch (d2.$$typeof) {
        case va:
          return a2 = a2.get(null === d2.key ? c2 : d2.key) || null, k2(b2, a2, d2, e2);
        case wa:
          return a2 = a2.get(null === d2.key ? c2 : d2.key) || null, l2(b2, a2, d2, e2);
        case Ha:
          var f3 = d2._init;
          return y2(a2, b2, c2, f3(d2._payload), e2);
      }
      if (eb(d2) || Ka(d2)) return a2 = a2.get(c2) || null, m2(b2, a2, d2, e2, null);
      Mg(b2, d2);
    }
    return null;
  }
  function n2(e2, g2, h2, k3) {
    for (var l3 = null, m3 = null, u2 = g2, w2 = g2 = 0, x2 = null; null !== u2 && w2 < h2.length; w2++) {
      u2.index > w2 ? (x2 = u2, u2 = null) : x2 = u2.sibling;
      var n3 = r2(e2, u2, h2[w2], k3);
      if (null === n3) {
        null === u2 && (u2 = x2);
        break;
      }
      a && u2 && null === n3.alternate && b(e2, u2);
      g2 = f2(n3, g2, w2);
      null === m3 ? l3 = n3 : m3.sibling = n3;
      m3 = n3;
      u2 = x2;
    }
    if (w2 === h2.length) return c(e2, u2), I && tg(e2, w2), l3;
    if (null === u2) {
      for (; w2 < h2.length; w2++) u2 = q2(e2, h2[w2], k3), null !== u2 && (g2 = f2(u2, g2, w2), null === m3 ? l3 = u2 : m3.sibling = u2, m3 = u2);
      I && tg(e2, w2);
      return l3;
    }
    for (u2 = d(e2, u2); w2 < h2.length; w2++) x2 = y2(u2, e2, w2, h2[w2], k3), null !== x2 && (a && null !== x2.alternate && u2.delete(null === x2.key ? w2 : x2.key), g2 = f2(x2, g2, w2), null === m3 ? l3 = x2 : m3.sibling = x2, m3 = x2);
    a && u2.forEach(function(a2) {
      return b(e2, a2);
    });
    I && tg(e2, w2);
    return l3;
  }
  function t2(e2, g2, h2, k3) {
    var l3 = Ka(h2);
    if ("function" !== typeof l3) throw Error(p(150));
    h2 = l3.call(h2);
    if (null == h2) throw Error(p(151));
    for (var u2 = l3 = null, m3 = g2, w2 = g2 = 0, x2 = null, n3 = h2.next(); null !== m3 && !n3.done; w2++, n3 = h2.next()) {
      m3.index > w2 ? (x2 = m3, m3 = null) : x2 = m3.sibling;
      var t3 = r2(e2, m3, n3.value, k3);
      if (null === t3) {
        null === m3 && (m3 = x2);
        break;
      }
      a && m3 && null === t3.alternate && b(e2, m3);
      g2 = f2(t3, g2, w2);
      null === u2 ? l3 = t3 : u2.sibling = t3;
      u2 = t3;
      m3 = x2;
    }
    if (n3.done) return c(
      e2,
      m3
    ), I && tg(e2, w2), l3;
    if (null === m3) {
      for (; !n3.done; w2++, n3 = h2.next()) n3 = q2(e2, n3.value, k3), null !== n3 && (g2 = f2(n3, g2, w2), null === u2 ? l3 = n3 : u2.sibling = n3, u2 = n3);
      I && tg(e2, w2);
      return l3;
    }
    for (m3 = d(e2, m3); !n3.done; w2++, n3 = h2.next()) n3 = y2(m3, e2, w2, n3.value, k3), null !== n3 && (a && null !== n3.alternate && m3.delete(null === n3.key ? w2 : n3.key), g2 = f2(n3, g2, w2), null === u2 ? l3 = n3 : u2.sibling = n3, u2 = n3);
    a && m3.forEach(function(a2) {
      return b(e2, a2);
    });
    I && tg(e2, w2);
    return l3;
  }
  function J2(a2, d2, f3, h2) {
    "object" === typeof f3 && null !== f3 && f3.type === ya && null === f3.key && (f3 = f3.props.children);
    if ("object" === typeof f3 && null !== f3) {
      switch (f3.$$typeof) {
        case va:
          a: {
            for (var k3 = f3.key, l3 = d2; null !== l3; ) {
              if (l3.key === k3) {
                k3 = f3.type;
                if (k3 === ya) {
                  if (7 === l3.tag) {
                    c(a2, l3.sibling);
                    d2 = e(l3, f3.props.children);
                    d2.return = a2;
                    a2 = d2;
                    break a;
                  }
                } else if (l3.elementType === k3 || "object" === typeof k3 && null !== k3 && k3.$$typeof === Ha && Ng(k3) === l3.type) {
                  c(a2, l3.sibling);
                  d2 = e(l3, f3.props);
                  d2.ref = Lg(a2, l3, f3);
                  d2.return = a2;
                  a2 = d2;
                  break a;
                }
                c(a2, l3);
                break;
              } else b(a2, l3);
              l3 = l3.sibling;
            }
            f3.type === ya ? (d2 = Tg(f3.props.children, a2.mode, h2, f3.key), d2.return = a2, a2 = d2) : (h2 = Rg(f3.type, f3.key, f3.props, null, a2.mode, h2), h2.ref = Lg(a2, d2, f3), h2.return = a2, a2 = h2);
          }
          return g(a2);
        case wa:
          a: {
            for (l3 = f3.key; null !== d2; ) {
              if (d2.key === l3) if (4 === d2.tag && d2.stateNode.containerInfo === f3.containerInfo && d2.stateNode.implementation === f3.implementation) {
                c(a2, d2.sibling);
                d2 = e(d2, f3.children || []);
                d2.return = a2;
                a2 = d2;
                break a;
              } else {
                c(a2, d2);
                break;
              }
              else b(a2, d2);
              d2 = d2.sibling;
            }
            d2 = Sg(f3, a2.mode, h2);
            d2.return = a2;
            a2 = d2;
          }
          return g(a2);
        case Ha:
          return l3 = f3._init, J2(a2, d2, l3(f3._payload), h2);
      }
      if (eb(f3)) return n2(a2, d2, f3, h2);
      if (Ka(f3)) return t2(a2, d2, f3, h2);
      Mg(a2, f3);
    }
    return "string" === typeof f3 && "" !== f3 || "number" === typeof f3 ? (f3 = "" + f3, null !== d2 && 6 === d2.tag ? (c(a2, d2.sibling), d2 = e(d2, f3), d2.return = a2, a2 = d2) : (c(a2, d2), d2 = Qg(f3, a2.mode, h2), d2.return = a2, a2 = d2), g(a2)) : c(a2, d2);
  }
  return J2;
}
var Ug = Og(true), Vg = Og(false), Wg = Uf(null), Xg = null, Yg = null, Zg = null;
function $g() {
  Zg = Yg = Xg = null;
}
function ah(a) {
  var b = Wg.current;
  E(Wg);
  a._currentValue = b;
}
function bh(a, b, c) {
  for (; null !== a; ) {
    var d = a.alternate;
    (a.childLanes & b) !== b ? (a.childLanes |= b, null !== d && (d.childLanes |= b)) : null !== d && (d.childLanes & b) !== b && (d.childLanes |= b);
    if (a === c) break;
    a = a.return;
  }
}
function ch(a, b) {
  Xg = a;
  Zg = Yg = null;
  a = a.dependencies;
  null !== a && null !== a.firstContext && (0 !== (a.lanes & b) && (dh = true), a.firstContext = null);
}
function eh(a) {
  var b = a._currentValue;
  if (Zg !== a) if (a = { context: a, memoizedValue: b, next: null }, null === Yg) {
    if (null === Xg) throw Error(p(308));
    Yg = a;
    Xg.dependencies = { lanes: 0, firstContext: a };
  } else Yg = Yg.next = a;
  return b;
}
var fh = null;
function gh(a) {
  null === fh ? fh = [a] : fh.push(a);
}
function hh(a, b, c, d) {
  var e = b.interleaved;
  null === e ? (c.next = c, gh(b)) : (c.next = e.next, e.next = c);
  b.interleaved = c;
  return ih(a, d);
}
function ih(a, b) {
  a.lanes |= b;
  var c = a.alternate;
  null !== c && (c.lanes |= b);
  c = a;
  for (a = a.return; null !== a; ) a.childLanes |= b, c = a.alternate, null !== c && (c.childLanes |= b), c = a, a = a.return;
  return 3 === c.tag ? c.stateNode : null;
}
var jh = false;
function kh(a) {
  a.updateQueue = { baseState: a.memoizedState, firstBaseUpdate: null, lastBaseUpdate: null, shared: { pending: null, interleaved: null, lanes: 0 }, effects: null };
}
function lh(a, b) {
  a = a.updateQueue;
  b.updateQueue === a && (b.updateQueue = { baseState: a.baseState, firstBaseUpdate: a.firstBaseUpdate, lastBaseUpdate: a.lastBaseUpdate, shared: a.shared, effects: a.effects });
}
function mh(a, b) {
  return { eventTime: a, lane: b, tag: 0, payload: null, callback: null, next: null };
}
function nh(a, b, c) {
  var d = a.updateQueue;
  if (null === d) return null;
  d = d.shared;
  if (0 !== (K & 2)) {
    var e = d.pending;
    null === e ? b.next = b : (b.next = e.next, e.next = b);
    d.pending = b;
    return ih(a, c);
  }
  e = d.interleaved;
  null === e ? (b.next = b, gh(d)) : (b.next = e.next, e.next = b);
  d.interleaved = b;
  return ih(a, c);
}
function oh(a, b, c) {
  b = b.updateQueue;
  if (null !== b && (b = b.shared, 0 !== (c & 4194240))) {
    var d = b.lanes;
    d &= a.pendingLanes;
    c |= d;
    b.lanes = c;
    Cc(a, c);
  }
}
function ph(a, b) {
  var c = a.updateQueue, d = a.alternate;
  if (null !== d && (d = d.updateQueue, c === d)) {
    var e = null, f2 = null;
    c = c.firstBaseUpdate;
    if (null !== c) {
      do {
        var g = { eventTime: c.eventTime, lane: c.lane, tag: c.tag, payload: c.payload, callback: c.callback, next: null };
        null === f2 ? e = f2 = g : f2 = f2.next = g;
        c = c.next;
      } while (null !== c);
      null === f2 ? e = f2 = b : f2 = f2.next = b;
    } else e = f2 = b;
    c = { baseState: d.baseState, firstBaseUpdate: e, lastBaseUpdate: f2, shared: d.shared, effects: d.effects };
    a.updateQueue = c;
    return;
  }
  a = c.lastBaseUpdate;
  null === a ? c.firstBaseUpdate = b : a.next = b;
  c.lastBaseUpdate = b;
}
function qh(a, b, c, d) {
  var e = a.updateQueue;
  jh = false;
  var f2 = e.firstBaseUpdate, g = e.lastBaseUpdate, h = e.shared.pending;
  if (null !== h) {
    e.shared.pending = null;
    var k2 = h, l2 = k2.next;
    k2.next = null;
    null === g ? f2 = l2 : g.next = l2;
    g = k2;
    var m2 = a.alternate;
    null !== m2 && (m2 = m2.updateQueue, h = m2.lastBaseUpdate, h !== g && (null === h ? m2.firstBaseUpdate = l2 : h.next = l2, m2.lastBaseUpdate = k2));
  }
  if (null !== f2) {
    var q2 = e.baseState;
    g = 0;
    m2 = l2 = k2 = null;
    h = f2;
    do {
      var r2 = h.lane, y2 = h.eventTime;
      if ((d & r2) === r2) {
        null !== m2 && (m2 = m2.next = {
          eventTime: y2,
          lane: 0,
          tag: h.tag,
          payload: h.payload,
          callback: h.callback,
          next: null
        });
        a: {
          var n2 = a, t2 = h;
          r2 = b;
          y2 = c;
          switch (t2.tag) {
            case 1:
              n2 = t2.payload;
              if ("function" === typeof n2) {
                q2 = n2.call(y2, q2, r2);
                break a;
              }
              q2 = n2;
              break a;
            case 3:
              n2.flags = n2.flags & -65537 | 128;
            case 0:
              n2 = t2.payload;
              r2 = "function" === typeof n2 ? n2.call(y2, q2, r2) : n2;
              if (null === r2 || void 0 === r2) break a;
              q2 = A({}, q2, r2);
              break a;
            case 2:
              jh = true;
          }
        }
        null !== h.callback && 0 !== h.lane && (a.flags |= 64, r2 = e.effects, null === r2 ? e.effects = [h] : r2.push(h));
      } else y2 = { eventTime: y2, lane: r2, tag: h.tag, payload: h.payload, callback: h.callback, next: null }, null === m2 ? (l2 = m2 = y2, k2 = q2) : m2 = m2.next = y2, g |= r2;
      h = h.next;
      if (null === h) if (h = e.shared.pending, null === h) break;
      else r2 = h, h = r2.next, r2.next = null, e.lastBaseUpdate = r2, e.shared.pending = null;
    } while (1);
    null === m2 && (k2 = q2);
    e.baseState = k2;
    e.firstBaseUpdate = l2;
    e.lastBaseUpdate = m2;
    b = e.shared.interleaved;
    if (null !== b) {
      e = b;
      do
        g |= e.lane, e = e.next;
      while (e !== b);
    } else null === f2 && (e.shared.lanes = 0);
    rh |= g;
    a.lanes = g;
    a.memoizedState = q2;
  }
}
function sh(a, b, c) {
  a = b.effects;
  b.effects = null;
  if (null !== a) for (b = 0; b < a.length; b++) {
    var d = a[b], e = d.callback;
    if (null !== e) {
      d.callback = null;
      d = c;
      if ("function" !== typeof e) throw Error(p(191, e));
      e.call(d);
    }
  }
}
var th = {}, uh = Uf(th), vh = Uf(th), wh = Uf(th);
function xh(a) {
  if (a === th) throw Error(p(174));
  return a;
}
function yh(a, b) {
  G(wh, b);
  G(vh, a);
  G(uh, th);
  a = b.nodeType;
  switch (a) {
    case 9:
    case 11:
      b = (b = b.documentElement) ? b.namespaceURI : lb(null, "");
      break;
    default:
      a = 8 === a ? b.parentNode : b, b = a.namespaceURI || null, a = a.tagName, b = lb(b, a);
  }
  E(uh);
  G(uh, b);
}
function zh() {
  E(uh);
  E(vh);
  E(wh);
}
function Ah(a) {
  xh(wh.current);
  var b = xh(uh.current);
  var c = lb(b, a.type);
  b !== c && (G(vh, a), G(uh, c));
}
function Bh(a) {
  vh.current === a && (E(uh), E(vh));
}
var L = Uf(0);
function Ch(a) {
  for (var b = a; null !== b; ) {
    if (13 === b.tag) {
      var c = b.memoizedState;
      if (null !== c && (c = c.dehydrated, null === c || "$?" === c.data || "$!" === c.data)) return b;
    } else if (19 === b.tag && void 0 !== b.memoizedProps.revealOrder) {
      if (0 !== (b.flags & 128)) return b;
    } else if (null !== b.child) {
      b.child.return = b;
      b = b.child;
      continue;
    }
    if (b === a) break;
    for (; null === b.sibling; ) {
      if (null === b.return || b.return === a) return null;
      b = b.return;
    }
    b.sibling.return = b.return;
    b = b.sibling;
  }
  return null;
}
var Dh = [];
function Eh() {
  for (var a = 0; a < Dh.length; a++) Dh[a]._workInProgressVersionPrimary = null;
  Dh.length = 0;
}
var Fh = ua.ReactCurrentDispatcher, Gh = ua.ReactCurrentBatchConfig, Hh = 0, M = null, N = null, O = null, Ih = false, Jh = false, Kh = 0, Lh = 0;
function P() {
  throw Error(p(321));
}
function Mh(a, b) {
  if (null === b) return false;
  for (var c = 0; c < b.length && c < a.length; c++) if (!He(a[c], b[c])) return false;
  return true;
}
function Nh(a, b, c, d, e, f2) {
  Hh = f2;
  M = b;
  b.memoizedState = null;
  b.updateQueue = null;
  b.lanes = 0;
  Fh.current = null === a || null === a.memoizedState ? Oh : Ph;
  a = c(d, e);
  if (Jh) {
    f2 = 0;
    do {
      Jh = false;
      Kh = 0;
      if (25 <= f2) throw Error(p(301));
      f2 += 1;
      O = N = null;
      b.updateQueue = null;
      Fh.current = Qh;
      a = c(d, e);
    } while (Jh);
  }
  Fh.current = Rh;
  b = null !== N && null !== N.next;
  Hh = 0;
  O = N = M = null;
  Ih = false;
  if (b) throw Error(p(300));
  return a;
}
function Sh() {
  var a = 0 !== Kh;
  Kh = 0;
  return a;
}
function Th() {
  var a = { memoizedState: null, baseState: null, baseQueue: null, queue: null, next: null };
  null === O ? M.memoizedState = O = a : O = O.next = a;
  return O;
}
function Uh() {
  if (null === N) {
    var a = M.alternate;
    a = null !== a ? a.memoizedState : null;
  } else a = N.next;
  var b = null === O ? M.memoizedState : O.next;
  if (null !== b) O = b, N = a;
  else {
    if (null === a) throw Error(p(310));
    N = a;
    a = { memoizedState: N.memoizedState, baseState: N.baseState, baseQueue: N.baseQueue, queue: N.queue, next: null };
    null === O ? M.memoizedState = O = a : O = O.next = a;
  }
  return O;
}
function Vh(a, b) {
  return "function" === typeof b ? b(a) : b;
}
function Wh(a) {
  var b = Uh(), c = b.queue;
  if (null === c) throw Error(p(311));
  c.lastRenderedReducer = a;
  var d = N, e = d.baseQueue, f2 = c.pending;
  if (null !== f2) {
    if (null !== e) {
      var g = e.next;
      e.next = f2.next;
      f2.next = g;
    }
    d.baseQueue = e = f2;
    c.pending = null;
  }
  if (null !== e) {
    f2 = e.next;
    d = d.baseState;
    var h = g = null, k2 = null, l2 = f2;
    do {
      var m2 = l2.lane;
      if ((Hh & m2) === m2) null !== k2 && (k2 = k2.next = { lane: 0, action: l2.action, hasEagerState: l2.hasEagerState, eagerState: l2.eagerState, next: null }), d = l2.hasEagerState ? l2.eagerState : a(d, l2.action);
      else {
        var q2 = {
          lane: m2,
          action: l2.action,
          hasEagerState: l2.hasEagerState,
          eagerState: l2.eagerState,
          next: null
        };
        null === k2 ? (h = k2 = q2, g = d) : k2 = k2.next = q2;
        M.lanes |= m2;
        rh |= m2;
      }
      l2 = l2.next;
    } while (null !== l2 && l2 !== f2);
    null === k2 ? g = d : k2.next = h;
    He(d, b.memoizedState) || (dh = true);
    b.memoizedState = d;
    b.baseState = g;
    b.baseQueue = k2;
    c.lastRenderedState = d;
  }
  a = c.interleaved;
  if (null !== a) {
    e = a;
    do
      f2 = e.lane, M.lanes |= f2, rh |= f2, e = e.next;
    while (e !== a);
  } else null === e && (c.lanes = 0);
  return [b.memoizedState, c.dispatch];
}
function Xh(a) {
  var b = Uh(), c = b.queue;
  if (null === c) throw Error(p(311));
  c.lastRenderedReducer = a;
  var d = c.dispatch, e = c.pending, f2 = b.memoizedState;
  if (null !== e) {
    c.pending = null;
    var g = e = e.next;
    do
      f2 = a(f2, g.action), g = g.next;
    while (g !== e);
    He(f2, b.memoizedState) || (dh = true);
    b.memoizedState = f2;
    null === b.baseQueue && (b.baseState = f2);
    c.lastRenderedState = f2;
  }
  return [f2, d];
}
function Yh() {
}
function Zh(a, b) {
  var c = M, d = Uh(), e = b(), f2 = !He(d.memoizedState, e);
  f2 && (d.memoizedState = e, dh = true);
  d = d.queue;
  $h(ai.bind(null, c, d, a), [a]);
  if (d.getSnapshot !== b || f2 || null !== O && O.memoizedState.tag & 1) {
    c.flags |= 2048;
    bi(9, ci.bind(null, c, d, e, b), void 0, null);
    if (null === Q) throw Error(p(349));
    0 !== (Hh & 30) || di(c, b, e);
  }
  return e;
}
function di(a, b, c) {
  a.flags |= 16384;
  a = { getSnapshot: b, value: c };
  b = M.updateQueue;
  null === b ? (b = { lastEffect: null, stores: null }, M.updateQueue = b, b.stores = [a]) : (c = b.stores, null === c ? b.stores = [a] : c.push(a));
}
function ci(a, b, c, d) {
  b.value = c;
  b.getSnapshot = d;
  ei(b) && fi(a);
}
function ai(a, b, c) {
  return c(function() {
    ei(b) && fi(a);
  });
}
function ei(a) {
  var b = a.getSnapshot;
  a = a.value;
  try {
    var c = b();
    return !He(a, c);
  } catch (d) {
    return true;
  }
}
function fi(a) {
  var b = ih(a, 1);
  null !== b && gi(b, a, 1, -1);
}
function hi(a) {
  var b = Th();
  "function" === typeof a && (a = a());
  b.memoizedState = b.baseState = a;
  a = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: Vh, lastRenderedState: a };
  b.queue = a;
  a = a.dispatch = ii.bind(null, M, a);
  return [b.memoizedState, a];
}
function bi(a, b, c, d) {
  a = { tag: a, create: b, destroy: c, deps: d, next: null };
  b = M.updateQueue;
  null === b ? (b = { lastEffect: null, stores: null }, M.updateQueue = b, b.lastEffect = a.next = a) : (c = b.lastEffect, null === c ? b.lastEffect = a.next = a : (d = c.next, c.next = a, a.next = d, b.lastEffect = a));
  return a;
}
function ji() {
  return Uh().memoizedState;
}
function ki(a, b, c, d) {
  var e = Th();
  M.flags |= a;
  e.memoizedState = bi(1 | b, c, void 0, void 0 === d ? null : d);
}
function li(a, b, c, d) {
  var e = Uh();
  d = void 0 === d ? null : d;
  var f2 = void 0;
  if (null !== N) {
    var g = N.memoizedState;
    f2 = g.destroy;
    if (null !== d && Mh(d, g.deps)) {
      e.memoizedState = bi(b, c, f2, d);
      return;
    }
  }
  M.flags |= a;
  e.memoizedState = bi(1 | b, c, f2, d);
}
function mi(a, b) {
  return ki(8390656, 8, a, b);
}
function $h(a, b) {
  return li(2048, 8, a, b);
}
function ni(a, b) {
  return li(4, 2, a, b);
}
function oi(a, b) {
  return li(4, 4, a, b);
}
function pi(a, b) {
  if ("function" === typeof b) return a = a(), b(a), function() {
    b(null);
  };
  if (null !== b && void 0 !== b) return a = a(), b.current = a, function() {
    b.current = null;
  };
}
function qi(a, b, c) {
  c = null !== c && void 0 !== c ? c.concat([a]) : null;
  return li(4, 4, pi.bind(null, b, a), c);
}
function ri() {
}
function si(a, b) {
  var c = Uh();
  b = void 0 === b ? null : b;
  var d = c.memoizedState;
  if (null !== d && null !== b && Mh(b, d[1])) return d[0];
  c.memoizedState = [a, b];
  return a;
}
function ti(a, b) {
  var c = Uh();
  b = void 0 === b ? null : b;
  var d = c.memoizedState;
  if (null !== d && null !== b && Mh(b, d[1])) return d[0];
  a = a();
  c.memoizedState = [a, b];
  return a;
}
function ui(a, b, c) {
  if (0 === (Hh & 21)) return a.baseState && (a.baseState = false, dh = true), a.memoizedState = c;
  He(c, b) || (c = yc(), M.lanes |= c, rh |= c, a.baseState = true);
  return b;
}
function vi(a, b) {
  var c = C;
  C = 0 !== c && 4 > c ? c : 4;
  a(true);
  var d = Gh.transition;
  Gh.transition = {};
  try {
    a(false), b();
  } finally {
    C = c, Gh.transition = d;
  }
}
function wi() {
  return Uh().memoizedState;
}
function xi(a, b, c) {
  var d = yi(a);
  c = { lane: d, action: c, hasEagerState: false, eagerState: null, next: null };
  if (zi(a)) Ai(b, c);
  else if (c = hh(a, b, c, d), null !== c) {
    var e = R();
    gi(c, a, d, e);
    Bi(c, b, d);
  }
}
function ii(a, b, c) {
  var d = yi(a), e = { lane: d, action: c, hasEagerState: false, eagerState: null, next: null };
  if (zi(a)) Ai(b, e);
  else {
    var f2 = a.alternate;
    if (0 === a.lanes && (null === f2 || 0 === f2.lanes) && (f2 = b.lastRenderedReducer, null !== f2)) try {
      var g = b.lastRenderedState, h = f2(g, c);
      e.hasEagerState = true;
      e.eagerState = h;
      if (He(h, g)) {
        var k2 = b.interleaved;
        null === k2 ? (e.next = e, gh(b)) : (e.next = k2.next, k2.next = e);
        b.interleaved = e;
        return;
      }
    } catch (l2) {
    } finally {
    }
    c = hh(a, b, e, d);
    null !== c && (e = R(), gi(c, a, d, e), Bi(c, b, d));
  }
}
function zi(a) {
  var b = a.alternate;
  return a === M || null !== b && b === M;
}
function Ai(a, b) {
  Jh = Ih = true;
  var c = a.pending;
  null === c ? b.next = b : (b.next = c.next, c.next = b);
  a.pending = b;
}
function Bi(a, b, c) {
  if (0 !== (c & 4194240)) {
    var d = b.lanes;
    d &= a.pendingLanes;
    c |= d;
    b.lanes = c;
    Cc(a, c);
  }
}
var Rh = { readContext: eh, useCallback: P, useContext: P, useEffect: P, useImperativeHandle: P, useInsertionEffect: P, useLayoutEffect: P, useMemo: P, useReducer: P, useRef: P, useState: P, useDebugValue: P, useDeferredValue: P, useTransition: P, useMutableSource: P, useSyncExternalStore: P, useId: P, unstable_isNewReconciler: false }, Oh = { readContext: eh, useCallback: function(a, b) {
  Th().memoizedState = [a, void 0 === b ? null : b];
  return a;
}, useContext: eh, useEffect: mi, useImperativeHandle: function(a, b, c) {
  c = null !== c && void 0 !== c ? c.concat([a]) : null;
  return ki(
    4194308,
    4,
    pi.bind(null, b, a),
    c
  );
}, useLayoutEffect: function(a, b) {
  return ki(4194308, 4, a, b);
}, useInsertionEffect: function(a, b) {
  return ki(4, 2, a, b);
}, useMemo: function(a, b) {
  var c = Th();
  b = void 0 === b ? null : b;
  a = a();
  c.memoizedState = [a, b];
  return a;
}, useReducer: function(a, b, c) {
  var d = Th();
  b = void 0 !== c ? c(b) : b;
  d.memoizedState = d.baseState = b;
  a = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: a, lastRenderedState: b };
  d.queue = a;
  a = a.dispatch = xi.bind(null, M, a);
  return [d.memoizedState, a];
}, useRef: function(a) {
  var b = Th();
  a = { current: a };
  return b.memoizedState = a;
}, useState: hi, useDebugValue: ri, useDeferredValue: function(a) {
  return Th().memoizedState = a;
}, useTransition: function() {
  var a = hi(false), b = a[0];
  a = vi.bind(null, a[1]);
  Th().memoizedState = a;
  return [b, a];
}, useMutableSource: function() {
}, useSyncExternalStore: function(a, b, c) {
  var d = M, e = Th();
  if (I) {
    if (void 0 === c) throw Error(p(407));
    c = c();
  } else {
    c = b();
    if (null === Q) throw Error(p(349));
    0 !== (Hh & 30) || di(d, b, c);
  }
  e.memoizedState = c;
  var f2 = { value: c, getSnapshot: b };
  e.queue = f2;
  mi(ai.bind(
    null,
    d,
    f2,
    a
  ), [a]);
  d.flags |= 2048;
  bi(9, ci.bind(null, d, f2, c, b), void 0, null);
  return c;
}, useId: function() {
  var a = Th(), b = Q.identifierPrefix;
  if (I) {
    var c = sg;
    var d = rg;
    c = (d & ~(1 << 32 - oc(d) - 1)).toString(32) + c;
    b = ":" + b + "R" + c;
    c = Kh++;
    0 < c && (b += "H" + c.toString(32));
    b += ":";
  } else c = Lh++, b = ":" + b + "r" + c.toString(32) + ":";
  return a.memoizedState = b;
}, unstable_isNewReconciler: false }, Ph = {
  readContext: eh,
  useCallback: si,
  useContext: eh,
  useEffect: $h,
  useImperativeHandle: qi,
  useInsertionEffect: ni,
  useLayoutEffect: oi,
  useMemo: ti,
  useReducer: Wh,
  useRef: ji,
  useState: function() {
    return Wh(Vh);
  },
  useDebugValue: ri,
  useDeferredValue: function(a) {
    var b = Uh();
    return ui(b, N.memoizedState, a);
  },
  useTransition: function() {
    var a = Wh(Vh)[0], b = Uh().memoizedState;
    return [a, b];
  },
  useMutableSource: Yh,
  useSyncExternalStore: Zh,
  useId: wi,
  unstable_isNewReconciler: false
}, Qh = { readContext: eh, useCallback: si, useContext: eh, useEffect: $h, useImperativeHandle: qi, useInsertionEffect: ni, useLayoutEffect: oi, useMemo: ti, useReducer: Xh, useRef: ji, useState: function() {
  return Xh(Vh);
}, useDebugValue: ri, useDeferredValue: function(a) {
  var b = Uh();
  return null === N ? b.memoizedState = a : ui(b, N.memoizedState, a);
}, useTransition: function() {
  var a = Xh(Vh)[0], b = Uh().memoizedState;
  return [a, b];
}, useMutableSource: Yh, useSyncExternalStore: Zh, useId: wi, unstable_isNewReconciler: false };
function Ci(a, b) {
  if (a && a.defaultProps) {
    b = A({}, b);
    a = a.defaultProps;
    for (var c in a) void 0 === b[c] && (b[c] = a[c]);
    return b;
  }
  return b;
}
function Di(a, b, c, d) {
  b = a.memoizedState;
  c = c(d, b);
  c = null === c || void 0 === c ? b : A({}, b, c);
  a.memoizedState = c;
  0 === a.lanes && (a.updateQueue.baseState = c);
}
var Ei = { isMounted: function(a) {
  return (a = a._reactInternals) ? Vb(a) === a : false;
}, enqueueSetState: function(a, b, c) {
  a = a._reactInternals;
  var d = R(), e = yi(a), f2 = mh(d, e);
  f2.payload = b;
  void 0 !== c && null !== c && (f2.callback = c);
  b = nh(a, f2, e);
  null !== b && (gi(b, a, e, d), oh(b, a, e));
}, enqueueReplaceState: function(a, b, c) {
  a = a._reactInternals;
  var d = R(), e = yi(a), f2 = mh(d, e);
  f2.tag = 1;
  f2.payload = b;
  void 0 !== c && null !== c && (f2.callback = c);
  b = nh(a, f2, e);
  null !== b && (gi(b, a, e, d), oh(b, a, e));
}, enqueueForceUpdate: function(a, b) {
  a = a._reactInternals;
  var c = R(), d = yi(a), e = mh(c, d);
  e.tag = 2;
  void 0 !== b && null !== b && (e.callback = b);
  b = nh(a, e, d);
  null !== b && (gi(b, a, d, c), oh(b, a, d));
} };
function Fi(a, b, c, d, e, f2, g) {
  a = a.stateNode;
  return "function" === typeof a.shouldComponentUpdate ? a.shouldComponentUpdate(d, f2, g) : b.prototype && b.prototype.isPureReactComponent ? !Ie(c, d) || !Ie(e, f2) : true;
}
function Gi(a, b, c) {
  var d = false, e = Vf;
  var f2 = b.contextType;
  "object" === typeof f2 && null !== f2 ? f2 = eh(f2) : (e = Zf(b) ? Xf : H.current, d = b.contextTypes, f2 = (d = null !== d && void 0 !== d) ? Yf(a, e) : Vf);
  b = new b(c, f2);
  a.memoizedState = null !== b.state && void 0 !== b.state ? b.state : null;
  b.updater = Ei;
  a.stateNode = b;
  b._reactInternals = a;
  d && (a = a.stateNode, a.__reactInternalMemoizedUnmaskedChildContext = e, a.__reactInternalMemoizedMaskedChildContext = f2);
  return b;
}
function Hi(a, b, c, d) {
  a = b.state;
  "function" === typeof b.componentWillReceiveProps && b.componentWillReceiveProps(c, d);
  "function" === typeof b.UNSAFE_componentWillReceiveProps && b.UNSAFE_componentWillReceiveProps(c, d);
  b.state !== a && Ei.enqueueReplaceState(b, b.state, null);
}
function Ii(a, b, c, d) {
  var e = a.stateNode;
  e.props = c;
  e.state = a.memoizedState;
  e.refs = {};
  kh(a);
  var f2 = b.contextType;
  "object" === typeof f2 && null !== f2 ? e.context = eh(f2) : (f2 = Zf(b) ? Xf : H.current, e.context = Yf(a, f2));
  e.state = a.memoizedState;
  f2 = b.getDerivedStateFromProps;
  "function" === typeof f2 && (Di(a, b, f2, c), e.state = a.memoizedState);
  "function" === typeof b.getDerivedStateFromProps || "function" === typeof e.getSnapshotBeforeUpdate || "function" !== typeof e.UNSAFE_componentWillMount && "function" !== typeof e.componentWillMount || (b = e.state, "function" === typeof e.componentWillMount && e.componentWillMount(), "function" === typeof e.UNSAFE_componentWillMount && e.UNSAFE_componentWillMount(), b !== e.state && Ei.enqueueReplaceState(e, e.state, null), qh(a, c, e, d), e.state = a.memoizedState);
  "function" === typeof e.componentDidMount && (a.flags |= 4194308);
}
function Ji(a, b) {
  try {
    var c = "", d = b;
    do
      c += Pa(d), d = d.return;
    while (d);
    var e = c;
  } catch (f2) {
    e = "\nError generating stack: " + f2.message + "\n" + f2.stack;
  }
  return { value: a, source: b, stack: e, digest: null };
}
function Ki(a, b, c) {
  return { value: a, source: null, stack: null != c ? c : null, digest: null != b ? b : null };
}
function Li(a, b) {
  try {
    console.error(b.value);
  } catch (c) {
    setTimeout(function() {
      throw c;
    });
  }
}
var Mi = "function" === typeof WeakMap ? WeakMap : Map;
function Ni(a, b, c) {
  c = mh(-1, c);
  c.tag = 3;
  c.payload = { element: null };
  var d = b.value;
  c.callback = function() {
    Oi || (Oi = true, Pi = d);
    Li(a, b);
  };
  return c;
}
function Qi(a, b, c) {
  c = mh(-1, c);
  c.tag = 3;
  var d = a.type.getDerivedStateFromError;
  if ("function" === typeof d) {
    var e = b.value;
    c.payload = function() {
      return d(e);
    };
    c.callback = function() {
      Li(a, b);
    };
  }
  var f2 = a.stateNode;
  null !== f2 && "function" === typeof f2.componentDidCatch && (c.callback = function() {
    Li(a, b);
    "function" !== typeof d && (null === Ri ? Ri = /* @__PURE__ */ new Set([this]) : Ri.add(this));
    var c2 = b.stack;
    this.componentDidCatch(b.value, { componentStack: null !== c2 ? c2 : "" });
  });
  return c;
}
function Si(a, b, c) {
  var d = a.pingCache;
  if (null === d) {
    d = a.pingCache = new Mi();
    var e = /* @__PURE__ */ new Set();
    d.set(b, e);
  } else e = d.get(b), void 0 === e && (e = /* @__PURE__ */ new Set(), d.set(b, e));
  e.has(c) || (e.add(c), a = Ti.bind(null, a, b, c), b.then(a, a));
}
function Ui(a) {
  do {
    var b;
    if (b = 13 === a.tag) b = a.memoizedState, b = null !== b ? null !== b.dehydrated ? true : false : true;
    if (b) return a;
    a = a.return;
  } while (null !== a);
  return null;
}
function Vi(a, b, c, d, e) {
  if (0 === (a.mode & 1)) return a === b ? a.flags |= 65536 : (a.flags |= 128, c.flags |= 131072, c.flags &= -52805, 1 === c.tag && (null === c.alternate ? c.tag = 17 : (b = mh(-1, 1), b.tag = 2, nh(c, b, 1))), c.lanes |= 1), a;
  a.flags |= 65536;
  a.lanes = e;
  return a;
}
var Wi = ua.ReactCurrentOwner, dh = false;
function Xi(a, b, c, d) {
  b.child = null === a ? Vg(b, null, c, d) : Ug(b, a.child, c, d);
}
function Yi(a, b, c, d, e) {
  c = c.render;
  var f2 = b.ref;
  ch(b, e);
  d = Nh(a, b, c, d, f2, e);
  c = Sh();
  if (null !== a && !dh) return b.updateQueue = a.updateQueue, b.flags &= -2053, a.lanes &= ~e, Zi(a, b, e);
  I && c && vg(b);
  b.flags |= 1;
  Xi(a, b, d, e);
  return b.child;
}
function $i(a, b, c, d, e) {
  if (null === a) {
    var f2 = c.type;
    if ("function" === typeof f2 && !aj(f2) && void 0 === f2.defaultProps && null === c.compare && void 0 === c.defaultProps) return b.tag = 15, b.type = f2, bj(a, b, f2, d, e);
    a = Rg(c.type, null, d, b, b.mode, e);
    a.ref = b.ref;
    a.return = b;
    return b.child = a;
  }
  f2 = a.child;
  if (0 === (a.lanes & e)) {
    var g = f2.memoizedProps;
    c = c.compare;
    c = null !== c ? c : Ie;
    if (c(g, d) && a.ref === b.ref) return Zi(a, b, e);
  }
  b.flags |= 1;
  a = Pg(f2, d);
  a.ref = b.ref;
  a.return = b;
  return b.child = a;
}
function bj(a, b, c, d, e) {
  if (null !== a) {
    var f2 = a.memoizedProps;
    if (Ie(f2, d) && a.ref === b.ref) if (dh = false, b.pendingProps = d = f2, 0 !== (a.lanes & e)) 0 !== (a.flags & 131072) && (dh = true);
    else return b.lanes = a.lanes, Zi(a, b, e);
  }
  return cj(a, b, c, d, e);
}
function dj(a, b, c) {
  var d = b.pendingProps, e = d.children, f2 = null !== a ? a.memoizedState : null;
  if ("hidden" === d.mode) if (0 === (b.mode & 1)) b.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, G(ej, fj), fj |= c;
  else {
    if (0 === (c & 1073741824)) return a = null !== f2 ? f2.baseLanes | c : c, b.lanes = b.childLanes = 1073741824, b.memoizedState = { baseLanes: a, cachePool: null, transitions: null }, b.updateQueue = null, G(ej, fj), fj |= a, null;
    b.memoizedState = { baseLanes: 0, cachePool: null, transitions: null };
    d = null !== f2 ? f2.baseLanes : c;
    G(ej, fj);
    fj |= d;
  }
  else null !== f2 ? (d = f2.baseLanes | c, b.memoizedState = null) : d = c, G(ej, fj), fj |= d;
  Xi(a, b, e, c);
  return b.child;
}
function gj(a, b) {
  var c = b.ref;
  if (null === a && null !== c || null !== a && a.ref !== c) b.flags |= 512, b.flags |= 2097152;
}
function cj(a, b, c, d, e) {
  var f2 = Zf(c) ? Xf : H.current;
  f2 = Yf(b, f2);
  ch(b, e);
  c = Nh(a, b, c, d, f2, e);
  d = Sh();
  if (null !== a && !dh) return b.updateQueue = a.updateQueue, b.flags &= -2053, a.lanes &= ~e, Zi(a, b, e);
  I && d && vg(b);
  b.flags |= 1;
  Xi(a, b, c, e);
  return b.child;
}
function hj(a, b, c, d, e) {
  if (Zf(c)) {
    var f2 = true;
    cg(b);
  } else f2 = false;
  ch(b, e);
  if (null === b.stateNode) ij(a, b), Gi(b, c, d), Ii(b, c, d, e), d = true;
  else if (null === a) {
    var g = b.stateNode, h = b.memoizedProps;
    g.props = h;
    var k2 = g.context, l2 = c.contextType;
    "object" === typeof l2 && null !== l2 ? l2 = eh(l2) : (l2 = Zf(c) ? Xf : H.current, l2 = Yf(b, l2));
    var m2 = c.getDerivedStateFromProps, q2 = "function" === typeof m2 || "function" === typeof g.getSnapshotBeforeUpdate;
    q2 || "function" !== typeof g.UNSAFE_componentWillReceiveProps && "function" !== typeof g.componentWillReceiveProps || (h !== d || k2 !== l2) && Hi(b, g, d, l2);
    jh = false;
    var r2 = b.memoizedState;
    g.state = r2;
    qh(b, d, g, e);
    k2 = b.memoizedState;
    h !== d || r2 !== k2 || Wf.current || jh ? ("function" === typeof m2 && (Di(b, c, m2, d), k2 = b.memoizedState), (h = jh || Fi(b, c, h, d, r2, k2, l2)) ? (q2 || "function" !== typeof g.UNSAFE_componentWillMount && "function" !== typeof g.componentWillMount || ("function" === typeof g.componentWillMount && g.componentWillMount(), "function" === typeof g.UNSAFE_componentWillMount && g.UNSAFE_componentWillMount()), "function" === typeof g.componentDidMount && (b.flags |= 4194308)) : ("function" === typeof g.componentDidMount && (b.flags |= 4194308), b.memoizedProps = d, b.memoizedState = k2), g.props = d, g.state = k2, g.context = l2, d = h) : ("function" === typeof g.componentDidMount && (b.flags |= 4194308), d = false);
  } else {
    g = b.stateNode;
    lh(a, b);
    h = b.memoizedProps;
    l2 = b.type === b.elementType ? h : Ci(b.type, h);
    g.props = l2;
    q2 = b.pendingProps;
    r2 = g.context;
    k2 = c.contextType;
    "object" === typeof k2 && null !== k2 ? k2 = eh(k2) : (k2 = Zf(c) ? Xf : H.current, k2 = Yf(b, k2));
    var y2 = c.getDerivedStateFromProps;
    (m2 = "function" === typeof y2 || "function" === typeof g.getSnapshotBeforeUpdate) || "function" !== typeof g.UNSAFE_componentWillReceiveProps && "function" !== typeof g.componentWillReceiveProps || (h !== q2 || r2 !== k2) && Hi(b, g, d, k2);
    jh = false;
    r2 = b.memoizedState;
    g.state = r2;
    qh(b, d, g, e);
    var n2 = b.memoizedState;
    h !== q2 || r2 !== n2 || Wf.current || jh ? ("function" === typeof y2 && (Di(b, c, y2, d), n2 = b.memoizedState), (l2 = jh || Fi(b, c, l2, d, r2, n2, k2) || false) ? (m2 || "function" !== typeof g.UNSAFE_componentWillUpdate && "function" !== typeof g.componentWillUpdate || ("function" === typeof g.componentWillUpdate && g.componentWillUpdate(d, n2, k2), "function" === typeof g.UNSAFE_componentWillUpdate && g.UNSAFE_componentWillUpdate(d, n2, k2)), "function" === typeof g.componentDidUpdate && (b.flags |= 4), "function" === typeof g.getSnapshotBeforeUpdate && (b.flags |= 1024)) : ("function" !== typeof g.componentDidUpdate || h === a.memoizedProps && r2 === a.memoizedState || (b.flags |= 4), "function" !== typeof g.getSnapshotBeforeUpdate || h === a.memoizedProps && r2 === a.memoizedState || (b.flags |= 1024), b.memoizedProps = d, b.memoizedState = n2), g.props = d, g.state = n2, g.context = k2, d = l2) : ("function" !== typeof g.componentDidUpdate || h === a.memoizedProps && r2 === a.memoizedState || (b.flags |= 4), "function" !== typeof g.getSnapshotBeforeUpdate || h === a.memoizedProps && r2 === a.memoizedState || (b.flags |= 1024), d = false);
  }
  return jj(a, b, c, d, f2, e);
}
function jj(a, b, c, d, e, f2) {
  gj(a, b);
  var g = 0 !== (b.flags & 128);
  if (!d && !g) return e && dg(b, c, false), Zi(a, b, f2);
  d = b.stateNode;
  Wi.current = b;
  var h = g && "function" !== typeof c.getDerivedStateFromError ? null : d.render();
  b.flags |= 1;
  null !== a && g ? (b.child = Ug(b, a.child, null, f2), b.child = Ug(b, null, h, f2)) : Xi(a, b, h, f2);
  b.memoizedState = d.state;
  e && dg(b, c, true);
  return b.child;
}
function kj(a) {
  var b = a.stateNode;
  b.pendingContext ? ag(a, b.pendingContext, b.pendingContext !== b.context) : b.context && ag(a, b.context, false);
  yh(a, b.containerInfo);
}
function lj(a, b, c, d, e) {
  Ig();
  Jg(e);
  b.flags |= 256;
  Xi(a, b, c, d);
  return b.child;
}
var mj = { dehydrated: null, treeContext: null, retryLane: 0 };
function nj(a) {
  return { baseLanes: a, cachePool: null, transitions: null };
}
function oj(a, b, c) {
  var d = b.pendingProps, e = L.current, f2 = false, g = 0 !== (b.flags & 128), h;
  (h = g) || (h = null !== a && null === a.memoizedState ? false : 0 !== (e & 2));
  if (h) f2 = true, b.flags &= -129;
  else if (null === a || null !== a.memoizedState) e |= 1;
  G(L, e & 1);
  if (null === a) {
    Eg(b);
    a = b.memoizedState;
    if (null !== a && (a = a.dehydrated, null !== a)) return 0 === (b.mode & 1) ? b.lanes = 1 : "$!" === a.data ? b.lanes = 8 : b.lanes = 1073741824, null;
    g = d.children;
    a = d.fallback;
    return f2 ? (d = b.mode, f2 = b.child, g = { mode: "hidden", children: g }, 0 === (d & 1) && null !== f2 ? (f2.childLanes = 0, f2.pendingProps = g) : f2 = pj(g, d, 0, null), a = Tg(a, d, c, null), f2.return = b, a.return = b, f2.sibling = a, b.child = f2, b.child.memoizedState = nj(c), b.memoizedState = mj, a) : qj(b, g);
  }
  e = a.memoizedState;
  if (null !== e && (h = e.dehydrated, null !== h)) return rj(a, b, g, d, h, e, c);
  if (f2) {
    f2 = d.fallback;
    g = b.mode;
    e = a.child;
    h = e.sibling;
    var k2 = { mode: "hidden", children: d.children };
    0 === (g & 1) && b.child !== e ? (d = b.child, d.childLanes = 0, d.pendingProps = k2, b.deletions = null) : (d = Pg(e, k2), d.subtreeFlags = e.subtreeFlags & 14680064);
    null !== h ? f2 = Pg(h, f2) : (f2 = Tg(f2, g, c, null), f2.flags |= 2);
    f2.return = b;
    d.return = b;
    d.sibling = f2;
    b.child = d;
    d = f2;
    f2 = b.child;
    g = a.child.memoizedState;
    g = null === g ? nj(c) : { baseLanes: g.baseLanes | c, cachePool: null, transitions: g.transitions };
    f2.memoizedState = g;
    f2.childLanes = a.childLanes & ~c;
    b.memoizedState = mj;
    return d;
  }
  f2 = a.child;
  a = f2.sibling;
  d = Pg(f2, { mode: "visible", children: d.children });
  0 === (b.mode & 1) && (d.lanes = c);
  d.return = b;
  d.sibling = null;
  null !== a && (c = b.deletions, null === c ? (b.deletions = [a], b.flags |= 16) : c.push(a));
  b.child = d;
  b.memoizedState = null;
  return d;
}
function qj(a, b) {
  b = pj({ mode: "visible", children: b }, a.mode, 0, null);
  b.return = a;
  return a.child = b;
}
function sj(a, b, c, d) {
  null !== d && Jg(d);
  Ug(b, a.child, null, c);
  a = qj(b, b.pendingProps.children);
  a.flags |= 2;
  b.memoizedState = null;
  return a;
}
function rj(a, b, c, d, e, f2, g) {
  if (c) {
    if (b.flags & 256) return b.flags &= -257, d = Ki(Error(p(422))), sj(a, b, g, d);
    if (null !== b.memoizedState) return b.child = a.child, b.flags |= 128, null;
    f2 = d.fallback;
    e = b.mode;
    d = pj({ mode: "visible", children: d.children }, e, 0, null);
    f2 = Tg(f2, e, g, null);
    f2.flags |= 2;
    d.return = b;
    f2.return = b;
    d.sibling = f2;
    b.child = d;
    0 !== (b.mode & 1) && Ug(b, a.child, null, g);
    b.child.memoizedState = nj(g);
    b.memoizedState = mj;
    return f2;
  }
  if (0 === (b.mode & 1)) return sj(a, b, g, null);
  if ("$!" === e.data) {
    d = e.nextSibling && e.nextSibling.dataset;
    if (d) var h = d.dgst;
    d = h;
    f2 = Error(p(419));
    d = Ki(f2, d, void 0);
    return sj(a, b, g, d);
  }
  h = 0 !== (g & a.childLanes);
  if (dh || h) {
    d = Q;
    if (null !== d) {
      switch (g & -g) {
        case 4:
          e = 2;
          break;
        case 16:
          e = 8;
          break;
        case 64:
        case 128:
        case 256:
        case 512:
        case 1024:
        case 2048:
        case 4096:
        case 8192:
        case 16384:
        case 32768:
        case 65536:
        case 131072:
        case 262144:
        case 524288:
        case 1048576:
        case 2097152:
        case 4194304:
        case 8388608:
        case 16777216:
        case 33554432:
        case 67108864:
          e = 32;
          break;
        case 536870912:
          e = 268435456;
          break;
        default:
          e = 0;
      }
      e = 0 !== (e & (d.suspendedLanes | g)) ? 0 : e;
      0 !== e && e !== f2.retryLane && (f2.retryLane = e, ih(a, e), gi(d, a, e, -1));
    }
    tj();
    d = Ki(Error(p(421)));
    return sj(a, b, g, d);
  }
  if ("$?" === e.data) return b.flags |= 128, b.child = a.child, b = uj.bind(null, a), e._reactRetry = b, null;
  a = f2.treeContext;
  yg = Lf(e.nextSibling);
  xg = b;
  I = true;
  zg = null;
  null !== a && (og[pg++] = rg, og[pg++] = sg, og[pg++] = qg, rg = a.id, sg = a.overflow, qg = b);
  b = qj(b, d.children);
  b.flags |= 4096;
  return b;
}
function vj(a, b, c) {
  a.lanes |= b;
  var d = a.alternate;
  null !== d && (d.lanes |= b);
  bh(a.return, b, c);
}
function wj(a, b, c, d, e) {
  var f2 = a.memoizedState;
  null === f2 ? a.memoizedState = { isBackwards: b, rendering: null, renderingStartTime: 0, last: d, tail: c, tailMode: e } : (f2.isBackwards = b, f2.rendering = null, f2.renderingStartTime = 0, f2.last = d, f2.tail = c, f2.tailMode = e);
}
function xj(a, b, c) {
  var d = b.pendingProps, e = d.revealOrder, f2 = d.tail;
  Xi(a, b, d.children, c);
  d = L.current;
  if (0 !== (d & 2)) d = d & 1 | 2, b.flags |= 128;
  else {
    if (null !== a && 0 !== (a.flags & 128)) a: for (a = b.child; null !== a; ) {
      if (13 === a.tag) null !== a.memoizedState && vj(a, c, b);
      else if (19 === a.tag) vj(a, c, b);
      else if (null !== a.child) {
        a.child.return = a;
        a = a.child;
        continue;
      }
      if (a === b) break a;
      for (; null === a.sibling; ) {
        if (null === a.return || a.return === b) break a;
        a = a.return;
      }
      a.sibling.return = a.return;
      a = a.sibling;
    }
    d &= 1;
  }
  G(L, d);
  if (0 === (b.mode & 1)) b.memoizedState = null;
  else switch (e) {
    case "forwards":
      c = b.child;
      for (e = null; null !== c; ) a = c.alternate, null !== a && null === Ch(a) && (e = c), c = c.sibling;
      c = e;
      null === c ? (e = b.child, b.child = null) : (e = c.sibling, c.sibling = null);
      wj(b, false, e, c, f2);
      break;
    case "backwards":
      c = null;
      e = b.child;
      for (b.child = null; null !== e; ) {
        a = e.alternate;
        if (null !== a && null === Ch(a)) {
          b.child = e;
          break;
        }
        a = e.sibling;
        e.sibling = c;
        c = e;
        e = a;
      }
      wj(b, true, c, null, f2);
      break;
    case "together":
      wj(b, false, null, null, void 0);
      break;
    default:
      b.memoizedState = null;
  }
  return b.child;
}
function ij(a, b) {
  0 === (b.mode & 1) && null !== a && (a.alternate = null, b.alternate = null, b.flags |= 2);
}
function Zi(a, b, c) {
  null !== a && (b.dependencies = a.dependencies);
  rh |= b.lanes;
  if (0 === (c & b.childLanes)) return null;
  if (null !== a && b.child !== a.child) throw Error(p(153));
  if (null !== b.child) {
    a = b.child;
    c = Pg(a, a.pendingProps);
    b.child = c;
    for (c.return = b; null !== a.sibling; ) a = a.sibling, c = c.sibling = Pg(a, a.pendingProps), c.return = b;
    c.sibling = null;
  }
  return b.child;
}
function yj(a, b, c) {
  switch (b.tag) {
    case 3:
      kj(b);
      Ig();
      break;
    case 5:
      Ah(b);
      break;
    case 1:
      Zf(b.type) && cg(b);
      break;
    case 4:
      yh(b, b.stateNode.containerInfo);
      break;
    case 10:
      var d = b.type._context, e = b.memoizedProps.value;
      G(Wg, d._currentValue);
      d._currentValue = e;
      break;
    case 13:
      d = b.memoizedState;
      if (null !== d) {
        if (null !== d.dehydrated) return G(L, L.current & 1), b.flags |= 128, null;
        if (0 !== (c & b.child.childLanes)) return oj(a, b, c);
        G(L, L.current & 1);
        a = Zi(a, b, c);
        return null !== a ? a.sibling : null;
      }
      G(L, L.current & 1);
      break;
    case 19:
      d = 0 !== (c & b.childLanes);
      if (0 !== (a.flags & 128)) {
        if (d) return xj(a, b, c);
        b.flags |= 128;
      }
      e = b.memoizedState;
      null !== e && (e.rendering = null, e.tail = null, e.lastEffect = null);
      G(L, L.current);
      if (d) break;
      else return null;
    case 22:
    case 23:
      return b.lanes = 0, dj(a, b, c);
  }
  return Zi(a, b, c);
}
var zj, Aj, Bj, Cj;
zj = function(a, b) {
  for (var c = b.child; null !== c; ) {
    if (5 === c.tag || 6 === c.tag) a.appendChild(c.stateNode);
    else if (4 !== c.tag && null !== c.child) {
      c.child.return = c;
      c = c.child;
      continue;
    }
    if (c === b) break;
    for (; null === c.sibling; ) {
      if (null === c.return || c.return === b) return;
      c = c.return;
    }
    c.sibling.return = c.return;
    c = c.sibling;
  }
};
Aj = function() {
};
Bj = function(a, b, c, d) {
  var e = a.memoizedProps;
  if (e !== d) {
    a = b.stateNode;
    xh(uh.current);
    var f2 = null;
    switch (c) {
      case "input":
        e = Ya(a, e);
        d = Ya(a, d);
        f2 = [];
        break;
      case "select":
        e = A({}, e, { value: void 0 });
        d = A({}, d, { value: void 0 });
        f2 = [];
        break;
      case "textarea":
        e = gb(a, e);
        d = gb(a, d);
        f2 = [];
        break;
      default:
        "function" !== typeof e.onClick && "function" === typeof d.onClick && (a.onclick = Bf);
    }
    ub(c, d);
    var g;
    c = null;
    for (l2 in e) if (!d.hasOwnProperty(l2) && e.hasOwnProperty(l2) && null != e[l2]) if ("style" === l2) {
      var h = e[l2];
      for (g in h) h.hasOwnProperty(g) && (c || (c = {}), c[g] = "");
    } else "dangerouslySetInnerHTML" !== l2 && "children" !== l2 && "suppressContentEditableWarning" !== l2 && "suppressHydrationWarning" !== l2 && "autoFocus" !== l2 && (ea.hasOwnProperty(l2) ? f2 || (f2 = []) : (f2 = f2 || []).push(l2, null));
    for (l2 in d) {
      var k2 = d[l2];
      h = null != e ? e[l2] : void 0;
      if (d.hasOwnProperty(l2) && k2 !== h && (null != k2 || null != h)) if ("style" === l2) if (h) {
        for (g in h) !h.hasOwnProperty(g) || k2 && k2.hasOwnProperty(g) || (c || (c = {}), c[g] = "");
        for (g in k2) k2.hasOwnProperty(g) && h[g] !== k2[g] && (c || (c = {}), c[g] = k2[g]);
      } else c || (f2 || (f2 = []), f2.push(
        l2,
        c
      )), c = k2;
      else "dangerouslySetInnerHTML" === l2 ? (k2 = k2 ? k2.__html : void 0, h = h ? h.__html : void 0, null != k2 && h !== k2 && (f2 = f2 || []).push(l2, k2)) : "children" === l2 ? "string" !== typeof k2 && "number" !== typeof k2 || (f2 = f2 || []).push(l2, "" + k2) : "suppressContentEditableWarning" !== l2 && "suppressHydrationWarning" !== l2 && (ea.hasOwnProperty(l2) ? (null != k2 && "onScroll" === l2 && D("scroll", a), f2 || h === k2 || (f2 = [])) : (f2 = f2 || []).push(l2, k2));
    }
    c && (f2 = f2 || []).push("style", c);
    var l2 = f2;
    if (b.updateQueue = l2) b.flags |= 4;
  }
};
Cj = function(a, b, c, d) {
  c !== d && (b.flags |= 4);
};
function Dj(a, b) {
  if (!I) switch (a.tailMode) {
    case "hidden":
      b = a.tail;
      for (var c = null; null !== b; ) null !== b.alternate && (c = b), b = b.sibling;
      null === c ? a.tail = null : c.sibling = null;
      break;
    case "collapsed":
      c = a.tail;
      for (var d = null; null !== c; ) null !== c.alternate && (d = c), c = c.sibling;
      null === d ? b || null === a.tail ? a.tail = null : a.tail.sibling = null : d.sibling = null;
  }
}
function S(a) {
  var b = null !== a.alternate && a.alternate.child === a.child, c = 0, d = 0;
  if (b) for (var e = a.child; null !== e; ) c |= e.lanes | e.childLanes, d |= e.subtreeFlags & 14680064, d |= e.flags & 14680064, e.return = a, e = e.sibling;
  else for (e = a.child; null !== e; ) c |= e.lanes | e.childLanes, d |= e.subtreeFlags, d |= e.flags, e.return = a, e = e.sibling;
  a.subtreeFlags |= d;
  a.childLanes = c;
  return b;
}
function Ej(a, b, c) {
  var d = b.pendingProps;
  wg(b);
  switch (b.tag) {
    case 2:
    case 16:
    case 15:
    case 0:
    case 11:
    case 7:
    case 8:
    case 12:
    case 9:
    case 14:
      return S(b), null;
    case 1:
      return Zf(b.type) && $f(), S(b), null;
    case 3:
      d = b.stateNode;
      zh();
      E(Wf);
      E(H);
      Eh();
      d.pendingContext && (d.context = d.pendingContext, d.pendingContext = null);
      if (null === a || null === a.child) Gg(b) ? b.flags |= 4 : null === a || a.memoizedState.isDehydrated && 0 === (b.flags & 256) || (b.flags |= 1024, null !== zg && (Fj(zg), zg = null));
      Aj(a, b);
      S(b);
      return null;
    case 5:
      Bh(b);
      var e = xh(wh.current);
      c = b.type;
      if (null !== a && null != b.stateNode) Bj(a, b, c, d, e), a.ref !== b.ref && (b.flags |= 512, b.flags |= 2097152);
      else {
        if (!d) {
          if (null === b.stateNode) throw Error(p(166));
          S(b);
          return null;
        }
        a = xh(uh.current);
        if (Gg(b)) {
          d = b.stateNode;
          c = b.type;
          var f2 = b.memoizedProps;
          d[Of] = b;
          d[Pf] = f2;
          a = 0 !== (b.mode & 1);
          switch (c) {
            case "dialog":
              D("cancel", d);
              D("close", d);
              break;
            case "iframe":
            case "object":
            case "embed":
              D("load", d);
              break;
            case "video":
            case "audio":
              for (e = 0; e < lf.length; e++) D(lf[e], d);
              break;
            case "source":
              D("error", d);
              break;
            case "img":
            case "image":
            case "link":
              D(
                "error",
                d
              );
              D("load", d);
              break;
            case "details":
              D("toggle", d);
              break;
            case "input":
              Za(d, f2);
              D("invalid", d);
              break;
            case "select":
              d._wrapperState = { wasMultiple: !!f2.multiple };
              D("invalid", d);
              break;
            case "textarea":
              hb(d, f2), D("invalid", d);
          }
          ub(c, f2);
          e = null;
          for (var g in f2) if (f2.hasOwnProperty(g)) {
            var h = f2[g];
            "children" === g ? "string" === typeof h ? d.textContent !== h && (true !== f2.suppressHydrationWarning && Af(d.textContent, h, a), e = ["children", h]) : "number" === typeof h && d.textContent !== "" + h && (true !== f2.suppressHydrationWarning && Af(
              d.textContent,
              h,
              a
            ), e = ["children", "" + h]) : ea.hasOwnProperty(g) && null != h && "onScroll" === g && D("scroll", d);
          }
          switch (c) {
            case "input":
              Va(d);
              db(d, f2, true);
              break;
            case "textarea":
              Va(d);
              jb(d);
              break;
            case "select":
            case "option":
              break;
            default:
              "function" === typeof f2.onClick && (d.onclick = Bf);
          }
          d = e;
          b.updateQueue = d;
          null !== d && (b.flags |= 4);
        } else {
          g = 9 === e.nodeType ? e : e.ownerDocument;
          "http://www.w3.org/1999/xhtml" === a && (a = kb(c));
          "http://www.w3.org/1999/xhtml" === a ? "script" === c ? (a = g.createElement("div"), a.innerHTML = "<script><\/script>", a = a.removeChild(a.firstChild)) : "string" === typeof d.is ? a = g.createElement(c, { is: d.is }) : (a = g.createElement(c), "select" === c && (g = a, d.multiple ? g.multiple = true : d.size && (g.size = d.size))) : a = g.createElementNS(a, c);
          a[Of] = b;
          a[Pf] = d;
          zj(a, b, false, false);
          b.stateNode = a;
          a: {
            g = vb(c, d);
            switch (c) {
              case "dialog":
                D("cancel", a);
                D("close", a);
                e = d;
                break;
              case "iframe":
              case "object":
              case "embed":
                D("load", a);
                e = d;
                break;
              case "video":
              case "audio":
                for (e = 0; e < lf.length; e++) D(lf[e], a);
                e = d;
                break;
              case "source":
                D("error", a);
                e = d;
                break;
              case "img":
              case "image":
              case "link":
                D(
                  "error",
                  a
                );
                D("load", a);
                e = d;
                break;
              case "details":
                D("toggle", a);
                e = d;
                break;
              case "input":
                Za(a, d);
                e = Ya(a, d);
                D("invalid", a);
                break;
              case "option":
                e = d;
                break;
              case "select":
                a._wrapperState = { wasMultiple: !!d.multiple };
                e = A({}, d, { value: void 0 });
                D("invalid", a);
                break;
              case "textarea":
                hb(a, d);
                e = gb(a, d);
                D("invalid", a);
                break;
              default:
                e = d;
            }
            ub(c, e);
            h = e;
            for (f2 in h) if (h.hasOwnProperty(f2)) {
              var k2 = h[f2];
              "style" === f2 ? sb(a, k2) : "dangerouslySetInnerHTML" === f2 ? (k2 = k2 ? k2.__html : void 0, null != k2 && nb(a, k2)) : "children" === f2 ? "string" === typeof k2 ? ("textarea" !== c || "" !== k2) && ob(a, k2) : "number" === typeof k2 && ob(a, "" + k2) : "suppressContentEditableWarning" !== f2 && "suppressHydrationWarning" !== f2 && "autoFocus" !== f2 && (ea.hasOwnProperty(f2) ? null != k2 && "onScroll" === f2 && D("scroll", a) : null != k2 && ta(a, f2, k2, g));
            }
            switch (c) {
              case "input":
                Va(a);
                db(a, d, false);
                break;
              case "textarea":
                Va(a);
                jb(a);
                break;
              case "option":
                null != d.value && a.setAttribute("value", "" + Sa(d.value));
                break;
              case "select":
                a.multiple = !!d.multiple;
                f2 = d.value;
                null != f2 ? fb(a, !!d.multiple, f2, false) : null != d.defaultValue && fb(
                  a,
                  !!d.multiple,
                  d.defaultValue,
                  true
                );
                break;
              default:
                "function" === typeof e.onClick && (a.onclick = Bf);
            }
            switch (c) {
              case "button":
              case "input":
              case "select":
              case "textarea":
                d = !!d.autoFocus;
                break a;
              case "img":
                d = true;
                break a;
              default:
                d = false;
            }
          }
          d && (b.flags |= 4);
        }
        null !== b.ref && (b.flags |= 512, b.flags |= 2097152);
      }
      S(b);
      return null;
    case 6:
      if (a && null != b.stateNode) Cj(a, b, a.memoizedProps, d);
      else {
        if ("string" !== typeof d && null === b.stateNode) throw Error(p(166));
        c = xh(wh.current);
        xh(uh.current);
        if (Gg(b)) {
          d = b.stateNode;
          c = b.memoizedProps;
          d[Of] = b;
          if (f2 = d.nodeValue !== c) {
            if (a = xg, null !== a) switch (a.tag) {
              case 3:
                Af(d.nodeValue, c, 0 !== (a.mode & 1));
                break;
              case 5:
                true !== a.memoizedProps.suppressHydrationWarning && Af(d.nodeValue, c, 0 !== (a.mode & 1));
            }
          }
          f2 && (b.flags |= 4);
        } else d = (9 === c.nodeType ? c : c.ownerDocument).createTextNode(d), d[Of] = b, b.stateNode = d;
      }
      S(b);
      return null;
    case 13:
      E(L);
      d = b.memoizedState;
      if (null === a || null !== a.memoizedState && null !== a.memoizedState.dehydrated) {
        if (I && null !== yg && 0 !== (b.mode & 1) && 0 === (b.flags & 128)) Hg(), Ig(), b.flags |= 98560, f2 = false;
        else if (f2 = Gg(b), null !== d && null !== d.dehydrated) {
          if (null === a) {
            if (!f2) throw Error(p(318));
            f2 = b.memoizedState;
            f2 = null !== f2 ? f2.dehydrated : null;
            if (!f2) throw Error(p(317));
            f2[Of] = b;
          } else Ig(), 0 === (b.flags & 128) && (b.memoizedState = null), b.flags |= 4;
          S(b);
          f2 = false;
        } else null !== zg && (Fj(zg), zg = null), f2 = true;
        if (!f2) return b.flags & 65536 ? b : null;
      }
      if (0 !== (b.flags & 128)) return b.lanes = c, b;
      d = null !== d;
      d !== (null !== a && null !== a.memoizedState) && d && (b.child.flags |= 8192, 0 !== (b.mode & 1) && (null === a || 0 !== (L.current & 1) ? 0 === T && (T = 3) : tj()));
      null !== b.updateQueue && (b.flags |= 4);
      S(b);
      return null;
    case 4:
      return zh(), Aj(a, b), null === a && sf(b.stateNode.containerInfo), S(b), null;
    case 10:
      return ah(b.type._context), S(b), null;
    case 17:
      return Zf(b.type) && $f(), S(b), null;
    case 19:
      E(L);
      f2 = b.memoizedState;
      if (null === f2) return S(b), null;
      d = 0 !== (b.flags & 128);
      g = f2.rendering;
      if (null === g) if (d) Dj(f2, false);
      else {
        if (0 !== T || null !== a && 0 !== (a.flags & 128)) for (a = b.child; null !== a; ) {
          g = Ch(a);
          if (null !== g) {
            b.flags |= 128;
            Dj(f2, false);
            d = g.updateQueue;
            null !== d && (b.updateQueue = d, b.flags |= 4);
            b.subtreeFlags = 0;
            d = c;
            for (c = b.child; null !== c; ) f2 = c, a = d, f2.flags &= 14680066, g = f2.alternate, null === g ? (f2.childLanes = 0, f2.lanes = a, f2.child = null, f2.subtreeFlags = 0, f2.memoizedProps = null, f2.memoizedState = null, f2.updateQueue = null, f2.dependencies = null, f2.stateNode = null) : (f2.childLanes = g.childLanes, f2.lanes = g.lanes, f2.child = g.child, f2.subtreeFlags = 0, f2.deletions = null, f2.memoizedProps = g.memoizedProps, f2.memoizedState = g.memoizedState, f2.updateQueue = g.updateQueue, f2.type = g.type, a = g.dependencies, f2.dependencies = null === a ? null : { lanes: a.lanes, firstContext: a.firstContext }), c = c.sibling;
            G(L, L.current & 1 | 2);
            return b.child;
          }
          a = a.sibling;
        }
        null !== f2.tail && B() > Gj && (b.flags |= 128, d = true, Dj(f2, false), b.lanes = 4194304);
      }
      else {
        if (!d) if (a = Ch(g), null !== a) {
          if (b.flags |= 128, d = true, c = a.updateQueue, null !== c && (b.updateQueue = c, b.flags |= 4), Dj(f2, true), null === f2.tail && "hidden" === f2.tailMode && !g.alternate && !I) return S(b), null;
        } else 2 * B() - f2.renderingStartTime > Gj && 1073741824 !== c && (b.flags |= 128, d = true, Dj(f2, false), b.lanes = 4194304);
        f2.isBackwards ? (g.sibling = b.child, b.child = g) : (c = f2.last, null !== c ? c.sibling = g : b.child = g, f2.last = g);
      }
      if (null !== f2.tail) return b = f2.tail, f2.rendering = b, f2.tail = b.sibling, f2.renderingStartTime = B(), b.sibling = null, c = L.current, G(L, d ? c & 1 | 2 : c & 1), b;
      S(b);
      return null;
    case 22:
    case 23:
      return Hj(), d = null !== b.memoizedState, null !== a && null !== a.memoizedState !== d && (b.flags |= 8192), d && 0 !== (b.mode & 1) ? 0 !== (fj & 1073741824) && (S(b), b.subtreeFlags & 6 && (b.flags |= 8192)) : S(b), null;
    case 24:
      return null;
    case 25:
      return null;
  }
  throw Error(p(156, b.tag));
}
function Ij(a, b) {
  wg(b);
  switch (b.tag) {
    case 1:
      return Zf(b.type) && $f(), a = b.flags, a & 65536 ? (b.flags = a & -65537 | 128, b) : null;
    case 3:
      return zh(), E(Wf), E(H), Eh(), a = b.flags, 0 !== (a & 65536) && 0 === (a & 128) ? (b.flags = a & -65537 | 128, b) : null;
    case 5:
      return Bh(b), null;
    case 13:
      E(L);
      a = b.memoizedState;
      if (null !== a && null !== a.dehydrated) {
        if (null === b.alternate) throw Error(p(340));
        Ig();
      }
      a = b.flags;
      return a & 65536 ? (b.flags = a & -65537 | 128, b) : null;
    case 19:
      return E(L), null;
    case 4:
      return zh(), null;
    case 10:
      return ah(b.type._context), null;
    case 22:
    case 23:
      return Hj(), null;
    case 24:
      return null;
    default:
      return null;
  }
}
var Jj = false, U = false, Kj = "function" === typeof WeakSet ? WeakSet : Set, V = null;
function Lj(a, b) {
  var c = a.ref;
  if (null !== c) if ("function" === typeof c) try {
    c(null);
  } catch (d) {
    W(a, b, d);
  }
  else c.current = null;
}
function Mj(a, b, c) {
  try {
    c();
  } catch (d) {
    W(a, b, d);
  }
}
var Nj = false;
function Oj(a, b) {
  Cf = dd;
  a = Me();
  if (Ne(a)) {
    if ("selectionStart" in a) var c = { start: a.selectionStart, end: a.selectionEnd };
    else a: {
      c = (c = a.ownerDocument) && c.defaultView || window;
      var d = c.getSelection && c.getSelection();
      if (d && 0 !== d.rangeCount) {
        c = d.anchorNode;
        var e = d.anchorOffset, f2 = d.focusNode;
        d = d.focusOffset;
        try {
          c.nodeType, f2.nodeType;
        } catch (F2) {
          c = null;
          break a;
        }
        var g = 0, h = -1, k2 = -1, l2 = 0, m2 = 0, q2 = a, r2 = null;
        b: for (; ; ) {
          for (var y2; ; ) {
            q2 !== c || 0 !== e && 3 !== q2.nodeType || (h = g + e);
            q2 !== f2 || 0 !== d && 3 !== q2.nodeType || (k2 = g + d);
            3 === q2.nodeType && (g += q2.nodeValue.length);
            if (null === (y2 = q2.firstChild)) break;
            r2 = q2;
            q2 = y2;
          }
          for (; ; ) {
            if (q2 === a) break b;
            r2 === c && ++l2 === e && (h = g);
            r2 === f2 && ++m2 === d && (k2 = g);
            if (null !== (y2 = q2.nextSibling)) break;
            q2 = r2;
            r2 = q2.parentNode;
          }
          q2 = y2;
        }
        c = -1 === h || -1 === k2 ? null : { start: h, end: k2 };
      } else c = null;
    }
    c = c || { start: 0, end: 0 };
  } else c = null;
  Df = { focusedElem: a, selectionRange: c };
  dd = false;
  for (V = b; null !== V; ) if (b = V, a = b.child, 0 !== (b.subtreeFlags & 1028) && null !== a) a.return = b, V = a;
  else for (; null !== V; ) {
    b = V;
    try {
      var n2 = b.alternate;
      if (0 !== (b.flags & 1024)) switch (b.tag) {
        case 0:
        case 11:
        case 15:
          break;
        case 1:
          if (null !== n2) {
            var t2 = n2.memoizedProps, J2 = n2.memoizedState, x2 = b.stateNode, w2 = x2.getSnapshotBeforeUpdate(b.elementType === b.type ? t2 : Ci(b.type, t2), J2);
            x2.__reactInternalSnapshotBeforeUpdate = w2;
          }
          break;
        case 3:
          var u2 = b.stateNode.containerInfo;
          1 === u2.nodeType ? u2.textContent = "" : 9 === u2.nodeType && u2.documentElement && u2.removeChild(u2.documentElement);
          break;
        case 5:
        case 6:
        case 4:
        case 17:
          break;
        default:
          throw Error(p(163));
      }
    } catch (F2) {
      W(b, b.return, F2);
    }
    a = b.sibling;
    if (null !== a) {
      a.return = b.return;
      V = a;
      break;
    }
    V = b.return;
  }
  n2 = Nj;
  Nj = false;
  return n2;
}
function Pj(a, b, c) {
  var d = b.updateQueue;
  d = null !== d ? d.lastEffect : null;
  if (null !== d) {
    var e = d = d.next;
    do {
      if ((e.tag & a) === a) {
        var f2 = e.destroy;
        e.destroy = void 0;
        void 0 !== f2 && Mj(b, c, f2);
      }
      e = e.next;
    } while (e !== d);
  }
}
function Qj(a, b) {
  b = b.updateQueue;
  b = null !== b ? b.lastEffect : null;
  if (null !== b) {
    var c = b = b.next;
    do {
      if ((c.tag & a) === a) {
        var d = c.create;
        c.destroy = d();
      }
      c = c.next;
    } while (c !== b);
  }
}
function Rj(a) {
  var b = a.ref;
  if (null !== b) {
    var c = a.stateNode;
    switch (a.tag) {
      case 5:
        a = c;
        break;
      default:
        a = c;
    }
    "function" === typeof b ? b(a) : b.current = a;
  }
}
function Sj(a) {
  var b = a.alternate;
  null !== b && (a.alternate = null, Sj(b));
  a.child = null;
  a.deletions = null;
  a.sibling = null;
  5 === a.tag && (b = a.stateNode, null !== b && (delete b[Of], delete b[Pf], delete b[of], delete b[Qf], delete b[Rf]));
  a.stateNode = null;
  a.return = null;
  a.dependencies = null;
  a.memoizedProps = null;
  a.memoizedState = null;
  a.pendingProps = null;
  a.stateNode = null;
  a.updateQueue = null;
}
function Tj(a) {
  return 5 === a.tag || 3 === a.tag || 4 === a.tag;
}
function Uj(a) {
  a: for (; ; ) {
    for (; null === a.sibling; ) {
      if (null === a.return || Tj(a.return)) return null;
      a = a.return;
    }
    a.sibling.return = a.return;
    for (a = a.sibling; 5 !== a.tag && 6 !== a.tag && 18 !== a.tag; ) {
      if (a.flags & 2) continue a;
      if (null === a.child || 4 === a.tag) continue a;
      else a.child.return = a, a = a.child;
    }
    if (!(a.flags & 2)) return a.stateNode;
  }
}
function Vj(a, b, c) {
  var d = a.tag;
  if (5 === d || 6 === d) a = a.stateNode, b ? 8 === c.nodeType ? c.parentNode.insertBefore(a, b) : c.insertBefore(a, b) : (8 === c.nodeType ? (b = c.parentNode, b.insertBefore(a, c)) : (b = c, b.appendChild(a)), c = c._reactRootContainer, null !== c && void 0 !== c || null !== b.onclick || (b.onclick = Bf));
  else if (4 !== d && (a = a.child, null !== a)) for (Vj(a, b, c), a = a.sibling; null !== a; ) Vj(a, b, c), a = a.sibling;
}
function Wj(a, b, c) {
  var d = a.tag;
  if (5 === d || 6 === d) a = a.stateNode, b ? c.insertBefore(a, b) : c.appendChild(a);
  else if (4 !== d && (a = a.child, null !== a)) for (Wj(a, b, c), a = a.sibling; null !== a; ) Wj(a, b, c), a = a.sibling;
}
var X = null, Xj = false;
function Yj(a, b, c) {
  for (c = c.child; null !== c; ) Zj(a, b, c), c = c.sibling;
}
function Zj(a, b, c) {
  if (lc && "function" === typeof lc.onCommitFiberUnmount) try {
    lc.onCommitFiberUnmount(kc, c);
  } catch (h) {
  }
  switch (c.tag) {
    case 5:
      U || Lj(c, b);
    case 6:
      var d = X, e = Xj;
      X = null;
      Yj(a, b, c);
      X = d;
      Xj = e;
      null !== X && (Xj ? (a = X, c = c.stateNode, 8 === a.nodeType ? a.parentNode.removeChild(c) : a.removeChild(c)) : X.removeChild(c.stateNode));
      break;
    case 18:
      null !== X && (Xj ? (a = X, c = c.stateNode, 8 === a.nodeType ? Kf(a.parentNode, c) : 1 === a.nodeType && Kf(a, c), bd(a)) : Kf(X, c.stateNode));
      break;
    case 4:
      d = X;
      e = Xj;
      X = c.stateNode.containerInfo;
      Xj = true;
      Yj(a, b, c);
      X = d;
      Xj = e;
      break;
    case 0:
    case 11:
    case 14:
    case 15:
      if (!U && (d = c.updateQueue, null !== d && (d = d.lastEffect, null !== d))) {
        e = d = d.next;
        do {
          var f2 = e, g = f2.destroy;
          f2 = f2.tag;
          void 0 !== g && (0 !== (f2 & 2) ? Mj(c, b, g) : 0 !== (f2 & 4) && Mj(c, b, g));
          e = e.next;
        } while (e !== d);
      }
      Yj(a, b, c);
      break;
    case 1:
      if (!U && (Lj(c, b), d = c.stateNode, "function" === typeof d.componentWillUnmount)) try {
        d.props = c.memoizedProps, d.state = c.memoizedState, d.componentWillUnmount();
      } catch (h) {
        W(c, b, h);
      }
      Yj(a, b, c);
      break;
    case 21:
      Yj(a, b, c);
      break;
    case 22:
      c.mode & 1 ? (U = (d = U) || null !== c.memoizedState, Yj(a, b, c), U = d) : Yj(a, b, c);
      break;
    default:
      Yj(a, b, c);
  }
}
function ak(a) {
  var b = a.updateQueue;
  if (null !== b) {
    a.updateQueue = null;
    var c = a.stateNode;
    null === c && (c = a.stateNode = new Kj());
    b.forEach(function(b2) {
      var d = bk.bind(null, a, b2);
      c.has(b2) || (c.add(b2), b2.then(d, d));
    });
  }
}
function ck(a, b) {
  var c = b.deletions;
  if (null !== c) for (var d = 0; d < c.length; d++) {
    var e = c[d];
    try {
      var f2 = a, g = b, h = g;
      a: for (; null !== h; ) {
        switch (h.tag) {
          case 5:
            X = h.stateNode;
            Xj = false;
            break a;
          case 3:
            X = h.stateNode.containerInfo;
            Xj = true;
            break a;
          case 4:
            X = h.stateNode.containerInfo;
            Xj = true;
            break a;
        }
        h = h.return;
      }
      if (null === X) throw Error(p(160));
      Zj(f2, g, e);
      X = null;
      Xj = false;
      var k2 = e.alternate;
      null !== k2 && (k2.return = null);
      e.return = null;
    } catch (l2) {
      W(e, b, l2);
    }
  }
  if (b.subtreeFlags & 12854) for (b = b.child; null !== b; ) dk(b, a), b = b.sibling;
}
function dk(a, b) {
  var c = a.alternate, d = a.flags;
  switch (a.tag) {
    case 0:
    case 11:
    case 14:
    case 15:
      ck(b, a);
      ek(a);
      if (d & 4) {
        try {
          Pj(3, a, a.return), Qj(3, a);
        } catch (t2) {
          W(a, a.return, t2);
        }
        try {
          Pj(5, a, a.return);
        } catch (t2) {
          W(a, a.return, t2);
        }
      }
      break;
    case 1:
      ck(b, a);
      ek(a);
      d & 512 && null !== c && Lj(c, c.return);
      break;
    case 5:
      ck(b, a);
      ek(a);
      d & 512 && null !== c && Lj(c, c.return);
      if (a.flags & 32) {
        var e = a.stateNode;
        try {
          ob(e, "");
        } catch (t2) {
          W(a, a.return, t2);
        }
      }
      if (d & 4 && (e = a.stateNode, null != e)) {
        var f2 = a.memoizedProps, g = null !== c ? c.memoizedProps : f2, h = a.type, k2 = a.updateQueue;
        a.updateQueue = null;
        if (null !== k2) try {
          "input" === h && "radio" === f2.type && null != f2.name && ab(e, f2);
          vb(h, g);
          var l2 = vb(h, f2);
          for (g = 0; g < k2.length; g += 2) {
            var m2 = k2[g], q2 = k2[g + 1];
            "style" === m2 ? sb(e, q2) : "dangerouslySetInnerHTML" === m2 ? nb(e, q2) : "children" === m2 ? ob(e, q2) : ta(e, m2, q2, l2);
          }
          switch (h) {
            case "input":
              bb(e, f2);
              break;
            case "textarea":
              ib(e, f2);
              break;
            case "select":
              var r2 = e._wrapperState.wasMultiple;
              e._wrapperState.wasMultiple = !!f2.multiple;
              var y2 = f2.value;
              null != y2 ? fb(e, !!f2.multiple, y2, false) : r2 !== !!f2.multiple && (null != f2.defaultValue ? fb(
                e,
                !!f2.multiple,
                f2.defaultValue,
                true
              ) : fb(e, !!f2.multiple, f2.multiple ? [] : "", false));
          }
          e[Pf] = f2;
        } catch (t2) {
          W(a, a.return, t2);
        }
      }
      break;
    case 6:
      ck(b, a);
      ek(a);
      if (d & 4) {
        if (null === a.stateNode) throw Error(p(162));
        e = a.stateNode;
        f2 = a.memoizedProps;
        try {
          e.nodeValue = f2;
        } catch (t2) {
          W(a, a.return, t2);
        }
      }
      break;
    case 3:
      ck(b, a);
      ek(a);
      if (d & 4 && null !== c && c.memoizedState.isDehydrated) try {
        bd(b.containerInfo);
      } catch (t2) {
        W(a, a.return, t2);
      }
      break;
    case 4:
      ck(b, a);
      ek(a);
      break;
    case 13:
      ck(b, a);
      ek(a);
      e = a.child;
      e.flags & 8192 && (f2 = null !== e.memoizedState, e.stateNode.isHidden = f2, !f2 || null !== e.alternate && null !== e.alternate.memoizedState || (fk = B()));
      d & 4 && ak(a);
      break;
    case 22:
      m2 = null !== c && null !== c.memoizedState;
      a.mode & 1 ? (U = (l2 = U) || m2, ck(b, a), U = l2) : ck(b, a);
      ek(a);
      if (d & 8192) {
        l2 = null !== a.memoizedState;
        if ((a.stateNode.isHidden = l2) && !m2 && 0 !== (a.mode & 1)) for (V = a, m2 = a.child; null !== m2; ) {
          for (q2 = V = m2; null !== V; ) {
            r2 = V;
            y2 = r2.child;
            switch (r2.tag) {
              case 0:
              case 11:
              case 14:
              case 15:
                Pj(4, r2, r2.return);
                break;
              case 1:
                Lj(r2, r2.return);
                var n2 = r2.stateNode;
                if ("function" === typeof n2.componentWillUnmount) {
                  d = r2;
                  c = r2.return;
                  try {
                    b = d, n2.props = b.memoizedProps, n2.state = b.memoizedState, n2.componentWillUnmount();
                  } catch (t2) {
                    W(d, c, t2);
                  }
                }
                break;
              case 5:
                Lj(r2, r2.return);
                break;
              case 22:
                if (null !== r2.memoizedState) {
                  gk(q2);
                  continue;
                }
            }
            null !== y2 ? (y2.return = r2, V = y2) : gk(q2);
          }
          m2 = m2.sibling;
        }
        a: for (m2 = null, q2 = a; ; ) {
          if (5 === q2.tag) {
            if (null === m2) {
              m2 = q2;
              try {
                e = q2.stateNode, l2 ? (f2 = e.style, "function" === typeof f2.setProperty ? f2.setProperty("display", "none", "important") : f2.display = "none") : (h = q2.stateNode, k2 = q2.memoizedProps.style, g = void 0 !== k2 && null !== k2 && k2.hasOwnProperty("display") ? k2.display : null, h.style.display = rb("display", g));
              } catch (t2) {
                W(a, a.return, t2);
              }
            }
          } else if (6 === q2.tag) {
            if (null === m2) try {
              q2.stateNode.nodeValue = l2 ? "" : q2.memoizedProps;
            } catch (t2) {
              W(a, a.return, t2);
            }
          } else if ((22 !== q2.tag && 23 !== q2.tag || null === q2.memoizedState || q2 === a) && null !== q2.child) {
            q2.child.return = q2;
            q2 = q2.child;
            continue;
          }
          if (q2 === a) break a;
          for (; null === q2.sibling; ) {
            if (null === q2.return || q2.return === a) break a;
            m2 === q2 && (m2 = null);
            q2 = q2.return;
          }
          m2 === q2 && (m2 = null);
          q2.sibling.return = q2.return;
          q2 = q2.sibling;
        }
      }
      break;
    case 19:
      ck(b, a);
      ek(a);
      d & 4 && ak(a);
      break;
    case 21:
      break;
    default:
      ck(
        b,
        a
      ), ek(a);
  }
}
function ek(a) {
  var b = a.flags;
  if (b & 2) {
    try {
      a: {
        for (var c = a.return; null !== c; ) {
          if (Tj(c)) {
            var d = c;
            break a;
          }
          c = c.return;
        }
        throw Error(p(160));
      }
      switch (d.tag) {
        case 5:
          var e = d.stateNode;
          d.flags & 32 && (ob(e, ""), d.flags &= -33);
          var f2 = Uj(a);
          Wj(a, f2, e);
          break;
        case 3:
        case 4:
          var g = d.stateNode.containerInfo, h = Uj(a);
          Vj(a, h, g);
          break;
        default:
          throw Error(p(161));
      }
    } catch (k2) {
      W(a, a.return, k2);
    }
    a.flags &= -3;
  }
  b & 4096 && (a.flags &= -4097);
}
function hk(a, b, c) {
  V = a;
  ik(a);
}
function ik(a, b, c) {
  for (var d = 0 !== (a.mode & 1); null !== V; ) {
    var e = V, f2 = e.child;
    if (22 === e.tag && d) {
      var g = null !== e.memoizedState || Jj;
      if (!g) {
        var h = e.alternate, k2 = null !== h && null !== h.memoizedState || U;
        h = Jj;
        var l2 = U;
        Jj = g;
        if ((U = k2) && !l2) for (V = e; null !== V; ) g = V, k2 = g.child, 22 === g.tag && null !== g.memoizedState ? jk(e) : null !== k2 ? (k2.return = g, V = k2) : jk(e);
        for (; null !== f2; ) V = f2, ik(f2), f2 = f2.sibling;
        V = e;
        Jj = h;
        U = l2;
      }
      kk(a);
    } else 0 !== (e.subtreeFlags & 8772) && null !== f2 ? (f2.return = e, V = f2) : kk(a);
  }
}
function kk(a) {
  for (; null !== V; ) {
    var b = V;
    if (0 !== (b.flags & 8772)) {
      var c = b.alternate;
      try {
        if (0 !== (b.flags & 8772)) switch (b.tag) {
          case 0:
          case 11:
          case 15:
            U || Qj(5, b);
            break;
          case 1:
            var d = b.stateNode;
            if (b.flags & 4 && !U) if (null === c) d.componentDidMount();
            else {
              var e = b.elementType === b.type ? c.memoizedProps : Ci(b.type, c.memoizedProps);
              d.componentDidUpdate(e, c.memoizedState, d.__reactInternalSnapshotBeforeUpdate);
            }
            var f2 = b.updateQueue;
            null !== f2 && sh(b, f2, d);
            break;
          case 3:
            var g = b.updateQueue;
            if (null !== g) {
              c = null;
              if (null !== b.child) switch (b.child.tag) {
                case 5:
                  c = b.child.stateNode;
                  break;
                case 1:
                  c = b.child.stateNode;
              }
              sh(b, g, c);
            }
            break;
          case 5:
            var h = b.stateNode;
            if (null === c && b.flags & 4) {
              c = h;
              var k2 = b.memoizedProps;
              switch (b.type) {
                case "button":
                case "input":
                case "select":
                case "textarea":
                  k2.autoFocus && c.focus();
                  break;
                case "img":
                  k2.src && (c.src = k2.src);
              }
            }
            break;
          case 6:
            break;
          case 4:
            break;
          case 12:
            break;
          case 13:
            if (null === b.memoizedState) {
              var l2 = b.alternate;
              if (null !== l2) {
                var m2 = l2.memoizedState;
                if (null !== m2) {
                  var q2 = m2.dehydrated;
                  null !== q2 && bd(q2);
                }
              }
            }
            break;
          case 19:
          case 17:
          case 21:
          case 22:
          case 23:
          case 25:
            break;
          default:
            throw Error(p(163));
        }
        U || b.flags & 512 && Rj(b);
      } catch (r2) {
        W(b, b.return, r2);
      }
    }
    if (b === a) {
      V = null;
      break;
    }
    c = b.sibling;
    if (null !== c) {
      c.return = b.return;
      V = c;
      break;
    }
    V = b.return;
  }
}
function gk(a) {
  for (; null !== V; ) {
    var b = V;
    if (b === a) {
      V = null;
      break;
    }
    var c = b.sibling;
    if (null !== c) {
      c.return = b.return;
      V = c;
      break;
    }
    V = b.return;
  }
}
function jk(a) {
  for (; null !== V; ) {
    var b = V;
    try {
      switch (b.tag) {
        case 0:
        case 11:
        case 15:
          var c = b.return;
          try {
            Qj(4, b);
          } catch (k2) {
            W(b, c, k2);
          }
          break;
        case 1:
          var d = b.stateNode;
          if ("function" === typeof d.componentDidMount) {
            var e = b.return;
            try {
              d.componentDidMount();
            } catch (k2) {
              W(b, e, k2);
            }
          }
          var f2 = b.return;
          try {
            Rj(b);
          } catch (k2) {
            W(b, f2, k2);
          }
          break;
        case 5:
          var g = b.return;
          try {
            Rj(b);
          } catch (k2) {
            W(b, g, k2);
          }
      }
    } catch (k2) {
      W(b, b.return, k2);
    }
    if (b === a) {
      V = null;
      break;
    }
    var h = b.sibling;
    if (null !== h) {
      h.return = b.return;
      V = h;
      break;
    }
    V = b.return;
  }
}
var lk = Math.ceil, mk = ua.ReactCurrentDispatcher, nk = ua.ReactCurrentOwner, ok = ua.ReactCurrentBatchConfig, K = 0, Q = null, Y = null, Z = 0, fj = 0, ej = Uf(0), T = 0, pk = null, rh = 0, qk = 0, rk = 0, sk = null, tk = null, fk = 0, Gj = Infinity, uk = null, Oi = false, Pi = null, Ri = null, vk = false, wk = null, xk = 0, yk = 0, zk = null, Ak = -1, Bk = 0;
function R() {
  return 0 !== (K & 6) ? B() : -1 !== Ak ? Ak : Ak = B();
}
function yi(a) {
  if (0 === (a.mode & 1)) return 1;
  if (0 !== (K & 2) && 0 !== Z) return Z & -Z;
  if (null !== Kg.transition) return 0 === Bk && (Bk = yc()), Bk;
  a = C;
  if (0 !== a) return a;
  a = window.event;
  a = void 0 === a ? 16 : jd(a.type);
  return a;
}
function gi(a, b, c, d) {
  if (50 < yk) throw yk = 0, zk = null, Error(p(185));
  Ac(a, c, d);
  if (0 === (K & 2) || a !== Q) a === Q && (0 === (K & 2) && (qk |= c), 4 === T && Ck(a, Z)), Dk(a, d), 1 === c && 0 === K && 0 === (b.mode & 1) && (Gj = B() + 500, fg && jg());
}
function Dk(a, b) {
  var c = a.callbackNode;
  wc(a, b);
  var d = uc(a, a === Q ? Z : 0);
  if (0 === d) null !== c && bc(c), a.callbackNode = null, a.callbackPriority = 0;
  else if (b = d & -d, a.callbackPriority !== b) {
    null != c && bc(c);
    if (1 === b) 0 === a.tag ? ig(Ek.bind(null, a)) : hg(Ek.bind(null, a)), Jf(function() {
      0 === (K & 6) && jg();
    }), c = null;
    else {
      switch (Dc(d)) {
        case 1:
          c = fc;
          break;
        case 4:
          c = gc;
          break;
        case 16:
          c = hc;
          break;
        case 536870912:
          c = jc;
          break;
        default:
          c = hc;
      }
      c = Fk(c, Gk.bind(null, a));
    }
    a.callbackPriority = b;
    a.callbackNode = c;
  }
}
function Gk(a, b) {
  Ak = -1;
  Bk = 0;
  if (0 !== (K & 6)) throw Error(p(327));
  var c = a.callbackNode;
  if (Hk() && a.callbackNode !== c) return null;
  var d = uc(a, a === Q ? Z : 0);
  if (0 === d) return null;
  if (0 !== (d & 30) || 0 !== (d & a.expiredLanes) || b) b = Ik(a, d);
  else {
    b = d;
    var e = K;
    K |= 2;
    var f2 = Jk();
    if (Q !== a || Z !== b) uk = null, Gj = B() + 500, Kk(a, b);
    do
      try {
        Lk();
        break;
      } catch (h) {
        Mk(a, h);
      }
    while (1);
    $g();
    mk.current = f2;
    K = e;
    null !== Y ? b = 0 : (Q = null, Z = 0, b = T);
  }
  if (0 !== b) {
    2 === b && (e = xc(a), 0 !== e && (d = e, b = Nk(a, e)));
    if (1 === b) throw c = pk, Kk(a, 0), Ck(a, d), Dk(a, B()), c;
    if (6 === b) Ck(a, d);
    else {
      e = a.current.alternate;
      if (0 === (d & 30) && !Ok(e) && (b = Ik(a, d), 2 === b && (f2 = xc(a), 0 !== f2 && (d = f2, b = Nk(a, f2))), 1 === b)) throw c = pk, Kk(a, 0), Ck(a, d), Dk(a, B()), c;
      a.finishedWork = e;
      a.finishedLanes = d;
      switch (b) {
        case 0:
        case 1:
          throw Error(p(345));
        case 2:
          Pk(a, tk, uk);
          break;
        case 3:
          Ck(a, d);
          if ((d & 130023424) === d && (b = fk + 500 - B(), 10 < b)) {
            if (0 !== uc(a, 0)) break;
            e = a.suspendedLanes;
            if ((e & d) !== d) {
              R();
              a.pingedLanes |= a.suspendedLanes & e;
              break;
            }
            a.timeoutHandle = Ff(Pk.bind(null, a, tk, uk), b);
            break;
          }
          Pk(a, tk, uk);
          break;
        case 4:
          Ck(a, d);
          if ((d & 4194240) === d) break;
          b = a.eventTimes;
          for (e = -1; 0 < d; ) {
            var g = 31 - oc(d);
            f2 = 1 << g;
            g = b[g];
            g > e && (e = g);
            d &= ~f2;
          }
          d = e;
          d = B() - d;
          d = (120 > d ? 120 : 480 > d ? 480 : 1080 > d ? 1080 : 1920 > d ? 1920 : 3e3 > d ? 3e3 : 4320 > d ? 4320 : 1960 * lk(d / 1960)) - d;
          if (10 < d) {
            a.timeoutHandle = Ff(Pk.bind(null, a, tk, uk), d);
            break;
          }
          Pk(a, tk, uk);
          break;
        case 5:
          Pk(a, tk, uk);
          break;
        default:
          throw Error(p(329));
      }
    }
  }
  Dk(a, B());
  return a.callbackNode === c ? Gk.bind(null, a) : null;
}
function Nk(a, b) {
  var c = sk;
  a.current.memoizedState.isDehydrated && (Kk(a, b).flags |= 256);
  a = Ik(a, b);
  2 !== a && (b = tk, tk = c, null !== b && Fj(b));
  return a;
}
function Fj(a) {
  null === tk ? tk = a : tk.push.apply(tk, a);
}
function Ok(a) {
  for (var b = a; ; ) {
    if (b.flags & 16384) {
      var c = b.updateQueue;
      if (null !== c && (c = c.stores, null !== c)) for (var d = 0; d < c.length; d++) {
        var e = c[d], f2 = e.getSnapshot;
        e = e.value;
        try {
          if (!He(f2(), e)) return false;
        } catch (g) {
          return false;
        }
      }
    }
    c = b.child;
    if (b.subtreeFlags & 16384 && null !== c) c.return = b, b = c;
    else {
      if (b === a) break;
      for (; null === b.sibling; ) {
        if (null === b.return || b.return === a) return true;
        b = b.return;
      }
      b.sibling.return = b.return;
      b = b.sibling;
    }
  }
  return true;
}
function Ck(a, b) {
  b &= ~rk;
  b &= ~qk;
  a.suspendedLanes |= b;
  a.pingedLanes &= ~b;
  for (a = a.expirationTimes; 0 < b; ) {
    var c = 31 - oc(b), d = 1 << c;
    a[c] = -1;
    b &= ~d;
  }
}
function Ek(a) {
  if (0 !== (K & 6)) throw Error(p(327));
  Hk();
  var b = uc(a, 0);
  if (0 === (b & 1)) return Dk(a, B()), null;
  var c = Ik(a, b);
  if (0 !== a.tag && 2 === c) {
    var d = xc(a);
    0 !== d && (b = d, c = Nk(a, d));
  }
  if (1 === c) throw c = pk, Kk(a, 0), Ck(a, b), Dk(a, B()), c;
  if (6 === c) throw Error(p(345));
  a.finishedWork = a.current.alternate;
  a.finishedLanes = b;
  Pk(a, tk, uk);
  Dk(a, B());
  return null;
}
function Qk(a, b) {
  var c = K;
  K |= 1;
  try {
    return a(b);
  } finally {
    K = c, 0 === K && (Gj = B() + 500, fg && jg());
  }
}
function Rk(a) {
  null !== wk && 0 === wk.tag && 0 === (K & 6) && Hk();
  var b = K;
  K |= 1;
  var c = ok.transition, d = C;
  try {
    if (ok.transition = null, C = 1, a) return a();
  } finally {
    C = d, ok.transition = c, K = b, 0 === (K & 6) && jg();
  }
}
function Hj() {
  fj = ej.current;
  E(ej);
}
function Kk(a, b) {
  a.finishedWork = null;
  a.finishedLanes = 0;
  var c = a.timeoutHandle;
  -1 !== c && (a.timeoutHandle = -1, Gf(c));
  if (null !== Y) for (c = Y.return; null !== c; ) {
    var d = c;
    wg(d);
    switch (d.tag) {
      case 1:
        d = d.type.childContextTypes;
        null !== d && void 0 !== d && $f();
        break;
      case 3:
        zh();
        E(Wf);
        E(H);
        Eh();
        break;
      case 5:
        Bh(d);
        break;
      case 4:
        zh();
        break;
      case 13:
        E(L);
        break;
      case 19:
        E(L);
        break;
      case 10:
        ah(d.type._context);
        break;
      case 22:
      case 23:
        Hj();
    }
    c = c.return;
  }
  Q = a;
  Y = a = Pg(a.current, null);
  Z = fj = b;
  T = 0;
  pk = null;
  rk = qk = rh = 0;
  tk = sk = null;
  if (null !== fh) {
    for (b = 0; b < fh.length; b++) if (c = fh[b], d = c.interleaved, null !== d) {
      c.interleaved = null;
      var e = d.next, f2 = c.pending;
      if (null !== f2) {
        var g = f2.next;
        f2.next = e;
        d.next = g;
      }
      c.pending = d;
    }
    fh = null;
  }
  return a;
}
function Mk(a, b) {
  do {
    var c = Y;
    try {
      $g();
      Fh.current = Rh;
      if (Ih) {
        for (var d = M.memoizedState; null !== d; ) {
          var e = d.queue;
          null !== e && (e.pending = null);
          d = d.next;
        }
        Ih = false;
      }
      Hh = 0;
      O = N = M = null;
      Jh = false;
      Kh = 0;
      nk.current = null;
      if (null === c || null === c.return) {
        T = 1;
        pk = b;
        Y = null;
        break;
      }
      a: {
        var f2 = a, g = c.return, h = c, k2 = b;
        b = Z;
        h.flags |= 32768;
        if (null !== k2 && "object" === typeof k2 && "function" === typeof k2.then) {
          var l2 = k2, m2 = h, q2 = m2.tag;
          if (0 === (m2.mode & 1) && (0 === q2 || 11 === q2 || 15 === q2)) {
            var r2 = m2.alternate;
            r2 ? (m2.updateQueue = r2.updateQueue, m2.memoizedState = r2.memoizedState, m2.lanes = r2.lanes) : (m2.updateQueue = null, m2.memoizedState = null);
          }
          var y2 = Ui(g);
          if (null !== y2) {
            y2.flags &= -257;
            Vi(y2, g, h, f2, b);
            y2.mode & 1 && Si(f2, l2, b);
            b = y2;
            k2 = l2;
            var n2 = b.updateQueue;
            if (null === n2) {
              var t2 = /* @__PURE__ */ new Set();
              t2.add(k2);
              b.updateQueue = t2;
            } else n2.add(k2);
            break a;
          } else {
            if (0 === (b & 1)) {
              Si(f2, l2, b);
              tj();
              break a;
            }
            k2 = Error(p(426));
          }
        } else if (I && h.mode & 1) {
          var J2 = Ui(g);
          if (null !== J2) {
            0 === (J2.flags & 65536) && (J2.flags |= 256);
            Vi(J2, g, h, f2, b);
            Jg(Ji(k2, h));
            break a;
          }
        }
        f2 = k2 = Ji(k2, h);
        4 !== T && (T = 2);
        null === sk ? sk = [f2] : sk.push(f2);
        f2 = g;
        do {
          switch (f2.tag) {
            case 3:
              f2.flags |= 65536;
              b &= -b;
              f2.lanes |= b;
              var x2 = Ni(f2, k2, b);
              ph(f2, x2);
              break a;
            case 1:
              h = k2;
              var w2 = f2.type, u2 = f2.stateNode;
              if (0 === (f2.flags & 128) && ("function" === typeof w2.getDerivedStateFromError || null !== u2 && "function" === typeof u2.componentDidCatch && (null === Ri || !Ri.has(u2)))) {
                f2.flags |= 65536;
                b &= -b;
                f2.lanes |= b;
                var F2 = Qi(f2, h, b);
                ph(f2, F2);
                break a;
              }
          }
          f2 = f2.return;
        } while (null !== f2);
      }
      Sk(c);
    } catch (na) {
      b = na;
      Y === c && null !== c && (Y = c = c.return);
      continue;
    }
    break;
  } while (1);
}
function Jk() {
  var a = mk.current;
  mk.current = Rh;
  return null === a ? Rh : a;
}
function tj() {
  if (0 === T || 3 === T || 2 === T) T = 4;
  null === Q || 0 === (rh & 268435455) && 0 === (qk & 268435455) || Ck(Q, Z);
}
function Ik(a, b) {
  var c = K;
  K |= 2;
  var d = Jk();
  if (Q !== a || Z !== b) uk = null, Kk(a, b);
  do
    try {
      Tk();
      break;
    } catch (e) {
      Mk(a, e);
    }
  while (1);
  $g();
  K = c;
  mk.current = d;
  if (null !== Y) throw Error(p(261));
  Q = null;
  Z = 0;
  return T;
}
function Tk() {
  for (; null !== Y; ) Uk(Y);
}
function Lk() {
  for (; null !== Y && !cc(); ) Uk(Y);
}
function Uk(a) {
  var b = Vk(a.alternate, a, fj);
  a.memoizedProps = a.pendingProps;
  null === b ? Sk(a) : Y = b;
  nk.current = null;
}
function Sk(a) {
  var b = a;
  do {
    var c = b.alternate;
    a = b.return;
    if (0 === (b.flags & 32768)) {
      if (c = Ej(c, b, fj), null !== c) {
        Y = c;
        return;
      }
    } else {
      c = Ij(c, b);
      if (null !== c) {
        c.flags &= 32767;
        Y = c;
        return;
      }
      if (null !== a) a.flags |= 32768, a.subtreeFlags = 0, a.deletions = null;
      else {
        T = 6;
        Y = null;
        return;
      }
    }
    b = b.sibling;
    if (null !== b) {
      Y = b;
      return;
    }
    Y = b = a;
  } while (null !== b);
  0 === T && (T = 5);
}
function Pk(a, b, c) {
  var d = C, e = ok.transition;
  try {
    ok.transition = null, C = 1, Wk(a, b, c, d);
  } finally {
    ok.transition = e, C = d;
  }
  return null;
}
function Wk(a, b, c, d) {
  do
    Hk();
  while (null !== wk);
  if (0 !== (K & 6)) throw Error(p(327));
  c = a.finishedWork;
  var e = a.finishedLanes;
  if (null === c) return null;
  a.finishedWork = null;
  a.finishedLanes = 0;
  if (c === a.current) throw Error(p(177));
  a.callbackNode = null;
  a.callbackPriority = 0;
  var f2 = c.lanes | c.childLanes;
  Bc(a, f2);
  a === Q && (Y = Q = null, Z = 0);
  0 === (c.subtreeFlags & 2064) && 0 === (c.flags & 2064) || vk || (vk = true, Fk(hc, function() {
    Hk();
    return null;
  }));
  f2 = 0 !== (c.flags & 15990);
  if (0 !== (c.subtreeFlags & 15990) || f2) {
    f2 = ok.transition;
    ok.transition = null;
    var g = C;
    C = 1;
    var h = K;
    K |= 4;
    nk.current = null;
    Oj(a, c);
    dk(c, a);
    Oe(Df);
    dd = !!Cf;
    Df = Cf = null;
    a.current = c;
    hk(c);
    dc();
    K = h;
    C = g;
    ok.transition = f2;
  } else a.current = c;
  vk && (vk = false, wk = a, xk = e);
  f2 = a.pendingLanes;
  0 === f2 && (Ri = null);
  mc(c.stateNode);
  Dk(a, B());
  if (null !== b) for (d = a.onRecoverableError, c = 0; c < b.length; c++) e = b[c], d(e.value, { componentStack: e.stack, digest: e.digest });
  if (Oi) throw Oi = false, a = Pi, Pi = null, a;
  0 !== (xk & 1) && 0 !== a.tag && Hk();
  f2 = a.pendingLanes;
  0 !== (f2 & 1) ? a === zk ? yk++ : (yk = 0, zk = a) : yk = 0;
  jg();
  return null;
}
function Hk() {
  if (null !== wk) {
    var a = Dc(xk), b = ok.transition, c = C;
    try {
      ok.transition = null;
      C = 16 > a ? 16 : a;
      if (null === wk) var d = false;
      else {
        a = wk;
        wk = null;
        xk = 0;
        if (0 !== (K & 6)) throw Error(p(331));
        var e = K;
        K |= 4;
        for (V = a.current; null !== V; ) {
          var f2 = V, g = f2.child;
          if (0 !== (V.flags & 16)) {
            var h = f2.deletions;
            if (null !== h) {
              for (var k2 = 0; k2 < h.length; k2++) {
                var l2 = h[k2];
                for (V = l2; null !== V; ) {
                  var m2 = V;
                  switch (m2.tag) {
                    case 0:
                    case 11:
                    case 15:
                      Pj(8, m2, f2);
                  }
                  var q2 = m2.child;
                  if (null !== q2) q2.return = m2, V = q2;
                  else for (; null !== V; ) {
                    m2 = V;
                    var r2 = m2.sibling, y2 = m2.return;
                    Sj(m2);
                    if (m2 === l2) {
                      V = null;
                      break;
                    }
                    if (null !== r2) {
                      r2.return = y2;
                      V = r2;
                      break;
                    }
                    V = y2;
                  }
                }
              }
              var n2 = f2.alternate;
              if (null !== n2) {
                var t2 = n2.child;
                if (null !== t2) {
                  n2.child = null;
                  do {
                    var J2 = t2.sibling;
                    t2.sibling = null;
                    t2 = J2;
                  } while (null !== t2);
                }
              }
              V = f2;
            }
          }
          if (0 !== (f2.subtreeFlags & 2064) && null !== g) g.return = f2, V = g;
          else b: for (; null !== V; ) {
            f2 = V;
            if (0 !== (f2.flags & 2048)) switch (f2.tag) {
              case 0:
              case 11:
              case 15:
                Pj(9, f2, f2.return);
            }
            var x2 = f2.sibling;
            if (null !== x2) {
              x2.return = f2.return;
              V = x2;
              break b;
            }
            V = f2.return;
          }
        }
        var w2 = a.current;
        for (V = w2; null !== V; ) {
          g = V;
          var u2 = g.child;
          if (0 !== (g.subtreeFlags & 2064) && null !== u2) u2.return = g, V = u2;
          else b: for (g = w2; null !== V; ) {
            h = V;
            if (0 !== (h.flags & 2048)) try {
              switch (h.tag) {
                case 0:
                case 11:
                case 15:
                  Qj(9, h);
              }
            } catch (na) {
              W(h, h.return, na);
            }
            if (h === g) {
              V = null;
              break b;
            }
            var F2 = h.sibling;
            if (null !== F2) {
              F2.return = h.return;
              V = F2;
              break b;
            }
            V = h.return;
          }
        }
        K = e;
        jg();
        if (lc && "function" === typeof lc.onPostCommitFiberRoot) try {
          lc.onPostCommitFiberRoot(kc, a);
        } catch (na) {
        }
        d = true;
      }
      return d;
    } finally {
      C = c, ok.transition = b;
    }
  }
  return false;
}
function Xk(a, b, c) {
  b = Ji(c, b);
  b = Ni(a, b, 1);
  a = nh(a, b, 1);
  b = R();
  null !== a && (Ac(a, 1, b), Dk(a, b));
}
function W(a, b, c) {
  if (3 === a.tag) Xk(a, a, c);
  else for (; null !== b; ) {
    if (3 === b.tag) {
      Xk(b, a, c);
      break;
    } else if (1 === b.tag) {
      var d = b.stateNode;
      if ("function" === typeof b.type.getDerivedStateFromError || "function" === typeof d.componentDidCatch && (null === Ri || !Ri.has(d))) {
        a = Ji(c, a);
        a = Qi(b, a, 1);
        b = nh(b, a, 1);
        a = R();
        null !== b && (Ac(b, 1, a), Dk(b, a));
        break;
      }
    }
    b = b.return;
  }
}
function Ti(a, b, c) {
  var d = a.pingCache;
  null !== d && d.delete(b);
  b = R();
  a.pingedLanes |= a.suspendedLanes & c;
  Q === a && (Z & c) === c && (4 === T || 3 === T && (Z & 130023424) === Z && 500 > B() - fk ? Kk(a, 0) : rk |= c);
  Dk(a, b);
}
function Yk(a, b) {
  0 === b && (0 === (a.mode & 1) ? b = 1 : (b = sc, sc <<= 1, 0 === (sc & 130023424) && (sc = 4194304)));
  var c = R();
  a = ih(a, b);
  null !== a && (Ac(a, b, c), Dk(a, c));
}
function uj(a) {
  var b = a.memoizedState, c = 0;
  null !== b && (c = b.retryLane);
  Yk(a, c);
}
function bk(a, b) {
  var c = 0;
  switch (a.tag) {
    case 13:
      var d = a.stateNode;
      var e = a.memoizedState;
      null !== e && (c = e.retryLane);
      break;
    case 19:
      d = a.stateNode;
      break;
    default:
      throw Error(p(314));
  }
  null !== d && d.delete(b);
  Yk(a, c);
}
var Vk;
Vk = function(a, b, c) {
  if (null !== a) if (a.memoizedProps !== b.pendingProps || Wf.current) dh = true;
  else {
    if (0 === (a.lanes & c) && 0 === (b.flags & 128)) return dh = false, yj(a, b, c);
    dh = 0 !== (a.flags & 131072) ? true : false;
  }
  else dh = false, I && 0 !== (b.flags & 1048576) && ug(b, ng, b.index);
  b.lanes = 0;
  switch (b.tag) {
    case 2:
      var d = b.type;
      ij(a, b);
      a = b.pendingProps;
      var e = Yf(b, H.current);
      ch(b, c);
      e = Nh(null, b, d, a, e, c);
      var f2 = Sh();
      b.flags |= 1;
      "object" === typeof e && null !== e && "function" === typeof e.render && void 0 === e.$$typeof ? (b.tag = 1, b.memoizedState = null, b.updateQueue = null, Zf(d) ? (f2 = true, cg(b)) : f2 = false, b.memoizedState = null !== e.state && void 0 !== e.state ? e.state : null, kh(b), e.updater = Ei, b.stateNode = e, e._reactInternals = b, Ii(b, d, a, c), b = jj(null, b, d, true, f2, c)) : (b.tag = 0, I && f2 && vg(b), Xi(null, b, e, c), b = b.child);
      return b;
    case 16:
      d = b.elementType;
      a: {
        ij(a, b);
        a = b.pendingProps;
        e = d._init;
        d = e(d._payload);
        b.type = d;
        e = b.tag = Zk(d);
        a = Ci(d, a);
        switch (e) {
          case 0:
            b = cj(null, b, d, a, c);
            break a;
          case 1:
            b = hj(null, b, d, a, c);
            break a;
          case 11:
            b = Yi(null, b, d, a, c);
            break a;
          case 14:
            b = $i(null, b, d, Ci(d.type, a), c);
            break a;
        }
        throw Error(p(
          306,
          d,
          ""
        ));
      }
      return b;
    case 0:
      return d = b.type, e = b.pendingProps, e = b.elementType === d ? e : Ci(d, e), cj(a, b, d, e, c);
    case 1:
      return d = b.type, e = b.pendingProps, e = b.elementType === d ? e : Ci(d, e), hj(a, b, d, e, c);
    case 3:
      a: {
        kj(b);
        if (null === a) throw Error(p(387));
        d = b.pendingProps;
        f2 = b.memoizedState;
        e = f2.element;
        lh(a, b);
        qh(b, d, null, c);
        var g = b.memoizedState;
        d = g.element;
        if (f2.isDehydrated) if (f2 = { element: d, isDehydrated: false, cache: g.cache, pendingSuspenseBoundaries: g.pendingSuspenseBoundaries, transitions: g.transitions }, b.updateQueue.baseState = f2, b.memoizedState = f2, b.flags & 256) {
          e = Ji(Error(p(423)), b);
          b = lj(a, b, d, c, e);
          break a;
        } else if (d !== e) {
          e = Ji(Error(p(424)), b);
          b = lj(a, b, d, c, e);
          break a;
        } else for (yg = Lf(b.stateNode.containerInfo.firstChild), xg = b, I = true, zg = null, c = Vg(b, null, d, c), b.child = c; c; ) c.flags = c.flags & -3 | 4096, c = c.sibling;
        else {
          Ig();
          if (d === e) {
            b = Zi(a, b, c);
            break a;
          }
          Xi(a, b, d, c);
        }
        b = b.child;
      }
      return b;
    case 5:
      return Ah(b), null === a && Eg(b), d = b.type, e = b.pendingProps, f2 = null !== a ? a.memoizedProps : null, g = e.children, Ef(d, e) ? g = null : null !== f2 && Ef(d, f2) && (b.flags |= 32), gj(a, b), Xi(a, b, g, c), b.child;
    case 6:
      return null === a && Eg(b), null;
    case 13:
      return oj(a, b, c);
    case 4:
      return yh(b, b.stateNode.containerInfo), d = b.pendingProps, null === a ? b.child = Ug(b, null, d, c) : Xi(a, b, d, c), b.child;
    case 11:
      return d = b.type, e = b.pendingProps, e = b.elementType === d ? e : Ci(d, e), Yi(a, b, d, e, c);
    case 7:
      return Xi(a, b, b.pendingProps, c), b.child;
    case 8:
      return Xi(a, b, b.pendingProps.children, c), b.child;
    case 12:
      return Xi(a, b, b.pendingProps.children, c), b.child;
    case 10:
      a: {
        d = b.type._context;
        e = b.pendingProps;
        f2 = b.memoizedProps;
        g = e.value;
        G(Wg, d._currentValue);
        d._currentValue = g;
        if (null !== f2) if (He(f2.value, g)) {
          if (f2.children === e.children && !Wf.current) {
            b = Zi(a, b, c);
            break a;
          }
        } else for (f2 = b.child, null !== f2 && (f2.return = b); null !== f2; ) {
          var h = f2.dependencies;
          if (null !== h) {
            g = f2.child;
            for (var k2 = h.firstContext; null !== k2; ) {
              if (k2.context === d) {
                if (1 === f2.tag) {
                  k2 = mh(-1, c & -c);
                  k2.tag = 2;
                  var l2 = f2.updateQueue;
                  if (null !== l2) {
                    l2 = l2.shared;
                    var m2 = l2.pending;
                    null === m2 ? k2.next = k2 : (k2.next = m2.next, m2.next = k2);
                    l2.pending = k2;
                  }
                }
                f2.lanes |= c;
                k2 = f2.alternate;
                null !== k2 && (k2.lanes |= c);
                bh(
                  f2.return,
                  c,
                  b
                );
                h.lanes |= c;
                break;
              }
              k2 = k2.next;
            }
          } else if (10 === f2.tag) g = f2.type === b.type ? null : f2.child;
          else if (18 === f2.tag) {
            g = f2.return;
            if (null === g) throw Error(p(341));
            g.lanes |= c;
            h = g.alternate;
            null !== h && (h.lanes |= c);
            bh(g, c, b);
            g = f2.sibling;
          } else g = f2.child;
          if (null !== g) g.return = f2;
          else for (g = f2; null !== g; ) {
            if (g === b) {
              g = null;
              break;
            }
            f2 = g.sibling;
            if (null !== f2) {
              f2.return = g.return;
              g = f2;
              break;
            }
            g = g.return;
          }
          f2 = g;
        }
        Xi(a, b, e.children, c);
        b = b.child;
      }
      return b;
    case 9:
      return e = b.type, d = b.pendingProps.children, ch(b, c), e = eh(e), d = d(e), b.flags |= 1, Xi(a, b, d, c), b.child;
    case 14:
      return d = b.type, e = Ci(d, b.pendingProps), e = Ci(d.type, e), $i(a, b, d, e, c);
    case 15:
      return bj(a, b, b.type, b.pendingProps, c);
    case 17:
      return d = b.type, e = b.pendingProps, e = b.elementType === d ? e : Ci(d, e), ij(a, b), b.tag = 1, Zf(d) ? (a = true, cg(b)) : a = false, ch(b, c), Gi(b, d, e), Ii(b, d, e, c), jj(null, b, d, true, a, c);
    case 19:
      return xj(a, b, c);
    case 22:
      return dj(a, b, c);
  }
  throw Error(p(156, b.tag));
};
function Fk(a, b) {
  return ac(a, b);
}
function $k(a, b, c, d) {
  this.tag = a;
  this.key = c;
  this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null;
  this.index = 0;
  this.ref = null;
  this.pendingProps = b;
  this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null;
  this.mode = d;
  this.subtreeFlags = this.flags = 0;
  this.deletions = null;
  this.childLanes = this.lanes = 0;
  this.alternate = null;
}
function Bg(a, b, c, d) {
  return new $k(a, b, c, d);
}
function aj(a) {
  a = a.prototype;
  return !(!a || !a.isReactComponent);
}
function Zk(a) {
  if ("function" === typeof a) return aj(a) ? 1 : 0;
  if (void 0 !== a && null !== a) {
    a = a.$$typeof;
    if (a === Da) return 11;
    if (a === Ga) return 14;
  }
  return 2;
}
function Pg(a, b) {
  var c = a.alternate;
  null === c ? (c = Bg(a.tag, b, a.key, a.mode), c.elementType = a.elementType, c.type = a.type, c.stateNode = a.stateNode, c.alternate = a, a.alternate = c) : (c.pendingProps = b, c.type = a.type, c.flags = 0, c.subtreeFlags = 0, c.deletions = null);
  c.flags = a.flags & 14680064;
  c.childLanes = a.childLanes;
  c.lanes = a.lanes;
  c.child = a.child;
  c.memoizedProps = a.memoizedProps;
  c.memoizedState = a.memoizedState;
  c.updateQueue = a.updateQueue;
  b = a.dependencies;
  c.dependencies = null === b ? null : { lanes: b.lanes, firstContext: b.firstContext };
  c.sibling = a.sibling;
  c.index = a.index;
  c.ref = a.ref;
  return c;
}
function Rg(a, b, c, d, e, f2) {
  var g = 2;
  d = a;
  if ("function" === typeof a) aj(a) && (g = 1);
  else if ("string" === typeof a) g = 5;
  else a: switch (a) {
    case ya:
      return Tg(c.children, e, f2, b);
    case za:
      g = 8;
      e |= 8;
      break;
    case Aa:
      return a = Bg(12, c, b, e | 2), a.elementType = Aa, a.lanes = f2, a;
    case Ea:
      return a = Bg(13, c, b, e), a.elementType = Ea, a.lanes = f2, a;
    case Fa:
      return a = Bg(19, c, b, e), a.elementType = Fa, a.lanes = f2, a;
    case Ia:
      return pj(c, e, f2, b);
    default:
      if ("object" === typeof a && null !== a) switch (a.$$typeof) {
        case Ba:
          g = 10;
          break a;
        case Ca:
          g = 9;
          break a;
        case Da:
          g = 11;
          break a;
        case Ga:
          g = 14;
          break a;
        case Ha:
          g = 16;
          d = null;
          break a;
      }
      throw Error(p(130, null == a ? a : typeof a, ""));
  }
  b = Bg(g, c, b, e);
  b.elementType = a;
  b.type = d;
  b.lanes = f2;
  return b;
}
function Tg(a, b, c, d) {
  a = Bg(7, a, d, b);
  a.lanes = c;
  return a;
}
function pj(a, b, c, d) {
  a = Bg(22, a, d, b);
  a.elementType = Ia;
  a.lanes = c;
  a.stateNode = { isHidden: false };
  return a;
}
function Qg(a, b, c) {
  a = Bg(6, a, null, b);
  a.lanes = c;
  return a;
}
function Sg(a, b, c) {
  b = Bg(4, null !== a.children ? a.children : [], a.key, b);
  b.lanes = c;
  b.stateNode = { containerInfo: a.containerInfo, pendingChildren: null, implementation: a.implementation };
  return b;
}
function al(a, b, c, d, e) {
  this.tag = b;
  this.containerInfo = a;
  this.finishedWork = this.pingCache = this.current = this.pendingChildren = null;
  this.timeoutHandle = -1;
  this.callbackNode = this.pendingContext = this.context = null;
  this.callbackPriority = 0;
  this.eventTimes = zc(0);
  this.expirationTimes = zc(-1);
  this.entangledLanes = this.finishedLanes = this.mutableReadLanes = this.expiredLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0;
  this.entanglements = zc(0);
  this.identifierPrefix = d;
  this.onRecoverableError = e;
  this.mutableSourceEagerHydrationData = null;
}
function bl(a, b, c, d, e, f2, g, h, k2) {
  a = new al(a, b, c, h, k2);
  1 === b ? (b = 1, true === f2 && (b |= 8)) : b = 0;
  f2 = Bg(3, null, null, b);
  a.current = f2;
  f2.stateNode = a;
  f2.memoizedState = { element: d, isDehydrated: c, cache: null, transitions: null, pendingSuspenseBoundaries: null };
  kh(f2);
  return a;
}
function cl(a, b, c) {
  var d = 3 < arguments.length && void 0 !== arguments[3] ? arguments[3] : null;
  return { $$typeof: wa, key: null == d ? null : "" + d, children: a, containerInfo: b, implementation: c };
}
function dl(a) {
  if (!a) return Vf;
  a = a._reactInternals;
  a: {
    if (Vb(a) !== a || 1 !== a.tag) throw Error(p(170));
    var b = a;
    do {
      switch (b.tag) {
        case 3:
          b = b.stateNode.context;
          break a;
        case 1:
          if (Zf(b.type)) {
            b = b.stateNode.__reactInternalMemoizedMergedChildContext;
            break a;
          }
      }
      b = b.return;
    } while (null !== b);
    throw Error(p(171));
  }
  if (1 === a.tag) {
    var c = a.type;
    if (Zf(c)) return bg(a, c, b);
  }
  return b;
}
function el(a, b, c, d, e, f2, g, h, k2) {
  a = bl(c, d, true, a, e, f2, g, h, k2);
  a.context = dl(null);
  c = a.current;
  d = R();
  e = yi(c);
  f2 = mh(d, e);
  f2.callback = void 0 !== b && null !== b ? b : null;
  nh(c, f2, e);
  a.current.lanes = e;
  Ac(a, e, d);
  Dk(a, d);
  return a;
}
function fl(a, b, c, d) {
  var e = b.current, f2 = R(), g = yi(e);
  c = dl(c);
  null === b.context ? b.context = c : b.pendingContext = c;
  b = mh(f2, g);
  b.payload = { element: a };
  d = void 0 === d ? null : d;
  null !== d && (b.callback = d);
  a = nh(e, b, g);
  null !== a && (gi(a, e, g, f2), oh(a, e, g));
  return g;
}
function gl(a) {
  a = a.current;
  if (!a.child) return null;
  switch (a.child.tag) {
    case 5:
      return a.child.stateNode;
    default:
      return a.child.stateNode;
  }
}
function hl(a, b) {
  a = a.memoizedState;
  if (null !== a && null !== a.dehydrated) {
    var c = a.retryLane;
    a.retryLane = 0 !== c && c < b ? c : b;
  }
}
function il(a, b) {
  hl(a, b);
  (a = a.alternate) && hl(a, b);
}
function jl() {
  return null;
}
var kl = "function" === typeof reportError ? reportError : function(a) {
  console.error(a);
};
function ll(a) {
  this._internalRoot = a;
}
ml.prototype.render = ll.prototype.render = function(a) {
  var b = this._internalRoot;
  if (null === b) throw Error(p(409));
  fl(a, b, null, null);
};
ml.prototype.unmount = ll.prototype.unmount = function() {
  var a = this._internalRoot;
  if (null !== a) {
    this._internalRoot = null;
    var b = a.containerInfo;
    Rk(function() {
      fl(null, a, null, null);
    });
    b[uf] = null;
  }
};
function ml(a) {
  this._internalRoot = a;
}
ml.prototype.unstable_scheduleHydration = function(a) {
  if (a) {
    var b = Hc();
    a = { blockedOn: null, target: a, priority: b };
    for (var c = 0; c < Qc.length && 0 !== b && b < Qc[c].priority; c++) ;
    Qc.splice(c, 0, a);
    0 === c && Vc(a);
  }
};
function nl(a) {
  return !(!a || 1 !== a.nodeType && 9 !== a.nodeType && 11 !== a.nodeType);
}
function ol(a) {
  return !(!a || 1 !== a.nodeType && 9 !== a.nodeType && 11 !== a.nodeType && (8 !== a.nodeType || " react-mount-point-unstable " !== a.nodeValue));
}
function pl() {
}
function ql(a, b, c, d, e) {
  if (e) {
    if ("function" === typeof d) {
      var f2 = d;
      d = function() {
        var a2 = gl(g);
        f2.call(a2);
      };
    }
    var g = el(b, d, a, 0, null, false, false, "", pl);
    a._reactRootContainer = g;
    a[uf] = g.current;
    sf(8 === a.nodeType ? a.parentNode : a);
    Rk();
    return g;
  }
  for (; e = a.lastChild; ) a.removeChild(e);
  if ("function" === typeof d) {
    var h = d;
    d = function() {
      var a2 = gl(k2);
      h.call(a2);
    };
  }
  var k2 = bl(a, 0, false, null, null, false, false, "", pl);
  a._reactRootContainer = k2;
  a[uf] = k2.current;
  sf(8 === a.nodeType ? a.parentNode : a);
  Rk(function() {
    fl(b, k2, c, d);
  });
  return k2;
}
function rl(a, b, c, d, e) {
  var f2 = c._reactRootContainer;
  if (f2) {
    var g = f2;
    if ("function" === typeof e) {
      var h = e;
      e = function() {
        var a2 = gl(g);
        h.call(a2);
      };
    }
    fl(b, g, a, e);
  } else g = ql(c, b, a, e, d);
  return gl(g);
}
Ec = function(a) {
  switch (a.tag) {
    case 3:
      var b = a.stateNode;
      if (b.current.memoizedState.isDehydrated) {
        var c = tc(b.pendingLanes);
        0 !== c && (Cc(b, c | 1), Dk(b, B()), 0 === (K & 6) && (Gj = B() + 500, jg()));
      }
      break;
    case 13:
      Rk(function() {
        var b2 = ih(a, 1);
        if (null !== b2) {
          var c2 = R();
          gi(b2, a, 1, c2);
        }
      }), il(a, 1);
  }
};
Fc = function(a) {
  if (13 === a.tag) {
    var b = ih(a, 134217728);
    if (null !== b) {
      var c = R();
      gi(b, a, 134217728, c);
    }
    il(a, 134217728);
  }
};
Gc = function(a) {
  if (13 === a.tag) {
    var b = yi(a), c = ih(a, b);
    if (null !== c) {
      var d = R();
      gi(c, a, b, d);
    }
    il(a, b);
  }
};
Hc = function() {
  return C;
};
Ic = function(a, b) {
  var c = C;
  try {
    return C = a, b();
  } finally {
    C = c;
  }
};
yb = function(a, b, c) {
  switch (b) {
    case "input":
      bb(a, c);
      b = c.name;
      if ("radio" === c.type && null != b) {
        for (c = a; c.parentNode; ) c = c.parentNode;
        c = c.querySelectorAll("input[name=" + JSON.stringify("" + b) + '][type="radio"]');
        for (b = 0; b < c.length; b++) {
          var d = c[b];
          if (d !== a && d.form === a.form) {
            var e = Db(d);
            if (!e) throw Error(p(90));
            Wa(d);
            bb(d, e);
          }
        }
      }
      break;
    case "textarea":
      ib(a, c);
      break;
    case "select":
      b = c.value, null != b && fb(a, !!c.multiple, b, false);
  }
};
Gb = Qk;
Hb = Rk;
var sl = { usingClientEntryPoint: false, Events: [Cb, ue, Db, Eb, Fb, Qk] }, tl = { findFiberByHostInstance: Wc, bundleType: 0, version: "18.3.1", rendererPackageName: "react-dom" };
var ul = { bundleType: tl.bundleType, version: tl.version, rendererPackageName: tl.rendererPackageName, rendererConfig: tl.rendererConfig, overrideHookState: null, overrideHookStateDeletePath: null, overrideHookStateRenamePath: null, overrideProps: null, overridePropsDeletePath: null, overridePropsRenamePath: null, setErrorHandler: null, setSuspenseHandler: null, scheduleUpdate: null, currentDispatcherRef: ua.ReactCurrentDispatcher, findHostInstanceByFiber: function(a) {
  a = Zb(a);
  return null === a ? null : a.stateNode;
}, findFiberByHostInstance: tl.findFiberByHostInstance || jl, findHostInstancesForRefresh: null, scheduleRefresh: null, scheduleRoot: null, setRefreshHandler: null, getCurrentFiber: null, reconcilerVersion: "18.3.1-next-f1338f8080-20240426" };
if ("undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__) {
  var vl = __REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (!vl.isDisabled && vl.supportsFiber) try {
    kc = vl.inject(ul), lc = vl;
  } catch (a) {
  }
}
reactDom_production_min.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = sl;
reactDom_production_min.createPortal = function(a, b) {
  var c = 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : null;
  if (!nl(b)) throw Error(p(200));
  return cl(a, b, null, c);
};
reactDom_production_min.createRoot = function(a, b) {
  if (!nl(a)) throw Error(p(299));
  var c = false, d = "", e = kl;
  null !== b && void 0 !== b && (true === b.unstable_strictMode && (c = true), void 0 !== b.identifierPrefix && (d = b.identifierPrefix), void 0 !== b.onRecoverableError && (e = b.onRecoverableError));
  b = bl(a, 1, false, null, null, c, false, d, e);
  a[uf] = b.current;
  sf(8 === a.nodeType ? a.parentNode : a);
  return new ll(b);
};
reactDom_production_min.findDOMNode = function(a) {
  if (null == a) return null;
  if (1 === a.nodeType) return a;
  var b = a._reactInternals;
  if (void 0 === b) {
    if ("function" === typeof a.render) throw Error(p(188));
    a = Object.keys(a).join(",");
    throw Error(p(268, a));
  }
  a = Zb(b);
  a = null === a ? null : a.stateNode;
  return a;
};
reactDom_production_min.flushSync = function(a) {
  return Rk(a);
};
reactDom_production_min.hydrate = function(a, b, c) {
  if (!ol(b)) throw Error(p(200));
  return rl(null, a, b, true, c);
};
reactDom_production_min.hydrateRoot = function(a, b, c) {
  if (!nl(a)) throw Error(p(405));
  var d = null != c && c.hydratedSources || null, e = false, f2 = "", g = kl;
  null !== c && void 0 !== c && (true === c.unstable_strictMode && (e = true), void 0 !== c.identifierPrefix && (f2 = c.identifierPrefix), void 0 !== c.onRecoverableError && (g = c.onRecoverableError));
  b = el(b, null, a, 1, null != c ? c : null, e, false, f2, g);
  a[uf] = b.current;
  sf(a);
  if (d) for (a = 0; a < d.length; a++) c = d[a], e = c._getVersion, e = e(c._source), null == b.mutableSourceEagerHydrationData ? b.mutableSourceEagerHydrationData = [c, e] : b.mutableSourceEagerHydrationData.push(
    c,
    e
  );
  return new ml(b);
};
reactDom_production_min.render = function(a, b, c) {
  if (!ol(b)) throw Error(p(200));
  return rl(null, a, b, false, c);
};
reactDom_production_min.unmountComponentAtNode = function(a) {
  if (!ol(a)) throw Error(p(40));
  return a._reactRootContainer ? (Rk(function() {
    rl(null, null, a, false, function() {
      a._reactRootContainer = null;
      a[uf] = null;
    });
  }), true) : false;
};
reactDom_production_min.unstable_batchedUpdates = Qk;
reactDom_production_min.unstable_renderSubtreeIntoContainer = function(a, b, c, d) {
  if (!ol(c)) throw Error(p(200));
  if (null == a || void 0 === a._reactInternals) throw Error(p(38));
  return rl(a, b, c, false, d);
};
reactDom_production_min.version = "18.3.1-next-f1338f8080-20240426";
function checkDCE() {
  if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === "undefined" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE !== "function") {
    return;
  }
  try {
    __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(checkDCE);
  } catch (err) {
    console.error(err);
  }
}
{
  checkDCE();
  reactDom.exports = reactDom_production_min;
}
var reactDomExports = reactDom.exports;
var m = reactDomExports;
{
  client.createRoot = m.createRoot;
  client.hydrateRoot = m.hydrateRoot;
}
/**
 * @remix-run/router v1.23.3
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */
function _extends$2() {
  return _extends$2 = Object.assign ? Object.assign.bind() : function(n2) {
    for (var e = 1; e < arguments.length; e++) {
      var t2 = arguments[e];
      for (var r2 in t2) ({}).hasOwnProperty.call(t2, r2) && (n2[r2] = t2[r2]);
    }
    return n2;
  }, _extends$2.apply(null, arguments);
}
var Action;
(function(Action2) {
  Action2["Pop"] = "POP";
  Action2["Push"] = "PUSH";
  Action2["Replace"] = "REPLACE";
})(Action || (Action = {}));
const PopStateEventType = "popstate";
function createHashHistory(options) {
  if (options === void 0) {
    options = {};
  }
  function createHashLocation(window2, globalHistory) {
    let {
      pathname = "/",
      search = "",
      hash = ""
    } = parsePath(window2.location.hash.substr(1));
    if (!pathname.startsWith("/") && !pathname.startsWith(".")) {
      pathname = "/" + pathname;
    }
    return createLocation(
      "",
      {
        pathname,
        search,
        hash
      },
      // state defaults to `null` because `window.history.state` does
      globalHistory.state && globalHistory.state.usr || null,
      globalHistory.state && globalHistory.state.key || "default"
    );
  }
  function createHashHref(window2, to) {
    let base = window2.document.querySelector("base");
    let href = "";
    if (base && base.getAttribute("href")) {
      let url = window2.location.href;
      let hashIndex = url.indexOf("#");
      href = hashIndex === -1 ? url : url.slice(0, hashIndex);
    }
    return href + "#" + (typeof to === "string" ? to : createPath(to));
  }
  function validateHashLocation(location, to) {
    warning(location.pathname.charAt(0) === "/", "relative pathnames are not supported in hash history.push(" + JSON.stringify(to) + ")");
  }
  return getUrlBasedHistory(createHashLocation, createHashHref, validateHashLocation, options);
}
function invariant(value, message) {
  if (value === false || value === null || typeof value === "undefined") {
    throw new Error(message);
  }
}
function warning(cond, message) {
  if (!cond) {
    if (typeof console !== "undefined") console.warn(message);
    try {
      throw new Error(message);
    } catch (e) {
    }
  }
}
function createKey() {
  return Math.random().toString(36).substr(2, 8);
}
function getHistoryState(location, index) {
  return {
    usr: location.state,
    key: location.key,
    idx: index
  };
}
function createLocation(current, to, state, key) {
  if (state === void 0) {
    state = null;
  }
  let location = _extends$2({
    pathname: typeof current === "string" ? current : current.pathname,
    search: "",
    hash: ""
  }, typeof to === "string" ? parsePath(to) : to, {
    state,
    // TODO: This could be cleaned up.  push/replace should probably just take
    // full Locations now and avoid the need to run through this flow at all
    // But that's a pretty big refactor to the current test suite so going to
    // keep as is for the time being and just let any incoming keys take precedence
    key: to && to.key || key || createKey()
  });
  return location;
}
function createPath(_ref) {
  let {
    pathname = "/",
    search = "",
    hash = ""
  } = _ref;
  if (search && search !== "?") pathname += search.charAt(0) === "?" ? search : "?" + search;
  if (hash && hash !== "#") pathname += hash.charAt(0) === "#" ? hash : "#" + hash;
  return pathname;
}
function parsePath(path) {
  let parsedPath = {};
  if (path) {
    let hashIndex = path.indexOf("#");
    if (hashIndex >= 0) {
      parsedPath.hash = path.substr(hashIndex);
      path = path.substr(0, hashIndex);
    }
    let searchIndex = path.indexOf("?");
    if (searchIndex >= 0) {
      parsedPath.search = path.substr(searchIndex);
      path = path.substr(0, searchIndex);
    }
    if (path) {
      parsedPath.pathname = path;
    }
  }
  return parsedPath;
}
function getUrlBasedHistory(getLocation, createHref, validateLocation, options) {
  if (options === void 0) {
    options = {};
  }
  let {
    window: window2 = document.defaultView,
    v5Compat = false
  } = options;
  let globalHistory = window2.history;
  let action = Action.Pop;
  let listener = null;
  let index = getIndex();
  if (index == null) {
    index = 0;
    globalHistory.replaceState(_extends$2({}, globalHistory.state, {
      idx: index
    }), "");
  }
  function getIndex() {
    let state = globalHistory.state || {
      idx: null
    };
    return state.idx;
  }
  function handlePop() {
    action = Action.Pop;
    let nextIndex = getIndex();
    let delta = nextIndex == null ? null : nextIndex - index;
    index = nextIndex;
    if (listener) {
      listener({
        action,
        location: history.location,
        delta
      });
    }
  }
  function push(to, state) {
    action = Action.Push;
    let location = createLocation(history.location, to, state);
    if (validateLocation) validateLocation(location, to);
    index = getIndex() + 1;
    let historyState = getHistoryState(location, index);
    let url = history.createHref(location);
    try {
      globalHistory.pushState(historyState, "", url);
    } catch (error) {
      if (error instanceof DOMException && error.name === "DataCloneError") {
        throw error;
      }
      window2.location.assign(url);
    }
    if (v5Compat && listener) {
      listener({
        action,
        location: history.location,
        delta: 1
      });
    }
  }
  function replace(to, state) {
    action = Action.Replace;
    let location = createLocation(history.location, to, state);
    if (validateLocation) validateLocation(location, to);
    index = getIndex();
    let historyState = getHistoryState(location, index);
    let url = history.createHref(location);
    globalHistory.replaceState(historyState, "", url);
    if (v5Compat && listener) {
      listener({
        action,
        location: history.location,
        delta: 0
      });
    }
  }
  function createURL(to) {
    let base = window2.location.origin !== "null" ? window2.location.origin : window2.location.href;
    let href = typeof to === "string" ? to : createPath(to);
    href = href.replace(/ $/, "%20");
    invariant(base, "No window.location.(origin|href) available to create URL for href: " + href);
    return new URL(href, base);
  }
  let history = {
    get action() {
      return action;
    },
    get location() {
      return getLocation(window2, globalHistory);
    },
    listen(fn) {
      if (listener) {
        throw new Error("A history only accepts one active listener");
      }
      window2.addEventListener(PopStateEventType, handlePop);
      listener = fn;
      return () => {
        window2.removeEventListener(PopStateEventType, handlePop);
        listener = null;
      };
    },
    createHref(to) {
      return createHref(window2, to);
    },
    createURL,
    encodeLocation(to) {
      let url = createURL(to);
      return {
        pathname: url.pathname,
        search: url.search,
        hash: url.hash
      };
    },
    push,
    replace,
    go(n2) {
      return globalHistory.go(n2);
    }
  };
  return history;
}
var ResultType;
(function(ResultType2) {
  ResultType2["data"] = "data";
  ResultType2["deferred"] = "deferred";
  ResultType2["redirect"] = "redirect";
  ResultType2["error"] = "error";
})(ResultType || (ResultType = {}));
function matchRoutes(routes, locationArg, basename) {
  if (basename === void 0) {
    basename = "/";
  }
  return matchRoutesImpl(routes, locationArg, basename);
}
function matchRoutesImpl(routes, locationArg, basename, allowPartial) {
  let location = typeof locationArg === "string" ? parsePath(locationArg) : locationArg;
  let pathname = stripBasename(location.pathname || "/", basename);
  if (pathname == null) {
    return null;
  }
  let branches = flattenRoutes(routes);
  rankRouteBranches(branches);
  let matches = null;
  let decoded = decodePath(pathname);
  for (let i = 0; matches == null && i < branches.length; ++i) {
    matches = matchRouteBranch(branches[i], decoded);
  }
  return matches;
}
function flattenRoutes(routes, branches, parentsMeta, parentPath) {
  if (branches === void 0) {
    branches = [];
  }
  if (parentsMeta === void 0) {
    parentsMeta = [];
  }
  if (parentPath === void 0) {
    parentPath = "";
  }
  let flattenRoute = (route, index, relativePath) => {
    let meta = {
      relativePath: relativePath === void 0 ? route.path || "" : relativePath,
      caseSensitive: route.caseSensitive === true,
      childrenIndex: index,
      route
    };
    if (meta.relativePath.startsWith("/")) {
      invariant(meta.relativePath.startsWith(parentPath), 'Absolute route path "' + meta.relativePath + '" nested under path ' + ('"' + parentPath + '" is not valid. An absolute child route path ') + "must start with the combined path of all its parent routes.");
      meta.relativePath = meta.relativePath.slice(parentPath.length);
    }
    let path = joinPaths([parentPath, meta.relativePath]);
    let routesMeta = parentsMeta.concat(meta);
    if (route.children && route.children.length > 0) {
      invariant(
        // Our types know better, but runtime JS may not!
        // @ts-expect-error
        route.index !== true,
        "Index routes must not have child routes. Please remove " + ('all child routes from route path "' + path + '".')
      );
      flattenRoutes(route.children, branches, routesMeta, path);
    }
    if (route.path == null && !route.index) {
      return;
    }
    branches.push({
      path,
      score: computeScore(path, route.index),
      routesMeta
    });
  };
  routes.forEach((route, index) => {
    var _route$path;
    if (route.path === "" || !((_route$path = route.path) != null && _route$path.includes("?"))) {
      flattenRoute(route, index);
    } else {
      for (let exploded of explodeOptionalSegments(route.path)) {
        flattenRoute(route, index, exploded);
      }
    }
  });
  return branches;
}
function explodeOptionalSegments(path) {
  let segments = path.split("/");
  if (segments.length === 0) return [];
  let [first, ...rest] = segments;
  let isOptional = first.endsWith("?");
  let required = first.replace(/\?$/, "");
  if (rest.length === 0) {
    return isOptional ? [required, ""] : [required];
  }
  let restExploded = explodeOptionalSegments(rest.join("/"));
  let result = [];
  result.push(...restExploded.map((subpath) => subpath === "" ? required : [required, subpath].join("/")));
  if (isOptional) {
    result.push(...restExploded);
  }
  return result.map((exploded) => path.startsWith("/") && exploded === "" ? "/" : exploded);
}
function rankRouteBranches(branches) {
  branches.sort((a, b) => a.score !== b.score ? b.score - a.score : compareIndexes(a.routesMeta.map((meta) => meta.childrenIndex), b.routesMeta.map((meta) => meta.childrenIndex)));
}
const paramRe = /^:[\w-]+$/;
const dynamicSegmentValue = 3;
const indexRouteValue = 2;
const emptySegmentValue = 1;
const staticSegmentValue = 10;
const splatPenalty = -2;
const isSplat = (s) => s === "*";
function computeScore(path, index) {
  let segments = path.split("/");
  let initialScore = segments.length;
  if (segments.some(isSplat)) {
    initialScore += splatPenalty;
  }
  if (index) {
    initialScore += indexRouteValue;
  }
  return segments.filter((s) => !isSplat(s)).reduce((score, segment) => score + (paramRe.test(segment) ? dynamicSegmentValue : segment === "" ? emptySegmentValue : staticSegmentValue), initialScore);
}
function compareIndexes(a, b) {
  let siblings = a.length === b.length && a.slice(0, -1).every((n2, i) => n2 === b[i]);
  return siblings ? (
    // If two routes are siblings, we should try to match the earlier sibling
    // first. This allows people to have fine-grained control over the matching
    // behavior by simply putting routes with identical paths in the order they
    // want them tried.
    a[a.length - 1] - b[b.length - 1]
  ) : (
    // Otherwise, it doesn't really make sense to rank non-siblings by index,
    // so they sort equally.
    0
  );
}
function matchRouteBranch(branch, pathname, allowPartial) {
  let {
    routesMeta
  } = branch;
  let matchedParams = {};
  let matchedPathname = "/";
  let matches = [];
  for (let i = 0; i < routesMeta.length; ++i) {
    let meta = routesMeta[i];
    let end = i === routesMeta.length - 1;
    let remainingPathname = matchedPathname === "/" ? pathname : pathname.slice(matchedPathname.length) || "/";
    let match = matchPath({
      path: meta.relativePath,
      caseSensitive: meta.caseSensitive,
      end
    }, remainingPathname);
    let route = meta.route;
    if (!match) {
      return null;
    }
    Object.assign(matchedParams, match.params);
    matches.push({
      // TODO: Can this as be avoided?
      params: matchedParams,
      pathname: joinPaths([matchedPathname, match.pathname]),
      pathnameBase: normalizePathname(joinPaths([matchedPathname, match.pathnameBase])),
      route
    });
    if (match.pathnameBase !== "/") {
      matchedPathname = joinPaths([matchedPathname, match.pathnameBase]);
    }
  }
  return matches;
}
function matchPath(pattern, pathname) {
  if (typeof pattern === "string") {
    pattern = {
      path: pattern,
      caseSensitive: false,
      end: true
    };
  }
  let [matcher, compiledParams] = compilePath(pattern.path, pattern.caseSensitive, pattern.end);
  let match = pathname.match(matcher);
  if (!match) return null;
  let matchedPathname = match[0];
  let pathnameBase = matchedPathname.replace(/(.)\/+$/, "$1");
  let captureGroups = match.slice(1);
  let params = compiledParams.reduce((memo, _ref, index) => {
    let {
      paramName,
      isOptional
    } = _ref;
    if (paramName === "*") {
      let splatValue = captureGroups[index] || "";
      pathnameBase = matchedPathname.slice(0, matchedPathname.length - splatValue.length).replace(/(.)\/+$/, "$1");
    }
    const value = captureGroups[index];
    if (isOptional && !value) {
      memo[paramName] = void 0;
    } else {
      memo[paramName] = (value || "").replace(/%2F/g, "/");
    }
    return memo;
  }, {});
  return {
    params,
    pathname: matchedPathname,
    pathnameBase,
    pattern
  };
}
function compilePath(path, caseSensitive, end) {
  if (caseSensitive === void 0) {
    caseSensitive = false;
  }
  if (end === void 0) {
    end = true;
  }
  warning(path === "*" || !path.endsWith("*") || path.endsWith("/*"), 'Route path "' + path + '" will be treated as if it were ' + ('"' + path.replace(/\*$/, "/*") + '" because the `*` character must ') + "always follow a `/` in the pattern. To get rid of this warning, " + ('please change the route path to "' + path.replace(/\*$/, "/*") + '".'));
  let params = [];
  let regexpSource = "^" + path.replace(/\/*\*?$/, "").replace(/^\/*/, "/").replace(/[\\.*+^${}|()[\]]/g, "\\$&").replace(/\/:([\w-]+)(\?)?/g, (_, paramName, isOptional) => {
    params.push({
      paramName,
      isOptional: isOptional != null
    });
    return isOptional ? "/?([^\\/]+)?" : "/([^\\/]+)";
  });
  if (path.endsWith("*")) {
    params.push({
      paramName: "*"
    });
    regexpSource += path === "*" || path === "/*" ? "(.*)$" : "(?:\\/(.+)|\\/*)$";
  } else if (end) {
    regexpSource += "\\/*$";
  } else if (path !== "" && path !== "/") {
    regexpSource += "(?:(?=\\/|$))";
  } else ;
  let matcher = new RegExp(regexpSource, caseSensitive ? void 0 : "i");
  return [matcher, params];
}
function decodePath(value) {
  try {
    return value.split("/").map((v2) => decodeURIComponent(v2).replace(/\//g, "%2F")).join("/");
  } catch (error) {
    warning(false, 'The URL path "' + value + '" could not be decoded because it is is a malformed URL segment. This is probably due to a bad percent ' + ("encoding (" + error + ")."));
    return value;
  }
}
function stripBasename(pathname, basename) {
  if (basename === "/") return pathname;
  if (!pathname.toLowerCase().startsWith(basename.toLowerCase())) {
    return null;
  }
  let startIndex = basename.endsWith("/") ? basename.length - 1 : basename.length;
  let nextChar = pathname.charAt(startIndex);
  if (nextChar && nextChar !== "/") {
    return null;
  }
  return pathname.slice(startIndex) || "/";
}
const ABSOLUTE_URL_REGEX$1 = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;
const isAbsoluteUrl = (url) => ABSOLUTE_URL_REGEX$1.test(url);
function resolvePath(to, fromPathname) {
  if (fromPathname === void 0) {
    fromPathname = "/";
  }
  let {
    pathname: toPathname,
    search = "",
    hash = ""
  } = typeof to === "string" ? parsePath(to) : to;
  let pathname;
  if (toPathname) {
    if (isAbsoluteUrl(toPathname)) {
      pathname = toPathname;
    } else {
      if (toPathname.includes("//")) {
        let oldPathname = toPathname;
        toPathname = removeDoubleSlashes(toPathname);
        warning(false, "Pathnames cannot have embedded double slashes - normalizing " + (oldPathname + " -> " + toPathname));
      }
      if (toPathname.startsWith("/")) {
        pathname = resolvePathname(toPathname.substring(1), "/");
      } else {
        pathname = resolvePathname(toPathname, fromPathname);
      }
    }
  } else {
    pathname = fromPathname;
  }
  return {
    pathname,
    search: normalizeSearch(search),
    hash: normalizeHash(hash)
  };
}
function resolvePathname(relativePath, fromPathname) {
  let segments = fromPathname.replace(/\/+$/, "").split("/");
  let relativeSegments = relativePath.split("/");
  relativeSegments.forEach((segment) => {
    if (segment === "..") {
      if (segments.length > 1) segments.pop();
    } else if (segment !== ".") {
      segments.push(segment);
    }
  });
  return segments.length > 1 ? segments.join("/") : "/";
}
function getInvalidPathError(char, field, dest, path) {
  return "Cannot include a '" + char + "' character in a manually specified " + ("`to." + field + "` field [" + JSON.stringify(path) + "].  Please separate it out to the ") + ("`to." + dest + "` field. Alternatively you may provide the full path as ") + 'a string in <Link to="..."> and the router will parse it for you.';
}
function getPathContributingMatches(matches) {
  return matches.filter((match, index) => index === 0 || match.route.path && match.route.path.length > 0);
}
function getResolveToMatches(matches, v7_relativeSplatPath) {
  let pathMatches = getPathContributingMatches(matches);
  if (v7_relativeSplatPath) {
    return pathMatches.map((match, idx) => idx === pathMatches.length - 1 ? match.pathname : match.pathnameBase);
  }
  return pathMatches.map((match) => match.pathnameBase);
}
function resolveTo(toArg, routePathnames, locationPathname, isPathRelative) {
  if (isPathRelative === void 0) {
    isPathRelative = false;
  }
  let to;
  if (typeof toArg === "string") {
    to = parsePath(toArg);
  } else {
    to = _extends$2({}, toArg);
    invariant(!to.pathname || !to.pathname.includes("?"), getInvalidPathError("?", "pathname", "search", to));
    invariant(!to.pathname || !to.pathname.includes("#"), getInvalidPathError("#", "pathname", "hash", to));
    invariant(!to.search || !to.search.includes("#"), getInvalidPathError("#", "search", "hash", to));
  }
  let isEmptyPath = toArg === "" || to.pathname === "";
  let toPathname = isEmptyPath ? "/" : to.pathname;
  let from;
  if (toPathname == null) {
    from = locationPathname;
  } else {
    let routePathnameIndex = routePathnames.length - 1;
    if (!isPathRelative && toPathname.startsWith("..")) {
      let toSegments = toPathname.split("/");
      while (toSegments[0] === "..") {
        toSegments.shift();
        routePathnameIndex -= 1;
      }
      to.pathname = toSegments.join("/");
    }
    from = routePathnameIndex >= 0 ? routePathnames[routePathnameIndex] : "/";
  }
  let path = resolvePath(to, from);
  let hasExplicitTrailingSlash = toPathname && toPathname !== "/" && toPathname.endsWith("/");
  let hasCurrentTrailingSlash = (isEmptyPath || toPathname === ".") && locationPathname.endsWith("/");
  if (!path.pathname.endsWith("/") && (hasExplicitTrailingSlash || hasCurrentTrailingSlash)) {
    path.pathname += "/";
  }
  return path;
}
const removeDoubleSlashes = (path) => path.replace(/\/\/+/g, "/");
const joinPaths = (paths) => removeDoubleSlashes(paths.join("/"));
const normalizePathname = (pathname) => pathname.replace(/\/+$/, "").replace(/^\/*/, "/");
const normalizeSearch = (search) => !search || search === "?" ? "" : search.startsWith("?") ? search : "?" + search;
const normalizeHash = (hash) => !hash || hash === "#" ? "" : hash.startsWith("#") ? hash : "#" + hash;
function isRouteErrorResponse(error) {
  return error != null && typeof error.status === "number" && typeof error.statusText === "string" && typeof error.internal === "boolean" && "data" in error;
}
const validMutationMethodsArr = ["post", "put", "patch", "delete"];
new Set(validMutationMethodsArr);
const validRequestMethodsArr = ["get", ...validMutationMethodsArr];
new Set(validRequestMethodsArr);
/**
 * React Router v6.30.4
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */
function _extends$1() {
  return _extends$1 = Object.assign ? Object.assign.bind() : function(n2) {
    for (var e = 1; e < arguments.length; e++) {
      var t2 = arguments[e];
      for (var r2 in t2) ({}).hasOwnProperty.call(t2, r2) && (n2[r2] = t2[r2]);
    }
    return n2;
  }, _extends$1.apply(null, arguments);
}
const DataRouterContext = /* @__PURE__ */ reactExports.createContext(null);
const DataRouterStateContext = /* @__PURE__ */ reactExports.createContext(null);
const NavigationContext = /* @__PURE__ */ reactExports.createContext(null);
const LocationContext = /* @__PURE__ */ reactExports.createContext(null);
const RouteContext = /* @__PURE__ */ reactExports.createContext({
  outlet: null,
  matches: [],
  isDataRoute: false
});
const RouteErrorContext = /* @__PURE__ */ reactExports.createContext(null);
function useHref(to, _temp) {
  let {
    relative
  } = _temp === void 0 ? {} : _temp;
  !useInRouterContext() ? invariant(false) : void 0;
  let {
    basename,
    navigator: navigator2
  } = reactExports.useContext(NavigationContext);
  let {
    hash,
    pathname,
    search
  } = useResolvedPath(to, {
    relative
  });
  let joinedPathname = pathname;
  if (basename !== "/") {
    joinedPathname = pathname === "/" ? basename : joinPaths([basename, pathname]);
  }
  return navigator2.createHref({
    pathname: joinedPathname,
    search,
    hash
  });
}
function useInRouterContext() {
  return reactExports.useContext(LocationContext) != null;
}
function useLocation() {
  !useInRouterContext() ? invariant(false) : void 0;
  return reactExports.useContext(LocationContext).location;
}
function useIsomorphicLayoutEffect(cb2) {
  let isStatic = reactExports.useContext(NavigationContext).static;
  if (!isStatic) {
    reactExports.useLayoutEffect(cb2);
  }
}
function useNavigate() {
  let {
    isDataRoute
  } = reactExports.useContext(RouteContext);
  return isDataRoute ? useNavigateStable() : useNavigateUnstable();
}
function useNavigateUnstable() {
  !useInRouterContext() ? invariant(false) : void 0;
  let dataRouterContext = reactExports.useContext(DataRouterContext);
  let {
    basename,
    future,
    navigator: navigator2
  } = reactExports.useContext(NavigationContext);
  let {
    matches
  } = reactExports.useContext(RouteContext);
  let {
    pathname: locationPathname
  } = useLocation();
  let routePathnamesJson = JSON.stringify(getResolveToMatches(matches, future.v7_relativeSplatPath));
  let activeRef = reactExports.useRef(false);
  useIsomorphicLayoutEffect(() => {
    activeRef.current = true;
  });
  let navigate = reactExports.useCallback(function(to, options) {
    if (options === void 0) {
      options = {};
    }
    if (!activeRef.current) return;
    if (typeof to === "number") {
      navigator2.go(to);
      return;
    }
    let path = resolveTo(to, JSON.parse(routePathnamesJson), locationPathname, options.relative === "path");
    if (dataRouterContext == null && basename !== "/") {
      path.pathname = path.pathname === "/" ? basename : joinPaths([basename, path.pathname]);
    }
    (!!options.replace ? navigator2.replace : navigator2.push)(path, options.state, options);
  }, [basename, navigator2, routePathnamesJson, locationPathname, dataRouterContext]);
  return navigate;
}
const OutletContext = /* @__PURE__ */ reactExports.createContext(null);
function useOutlet(context) {
  let outlet = reactExports.useContext(RouteContext).outlet;
  if (outlet) {
    return /* @__PURE__ */ reactExports.createElement(OutletContext.Provider, {
      value: context
    }, outlet);
  }
  return outlet;
}
function useResolvedPath(to, _temp2) {
  let {
    relative
  } = _temp2 === void 0 ? {} : _temp2;
  let {
    future
  } = reactExports.useContext(NavigationContext);
  let {
    matches
  } = reactExports.useContext(RouteContext);
  let {
    pathname: locationPathname
  } = useLocation();
  let routePathnamesJson = JSON.stringify(getResolveToMatches(matches, future.v7_relativeSplatPath));
  return reactExports.useMemo(() => resolveTo(to, JSON.parse(routePathnamesJson), locationPathname, relative === "path"), [to, routePathnamesJson, locationPathname, relative]);
}
function useRoutes(routes, locationArg) {
  return useRoutesImpl(routes, locationArg);
}
function useRoutesImpl(routes, locationArg, dataRouterState, future) {
  !useInRouterContext() ? invariant(false) : void 0;
  let {
    navigator: navigator2
  } = reactExports.useContext(NavigationContext);
  let {
    matches: parentMatches
  } = reactExports.useContext(RouteContext);
  let routeMatch = parentMatches[parentMatches.length - 1];
  let parentParams = routeMatch ? routeMatch.params : {};
  routeMatch ? routeMatch.pathname : "/";
  let parentPathnameBase = routeMatch ? routeMatch.pathnameBase : "/";
  routeMatch && routeMatch.route;
  let locationFromContext = useLocation();
  let location;
  if (locationArg) {
    var _parsedLocationArg$pa;
    let parsedLocationArg = typeof locationArg === "string" ? parsePath(locationArg) : locationArg;
    !(parentPathnameBase === "/" || ((_parsedLocationArg$pa = parsedLocationArg.pathname) == null ? void 0 : _parsedLocationArg$pa.startsWith(parentPathnameBase))) ? invariant(false) : void 0;
    location = parsedLocationArg;
  } else {
    location = locationFromContext;
  }
  let pathname = location.pathname || "/";
  let remainingPathname = pathname;
  if (parentPathnameBase !== "/") {
    let parentSegments = parentPathnameBase.replace(/^\//, "").split("/");
    let segments = pathname.replace(/^\//, "").split("/");
    remainingPathname = "/" + segments.slice(parentSegments.length).join("/");
  }
  let matches = matchRoutes(routes, {
    pathname: remainingPathname
  });
  let renderedMatches = _renderMatches(matches && matches.map((match) => Object.assign({}, match, {
    params: Object.assign({}, parentParams, match.params),
    pathname: joinPaths([
      parentPathnameBase,
      // Re-encode pathnames that were decoded inside matchRoutes
      navigator2.encodeLocation ? navigator2.encodeLocation(match.pathname).pathname : match.pathname
    ]),
    pathnameBase: match.pathnameBase === "/" ? parentPathnameBase : joinPaths([
      parentPathnameBase,
      // Re-encode pathnames that were decoded inside matchRoutes
      navigator2.encodeLocation ? navigator2.encodeLocation(match.pathnameBase).pathname : match.pathnameBase
    ])
  })), parentMatches, dataRouterState, future);
  if (locationArg && renderedMatches) {
    return /* @__PURE__ */ reactExports.createElement(LocationContext.Provider, {
      value: {
        location: _extends$1({
          pathname: "/",
          search: "",
          hash: "",
          state: null,
          key: "default"
        }, location),
        navigationType: Action.Pop
      }
    }, renderedMatches);
  }
  return renderedMatches;
}
function DefaultErrorComponent() {
  let error = useRouteError();
  let message = isRouteErrorResponse(error) ? error.status + " " + error.statusText : error instanceof Error ? error.message : JSON.stringify(error);
  let stack = error instanceof Error ? error.stack : null;
  let lightgrey = "rgba(200,200,200, 0.5)";
  let preStyles = {
    padding: "0.5rem",
    backgroundColor: lightgrey
  };
  let devInfo = null;
  return /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("h2", null, "Unexpected Application Error!"), /* @__PURE__ */ reactExports.createElement("h3", {
    style: {
      fontStyle: "italic"
    }
  }, message), stack ? /* @__PURE__ */ reactExports.createElement("pre", {
    style: preStyles
  }, stack) : null, devInfo);
}
const defaultErrorElement = /* @__PURE__ */ reactExports.createElement(DefaultErrorComponent, null);
class RenderErrorBoundary extends reactExports.Component {
  constructor(props) {
    super(props);
    this.state = {
      location: props.location,
      revalidation: props.revalidation,
      error: props.error
    };
  }
  static getDerivedStateFromError(error) {
    return {
      error
    };
  }
  static getDerivedStateFromProps(props, state) {
    if (state.location !== props.location || state.revalidation !== "idle" && props.revalidation === "idle") {
      return {
        error: props.error,
        location: props.location,
        revalidation: props.revalidation
      };
    }
    return {
      error: props.error !== void 0 ? props.error : state.error,
      location: state.location,
      revalidation: props.revalidation || state.revalidation
    };
  }
  componentDidCatch(error, errorInfo) {
    console.error("React Router caught the following error during render", error, errorInfo);
  }
  render() {
    return this.state.error !== void 0 ? /* @__PURE__ */ reactExports.createElement(RouteContext.Provider, {
      value: this.props.routeContext
    }, /* @__PURE__ */ reactExports.createElement(RouteErrorContext.Provider, {
      value: this.state.error,
      children: this.props.component
    })) : this.props.children;
  }
}
function RenderedRoute(_ref) {
  let {
    routeContext,
    match,
    children
  } = _ref;
  let dataRouterContext = reactExports.useContext(DataRouterContext);
  if (dataRouterContext && dataRouterContext.static && dataRouterContext.staticContext && (match.route.errorElement || match.route.ErrorBoundary)) {
    dataRouterContext.staticContext._deepestRenderedBoundaryId = match.route.id;
  }
  return /* @__PURE__ */ reactExports.createElement(RouteContext.Provider, {
    value: routeContext
  }, children);
}
function _renderMatches(matches, parentMatches, dataRouterState, future) {
  var _dataRouterState;
  if (parentMatches === void 0) {
    parentMatches = [];
  }
  if (dataRouterState === void 0) {
    dataRouterState = null;
  }
  if (future === void 0) {
    future = null;
  }
  if (matches == null) {
    var _future;
    if (!dataRouterState) {
      return null;
    }
    if (dataRouterState.errors) {
      matches = dataRouterState.matches;
    } else if ((_future = future) != null && _future.v7_partialHydration && parentMatches.length === 0 && !dataRouterState.initialized && dataRouterState.matches.length > 0) {
      matches = dataRouterState.matches;
    } else {
      return null;
    }
  }
  let renderedMatches = matches;
  let errors = (_dataRouterState = dataRouterState) == null ? void 0 : _dataRouterState.errors;
  if (errors != null) {
    let errorIndex = renderedMatches.findIndex((m2) => m2.route.id && (errors == null ? void 0 : errors[m2.route.id]) !== void 0);
    !(errorIndex >= 0) ? invariant(false) : void 0;
    renderedMatches = renderedMatches.slice(0, Math.min(renderedMatches.length, errorIndex + 1));
  }
  let renderFallback = false;
  let fallbackIndex = -1;
  if (dataRouterState && future && future.v7_partialHydration) {
    for (let i = 0; i < renderedMatches.length; i++) {
      let match = renderedMatches[i];
      if (match.route.HydrateFallback || match.route.hydrateFallbackElement) {
        fallbackIndex = i;
      }
      if (match.route.id) {
        let {
          loaderData,
          errors: errors2
        } = dataRouterState;
        let needsToRunLoader = match.route.loader && loaderData[match.route.id] === void 0 && (!errors2 || errors2[match.route.id] === void 0);
        if (match.route.lazy || needsToRunLoader) {
          renderFallback = true;
          if (fallbackIndex >= 0) {
            renderedMatches = renderedMatches.slice(0, fallbackIndex + 1);
          } else {
            renderedMatches = [renderedMatches[0]];
          }
          break;
        }
      }
    }
  }
  return renderedMatches.reduceRight((outlet, match, index) => {
    let error;
    let shouldRenderHydrateFallback = false;
    let errorElement = null;
    let hydrateFallbackElement = null;
    if (dataRouterState) {
      error = errors && match.route.id ? errors[match.route.id] : void 0;
      errorElement = match.route.errorElement || defaultErrorElement;
      if (renderFallback) {
        if (fallbackIndex < 0 && index === 0) {
          warningOnce("route-fallback");
          shouldRenderHydrateFallback = true;
          hydrateFallbackElement = null;
        } else if (fallbackIndex === index) {
          shouldRenderHydrateFallback = true;
          hydrateFallbackElement = match.route.hydrateFallbackElement || null;
        }
      }
    }
    let matches2 = parentMatches.concat(renderedMatches.slice(0, index + 1));
    let getChildren = () => {
      let children;
      if (error) {
        children = errorElement;
      } else if (shouldRenderHydrateFallback) {
        children = hydrateFallbackElement;
      } else if (match.route.Component) {
        children = /* @__PURE__ */ reactExports.createElement(match.route.Component, null);
      } else if (match.route.element) {
        children = match.route.element;
      } else {
        children = outlet;
      }
      return /* @__PURE__ */ reactExports.createElement(RenderedRoute, {
        match,
        routeContext: {
          outlet,
          matches: matches2,
          isDataRoute: dataRouterState != null
        },
        children
      });
    };
    return dataRouterState && (match.route.ErrorBoundary || match.route.errorElement || index === 0) ? /* @__PURE__ */ reactExports.createElement(RenderErrorBoundary, {
      location: dataRouterState.location,
      revalidation: dataRouterState.revalidation,
      component: errorElement,
      error,
      children: getChildren(),
      routeContext: {
        outlet: null,
        matches: matches2,
        isDataRoute: true
      }
    }) : getChildren();
  }, null);
}
var DataRouterHook$1 = /* @__PURE__ */ function(DataRouterHook2) {
  DataRouterHook2["UseBlocker"] = "useBlocker";
  DataRouterHook2["UseRevalidator"] = "useRevalidator";
  DataRouterHook2["UseNavigateStable"] = "useNavigate";
  return DataRouterHook2;
}(DataRouterHook$1 || {});
var DataRouterStateHook$1 = /* @__PURE__ */ function(DataRouterStateHook2) {
  DataRouterStateHook2["UseBlocker"] = "useBlocker";
  DataRouterStateHook2["UseLoaderData"] = "useLoaderData";
  DataRouterStateHook2["UseActionData"] = "useActionData";
  DataRouterStateHook2["UseRouteError"] = "useRouteError";
  DataRouterStateHook2["UseNavigation"] = "useNavigation";
  DataRouterStateHook2["UseRouteLoaderData"] = "useRouteLoaderData";
  DataRouterStateHook2["UseMatches"] = "useMatches";
  DataRouterStateHook2["UseRevalidator"] = "useRevalidator";
  DataRouterStateHook2["UseNavigateStable"] = "useNavigate";
  DataRouterStateHook2["UseRouteId"] = "useRouteId";
  return DataRouterStateHook2;
}(DataRouterStateHook$1 || {});
function useDataRouterContext$1(hookName) {
  let ctx = reactExports.useContext(DataRouterContext);
  !ctx ? invariant(false) : void 0;
  return ctx;
}
function useDataRouterState(hookName) {
  let state = reactExports.useContext(DataRouterStateContext);
  !state ? invariant(false) : void 0;
  return state;
}
function useRouteContext(hookName) {
  let route = reactExports.useContext(RouteContext);
  !route ? invariant(false) : void 0;
  return route;
}
function useCurrentRouteId(hookName) {
  let route = useRouteContext();
  let thisRoute = route.matches[route.matches.length - 1];
  !thisRoute.route.id ? invariant(false) : void 0;
  return thisRoute.route.id;
}
function useRouteError() {
  var _state$errors;
  let error = reactExports.useContext(RouteErrorContext);
  let state = useDataRouterState();
  let routeId = useCurrentRouteId();
  if (error !== void 0) {
    return error;
  }
  return (_state$errors = state.errors) == null ? void 0 : _state$errors[routeId];
}
function useNavigateStable() {
  let {
    router
  } = useDataRouterContext$1(DataRouterHook$1.UseNavigateStable);
  let id2 = useCurrentRouteId(DataRouterStateHook$1.UseNavigateStable);
  let activeRef = reactExports.useRef(false);
  useIsomorphicLayoutEffect(() => {
    activeRef.current = true;
  });
  let navigate = reactExports.useCallback(function(to, options) {
    if (options === void 0) {
      options = {};
    }
    if (!activeRef.current) return;
    if (typeof to === "number") {
      router.navigate(to);
    } else {
      router.navigate(to, _extends$1({
        fromRouteId: id2
      }, options));
    }
  }, [router, id2]);
  return navigate;
}
const alreadyWarned$1 = {};
function warningOnce(key, cond, message) {
  if (!alreadyWarned$1[key]) {
    alreadyWarned$1[key] = true;
  }
}
function logV6DeprecationWarnings(renderFuture, routerFuture) {
  if ((renderFuture == null ? void 0 : renderFuture.v7_startTransition) === void 0) ;
  if ((renderFuture == null ? void 0 : renderFuture.v7_relativeSplatPath) === void 0 && true) ;
}
function Navigate(_ref4) {
  let {
    to,
    replace: replace2,
    state,
    relative
  } = _ref4;
  !useInRouterContext() ? invariant(false) : void 0;
  let {
    future,
    static: isStatic
  } = reactExports.useContext(NavigationContext);
  let {
    matches
  } = reactExports.useContext(RouteContext);
  let {
    pathname: locationPathname
  } = useLocation();
  let navigate = useNavigate();
  let path = resolveTo(to, getResolveToMatches(matches, future.v7_relativeSplatPath), locationPathname, relative === "path");
  let jsonPath = JSON.stringify(path);
  reactExports.useEffect(() => navigate(JSON.parse(jsonPath), {
    replace: replace2,
    state,
    relative
  }), [navigate, jsonPath, relative, replace2, state]);
  return null;
}
function Outlet(props) {
  return useOutlet(props.context);
}
function Route(_props) {
  invariant(false);
}
function Router(_ref5) {
  let {
    basename: basenameProp = "/",
    children = null,
    location: locationProp,
    navigationType = Action.Pop,
    navigator: navigator2,
    static: staticProp = false,
    future
  } = _ref5;
  !!useInRouterContext() ? invariant(false) : void 0;
  let basename = basenameProp.replace(/^\/*/, "/");
  let navigationContext = reactExports.useMemo(() => ({
    basename,
    navigator: navigator2,
    static: staticProp,
    future: _extends$1({
      v7_relativeSplatPath: false
    }, future)
  }), [basename, future, navigator2, staticProp]);
  if (typeof locationProp === "string") {
    locationProp = parsePath(locationProp);
  }
  let {
    pathname = "/",
    search = "",
    hash = "",
    state = null,
    key = "default"
  } = locationProp;
  let locationContext = reactExports.useMemo(() => {
    let trailingPathname = stripBasename(pathname, basename);
    if (trailingPathname == null) {
      return null;
    }
    return {
      location: {
        pathname: trailingPathname,
        search,
        hash,
        state,
        key
      },
      navigationType
    };
  }, [basename, pathname, search, hash, state, key, navigationType]);
  if (locationContext == null) {
    return null;
  }
  return /* @__PURE__ */ reactExports.createElement(NavigationContext.Provider, {
    value: navigationContext
  }, /* @__PURE__ */ reactExports.createElement(LocationContext.Provider, {
    children,
    value: locationContext
  }));
}
function Routes(_ref6) {
  let {
    children,
    location
  } = _ref6;
  return useRoutes(createRoutesFromChildren(children), location);
}
new Promise(() => {
});
function createRoutesFromChildren(children, parentPath) {
  if (parentPath === void 0) {
    parentPath = [];
  }
  let routes = [];
  reactExports.Children.forEach(children, (element, index) => {
    if (!/* @__PURE__ */ reactExports.isValidElement(element)) {
      return;
    }
    let treePath = [...parentPath, index];
    if (element.type === reactExports.Fragment) {
      routes.push.apply(routes, createRoutesFromChildren(element.props.children, treePath));
      return;
    }
    !(element.type === Route) ? invariant(false) : void 0;
    !(!element.props.index || !element.props.children) ? invariant(false) : void 0;
    let route = {
      id: element.props.id || treePath.join("-"),
      caseSensitive: element.props.caseSensitive,
      element: element.props.element,
      Component: element.props.Component,
      index: element.props.index,
      path: element.props.path,
      loader: element.props.loader,
      action: element.props.action,
      errorElement: element.props.errorElement,
      ErrorBoundary: element.props.ErrorBoundary,
      hasErrorBoundary: element.props.ErrorBoundary != null || element.props.errorElement != null,
      shouldRevalidate: element.props.shouldRevalidate,
      handle: element.props.handle,
      lazy: element.props.lazy
    };
    if (element.props.children) {
      route.children = createRoutesFromChildren(element.props.children, treePath);
    }
    routes.push(route);
  });
  return routes;
}
/**
 * React Router DOM v6.30.4
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */
function _extends() {
  return _extends = Object.assign ? Object.assign.bind() : function(n2) {
    for (var e = 1; e < arguments.length; e++) {
      var t2 = arguments[e];
      for (var r2 in t2) ({}).hasOwnProperty.call(t2, r2) && (n2[r2] = t2[r2]);
    }
    return n2;
  }, _extends.apply(null, arguments);
}
function _objectWithoutPropertiesLoose(r2, e) {
  if (null == r2) return {};
  var t2 = {};
  for (var n2 in r2) if ({}.hasOwnProperty.call(r2, n2)) {
    if (-1 !== e.indexOf(n2)) continue;
    t2[n2] = r2[n2];
  }
  return t2;
}
function isModifiedEvent(event) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}
function shouldProcessLinkClick(event, target) {
  return event.button === 0 && // Ignore everything but left clicks
  (!target || target === "_self") && // Let browser handle "target=_blank" etc.
  !isModifiedEvent(event);
}
function createSearchParams(init) {
  if (init === void 0) {
    init = "";
  }
  return new URLSearchParams(typeof init === "string" || Array.isArray(init) || init instanceof URLSearchParams ? init : Object.keys(init).reduce((memo, key) => {
    let value = init[key];
    return memo.concat(Array.isArray(value) ? value.map((v2) => [key, v2]) : [[key, value]]);
  }, []));
}
function getSearchParamsForLocation(locationSearch, defaultSearchParams) {
  let searchParams = createSearchParams(locationSearch);
  if (defaultSearchParams) {
    defaultSearchParams.forEach((_, key) => {
      if (!searchParams.has(key)) {
        defaultSearchParams.getAll(key).forEach((value) => {
          searchParams.append(key, value);
        });
      }
    });
  }
  return searchParams;
}
const _excluded = ["onClick", "relative", "reloadDocument", "replace", "state", "target", "to", "preventScrollReset", "viewTransition"], _excluded2 = ["aria-current", "caseSensitive", "className", "end", "style", "to", "viewTransition", "children"];
const REACT_ROUTER_VERSION = "6";
try {
  window.__reactRouterVersion = REACT_ROUTER_VERSION;
} catch (e) {
}
const ViewTransitionContext = /* @__PURE__ */ reactExports.createContext({
  isTransitioning: false
});
const START_TRANSITION = "startTransition";
const startTransitionImpl = React$3[START_TRANSITION];
function HashRouter(_ref5) {
  let {
    basename,
    children,
    future,
    window: window2
  } = _ref5;
  let historyRef = reactExports.useRef();
  if (historyRef.current == null) {
    historyRef.current = createHashHistory({
      window: window2,
      v5Compat: true
    });
  }
  let history = historyRef.current;
  let [state, setStateImpl] = reactExports.useState({
    action: history.action,
    location: history.location
  });
  let {
    v7_startTransition
  } = future || {};
  let setState = reactExports.useCallback((newState) => {
    v7_startTransition && startTransitionImpl ? startTransitionImpl(() => setStateImpl(newState)) : setStateImpl(newState);
  }, [setStateImpl, v7_startTransition]);
  reactExports.useLayoutEffect(() => history.listen(setState), [history, setState]);
  reactExports.useEffect(() => logV6DeprecationWarnings(future), [future]);
  return /* @__PURE__ */ reactExports.createElement(Router, {
    basename,
    children,
    location: state.location,
    navigationType: state.action,
    navigator: history,
    future
  });
}
const isBrowser = typeof window !== "undefined" && typeof window.document !== "undefined" && typeof window.document.createElement !== "undefined";
const ABSOLUTE_URL_REGEX = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;
const Link = /* @__PURE__ */ reactExports.forwardRef(function LinkWithRef(_ref7, ref) {
  let {
    onClick,
    relative,
    reloadDocument,
    replace: replace2,
    state,
    target,
    to,
    preventScrollReset,
    viewTransition
  } = _ref7, rest = _objectWithoutPropertiesLoose(_ref7, _excluded);
  let {
    basename
  } = reactExports.useContext(NavigationContext);
  let absoluteHref;
  let isExternal = false;
  if (typeof to === "string" && ABSOLUTE_URL_REGEX.test(to)) {
    absoluteHref = to;
    if (isBrowser) {
      try {
        let currentUrl = new URL(window.location.href);
        let targetUrl = to.startsWith("//") ? new URL(currentUrl.protocol + to) : new URL(to);
        let path = stripBasename(targetUrl.pathname, basename);
        if (targetUrl.origin === currentUrl.origin && path != null) {
          to = path + targetUrl.search + targetUrl.hash;
        } else {
          isExternal = true;
        }
      } catch (e) {
      }
    }
  }
  let href = useHref(to, {
    relative
  });
  let internalOnClick = useLinkClickHandler(to, {
    replace: replace2,
    state,
    target,
    preventScrollReset,
    relative,
    viewTransition
  });
  function handleClick(event) {
    if (onClick) onClick(event);
    if (!event.defaultPrevented) {
      internalOnClick(event);
    }
  }
  return (
    // eslint-disable-next-line jsx-a11y/anchor-has-content
    /* @__PURE__ */ reactExports.createElement("a", _extends({}, rest, {
      href: absoluteHref || href,
      onClick: isExternal || reloadDocument ? onClick : handleClick,
      ref,
      target
    }))
  );
});
const NavLink = /* @__PURE__ */ reactExports.forwardRef(function NavLinkWithRef(_ref8, ref) {
  let {
    "aria-current": ariaCurrentProp = "page",
    caseSensitive = false,
    className: classNameProp = "",
    end = false,
    style: styleProp,
    to,
    viewTransition,
    children
  } = _ref8, rest = _objectWithoutPropertiesLoose(_ref8, _excluded2);
  let path = useResolvedPath(to, {
    relative: rest.relative
  });
  let location = useLocation();
  let routerState = reactExports.useContext(DataRouterStateContext);
  let {
    navigator: navigator2,
    basename
  } = reactExports.useContext(NavigationContext);
  let isTransitioning = routerState != null && // Conditional usage is OK here because the usage of a data router is static
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useViewTransitionState(path) && viewTransition === true;
  let toPathname = navigator2.encodeLocation ? navigator2.encodeLocation(path).pathname : path.pathname;
  let locationPathname = location.pathname;
  let nextLocationPathname = routerState && routerState.navigation && routerState.navigation.location ? routerState.navigation.location.pathname : null;
  if (!caseSensitive) {
    locationPathname = locationPathname.toLowerCase();
    nextLocationPathname = nextLocationPathname ? nextLocationPathname.toLowerCase() : null;
    toPathname = toPathname.toLowerCase();
  }
  if (nextLocationPathname && basename) {
    nextLocationPathname = stripBasename(nextLocationPathname, basename) || nextLocationPathname;
  }
  const endSlashPosition = toPathname !== "/" && toPathname.endsWith("/") ? toPathname.length - 1 : toPathname.length;
  let isActive = locationPathname === toPathname || !end && locationPathname.startsWith(toPathname) && locationPathname.charAt(endSlashPosition) === "/";
  let isPending = nextLocationPathname != null && (nextLocationPathname === toPathname || !end && nextLocationPathname.startsWith(toPathname) && nextLocationPathname.charAt(toPathname.length) === "/");
  let renderProps = {
    isActive,
    isPending,
    isTransitioning
  };
  let ariaCurrent = isActive ? ariaCurrentProp : void 0;
  let className;
  if (typeof classNameProp === "function") {
    className = classNameProp(renderProps);
  } else {
    className = [classNameProp, isActive ? "active" : null, isPending ? "pending" : null, isTransitioning ? "transitioning" : null].filter(Boolean).join(" ");
  }
  let style = typeof styleProp === "function" ? styleProp(renderProps) : styleProp;
  return /* @__PURE__ */ reactExports.createElement(Link, _extends({}, rest, {
    "aria-current": ariaCurrent,
    className,
    ref,
    style,
    to,
    viewTransition
  }), typeof children === "function" ? children(renderProps) : children);
});
var DataRouterHook;
(function(DataRouterHook2) {
  DataRouterHook2["UseScrollRestoration"] = "useScrollRestoration";
  DataRouterHook2["UseSubmit"] = "useSubmit";
  DataRouterHook2["UseSubmitFetcher"] = "useSubmitFetcher";
  DataRouterHook2["UseFetcher"] = "useFetcher";
  DataRouterHook2["useViewTransitionState"] = "useViewTransitionState";
})(DataRouterHook || (DataRouterHook = {}));
var DataRouterStateHook;
(function(DataRouterStateHook2) {
  DataRouterStateHook2["UseFetcher"] = "useFetcher";
  DataRouterStateHook2["UseFetchers"] = "useFetchers";
  DataRouterStateHook2["UseScrollRestoration"] = "useScrollRestoration";
})(DataRouterStateHook || (DataRouterStateHook = {}));
function useDataRouterContext(hookName) {
  let ctx = reactExports.useContext(DataRouterContext);
  !ctx ? invariant(false) : void 0;
  return ctx;
}
function useLinkClickHandler(to, _temp) {
  let {
    target,
    replace: replaceProp,
    state,
    preventScrollReset,
    relative,
    viewTransition
  } = _temp === void 0 ? {} : _temp;
  let navigate = useNavigate();
  let location = useLocation();
  let path = useResolvedPath(to, {
    relative
  });
  return reactExports.useCallback((event) => {
    if (shouldProcessLinkClick(event, target)) {
      event.preventDefault();
      let replace2 = replaceProp !== void 0 ? replaceProp : createPath(location) === createPath(path);
      navigate(to, {
        replace: replace2,
        state,
        preventScrollReset,
        relative,
        viewTransition
      });
    }
  }, [location, navigate, path, replaceProp, state, target, to, preventScrollReset, relative, viewTransition]);
}
function useSearchParams(defaultInit) {
  let defaultSearchParamsRef = reactExports.useRef(createSearchParams(defaultInit));
  let hasSetSearchParamsRef = reactExports.useRef(false);
  let location = useLocation();
  let searchParams = reactExports.useMemo(() => (
    // Only merge in the defaults if we haven't yet called setSearchParams.
    // Once we call that we want those to take precedence, otherwise you can't
    // remove a param with setSearchParams({}) if it has an initial value
    getSearchParamsForLocation(location.search, hasSetSearchParamsRef.current ? null : defaultSearchParamsRef.current)
  ), [location.search]);
  let navigate = useNavigate();
  let setSearchParams = reactExports.useCallback((nextInit, navigateOptions) => {
    const newSearchParams = createSearchParams(typeof nextInit === "function" ? nextInit(searchParams) : nextInit);
    hasSetSearchParamsRef.current = true;
    navigate("?" + newSearchParams, navigateOptions);
  }, [navigate, searchParams]);
  return [searchParams, setSearchParams];
}
function useViewTransitionState(to, opts) {
  if (opts === void 0) {
    opts = {};
  }
  let vtContext = reactExports.useContext(ViewTransitionContext);
  !(vtContext != null) ? invariant(false) : void 0;
  let {
    basename
  } = useDataRouterContext(DataRouterHook.useViewTransitionState);
  let path = useResolvedPath(to, {
    relative: opts.relative
  });
  if (!vtContext.isTransitioning) {
    return false;
  }
  let currentPath = stripBasename(vtContext.currentLocation.pathname, basename) || vtContext.currentLocation.pathname;
  let nextPath = stripBasename(vtContext.nextLocation.pathname, basename) || vtContext.nextLocation.pathname;
  return matchPath(path.pathname, nextPath) != null || matchPath(path.pathname, currentPath) != null;
}
const __vite_import_meta_env__$1 = {};
const createStoreImpl = (createState) => {
  let state;
  const listeners = /* @__PURE__ */ new Set();
  const setState = (partial, replace) => {
    const nextState = typeof partial === "function" ? partial(state) : partial;
    if (!Object.is(nextState, state)) {
      const previousState = state;
      state = (replace != null ? replace : typeof nextState !== "object" || nextState === null) ? nextState : Object.assign({}, state, nextState);
      listeners.forEach((listener) => listener(state, previousState));
    }
  };
  const getState = () => state;
  const getInitialState = () => initialState;
  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };
  const destroy = () => {
    if ((__vite_import_meta_env__$1 ? "production" : void 0) !== "production") {
      console.warn(
        "[DEPRECATED] The `destroy` method will be unsupported in a future version. Instead use unsubscribe function returned by subscribe. Everything will be garbage-collected if store is garbage-collected."
      );
    }
    listeners.clear();
  };
  const api = { setState, getState, getInitialState, subscribe, destroy };
  const initialState = state = createState(setState, getState, api);
  return api;
};
const createStore = (createState) => createState ? createStoreImpl(createState) : createStoreImpl;
var withSelector = { exports: {} };
var withSelector_production = {};
var shim$2 = { exports: {} };
var useSyncExternalStoreShim_production = {};
/**
 * @license React
 * use-sync-external-store-shim.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React$1 = reactExports;
function is$1(x2, y2) {
  return x2 === y2 && (0 !== x2 || 1 / x2 === 1 / y2) || x2 !== x2 && y2 !== y2;
}
var objectIs$1 = "function" === typeof Object.is ? Object.is : is$1, useState = React$1.useState, useEffect$1 = React$1.useEffect, useLayoutEffect = React$1.useLayoutEffect, useDebugValue$2 = React$1.useDebugValue;
function useSyncExternalStore$2(subscribe, getSnapshot) {
  var value = getSnapshot(), _useState = useState({ inst: { value, getSnapshot } }), inst = _useState[0].inst, forceUpdate = _useState[1];
  useLayoutEffect(
    function() {
      inst.value = value;
      inst.getSnapshot = getSnapshot;
      checkIfSnapshotChanged(inst) && forceUpdate({ inst });
    },
    [subscribe, value, getSnapshot]
  );
  useEffect$1(
    function() {
      checkIfSnapshotChanged(inst) && forceUpdate({ inst });
      return subscribe(function() {
        checkIfSnapshotChanged(inst) && forceUpdate({ inst });
      });
    },
    [subscribe]
  );
  useDebugValue$2(value);
  return value;
}
function checkIfSnapshotChanged(inst) {
  var latestGetSnapshot = inst.getSnapshot;
  inst = inst.value;
  try {
    var nextValue = latestGetSnapshot();
    return !objectIs$1(inst, nextValue);
  } catch (error) {
    return true;
  }
}
function useSyncExternalStore$1(subscribe, getSnapshot) {
  return getSnapshot();
}
var shim$1 = "undefined" === typeof window || "undefined" === typeof window.document || "undefined" === typeof window.document.createElement ? useSyncExternalStore$1 : useSyncExternalStore$2;
useSyncExternalStoreShim_production.useSyncExternalStore = void 0 !== React$1.useSyncExternalStore ? React$1.useSyncExternalStore : shim$1;
{
  shim$2.exports = useSyncExternalStoreShim_production;
}
var shimExports = shim$2.exports;
/**
 * @license React
 * use-sync-external-store-shim/with-selector.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = reactExports, shim = shimExports;
function is(x2, y2) {
  return x2 === y2 && (0 !== x2 || 1 / x2 === 1 / y2) || x2 !== x2 && y2 !== y2;
}
var objectIs = "function" === typeof Object.is ? Object.is : is, useSyncExternalStore = shim.useSyncExternalStore, useRef = React.useRef, useEffect = React.useEffect, useMemo = React.useMemo, useDebugValue$1 = React.useDebugValue;
withSelector_production.useSyncExternalStoreWithSelector = function(subscribe, getSnapshot, getServerSnapshot, selector, isEqual) {
  var instRef = useRef(null);
  if (null === instRef.current) {
    var inst = { hasValue: false, value: null };
    instRef.current = inst;
  } else inst = instRef.current;
  instRef = useMemo(
    function() {
      function memoizedSelector(nextSnapshot) {
        if (!hasMemo) {
          hasMemo = true;
          memoizedSnapshot = nextSnapshot;
          nextSnapshot = selector(nextSnapshot);
          if (void 0 !== isEqual && inst.hasValue) {
            var currentSelection = inst.value;
            if (isEqual(currentSelection, nextSnapshot))
              return memoizedSelection = currentSelection;
          }
          return memoizedSelection = nextSnapshot;
        }
        currentSelection = memoizedSelection;
        if (objectIs(memoizedSnapshot, nextSnapshot)) return currentSelection;
        var nextSelection = selector(nextSnapshot);
        if (void 0 !== isEqual && isEqual(currentSelection, nextSelection))
          return memoizedSnapshot = nextSnapshot, currentSelection;
        memoizedSnapshot = nextSnapshot;
        return memoizedSelection = nextSelection;
      }
      var hasMemo = false, memoizedSnapshot, memoizedSelection, maybeGetServerSnapshot = void 0 === getServerSnapshot ? null : getServerSnapshot;
      return [
        function() {
          return memoizedSelector(getSnapshot());
        },
        null === maybeGetServerSnapshot ? void 0 : function() {
          return memoizedSelector(maybeGetServerSnapshot());
        }
      ];
    },
    [getSnapshot, getServerSnapshot, selector, isEqual]
  );
  var value = useSyncExternalStore(subscribe, instRef[0], instRef[1]);
  useEffect(
    function() {
      inst.hasValue = true;
      inst.value = value;
    },
    [value]
  );
  useDebugValue$1(value);
  return value;
};
{
  withSelector.exports = withSelector_production;
}
var withSelectorExports = withSelector.exports;
const useSyncExternalStoreExports = /* @__PURE__ */ getDefaultExportFromCjs(withSelectorExports);
const __vite_import_meta_env__ = {};
const { useDebugValue } = React$2;
const { useSyncExternalStoreWithSelector } = useSyncExternalStoreExports;
let didWarnAboutEqualityFn = false;
const identity = (arg) => arg;
function useStore(api, selector = identity, equalityFn) {
  if ((__vite_import_meta_env__ ? "production" : void 0) !== "production" && equalityFn && !didWarnAboutEqualityFn) {
    console.warn(
      "[DEPRECATED] Use `createWithEqualityFn` instead of `create` or use `useStoreWithEqualityFn` instead of `useStore`. They can be imported from 'zustand/traditional'. https://github.com/pmndrs/zustand/discussions/1937"
    );
    didWarnAboutEqualityFn = true;
  }
  const slice = useSyncExternalStoreWithSelector(
    api.subscribe,
    api.getState,
    api.getServerState || api.getInitialState,
    selector,
    equalityFn
  );
  useDebugValue(slice);
  return slice;
}
const createImpl = (createState) => {
  if ((__vite_import_meta_env__ ? "production" : void 0) !== "production" && typeof createState !== "function") {
    console.warn(
      "[DEPRECATED] Passing a vanilla store will be unsupported in a future version. Instead use `import { useStore } from 'zustand'`."
    );
  }
  const api = typeof createState === "function" ? createStore(createState) : createState;
  const useBoundStore = (selector, equalityFn) => useStore(api, selector, equalityFn);
  Object.assign(useBoundStore, api);
  return useBoundStore;
};
const create = (createState) => createState ? createImpl(createState) : createImpl;
const useAuthStore = create((set, get) => ({
  session: null,
  setSession: (session) => set({ session }),
  hasPermission: (permission) => get().session?.permissions.includes(permission) ?? false
}));
async function call(channel, payload) {
  if (window.api) {
    const response2 = await window.api.invoke(
      channel,
      payload
    );
    if (!response2.ok) {
      throw new Error(
        response2.message ?? "Something went wrong. Please try again."
      );
    }
    return response2.data;
  }
  const response = await fetch("/rpc", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify({
      channel,
      payload
    })
  });
  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error(
      `Server returned an invalid response (${response.status}).`
    );
  }
  if (!response.ok || !result.ok) {
    throw new Error(
      result.message ?? "Something went wrong. Please try again."
    );
  }
  return result.data;
}
let nextId = 1;
const useToastStore = create((set) => ({
  toasts: [],
  push: (message, variant = "info") => {
    const id2 = nextId++;
    set((s) => ({ toasts: [...s.toasts, { id: id2, message, variant }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t2) => t2.id !== id2) })), 4e3);
  },
  dismiss: (id2) => set((s) => ({ toasts: s.toasts.filter((t2) => t2.id !== id2) }))
}));
const translations = {
  en: {
    dashboard: "Dashboard",
    pos: "POS",
    sales: "Sales",
    products: "Products",
    categories: "Categories",
    inventory: "Inventory",
    suppliers: "Suppliers",
    supplierReturns: "Supplier Returns",
    purchases: "Purchases",
    customers: "Customers",
    membership: "Membership",
    returns: "Returns",
    employees: "Employees",
    expensesLabel: "Expenses",
    cashManagement: "Cash Management",
    reports: "Reports",
    notifications: "Notifications",
    settings: "Settings & Backup",
    liveOperationsCenter: "Live Operations Center",
    welcomeBack: "Welcome back, Torki Bazar",
    heroSubtitle: "Real-time performance metrics, inventory health, and revenue analytics — refined for the day ahead.",
    filterPeriod: "Filter Period",
    today: "Today",
    last7Days: "Last 7 Days",
    thisMonth: "This Month",
    thisQuarter: "This Quarter",
    thisYear: "This Year",
    customRange: "Custom Range",
    fromDate: "From Date",
    toDate: "To Date",
    activeMode: "Active mode",
    coreRevenue: "Core Revenue",
    salesAndProfitOverview: "Sales & Profit Overview",
    totalRevenueSales: "TOTAL REVENUE / SALES",
    accumulatedForToday: "Accumulated for today",
    verifiedPosTransactions: "Verified POS transactions",
    grossProfitYield: "Gross Profit Yield",
    grossProfitMargin: "GROSS PROFIT MARGIN",
    netReturnAfterCogs: "Net return after deducting COGS",
    cogs: "COGS",
    fullyTracked: "100% Fully Tracked",
    ledgerAndAccounts: "Ledger & Accounts",
    financialBreakdowns: "Financial Breakdowns",
    supplierPayables: "Supplier Payables",
    customerReceivables: "Customer Receivables",
    codPending: "COD Pending",
    inventoryExpenses: "Inventory Expenses",
    directory: "Directory",
    customerAndSupplierBase: "Customer & Supplier Base",
    totalCustomers: "Total Customers",
    activeMembers: "Active Members",
    activeSuppliers: "Active Suppliers",
    stockActions: "Stock Actions",
    attentionRequired: "Attention Required",
    urgentAlerts: "Urgent Alert",
    lowStockWarning: "Low Stock Warning",
    productsBelowThreshold: "products below safety threshold",
    expiringSoon: "Expiring Soon",
    batchesNearingExpiry: "batches nearing expiry date",
    expiredBatches: "Expired Batches",
    batchesAlreadyExpired: "batches already expired",
    systemHealth: "System Health",
    operationalStatus: "Operational Status",
    allSystemsOptimal: "All Systems Optimal",
    retailManagementSystem: "Retail Management System & POS Core",
    displayingMetricsFor: "Displaying metrics for"
  },
  bn: {
    dashboard: "ড্যাশবোর্ড",
    pos: "পিওএস",
    sales: "বিক্রয়",
    products: "পণ্য",
    categories: "ক্যাটেগরি",
    inventory: "ইনভেন্টরি",
    suppliers: "সরবরাহকারী",
    supplierReturns: "সরবরাহকারী ফেরত",
    purchases: "ক্রয়",
    customers: "গ্রাহক",
    membership: "সদস্যপদ",
    returns: "ফেরত",
    employees: "কর্মচারী",
    expensesLabel: "খরচ",
    cashManagement: "ক্যাশ ম্যানেজমেন্ট",
    reports: "রিপোর্ট",
    notifications: "নোটিফিকেশন",
    settings: "সেটিংস ও ব্যাকআপ",
    liveOperationsCenter: "লাইভ অপারেশনস সেন্টার",
    welcomeBack: "স্বাগতম, তর্কি বাজার",
    heroSubtitle: "রিয়েল-টাইম পারফরম্যান্স মেট্রিক্স, ইনভেন্টরি স্বাস্থ্য এবং রেভিনিউ অ্যানালিটিক্স।",
    filterPeriod: "ফিল্টার সময়কাল",
    today: "আজ",
    last7Days: "গত ৭ দিন",
    thisMonth: "এই মাস",
    thisQuarter: "এই ত্রৈমাসিক",
    thisYear: "এই বছর",
    customRange: "কাস্টম রেঞ্জ",
    fromDate: "শুরুর তারিখ",
    toDate: "শেষ তারিখ",
    activeMode: "সক্রিয় মোড",
    coreRevenue: "মূল রেভিনিউ",
    salesAndProfitOverview: "বিক্রয় ও লাভ ওভারভিউ",
    totalRevenueSales: "মোট রেভিনিউ / বিক্রয়",
    accumulatedForToday: "আজকের জন্য জমা হয়েছে",
    verifiedPosTransactions: "যাচাইকৃত পিওএস লেনদেন",
    grossProfitYield: "মোট লাভ ফলন",
    grossProfitMargin: "মোট লাভ মার্জিন",
    netReturnAfterCogs: "সিওজিএস বাদ দেওয়ার পর নিট রিটার্ন",
    cogs: "সিওজিএস",
    fullyTracked: "১০০% সম্পূর্ণ ট্র্যাক করা হয়েছে",
    ledgerAndAccounts: "লেজার ও অ্যাকাউন্টস",
    financialBreakdowns: "আর্থিক বিবরণ",
    supplierPayables: "সরবরাহকারী পাওনা",
    customerReceivables: "গ্রাহক পাওনা",
    codPending: "সিওডি অপেক্ষমাণ",
    inventoryExpenses: "ইনভেন্টরি খরচ",
    directory: "ডিরেক্টরি",
    customerAndSupplierBase: "গ্রাহক ও সরবরাহকারী বেস",
    totalCustomers: "মোট গ্রাহক",
    activeMembers: "সক্রিয় সদস্য",
    activeSuppliers: "সক্রিয় সরবরাহকারী",
    stockActions: "স্টক অ্যাকশন",
    attentionRequired: "মনোযোগ প্রয়োজন",
    urgentAlerts: "জরুরি সতর্কতা",
    lowStockWarning: "কম স্টক সতর্কতা",
    productsBelowThreshold: "নিরাপদ সীমার নিচে পণ্য",
    expiringSoon: "শীঘ্রই মেয়াদোত্তীর্ণ হবে",
    batchesNearingExpiry: "মেয়াদ শেষের কাছাকাছি ব্যাচ",
    expiredBatches: "মেয়াদোত্তীর্ণ ব্যাচ",
    batchesAlreadyExpired: "ইতিমধ্যে মেয়াদোত্তীর্ণ ব্যাচ",
    systemHealth: "সিস্টেম স্বাস্থ্য",
    operationalStatus: "অপারেটিং স্ট্যাটাস",
    allSystemsOptimal: "সমস্ত সিস্টেম অপ্টিমাল",
    retailManagementSystem: "রিটেল ম্যানেজমেন্ট সিস্টেম এবং POS কোর",
    displayingMetricsFor: "মেট্রিক্স প্রদর্শিত হচ্ছে:"
  }
};
const bnDigits = {
  "0": "০",
  "1": "১",
  "2": "২",
  "3": "৩",
  "4": "৪",
  "5": "৫",
  "6": "৬",
  "7": "৭",
  "8": "৮",
  "9": "৯"
};
const useLanguageStore = create((set, get) => ({
  lang: "en",
  setLang: (lang) => set({ lang }),
  toggleLang: () => set({
    lang: get().lang === "en" ? "bn" : "en"
  }),
  t: (key) => {
    const currentLang = get().lang;
    return translations[currentLang]?.[key] || key;
  },
  n: (num) => {
    if (num === void 0 || num === null) return "";
    const str = String(num);
    if (get().lang !== "bn") return str;
    return str.replace(
      /[0-9]/g,
      (digit) => bnDigits[digit] || digit
    );
  }
}));
const NAV_ITEMS = [
  { to: "/", labelKey: "dashboard", icon: "📊", end: true },
  { to: "/pos", labelKey: "pos", icon: "🧾" },
  { to: "/sales", labelKey: "sales", icon: "💵" },
  { to: "/products", labelKey: "products", icon: "📦" },
  { to: "/categories", labelKey: "categories", icon: "🗂️" },
  { to: "/inventory", labelKey: "inventory", icon: "📈" },
  { to: "/suppliers", labelKey: "suppliers", icon: "🚚" },
  { to: "/supplier-returns", labelKey: "supplierReturns", icon: "📤" },
  { to: "/purchases", labelKey: "purchases", icon: "🛒" },
  { to: "/customers", labelKey: "customers", icon: "👥" },
  { to: "/membership", labelKey: "membership", icon: "💳" },
  { to: "/returns", labelKey: "returns", icon: "↩️" },
  { to: "/employees", labelKey: "employees", icon: "🧑‍💼" },
  { to: "/expenses", labelKey: "expensesLabel", icon: "🧮" },
  { to: "/cash-management", labelKey: "cashManagement", icon: "💰" },
  { to: "/bkash-management", labelKey: "bkashManagement", icon: "📱" },
  { to: "/reports", labelKey: "reports", icon: "📑" },
  { to: "/notifications", labelKey: "notifications", icon: "🔔" },
  { to: "/settings", labelKey: "settings", icon: "⚙️" }
];
function Layout() {
  const { session, setSession } = useAuthStore();
  const { lang, toggleLang, t: t2 } = useLanguageStore();
  const navigate = useNavigate();
  const push = useToastStore((s) => s.push);
  const [mobileMenuOpen, setMobileMenuOpen] = reactExports.useState(false);
  const [unread, setUnread] = reactExports.useState(0);
  const [syncStatus, setSyncStatus] = reactExports.useState({
    pending: 0,
    failed: 0,
    lastSyncedAt: null,
    isSyncing: false
  });
  const [syncLoading, setSyncLoading] = reactExports.useState(false);
  reactExports.useEffect(() => {
    async function loadUnreadNotifications() {
      try {
        await call("notifications:refresh");
        const notifications = await call(
          "notifications:list",
          { onlyUnread: true }
        );
        setUnread(notifications.length);
      } catch {
        setUnread(0);
      }
    }
    loadUnreadNotifications();
  }, []);
  reactExports.useEffect(() => {
    let cancelled = false;
    async function loadSyncStatus() {
      try {
        const status = await call("sync:status");
        if (!cancelled) {
          setSyncStatus(status);
        }
      } catch {
      }
    }
    loadSyncStatus();
    const interval = window.setInterval(
      loadSyncStatus,
      1e4
    );
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);
  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }
  function openMobileMenu() {
    setMobileMenuOpen(true);
  }
  async function handleSyncNow() {
    if (syncLoading) return;
    setSyncLoading(true);
    try {
      const result = await call("sync:run");
      const status = await call("sync:status");
      setSyncStatus(status);
      if (result.failed > 0) {
        push(
          `Sync completed with ${result.failed} failed change(s).`,
          "error"
        );
      } else if (result.synced > 0) {
        push(
          `Successfully synced ${result.synced} change(s) to Neon.`,
          "success"
        );
      } else if (result.pending === 0) {
        push(
          "Everything is already synced.",
          "success"
        );
      } else {
        push(
          `${result.pending} change(s) are still waiting to sync.`,
          "info"
        );
      }
    } catch (error) {
      console.error("Sync failed:", error);
      push(
        "Unable to sync changes.",
        "error"
      );
    } finally {
      setSyncLoading(false);
    }
  }
  async function handleLogout() {
    await call("auth:logout").catch(() => {
    });
    setSession(null);
    closeMobileMenu();
    navigate("/login");
    push(
      "You have been logged out.",
      "info"
    );
  }
  const hasFailed = syncStatus.failed > 0;
  const hasPending = syncStatus.pending > 0;
  const syncLabel = hasFailed ? "Sync Error" : hasPending ? "Pending" : "Synced";
  const syncIcon = hasFailed ? "🔴" : hasPending ? "🟠" : "🟢";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex h-[100dvh] w-full min-w-0 overflow-hidden bg-brand-50", children: [
    mobileMenuOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        "aria-label": "Close menu",
        onClick: closeMobileMenu,
        className: "fixed inset-0 z-[90] bg-black/45 backdrop-blur-[2px] md:hidden"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "aside",
      {
        className: [
          "fixed inset-y-0 left-0 z-[100]",
          "flex w-[280px] flex-shrink-0 flex-col",
          "bg-brand-900 text-brand-50",
          "shadow-2xl",
          "transition-transform duration-300 ease-out",
          "md:relative md:z-20 md:w-64 md:translate-x-0 md:shadow-none",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        ].join(" "),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-[76px] items-center justify-between border-b border-brand-800 px-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-lg font-black tracking-wide", children: "TORKI BAZAR" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-[11px] text-brand-300", children: t2("retailManagementSystem") })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: closeMobileMenu,
                  className: "flex h-9 w-9 items-center justify-center rounded-lg bg-brand-800 text-xl text-brand-100 transition hover:bg-brand-700 active:scale-95 md:hidden",
                  "aria-label": "Close menu",
                  children: "×"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: toggleLang,
                  className: "rounded-lg bg-brand-800 px-2.5 py-1.5 text-[11px] font-bold text-brand-100 shadow-sm transition hover:bg-brand-700",
                  title: "Switch Language",
                  children: lang === "en" ? "বাংলা" : "English"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: NAV_ITEMS.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            NavLink,
            {
              to: item.to,
              end: item.end,
              onClick: closeMobileMenu,
              className: ({ isActive }) => [
                "flex min-h-[42px] items-center justify-between",
                "gap-2 rounded-xl px-3 py-2.5",
                "text-sm font-medium",
                "transition-all duration-150",
                "active:scale-[0.98]",
                isActive ? "bg-brand-600 text-white shadow-sm" : "text-brand-100 hover:bg-brand-800"
              ].join(" "),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex min-w-0 items-center gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex w-6 flex-shrink-0 items-center justify-center text-base", children: item.icon }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: item.to === "/bkash-management" ? "bKash Management" : t2(item.labelKey) || item.labelKey })
                ] }),
                item.to === "/notifications" && unread > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex min-w-[22px] items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white", children: unread })
              ]
            },
            item.to
          )) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-brand-800 px-4 py-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 rounded-xl bg-brand-800/70 p-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-bold tracking-wide text-brand-300", children: "DATABASE SYNC" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-sm font-semibold text-white", children: [
                    syncIcon,
                    " ",
                    syncLabel
                  ] }),
                  hasPending && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-0.5 text-xs text-brand-300", children: [
                    syncStatus.pending,
                    " pending"
                  ] }),
                  hasFailed && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-0.5 text-xs text-red-300", children: [
                    syncStatus.failed,
                    " failed"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: handleSyncNow,
                    disabled: syncLoading,
                    className: "flex-shrink-0 rounded-lg bg-brand-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-brand-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50",
                    title: "Synchronize",
                    children: syncLoading ? "..." : "🔄 Sync"
                  }
                )
              ] }),
              syncStatus.lastSyncedAt && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 truncate text-[9px] text-brand-400", children: [
                "Last sync:",
                " ",
                new Date(
                  syncStatus.lastSyncedAt
                ).toLocaleString()
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-xs font-semibold text-brand-100", children: session?.fullName }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-[11px] text-brand-300", children: session?.roleName }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: handleLogout,
                className: "mt-2 text-xs text-brand-300 underline transition hover:text-white",
                children: "Log out"
              }
            )
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex min-w-0 flex-1 flex-col overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "header",
        {
          className: "fixed left-0 right-0 top-0 z-[80] flex h-16 flex-shrink-0 items-center border-b border-slate-200 bg-white/95 px-3 shadow-sm backdrop-blur-md md:hidden",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: openMobileMenu,
                className: "mr-3 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-brand-600 text-2xl leading-none text-white shadow-md transition-all hover:bg-brand-500 active:scale-95",
                "aria-label": "Open navigation menu",
                title: "Menu",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block -mt-0.5", children: "☰" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-sm font-black tracking-wide text-brand-900", children: "TORKI BAZAR" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-[10px] font-medium text-slate-500", children: session?.fullName || "Retail Management System" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: toggleLang,
                className: "ml-2 flex-shrink-0 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[10px] font-bold text-slate-700 shadow-sm active:scale-95",
                children: lang === "en" ? "বাংলা" : "EN"
              }
            )
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "main",
        {
          className: [
            "min-h-0 min-w-0 flex-1",
            "overflow-auto",
            "bg-brand-50",
            "overscroll-contain",
            "touch-pan-x touch-pan-y",
            "pt-16 md:pt-0"
          ].join(" "),
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: [
                "min-h-full min-w-0",
                "p-3 sm:p-4 md:p-6",
                "md:min-w-0"
              ].join(" "),
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {})
            }
          )
        }
      )
    ] })
  ] });
}
const variantClasses = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 disabled:bg-brand-300",
  secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50",
  danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300",
  ghost: "bg-transparent text-slate-600 hover:bg-slate-100"
};
function Button({
  variant = "primary",
  className = "",
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "button",
    {
      className: `inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`,
      ...props
    }
  );
}
function Field({ label: label2, children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mb-1 block font-medium text-slate-600", children: label2 }),
    children
  ] });
}
const Input = reactExports.forwardRef(function Input2({ className = "", ...props }, ref) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "input",
    {
      ref,
      ...props,
      className: `w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 ${className}`
    }
  );
});
function Select(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "select",
    {
      ...props,
      className: `w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 ${props.className ?? ""}`
    }
  );
}
const logo = "" + new URL("torki-logo-C-GrdB9M.png", import.meta.url).href;
const REMEMBER_KEY = "torki-bazar-remember-login";
function LoginPage() {
  const [username, setUsername] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [rememberMe, setRememberMe] = reactExports.useState(false);
  const [showPassword, setShowPassword] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(false);
  const setSession = useAuthStore((s) => s.setSession);
  const navigate = useNavigate();
  reactExports.useEffect(() => {
    try {
      const saved = localStorage.getItem(REMEMBER_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved);
      if (parsed?.username) {
        setUsername(parsed.username);
      }
      if (parsed?.password) {
        setPassword(parsed.password);
        setRememberMe(true);
      }
    } catch {
      localStorage.removeItem(REMEMBER_KEY);
    }
  }, []);
  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const session = await call("auth:login", {
        username,
        password
      });
      if (rememberMe) {
        localStorage.setItem(
          REMEMBER_KEY,
          JSON.stringify({
            username,
            password
          })
        );
      } else {
        localStorage.removeItem(REMEMBER_KEY);
      }
      setSession(session);
      navigate("/");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to sign in. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative min-h-screen w-full overflow-hidden bg-brand-900", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-brand-950 via-brand-900 to-brand-700" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-brand-500/30 blur-3xl",
          style: {
            animation: "torkiFloatOne 9s ease-in-out infinite"
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "absolute -bottom-40 -right-32 h-[600px] w-[600px] rounded-full bg-emerald-400/20 blur-3xl",
          style: {
            animation: "torkiFloatTwo 11s ease-in-out infinite"
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "absolute left-[45%] top-[20%] h-[280px] w-[280px] rounded-full bg-lime-300/10 blur-3xl",
          style: {
            animation: "torkiPulse 7s ease-in-out infinite"
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "absolute inset-0 opacity-[0.055]",
          style: {
            backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "45px 45px"
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "absolute left-[12%] top-[22%] h-2 w-2 rounded-full bg-white/40",
          style: {
            animation: "torkiParticle 5s ease-in-out infinite"
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "absolute left-[82%] top-[25%] h-3 w-3 rounded-full bg-white/30",
          style: {
            animation: "torkiParticle 7s ease-in-out infinite 1s"
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "absolute left-[20%] top-[75%] h-3 w-3 rounded-full bg-white/25",
          style: {
            animation: "torkiParticle 6s ease-in-out infinite 2s"
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "absolute left-[75%] top-[72%] h-2 w-2 rounded-full bg-white/40",
          style: {
            animation: "torkiParticle 8s ease-in-out infinite 1.5s"
          }
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative z-10 flex min-h-screen items-center justify-center px-5 py-10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-[460px]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "mb-7 text-center",
          style: {
            animation: "torkiFadeDown 0.8s ease-out both"
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-[28px] bg-white/95 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.28)] ring-1 ring-white/40 backdrop-blur-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: logo,
                alt: "Torki Bazar",
                className: "h-full w-full object-contain"
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-black tracking-tight text-white drop-shadow-lg", children: "Torki Bazar" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm font-medium text-white/65", children: "Retail Management System" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "relative overflow-hidden rounded-[30px] border border-white/20 bg-white/95 p-7 shadow-[0_30px_100px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:p-9",
          style: {
            animation: "torkiFadeUp 0.8s ease-out both"
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-0 right-0 top-0 h-1.5 bg-gradient-to-r from-brand-400 via-emerald-400 to-lime-300" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-brand-100/70 blur-2xl" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-7", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-1 text-xs font-bold uppercase tracking-[0.2em] text-brand-600", children: "Secure access" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-3xl font-extrabold tracking-tight text-slate-900", children: "Welcome back" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-slate-500", children: "Sign in to manage your Torki Bazar store." })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Username", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "svg",
                    {
                      width: "19",
                      height: "19",
                      viewBox: "0 0 24 24",
                      fill: "none",
                      stroke: "currentColor",
                      strokeWidth: "2",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M20 21a8 8 0 0 0-16 0" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "7", r: "4" })
                      ]
                    }
                  ) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      value: username,
                      onChange: (e) => setUsername(e.target.value),
                      autoFocus: true,
                      required: true,
                      placeholder: "Enter your username",
                      className: "!pl-11 !h-12 !rounded-xl !border-slate-200 !bg-slate-50 focus:!border-brand-500 focus:!ring-brand-500/20"
                    }
                  )
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Password", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "svg",
                    {
                      width: "19",
                      height: "19",
                      viewBox: "0 0 24 24",
                      fill: "none",
                      stroke: "currentColor",
                      strokeWidth: "2",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "rect",
                          {
                            x: "3",
                            y: "10",
                            width: "18",
                            height: "11",
                            rx: "2"
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M7 10V7a5 5 0 0 1 10 0v3" })
                      ]
                    }
                  ) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      type: showPassword ? "text" : "password",
                      value: password,
                      onChange: (e) => setPassword(e.target.value),
                      required: true,
                      placeholder: "Enter your password",
                      className: "!h-12 !rounded-xl !border-slate-200 !bg-slate-50 !pl-11 !pr-12 focus:!border-brand-500 focus:!ring-brand-500/20"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => setShowPassword((value) => !value),
                      className: "absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-brand-600",
                      "aria-label": showPassword ? "Hide password" : "Show password",
                      children: showPassword ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "svg",
                        {
                          width: "19",
                          height: "19",
                          viewBox: "0 0 24 24",
                          fill: "none",
                          stroke: "currentColor",
                          strokeWidth: "2",
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M3 3l18 18" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M10.6 10.6a2 2 0 0 0 2.8 2.8" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M9.9 4.2A10.7 10.7 0 0 1 12 4c5 0 9 4 10 8-0.4 1.4-1.2 2.6-2.2 3.7" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M6.6 6.6C4.8 7.8 3.5 9.6 2 12c1 4 5 8 10 8 1.5 0 2.9-.3 4.1-.9" })
                          ]
                        }
                      ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "svg",
                        {
                          width: "19",
                          height: "19",
                          viewBox: "0 0 24 24",
                          fill: "none",
                          stroke: "currentColor",
                          strokeWidth: "2",
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "12", r: "3" })
                          ]
                        }
                      )
                    }
                  )
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "group flex cursor-pointer items-center gap-3", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        type: "checkbox",
                        checked: rememberMe,
                        onChange: (e) => setRememberMe(e.target.checked),
                        className: "h-4 w-4 cursor-pointer rounded border-slate-300 text-brand-600 accent-brand-600 focus:ring-brand-500"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-slate-600 transition group-hover:text-slate-900", children: "Remember me" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-slate-400", children: "Stay signed in" })
                ] }),
                error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "svg",
                    {
                      className: "mt-0.5 shrink-0",
                      width: "18",
                      height: "18",
                      viewBox: "0 0 24 24",
                      fill: "none",
                      stroke: "currentColor",
                      strokeWidth: "2",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "12", r: "9" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 8v4" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 16h.01" })
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: error })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    type: "submit",
                    disabled: loading,
                    className: "group relative !h-13 w-full !rounded-xl !border-0 !bg-brand-600 !text-base !font-bold !text-white shadow-lg shadow-brand-600/25 transition-all duration-300 hover:!bg-brand-700 hover:shadow-xl hover:shadow-brand-600/30 active:scale-[0.99] disabled:opacity-70",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex items-center justify-center gap-2", children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" }),
                      "Signing in..."
                    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                      "Sign in",
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "svg",
                        {
                          className: "transition-transform duration-300 group-hover:translate-x-1",
                          width: "19",
                          height: "19",
                          viewBox: "0 0 24 24",
                          fill: "none",
                          stroke: "currentColor",
                          strokeWidth: "2.5",
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M5 12h14" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "m13 6 6 6-6 6" })
                          ]
                        }
                      )
                    ] }) })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex items-center justify-center gap-2 text-xs text-slate-400", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "svg",
                  {
                    width: "14",
                    height: "14",
                    viewBox: "0 0 24 24",
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: "2",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "4", y: "10", width: "16", height: "11", rx: "2" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M8 10V7a4 4 0 0 1 8 0v3" })
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Secure store management access" })
              ] })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "mt-7 text-center",
          style: {
            animation: "torkiFadeUp 1s ease-out both"
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-white/50", children: "© 2026 Torki Bazar. All Rights Reserved." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-white/35", children: [
              "Developed & Designed by",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-white/60", children: "Nuhu" })
            ] })
          ]
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
          @keyframes torkiFloatOne {
            0%, 100% {
              transform: translate3d(0, 0, 0) scale(1);
            }
            50% {
              transform: translate3d(80px, 60px, 0) scale(1.15);
            }
          }

          @keyframes torkiFloatTwo {
            0%, 100% {
              transform: translate3d(0, 0, 0) scale(1);
            }
            50% {
              transform: translate3d(-70px, -50px, 0) scale(1.12);
            }
          }

          @keyframes torkiPulse {
            0%, 100% {
              opacity: 0.35;
              transform: scale(1);
            }
            50% {
              opacity: 0.7;
              transform: scale(1.25);
            }
          }

          @keyframes torkiParticle {
            0%, 100% {
              transform: translateY(0);
              opacity: 0.25;
            }
            50% {
              transform: translateY(-35px);
              opacity: 0.8;
            }
          }

          @keyframes torkiFadeDown {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes torkiFadeUp {
            from {
              opacity: 0;
              transform: translateY(25px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        ` })
  ] });
}
function formatBDT(value) {
  const num = typeof value === "string" ? Number(value) : value;
  if (num === null || num === void 0 || Number.isNaN(num)) return "৳0";
  return `৳${num.toLocaleString("en-BD", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}
function formatDate(value) {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
function formatDateTime(value) {
  const date = typeof value === "string" ? new Date(value) : value;
  return `${formatDate(date)} ${date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
}
let lastHoverTime = 0;
function playSound(type) {
  try {
    const nowTime = Date.now();
    if (type === "hover" && nowTime - lastHoverTime < 250) {
      return;
    }
    if (type === "hover") {
      lastHoverTime = nowTime;
    }
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;
    if (type === "click") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(580, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.06);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(1e-3, now + 0.06);
      osc.start(now);
      osc.stop(now + 0.06);
    } else if (type === "hover") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(520, now + 0.03);
      gain.gain.setValueAtTime(0.015, now);
      gain.gain.exponentialRampToValueAtTime(1e-3, now + 0.03);
      osc.start(now);
      osc.stop(now + 0.03);
    } else if (type === "select") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(500, now);
      osc.frequency.exponentialRampToValueAtTime(750, now + 0.08);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(1e-3, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    }
  } catch {
  }
}
function Icon({ children, className = "" }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-sm ring-1 ring-black/[0.03] transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110 ${className}`, children });
}
function ArrowIcon$2() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M5 12h14" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "m13 6 6 6-6 6" })
  ] });
}
function TrendIcon$1() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M3 17l6-6 4 4 8-9" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M15 6h6v6" })
  ] });
}
function WalletIcon$1() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "3", y: "5", width: "18", height: "15", rx: "3" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M3 9h18" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M16 14h2" })
  ] });
}
function PhoneIcon$1() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "5", y: "2", width: "14", height: "20", rx: "2" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 18h.01" })
  ] });
}
function BoxIcon() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "m12 3 9 5-9 5-9-5 9-5Z" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "m3 8 9 5 9-5" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M3 8v8l9 5 9-5V8" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 13v8" })
  ] });
}
function UsersIcon() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "9", cy: "7", r: "4" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M22 21v-2a4 4 0 0 0-3-3.87" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M16 3.13a4 4 0 0 1 0 7.75" })
  ] });
}
function AlertIcon() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "12", r: "9" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 7v5" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 16h.01" })
  ] });
}
function ClockIcon$1() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "12", r: "9" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 7v5l3 2" })
  ] });
}
function ExpenseIcon$1() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "3", y: "4", width: "18", height: "16", rx: "3" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M7 9h10" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M7 13h5" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M7 17h3" })
  ] });
}
function BuildingIcon() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M4 21V5l8-3 8 3v16" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M8 9h1" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M15 9h1" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M8 13h1" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M15 13h1" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M10 21v-4h4v4" })
  ] });
}
function CalendarIcon$1() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "3", y: "4", width: "18", height: "17", rx: "3" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M16 2v4" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M8 2v4" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M3 10h18" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M8 14h.01" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 14h.01" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M16 14h.01" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M8 18h.01" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 18h.01" })
  ] });
}
function SparkIcon() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z" }) });
}
function ProfitRing({ percent }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - Math.min(100, Math.max(0, percent)) / 100 * circumference;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { viewBox: "0 0 130 130", className: "h-28 w-28 -rotate-90 drop-shadow-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "65", cy: "65", r: radius, fill: "none", stroke: "#e7efe9", strokeWidth: "11" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "circle",
      {
        cx: "65",
        cy: "65",
        r: radius,
        fill: "none",
        stroke: "url(#ringGradient)",
        strokeWidth: "11",
        strokeLinecap: "round",
        strokeDasharray: circumference,
        strokeDashoffset: offset,
        className: "ring-progress"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("defs", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: "ringGradient", x1: "0%", y1: "0%", x2: "100%", y2: "100%", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "#04724d" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "55%", stopColor: "#10b981" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "#c9a24b" })
    ] }) })
  ] });
}
function MiniStat$1({
  label: label2,
  value,
  icon,
  tone = "green",
  onClick,
  delay = 0
}) {
  const tones = {
    green: "bg-emerald-100/80 text-emerald-700",
    blue: "bg-sky-100/80 text-sky-700",
    orange: "bg-amber-100/80 text-amber-700",
    red: "bg-rose-100/80 text-rose-700",
    purple: "bg-violet-100/80 text-violet-700",
    pink: "bg-pink-100/80 text-pink-700",
    yellow: "bg-amber-100/80 text-amber-700"
  };
  const valueTones = {
    green: "text-emerald-700 font-black",
    blue: "text-slate-900",
    orange: "text-slate-900",
    red: "text-rose-600 font-black",
    purple: "text-slate-900",
    pink: "text-pink-700 font-black",
    yellow: "text-amber-600 font-black"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      onMouseEnter: () => playSound("hover"),
      onClick: () => {
        playSound("click");
        onClick?.();
      },
      style: { animationDelay: `${delay}ms` },
      className: `
        stat-card
        group relative overflow-hidden rounded-[22px] border border-slate-200/70
        bg-white/85 p-4 shadow-[0_1px_2px_rgba(15,31,23,0.04)] backdrop-blur-xl
        transition-all duration-500 ease-out
        hover:-translate-y-1.5 hover:border-emerald-300/60 hover:shadow-[0_18px_38px_-12px_rgba(6,78,59,0.28)]
        ${onClick ? "cursor-pointer hover:bg-emerald-50/40" : ""}
      `,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pointer-events-none absolute inset-x-0 top-0 h-[2px] scale-x-0 bg-gradient-to-r from-emerald-500 via-emerald-300 to-amber-400 transition-transform duration-500 origin-left group-hover:scale-x-100" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 transition-colors group-hover:text-emerald-700 truncate", children: label2 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `mt-2 text-xl font-black tracking-tight tabular-nums truncate ${valueTones[tone]}`, children: value })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: tones[tone], children: icon })
        ] })
      ]
    }
  );
}
function AlertCard({
  title,
  value,
  subtitle,
  tone,
  onClick,
  delay = 0
}) {
  const styles = {
    yellow: {
      card: "border-amber-200/80 bg-gradient-to-r from-amber-50/90 to-yellow-50/40 hover:from-amber-100 hover:to-yellow-100/70",
      icon: "bg-amber-200/80 text-amber-800",
      value: "text-amber-950",
      arrow: "text-amber-600",
      dot: "bg-amber-400"
    },
    orange: {
      card: "border-orange-200/80 bg-gradient-to-r from-orange-50/90 to-amber-50/40 hover:from-orange-100 hover:to-amber-100/70",
      icon: "bg-orange-200/80 text-orange-800",
      value: "text-orange-950",
      arrow: "text-orange-600",
      dot: "bg-orange-400"
    },
    red: {
      card: "border-rose-200/80 bg-gradient-to-r from-rose-50/90 to-red-50/40 hover:from-rose-100 hover:to-red-100/70",
      icon: "bg-rose-200/80 text-rose-800",
      value: "text-rose-950",
      arrow: "text-rose-600",
      dot: "bg-rose-400"
    }
  };
  const style = styles[tone];
  const isUrgent = Number(value) > 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      type: "button",
      onMouseEnter: () => playSound("hover"),
      onClick: () => {
        playSound("click");
        onClick?.();
      },
      style: { animationDelay: `${delay}ms` },
      className: `alert-card group relative flex w-full items-center justify-between overflow-hidden rounded-[22px] border p-4 text-left shadow-sm backdrop-blur-md transition-all duration-400 ease-out hover:-translate-y-1 hover:shadow-lg ${style.card}`,
      children: [
        isUrgent && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `absolute right-4 top-4 h-2 w-2 rounded-full ${style.dot} animate-ping` }),
        isUrgent && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `absolute right-4 top-4 h-2 w-2 rounded-full ${style.dot}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 items-center gap-3.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 ${style.icon}`, children: [
            tone === "yellow" && /* @__PURE__ */ jsxRuntimeExports.jsx(BoxIcon, {}),
            tone === "orange" && /* @__PURE__ */ jsxRuntimeExports.jsx(ClockIcon$1, {}),
            tone === "red" && /* @__PURE__ */ jsxRuntimeExports.jsx(AlertIcon, {})
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold text-slate-700", children: title }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-0.5 flex items-baseline gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-2xl font-black tabular-nums ${style.value}`, children: value }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate text-[11px] font-medium text-slate-500", children: subtitle })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `ml-3 rounded-full bg-white/70 p-2 shadow-sm transition-all duration-300 group-hover:translate-x-1 group-hover:bg-white ${style.arrow}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowIcon$2, {}) })
      ]
    }
  );
}
function formatDateForApi(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function getDateRange(filter) {
  const now = /* @__PURE__ */ new Date();
  const start = new Date(now);
  const end = new Date(now);
  if (filter === "today") {
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
  } else if (filter === "7days") {
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
  } else if (filter === "month") {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    end.setMonth(end.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);
  } else if (filter === "quarter") {
    const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
    start.setMonth(quarterStartMonth, 1);
    start.setHours(0, 0, 0, 0);
    end.setMonth(quarterStartMonth + 3, 0);
    end.setHours(23, 59, 59, 999);
  } else if (filter === "year") {
    start.setMonth(0, 1);
    start.setHours(0, 0, 0, 0);
    end.setMonth(11, 31);
    end.setHours(23, 59, 59, 999);
  }
  return {
    from: formatDateForApi(start),
    to: formatDateForApi(end)
  };
}
function DashboardPage() {
  const [summary, setSummary] = reactExports.useState(null);
  const [cashBalance, setCashBalance] = reactExports.useState(0);
  const [bkashBalance, setBkashBalance] = reactExports.useState(0);
  const [loading, setLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState(null);
  const [dateFilter, setDateFilter] = reactExports.useState("today");
  const [customFrom, setCustomFrom] = reactExports.useState("");
  const [customTo, setCustomTo] = reactExports.useState("");
  const navigate = useNavigate();
  const { t: t2, n: n2 } = useLanguageStore();
  const dateRange = reactExports.useMemo(() => {
    if (dateFilter === "custom") {
      return { from: customFrom, to: customTo };
    }
    return getDateRange(dateFilter);
  }, [dateFilter, customFrom, customTo]);
  async function loadDashboard() {
    try {
      setLoading(true);
      setError(null);
      const [data, balance, bkashData] = await Promise.all([
        call("dashboard:summary", dateRange),
        call("cash:balance").catch(() => 0),
        call("bkash:balance").catch(() => 0)
      ]);
      setSummary(data);
      setCashBalance(Number(balance) || 0);
      setBkashBalance(Number(bkashData) || 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }
  reactExports.useEffect(() => {
    if (dateFilter === "custom" && (!customFrom || !customTo)) {
      return;
    }
    loadDashboard();
  }, [dateFilter, customFrom, customTo]);
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-[calc(100vh-70px)] bg-gradient-to-br from-[#f2f7f2] via-[#eaf2ea] to-[#e4eee4] px-4 py-6 lg:px-6 xl:px-8 flex flex-col justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-[1600px] w-full flex-col gap-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "skeleton-shimmer h-40 w-full rounded-[28px]" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "skeleton-shimmer h-52 rounded-[26px]" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "skeleton-shimmer h-52 rounded-[26px]" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("footer", { className: "py-6 text-center text-xs font-semibold text-slate-500", children: "© 2026 Torki Bazar. All rights reserved. Designed & Developed by Nuhu Sikder." })
    ] });
  }
  if (error || !summary) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "m-6 rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold", children: "Unable to load dashboard" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm", children: error })
    ] });
  }
  const filterLabel = dateFilter === "today" ? t2("today") || "Today" : dateFilter === "7days" ? t2("last7Days") || "Last 7 Days" : dateFilter === "month" ? t2("thisMonth") || "This Month" : dateFilter === "quarter" ? t2("thisQuarter") || "This Quarter" : dateFilter === "year" ? t2("thisYear") || "This Year" : t2("customRange") || "Custom Range";
  const grossProfit = Number(summary.todaysGrossProfit) || 0;
  const sales = Number(summary.todaysSales) || 0;
  const profitPercent = sales > 0 ? Math.min(100, Math.max(0, grossProfit / sales * 100)) : 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "dashboard-root min-h-[calc(100vh-70px)] bg-gradient-to-br from-[#f2f7f2] via-[#eaf2ea] to-[#e4eee4] px-4 py-5 lg:px-6 lg:py-6 xl:px-8 flex flex-col justify-between", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-[1600px] w-full flex-col gap-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "hero-panel relative overflow-hidden rounded-[28px] px-7 py-7 text-white shadow-[0_25px_60px_-15px_rgba(3,51,36,0.45)]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hero-mesh" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2.5 inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/10 px-3.5 py-1 backdrop-blur-md", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "relative flex h-2 w-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative inline-flex h-2 w-2 rounded-full bg-emerald-300" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-black uppercase tracking-[0.22em] text-emerald-100", children: t2("liveOperationsCenter") || "Live Operations Center" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-amber-300", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SparkIcon, {}) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "hero-title text-3xl font-black tracking-tight sm:text-[2.6rem]", children: t2("welcomeBack") || "Welcome back, Torki Bazar" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1.5 max-w-md text-xs font-medium text-emerald-100/80 sm:text-sm", children: t2("heroSubtitle") || "Real-time performance metrics, inventory health, and revenue analytics." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full rounded-[22px] border border-white/15 bg-white/[0.08] p-4 shadow-lg backdrop-blur-xl lg:w-auto lg:min-w-[280px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2.5 sm:flex-row sm:items-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-emerald-100", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarIcon$1, {}),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-black uppercase tracking-[0.16em]", children: t2("filterPeriod") || "Filter Period" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "select",
                {
                  value: dateFilter,
                  onChange: (e) => {
                    playSound("select");
                    setDateFilter(e.target.value);
                  },
                  className: "min-w-[160px] cursor-pointer rounded-xl border border-white/20 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 shadow-md outline-none",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "today", children: t2("today") || "Today" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "7days", children: t2("last7Days") || "Last 7 Days" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "month", children: t2("thisMonth") || "This Month" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "quarter", children: t2("thisQuarter") || "This Quarter" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "year", children: t2("thisYear") || "This Year" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "custom", children: t2("customRange") || "Custom Range" })
                  ]
                }
              )
            ] }),
            dateFilter === "custom" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3.5 grid grid-cols-2 gap-2.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "date",
                  value: customFrom,
                  onChange: (e) => {
                    playSound("click");
                    setCustomFrom(e.target.value);
                  },
                  className: "w-full rounded-xl border border-white/20 bg-white px-2.5 py-2 text-xs font-bold text-slate-900 outline-none"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "date",
                  value: customTo,
                  onChange: (e) => {
                    playSound("click");
                    setCustomTo(e.target.value);
                  },
                  className: "w-full rounded-xl border border-white/20 bg-white px-2.5 py-2 text-xs font-bold text-slate-900 outline-none"
                }
              )
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 px-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-black uppercase tracking-[0.2em] text-emerald-800", children: t2("coreRevenue") || "Core Revenue" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-lg font-black text-slate-900", children: [
            t2("salesAndProfitOverview") || "Sales & Profit Overview",
            " (",
            filterLabel,
            ")"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sales-card group relative overflow-hidden rounded-[26px] p-6 text-white shadow-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex h-full flex-col justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-black uppercase tracking-[0.18em] text-emerald-200", children: t2("totalRevenueSales") || "TOTAL REVENUE / SALES" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-white/20 bg-white/15 p-2.5 backdrop-blur-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TrendIcon$1, {}) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-4xl font-black tracking-tight tabular-nums sm:text-5xl", children: n2(formatBDT(summary.todaysSales)) }) })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-[26px] border border-slate-200/80 bg-white/90 p-6 backdrop-blur-xl shadow-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-black uppercase tracking-[0.18em] text-slate-400", children: t2("grossProfitMargin") || "GROSS PROFIT MARGIN" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800 shadow-sm", children: [
                n2(profitPercent.toFixed(1)),
                "%"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center gap-5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex h-28 w-28 shrink-0 items-center justify-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ProfitRing, { percent: profitPercent }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute flex flex-col items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(WalletIcon$1, {}) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-black tracking-tight text-slate-900 tabular-nums", children: n2(formatBDT(summary.todaysGrossProfit)) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-xs font-bold text-slate-500", children: [
                  t2("cogs") || "COGS",
                  ": ",
                  n2(formatBDT(summary.todaysCogs))
                ] })
              ] })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-5 xl:grid-cols-[1.6fr_1fr]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-3 px-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-black text-slate-900", children: t2("financialBreakdowns") || "Financial Breakdowns" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3.5 lg:grid-cols-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              MiniStat$1,
              {
                label: t2("availableCash") || "Available Cash",
                value: n2(formatBDT(cashBalance)),
                tone: "green",
                icon: /* @__PURE__ */ jsxRuntimeExports.jsx(WalletIcon$1, {}),
                onClick: () => navigate("/cash-management")
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              MiniStat$1,
              {
                label: "bKash",
                value: n2(formatBDT(bkashBalance)),
                tone: "pink",
                icon: /* @__PURE__ */ jsxRuntimeExports.jsx(PhoneIcon$1, {}),
                onClick: () => navigate("/bkash-management")
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(MiniStat$1, { label: t2("cogs") || "COGS", value: n2(formatBDT(summary.todaysCogs)), tone: "blue", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(WalletIcon$1, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              MiniStat$1,
              {
                label: t2("expenses") || "Expenses",
                value: n2(formatBDT(summary.todaysExpenses)),
                tone: "red",
                icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ExpenseIcon$1, {}),
                onClick: () => navigate("/expenses")
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              MiniStat$1,
              {
                label: t2("supplierPayables") || "Supplier Payables (Due)",
                value: n2(formatBDT(summary.supplierPayables)),
                tone: "red",
                icon: /* @__PURE__ */ jsxRuntimeExports.jsx(BuildingIcon, {}),
                onClick: () => navigate("/purchases")
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              MiniStat$1,
              {
                label: t2("customerReceivables") || "Customer Receivables (Credit)",
                value: n2(formatBDT(summary.customerReceivables)),
                tone: "red",
                icon: /* @__PURE__ */ jsxRuntimeExports.jsx(UsersIcon, {}),
                onClick: () => navigate("/sales")
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              MiniStat$1,
              {
                label: t2("codPending") || "COD Pending",
                value: n2(formatBDT(summary.codPendingAmount)),
                tone: "yellow",
                icon: /* @__PURE__ */ jsxRuntimeExports.jsx(WalletIcon$1, {}),
                onClick: () => navigate("/sales")
              }
            )
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "flex flex-col gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between px-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-black text-slate-900", children: t2("attentionRequired") || "Attention Required" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertCard, { title: t2("lowStockWarning") || "Low Stock Warning", value: n2(summary.lowStockCount), subtitle: "products below safety threshold", tone: "yellow", onClick: () => navigate("/inventory?view=lowstock") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertCard, { title: t2("expiringSoon") || "Expiring Soon", value: n2(summary.expiringSoonCount), subtitle: "batches nearing expiry date", tone: "orange", onClick: () => navigate("/inventory?view=expiring") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertCard, { title: t2("expiredBatches") || "Expired Batches", value: n2(summary.expiredCount), subtitle: "batches already expired", tone: "red", onClick: () => navigate("/inventory?view=expired") })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("footer", { className: "mt-8 py-4 text-center text-xs font-semibold text-slate-500 tracking-wide border-t border-slate-200/60", children: "© 2026 Torki Bazar. All rights reserved. Designed & Developed by Nuhu." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
        .hero-panel { background: linear-gradient(120deg, #032a1d 0%, #054e38 45%, #07704f 100%); }
        .sales-card { background: linear-gradient(135deg, #04523b 0%, #066e4d 55%, #0a8f61 100%); }
      ` })
  ] });
}
function Modal({
  open,
  title,
  onClose,
  children,
  footer,
  wide = false
}) {
  if (!open) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `w-full ${wide ? "max-w-3xl" : "max-w-lg"} rounded-2xl bg-white shadow-xl`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b border-slate-100 px-6 py-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold text-slate-900", children: title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "text-slate-400 hover:text-slate-600", "aria-label": "Close", children: "✕" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-[70vh] overflow-y-auto px-6 py-5", children }),
    footer && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end gap-2 border-t border-slate-100 px-6 py-4", children: footer })
  ] }) });
}
const DISCRETE_UNIT_NAMES = [
  "piece",
  "pieces",
  "pc",
  "pcs",
  "pack",
  "packet",
  "box",
  "carton",
  "dozen",
  "bottle",
  "can",
  "bag"
];
const FALLBACK_UNITS = [
  {
    id: "u-kg",
    name: "Kilogram",
    abbreviation: "kg"
  },
  {
    id: "u-g",
    name: "Gram",
    abbreviation: "g"
  },
  {
    id: "u-l",
    name: "Liter",
    abbreviation: "L"
  },
  {
    id: "u-ml",
    name: "Milliliter",
    abbreviation: "ml"
  },
  {
    id: "u-pcs",
    name: "Piece",
    abbreviation: "pcs"
  },
  {
    id: "u-pkt",
    name: "Packet",
    abbreviation: "pkt"
  },
  {
    id: "u-box",
    name: "Box",
    abbreviation: "box"
  },
  {
    id: "u-bottle",
    name: "Bottle",
    abbreviation: "bottle"
  },
  {
    id: "u-carton",
    name: "Carton",
    abbreviation: "carton"
  },
  {
    id: "u-dozen",
    name: "Dozen",
    abbreviation: "dozen"
  }
];
const emptyForm$1 = {
  name: "",
  categoryId: "",
  subcategoryId: "",
  sku: "",
  barcode: "",
  unitId: "",
  packSize: "",
  description: ""
};
function formatPackSize(p2) {
  if (p2.packSize === null || p2.packSize === "") {
    return "—";
  }
  return `${Number(p2.packSize)} ${p2.unit?.abbreviation ?? ""}`.trim();
}
function displayName(p2) {
  const pack = formatPackSize(p2);
  return pack === "—" ? p2.name : `${p2.name} - ${pack}`;
}
function SearchIcon$2() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "svg",
    {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      className: "h-5 w-5",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "11", cy: "11", r: "7" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "m20 20-3.5-3.5" })
      ]
    }
  );
}
function PlusIcon$3() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "svg",
    {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      className: "h-5 w-5",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 5v14" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M5 12h14" })
      ]
    }
  );
}
function PackageIcon() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "svg",
    {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.8",
      className: "h-6 w-6",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "m21 8-9-5-9 5 9 5 9-5Z" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M3 8v8l9 5 9-5V8" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 13v8" })
      ]
    }
  );
}
function StockIcon() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "svg",
    {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.8",
      className: "h-6 w-6",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M4 19V9" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M10 19V5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M16 19v-7" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M22 19V3" })
      ]
    }
  );
}
function EditIcon$1() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "svg",
    {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.8",
      className: "h-4 w-4",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 20h9" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" })
      ]
    }
  );
}
function AdjustIcon() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "svg",
    {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.8",
      className: "h-4 w-4",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 3v18" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "m7 8 5-5 5 5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "m17 16-5 5-5-5" })
      ]
    }
  );
}
function GridIcon() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "svg",
    {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.8",
      className: "h-5 w-5",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "rect",
          {
            x: "4",
            y: "4",
            width: "6",
            height: "6",
            rx: "1"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "rect",
          {
            x: "14",
            y: "4",
            width: "6",
            height: "6",
            rx: "1"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "rect",
          {
            x: "4",
            y: "14",
            width: "6",
            height: "6",
            rx: "1"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "rect",
          {
            x: "14",
            y: "14",
            width: "6",
            height: "6",
            rx: "1"
          }
        )
      ]
    }
  );
}
function ListIcon() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "svg",
    {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.8",
      className: "h-5 w-5",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M8 6h13" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M8 12h13" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M8 18h13" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M3 6h.01" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M3 12h.01" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M3 18h.01" })
      ]
    }
  );
}
function ProductVisual({
  name
}) {
  const firstLetter = name.trim().charAt(0).toUpperCase() || "P";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-emerald-50 via-white to-green-100 shadow-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.16),transparent_55%)]" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative flex h-12 w-12 items-center justify-center rounded-xl bg-white text-xl font-bold text-emerald-600 shadow-sm ring-1 ring-emerald-100", children: firstLetter })
  ] });
}
function ProductSkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3", children: Array.from({ length: 6 }).map((_, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "animate-pulse p-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-20 w-20 shrink-0 rounded-2xl bg-slate-200" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 w-3/4 rounded bg-slate-200" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 h-3 w-1/2 rounded bg-slate-100" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 h-3 w-2/3 rounded bg-slate-100" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5 h-6 w-24 rounded-lg bg-slate-100" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5 h-8 w-32 rounded bg-slate-100" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-slate-100 bg-slate-50/70 px-5 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 flex-1 animate-pulse rounded-xl bg-slate-200" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 flex-1 animate-pulse rounded-xl bg-slate-200" })
        ] }) })
      ]
    },
    index
  )) });
}
function ProductsPage() {
  const [products, setProducts] = reactExports.useState([]);
  const [categories, setCategories] = reactExports.useState([]);
  const [units, setUnits] = reactExports.useState([]);
  const [search, setSearch] = reactExports.useState("");
  const [categoryFilter, setCategoryFilter] = reactExports.useState("ALL");
  const [stockFilter, setStockFilter] = reactExports.useState("ALL");
  const [initialLoading, setInitialLoading] = reactExports.useState(true);
  const [searching, setSearching] = reactExports.useState(false);
  const [modalOpen, setModalOpen] = reactExports.useState(false);
  const [editingId, setEditingId] = reactExports.useState(null);
  const [saving, setSaving] = reactExports.useState(false);
  const [adjustTarget, setAdjustTarget] = reactExports.useState(null);
  const [adjustForm, setAdjustForm] = reactExports.useState({
    quantity: "",
    direction: "ADD",
    reason: ""
  });
  const [adjusting, setAdjusting] = reactExports.useState(false);
  const [viewMode, setViewMode] = reactExports.useState("grid");
  const [form, setForm] = reactExports.useState(emptyForm$1);
  const push = useToastStore(
    (s) => s.push
  );
  const requestIdRef = reactExports.useRef(0);
  const mountedRef = reactExports.useRef(true);
  reactExports.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);
  const loadProducts = reactExports.useCallback(
    async (q2 = "", options) => {
      const requestId = ++requestIdRef.current;
      const isInitial = options?.initial === true;
      if (isInitial) {
        setInitialLoading(true);
      }
      if (!isInitial && !options?.silent) {
        setSearching(true);
      }
      try {
        const result = await call("products:search", {
          search: q2
        });
        if (requestId !== requestIdRef.current) {
          return;
        }
        if (!mountedRef.current) {
          return;
        }
        setProducts(result.items);
      } catch (e) {
        if (requestId !== requestIdRef.current) {
          return;
        }
        if (!mountedRef.current) {
          return;
        }
        push(
          e instanceof Error ? e.message : "Failed to load products",
          "error"
        );
      } finally {
        if (requestId === requestIdRef.current) {
          if (mountedRef.current) {
            if (isInitial) {
              setInitialLoading(false);
            }
            if (!options?.silent) {
              setSearching(false);
            }
          }
        }
      }
    },
    [push]
  );
  reactExports.useEffect(() => {
    void loadProducts("", {
      initial: true
    });
    let cancelled = false;
    async function loadCategories() {
      try {
        const result = await call(
          "catalog:categories:list"
        );
        if (!cancelled) {
          setCategories(result);
        }
      } catch {
      }
    }
    async function loadUnits() {
      try {
        const result = await call(
          "catalog:units:list"
        );
        if (cancelled) {
          return;
        }
        if (result && result.length > 0) {
          setUnits(result);
        } else {
          setUnits(FALLBACK_UNITS);
        }
      } catch {
        if (!cancelled) {
          setUnits(FALLBACK_UNITS);
        }
      }
    }
    void loadCategories();
    void loadUnits();
    return () => {
      cancelled = true;
    };
  }, [loadProducts]);
  reactExports.useEffect(() => {
    const timer = window.setTimeout(() => {
      if (search === "" && initialLoading && products.length === 0) {
        return;
      }
      void loadProducts(search, {
        silent: false
      });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [
    search,
    loadProducts,
    initialLoading,
    products.length
  ]);
  function openCreate() {
    setEditingId(null);
    setForm({ ...emptyForm$1 });
    setModalOpen(true);
  }
  function openEdit(p2) {
    setEditingId(p2.id);
    setForm({
      name: p2.name,
      categoryId: p2.categoryId,
      subcategoryId: p2.subcategoryId ?? "",
      sku: p2.sku ?? "",
      barcode: p2.barcode ?? "",
      unitId: p2.unitId,
      packSize: p2.packSize === null ? "" : String(Number(p2.packSize)),
      description: p2.description ?? ""
    });
    setModalOpen(true);
  }
  const selectedUnit = units.find(
    (u2) => u2.id === form.unitId
  );
  const packMustBeWhole = !!selectedUnit && DISCRETE_UNIT_NAMES.includes(
    selectedUnit.name.trim().toLowerCase()
  );
  const selectedCategory = categories.find(
    (c) => c.id === form.categoryId
  );
  async function handleSubmit(e) {
    e.preventDefault();
    if (form.packSize !== "" && Number(form.packSize) <= 0) {
      push(
        "Pack size must be greater than zero.",
        "error"
      );
      return;
    }
    if (form.packSize !== "" && packMustBeWhole && !Number.isInteger(
      Number(form.packSize)
    )) {
      push(
        `Pack size for ${selectedUnit?.name} must be a whole number.`,
        "error"
      );
      return;
    }
    setSaving(true);
    const blank = editingId ? null : void 0;
    const payload = {
      name: form.name,
      categoryId: form.categoryId,
      subcategoryId: form.subcategoryId || blank,
      sku: form.sku.trim() || blank,
      barcode: form.barcode.trim() || blank,
      unitId: form.unitId,
      packSize: form.packSize === "" ? null : Number(form.packSize),
      description: form.description || blank
    };
    try {
      if (editingId) {
        await call("products:update", {
          id: editingId,
          ...payload
        });
        push(
          "Product updated successfully.",
          "success"
        );
      } else {
        await call(
          "products:create",
          payload
        );
        push(
          "Product created successfully.",
          "success"
        );
      }
      setModalOpen(false);
      await loadProducts(search, {
        silent: true
      });
    } catch (err) {
      push(
        err instanceof Error ? err.message : "Failed to save product",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }
  function openAdjust(p2) {
    setAdjustForm({
      quantity: "",
      direction: "ADD",
      reason: ""
    });
    setAdjustTarget(p2);
  }
  async function handleAdjust(e) {
    e.preventDefault();
    if (!adjustTarget) {
      return;
    }
    const quantity = Number(
      adjustForm.quantity
    );
    if (!Number.isFinite(quantity) || quantity <= 0) {
      push(
        "Adjustment quantity must be greater than zero.",
        "error"
      );
      return;
    }
    setAdjusting(true);
    try {
      await call(
        "inventory:adjustStock",
        {
          productId: adjustTarget.id,
          quantity,
          direction: adjustForm.direction,
          reason: adjustForm.reason || void 0
        }
      );
      push(
        "Stock adjusted successfully.",
        "success"
      );
      setAdjustTarget(null);
      await loadProducts(search, {
        silent: true
      });
    } catch (err) {
      push(
        err instanceof Error ? err.message : "Failed to adjust stock",
        "error"
      );
    } finally {
      setAdjusting(false);
    }
  }
  const filteredProducts = reactExports.useMemo(() => {
    return products.filter((p2) => {
      const categoryMatches = categoryFilter === "ALL" || p2.categoryId === categoryFilter;
      const stock = Number(
        p2.currentStock
      );
      let stockMatches = true;
      if (stockFilter === "OUT") {
        stockMatches = stock <= 0;
      }
      if (stockFilter === "HEALTHY") {
        stockMatches = stock > 0;
      }
      return categoryMatches && stockMatches;
    });
  }, [
    products,
    categoryFilter,
    stockFilter
  ]);
  const totalProducts = products.length;
  const outOfStockProducts = products.filter(
    (p2) => Number(p2.currentStock) <= 0
  ).length;
  const activeProducts = products.filter(
    (p2) => p2.status.toUpperCase() === "ACTIVE"
  ).length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-full space-y-6 pb-10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PackageIcon, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold tracking-tight text-slate-900", children: "Products" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-500", children: "Manage your catalog and inventory." })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          onClick: openCreate,
          className: "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 shadow-sm",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(PlusIcon$3, {}),
            "New Product"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-slate-500", children: "Total Products" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-3xl font-bold tracking-tight text-slate-900", children: totalProducts }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-slate-400", children: "Products in catalog" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl bg-emerald-50 p-3 text-emerald-600", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PackageIcon, {}) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-slate-500", children: "Active Products" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-3xl font-bold tracking-tight text-slate-900", children: activeProducts }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-emerald-600", children: "Currently available" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl bg-blue-50 p-3 text-blue-600", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StockIcon, {}) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-slate-500", children: "Out of Stock" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-3xl font-bold tracking-tight text-slate-900", children: outOfStockProducts }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-red-500", children: "Restock required" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl bg-red-50 p-3 text-red-600", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StockIcon, {}) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3 xl:flex-row xl:items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SearchIcon$2, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              className: "h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-10 text-sm outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-50",
              placeholder: "Search products, SKU or barcode...",
              value: search,
              onChange: (e) => setSearch(e.target.value)
            }
          ),
          search && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setSearch(""),
              className: "absolute right-3 top-1/2 -translate-y-1/2 text-lg text-slate-400 transition hover:text-slate-700",
              children: "×"
            }
          ),
          searching && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute right-10 top-1/2 -translate-y-1/2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-500" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            value: categoryFilter,
            onChange: (e) => setCategoryFilter(
              e.target.value
            ),
            className: "h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-50",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "ALL", children: "All Categories" }),
              categories.map(
                (category) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "option",
                  {
                    value: category.id,
                    children: category.name
                  },
                  category.id
                )
              )
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            value: stockFilter,
            onChange: (e) => setStockFilter(
              e.target.value
            ),
            className: "h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-50",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "ALL", children: "All Stock" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "HEALTHY", children: "In Stock" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "OUT", children: "Out of Stock" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-11 items-center rounded-xl border border-slate-200 bg-slate-50 p-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setViewMode("grid"),
              className: `flex h-9 items-center justify-center rounded-lg px-3 transition ${viewMode === "grid" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400 hover:text-slate-700"}`,
              title: "Grid view",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(GridIcon, {})
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setViewMode("list"),
              className: `flex h-9 items-center justify-center rounded-lg px-3 transition ${viewMode === "list" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400 hover:text-slate-700"}`,
              title: "List view",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(ListIcon, {})
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-slate-400", children: [
          "Showing",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-slate-600", children: filteredProducts.length }),
          " ",
          "of",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-slate-600", children: products.length }),
          " ",
          "products"
        ] }),
        (categoryFilter !== "ALL" || stockFilter !== "ALL" || search) && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => {
              setSearch("");
              setCategoryFilter("ALL");
              setStockFilter("ALL");
            },
            className: "text-xs font-semibold text-emerald-600 hover:text-emerald-700",
            children: "Clear filters"
          }
        )
      ] })
    ] }),
    initialLoading ? (
      /*
       * ONLY FIRST LOAD SHOWS SKELETON.
       *
       * Search does NOT reach this branch.
       */
      /* @__PURE__ */ jsxRuntimeExports.jsx(ProductSkeleton, {})
    ) : filteredProducts.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PackageIcon, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-4 text-base font-semibold text-slate-800", children: "No products found" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mx-auto mt-1 max-w-md text-sm text-slate-500", children: "Try changing your search or filters, or create a new product." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: openCreate,
          className: "mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(PlusIcon$3, {}),
            "Create Product"
          ]
        }
      )
    ] }) : viewMode === "grid" ? (
      /* =================================================
         GRID VIEW
      ================================================= */
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3", children: filteredProducts.map((p2) => {
        const stock = Number(p2.currentStock);
        const isOut = stock <= 0;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    ProductVisual,
                    {
                      name: p2.name
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "truncate text-base font-bold text-slate-900", children: p2.name }),
                        p2.packSize && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 text-xs text-slate-500", children: formatPackSize(
                          p2
                        ) })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "span",
                        {
                          className: `shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${p2.status.toUpperCase() === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`,
                          children: p2.status
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-xs text-slate-400", children: [
                      "SKU:",
                      " ",
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-slate-600", children: p2.sku || "Not assigned" })
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5 flex items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600", children: p2.category?.name || "Uncategorized" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5 flex items-end justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-slate-400", children: "Current Stock" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "p",
                    {
                      className: `mt-1 text-lg font-bold ${isOut ? "text-red-600" : "text-emerald-600"}`,
                      children: [
                        stock,
                        " ",
                        p2.unit?.abbreviation
                      ]
                    }
                  )
                ] }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-slate-100 bg-slate-50/70 px-5 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: () => openEdit(p2),
                    className: "flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(EditIcon$1, {}),
                      "Edit Product"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: () => openAdjust(p2),
                    className: "flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-emerald-700",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(AdjustIcon, {}),
                      "Adjust Stock"
                    ]
                  }
                )
              ] }) })
            ]
          },
          p2.id
        );
      }) })
    ) : (
      /* =================================================
         LIST VIEW
      ================================================= */
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "min-w-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "border-b border-slate-200 bg-slate-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400", children: "Product" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400", children: "Category" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-400", children: "Stock" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-400", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-400", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-slate-100", children: filteredProducts.map((p2) => {
          const stock = Number(p2.currentStock);
          const isOut = stock <= 0;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "tr",
            {
              className: "group transition hover:bg-slate-50/80",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    ProductVisual,
                    {
                      name: p2.name
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-slate-900", children: displayName(
                      p2
                    ) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-0.5 text-xs text-slate-400", children: [
                      "SKU:",
                      " ",
                      p2.sku || "Not assigned"
                    ] })
                  ] })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600", children: p2.category?.name || "Uncategorized" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-4 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "p",
                  {
                    className: `font-bold ${isOut ? "text-red-600" : "text-emerald-600"}`,
                    children: [
                      stock,
                      " ",
                      p2.unit?.abbreviation
                    ]
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-4 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: `rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${p2.status.toUpperCase() === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`,
                    children: p2.status
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      type: "button",
                      onClick: () => openEdit(p2),
                      className: "inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(EditIcon$1, {}),
                        "Edit"
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      type: "button",
                      onClick: () => openAdjust(p2),
                      className: "inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(AdjustIcon, {}),
                        "Stock"
                      ]
                    }
                  )
                ] }) })
              ]
            },
            p2.id
          );
        }) })
      ] }) }) })
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Modal,
      {
        open: modalOpen,
        title: editingId ? "Edit Product" : "Create New Product",
        onClose: () => setModalOpen(false),
        wide: true,
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "form",
          {
            onSubmit: handleSubmit,
            className: "space-y-5",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-slate-200 bg-slate-50 p-5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-slate-900", children: "Product Information" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-slate-500", children: "Basic information about this product." })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Product name", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      required: true,
                      placeholder: "e.g. Minikate Rice",
                      value: form.name,
                      onChange: (e) => setForm({
                        ...form,
                        name: e.target.value
                      })
                    }
                  ) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Category", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      Select,
                      {
                        required: true,
                        value: form.categoryId,
                        onChange: (e) => setForm({
                          ...form,
                          categoryId: e.target.value,
                          subcategoryId: ""
                        }),
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select category..." }),
                          categories.map(
                            (c) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "option",
                              {
                                value: c.id,
                                children: c.name
                              },
                              c.id
                            )
                          )
                        ]
                      }
                    ) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Subcategory", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      Select,
                      {
                        value: form.subcategoryId,
                        onChange: (e) => setForm({
                          ...form,
                          subcategoryId: e.target.value
                        }),
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "None" }),
                          selectedCategory?.subcategories.map(
                            (s) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "option",
                              {
                                value: s.id,
                                children: s.name
                              },
                              s.id
                            )
                          )
                        ]
                      }
                    ) })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "SKU", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        placeholder: "Optional",
                        value: form.sku,
                        onChange: (e) => setForm({
                          ...form,
                          sku: e.target.value
                        })
                      }
                    ) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Barcode", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        placeholder: "Optional",
                        value: form.barcode,
                        onChange: (e) => setForm({
                          ...form,
                          barcode: e.target.value
                        })
                      }
                    ) })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-slate-200 bg-white p-5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-slate-900", children: "Packaging" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-slate-500", children: "Define the unit and package size." })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Unit", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Select,
                    {
                      required: true,
                      value: form.unitId,
                      onChange: (e) => setForm({
                        ...form,
                        unitId: e.target.value
                      }),
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select unit..." }),
                        units.map((u2) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "option",
                          {
                            value: u2.id,
                            children: [
                              u2.name,
                              " (",
                              u2.abbreviation,
                              ")"
                            ]
                          },
                          u2.id
                        ))
                      ]
                    }
                  ) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Field,
                    {
                      label: `Pack size (optional)${selectedUnit ? ` — ${selectedUnit.abbreviation}` : ""}`,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Input,
                        {
                          type: "number",
                          min: 0,
                          step: packMustBeWhole ? 1 : "any",
                          placeholder: packMustBeWhole ? "e.g. 12" : "e.g. 500",
                          value: form.packSize,
                          onChange: (e) => setForm({
                            ...form,
                            packSize: e.target.value
                          })
                        }
                      )
                    }
                  )
                ] }),
                form.name && form.packSize && selectedUnit && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700", children: [
                  "Product will appear as",
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                    form.name,
                    " -",
                    " ",
                    Number(
                      form.packSize
                    ),
                    " ",
                    selectedUnit.abbreviation
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Description", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  placeholder: "Optional product description...",
                  value: form.description,
                  onChange: (e) => setForm({
                    ...form,
                    description: e.target.value
                  })
                }
              ) }),
              editingId && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700", children: "Current stock is not editable here. Use purchases, sales, returns or stock adjustments to change inventory." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  type: "submit",
                  className: "w-full rounded-xl py-3",
                  disabled: saving,
                  children: saving ? "Saving product..." : editingId ? "Save Changes" : "Create Product"
                }
              )
            ]
          }
        )
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Modal,
      {
        open: !!adjustTarget,
        title: adjustTarget ? `Adjust Stock — ${displayName(
          adjustTarget
        )}` : "Adjust Stock",
        onClose: () => setAdjustTarget(null),
        children: adjustTarget && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "form",
          {
            onSubmit: handleAdjust,
            className: "space-y-5",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-slate-900 p-5 text-white", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-slate-400", children: "Current stock" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-end justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-3xl font-bold", children: Number(
                    adjustTarget.currentStock
                  ) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "pb-1 text-sm text-slate-400", children: adjustTarget.unit?.abbreviation })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Action", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Select,
                  {
                    value: adjustForm.direction,
                    onChange: (e) => setAdjustForm({
                      ...adjustForm,
                      direction: e.target.value
                    }),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "ADD", children: "Add stock" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "REMOVE", children: "Remove stock" })
                    ]
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Field,
                  {
                    label: `Quantity (${adjustTarget.unit?.abbreviation ?? ""})`,
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        type: "number",
                        min: 0,
                        step: "any",
                        required: true,
                        autoFocus: true,
                        value: adjustForm.quantity,
                        onChange: (e) => setAdjustForm({
                          ...adjustForm,
                          quantity: e.target.value
                        })
                      }
                    )
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Reason", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  placeholder: "e.g. Stock count correction",
                  value: adjustForm.reason,
                  onChange: (e) => setAdjustForm({
                    ...adjustForm,
                    reason: e.target.value
                  })
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-500", children: "This creates an inventory movement." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  type: "submit",
                  className: "w-full rounded-xl py-3",
                  disabled: adjusting,
                  children: adjusting ? "Saving..." : "Apply Stock Adjustment"
                }
              )
            ]
          }
        )
      }
    )
  ] });
}
function Card({ children, className = "" }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 ${className}`, children });
}
function PlusIcon$2() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "svg",
    {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 5v14M5 12h14" })
    }
  );
}
function EditIcon() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "svg",
    {
      width: "15",
      height: "15",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 20h9" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" })
      ]
    }
  );
}
function TrashIcon$1() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "svg",
    {
      width: "15",
      height: "15",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M3 6h18" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M8 6V4h8v2" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M19 6l-1 14H6L5 6" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M10 11v5M14 11v5" })
      ]
    }
  );
}
function FolderIcon() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "svg",
    {
      width: "20",
      height: "20",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M3 7.5A2.5 2.5 0 0 1 5.5 5H10l2 2h6.5A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5Z" })
    }
  );
}
function ChevronIcon({ open }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "svg",
    {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      className: `transition-transform duration-200 ${open ? "rotate-180" : ""}`,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "m6 9 6 6 6-6" })
    }
  );
}
function CategoriesPage() {
  const [categories, setCategories] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [categoryModalOpen, setCategoryModalOpen] = reactExports.useState(false);
  const [editingCategory, setEditingCategory] = reactExports.useState(
    null
  );
  const [categoryName, setCategoryName] = reactExports.useState("");
  const [categoryDescription, setCategoryDescription] = reactExports.useState("");
  const [savingCategory, setSavingCategory] = reactExports.useState(false);
  const [subModalOpen, setSubModalOpen] = reactExports.useState(false);
  const [subModalCategoryId, setSubModalCategoryId] = reactExports.useState(
    null
  );
  const [editingSubcategory, setEditingSubcategory] = reactExports.useState(null);
  const [subName, setSubName] = reactExports.useState("");
  const [savingSubcategory, setSavingSubcategory] = reactExports.useState(false);
  const [deleteCategoryTarget, setDeleteCategoryTarget] = reactExports.useState(null);
  const [deleteSubTarget, setDeleteSubTarget] = reactExports.useState(null);
  const [deleting, setDeleting] = reactExports.useState(false);
  const [expanded, setExpanded] = reactExports.useState({});
  const push = useToastStore((s) => s.push);
  async function load() {
    setLoading(true);
    try {
      const result = await call("catalog:categories:list");
      setCategories(result);
      const expandedState = {};
      result.forEach((category) => {
        expandedState[category.id] = true;
      });
      setExpanded(expandedState);
    } catch (err) {
      push(
        err instanceof Error ? err.message : "Failed to load categories",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }
  reactExports.useEffect(() => {
    load();
  }, []);
  function openCreateCategory() {
    setEditingCategory(null);
    setCategoryName("");
    setCategoryDescription("");
    setCategoryModalOpen(true);
  }
  function openEditCategory(category) {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryDescription(category.description ?? "");
    setCategoryModalOpen(true);
  }
  async function handleSaveCategory(e) {
    e.preventDefault();
    const trimmedName = categoryName.trim();
    if (!trimmedName) {
      push("Category name is required.", "error");
      return;
    }
    setSavingCategory(true);
    try {
      if (editingCategory) {
        await call("catalog:categories:update", {
          id: editingCategory.id,
          name: trimmedName,
          description: categoryDescription.trim() || null
        });
        push("Category updated successfully.", "success");
      } else {
        await call("catalog:categories:create", {
          name: trimmedName,
          description: categoryDescription.trim() || void 0
        });
        push("Category created successfully.", "success");
      }
      setCategoryModalOpen(false);
      setEditingCategory(null);
      setCategoryName("");
      setCategoryDescription("");
      await load();
    } catch (err) {
      push(
        err instanceof Error ? err.message : "Failed to save category",
        "error"
      );
    } finally {
      setSavingCategory(false);
    }
  }
  async function handleDeleteCategory() {
    if (!deleteCategoryTarget) return;
    setDeleting(true);
    try {
      await call("catalog:categories:delete", {
        id: deleteCategoryTarget.id
      });
      push("Category deleted successfully.", "success");
      setDeleteCategoryTarget(null);
      await load();
    } catch (err) {
      push(
        err instanceof Error ? err.message : "Failed to delete category",
        "error"
      );
    } finally {
      setDeleting(false);
    }
  }
  function openCreateSubcategory(categoryId) {
    setSubModalCategoryId(categoryId);
    setEditingSubcategory(null);
    setSubName("");
    setSubModalOpen(true);
  }
  function openEditSubcategory(categoryId, subcategory) {
    setSubModalCategoryId(categoryId);
    setEditingSubcategory(subcategory);
    setSubName(subcategory.name);
    setSubModalOpen(true);
  }
  async function handleSaveSubcategory(e) {
    e.preventDefault();
    if (!subModalCategoryId) return;
    const trimmedName = subName.trim();
    if (!trimmedName) {
      push("Subcategory name is required.", "error");
      return;
    }
    setSavingSubcategory(true);
    try {
      if (editingSubcategory) {
        await call("catalog:subcategories:update", {
          id: editingSubcategory.id,
          name: trimmedName
        });
        push("Subcategory updated successfully.", "success");
      } else {
        await call("catalog:subcategories:create", {
          categoryId: subModalCategoryId,
          name: trimmedName
        });
        push("Subcategory created successfully.", "success");
      }
      setSubModalOpen(false);
      setSubModalCategoryId(null);
      setEditingSubcategory(null);
      setSubName("");
      await load();
    } catch (err) {
      push(
        err instanceof Error ? err.message : "Failed to save subcategory",
        "error"
      );
    } finally {
      setSavingSubcategory(false);
    }
  }
  async function handleDeleteSubcategory() {
    if (!deleteSubTarget) return;
    setDeleting(true);
    try {
      await call("catalog:subcategories:delete", {
        id: deleteSubTarget.subcategory.id
      });
      push("Subcategory deleted successfully.", "success");
      setDeleteSubTarget(null);
      await load();
    } catch (err) {
      push(
        err instanceof Error ? err.message : "Failed to delete subcategory",
        "error"
      );
    } finally {
      setDeleting(false);
    }
  }
  function toggleCategory(id2) {
    setExpanded((current) => ({
      ...current,
      [id2]: !current[id2]
    }));
  }
  const totalSubcategories = categories.reduce(
    (total, category) => total + category.subcategories.length,
    0
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-full space-y-6 pb-10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FolderIcon, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold tracking-tight text-slate-900", children: "Categories" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 text-sm text-slate-500", children: "Organize your products into categories and subcategories." })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          onClick: openCreateCategory,
          className: "inline-flex items-center justify-center gap-2 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(PlusIcon$2, {}),
            "New Category"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-3 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium uppercase tracking-wider text-slate-400", children: "Total Categories" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-2xl font-bold text-slate-900", children: categories.length })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FolderIcon, {}) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium uppercase tracking-wider text-slate-400", children: "Total Subcategories" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-2xl font-bold text-slate-900", children: totalSubcategories })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "svg",
          {
            width: "19",
            height: "19",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "1.8",
            strokeLinecap: "round",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M8 6h13M8 12h13M8 18h13" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M3 6h.01M3 12h.01M3 18h.01" })
            ]
          }
        ) })
      ] }) })
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-4 lg:grid-cols-2", children: [1, 2, 3, 4].map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "h-52 animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-5 w-40 rounded bg-slate-100" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5 h-3 w-24 rounded bg-slate-100" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 h-10 rounded-lg bg-slate-50" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 h-10 rounded-lg bg-slate-50" })
        ]
      },
      item
    )) }) : categories.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-dashed", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center px-6 py-16 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FolderIcon, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-5 text-lg font-semibold text-slate-900", children: "No categories yet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 max-w-sm text-sm text-slate-500", children: "Create your first category to start organizing your product catalog." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          onClick: openCreateCategory,
          className: "mt-5 inline-flex items-center gap-2",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(PlusIcon$2, {}),
            "Create Category"
          ]
        }
      )
    ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-5 xl:grid-cols-2", children: categories.map((category) => {
      const isOpen = expanded[category.id] ?? true;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-500 via-brand-400 to-emerald-400" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4 p-5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: () => toggleCategory(category.id),
                    className: "flex min-w-0 flex-1 items-start gap-3 text-left",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-transform duration-200 group-hover:scale-105", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FolderIcon, {}) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "truncate text-base font-bold text-slate-900", children: category.name }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-slate-500", children: [
                          category.subcategories.length,
                          " ",
                          category.subcategories.length === 1 ? "subcategory" : "subcategories"
                        ] })
                      ] })
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex shrink-0 items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      title: "Edit category",
                      onClick: () => openEditCategory(category),
                      className: "flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(EditIcon, {})
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      title: "Delete category",
                      onClick: () => setDeleteCategoryTarget(category),
                      className: "flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-red-50 hover:text-red-600",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(TrashIcon$1, {})
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => toggleCategory(category.id),
                      className: "ml-1 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronIcon, { open: isOpen })
                    }
                  )
                ] })
              ] }),
              category.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-5 pb-4 text-sm text-slate-500", children: category.description })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: `grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`,
                children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-slate-100 bg-slate-50/60 px-5 py-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      type: "button",
                      onClick: () => openCreateSubcategory(category.id),
                      className: "mb-3 inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-brand-600 transition-colors hover:bg-brand-50",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(PlusIcon$2, {}),
                        "Add Subcategory"
                      ]
                    }
                  ),
                  category.subcategories.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-400", children: "No subcategories yet" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        type: "button",
                        onClick: () => openCreateSubcategory(category.id),
                        className: "mt-1 text-xs font-medium text-brand-600 hover:underline",
                        children: "Add the first one"
                      }
                    )
                  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: category.subcategories.map(
                    (subcategory) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "div",
                      {
                        className: "group/sub flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition-all duration-200 hover:border-slate-300 hover:shadow-sm",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 items-center gap-3", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 w-2 shrink-0 rounded-full bg-brand-500" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate text-sm font-medium text-slate-700", children: subcategory.name })
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex shrink-0 items-center gap-1 opacity-70 transition-opacity group-hover/sub:opacity-100", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "button",
                              {
                                type: "button",
                                title: "Edit subcategory",
                                onClick: () => openEditSubcategory(
                                  category.id,
                                  subcategory
                                ),
                                className: "flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700",
                                children: /* @__PURE__ */ jsxRuntimeExports.jsx(EditIcon, {})
                              }
                            ),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "button",
                              {
                                type: "button",
                                title: "Delete subcategory",
                                onClick: () => setDeleteSubTarget({
                                  categoryId: category.id,
                                  subcategory
                                }),
                                className: "flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600",
                                children: /* @__PURE__ */ jsxRuntimeExports.jsx(TrashIcon$1, {})
                              }
                            )
                          ] })
                        ]
                      },
                      subcategory.id
                    )
                  ) })
                ] }) })
              }
            )
          ]
        },
        category.id
      );
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Modal,
      {
        open: categoryModalOpen,
        title: editingCategory ? "Edit Category" : "Create New Category",
        onClose: () => {
          if (!savingCategory) {
            setCategoryModalOpen(false);
          }
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "form",
          {
            onSubmit: handleSaveCategory,
            className: "space-y-5",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Category name", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  required: true,
                  autoFocus: true,
                  placeholder: "e.g. Drinks & Beverages",
                  value: categoryName,
                  onChange: (e) => setCategoryName(e.target.value)
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Description (optional)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  placeholder: "Short description of this category",
                  value: categoryDescription,
                  onChange: (e) => setCategoryDescription(e.target.value)
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  type: "submit",
                  className: "w-full",
                  disabled: savingCategory,
                  children: savingCategory ? "Saving..." : editingCategory ? "Save Changes" : "Create Category"
                }
              )
            ]
          }
        )
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Modal,
      {
        open: subModalOpen,
        title: editingSubcategory ? "Edit Subcategory" : "Add Subcategory",
        onClose: () => {
          if (!savingSubcategory) {
            setSubModalOpen(false);
          }
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "form",
          {
            onSubmit: handleSaveSubcategory,
            className: "space-y-5",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Subcategory name", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  required: true,
                  autoFocus: true,
                  placeholder: "e.g. Soft Drinks",
                  value: subName,
                  onChange: (e) => setSubName(e.target.value)
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  type: "submit",
                  className: "w-full",
                  disabled: savingSubcategory,
                  children: savingSubcategory ? "Saving..." : editingSubcategory ? "Save Changes" : "Create Subcategory"
                }
              )
            ]
          }
        )
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Modal,
      {
        open: !!deleteCategoryTarget,
        title: "Delete Category?",
        onClose: () => {
          if (!deleting) {
            setDeleteCategoryTarget(null);
          }
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 rounded-xl border border-red-100 bg-red-50 p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TrashIcon$1, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-semibold text-red-900", children: [
                'Delete "',
                deleteCategoryTarget?.name,
                '"?'
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs leading-5 text-red-700", children: "This action cannot be undone. If products or subcategories are using this category, the system may prevent deletion." })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "button",
                variant: "secondary",
                className: "flex-1",
                disabled: deleting,
                onClick: () => setDeleteCategoryTarget(null),
                children: "Cancel"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                disabled: deleting,
                onClick: handleDeleteCategory,
                className: "flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60",
                children: deleting ? "Deleting..." : "Delete Category"
              }
            )
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Modal,
      {
        open: !!deleteSubTarget,
        title: "Delete Subcategory?",
        onClose: () => {
          if (!deleting) {
            setDeleteSubTarget(null);
          }
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 rounded-xl border border-red-100 bg-red-50 p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TrashIcon$1, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-semibold text-red-900", children: [
                'Delete "',
                deleteSubTarget?.subcategory.name,
                '"?'
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs leading-5 text-red-700", children: "This subcategory will be removed from the category." })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "button",
                variant: "secondary",
                className: "flex-1",
                disabled: deleting,
                onClick: () => setDeleteSubTarget(null),
                children: "Cancel"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                disabled: deleting,
                onClick: handleDeleteSubcategory,
                className: "flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60",
                children: deleting ? "Deleting..." : "Delete Subcategory"
              }
            )
          ] })
        ] })
      }
    )
  ] });
}
function DataTable({
  columns,
  rows,
  keyFor,
  emptyMessage = "No records found.",
  loading = false
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto rounded-xl border border-slate-100", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "min-w-full divide-y divide-slate-100 text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-slate-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: columns.map((col) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left font-medium text-slate-500", children: col.header }, col.header)) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-slate-100 bg-white", children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: columns.length, className: "px-4 py-8 text-center text-slate-400", children: "Loading…" }) }) : rows.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: columns.length, className: "px-4 py-8 text-center text-slate-400", children: emptyMessage }) }) : rows.map((row) => /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "hover:bg-brand-50/40", children: columns.map((col) => /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: `px-4 py-3 text-slate-700 ${col.className ?? ""}`, children: col.accessor(row) }, col.header)) }, keyFor(row))) })
  ] }) });
}
const SUPPLIER_RETURN_REASONS = [
  "EXPIRED",
  "NEAR_EXPIRY",
  "DAMAGED",
  "DEFECTIVE",
  "QUALITY_ISSUE",
  "OTHER"
];
const readableReason = (value) => value.replace(/_/g, " ").toLowerCase().replace(/^./, (c) => c.toUpperCase());
const DASH$7 = "—";
function InventoryPage() {
  const [batches, setBatches] = reactExports.useState([]);
  const [expiring, setExpiring] = reactExports.useState([]);
  const [expired, setExpired] = reactExports.useState([]);
  const [lowStock, setLowStock] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [editing, setEditing] = reactExports.useState(null);
  const [editForm, setEditForm] = reactExports.useState({
    expiryDate: "",
    manufacturingDate: "",
    notes: ""
  });
  const [handling, setHandling] = reactExports.useState(null);
  const [handleForm, setHandleForm] = reactExports.useState({
    action: "RETURN",
    quantity: "",
    reason: "EXPIRED",
    creditAmount: "",
    settlementType: "CREDIT",
    notes: ""
  });
  const [saving, setSaving] = reactExports.useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get("view") ?? "all";
  const push = useToastStore((s) => s.push);
  async function load() {
    setLoading(true);
    try {
      const [all, soon, gone, low] = await Promise.all([
        call("inventory:batches"),
        call("inventory:expiringBatches"),
        call("inventory:expiredBatches"),
        call("products:lowStock")
      ]);
      setBatches(all);
      setExpiring(soon);
      setExpired(gone);
      setLowStock(low);
    } catch (err) {
      push(
        err instanceof Error ? err.message : "Failed to load inventory",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }
  reactExports.useEffect(() => {
    load();
  }, []);
  function toDateInput(value) {
    return value ? new Date(value).toISOString().slice(0, 10) : "";
  }
  function openEdit(b) {
    setEditForm({
      expiryDate: toDateInput(b.expiryDate),
      manufacturingDate: toDateInput(b.manufacturingDate),
      notes: b.notes ?? ""
    });
    setEditing(b);
  }
  const visibleBatches = reactExports.useMemo(() => {
    if (view === "expiring") {
      const ids = new Set(expiring.map((b) => b.id));
      return batches.filter((b) => ids.has(b.id));
    }
    if (view === "expired") {
      const ids = new Set(expired.map((b) => b.id));
      return batches.filter(
        (b) => ids.has(b.id) || b.derivedStatus === "EXPIRED"
      );
    }
    return batches;
  }, [batches, expiring, expired, view]);
  const needsHandling = (b) => Number(b.remainingQuantity) > 0 && (b.severity === "EXPIRED" || b.severity === "CRITICAL" || b.severity === "URGENT" || b.severity === "WARNING");
  function openHandle(b) {
    setHandleForm({
      action: b.purchaseId ? "RETURN" : "DISCARD",
      quantity: String(Number(b.remainingQuantity)),
      reason: b.severity === "EXPIRED" ? "EXPIRED" : "NEAR_EXPIRY",
      creditAmount: "",
      settlementType: "CREDIT",
      notes: ""
    });
    setHandling(b);
  }
  async function handleBatchAction(e) {
    e.preventDefault();
    if (!handling) return;
    const quantity = Number(handleForm.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      push("Quantity must be greater than zero.", "error");
      return;
    }
    if (quantity > Number(handling.remainingQuantity)) {
      push(
        `Only ${Number(handling.remainingQuantity)} unit(s) remain in this batch.`,
        "error"
      );
      return;
    }
    setSaving(true);
    try {
      if (handleForm.action === "RETURN") {
        if (!handling.purchaseId) {
          push(
            "This batch has no linked purchase, so it cannot be returned to a supplier.",
            "error"
          );
          return;
        }
        await call("supplierReturns:create", {
          purchaseId: handling.purchaseId,
          batchId: handling.id,
          quantity,
          reason: handleForm.reason,
          notes: handleForm.notes || void 0,
          settlementType: handleForm.settlementType,
          returnValue: handleForm.creditAmount === "" ? void 0 : Number(handleForm.creditAmount)
        });
        push(
          "Returned to supplier — stock and payable updated.",
          "success"
        );
      } else {
        await call("inventory:writeOffBatch", {
          batchId: handling.id,
          quantity,
          reason: handleForm.reason === "EXPIRED" ? "EXPIRED" : "DAMAGED",
          notes: handleForm.notes || void 0
        });
        push(
          "Recorded as inventory loss — stock updated.",
          "success"
        );
      }
      setHandling(null);
      await load();
      call("notifications:refresh").catch(() => {
      });
    } catch (err) {
      push(
        err instanceof Error ? err.message : "Failed to handle batch",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }
  async function handleEdit(e) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      await call("inventory:updateBatch", {
        id: editing.id,
        expiryDate: editForm.expiryDate || null,
        manufacturingDate: editForm.manufacturingDate || null,
        notes: editForm.notes || null
      });
      push("Batch updated.", "success");
      setEditing(null);
      await load();
      call("notifications:refresh").catch(() => {
      });
    } catch (err) {
      push(
        err instanceof Error ? err.message : "Failed to update batch",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }
  const totalUnits = batches.reduce(
    (sum, b) => sum + Number(b.remainingQuantity || 0),
    0
  );
  batches.reduce(
    (sum, b) => sum + Number(b.quantityReceived || 0),
    0
  );
  batches.reduce(
    (sum, b) => sum + Number(b.quantitySold || 0),
    0
  );
  const inventoryValue = batches.reduce(
    (sum, b) => sum + Number(b.remainingQuantity || 0) * Number(b.purchasePrice || 0),
    0
  );
  const getStatusStyle = (status) => {
    const value = String(status ?? "").toUpperCase();
    if (value === "EXPIRED") {
      return "bg-red-50 text-red-700 border-red-200";
    }
    if (value === "CRITICAL") {
      return "bg-red-50 text-red-600 border-red-200";
    }
    if (value === "URGENT") {
      return "bg-orange-50 text-orange-700 border-orange-200";
    }
    if (value === "WARNING") {
      return "bg-amber-50 text-amber-700 border-amber-200";
    }
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  };
  const getStatusDot = (status) => {
    const value = String(status ?? "").toUpperCase();
    if (value === "EXPIRED" || value === "CRITICAL") {
      return "bg-red-500";
    }
    if (value === "URGENT" || value === "WARNING") {
      return "bg-amber-500";
    }
    return "bg-emerald-500";
  };
  const getDaysBadge = (b) => {
    if (b.daysRemaining === null || b.daysRemaining === void 0) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500", children: DASH$7 });
    }
    const days = Number(b.daysRemaining);
    if (days < 0) {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600 ring-1 ring-inset ring-red-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-red-500" }),
        Math.abs(days),
        "d overdue"
      ] });
    }
    if (days <= 7) {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600 ring-1 ring-inset ring-red-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" }),
        days,
        "d left"
      ] });
    }
    if (days <= 30) {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 ring-1 ring-inset ring-amber-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-amber-500" }),
        days,
        "d left"
      ] });
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-emerald-500" }),
      days,
      "d left"
    ] });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-full space-y-7 pb-10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -right-20 -top-24 h-64 w-64 rounded-full bg-brand-100/50 blur-3xl" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-emerald-100/40 blur-3xl" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-700", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2 w-2 animate-pulse rounded-full bg-brand-500" }),
            "Live Inventory"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl", children: "Inventory" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base", children: "Complete batch visibility with stock levels, supplier traceability, expiry monitoring and inventory health." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 backdrop-blur", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xl shadow-sm", children: "📦" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-slate-400", children: "Active batches" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold text-slate-900", children: batches.length })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -right-6 -top-6 h-20 w-20 rounded-full bg-blue-50 transition-transform duration-500 group-hover:scale-150" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-start justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold uppercase tracking-wider text-slate-400", children: "Stock on Hand" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-3xl font-bold tracking-tight text-slate-900", children: totalUnits.toLocaleString() }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-slate-400", children: "Total remaining units" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-lg", children: "📦" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -right-6 -top-6 h-20 w-20 rounded-full bg-emerald-50 transition-transform duration-500 group-hover:scale-150" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-start justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold uppercase tracking-wider text-slate-400", children: "Inventory Value" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-2xl font-bold tracking-tight text-slate-900", children: formatBDT(inventoryValue) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-slate-400", children: "Based on remaining stock" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-lg", children: "৳" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -right-6 -top-6 h-20 w-20 rounded-full bg-amber-50 transition-transform duration-500 group-hover:scale-150" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-start justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold uppercase tracking-wider text-slate-400", children: "Expiring Soon" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-3xl font-bold tracking-tight text-slate-900", children: expiring.length }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-amber-600", children: "Needs attention" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-lg", children: "⏳" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -right-6 -top-6 h-20 w-20 rounded-full bg-red-50 transition-transform duration-500 group-hover:scale-150" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-start justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold uppercase tracking-wider text-slate-400", children: "Expired" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-3xl font-bold tracking-tight text-slate-900", children: expired.length }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-red-600", children: "Excluded from selling" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-lg", children: "⚠️" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold text-slate-900", children: view === "expiring" ? "Expiring Soon Batches" : view === "expired" ? "Expired Batches" : "All Batches" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500", children: visibleBatches.length })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-slate-400", children: "Monitor stock movement and batch-level traceability." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "inline-flex w-fit rounded-xl border border-slate-200 bg-slate-50 p-1", children: [
          ["all", "All"],
          ["expiring", "Expiring Soon"],
          ["expired", "Expired"]
        ].map(([key, text]) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setSearchParams(key === "all" ? {} : { view: key }),
            className: `rounded-lg px-4 py-2 text-xs font-bold transition-all duration-200 ${view === key ? "bg-white text-brand-700 shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:bg-white/70 hover:text-slate-800"}`,
            children: text
          },
          key
        )) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-hidden rounded-2xl border border-slate-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        DataTable,
        {
          loading,
          rows: visibleBatches,
          keyFor: (b) => b.id,
          emptyMessage: view === "all" ? "No batches yet. Receive stock from Purchases to create one." : "No batches in this view.",
          columns: [
            {
              header: "Product",
              accessor: (b) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-[180px]", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-slate-800", children: b.product.name }),
                b.product.unit?.abbreviation && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-0.5 text-[11px] text-slate-400", children: [
                  "Unit: ",
                  b.product.unit.abbreviation
                ] })
              ] })
            },
            {
              header: "SKU",
              accessor: (b) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-lg bg-slate-100 px-2 py-1 font-mono text-xs text-slate-600", children: b.product.sku || DASH$7 })
            },
            {
              header: "Batch",
              accessor: (b) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs font-bold text-brand-700", children: b.batchCode })
            },
            {
              header: "Supplier",
              accessor: (b) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-slate-600", children: b.supplier?.name ?? DASH$7 })
            },
            {
              header: "Purchase #",
              accessor: (b) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs text-slate-500", children: b.purchase?.purchaseNumber ?? DASH$7 })
            },
            {
              header: "Purchase Date",
              accessor: (b) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "whitespace-nowrap text-sm text-slate-500", children: formatDate(b.purchaseDate) })
            },
            {
              header: "Received",
              accessor: (b) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-slate-700", children: Number(b.quantityReceived) })
            },
            {
              header: "Remaining",
              accessor: (b) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex min-w-12 items-center justify-center rounded-lg bg-brand-50 px-2.5 py-1 font-bold text-brand-700", children: Number(b.remainingQuantity) })
            },
            {
              header: "Sold",
              accessor: (b) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-slate-600", children: b.quantitySold ?? DASH$7 })
            },
            {
              header: "Returned",
              accessor: (b) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-slate-600", children: Number(b.quantityReturned) })
            },
            {
              header: "Unit Cost",
              accessor: (b) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-slate-700", children: formatBDT(b.purchasePrice) })
            },
            {
              header: "Expiry",
              accessor: (b) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: b.expiryDate ? "whitespace-nowrap font-medium text-slate-600" : "text-slate-400",
                  children: b.expiryDate ? formatDate(b.expiryDate) : DASH$7
                }
              )
            },
            {
              header: "Days Left",
              accessor: (b) => getDaysBadge(b)
            },
            {
              header: "Status",
              accessor: (b) => {
                const status = b.derivedStatus ?? b.status;
                return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "span",
                  {
                    className: `inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${getStatusStyle(
                      b.severity ?? status
                    )}`,
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "span",
                        {
                          className: `h-1.5 w-1.5 rounded-full ${getStatusDot(
                            b.severity ?? status
                          )}`
                        }
                      ),
                      status
                    ]
                  }
                );
              }
            },
            {
              header: "Actions",
              accessor: (b) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-[150px] flex-wrap gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "secondary",
                    className: "rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-transform duration-200 hover:-translate-y-0.5",
                    onClick: () => openEdit(b),
                    children: "Edit"
                  }
                ),
                needsHandling(b) && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "secondary",
                    className: "rounded-lg border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-700 transition-transform duration-200 hover:-translate-y-0.5 hover:bg-amber-100",
                    onClick: () => openHandle(b),
                    children: "Handle"
                  }
                )
              ] })
            }
          ]
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-5 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-lg", children: "⏳" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold text-slate-900", children: "Expiring Soon" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-400", children: "Batches inside the expiry alert window" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700", children: [
          expiring.length,
          " batches"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-hidden rounded-2xl border border-amber-100", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        DataTable,
        {
          rows: expiring,
          keyFor: (b) => b.id,
          emptyMessage: "Nothing expiring within the alert window.",
          columns: [
            {
              header: "Product",
              accessor: (b) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-slate-800", children: b.product.name })
            },
            {
              header: "Batch",
              accessor: (b) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs font-bold text-brand-700", children: b.batchCode })
            },
            {
              header: "Supplier",
              accessor: (b) => b.supplier?.name ?? DASH$7
            },
            {
              header: "Purchase Date",
              accessor: (b) => formatDate(b.purchaseDate)
            },
            {
              header: "Quantity",
              accessor: (b) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-lg bg-amber-50 px-2.5 py-1 font-bold text-amber-700", children: Number(b.remainingQuantity) })
            },
            {
              header: "Expiry",
              accessor: (b) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-slate-700", children: b.expiryDate ? formatDate(b.expiryDate) : DASH$7 })
            },
            {
              header: "Days Remaining",
              accessor: (b) => getDaysBadge(b)
            }
          ]
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-5 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-lg", children: "⚠️" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold text-slate-900", children: "Expired Stock" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-400", children: "Excluded from sellable stock" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700", children: [
          expired.length,
          " batches"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-hidden rounded-2xl border border-red-100", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        DataTable,
        {
          rows: expired,
          keyFor: (b) => b.id,
          emptyMessage: "No expired batches.",
          columns: [
            {
              header: "Product",
              accessor: (b) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-slate-800", children: b.product.name })
            },
            {
              header: "Batch",
              accessor: (b) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs font-bold text-red-600", children: b.batchCode })
            },
            {
              header: "Supplier",
              accessor: (b) => b.supplier?.name ?? DASH$7
            },
            {
              header: "Purchase Date",
              accessor: (b) => formatDate(b.purchaseDate)
            },
            {
              header: "Quantity",
              accessor: (b) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-lg bg-red-50 px-2.5 py-1 font-bold text-red-700", children: Number(b.remainingQuantity) })
            },
            {
              header: "Expiry",
              accessor: (b) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-red-600", children: b.expiryDate ? formatDate(b.expiryDate) : DASH$7 })
            }
          ]
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-5 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-lg", children: "📉" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold text-slate-900", children: "Low Stock" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-400", children: "Products approaching minimum stock levels" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-700", children: [
          lowStock.length,
          " products"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-hidden rounded-2xl border border-orange-100", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        DataTable,
        {
          rows: lowStock,
          keyFor: (p2) => p2.id,
          emptyMessage: "All products are above their minimum stock level.",
          columns: [
            {
              header: "Product",
              accessor: (p2) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-slate-800", children: p2.name })
            },
            {
              header: "SKU",
              accessor: (p2) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-lg bg-slate-100 px-2 py-1 font-mono text-xs text-slate-600", children: p2.sku || DASH$7 })
            },
            {
              header: "Current Stock",
              accessor: (p2) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex rounded-lg bg-orange-50 px-3 py-1 font-bold text-orange-700", children: Number(p2.currentStock) })
            },
            {
              header: "Minimum Stock",
              accessor: (p2) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-slate-600", children: Number(p2.minimumStock) })
            }
          ]
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Modal,
      {
        open: !!editing,
        title: editing ? `Edit Batch ${editing.batchCode}` : "Edit Batch",
        onClose: () => setEditing(null),
        children: editing && /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleEdit, className: "space-y-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-slate-200 bg-slate-50 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("dl", { className: "grid grid-cols-2 gap-x-6 gap-y-4 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-xs font-medium uppercase tracking-wide text-slate-400", children: "Product" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "mt-1 font-bold text-slate-800", children: editing.product.name })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-xs font-medium uppercase tracking-wide text-slate-400", children: "Supplier" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "mt-1 font-bold text-slate-800", children: editing.supplier?.name ?? DASH$7 })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-xs font-medium uppercase tracking-wide text-slate-400", children: "Purchase" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "mt-1 font-mono text-xs font-bold text-brand-700", children: editing.purchase?.purchaseNumber ?? DASH$7 })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-xs font-medium uppercase tracking-wide text-slate-400", children: "Remaining" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "mt-1 font-bold text-slate-800", children: Number(editing.remainingQuantity) })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Manufacturing date", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "date",
                value: editForm.manufacturingDate,
                onChange: (e) => setEditForm({
                  ...editForm,
                  manufacturingDate: e.target.value
                })
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Expiry date", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "date",
                value: editForm.expiryDate,
                onChange: (e) => setEditForm({
                  ...editForm,
                  expiryDate: e.target.value
                })
              }
            ) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Batch notes", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: editForm.notes,
              onChange: (e) => setEditForm({
                ...editForm,
                notes: e.target.value
              })
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs leading-5 text-blue-700", children: "Batch, product, purchase links and quantities are protected. Only dates and notes can be corrected." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "submit",
              className: "w-full rounded-xl py-3 font-bold shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg",
              disabled: saving,
              children: saving ? "Saving…" : "Save Batch"
            }
          )
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Modal,
      {
        open: !!handling,
        title: handling ? `Handle Batch ${handling.batchCode}` : "Handle Batch",
        onClose: () => setHandling(null),
        children: handling && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "form",
          {
            onSubmit: handleBatchAction,
            className: "space-y-5",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-slate-200 bg-slate-50 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("dl", { className: "grid grid-cols-2 gap-x-6 gap-y-4 text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-xs font-medium uppercase tracking-wide text-slate-400", children: "Product" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "mt-1 font-bold text-slate-800", children: handling.product.name })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-xs font-medium uppercase tracking-wide text-slate-400", children: "Supplier" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "mt-1 font-bold text-slate-800", children: handling.supplier?.name ?? DASH$7 })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-xs font-medium uppercase tracking-wide text-slate-400", children: "Expiry" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("dd", { className: "mt-1 font-bold text-slate-800", children: [
                    handling.expiryDate ? formatDate(handling.expiryDate) : DASH$7,
                    handling.daysRemaining !== null && handling.daysRemaining !== void 0 ? ` (${handling.daysRemaining} days)` : ""
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-xs font-medium uppercase tracking-wide text-slate-400", children: "Remaining" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "mt-1 font-bold text-brand-700", children: Number(handling.remainingQuantity) })
                ] })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "What should happen to this stock?", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: handleForm.action,
                  onChange: (e) => setHandleForm({
                    ...handleForm,
                    action: e.target.value
                  }),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "option",
                      {
                        value: "RETURN",
                        disabled: !handling.purchaseId,
                        children: [
                          "Return to Supplier",
                          !handling.purchaseId ? " (no linked purchase)" : ""
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "DISCARD", children: "Discard / Damaged (inventory loss)" })
                  ]
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Quantity", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    type: "number",
                    min: 0,
                    step: "any",
                    max: Number(handling.remainingQuantity),
                    required: true,
                    value: handleForm.quantity,
                    onChange: (e) => setHandleForm({
                      ...handleForm,
                      quantity: e.target.value
                    })
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Reason", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Select,
                  {
                    value: handleForm.reason,
                    onChange: (e) => setHandleForm({
                      ...handleForm,
                      reason: e.target.value
                    }),
                    children: (handleForm.action === "RETURN" ? SUPPLIER_RETURN_REASONS : ["EXPIRED", "DAMAGED"]).map((r2) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: r2, children: readableReason(r2) }, r2))
                  }
                ) })
              ] }),
              handleForm.action === "RETURN" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "How is the supplier settling it?", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Select,
                  {
                    value: handleForm.settlementType,
                    onChange: (e) => setHandleForm({
                      ...handleForm,
                      settlementType: e.target.value
                    }),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "CREDIT", children: "Supplier Credit (applied to future purchases)" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "CASH_REFUND", children: "Cash Refund (money received back)" })
                    ]
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Field,
                  {
                    label: handleForm.settlementType === "CASH_REFUND" ? "Refund amount (optional)" : "Credit amount (optional)",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        type: "number",
                        min: 0,
                        step: "any",
                        placeholder: `Leave empty to use the original cost (${formatBDT(
                          Number(handling.purchasePrice) * Number(handleForm.quantity || 0)
                        )})`,
                        value: handleForm.creditAmount,
                        onChange: (e) => setHandleForm({
                          ...handleForm,
                          creditAmount: e.target.value
                        })
                      }
                    )
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Notes", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  value: handleForm.notes,
                  onChange: (e) => setHandleForm({
                    ...handleForm,
                    notes: e.target.value
                  })
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: `rounded-xl border p-3 text-xs leading-5 ${handleForm.action === "RETURN" ? "border-blue-100 bg-blue-50 text-blue-700" : "border-red-100 bg-red-50 text-red-700"}`,
                  children: handleForm.action === "RETURN" ? handleForm.settlementType === "CASH_REFUND" ? "The quantity leaves stock and the refund is recorded as money received — the supplier payable is unchanged." : "The quantity leaves stock and the value is held as supplier credit, applied automatically to what you owe and to future purchases." : "The quantity leaves stock and is recorded as an inventory loss — it is not posted to Expenses."
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  type: "submit",
                  className: "w-full rounded-xl py-3 font-bold shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg",
                  disabled: saving,
                  children: saving ? "Saving…" : handleForm.action === "RETURN" ? "Return to Supplier" : "Record Inventory Loss"
                }
              )
            ]
          }
        )
      }
    )
  ] });
}
const DASH$6 = "—";
const emptyForm = {
  name: "",
  company: "",
  phone: "",
  email: "",
  address: "",
  notes: "",
  status: "ACTIVE"
};
function initials(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "S";
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}
function supplierStatus(status) {
  const normalized = status.toUpperCase();
  if (normalized === "ACTIVE") {
    return {
      label: "Active",
      className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
      dot: "bg-emerald-500"
    };
  }
  if (normalized === "ARCHIVED") {
    return {
      label: "Archived",
      className: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
      dot: "bg-slate-400"
    };
  }
  return {
    label: status,
    className: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    dot: "bg-amber-500"
  };
}
function paymentStatus(status) {
  const value = status.toUpperCase();
  if (value.includes("PAID")) {
    return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
  }
  if (value.includes("PARTIAL")) {
    return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
  }
  if (value.includes("DUE") || value.includes("UNPAID")) {
    return "bg-red-50 text-red-700 ring-1 ring-red-200";
  }
  return "bg-slate-100 text-slate-600 ring-1 ring-slate-200";
}
function Badge({
  children,
  className = ""
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "span",
    {
      className: `inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${className}`,
      children
    }
  );
}
function StatusBadge$2({ status }) {
  const meta = supplierStatus(status);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: meta.className, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `mr-1.5 h-1.5 w-1.5 rounded-full ${meta.dot}` }),
    meta.label
  ] });
}
function FinancialCard({
  title,
  value,
  subtitle,
  icon,
  tone = "slate"
}) {
  const tones = {
    slate: {
      box: "bg-slate-50 text-slate-700",
      value: "text-slate-900"
    },
    green: {
      box: "bg-emerald-50 text-emerald-700",
      value: "text-emerald-700"
    },
    red: {
      box: "bg-red-50 text-red-700",
      value: "text-red-600"
    },
    blue: {
      box: "bg-blue-50 text-blue-700",
      value: "text-blue-700"
    },
    amber: {
      box: "bg-amber-50 text-amber-700",
      value: "text-amber-700"
    }
  };
  const selected = tones[tone];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-slate-500", children: title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `mt-2 text-2xl font-bold tracking-tight ${selected.value}`, children: value }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-slate-400", children: subtitle })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: `flex h-11 w-11 items-center justify-center rounded-xl text-lg ${selected.box}`,
          children: icon
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute -bottom-8 -right-8 h-20 w-20 rounded-full bg-slate-50 opacity-50 transition-transform duration-300 group-hover:scale-150" })
  ] });
}
function SuppliersPage() {
  const [suppliers, setSuppliers] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [modalOpen, setModalOpen] = reactExports.useState(false);
  const [editingId, setEditingId] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState(emptyForm);
  const [profile, setProfile] = reactExports.useState(null);
  const [profileLoading, setProfileLoading] = reactExports.useState(false);
  const [tab, setTab] = reactExports.useState("OVERVIEW");
  const [payTarget, setPayTarget] = reactExports.useState(null);
  const [payForm, setPayForm] = reactExports.useState({
    amount: "",
    method: "CASH",
    reference: "",
    notes: "",
    paymentDate: ""
  });
  const [saving, setSaving] = reactExports.useState(false);
  const [search, setSearch] = reactExports.useState("");
  const [statusFilter, setStatusFilter] = reactExports.useState("ALL");
  const push = useToastStore((s) => s.push);
  async function load() {
    setLoading(true);
    try {
      const result = await call("suppliers:list");
      setSuppliers(result);
    } catch (err) {
      push(
        err instanceof Error ? err.message : "Failed to load suppliers",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }
  reactExports.useEffect(() => {
    load();
  }, []);
  const filteredSuppliers = reactExports.useMemo(() => {
    const query = search.trim().toLowerCase();
    return suppliers.filter((supplier) => {
      const matchesSearch = !query || supplier.name.toLowerCase().includes(query) || (supplier.company ?? "").toLowerCase().includes(query) || supplier.phone.toLowerCase().includes(query) || (supplier.email ?? "").toLowerCase().includes(query);
      const matchesStatus = statusFilter === "ALL" || supplier.status.toUpperCase() === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [suppliers, search, statusFilter]);
  const dashboard = reactExports.useMemo(() => {
    return {
      suppliers: suppliers.length,
      active: suppliers.filter(
        (s) => s.status.toUpperCase() === "ACTIVE"
      ).length,
      purchases: suppliers.reduce(
        (sum, s) => sum + Number(s.totalPurchases || 0),
        0
      ),
      paid: suppliers.reduce(
        (sum, s) => sum + Number(s.totalPaid || 0),
        0
      ),
      outstanding: suppliers.reduce(
        (sum, s) => sum + Number(s.outstandingPayable || 0),
        0
      ),
      credit: suppliers.reduce(
        (sum, s) => sum + Number(s.availableCredit || 0),
        0
      )
    };
  }, [suppliers]);
  function openCreate() {
    setEditingId(null);
    setForm({ ...emptyForm });
    setModalOpen(true);
  }
  function openEdit(supplier) {
    setEditingId(supplier.id);
    setForm({
      name: supplier.name,
      company: supplier.company ?? "",
      phone: supplier.phone,
      email: supplier.email ?? "",
      address: supplier.address ?? "",
      notes: supplier.notes ?? "",
      status: supplier.status
    });
    setModalOpen(true);
  }
  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      push("Supplier name is required.", "error");
      return;
    }
    if (!form.phone.trim()) {
      push("Phone number is required.", "error");
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      company: form.company.trim() || null,
      phone: form.phone.trim(),
      email: form.email.trim() || null,
      address: form.address.trim() || null,
      notes: form.notes.trim() || null,
      status: form.status
    };
    try {
      if (editingId) {
        await call("suppliers:update", {
          id: editingId,
          ...payload
        });
        push("Supplier updated successfully.", "success");
      } else {
        await call("suppliers:create", payload);
        push("Supplier created successfully.", "success");
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      push(
        err instanceof Error ? err.message : "Failed to save supplier",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }
  async function openProfile(id2, initialTab = "OVERVIEW") {
    setTab(initialTab);
    setProfileLoading(true);
    try {
      const result = await call("suppliers:profile", {
        id: id2
      });
      setProfile(result);
    } catch (err) {
      push(
        err instanceof Error ? err.message : "Failed to load supplier",
        "error"
      );
    } finally {
      setProfileLoading(false);
    }
  }
  function openPayment(supplier) {
    setPayForm({
      amount: "",
      method: "CASH",
      reference: "",
      notes: "",
      paymentDate: ""
    });
    setPayTarget(supplier);
  }
  async function handlePayment(e) {
    e.preventDefault();
    if (!payTarget) return;
    const amount = Number(payForm.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      push("Payment amount must be greater than zero.", "error");
      return;
    }
    if (payTarget.outstandingPayable > 0 && amount > Number(payTarget.outstandingPayable)) {
      push("Payment cannot exceed the outstanding payable.", "error");
      return;
    }
    setSaving(true);
    try {
      await call("purchases:recordPayment", {
        supplierId: payTarget.id,
        amount,
        method: payForm.method,
        reference: payForm.reference || void 0,
        notes: payForm.notes || void 0,
        paymentDate: payForm.paymentDate || void 0
      });
      push("Payment recorded successfully.", "success");
      const supplierId = payTarget.id;
      setPayTarget(null);
      await load();
      if (profile?.id === supplierId) {
        await openProfile(supplierId, "PAYMENTS");
      }
    } catch (err) {
      push(
        err instanceof Error ? err.message : "Failed to record payment",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-full space-y-6 bg-slate-50/40 p-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2 w-2 rounded-full bg-brand-500" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold uppercase tracking-widest text-brand-600", children: "Procurement" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold tracking-tight text-slate-900", children: "Suppliers" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-slate-500", children: "Manage supplier relationships, purchases, payments and outstanding balances." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: openCreate, children: "+ New Supplier" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        FinancialCard,
        {
          title: "Suppliers",
          value: String(dashboard.suppliers),
          subtitle: `${dashboard.active} active suppliers`,
          icon: "👥",
          tone: "blue"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        FinancialCard,
        {
          title: "Total Purchases",
          value: formatBDT(dashboard.purchases),
          subtitle: "Lifetime supplier purchases",
          icon: "🧾",
          tone: "slate"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        FinancialCard,
        {
          title: "Outstanding",
          value: formatBDT(dashboard.outstanding),
          subtitle: "Amount currently payable",
          icon: "⚠",
          tone: dashboard.outstanding > 0 ? "red" : "green"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        FinancialCard,
        {
          title: "Available Credit",
          value: formatBDT(dashboard.credit),
          subtitle: "Credit available from returns",
          icon: "✓",
          tone: "green"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-center lg:justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold text-slate-900", children: "Supplier Directory" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-0.5 text-xs text-slate-500", children: [
            filteredSuppliers.length,
            " supplier",
            filteredSuppliers.length === 1 ? "" : "s",
            " shown"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2 sm:flex-row", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400", children: "⌕" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                className: "w-full pl-9 sm:w-72",
                placeholder: "Search supplier, company, phone...",
                value: search,
                onChange: (e) => setSearch(e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              className: "sm:w-36",
              value: statusFilter,
              onChange: (e) => setStatusFilter(e.target.value),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "ALL", children: "All Status" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "ACTIVE", children: "Active" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "ARCHIVED", children: "Archived" })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        DataTable,
        {
          loading,
          rows: filteredSuppliers,
          keyFor: (s) => s.id,
          emptyMessage: search || statusFilter !== "ALL" ? "No suppliers match your filters." : "No suppliers yet. Create your first supplier.",
          columns: [
            {
              header: "Supplier",
              accessor: (s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-[210px] items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-bold text-white shadow-sm", children: initials(s.name) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      className: "block max-w-[180px] truncate text-left font-semibold text-slate-800 transition hover:text-brand-600",
                      onClick: () => openProfile(s.id),
                      children: s.name
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "max-w-[180px] truncate text-xs text-slate-400", children: s.company || "Independent supplier" })
                ] })
              ] })
            },
            {
              header: "Contact",
              accessor: (s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-[130px]", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-slate-700", children: s.phone }),
                s.email && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "max-w-[170px] truncate text-xs text-slate-400", children: s.email })
              ] })
            },
            {
              header: "Purchases",
              accessor: (s) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-slate-800", children: formatBDT(s.totalPurchases) })
            },
            {
              header: "Paid",
              accessor: (s) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-emerald-600", children: formatBDT(s.totalPaid) })
            },
            {
              header: "Payable",
              accessor: (s) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: s.outstandingPayable > 0 ? "font-bold text-red-600" : "font-medium text-slate-400",
                  children: formatBDT(s.outstandingPayable)
                }
              )
            },
            {
              header: "Credit",
              accessor: (s) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: s.availableCredit > 0 ? "font-semibold text-brand-600" : "text-slate-400",
                  children: formatBDT(s.availableCredit)
                }
              )
            },
            {
              header: "Status",
              accessor: (s) => /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge$2, { status: s.status })
            },
            {
              header: "Actions",
              accessor: (s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 whitespace-nowrap", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "secondary",
                    className: "px-2.5 py-1.5 text-xs",
                    onClick: () => openProfile(s.id),
                    children: "View"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "secondary",
                    className: "px-2.5 py-1.5 text-xs",
                    onClick: () => openEdit(s),
                    children: "Edit"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "secondary",
                    className: "px-2.5 py-1.5 text-xs",
                    onClick: () => openPayment(s),
                    children: "Pay"
                  }
                )
              ] })
            }
          ]
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Modal,
      {
        open: modalOpen,
        wide: true,
        title: editingId ? "Edit Supplier" : "Add New Supplier",
        onClose: () => setModalOpen(false),
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-brand-100 bg-brand-50/50 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-lg text-white", children: editingId ? "✎" : "+" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-slate-800", children: editingId ? "Update supplier information" : "Create supplier profile" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500", children: "Keep supplier contact and business information up to date." })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Supplier name", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                required: true,
                autoFocus: true,
                placeholder: "e.g. Rahman Traders",
                value: form.name,
                onChange: (e) => setForm({
                  ...form,
                  name: e.target.value
                })
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Company", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                placeholder: "Company name",
                value: form.company,
                onChange: (e) => setForm({
                  ...form,
                  company: e.target.value
                })
              }
            ) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Phone", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                required: true,
                placeholder: "01XXXXXXXXX",
                value: form.phone,
                onChange: (e) => setForm({
                  ...form,
                  phone: e.target.value
                })
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Email", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "email",
                placeholder: "supplier@example.com",
                value: form.email,
                onChange: (e) => setForm({
                  ...form,
                  email: e.target.value
                })
              }
            ) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Address", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              placeholder: "Supplier business address",
              value: form.address,
              onChange: (e) => setForm({
                ...form,
                address: e.target.value
              })
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Notes", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              placeholder: "Optional notes about this supplier",
              value: form.notes,
              onChange: (e) => setForm({
                ...form,
                notes: e.target.value
              })
            }
          ) }),
          editingId && /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Supplier status", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: form.status,
              onChange: (e) => setForm({
                ...form,
                status: e.target.value
              }),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "ACTIVE", children: "Active" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "ARCHIVED", children: "Archived" })
              ]
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 border-t border-slate-100 pt-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "button",
                variant: "secondary",
                className: "flex-1",
                onClick: () => setModalOpen(false),
                children: "Cancel"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "submit",
                className: "flex-1",
                disabled: saving,
                children: saving ? "Saving..." : editingId ? "Save Changes" : "Create Supplier"
              }
            )
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Modal,
      {
        open: !!payTarget,
        title: payTarget ? `Payment — ${payTarget.name}` : "Supplier Payment",
        onClose: () => setPayTarget(null),
        children: payTarget && /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handlePayment, className: "space-y-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-red-100 bg-red-50 p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-red-500", children: "Outstanding payable" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-2xl font-bold text-red-700", children: formatBDT(payTarget.outstandingPayable) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-red-500", children: "Record the amount paid to this supplier." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Supplier", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { readOnly: true, value: payTarget.name }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Payment amount", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                min: 0,
                step: "any",
                required: true,
                autoFocus: true,
                placeholder: "0.00",
                value: payForm.amount,
                onChange: (e) => setPayForm({
                  ...payForm,
                  amount: e.target.value
                })
              }
            ) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Payment date", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "date",
                value: payForm.paymentDate,
                onChange: (e) => setPayForm({
                  ...payForm,
                  paymentDate: e.target.value
                })
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Payment method", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: payForm.method,
                onChange: (e) => setPayForm({
                  ...payForm,
                  method: e.target.value
                }),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "CASH", children: "Cash" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "BANK", children: "Bank transfer" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "BKASH", children: "bKash" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "OTHER", children: "Other" })
                ]
              }
            ) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Reference number", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              placeholder: "Transaction/reference number",
              value: payForm.reference,
              onChange: (e) => setPayForm({
                ...payForm,
                reference: e.target.value
              })
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Notes", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              placeholder: "Optional payment note",
              value: payForm.notes,
              onChange: (e) => setPayForm({
                ...payForm,
                notes: e.target.value
              })
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 border-t border-slate-100 pt-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "button",
                variant: "secondary",
                className: "flex-1",
                onClick: () => setPayTarget(null),
                children: "Cancel"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "submit",
                className: "flex-1",
                disabled: saving,
                children: saving ? "Recording..." : "Record Payment"
              }
            )
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Modal,
      {
        open: !!profile,
        wide: true,
        title: "",
        onClose: () => setProfile(null),
        children: profile && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-brand-900 p-6 text-white", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-5 md:flex-row md:items-center md:justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-xl font-bold ring-1 ring-white/20 backdrop-blur", children: initials(profile.name) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold", children: profile.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-emerald-400/15 px-2.5 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-300/20", children: supplierStatus(profile.status).label })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-slate-300", children: profile.company || "Independent supplier" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex flex-wrap gap-4 text-xs text-slate-300", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    "☎ ",
                    profile.phone
                  ] }),
                  profile.email && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    "✉ ",
                    profile.email
                  ] })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                onClick: () => {
                  setProfile(null);
                  openEdit(profile);
                },
                children: "Edit Supplier"
              }
            )
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 grid grid-cols-2 gap-3 md:grid-cols-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              MiniStat,
              {
                label: "Purchases",
                value: formatBDT(profile.summary.totalPurchases),
                tone: "blue"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              MiniStat,
              {
                label: "Paid",
                value: formatBDT(profile.summary.totalPaid),
                tone: "green"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              MiniStat,
              {
                label: "Outstanding",
                value: formatBDT(profile.summary.outstandingPayable),
                tone: "red"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              MiniStat,
              {
                label: "Credit",
                value: formatBDT(profile.summary.availableCredit),
                tone: "amber"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 border-b border-slate-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1 overflow-x-auto", children: [
            ["OVERVIEW", "Overview"],
            ["PURCHASES", "Purchases"],
            ["PAYMENTS", "Payments"],
            ["RETURNS", "Returns"]
          ].map(([value, label2]) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => setTab(value),
              className: `relative whitespace-nowrap px-4 py-3 text-sm font-semibold transition ${tab === value ? "text-brand-600" : "text-slate-500 hover:text-slate-800"}`,
              children: [
                label2,
                tab === value && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-brand-600" })
              ]
            },
            value
          )) }) }),
          profileLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-[240px] items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-slate-500", children: "Loading supplier..." }) }),
          !profileLoading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-5", children: [
            tab === "OVERVIEW" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-5 lg:grid-cols-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ProfileSection, { title: "Supplier Information", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-x-6 gap-y-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Detail$2,
                    {
                      label: "Supplier ID",
                      value: profile.id
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Detail$2,
                    {
                      label: "Status",
                      value: profile.status
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Detail$2,
                    {
                      label: "Name",
                      value: profile.name
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Detail$2,
                    {
                      label: "Company",
                      value: profile.company || DASH$6
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Detail$2,
                    {
                      label: "Phone",
                      value: profile.phone
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Detail$2,
                    {
                      label: "Email",
                      value: profile.email || DASH$6
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Detail$2,
                    {
                      label: "Address",
                      value: profile.address || DASH$6
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Detail$2,
                    {
                      label: "Created",
                      value: formatDate(profile.createdAt)
                    }
                  )
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ProfileSection, { title: "Account Summary", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    SummaryRow$1,
                    {
                      label: "Total purchases",
                      value: formatBDT(
                        profile.summary.totalPurchases
                      )
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    SummaryRow$1,
                    {
                      label: "Total paid",
                      value: formatBDT(
                        profile.summary.totalPaid
                      ),
                      valueClass: "text-emerald-600"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    SummaryRow$1,
                    {
                      label: "Total returned",
                      value: formatBDT(
                        profile.summary.totalReturned
                      )
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    SummaryRow$1,
                    {
                      label: "Credit from returns",
                      value: formatBDT(
                        profile.summary.creditFromReturns
                      ),
                      valueClass: "text-brand-600"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    SummaryRow$1,
                    {
                      label: "Cash refunds",
                      value: formatBDT(
                        profile.summary.cashRefunds
                      )
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    SummaryRow$1,
                    {
                      label: "Outstanding payable",
                      value: formatBDT(
                        profile.summary.outstandingPayable
                      ),
                      valueClass: profile.summary.outstandingPayable > 0 ? "text-red-600" : "text-slate-500"
                    }
                  )
                ] }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 md:grid-cols-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  ActivityStat,
                  {
                    label: "Purchases",
                    value: String(
                      profile.summary.purchaseCount
                    ),
                    detail: profile.summary.lastPurchaseDate ? formatDate(
                      profile.summary.lastPurchaseDate
                    ) : "No activity"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  ActivityStat,
                  {
                    label: "Payments",
                    value: String(
                      profile.summary.paymentCount
                    ),
                    detail: profile.summary.lastPaymentDate ? formatDate(
                      profile.summary.lastPaymentDate
                    ) : "No activity"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  ActivityStat,
                  {
                    label: "Returns",
                    value: String(
                      profile.summary.returnCount
                    ),
                    detail: `${profile.summary.returnedQuantity} items returned`
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  ActivityStat,
                  {
                    label: "Last return",
                    value: profile.summary.lastReturnDate ? formatDate(
                      profile.summary.lastReturnDate
                    ) : DASH$6,
                    detail: "Latest activity"
                  }
                )
              ] }),
              profile.notes && /* @__PURE__ */ jsxRuntimeExports.jsx(ProfileSection, { title: "Notes", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm leading-6 text-slate-600", children: profile.notes }) })
            ] }),
            tab === "PURCHASES" && /* @__PURE__ */ jsxRuntimeExports.jsx(
              DataTable,
              {
                rows: profile.purchases,
                keyFor: (p2) => p2.id,
                emptyMessage: "No purchases recorded for this supplier.",
                columns: [
                  {
                    header: "Purchase",
                    accessor: (p2) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-slate-800", children: p2.purchaseNumber })
                  },
                  {
                    header: "Date",
                    accessor: (p2) => formatDate(p2.purchaseDate)
                  },
                  {
                    header: "Total",
                    accessor: (p2) => formatBDT(p2.totalAmount)
                  },
                  {
                    header: "Paid",
                    accessor: (p2) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-emerald-600", children: formatBDT(p2.paidAmount) })
                  },
                  {
                    header: "Outstanding",
                    accessor: (p2) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "span",
                      {
                        className: Number(p2.dueAmount) > 0 ? "font-semibold text-red-600" : "text-slate-400",
                        children: formatBDT(p2.dueAmount)
                      }
                    )
                  },
                  {
                    header: "Payment",
                    accessor: (p2) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Badge,
                      {
                        className: paymentStatus(
                          p2.paymentStatus
                        ),
                        children: p2.paymentStatus
                      }
                    )
                  },
                  {
                    header: "Status",
                    accessor: (p2) => p2.status
                  }
                ]
              }
            ),
            tab === "PAYMENTS" && /* @__PURE__ */ jsxRuntimeExports.jsx(
              DataTable,
              {
                rows: profile.supplierPayments,
                keyFor: (p2) => p2.id,
                emptyMessage: "No payments recorded for this supplier.",
                columns: [
                  {
                    header: "Payment",
                    accessor: (p2) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: p2.paymentNumber || DASH$6 })
                  },
                  {
                    header: "Date",
                    accessor: (p2) => formatDateTime(p2.paymentDate)
                  },
                  {
                    header: "Amount",
                    accessor: (p2) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-emerald-600", children: formatBDT(p2.amount) })
                  },
                  {
                    header: "Method",
                    accessor: (p2) => /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-slate-100 text-slate-700 ring-1 ring-slate-200", children: p2.method })
                  },
                  {
                    header: "Reference",
                    accessor: (p2) => p2.reference || DASH$6
                  },
                  {
                    header: "Previous",
                    accessor: (p2) => p2.previousOutstanding ? formatBDT(
                      p2.previousOutstanding
                    ) : DASH$6
                  },
                  {
                    header: "Remaining",
                    accessor: (p2) => p2.remainingOutstanding ? formatBDT(
                      p2.remainingOutstanding
                    ) : DASH$6
                  }
                ]
              }
            ),
            tab === "RETURNS" && /* @__PURE__ */ jsxRuntimeExports.jsx(
              DataTable,
              {
                rows: profile.supplierReturns,
                keyFor: (r2) => r2.id,
                emptyMessage: "Nothing has been returned to this supplier.",
                columns: [
                  {
                    header: "Return",
                    accessor: (r2) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: r2.returnNumber })
                  },
                  {
                    header: "Date",
                    accessor: (r2) => formatDate(r2.returnDate)
                  },
                  {
                    header: "Purchase",
                    accessor: (r2) => r2.purchase?.purchaseNumber || DASH$6
                  },
                  {
                    header: "Product",
                    accessor: (r2) => r2.product?.name || DASH$6
                  },
                  {
                    header: "Qty",
                    accessor: (r2) => Number(r2.quantity)
                  },
                  {
                    header: "Value",
                    accessor: (r2) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-brand-600", children: formatBDT(r2.returnValue) })
                  },
                  {
                    header: "Reason",
                    accessor: (r2) => r2.reason
                  },
                  {
                    header: "Status",
                    accessor: (r2) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Badge,
                      {
                        className: paymentStatus(r2.status),
                        children: r2.status
                      }
                    )
                  }
                ]
              }
            )
          ] })
        ] })
      }
    )
  ] });
}
function MiniStat({
  label: label2,
  value,
  tone
}) {
  const classes = {
    blue: "border-blue-100 bg-blue-50/60 text-blue-700",
    green: "border-emerald-100 bg-emerald-50/60 text-emerald-700",
    red: "border-red-100 bg-red-50/60 text-red-700",
    amber: "border-amber-100 bg-amber-50/60 text-amber-700"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-2xl border p-4 ${classes[tone]}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wide opacity-70", children: label2 }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xl font-bold", children: value })
  ] });
}
function ProfileSection({
  title,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-4 text-sm font-bold text-slate-800", children: title }),
    children
  ] });
}
function SummaryRow$1({
  label: label2,
  value,
  valueClass = "text-slate-800"
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-slate-500", children: label2 }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-sm font-bold ${valueClass}`, children: value })
  ] });
}
function ActivityStat({
  label: label2,
  value,
  detail
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-slate-400", children: label2 }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xl font-bold text-slate-900", children: value }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 truncate text-xs text-slate-400", children: detail })
  ] });
}
function Detail$2({
  label: label2,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-xs font-medium uppercase tracking-wide text-slate-400", children: label2 }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "mt-1 break-words text-sm font-semibold text-slate-800", children: value })
  ] });
}
const REASONS = [
  "DAMAGED",
  "DEFECTIVE",
  "WRONG_PRODUCT",
  "WRONG_QUANTITY",
  "EXPIRED",
  "NEAR_EXPIRY",
  "SUPPLIER_REQUEST",
  "QUALITY_ISSUE",
  "OTHER"
];
const DASH$5 = "—";
const label = (value) => value.replace(/_/g, " ").toLowerCase().replace(/^./, (c) => c.toUpperCase());
function SupplierReturnsPage() {
  const [returns, setReturns] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [suppliers, setSuppliers] = reactExports.useState([]);
  const [purchases, setPurchases] = reactExports.useState([]);
  const [modalOpen, setModalOpen] = reactExports.useState(false);
  const [details, setDetails] = reactExports.useState(null);
  const [saving, setSaving] = reactExports.useState(false);
  const [search, setSearch] = reactExports.useState("");
  const [statusFilter, setStatusFilter] = reactExports.useState("ALL");
  const [settlementFilter, setSettlementFilter] = reactExports.useState("ALL");
  const [form, setForm] = reactExports.useState({
    supplierId: "",
    purchaseId: "",
    batchId: "",
    quantity: "",
    reason: "DAMAGED",
    settlementType: "CREDIT",
    paymentMethod: "CASH",
    notes: "",
    returnDate: ""
  });
  const [
    purchaseDetails,
    setPurchaseDetails
  ] = reactExports.useState(null);
  const push = useToastStore((s) => s.push);
  async function load() {
    setLoading(true);
    try {
      setReturns(
        await call("supplierReturns:list")
      );
    } catch (err) {
      push(
        err instanceof Error ? err.message : "Failed to load supplier returns",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }
  reactExports.useEffect(() => {
    load();
    call("suppliers:list").then(setSuppliers).catch(() => {
    });
    call("purchases:list").then(setPurchases).catch(() => {
    });
  }, []);
  const filteredReturns = reactExports.useMemo(() => {
    const q2 = search.trim().toLowerCase();
    return returns.filter((r2) => {
      const matchesSearch = !q2 || r2.returnNumber.toLowerCase().includes(q2) || r2.supplier?.name?.toLowerCase().includes(q2) || r2.product?.name?.toLowerCase().includes(q2) || r2.product?.sku?.toLowerCase().includes(q2) || r2.batch?.batchCode?.toLowerCase().includes(q2) || r2.purchase?.purchaseNumber?.toLowerCase().includes(q2);
      const matchesStatus = statusFilter === "ALL" || r2.status === statusFilter;
      const matchesSettlement = settlementFilter === "ALL" || r2.settlementType === settlementFilter;
      return matchesSearch && matchesStatus && matchesSettlement;
    });
  }, [returns, search, statusFilter, settlementFilter]);
  const summary = reactExports.useMemo(() => {
    const completed = returns.filter(
      (r2) => r2.status === "COMPLETED"
    );
    const cancelled = returns.filter(
      (r2) => r2.status === "CANCELLED"
    );
    const returnedValue = completed.reduce(
      (sum, r2) => sum + Number(r2.returnValue || 0),
      0
    );
    const returnedQuantity = completed.reduce(
      (sum, r2) => sum + Number(r2.quantity || 0),
      0
    );
    const supplierCredit = completed.filter((r2) => r2.settlementType === "CREDIT").reduce((sum, r2) => sum + Number(r2.returnValue || 0), 0);
    const cashRefund = completed.filter((r2) => r2.settlementType === "CASH_REFUND").reduce((sum, r2) => sum + Number(r2.returnValue || 0), 0);
    return {
      total: returns.length,
      completed: completed.length,
      cancelled: cancelled.length,
      returnedValue,
      returnedQuantity,
      supplierCredit,
      cashRefund
    };
  }, [returns]);
  const supplierPurchases = purchases.filter(
    (p2) => p2.supplierId === form.supplierId && p2.status !== "VOID"
  );
  const selectedItem = purchaseDetails?.items.find(
    (i) => i.batchId === form.batchId
  );
  const maxReturnable = selectedItem?.quantityInStock ?? 0;
  async function selectPurchase(purchaseId) {
    setForm((f2) => ({
      ...f2,
      purchaseId,
      batchId: "",
      quantity: ""
    }));
    setPurchaseDetails(null);
    if (!purchaseId) return;
    try {
      setPurchaseDetails(
        await call("purchases:get", {
          id: purchaseId
        })
      );
    } catch (err) {
      push(
        err instanceof Error ? err.message : "Failed to load purchase",
        "error"
      );
    }
  }
  function openCreate() {
    setForm({
      supplierId: "",
      purchaseId: "",
      batchId: "",
      quantity: "",
      reason: "DAMAGED",
      settlementType: "CREDIT",
      paymentMethod: "CASH",
      notes: "",
      returnDate: ""
    });
    setPurchaseDetails(null);
    setModalOpen(true);
  }
  async function handleSubmit(e) {
    e.preventDefault();
    const quantity = Number(form.quantity);
    if (!form.supplierId) {
      push("Select a supplier.", "error");
      return;
    }
    if (!form.purchaseId) {
      push("Select the original purchase.", "error");
      return;
    }
    if (!form.batchId) {
      push("Select the batch being returned.", "error");
      return;
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      push(
        "Return quantity must be greater than zero.",
        "error"
      );
      return;
    }
    if (quantity > maxReturnable) {
      push(
        `Only ${maxReturnable} unit(s) remain available in this batch.`,
        "error"
      );
      return;
    }
    setSaving(true);
    try {
      await call("supplierReturns:create", {
        purchaseId: form.purchaseId,
        batchId: form.batchId,
        quantity,
        reason: form.reason,
        settlementType: form.settlementType,
        paymentMethod: form.settlementType === "CASH_REFUND" ? form.paymentMethod : void 0,
        notes: form.notes || void 0,
        returnDate: form.returnDate || void 0
      });
      push(
        "Supplier return recorded — inventory and payable updated.",
        "success"
      );
      setModalOpen(false);
      setForm({
        supplierId: "",
        purchaseId: "",
        batchId: "",
        quantity: "",
        reason: "DAMAGED",
        settlementType: "CREDIT",
        paymentMethod: "CASH",
        notes: "",
        returnDate: ""
      });
      setPurchaseDetails(null);
      load();
    } catch (err) {
      push(
        err instanceof Error ? err.message : "Failed to record supplier return",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }
  async function openDetails(id2) {
    try {
      setDetails(
        await call(
          "supplierReturns:get",
          { id: id2 }
        )
      );
    } catch (err) {
      push(
        err instanceof Error ? err.message : "Supplier return not found",
        "error"
      );
    }
  }
  async function handleCancel(row) {
    const reason = window.prompt(
      `Cancel ${row.returnNumber}? Stock and payable will be restored. Reason:`
    );
    if (!reason) return;
    try {
      await call("supplierReturns:cancel", {
        id: row.id,
        reason
      });
      push("Supplier return cancelled.", "success");
      load();
    } catch (err) {
      push(
        err instanceof Error ? err.message : "Failed to cancel supplier return",
        "error"
      );
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 w-full space-y-5 overflow-x-hidden pb-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-brand-600", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2 w-2 rounded-full bg-brand-500" }),
          "Inventory Management"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-semibold tracking-tight text-slate-900", children: "Supplier Returns" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-slate-500", children: "Manage stock returned to suppliers, supplier credits, cash refunds, and return history." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex shrink-0 gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "secondary",
            onClick: load,
            disabled: loading,
            children: "↻ Refresh"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: openCreate, children: "+ New Supplier Return" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        SummaryCard,
        {
          label: "Total Returns",
          value: String(summary.total),
          helper: `${summary.completed} completed · ${summary.cancelled} cancelled`,
          icon: "↩"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        SummaryCard,
        {
          label: "Returned Value",
          value: formatBDT(summary.returnedValue),
          helper: `${summary.returnedQuantity} total units returned`,
          icon: "৳"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        SummaryCard,
        {
          label: "Supplier Credit",
          value: formatBDT(summary.supplierCredit),
          helper: "Credit applied to supplier balance",
          icon: "→",
          tone: "purple"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        SummaryCard,
        {
          label: "Cash Refund",
          value: formatBDT(summary.cashRefund),
          helper: "Money received from suppliers",
          icon: "৳",
          tone: "blue"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid min-w-0 grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_180px_190px] lg:items-end", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Search", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: "Search return number, supplier, product, SKU, batch...",
            value: search,
            onChange: (e) => setSearch(e.target.value)
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Status", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Select,
          {
            value: statusFilter,
            onChange: (e) => setStatusFilter(e.target.value),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "ALL", children: "All Statuses" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "COMPLETED", children: "Completed" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "CANCELLED", children: "Cancelled" })
            ]
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Settlement", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Select,
          {
            value: settlementFilter,
            onChange: (e) => setSettlementFilter(e.target.value),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "ALL", children: "All Settlements" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "CREDIT", children: "Supplier Credit" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "CASH_REFUND", children: "Cash Refund" })
            ]
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-slate-500", children: [
          "Showing",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-slate-700", children: filteredReturns.length }),
          " ",
          "of ",
          returns.length,
          " supplier returns"
        ] }),
        (search || statusFilter !== "ALL" || settlementFilter !== "ALL") && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            className: "text-xs font-medium text-brand-600 hover:text-brand-700",
            onClick: () => {
              setSearch("");
              setStatusFilter("ALL");
              setSettlementFilter("ALL");
            },
            children: "Clear filters"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "overflow-hidden p-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden border-b border-slate-100 bg-slate-50 px-5 py-3 xl:grid xl:grid-cols-[1.2fr_1.25fr_1.25fr_1.1fr_90px_120px_130px_90px] xl:gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { text: "Return" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { text: "Supplier" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { text: "Product" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { text: "Purchase" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { text: "Qty" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { text: "Value" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { text: "Settlement" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { text: "Status" })
      ] }),
      loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingRows, {}) : filteredReturns.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        EmptyState,
        {
          search: !!search,
          onCreate: openCreate
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-slate-100", children: filteredReturns.map((r2) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        ReturnRow,
        {
          row: r2,
          onView: () => openDetails(r2.id),
          onCancel: () => handleCancel(r2)
        },
        r2.id
      )) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Modal,
      {
        open: modalOpen,
        title: "New Supplier Return",
        onClose: () => setModalOpen(false),
        wide: true,
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "form",
          {
            onSubmit: handleSubmit,
            className: "space-y-5",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-brand-100 bg-brand-50/50 p-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-3 text-sm font-semibold text-slate-800", children: "Return source" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Supplier", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Select,
                    {
                      required: true,
                      value: form.supplierId,
                      onChange: (e) => {
                        setForm({
                          ...form,
                          supplierId: e.target.value,
                          purchaseId: "",
                          batchId: "",
                          quantity: ""
                        });
                        setPurchaseDetails(null);
                      },
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select supplier..." }),
                        suppliers.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "option",
                          {
                            value: s.id,
                            children: s.name
                          },
                          s.id
                        ))
                      ]
                    }
                  ) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Original purchase", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Select,
                    {
                      required: true,
                      value: form.purchaseId,
                      onChange: (e) => selectPurchase(e.target.value),
                      disabled: !form.supplierId,
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: form.supplierId ? "Select purchase..." : "Select supplier first" }),
                        supplierPurchases.map((p2) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "option",
                          {
                            value: p2.id,
                            children: [
                              p2.purchaseNumber,
                              " ·",
                              " ",
                              formatDate(p2.purchaseDate)
                            ]
                          },
                          p2.id
                        ))
                      ]
                    }
                  ) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Return date", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      type: "date",
                      value: form.returnDate,
                      onChange: (e) => setForm({
                        ...form,
                        returnDate: e.target.value
                      })
                    }
                  ) })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Product / batch", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  required: true,
                  value: form.batchId,
                  onChange: (e) => setForm({
                    ...form,
                    batchId: e.target.value,
                    quantity: ""
                  }),
                  disabled: !purchaseDetails,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: purchaseDetails ? "Select product / batch..." : "Choose a purchase first" }),
                    purchaseDetails?.items.filter((i) => i.batchId).map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "option",
                      {
                        value: i.batchId,
                        children: [
                          i.product.name,
                          " ·",
                          " ",
                          i.batch?.batchCode,
                          " ·",
                          " ",
                          i.quantityInStock,
                          " available"
                        ]
                      },
                      i.batchId
                    ))
                  ]
                }
              ) }),
              selectedItem && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 md:grid-cols-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  MiniInfo,
                  {
                    label: "Purchased",
                    value: String(
                      Number(selectedItem.quantity)
                    )
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  MiniInfo,
                  {
                    label: "Sold",
                    value: String(
                      Number(selectedItem.quantity) - selectedItem.quantityInStock - selectedItem.quantityReturned
                    )
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  MiniInfo,
                  {
                    label: "Already Returned",
                    value: String(
                      selectedItem.quantityReturned
                    )
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  MiniInfo,
                  {
                    label: "Available",
                    value: String(
                      selectedItem.quantityInStock
                    ),
                    highlight: true
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Field,
                  {
                    label: `Return quantity${selectedItem ? ` · max ${maxReturnable}` : ""}`,
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        type: "number",
                        min: 0,
                        step: "any",
                        max: maxReturnable || void 0,
                        required: true,
                        value: form.quantity,
                        onChange: (e) => setForm({
                          ...form,
                          quantity: e.target.value
                        })
                      }
                    )
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Reason", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Select,
                  {
                    required: true,
                    value: form.reason,
                    onChange: (e) => setForm({
                      ...form,
                      reason: e.target.value
                    }),
                    children: REASONS.map((r2) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: r2, children: label(r2) }, r2))
                  }
                ) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Settlement", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Select,
                  {
                    value: form.settlementType,
                    onChange: (e) => setForm({
                      ...form,
                      settlementType: e.target.value
                    }),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "CREDIT", children: "Supplier Credit — applied to future purchases" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "CASH_REFUND", children: "Cash Refund — money received back" })
                    ]
                  }
                ) }),
                form.settlementType === "CASH_REFUND" && /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Refund Payment Method", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Select,
                  {
                    value: form.paymentMethod,
                    onChange: (e) => setForm({
                      ...form,
                      paymentMethod: e.target.value
                    }),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "CASH", children: "Cash" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "BKASH", children: "bKash" })
                    ]
                  }
                ) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Notes", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  placeholder: "Optional notes about this return...",
                  value: form.notes,
                  onChange: (e) => setForm({
                    ...form,
                    notes: e.target.value
                  })
                }
              ) }),
              selectedItem && Number(form.quantity) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border border-slate-200 bg-slate-50 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500", children: "Return value" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-semibold text-slate-900", children: formatBDT(
                    Number(form.quantity) * Number(
                      selectedItem.unitCost
                    )
                  ) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "max-w-md text-xs leading-5 text-slate-500", children: form.settlementType === "CASH_REFUND" ? `Recorded as a cash refund received via ${form.paymentMethod}. Supplier payable remains unchanged.` : "Recorded as supplier credit and applied against the supplier balance and future purchases." })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    type: "button",
                    variant: "secondary",
                    onClick: () => setModalOpen(false),
                    children: "Cancel"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    type: "submit",
                    disabled: saving,
                    children: saving ? "Saving..." : "Record Supplier Return"
                  }
                )
              ] })
            ]
          }
        )
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Modal,
      {
        open: !!details,
        wide: true,
        title: details ? `Supplier Return ${details.returnNumber}` : "Supplier Return",
        onClose: () => setDetails(null),
        children: details && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-wide text-slate-400", children: "Return" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-semibold text-slate-900", children: details.returnNumber }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-500", children: formatDate(details.returnDate) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge$1, { status: details.status }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                SettlementBadge,
                {
                  settlementType: details.settlementType
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "Supplier & Purchase", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(InfoGrid, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Detail$1,
              {
                label: "Supplier",
                value: details.supplier?.name ?? DASH$5
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Detail$1,
              {
                label: "Supplier phone",
                value: details.supplier?.phone ?? DASH$5
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Detail$1,
              {
                label: "Purchase number",
                value: details.purchase?.purchaseNumber ?? DASH$5
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Detail$1,
              {
                label: "Purchase date",
                value: details.purchase ? formatDate(
                  details.purchase.purchaseDate
                ) : DASH$5
              }
            )
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "Returned Item", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(InfoGrid, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Detail$1,
              {
                label: "Product",
                value: details.product?.name ?? DASH$5
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Detail$1,
              {
                label: "SKU",
                value: details.product?.sku || DASH$5
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Detail$1,
              {
                label: "Barcode",
                value: details.product?.barcode || DASH$5
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Detail$1,
              {
                label: "Batch",
                value: details.batch?.batchCode ?? DASH$5
              }
            )
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "Inventory", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 md:grid-cols-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              MiniInfo,
              {
                label: "Purchased",
                value: String(
                  Number(
                    details.quantityPurchased
                  )
                )
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              MiniInfo,
              {
                label: "Sold",
                value: String(
                  Number(details.quantitySold)
                )
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              MiniInfo,
              {
                label: "Returned Total",
                value: String(
                  Number(
                    details.quantityReturnedTotal
                  )
                )
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              MiniInfo,
              {
                label: "Currently Available",
                value: String(
                  Number(
                    details.quantityAvailable
                  )
                ),
                highlight: true
              }
            )
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "Financial Details", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-3 sm:grid-cols-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              FinancialBox,
              {
                label: "Unit Cost",
                value: formatBDT(details.unitCost)
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              FinancialBox,
              {
                label: "Quantity Returned",
                value: String(
                  Number(details.quantity)
                )
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              FinancialBox,
              {
                label: "Return Value",
                value: formatBDT(
                  details.returnValue
                ),
                strong: true
              }
            )
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "Return Information", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(InfoGrid, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Detail$1,
              {
                label: "Settlement",
                value: details.settlementType === "CASH_REFUND" ? "Cash Refund" : "Supplier Credit"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Detail$1,
              {
                label: "Reason",
                value: label(details.reason)
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Detail$1,
              {
                label: "Notes",
                value: details.notes || DASH$5
              }
            )
          ] }) })
        ] })
      }
    )
  ] });
}
function ReturnRow({
  row,
  onView,
  onCancel
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group min-w-0 px-4 py-4 transition hover:bg-slate-50 sm:px-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden xl:grid xl:grid-cols-[1.2fr_1.25fr_1.25fr_1.1fr_90px_120px_130px_90px] xl:items-center xl:gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: onView,
            className: "block max-w-full truncate text-sm font-semibold text-slate-900 hover:text-brand-600",
            children: row.returnNumber
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 truncate text-xs text-slate-400", children: formatDate(row.returnDate) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-sm font-medium text-slate-800", children: row.supplier?.name ?? DASH$5 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-xs text-slate-400", children: row.supplier?.phone || DASH$5 })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-sm font-medium text-slate-800", children: row.product?.name ?? DASH$5 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-xs text-slate-400", children: row.product?.sku ? `SKU ${row.product.sku}` : "No SKU" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-sm font-medium text-slate-700", children: row.purchase?.purchaseNumber ?? DASH$5 }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "truncate text-xs text-slate-400", children: [
          "Batch ",
          row.batch?.batchCode ?? DASH$5
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-slate-800", children: Number(row.quantity) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-400", children: "units" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-slate-900", children: formatBDT(row.returnValue) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-slate-400", children: [
          "@ ",
          formatBDT(row.unitCost)
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        SettlementBadge,
        {
          settlementType: row.settlementType
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge$1, { status: row.status }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "xl:hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 items-start justify-between gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: onView,
              className: "truncate text-sm font-semibold text-slate-900 hover:text-brand-600",
              children: row.returnNumber
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 text-xs text-slate-400", children: formatDate(row.returnDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex shrink-0 gap-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge$1, { status: row.status }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3 lg:grid-cols-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          MobileDetail,
          {
            label: "Supplier",
            value: row.supplier?.name ?? DASH$5
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          MobileDetail,
          {
            label: "Product",
            value: row.product?.name ?? DASH$5
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          MobileDetail,
          {
            label: "Purchase",
            value: row.purchase?.purchaseNumber ?? DASH$5
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          MobileDetail,
          {
            label: "Batch",
            value: row.batch?.batchCode ?? DASH$5
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          MobileDetail,
          {
            label: "Quantity",
            value: `${Number(row.quantity)} units`
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          MobileDetail,
          {
            label: "Value",
            value: formatBDT(row.returnValue)
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-medium uppercase tracking-wide text-slate-400", children: "Settlement" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            SettlementBadge,
            {
              settlementType: row.settlementType
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          MobileDetail,
          {
            label: "Reason",
            value: label(row.reason)
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          MobileDetail,
          {
            label: "SKU",
            value: row.product?.sku || DASH$5
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "secondary",
            className: "px-3 py-1.5 text-xs",
            onClick: onView,
            children: "View Details"
          }
        ),
        row.status === "COMPLETED" && /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "secondary",
            className: "px-3 py-1.5 text-xs",
            onClick: onCancel,
            children: "Cancel Return"
          }
        )
      ] })
    ] })
  ] });
}
function SummaryCard({
  label: label2,
  value,
  helper,
  icon,
  tone = "green"
}) {
  const iconClass = tone === "purple" ? "bg-purple-50 text-purple-600" : tone === "blue" ? "bg-blue-50 text-blue-600" : "bg-brand-50 text-brand-600";
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-w-0 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-xs font-medium uppercase tracking-wide text-slate-400", children: label2 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 truncate text-2xl font-semibold tracking-tight text-slate-900", children: value }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 truncate text-xs text-slate-400", children: helper })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: `flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-semibold ${iconClass}`,
        children: icon
      }
    )
  ] }) });
}
function TableHeader({ text }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-[10px] font-semibold uppercase tracking-wider text-slate-400", children: text });
}
function MobileDetail({
  label: label2,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-medium uppercase tracking-wide text-slate-400", children: label2 }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 truncate text-sm font-medium text-slate-700", children: value })
  ] });
}
function MiniInfo({
  label: label2,
  value,
  highlight = false
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: `min-w-0 rounded-xl border px-3 py-3 ${highlight ? "border-brand-100 bg-brand-50" : "border-slate-100 bg-slate-50"}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-[11px] font-medium uppercase tracking-wide text-slate-400", children: label2 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "p",
          {
            className: `mt-1 text-lg font-semibold ${highlight ? "text-brand-700" : "text-slate-800"}`,
            children: value
          }
        )
      ]
    }
  );
}
function FinancialBox({
  label: label2,
  value,
  strong = false
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-slate-100 bg-slate-50 px-4 py-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-400", children: label2 }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "p",
      {
        className: `mt-1 ${strong ? "text-xl font-semibold text-slate-900" : "text-lg font-semibold text-slate-800"}`,
        children: value
      }
    )
  ] });
}
function Detail$1({
  label: label2,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-xs font-medium uppercase tracking-wide text-slate-400", children: label2 }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "mt-1 break-words text-sm font-medium text-slate-800", children: value })
  ] });
}
function InfoGrid({
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("dl", { className: "grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-4", children });
}
function Section({
  title,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-3 text-sm font-semibold text-slate-800", children: title }),
    children
  ] });
}
function SettlementBadge({
  settlementType
}) {
  const isCash = settlementType === "CASH_REFUND";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "span",
    {
      className: `inline-flex max-w-full items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-medium ${isCash ? "border-blue-100 bg-blue-50 text-blue-700" : "border-purple-100 bg-purple-50 text-purple-700"}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shrink-0", children: isCash ? "৳" : "↗" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: isCash ? "Cash Refund" : "Supplier Credit" })
      ]
    }
  );
}
function StatusBadge$1({
  status
}) {
  const completed = status === "COMPLETED";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "span",
    {
      className: `inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-medium ${completed ? "border-emerald-100 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-100 text-slate-500"}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: `h-1.5 w-1.5 rounded-full ${completed ? "bg-emerald-500" : "bg-slate-400"}`
          }
        ),
        label(status)
      ]
    }
  );
}
function LoadingRows() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-slate-100", children: Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "animate-pulse px-5 py-5",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 rounded bg-slate-100" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 rounded bg-slate-100" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 rounded bg-slate-100" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 rounded bg-slate-100" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 rounded bg-slate-100" })
      ] })
    },
    i
  )) });
}
function EmptyState({
  search,
  onCreate
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-[280px] flex-col items-center justify-center px-5 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-xl text-slate-400", children: "↩" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-4 text-sm font-semibold text-slate-800", children: search ? "No returns found" : "No supplier returns yet" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 max-w-sm text-sm text-slate-500", children: search ? "Try changing your search or filters." : "Supplier returns will appear here once stock is returned to a supplier." }),
    !search && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: onCreate, children: "+ New Supplier Return" }) })
  ] });
}
const DASH$4 = "—";
const emptyRow = {
  productId: "",
  batchCode: "",
  quantity: "1",
  purchaseCost: "0",
  sellingCost: "0",
  expiryDate: ""
};
function PurchasesPage() {
  const [purchases, setPurchases] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [details, setDetails] = reactExports.useState(null);
  const [printingPurchase, setPrintingPurchase] = reactExports.useState(null);
  const [suppliers, setSuppliers] = reactExports.useState([]);
  const [products, setProducts] = reactExports.useState([]);
  const [modalOpen, setModalOpen] = reactExports.useState(false);
  const [supplierId, setSupplierId] = reactExports.useState("");
  const [invoiceNumber, setInvoiceNumber] = reactExports.useState("");
  const [purchaseDate, setPurchaseDate] = reactExports.useState("");
  const [paidAmount, setPaidAmount] = reactExports.useState("0");
  const [paymentMethod, setPaymentMethod] = reactExports.useState("CASH");
  const [rows, setRows] = reactExports.useState([{ ...emptyRow }]);
  const [saving, setSaving] = reactExports.useState(false);
  const [payTarget, setPayTarget] = reactExports.useState(null);
  const [payForm, setPayForm] = reactExports.useState({
    amount: "",
    method: "CASH",
    reference: "",
    notes: ""
  });
  const push = useToastStore((s) => s.push);
  async function loadPurchases() {
    setLoading(true);
    try {
      setPurchases(
        await call(
          "purchases:list"
        )
      );
    } catch (err) {
      push(
        err instanceof Error ? err.message : "Failed to load purchases",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }
  reactExports.useEffect(() => {
    loadPurchases();
    call("suppliers:list").then(setSuppliers).catch(() => {
    });
    call(
      "products:search",
      {}
    ).then((r2) => setProducts(r2.items)).catch(() => {
    });
  }, []);
  reactExports.useEffect(() => {
    if (!printingPurchase) {
      return;
    }
    const timer = window.setTimeout(() => {
      window.print();
    }, 150);
    return () => window.clearTimeout(timer);
  }, [printingPurchase]);
  reactExports.useEffect(() => {
    const handleAfterPrint = () => {
      setPrintingPurchase(null);
    };
    window.addEventListener(
      "afterprint",
      handleAfterPrint
    );
    return () => {
      window.removeEventListener(
        "afterprint",
        handleAfterPrint
      );
    };
  }, []);
  function updateRow(index, patch) {
    setRows(
      (currentRows) => currentRows.map(
        (row, i) => i === index ? {
          ...row,
          ...patch
        } : row
      )
    );
  }
  const total = rows.reduce(
    (sum, row) => sum + Number(row.quantity || 0) * Number(row.purchaseCost || 0),
    0
  );
  async function openDetails(idOrNumber) {
    try {
      const result = await call(
        "purchases:get",
        {
          id: idOrNumber
        }
      );
      setDetails(result);
    } catch (err) {
      push(
        err instanceof Error ? err.message : "Purchase not found",
        "error"
      );
    }
  }
  async function handlePrintPurchase(id2) {
    try {
      const purchase = await call(
        "purchases:get",
        {
          id: id2
        }
      );
      setPrintingPurchase(purchase);
    } catch (err) {
      push(
        err instanceof Error ? err.message : "Unable to prepare purchase for printing",
        "error"
      );
    }
  }
  async function handlePurchasePayment(e) {
    e.preventDefault();
    if (!payTarget) {
      return;
    }
    try {
      await call(
        "purchases:recordPayment",
        {
          supplierId: payTarget.supplierId,
          purchaseId: payTarget.id,
          amount: Number(payForm.amount),
          method: payForm.method,
          reference: payForm.reference || void 0,
          notes: payForm.notes || void 0
        }
      );
      push(
        "Payment recorded.",
        "success"
      );
      setPayTarget(null);
      loadPurchases();
    } catch (err) {
      push(
        err instanceof Error ? err.message : "Failed to record payment",
        "error"
      );
    }
  }
  async function handleSubmit(e) {
    e.preventDefault();
    if (!supplierId) {
      push(
        "Please select a supplier.",
        "error"
      );
      return;
    }
    const invalidRow = rows.find(
      (row) => !row.productId || Number(row.quantity) <= 0 || Number(row.purchaseCost) < 0 || Number(row.sellingCost) < 0
    );
    if (invalidRow) {
      push(
        "Please complete every purchase item correctly.",
        "error"
      );
      return;
    }
    setSaving(true);
    try {
      await call(
        "purchases:create",
        {
          supplierId,
          invoiceNumber: invoiceNumber || void 0,
          purchaseDate: purchaseDate || void 0,
          paidAmount: Number(paidAmount),
          paymentMethod,
          items: rows.map((row) => ({
            productId: row.productId,
            batchCode: row.batchCode || `BATCH-${Date.now()}`,
            quantity: Number(row.quantity),
            unitCost: Number(row.purchaseCost),
            /*
             * FIX:
             * Send the manually entered selling
             * cost to the backend.
             *
             * Example:
             * Purchase Cost = 100
             * Selling Cost  = 120
             *
             * sellingPrice = 120
             */
            sellingPrice: Number(row.sellingCost),
            expiryDate: row.expiryDate ? new Date(
              row.expiryDate
            ) : void 0
          }))
        }
      );
      push(
        "Purchase recorded and inventory updated.",
        "success"
      );
      setModalOpen(false);
      setRows([
        {
          ...emptyRow
        }
      ]);
      setSupplierId("");
      setInvoiceNumber("");
      setPurchaseDate("");
      setPaidAmount("0");
      setPaymentMethod("CASH");
      await loadPurchases();
    } catch (err) {
      push(
        err instanceof Error ? err.message : "Failed to record purchase",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 print:hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-semibold text-slate-900", children: "Purchases" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-500", children: "Record cash or credit purchases from suppliers." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: () => setModalOpen(true),
            children: "+ New Purchase"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        DataTable,
        {
          loading,
          rows: purchases,
          keyFor: (p2) => p2.id,
          emptyMessage: 'No purchases yet. Use "New Purchase" to receive stock.',
          columns: [
            {
              header: "Purchase #",
              accessor: (p2) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: p2.purchaseNumber })
            },
            {
              header: "Date",
              accessor: (p2) => formatDate(
                p2.purchaseDate
              )
            },
            {
              header: "Supplier",
              accessor: (p2) => p2.supplier?.name ?? DASH$4
            },
            {
              header: "Invoice #",
              accessor: (p2) => p2.invoiceNumber || DASH$4
            },
            {
              header: "Items",
              accessor: (p2) => p2.totalItems
            },
            {
              header: "Qty",
              accessor: (p2) => p2.totalQuantity
            },
            {
              header: "Total",
              accessor: (p2) => formatBDT(
                p2.totalAmount
              )
            },
            {
              header: "Paid",
              accessor: (p2) => formatBDT(
                p2.paidTotal
              )
            },
            {
              header: "Credit Applied",
              accessor: (p2) => p2.creditApplied > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-brand-600", children: formatBDT(
                p2.creditApplied
              ) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-400", children: DASH$4 })
            },
            {
              header: "Outstanding",
              accessor: (p2) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: p2.outstandingAmount > 0 ? "font-semibold text-red-600" : "text-slate-500",
                  children: formatBDT(
                    p2.outstandingAmount
                  )
                }
              )
            },
            {
              header: "Status",
              accessor: (p2) => `${p2.derivedPaymentStatus}${p2.status === "VOID" ? " · VOID" : ""}`
            },
            {
              header: "Actions",
              accessor: (p2) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "secondary",
                    className: "px-2 py-1 text-xs",
                    onClick: () => openDetails(
                      p2.id
                    ),
                    children: "View"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "secondary",
                    className: "px-2 py-1 text-xs",
                    onClick: () => handlePrintPurchase(
                      p2.id
                    ),
                    children: "Print"
                  }
                ),
                p2.outstandingAmount > 0 && p2.status !== "VOID" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "secondary",
                    className: "px-2 py-1 text-xs",
                    onClick: () => {
                      setPayForm({
                        amount: String(
                          p2.outstandingAmount
                        ),
                        method: "CASH",
                        reference: "",
                        notes: ""
                      });
                      setPayTarget(
                        p2
                      );
                    },
                    children: "Payment"
                  }
                )
              ] })
            }
          ]
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Modal,
        {
          open: !!details,
          wide: true,
          title: details ? `Purchase ${details.purchaseNumber}` : "Purchase",
          onClose: () => setDetails(null),
          children: details && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("dl", { className: "grid grid-cols-2 gap-x-6 gap-y-2 md:grid-cols-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Detail,
                {
                  label: "Purchase number",
                  value: details.purchaseNumber
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Detail,
                {
                  label: "Purchase date",
                  value: formatDate(
                    details.purchaseDate
                  )
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Detail,
                {
                  label: "Supplier",
                  value: details.supplier?.name ?? DASH$4
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Detail,
                {
                  label: "Supplier phone",
                  value: details.supplier?.phone ?? DASH$4
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Detail,
                {
                  label: "Supplier invoice #",
                  value: details.invoiceNumber || DASH$4
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Detail,
                {
                  label: "Payment status",
                  value: `${details.derivedPaymentStatus} · ${details.status}`
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "min-w-full text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "text-left text-slate-500", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-1 pr-4", children: "Product" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-1 pr-4", children: "SKU" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-1 pr-4", children: "Barcode" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-1 pr-4", children: "Batch" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-1 pr-4", children: "Purchased" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-1 pr-4", children: "In stock" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-1 pr-4", children: "Returned" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-1 pr-4", children: "Purchase Cost" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-1 pr-4", children: "Selling Cost" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-1 pr-4", children: "Total" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-1", children: "Expiry" })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-slate-100", children: details.items.map(
                (item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "tr",
                  {
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1 pr-4", children: item.product.name }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1 pr-4 text-slate-500", children: item.product.sku || DASH$4 }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1 pr-4 text-slate-500", children: item.product.barcode || DASH$4 }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1 pr-4", children: item.batch?.batchCode ?? DASH$4 }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1 pr-4", children: Number(
                        item.quantity
                      ) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1 pr-4", children: item.quantityInStock }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1 pr-4", children: item.quantityReturned }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1 pr-4", children: formatBDT(
                        item.unitCost
                      ) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1 pr-4 font-medium text-brand-600", children: formatBDT(
                        item.batch?.sellingPrice ?? 0
                      ) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1 pr-4", children: formatBDT(
                        item.total
                      ) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1", children: item.batch?.expiryDate ? formatDate(
                        item.batch.expiryDate
                      ) : DASH$4 })
                    ]
                  },
                  item.id
                )
              ) })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("dl", { className: "grid grid-cols-2 gap-x-6 gap-y-2 border-t border-slate-100 pt-3 md:grid-cols-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Detail,
                {
                  label: "Total purchase",
                  value: formatBDT(
                    details.totalAmount
                  )
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Detail,
                {
                  label: "Paid",
                  value: formatBDT(
                    details.paidTotal
                  )
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Detail,
                {
                  label: "Credit applied",
                  value: formatBDT(
                    details.creditApplied
                  )
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Detail,
                {
                  label: "Outstanding",
                  value: formatBDT(
                    details.outstandingAmount
                  )
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Detail,
                {
                  label: "Returned to supplier",
                  value: formatBDT(
                    details.supplierReturns.filter(
                      (r2) => r2.status === "COMPLETED"
                    ).reduce(
                      (sum, r2) => sum + Number(
                        r2.returnValue
                      ),
                      0
                    )
                  )
                }
              )
            ] }),
            details.payments.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-2 font-medium text-slate-700", children: "Payments" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                DataTable,
                {
                  rows: details.payments,
                  keyFor: (p2) => p2.id,
                  emptyMessage: "No payments.",
                  columns: [
                    {
                      header: "Payment #",
                      accessor: (p2) => p2.paymentNumber || DASH$4
                    },
                    {
                      header: "Date",
                      accessor: (p2) => formatDate(
                        p2.paymentDate
                      )
                    },
                    {
                      header: "Amount",
                      accessor: (p2) => formatBDT(
                        p2.amount
                      )
                    },
                    {
                      header: "Method",
                      accessor: (p2) => p2.method
                    }
                  ]
                }
              )
            ] }),
            details.supplierReturns.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-2 font-medium text-slate-700", children: "Supplier returns from this purchase" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                DataTable,
                {
                  rows: details.supplierReturns,
                  keyFor: (r2) => r2.id,
                  emptyMessage: "No returns.",
                  columns: [
                    {
                      header: "Return #",
                      accessor: (r2) => r2.returnNumber
                    },
                    {
                      header: "Product",
                      accessor: (r2) => r2.product?.name ?? DASH$4
                    },
                    {
                      header: "Qty",
                      accessor: (r2) => Number(
                        r2.quantity
                      )
                    },
                    {
                      header: "Value",
                      accessor: (r2) => formatBDT(
                        r2.returnValue
                      )
                    },
                    {
                      header: "Status",
                      accessor: (r2) => r2.status
                    }
                  ]
                }
              )
            ] })
          ] })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Modal,
        {
          open: !!payTarget,
          title: payTarget ? `Payment for ${payTarget.purchaseNumber}` : "Payment",
          onClose: () => setPayTarget(null),
          children: payTarget && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "form",
            {
              onSubmit: handlePurchasePayment,
              className: "space-y-4",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Outstanding on this purchase", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    readOnly: true,
                    value: formatBDT(
                      payTarget.outstandingAmount
                    )
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Payment amount", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      type: "number",
                      min: 0,
                      step: "any",
                      required: true,
                      value: payForm.amount,
                      onChange: (e) => setPayForm({
                        ...payForm,
                        amount: e.target.value
                      })
                    }
                  ) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Method", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Select,
                    {
                      value: payForm.method,
                      onChange: (e) => setPayForm({
                        ...payForm,
                        method: e.target.value
                      }),
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "CASH", children: "Cash" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "BANK", children: "Bank transfer" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "BKASH", children: "bKash" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "OTHER", children: "Other" })
                      ]
                    }
                  ) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Reference", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    value: payForm.reference,
                    onChange: (e) => setPayForm({
                      ...payForm,
                      reference: e.target.value
                    })
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Notes", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    value: payForm.notes,
                    onChange: (e) => setPayForm({
                      ...payForm,
                      notes: e.target.value
                    })
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    type: "submit",
                    className: "w-full",
                    children: "Record Payment"
                  }
                )
              ]
            }
          )
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Modal,
        {
          open: modalOpen,
          title: "New Purchase",
          onClose: () => setModalOpen(false),
          wide: true,
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "form",
            {
              onSubmit: handleSubmit,
              className: "space-y-4",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Supplier", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Select,
                    {
                      required: true,
                      value: supplierId,
                      onChange: (e) => setSupplierId(
                        e.target.value
                      ),
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select…" }),
                        suppliers.map(
                          (supplier) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "option",
                            {
                              value: supplier.id,
                              children: supplier.name
                            },
                            supplier.id
                          )
                        )
                      ]
                    }
                  ) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Supplier invoice number", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      value: invoiceNumber,
                      onChange: (e) => setInvoiceNumber(
                        e.target.value
                      )
                    }
                  ) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Purchase date", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      type: "date",
                      value: purchaseDate,
                      onChange: (e) => setPurchaseDate(
                        e.target.value
                      )
                    }
                  ) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
                  rows.map(
                    (row, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "div",
                      {
                        className: "space-y-3 rounded-lg border border-slate-100 p-3",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-medium uppercase tracking-wide text-slate-400", children: [
                              "Item ",
                              i + 1
                            ] }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "button",
                              {
                                type: "button",
                                className: "text-red-500",
                                "aria-label": "Remove item",
                                onClick: () => setRows(
                                  (currentRows) => currentRows.filter(
                                    (_, index) => index !== i
                                  )
                                ),
                                children: "✕"
                              }
                            )
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-12 gap-3", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-12 md:col-span-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Product", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                              Select,
                              {
                                value: row.productId,
                                onChange: (e) => updateRow(
                                  i,
                                  {
                                    productId: e.target.value
                                  }
                                ),
                                required: true,
                                children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select…" }),
                                  products.map(
                                    (product) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                      "option",
                                      {
                                        value: product.id,
                                        children: [
                                          product.name,
                                          product.sku ? ` (${product.sku})` : ""
                                        ]
                                      },
                                      product.id
                                    )
                                  )
                                ]
                              }
                            ) }) }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-12 md:col-span-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Batch code", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                              Input,
                              {
                                placeholder: "Auto-generated if left empty",
                                value: row.batchCode,
                                onChange: (e) => updateRow(
                                  i,
                                  {
                                    batchCode: e.target.value
                                  }
                                )
                              }
                            ) }) }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-6 md:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Expiry date", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                              Input,
                              {
                                type: "date",
                                value: row.expiryDate,
                                onChange: (e) => updateRow(
                                  i,
                                  {
                                    expiryDate: e.target.value
                                  }
                                )
                              }
                            ) }) }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-6 md:col-span-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Quantity", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                              Input,
                              {
                                type: "number",
                                min: 1,
                                placeholder: "0",
                                value: row.quantity,
                                onChange: (e) => updateRow(
                                  i,
                                  {
                                    quantity: e.target.value
                                  }
                                )
                              }
                            ) }) }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-6 md:col-span-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Purchase cost", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                              Input,
                              {
                                type: "number",
                                min: 0,
                                step: "any",
                                placeholder: "0",
                                value: row.purchaseCost,
                                onChange: (e) => updateRow(
                                  i,
                                  {
                                    purchaseCost: e.target.value
                                  }
                                )
                              }
                            ) }) }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-6 md:col-span-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Selling cost", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                              Input,
                              {
                                type: "number",
                                min: 0,
                                step: "any",
                                placeholder: "0",
                                value: row.sellingCost,
                                onChange: (e) => updateRow(
                                  i,
                                  {
                                    /*
                                     * FIX:
                                     * Keep the manually
                                     * entered selling cost.
                                     */
                                    sellingCost: e.target.value
                                  }
                                )
                              }
                            ) }) }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-12 flex items-end md:col-span-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-slate-500", children: [
                              "Line total:",
                              " ",
                              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-slate-700", children: formatBDT(
                                Number(
                                  row.quantity || 0
                                ) * Number(
                                  row.purchaseCost || 0
                                )
                              ) })
                            ] }) })
                          ] })
                        ]
                      },
                      i
                    )
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      className: "text-sm text-brand-600 hover:underline",
                      onClick: () => setRows(
                        (currentRows) => [
                          ...currentRows,
                          {
                            ...emptyRow
                          }
                        ]
                      ),
                      children: "+ Add item"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 items-end gap-4 rounded-lg bg-brand-50 px-4 py-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-slate-600", children: [
                    "Purchase total:",
                    " ",
                    formatBDT(total)
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Paid amount", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      type: "number",
                      min: 0,
                      step: "any",
                      value: paidAmount,
                      onChange: (e) => setPaidAmount(
                        e.target.value
                      )
                    }
                  ) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Payment method", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Select,
                    {
                      value: paymentMethod,
                      onChange: (e) => setPaymentMethod(
                        e.target.value
                      ),
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "CASH", children: "Cash" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "BANK", children: "Bank transfer" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "BKASH", children: "bKash" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "OTHER", children: "Other" })
                      ]
                    }
                  ) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    type: "submit",
                    className: "w-full",
                    disabled: saving,
                    children: saving ? "Saving…" : "Save Purchase"
                  }
                )
              ]
            }
          )
        }
      )
    ] }),
    printingPurchase && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "purchase-print-sheet", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "purchase-print-page", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "purchase-print-header", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "purchase-print-brand", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: logo,
              alt: "Torki Bazar",
              className: "purchase-print-logo"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "purchase-print-company", children: "TORKI BAZAR" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "purchase-print-address", children: "Torki Bandar, Gournadi, Barishal" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "purchase-print-email", children: "E-mail: contact@torkibazar" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "purchase-print-title", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "purchase-print-small-title", children: "PURCHASE" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "purchase-print-number", children: printingPurchase.purchaseNumber }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "purchase-print-date", children: formatDate(
            printingPurchase.purchaseDate
          ) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "purchase-print-line" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "purchase-print-info", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "purchase-print-info-block", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "purchase-print-section-title", children: "SUPPLIER" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "purchase-print-info-row", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: printingPurchase.supplier?.name })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "purchase-print-info-row", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Company" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: printingPurchase.supplier?.company || DASH$4 })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "purchase-print-info-row", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Phone" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: printingPurchase.supplier?.phone || DASH$4 })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "purchase-print-info-block", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "purchase-print-section-title", children: "PURCHASE DETAILS" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "purchase-print-info-row", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Invoice" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: printingPurchase.invoiceNumber || DASH$4 })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "purchase-print-info-row", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Payment" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: printingPurchase.derivedPaymentStatus })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "purchase-print-info-row", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: printingPurchase.status })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "purchase-print-section-title purchase-print-items-title", children: "ITEMS" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "purchase-print-table", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "col-no", children: "#" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "col-product", children: "Product" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "col-sku", children: "SKU" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "col-batch", children: "Batch" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "col-qty", children: "Qty" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "col-cost", children: "Purchase Cost" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "col-selling", children: "Selling Cost" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "col-total", children: "Total" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: printingPurchase.items.map(
          (item, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "text-center", children: index + 1 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: item.product.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: item.product.sku || DASH$4 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: item.batch?.batchCode || DASH$4 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "text-right", children: Number(
              item.quantity
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "text-right", children: formatBDT(
              item.unitCost
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "text-right", children: formatBDT(
              item.batch?.sellingPrice ?? 0
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "text-right", children: formatBDT(
              item.total
            ) })
          ] }, item.id)
        ) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "purchase-print-bottom", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "purchase-print-payment-history", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "purchase-print-section-title", children: "PAYMENT HISTORY" }),
          printingPurchase.payments.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "purchase-print-payment-table", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Payment #" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Method" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right", children: "Amount" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: printingPurchase.payments.map(
              (payment) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "tr",
                {
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: payment.paymentNumber || DASH$4 }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: formatDate(
                      payment.paymentDate
                    ) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: payment.method }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "text-right", children: formatBDT(
                      payment.amount
                    ) })
                  ]
                },
                payment.id
              )
            ) })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "purchase-print-empty", children: "No payments recorded." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "purchase-print-summary", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "purchase-print-summary-row", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Purchase Total" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: formatBDT(
              printingPurchase.totalAmount
            ) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "purchase-print-summary-row", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Paid" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "green", children: formatBDT(
              printingPurchase.paidTotal
            ) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "purchase-print-summary-row", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Credit Applied" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: formatBDT(
              printingPurchase.creditApplied
            ) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "purchase-print-summary-row outstanding", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Outstanding" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: formatBDT(
              printingPurchase.outstandingAmount
            ) })
          ] })
        ] })
      ] }),
      printingPurchase.supplierReturns.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "purchase-print-returns", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "purchase-print-section-title", children: "SUPPLIER RETURNS" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "purchase-print-payment-table", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Return #" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Product" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Qty" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Value" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Status" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: printingPurchase.supplierReturns.map(
            (item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "tr",
              {
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: item.returnNumber }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: item.product?.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: Number(
                    item.quantity
                  ) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: formatBDT(
                    item.returnValue
                  ) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: item.status })
                ]
              },
              item.id
            )
          ) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "purchase-print-footer", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "TORKI BAZAR" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Torki Bandar, Gournadi, Barishal" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "contact@torkibazar" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "purchase-print-footer-number", children: [
          "Purchase:",
          " ",
          printingPurchase.purchaseNumber
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
        .purchase-print-sheet {
          display: none;
        }

        @page {
          size: A4 portrait;
          margin: 7mm;
        }

        @media print {
          html,
          body {
            width: 100% !important;
            min-width: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
          }

          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          body * {
            visibility: hidden !important;
          }

          .purchase-print-sheet,
          .purchase-print-sheet * {
            visibility: visible !important;
          }

          .purchase-print-sheet {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 196mm !important;
            max-width: 196mm !important;
            box-sizing: border-box !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
          }

          .purchase-print-page {
            width: 196mm !important;
            max-width: 196mm !important;
            min-height: 282mm;
            max-height: 282mm;
            box-sizing: border-box !important;
            padding: 4mm 5mm 3mm 5mm;
            margin: 0 !important;
            background: #ffffff;
            color: #111827;
            font-family:
              Arial,
              Helvetica,
              sans-serif;
            font-size: 8.5pt;
            line-height: 1.2;
            overflow: hidden !important;
          }

          .purchase-print-header {
            display: flex;
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
            align-items: flex-start;
            justify-content: space-between;
            gap: 6mm;
          }

          .purchase-print-brand {
            display: flex;
            align-items: center;
            min-width: 0;
            flex: 1 1 auto;
            overflow: hidden;
          }

          .purchase-print-logo {
            width: 22mm;
            height: 22mm;
            object-fit: contain;
            display: block;
            flex: 0 0 22mm;
            margin-right: 4mm;
          }

          .purchase-print-company {
            font-size: 16pt;
            font-weight: 800;
            letter-spacing: 0.5px;
            line-height: 1.05;
            color: #166534;
          }

          .purchase-print-address,
          .purchase-print-email {
            margin-top: 1.2mm;
            color: #4b5563;
            font-size: 8pt;
          }

          .purchase-print-title {
            flex: 0 0 55mm;
            width: 55mm;
            min-width: 55mm;
            text-align: right;
            padding-top: 1mm;
            box-sizing: border-box;
            overflow: hidden;
          }

          .purchase-print-small-title {
            font-size: 7.5pt;
            font-weight: 700;
            letter-spacing: 1.3px;
            color: #6b7280;
          }

          .purchase-print-number {
            margin-top: 1mm;
            font-size: 13pt;
            font-weight: 800;
            color: #111827;
            white-space: nowrap;
          }

          .purchase-print-date {
            margin-top: 1.5mm;
            font-size: 8pt;
            color: #6b7280;
          }

          .purchase-print-line {
            width: 100%;
            max-width: 100%;
            height: 0.35mm;
            background: #1f2937;
            margin: 3mm 0;
            box-sizing: border-box;
          }

          .purchase-print-info {
            display: grid;
            grid-template-columns:
              minmax(0, 1fr)
              minmax(0, 1fr);
            column-gap: 8mm;
            width: 100%;
            max-width: 100%;
            margin-bottom: 3mm;
            box-sizing: border-box;
          }

          .purchase-print-info-block {
            min-width: 0;
            max-width: 100%;
            overflow: hidden;
          }

          .purchase-print-section-title {
            font-size: 7pt;
            font-weight: 800;
            letter-spacing: 1px;
            color: #6b7280;
            margin-bottom: 1.5mm;
          }

          .purchase-print-info-row {
            display: flex;
            justify-content: space-between;
            gap: 3mm;
            width: 100%;
            max-width: 100%;
            border-bottom: 0.2mm solid #e5e7eb;
            padding: 1.2mm 0;
            box-sizing: border-box;
          }

          .purchase-print-info-row span:first-child {
            color: #6b7280;
            flex: 0 0 23mm;
          }

          .purchase-print-info-row span:last-child,
          .purchase-print-info-row strong {
            min-width: 0;
            max-width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            text-align: right;
          }

          .purchase-print-items-title {
            margin-top: 1mm;
          }

          .purchase-print-table {
            width: 100% !important;
            max-width: 100% !important;
            border-collapse: collapse;
            table-layout: fixed !important;
            font-size: 7.2pt;
            box-sizing: border-box;
          }

          .purchase-print-table th,
          .purchase-print-table td {
            border-bottom: 0.2mm solid #d1d5db;
            padding: 1.3mm 1mm;
            vertical-align: middle;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            box-sizing: border-box;
          }

          .purchase-print-table thead th {
            border-top: 0.3mm solid #374151;
            border-bottom: 0.3mm solid #374151;
            color: #374151;
            font-weight: 800;
            text-transform: uppercase;
            font-size: 6.4pt;
            letter-spacing: 0.2px;
          }

          .purchase-print-table .col-no {
            width: 4%;
            text-align: center;
          }

          .purchase-print-table .col-product {
            width: 24%;
          }

          .purchase-print-table .col-sku {
            width: 9%;
          }

          .purchase-print-table .col-batch {
            width: 18%;
          }

          .purchase-print-table .col-qty {
            width: 7%;
            text-align: right;
          }

          .purchase-print-table .col-cost {
            width: 13%;
            text-align: right;
          }

          .purchase-print-table .col-selling {
            width: 13%;
            text-align: right;
          }

          .purchase-print-table .col-total {
            width: 12%;
            text-align: right;
          }

          .purchase-print-table tbody tr:last-child td {
            border-bottom: 0.3mm solid #374151;
          }

          .text-right {
            text-align: right !important;
          }

          .text-center {
            text-align: center !important;
          }

          .purchase-print-bottom {
            display: grid;
            grid-template-columns:
              minmax(0, 1fr)
              62mm;
            gap: 7mm;
            width: 100%;
            max-width: 100%;
            margin-top: 4mm;
            align-items: start;
            box-sizing: border-box;
          }

          .purchase-print-payment-history {
            min-width: 0;
            max-width: 100%;
            overflow: hidden;
          }

          .purchase-print-payment-table {
            width: 100% !important;
            max-width: 100% !important;
            border-collapse: collapse;
            table-layout: fixed;
            font-size: 7.2pt;
            box-sizing: border-box;
          }

          .purchase-print-payment-table th,
          .purchase-print-payment-table td {
            padding: 1.3mm 1mm;
            border-bottom: 0.2mm solid #e5e7eb;
            text-align: left;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            box-sizing: border-box;
          }

          .purchase-print-payment-table th {
            color: #6b7280;
            font-size: 6.6pt;
            text-transform: uppercase;
            font-weight: 800;
          }

          .purchase-print-payment-table th:last-child,
          .purchase-print-payment-table td:last-child {
            text-align: right;
          }

          .purchase-print-summary {
            width: 62mm;
            max-width: 62mm;
            min-width: 0;
            border-top: 0.3mm solid #374151;
            box-sizing: border-box;
          }

          .purchase-print-summary-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 3mm;
            width: 100%;
            padding: 1.8mm 0;
            border-bottom: 0.2mm solid #e5e7eb;
            font-size: 8pt;
            box-sizing: border-box;
          }

          .purchase-print-summary-row span {
            color: #6b7280;
            min-width: 0;
          }

          .purchase-print-summary-row strong {
            color: #111827;
            white-space: nowrap;
            flex-shrink: 0;
          }

          .purchase-print-summary-row .green,
          .purchase-print-summary-row strong.green {
            color: #15803d;
          }

          .purchase-print-summary-row.outstanding {
            border-top: 0.3mm solid #9ca3af;
            margin-top: 1mm;
            padding-top: 2mm;
          }

          .purchase-print-summary-row.outstanding span,
          .purchase-print-summary-row.outstanding strong {
            color: #dc2626;
            font-weight: 800;
          }

          .purchase-print-returns {
            width: 100%;
            max-width: 100%;
            margin-top: 4mm;
            page-break-inside: avoid;
            break-inside: avoid;
            overflow: hidden;
          }

          .purchase-print-footer {
            width: 100%;
            max-width: 100%;
            border-top: 0.25mm solid #d1d5db;
            margin-top: 5mm;
            padding-top: 2.5mm;
            text-align: center;
            color: #6b7280;
            font-size: 6.8pt;
            line-height: 1.4;
            box-sizing: border-box;
          }

          .purchase-print-footer-number {
            margin-top: 1mm;
            color: #9ca3af;
          }

          .purchase-print-empty {
            color: #9ca3af;
            padding: 2mm 0;
            font-size: 7pt;
          }

          .purchase-print-table,
          .purchase-print-payment-table,
          .purchase-print-info,
          .purchase-print-bottom,
          .purchase-print-returns {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
      ` })
  ] });
}
function Detail({
  label: label2,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-slate-500", children: label2 }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "font-medium text-slate-800", children: value })
  ] });
}
function CustomersPage() {
  const [customers, setCustomers] = reactExports.useState([]);
  const [modalOpen, setModalOpen] = reactExports.useState(false);
  const [editingCustomer, setEditingCustomer] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({
    name: "",
    phone: "",
    address: ""
  });
  const [saving, setSaving] = reactExports.useState(false);
  const push = useToastStore((s) => s.push);
  async function load() {
    try {
      const data = await call("customers:list");
      setCustomers(data);
    } catch (err) {
      push(
        err instanceof Error ? err.message : "Failed to load customers",
        "error"
      );
    }
  }
  reactExports.useEffect(() => {
    load();
  }, []);
  function resetForm() {
    setForm({
      name: "",
      phone: "",
      address: ""
    });
    setEditingCustomer(null);
  }
  function openCreateModal() {
    resetForm();
    setModalOpen(true);
  }
  function openEditModal(customer) {
    setEditingCustomer(customer);
    setForm({
      name: customer.name ?? "",
      phone: customer.phone ?? "",
      address: customer.address ?? ""
    });
    setModalOpen(true);
  }
  function closeModal() {
    if (saving) return;
    setModalOpen(false);
    resetForm();
  }
  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      push("Customer name is required.", "error");
      return;
    }
    setSaving(true);
    try {
      if (editingCustomer) {
        await call("customers:update", {
          id: editingCustomer.id,
          name: form.name.trim(),
          phone: form.phone.trim(),
          address: form.address.trim()
        });
        push("Customer updated successfully.", "success");
      } else {
        await call("customers:create", {
          name: form.name.trim(),
          phone: form.phone.trim(),
          address: form.address.trim()
        });
        push("Customer created.", "success");
      }
      setModalOpen(false);
      resetForm();
      await load();
    } catch (err) {
      push(
        err instanceof Error ? err.message : editingCustomer ? "Failed to update customer" : "Failed to create customer",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(
    (customer) => customer.status?.toUpperCase() === "ACTIVE"
  ).length;
  const totalSpending = customers.reduce(
    (sum, customer) => sum + Number(customer.totalSpending || 0),
    0
  );
  const totalOutstanding = customers.reduce(
    (sum, customer) => sum + Number(customer.outstandingBalance || 0),
    0
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "customers-root min-h-full space-y-6 bg-slate-50/60 p-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hero-panel relative overflow-hidden rounded-3xl p-6 shadow-xl shadow-emerald-900/10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hero-mesh pointer-events-none absolute inset-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl animate-[float_9s_ease-in-out_infinite]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-emerald-300/10 blur-3xl animate-[float_11s_ease-in-out_infinite_reverse]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "reveal", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center gap-2 text-emerald-100", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "svg",
              {
                width: "17",
                height: "17",
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: "currentColor",
                strokeWidth: "2",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "9", cy: "7", r: "4" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M22 21v-2a4 4 0 0 0-3-3.87" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M16 3.13a4 4 0 0 1 0 7.75" })
                ]
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em]", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "relative flex h-1.5 w-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-200" })
              ] }),
              "Customer Management"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "hero-title text-3xl font-bold tracking-tight md:text-4xl", children: "Customers" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 max-w-xl text-sm text-emerald-50/80", children: "Manage customers, memberships, spending and receivables from one place." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: openCreateModal,
            className: "reveal group inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-emerald-700 shadow-lg shadow-black/10 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-50 hover:shadow-xl active:translate-y-0",
            style: { animationDelay: "80ms" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-lg leading-none text-emerald-700 transition-all duration-300 group-hover:rotate-90 group-hover:bg-emerald-200", children: "+" }),
              "New Customer"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "summary-card group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg",
          style: { animationDelay: "0ms" },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-emerald-50 blur-2xl transition-transform duration-500 group-hover:scale-150" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-start justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wider text-slate-400", children: "Total Customers" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-3xl font-bold tracking-tight text-slate-900 tabular-nums", children: totalCustomers }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-slate-500", children: "Registered customers" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition-transform duration-300 group-hover:scale-110", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "svg",
                {
                  width: "21",
                  height: "21",
                  viewBox: "0 0 24 24",
                  fill: "none",
                  stroke: "currentColor",
                  strokeWidth: "2",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "9", cy: "7", r: "4" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M22 21v-2a4 4 0 0 0-3-3.87" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M16 3.13a4 4 0 0 1 0 7.75" })
                  ]
                }
              ) })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "summary-card group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg",
          style: { animationDelay: "60ms" },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-blue-50 blur-2xl transition-transform duration-500 group-hover:scale-150" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-start justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wider text-slate-400", children: "Active Customers" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-3xl font-bold tracking-tight text-slate-900 tabular-nums", children: activeCustomers }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-slate-500", children: "Currently active" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-transform duration-300 group-hover:scale-110", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "svg",
                {
                  width: "21",
                  height: "21",
                  viewBox: "0 0 24 24",
                  fill: "none",
                  stroke: "currentColor",
                  strokeWidth: "2",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M20 6L9 17l-5-5" })
                }
              ) })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "summary-card group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg",
          style: { animationDelay: "120ms" },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-violet-50 blur-2xl transition-transform duration-500 group-hover:scale-150" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-start justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wider text-slate-400", children: "Customer Spending" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-2xl font-bold tracking-tight text-slate-900 tabular-nums", children: formatBDT(totalSpending) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-slate-500", children: "Total customer purchases" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 transition-transform duration-300 group-hover:scale-110", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "svg",
                {
                  width: "21",
                  height: "21",
                  viewBox: "0 0 24 24",
                  fill: "none",
                  stroke: "currentColor",
                  strokeWidth: "2",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "3", y: "5", width: "18", height: "14", rx: "2" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M3 10h18" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M7 15h3" })
                  ]
                }
              ) })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "summary-card group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-red-200 hover:shadow-lg",
          style: { animationDelay: "180ms" },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-red-50 blur-2xl transition-transform duration-500 group-hover:scale-150" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-start justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wider text-slate-400", children: "Outstanding" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "p",
                  {
                    className: `mt-2 text-2xl font-bold tracking-tight tabular-nums ${totalOutstanding > 0 ? "text-red-600" : "text-slate-900"}`,
                    children: formatBDT(totalOutstanding)
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-slate-500", children: "Customer receivables" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-500 transition-transform duration-300 group-hover:scale-110", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "svg",
                {
                  width: "21",
                  height: "21",
                  viewBox: "0 0 24 24",
                  fill: "none",
                  stroke: "currentColor",
                  strokeWidth: "2",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "3", y: "5", width: "18", height: "14", rx: "2" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M3 10h18" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M7 15h4" })
                  ]
                }
              ) })
            ] })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "reveal", style: { animationDelay: "220ms" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-5 flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "svg",
            {
              width: "18",
              height: "18",
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              strokeWidth: "2",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "9", cy: "7", r: "4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M22 21v-2a4 4 0 0 0-3-3.87" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M16 3.13a4 4 0 0 1 0 7.75" })
              ]
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold text-slate-900", children: "Customer Directory" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-slate-500", children: [
              totalCustomers,
              " customer",
              totalCustomers === 1 ? "" : "s",
              " registered"
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" }),
          "Live customer data"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        DataTable,
        {
          rows: customers,
          keyFor: (c) => c.id,
          emptyMessage: "No customers yet.",
          columns: [
            {
              header: "Customer",
              accessor: (c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group/row flex items-center gap-3 py-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-green-50 text-sm font-bold text-emerald-700 ring-1 ring-emerald-100 transition-transform duration-300 group-hover/row:scale-105", children: c.name?.charAt(0)?.toUpperCase() || "C" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-slate-900", children: c.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-400", children: "Customer" })
                ] })
              ] })
            },
            {
              header: "Phone",
              accessor: (c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-slate-600", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "svg",
                  {
                    width: "14",
                    height: "14",
                    viewBox: "0 0 24 24",
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: "2",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 3.11 5.18 2 2 0 0 1 5.1 3h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L9.09 10.91a16 16 0 0 0 4 4l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 15.9z" })
                  }
                ) }),
                c.phone || "—"
              ] })
            },
            {
              header: "Membership",
              accessor: (c) => c.membership?.membershipNumber ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-700", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "♛" }),
                c.membership.membershipNumber
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-400", children: "—" })
            },
            {
              header: "Total Spending",
              accessor: (c) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold tabular-nums text-slate-800", children: formatBDT(c.totalSpending) })
            },
            {
              header: "Outstanding",
              accessor: (c) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: c.outstandingBalance > 0 ? "font-bold tabular-nums text-red-600" : "font-medium tabular-nums text-slate-600",
                  children: formatBDT(c.outstandingBalance)
                }
              )
            },
            {
              header: "Status",
              accessor: (c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "span",
                {
                  className: `inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${c.status?.toUpperCase() === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "span",
                      {
                        className: `h-1.5 w-1.5 rounded-full ${c.status?.toUpperCase() === "ACTIVE" ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`
                      }
                    ),
                    c.status
                  ]
                }
              )
            },
            {
              header: "Action",
              accessor: (c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => openEditModal(c),
                  className: "inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "svg",
                      {
                        width: "14",
                        height: "14",
                        viewBox: "0 0 24 24",
                        fill: "none",
                        stroke: "currentColor",
                        strokeWidth: "2",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 20h9" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" })
                        ]
                      }
                    ),
                    "Edit"
                  ]
                }
              )
            }
          ]
        }
      ) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Modal,
      {
        open: modalOpen,
        title: editingCustomer ? "Edit Customer" : "New Customer",
        onClose: closeModal,
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl bg-gradient-to-r from-emerald-50 to-green-50 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md", children: editingCustomer ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "svg",
              {
                width: "20",
                height: "20",
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: "currentColor",
                strokeWidth: "2",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 20h9" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" })
                ]
              }
            ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "svg",
              {
                width: "20",
                height: "20",
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: "currentColor",
                strokeWidth: "2",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "9", cy: "7", r: "4" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M19 8v6" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M22 11h-6" })
                ]
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-slate-900", children: editingCustomer ? "Update customer information" : "Create a new customer" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500", children: "Customer details can be updated later." })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Name", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              required: true,
              value: form.name,
              placeholder: "Enter customer name",
              onChange: (e) => setForm({
                ...form,
                name: e.target.value
              })
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Phone", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: form.phone,
              placeholder: "Enter phone number",
              onChange: (e) => setForm({
                ...form,
                phone: e.target.value
              })
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Address", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: form.address,
              placeholder: "Enter customer address",
              onChange: (e) => setForm({
                ...form,
                address: e.target.value
              })
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 pt-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: closeModal,
                disabled: saving,
                className: "flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0",
                children: "Cancel"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "submit",
                disabled: saving,
                className: "flex-1 !bg-emerald-600 !text-white shadow-lg shadow-emerald-600/20 transition-all duration-300 hover:!-translate-y-0.5 hover:!bg-emerald-700",
                children: saving ? "Saving..." : editingCustomer ? "Update Customer" : "Save Customer"
              }
            )
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
        .hero-panel {
          background: linear-gradient(120deg, #059669 0%, #047857 45%, #14532d 100%);
        }
        .hero-mesh {
          background-image:
            radial-gradient(circle at 15% 20%, rgba(255,255,255,0.12), transparent 45%),
            radial-gradient(circle at 85% 75%, rgba(16,185,129,0.18), transparent 40%);
          background-size: 200% 200%;
          animation: meshShift 14s ease-in-out infinite;
        }
        .hero-title {
          background: linear-gradient(90deg, #ffffff 0%, #e6fff4 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .reveal, .summary-card {
          animation: slideUp 0.55s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-10px, 12px) scale(1.05); }
        }
        @keyframes meshShift {
          0%, 100% { background-position: 0% 0%; }
          50% { background-position: 100% 100%; }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-mesh, .reveal, .summary-card, .animate-pulse, .animate-ping {
            animation: none !important;
          }
        }
      ` })
  ] });
}
function MembershipPage() {
  const [customers, setCustomers] = reactExports.useState([]);
  const [modalOpen, setModalOpen] = reactExports.useState(false);
  const [customerId, setCustomerId] = reactExports.useState("");
  const [phoneSearch, setPhoneSearch] = reactExports.useState("");
  const [searchCode, setSearchCode] = reactExports.useState("");
  const [found, setFound] = reactExports.useState(null);
  const push = useToastStore((s) => s.push);
  reactExports.useEffect(() => {
    call("customers:list").then(setCustomers).catch(() => {
    });
  }, []);
  const matches = customers.filter(
    (c) => phoneSearch && c.phone?.includes(phoneSearch)
  );
  async function handleIssue(e) {
    e.preventDefault();
    try {
      await call("membership:issue", { customerId });
      push("Membership card issued.", "success");
      setModalOpen(false);
      setCustomerId("");
      setPhoneSearch("");
    } catch (err) {
      push(err instanceof Error ? err.message : "Failed to issue membership", "error");
    }
  }
  async function handleSearch(e) {
    e.preventDefault();
    try {
      setFound(await call("membership:find", { code: searchCode }));
    } catch (err) {
      setFound(null);
      push(err instanceof Error ? err.message : "Membership not found", "error");
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-semibold text-slate-900", children: "Membership" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-500", children: "Issue and look up customer membership cards." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setModalOpen(true), children: "+ Issue Membership" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-3 font-semibold text-slate-800", children: "Find membership" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSearch, className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: "Membership ID or QR code",
            value: searchCode,
            onChange: (e) => setSearchCode(e.target.value)
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", children: "Search" })
      ] }),
      found && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 rounded-xl border border-brand-200 bg-brand-50 p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-semibold", children: found.customer?.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "Member ID: ",
          found.membershipNumber
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "Phone: ",
          found.customer?.phone ?? "—"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "Status: ",
          found.status
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Modal,
      {
        open: modalOpen,
        title: "Issue Membership Card",
        onClose: () => setModalOpen(false),
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleIssue, className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Search Customer by Mobile Number", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "tel",
              placeholder: "Enter mobile number",
              value: phoneSearch,
              onChange: (e) => {
                setPhoneSearch(e.target.value);
                setCustomerId("");
              }
            }
          ) }),
          phoneSearch && !customerId && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: matches.length ? matches.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => setCustomerId(c.id),
              className: "w-full rounded-lg border p-3 text-left hover:bg-slate-50",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: c.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-slate-500", children: c.phone })
              ]
            },
            c.id
          )) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-500", children: "No customer found." }) }),
          customerId && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-lg bg-green-50 p-3 text-sm", children: "Customer selected ✓" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "w-full", disabled: !customerId, children: "Issue Card" })
        ] })
      }
    )
  ] });
}
function withOrderHash(raw) {
  const value = raw.replace(/^#+/, "").trimStart();
  return value ? `#${value}` : "";
}
let posAudioContext = null;
function getPosAudioContext() {
  if (!posAudioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    posAudioContext = new AudioContextClass();
  }
  if (posAudioContext.state === "suspended") {
    posAudioContext.resume().catch(() => {
    });
  }
  return posAudioContext;
}
function playScanSound() {
  const ctx = getPosAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(
    1050,
    now
  );
  oscillator.frequency.exponentialRampToValueAtTime(
    1450,
    now + 0.045
  );
  gain.gain.setValueAtTime(
    1e-4,
    now
  );
  gain.gain.exponentialRampToValueAtTime(
    0.16,
    now + 8e-3
  );
  gain.gain.exponentialRampToValueAtTime(
    1e-4,
    now + 0.09
  );
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.1);
}
function playErrorSound() {
  const ctx = getPosAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = "square";
  oscillator.frequency.setValueAtTime(
    260,
    now
  );
  oscillator.frequency.setValueAtTime(
    190,
    now + 0.1
  );
  gain.gain.setValueAtTime(
    1e-4,
    now
  );
  gain.gain.exponentialRampToValueAtTime(
    0.12,
    now + 0.01
  );
  gain.gain.exponentialRampToValueAtTime(
    1e-4,
    now + 0.18
  );
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.2);
}
function playSuccessSound() {
  const ctx = getPosAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const notes = [
    {
      frequency: 523.25,
      start: 0,
      duration: 0.12
    },
    {
      frequency: 659.25,
      start: 0.09,
      duration: 0.12
    },
    {
      frequency: 783.99,
      start: 0.18,
      duration: 0.22
    }
  ];
  notes.forEach((note) => {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(
      note.frequency,
      now + note.start
    );
    const start = now + note.start;
    const end = start + note.duration;
    gain.gain.setValueAtTime(
      1e-4,
      start
    );
    gain.gain.exponentialRampToValueAtTime(
      0.14,
      start + 0.015
    );
    gain.gain.exponentialRampToValueAtTime(
      1e-4,
      end
    );
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(start);
    oscillator.stop(end + 0.02);
  });
}
function ScanIcon({ size = 20 }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "svg",
    {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M3 7V5a2 2 0 0 1 2-2h2" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M17 3h2a2 2 0 0 1 2 2v2" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M21 17v2a2 2 0 0 1-2 2h-2" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M7 21H5a2 2 0 0 1-2-2v-2" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M7 8v8" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M10 8v8" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M13 8v8" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M17 8v8" })
      ]
    }
  );
}
function CartIcon({ size = 20 }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "svg",
    {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "9", cy: "20", r: "1" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "18", cy: "20", r: "1" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L21 8H6" })
      ]
    }
  );
}
function UserIcon$1({ size = 18 }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "svg",
    {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "8", r: "4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M4 21a8 8 0 0 1 16 0" })
      ]
    }
  );
}
function PhoneIcon({ size = 17 }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "svg",
    {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.2-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.8 2.1Z" })
    }
  );
}
function CreditCardIcon({ size = 18 }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "svg",
    {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "3", y: "5", width: "18", height: "14", rx: "2" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M3 10h18" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M7 15h3" })
      ]
    }
  );
}
function TagIcon({ size = 18 }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "svg",
    {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3.4 13.4a2 2 0 0 1-.6-1.4V5a2 2 0 0 1 2-2h7a2 2 0 0 1 1.4.6l7.4 7a2 2 0 0 1 0 2.8Z" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "8", cy: "8", r: "1.2" })
      ]
    }
  );
}
function TrashIcon({ size = 17 }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "svg",
    {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M4 7h16" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M10 11v6" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M14 11v6" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "m6 7 1 14h10l1-14" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M9 7V4h6v3" })
      ]
    }
  );
}
function PlusIcon$1({ size = 15 }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "svg",
    {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 5v14" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M5 12h14" })
      ]
    }
  );
}
function MinusIcon({ size = 15 }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "svg",
    {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M5 12h14" })
    }
  );
}
function ArrowRightIcon({ size = 18 }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "svg",
    {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M5 12h14" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "m13 6 6 6-6 6" })
      ]
    }
  );
}
function ReceiptIcon$2({ size = 19 }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "svg",
    {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M6 3h12v18l-2.5-1.5L13 21l-2.5-1.5L8 21l-2-1.5L4 21V5a2 2 0 0 1 2-2Z" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M8 8h8" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M8 12h8" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M8 16h5" })
      ]
    }
  );
}
function SparkleIcon({ size = 18 }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "svg",
    {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.7",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3Z" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z" })
      ]
    }
  );
}
function SectionHeader({
  icon,
  title,
  subtitle
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center gap-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700", children: icon }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-bold text-slate-900", children: title }),
      subtitle && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 text-[11px] text-slate-400", children: subtitle })
    ] })
  ] });
}
function SummaryRow({
  label: label2,
  value,
  emphasis = false
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "span",
      {
        className: emphasis ? "text-sm font-semibold text-slate-800" : "text-xs text-slate-500",
        children: label2
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "span",
      {
        className: emphasis ? "text-xl font-black tracking-tight text-emerald-700" : "text-xs font-semibold text-slate-700",
        children: value
      }
    )
  ] });
}
function PosPage() {
  const [code, setCode] = reactExports.useState("");
  const [cart, setCart] = reactExports.useState([]);
  const [customers, setCustomers] = reactExports.useState([]);
  const [customerId, setCustomerId] = reactExports.useState("");
  const [customerName, setCustomerName] = reactExports.useState("");
  const [mobileNumber, setMobileNumber] = reactExports.useState("");
  const [membershipNumber, setMembershipNumber] = reactExports.useState("");
  const [onlineOrderNumber, setOnlineOrderNumber] = reactExports.useState("");
  const [paymentMethod, setPaymentMethod] = reactExports.useState(
    "CASH"
  );
  const [overallDiscount, setOverallDiscount] = reactExports.useState("0");
  const [processing, setProcessing] = reactExports.useState(false);
  const inputRef = reactExports.useRef(null);
  const push = useToastStore((s) => s.push);
  reactExports.useEffect(() => {
    call("customers:list").then(setCustomers).catch(() => {
    });
    inputRef.current?.focus();
  }, []);
  async function handleScan(e) {
    e.preventDefault();
    if (!code.trim()) return;
    try {
      const product = await call(
        "products:findByCode",
        {
          code: code.trim()
        }
      );
      const resolvedPrice = Number(product.sellingPrice) || 0;
      setCart((prev) => {
        const existing = prev.find(
          (l2) => l2.product.id === product.id
        );
        if (existing) {
          return prev.map(
            (l2) => l2.product.id === product.id ? {
              ...l2,
              quantity: l2.quantity + 1,
              // If unit price was previously 0, update it with the resolved batch price
              unitPrice: l2.unitPrice === 0 ? resolvedPrice : l2.unitPrice
            } : l2
          );
        }
        return [
          ...prev,
          {
            product,
            quantity: 1,
            unitPrice: resolvedPrice,
            discount: 0
          }
        ];
      });
      playScanSound();
      setCode("");
    } catch (err) {
      playErrorSound();
      push(
        err instanceof Error ? err.message : "Product not found",
        "error"
      );
      setCode("");
    }
  }
  function updateLine(productId, patch) {
    setCart(
      (prev) => prev.map(
        (l2) => l2.product.id === productId ? { ...l2, ...patch } : l2
      )
    );
  }
  function removeLine(productId) {
    setCart(
      (prev) => prev.filter(
        (l2) => l2.product.id !== productId
      )
    );
  }
  const subtotal = cart.reduce(
    (sum, l2) => sum + l2.quantity * l2.unitPrice - l2.discount,
    0
  );
  const total = Math.max(
    0,
    subtotal - Number(overallDiscount || 0)
  );
  function selectCustomer(id2) {
    setCustomerId(id2);
    const customer = customers.find(
      (c) => c.id === id2
    );
    setCustomerName(
      customer?.name ?? ""
    );
    setMobileNumber(
      customer?.phone ?? ""
    );
    setMembershipNumber(
      customer?.membership?.membershipNumber ?? ""
    );
  }
  async function handleCheckout() {
    if (cart.length === 0) return;
    const missing = !customerName.trim() ? "Customer Name" : !mobileNumber.trim() ? "Mobile Number" : !onlineOrderNumber.trim() ? "Online Order Number" : null;
    if (missing) {
      playErrorSound();
      push(
        `${missing} is required to complete the sale.`,
        "error"
      );
      return;
    }
    setProcessing(true);
    try {
      await call("sales:create", {
        customerId: customerId || void 0,
        customerName: customerName.trim(),
        customerPhone: mobileNumber.trim(),
        paymentMethod,
        overallDiscount: Number(
          overallDiscount || 0
        ),
        onlineOrderNumber: onlineOrderNumber.trim(),
        items: cart.map((l2) => ({
          productId: l2.product.id,
          quantity: l2.quantity,
          unitPrice: l2.unitPrice,
          discount: l2.discount
        }))
      });
      push(
        "Sale completed.",
        "success"
      );
      playSuccessSound();
      setCart([]);
      setOverallDiscount("0");
      selectCustomer("");
      setOnlineOrderNumber("");
      inputRef.current?.focus();
    } catch (err) {
      playErrorSound();
      push(
        err instanceof Error ? err.message : "Checkout failed",
        "error"
      );
    } finally {
      setProcessing(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "\n        min-h-[calc(100vh-70px)]\n        bg-[#f4f7f5]\n        px-4 py-4\n        lg:px-5\n        xl:px-6\n      ",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-[1600px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "\n            relative mb-4 overflow-hidden rounded-[24px]\n            bg-gradient-to-r from-[#064e3b]\n            via-[#08784f]\n            to-[#0a9665]\n            px-5 py-4\n            text-white\n            shadow-[0_15px_40px_rgba(6,78,59,0.18)]\n          ",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-white/10 blur-2xl" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute -bottom-20 right-40 h-40 w-40 rounded-full bg-emerald-300/10 blur-3xl" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-center justify-between gap-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      {
                        className: "\n                  flex h-11 w-11 items-center justify-center\n                  rounded-2xl border border-white/15\n                  bg-white/10\n                  shadow-inner\n                  backdrop-blur\n                ",
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(CartIcon, { size: 22 })
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-black tracking-tight", children: "Point of Sale" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "span",
                          {
                            className: "\n                      rounded-full border border-emerald-200/20\n                      bg-emerald-300/10\n                      px-2 py-0.5\n                      text-[9px] font-bold uppercase\n                      tracking-wider text-emerald-100\n                    ",
                            children: "Live"
                          }
                        )
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 text-[11px] text-emerald-100/75", children: "Fast checkout · Barcode & SKU scanning" })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-[10px] font-semibold text-emerald-50 backdrop-blur sm:flex", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" }),
                    "Ready for sale"
                  ] })
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.7fr)_390px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 space-y-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "section",
                {
                  className: "\n                relative overflow-hidden rounded-[22px]\n                border border-slate-200/80\n                bg-white\n                p-4\n                shadow-sm\n                transition-all duration-300\n                hover:shadow-md\n              ",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-emerald-50 blur-3xl" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center justify-between", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ScanIcon, {}) }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-bold text-slate-900", children: "Add product" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-slate-400", children: "Scan barcode or enter SKU" })
                          ] })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden rounded-lg bg-slate-50 px-2.5 py-1.5 text-[9px] font-semibold text-slate-400 sm:block", children: "Press Enter ↵" })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "form",
                        {
                          onSubmit: handleScan,
                          className: "flex gap-2",
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative min-w-0 flex-1", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ScanIcon, { size: 18 }) }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx(
                                Input,
                                {
                                  ref: inputRef,
                                  autoFocus: true,
                                  placeholder: "Scan barcode or enter SKU…",
                                  value: code,
                                  onChange: (e) => setCode(
                                    e.target.value
                                  ),
                                  className: "\n                        h-12 w-full\n                        rounded-xl\n                        border-slate-200\n                        pl-10\n                        text-sm\n                        font-medium\n                        shadow-sm\n                        transition-all\n                        focus:border-emerald-500\n                        focus:ring-4\n                        focus:ring-emerald-500/10\n                      "
                                }
                              )
                            ] }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              Button,
                              {
                                type: "submit",
                                className: "\n                      h-12\n                      min-w-[86px]\n                      rounded-xl\n                      bg-emerald-600\n                      px-5\n                      font-bold\n                      shadow-[0_8px_20px_rgba(5,150,105,0.18)]\n                      transition-all\n                      hover:-translate-y-0.5\n                      hover:bg-emerald-700\n                      hover:shadow-lg\n                    ",
                                children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center justify-center gap-2", children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(PlusIcon$1, {}),
                                  "Add"
                                ] })
                              }
                            )
                          ]
                        }
                      )
                    ] })
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "section",
                {
                  className: "\n                overflow-hidden rounded-[22px]\n                border border-slate-200/80\n                bg-white\n                shadow-sm\n              ",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "div",
                      {
                        className: "\n                  flex items-center justify-between\n                  border-b border-slate-100\n                  bg-gradient-to-r from-slate-50\n                  to-white\n                  px-4 py-3\n                ",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CartIcon, { size: 18 }) }),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-bold text-slate-900", children: "Current cart" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-slate-400", children: [
                                cart.length,
                                " ",
                                cart.length === 1 ? "product" : "products",
                                " ",
                                "added"
                              ] })
                            ] })
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-700", children: [
                            cart.reduce(
                              (sum, l2) => sum + l2.quantity,
                              0
                            ),
                            " ",
                            "items"
                          ] })
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden md:block", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "min-w-full text-sm", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-slate-100 bg-slate-50/70", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400", children: "Product" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400", children: "SKU" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400", children: "Qty" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400", children: "Unit price" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400", children: "Discount" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400", children: "Subtotal" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "w-12" })
                      ] }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { className: "divide-y divide-slate-100", children: [
                        cart.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "td",
                          {
                            colSpan: 7,
                            className: "px-4 py-14 text-center",
                            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-xs flex-col items-center", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-300", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CartIcon, { size: 25 }) }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-bold text-slate-500", children: "Your cart is empty" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-[11px] text-slate-400", children: "Scan a barcode or enter a SKU above to add a product." })
                            ] })
                          }
                        ) }),
                        cart.map((l2) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "tr",
                          {
                            className: "\n                            group\n                            transition-colors\n                            hover:bg-emerald-50/30\n                          ",
                            children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-xs font-black text-emerald-700", children: l2.product.name.charAt(0).toUpperCase() }),
                                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-xs font-bold text-slate-800", children: l2.product.name }),
                                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-0.5 text-[10px] text-slate-400", children: [
                                    "Stock: ",
                                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-emerald-600", children: [
                                      Number(l2.product.currentStock),
                                      " ",
                                      l2.product.unit?.abbreviation || "units"
                                    ] })
                                  ] })
                                ] })
                              ] }) }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-lg bg-slate-50 px-2 py-1 text-[10px] font-medium text-slate-500", children: l2.product.sku }) }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex w-fit items-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm", children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx(
                                  "button",
                                  {
                                    type: "button",
                                    className: "flex h-8 w-8 items-center justify-center text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700",
                                    onClick: () => updateLine(
                                      l2.product.id,
                                      {
                                        quantity: Math.max(
                                          1,
                                          l2.quantity - 1
                                        )
                                      }
                                    ),
                                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(MinusIcon, {})
                                  }
                                ),
                                /* @__PURE__ */ jsxRuntimeExports.jsx(
                                  "input",
                                  {
                                    type: "number",
                                    min: 1,
                                    className: "h-8 w-12 border-x border-slate-200 bg-transparent text-center text-xs font-bold text-slate-800 outline-none",
                                    value: l2.quantity,
                                    onChange: (e) => updateLine(
                                      l2.product.id,
                                      {
                                        quantity: Number(
                                          e.target.value
                                        )
                                      }
                                    )
                                  }
                                ),
                                /* @__PURE__ */ jsxRuntimeExports.jsx(
                                  "button",
                                  {
                                    type: "button",
                                    className: "flex h-8 w-8 items-center justify-center text-slate-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600",
                                    onClick: () => updateLine(
                                      l2.product.id,
                                      {
                                        quantity: l2.quantity + 1
                                      }
                                    ),
                                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(PlusIcon$1, {})
                                  }
                                )
                              ] }) }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                                "input",
                                {
                                  type: "number",
                                  min: 0,
                                  className: "\n                                w-24 rounded-lg\n                                border border-slate-200\n                                bg-slate-50/50\n                                px-2 py-2\n                                text-right text-xs font-semibold\n                                outline-none\n                                transition-all\n                                focus:border-emerald-400\n                                focus:bg-white\n                                focus:ring-2\n                                focus:ring-emerald-500/10\n                              ",
                                  value: l2.unitPrice,
                                  onChange: (e) => updateLine(
                                    l2.product.id,
                                    {
                                      unitPrice: Number(
                                        e.target.value
                                      )
                                    }
                                  )
                                }
                              ) }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                                "input",
                                {
                                  type: "number",
                                  min: 0,
                                  className: "\n                                w-20 rounded-lg\n                                border border-slate-200\n                                bg-slate-50/50\n                                px-2 py-2\n                                text-right text-xs font-semibold\n                                outline-none\n                                transition-all\n                                focus:border-emerald-400\n                                focus:bg-white\n                                focus:ring-2\n                                focus:ring-emerald-500/10\n                              ",
                                  value: l2.discount,
                                  onChange: (e) => updateLine(
                                    l2.product.id,
                                    {
                                      discount: Number(
                                        e.target.value
                                      )
                                    }
                                  )
                                }
                              ) }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-black text-slate-900", children: formatBDT(
                                l2.quantity * l2.unitPrice - l2.discount
                              ) }) }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                                "button",
                                {
                                  type: "button",
                                  className: "\n                                flex h-8 w-8 items-center\n                                justify-center rounded-lg\n                                text-slate-300\n                                transition-all\n                                hover:bg-red-50\n                                hover:text-red-500\n                              ",
                                  onClick: () => removeLine(
                                    l2.product.id
                                  ),
                                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(TrashIcon, {})
                                }
                              ) })
                            ]
                          },
                          l2.product.id
                        ))
                      ] })
                    ] }) }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "divide-y divide-slate-100 md:hidden", children: [
                      cart.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-12 text-center", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-300", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CartIcon, { size: 25 }) }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-bold text-slate-500", children: "Cart is empty" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-[11px] text-slate-400", children: "Scan a product to begin." })
                      ] }),
                      cart.map((l2) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "div",
                        {
                          className: "p-4",
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 items-center gap-3", children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 font-black text-emerald-700", children: l2.product.name.charAt(0).toUpperCase() }),
                                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-xs font-bold text-slate-800", children: l2.product.name }),
                                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-0.5 text-[10px] text-slate-400", children: [
                                    "Stock: ",
                                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-emerald-600", children: [
                                      Number(l2.product.currentStock),
                                      " ",
                                      l2.product.unit?.abbreviation || "units"
                                    ] })
                                  ] })
                                ] })
                              ] }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx(
                                "button",
                                {
                                  type: "button",
                                  className: "text-slate-300 hover:text-red-500",
                                  onClick: () => removeLine(
                                    l2.product.id
                                  ),
                                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(TrashIcon, {})
                                }
                              )
                            ] }),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 grid grid-cols-3 gap-2", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-1 text-[9px] font-semibold uppercase text-slate-400", children: "Qty" }),
                                /* @__PURE__ */ jsxRuntimeExports.jsx(
                                  "input",
                                  {
                                    type: "number",
                                    min: 1,
                                    className: "w-full rounded-lg border border-slate-200 px-2 py-2 text-xs font-semibold",
                                    value: l2.quantity,
                                    onChange: (e) => updateLine(
                                      l2.product.id,
                                      {
                                        quantity: Number(
                                          e.target.value
                                        )
                                      }
                                    )
                                  }
                                )
                              ] }),
                              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-1 text-[9px] font-semibold uppercase text-slate-400", children: "Price" }),
                                /* @__PURE__ */ jsxRuntimeExports.jsx(
                                  "input",
                                  {
                                    type: "number",
                                    min: 0,
                                    className: "w-full rounded-lg border border-slate-200 px-2 py-2 text-xs font-semibold",
                                    value: l2.unitPrice,
                                    onChange: (e) => updateLine(
                                      l2.product.id,
                                      {
                                        unitPrice: Number(
                                          e.target.value
                                        )
                                      }
                                    )
                                  }
                                )
                              ] }),
                              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-1 text-[9px] font-semibold uppercase text-slate-400", children: "Discount" }),
                                /* @__PURE__ */ jsxRuntimeExports.jsx(
                                  "input",
                                  {
                                    type: "number",
                                    min: 0,
                                    className: "w-full rounded-lg border border-slate-200 px-2 py-2 text-xs font-semibold",
                                    value: l2.discount,
                                    onChange: (e) => updateLine(
                                      l2.product.id,
                                      {
                                        discount: Number(
                                          e.target.value
                                        )
                                      }
                                    )
                                  }
                                )
                              ] })
                            ] }),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-slate-400", children: "Line total" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-black text-emerald-700", children: formatBDT(
                                l2.quantity * l2.unitPrice - l2.discount
                              ) })
                            ] })
                          ]
                        },
                        l2.product.id
                      ))
                    ] })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("aside", { className: "min-w-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "section",
              {
                className: "\n                overflow-hidden rounded-[24px]\n                border border-slate-200/80\n                bg-white\n                shadow-[0_10px_30px_rgba(15,23,42,0.06)]\n                xl:sticky xl:top-4\n              ",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "div",
                    {
                      className: "\n                  relative overflow-hidden\n                  bg-gradient-to-br\n                  from-[#064e3b]\n                  to-[#087c54]\n                  px-5 py-4\n                  text-white\n                ",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/10 blur-xl" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-center justify-between", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-100", children: "Checkout" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-1 text-lg font-black", children: "Complete sale" })
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ReceiptIcon$2, {}) })
                        ] })
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 p-4", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        SectionHeader,
                        {
                          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(UserIcon$1, {}),
                          title: "Customer",
                          subtitle: "Customer information"
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Customer", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          Select,
                          {
                            value: customerId,
                            onChange: (e) => selectCustomer(
                              e.target.value
                            ),
                            className: "h-10 rounded-xl text-xs",
                            children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Walk-in customer" }),
                              customers.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                                "option",
                                {
                                  value: c.id,
                                  children: c.name
                                },
                                c.id
                              ))
                            ]
                          }
                        ) }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Customer name *", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400", children: /* @__PURE__ */ jsxRuntimeExports.jsx(UserIcon$1, { size: 15 }) }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              Input,
                              {
                                required: true,
                                value: customerName,
                                onChange: (e) => setCustomerName(
                                  e.target.value
                                ),
                                className: "h-10 rounded-xl pl-9 text-xs"
                              }
                            )
                          ] }) }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Mobile number *", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PhoneIcon, { size: 15 }) }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              Input,
                              {
                                required: true,
                                value: mobileNumber,
                                onChange: (e) => setMobileNumber(
                                  e.target.value
                                ),
                                className: "h-10 rounded-xl pl-9 text-xs"
                              }
                            )
                          ] }) })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Membership number", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                          Input,
                          {
                            value: membershipNumber,
                            onChange: (e) => setMembershipNumber(
                              e.target.value
                            ),
                            className: "h-10 rounded-xl text-xs"
                          }
                        ) })
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-slate-100 pt-4", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        SectionHeader,
                        {
                          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TagIcon, {}),
                          title: "Order details",
                          subtitle: "WooCommerce reference"
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Online order number *", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Input,
                        {
                          required: true,
                          placeholder: "WooCommerce order reference",
                          value: onlineOrderNumber,
                          onChange: (e) => setOnlineOrderNumber(
                            withOrderHash(
                              e.target.value
                            )
                          ),
                          className: "h-10 rounded-xl text-xs"
                        }
                      ) })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-slate-100 pt-4", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        SectionHeader,
                        {
                          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCardIcon, {}),
                          title: "Payment",
                          subtitle: "Select payment method"
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Payment method", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        Select,
                        {
                          value: paymentMethod,
                          onChange: (e) => setPaymentMethod(
                            e.target.value
                          ),
                          className: "h-10 rounded-xl text-xs",
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "CASH", children: "Cash" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "BKASH", children: "bKash" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "COD", children: "Cash on Delivery" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "CREDIT", children: "Credit / Due" })
                          ]
                        }
                      ) })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-slate-100 pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-600", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TagIcon, { size: 15 }) }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold text-slate-800", children: "Overall discount" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[9px] text-slate-400", children: "Applied to the full sale" })
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Input,
                        {
                          type: "number",
                          min: 0,
                          value: overallDiscount,
                          onChange: (e) => setOverallDiscount(
                            e.target.value
                          ),
                          className: "h-9 w-24 rounded-lg text-right text-xs font-semibold"
                        }
                      )
                    ] }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      {
                        className: "\n                    rounded-2xl\n                    border border-emerald-100\n                    bg-gradient-to-br\n                    from-emerald-50\n                    to-white\n                    p-4\n                  ",
                        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            SummaryRow,
                            {
                              label: "Subtotal",
                              value: formatBDT(
                                subtotal
                              )
                            }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            SummaryRow,
                            {
                              label: "Overall discount",
                              value: `- ${formatBDT(
                                Number(
                                  overallDiscount || 0
                                )
                              )}`
                            }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "my-2 border-t border-emerald-100" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            SummaryRow,
                            {
                              label: "Total",
                              value: formatBDT(total),
                              emphasis: true
                            }
                          )
                        ] })
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "button",
                      {
                        type: "button",
                        disabled: cart.length === 0 || processing,
                        onClick: handleCheckout,
                        className: "\n                    group relative w-full\n                    overflow-hidden\n                    rounded-2xl\n                    bg-gradient-to-r\n                    from-[#059669]\n                    to-[#087c54]\n                    px-5 py-4\n                    text-white\n                    shadow-[0_12px_28px_rgba(5,150,105,0.22)]\n                    transition-all duration-300\n                    hover:-translate-y-0.5\n                    hover:shadow-[0_18px_35px_rgba(5,150,105,0.28)]\n                    disabled:cursor-not-allowed\n                    disabled:opacity-50\n                    disabled:hover:translate-y-0\n                  ",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/10 blur-xl transition-transform duration-500 group-hover:scale-125" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-center justify-between", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-left", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[9px] font-semibold uppercase tracking-wider text-emerald-100", children: processing ? "Please wait" : "Ready to process" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 text-base font-black", children: processing ? "Processing…" : "Complete Sale" })
                            ] }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl bg-white/10", children: processing ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRightIcon, {}) })
                          ] })
                        ]
                      }
                    ),
                    cart.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2 text-center text-[10px] text-slate-400", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SparkleIcon, { size: 13 }),
                      "Scan a product to start the sale"
                    ] })
                  ] })
                ]
              }
            ) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 hidden items-center justify-between px-1 text-[9px] text-slate-400 lg:flex", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-emerald-500" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold tracking-[0.14em]", children: "TORKI BAZAR POS" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Scan → Add → Checkout → Complete Sale" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              cart.length,
              " cart line",
              cart.length === 1 ? "" : "s"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
          @keyframes posFadeIn {
            from {
              opacity: 0;
              transform: translateY(8px);
            }

            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .pos-animate {
            animation: posFadeIn .35s ease-out;
          }
        ` })
      ]
    }
  );
}
const DASH$3 = "—";
function SearchIcon$1() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "17", height: "17", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "11", cy: "11", r: "7" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "m21 21-4.3-4.3" })
  ] });
}
function UserIcon() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "8", r: "4" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M4 21c0-4 3.6-7 8-7s8 3 8 7" })
  ] });
}
function CardIcon() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "2.5", y: "5", width: "19", height: "14", rx: "2.5" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M2.5 10h19" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M6 15h4" })
  ] });
}
function ReceiptIcon$1() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M6 2.5h12v19l-3-2-3 2-3-2-3 2v-19Z" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M8.5 8h7" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M8.5 12h7" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M8.5 16h4" })
  ] });
}
function PrinterIcon$1() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M6 9V3h12v6" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "4", y: "9", width: "16", height: "8", rx: "2" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M6 17v4h12v-4" })
  ] });
}
function CashIcon() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.2", strokeLinecap: "round", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "12", r: "9" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 7v10" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M15 9.5c0-1.4-1.3-2.5-3-2.5s-3 1.1-3 2.5 1.3 2 3 2 3 .6 3 2-1.3 2.5-3 2.5-3-1.1-3-2.5" })
  ] });
}
function ArrowIcon$1() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "13", height: "13", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M5 12h14" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "m13 6 6 6-6 6" })
  ] });
}
function PaymentBadge({ method }) {
  const styles = {
    COD: "bg-amber-100 text-amber-800 ring-amber-200",
    CASH: "bg-emerald-100 text-emerald-800 ring-emerald-200",
    CREDIT: "bg-violet-100 text-violet-800 ring-violet-200"
  };
  const cls = styles[method] ?? "bg-slate-100 text-slate-700 ring-slate-200";
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ring-1 ring-inset ${cls}`, children: method });
}
function StatusBadge({ status }) {
  const normalized = status.toUpperCase();
  const isGood = normalized === "PAID" || normalized === "COMPLETED";
  const isPending = normalized.includes("PENDING") || normalized === "DUE";
  const cls = isGood ? "bg-emerald-100 text-emerald-800 ring-emerald-200" : isPending ? "bg-rose-100 text-rose-800 ring-rose-200" : "bg-slate-100 text-slate-700 ring-slate-200";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ring-1 ring-inset ${cls}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `h-1.5 w-1.5 rounded-full ${isGood ? "bg-emerald-500" : isPending ? "bg-rose-500 animate-pulse" : "bg-slate-400"}` }),
    status
  ] });
}
function SalesPage() {
  const [sales, setSales] = reactExports.useState([]);
  const [lookupId, setLookupId] = reactExports.useState("");
  const [found, setFound] = reactExports.useState(null);
  const push = useToastStore((s) => s.push);
  async function load() {
    try {
      const data = await call("sales:list");
      setSales(data);
    } catch (err) {
      push(
        err instanceof Error ? err.message : "Failed to load sales",
        "error"
      );
    }
  }
  reactExports.useEffect(() => {
    load();
  }, []);
  async function showDetails(idOrNumber) {
    const value = idOrNumber.trim();
    if (!value) {
      push(
        "Please enter a sale number, mobile number, or order number.",
        "error"
      );
      return;
    }
    try {
      const sale = await call("sales:get", {
        id: value
      });
      setLookupId(sale.saleNumber);
      setFound(sale);
    } catch (err) {
      setFound(null);
      push(
        err instanceof Error ? err.message : "Sale not found",
        "error"
      );
    }
  }
  async function handleLookup(e) {
    e.preventDefault();
    await showDetails(lookupId);
  }
  async function handleCollect(saleId) {
    try {
      await call("sales:markCodCollected", {
        id: saleId
      });
      push(
        "Cash collected — payment marked as PAID.",
        "success"
      );
      await load();
      const updatedSale = await call("sales:get", {
        id: saleId
      });
      setFound(updatedSale);
    } catch (err) {
      push(
        err instanceof Error ? err.message : "Failed to mark COD collected",
        "error"
      );
    }
  }
  async function handleCollectCreditPayment(saleId) {
    try {
      await call("sales:collectCreditPayment", {
        id: saleId
      });
      push(
        "Credit payment collected — payment marked as PAID.",
        "success"
      );
      await load();
      const updatedSale = await call("sales:get", {
        id: saleId
      });
      setFound(updatedSale);
    } catch (err) {
      push(
        err instanceof Error ? err.message : "Failed to collect credit payment",
        "error"
      );
    }
  }
  function handlePrint() {
    window.print();
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sales-root space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "print:hidden reveal", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700", children: "Retail Ledger" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-1 text-2xl font-black tracking-tight text-slate-900", children: "Sales" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1.5 max-w-2xl text-sm text-slate-500", children: "Search by sale number, customer mobile number, or WooCommerce order reference to view, print, or collect outstanding payments." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "print:hidden reveal", style: { animationDelay: "60ms" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "search-card relative overflow-hidden !border-emerald-100/70 !bg-white/90 !p-5 shadow-[0_10px_30px_-12px_rgba(6,78,59,0.18)] backdrop-blur-xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full bg-emerald-100/50 blur-3xl" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "form",
        {
          onSubmit: handleLookup,
          className: "relative flex flex-col gap-2.5 sm:flex-row",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SearchIcon$1, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  className: "w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-3.5 text-sm shadow-sm outline-none transition-all duration-300 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100",
                  placeholder: "Sale number, mobile number, or WooCommerce order (e.g. #12345)",
                  value: lookupId,
                  onChange: (e) => setLookupId(e.target.value)
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "!rounded-2xl !px-6 !shadow-md transition-transform duration-300 hover:!-translate-y-0.5 active:!translate-y-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SearchIcon$1, {}),
              "Find"
            ] }) })
          ]
        }
      )
    ] }) }),
    found && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "print:hidden animate-[fadeIn_.45s_cubic-bezier(0.16,1,0.3,1)]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "preview-card mx-auto w-full max-w-3xl overflow-hidden !p-0 shadow-[0_25px_60px_-20px_rgba(4,82,59,0.35)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "preview-header relative overflow-hidden px-6 py-6 text-white sm:px-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute -right-14 -top-16 h-52 w-52 rounded-full bg-white/10 blur-3xl" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute -bottom-20 left-10 h-40 w-40 rounded-full bg-amber-300/10 blur-3xl" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl bg-white/95 p-2 shadow-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: logo,
                alt: "Torki Bazar Logo",
                className: "h-12 w-12 object-contain"
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-black tracking-tight", children: "Torki Bazar" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-emerald-200", children: "Fast Delivery · Online Grocery Shop" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:text-right", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-black uppercase tracking-[0.2em] text-emerald-200", children: "Sale" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 font-mono text-lg font-black", children: found.saleNumber }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-emerald-100/80", children: formatDateTime(found.saleDate) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 px-6 py-6 sm:grid-cols-3 sm:px-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "info-tile group rounded-2xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-8 w-8 items-center justify-center rounded-xl bg-sky-100 text-sky-700 transition-transform duration-300 group-hover:scale-110", children: /* @__PURE__ */ jsxRuntimeExports.jsx(UserIcon, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-black uppercase tracking-[0.14em] text-slate-400", children: "Customer" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 font-bold text-slate-900", children: found.customer?.name ?? "Walk-in Customer" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 text-sm text-slate-500", children: found.customer?.phone || DASH$3 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "info-tile group rounded-2xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-8 w-8 items-center justify-center rounded-xl bg-violet-100 text-violet-700 transition-transform duration-300 group-hover:scale-110", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardIcon, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-black uppercase tracking-[0.14em] text-slate-400", children: "Payment" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PaymentBadge, { method: found.paymentMethod }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: found.paymentStatus }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "total-tile relative overflow-hidden rounded-2xl border border-emerald-200/70 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-emerald-300/20 blur-2xl" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "relative text-[10px] font-black uppercase tracking-[0.14em] text-emerald-700", children: "Total" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "relative mt-2 text-2xl font-black tabular-nums text-emerald-800", children: formatBDT(found.totalAmount) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "relative mt-0.5 text-sm text-emerald-700/70", children: [
            found.items?.length ?? 0,
            " item",
            (found.items?.length ?? 0) === 1 ? "" : "s"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-slate-100 px-6 py-5 sm:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-slate-400", children: "WooCommerce Order" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 font-mono text-sm font-bold text-slate-800", children: found.onlineOrderNumber || DASH$3 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:text-right", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-slate-400", children: "Sale Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1.5 sm:flex sm:justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: found.status }) })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4 sm:px-8", children: [
        found.paymentMethod === "COD" && found.paymentStatus === "COD_PENDING" && /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: () => handleCollect(found.id),
            className: "!rounded-xl transition-transform duration-300 hover:!-translate-y-0.5",
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CashIcon, {}),
              "Mark Cash Collected"
            ] })
          }
        ),
        found.paymentMethod === "CREDIT" && found.paymentStatus === "DUE" && /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: () => handleCollectCreditPayment(found.id),
            className: "!rounded-xl transition-transform duration-300 hover:!-translate-y-0.5",
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CashIcon, {}),
              "Collect Credit Payment"
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "secondary",
            onClick: handlePrint,
            className: "!rounded-xl transition-transform duration-300 hover:!-translate-y-0.5",
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(PrinterIcon$1, {}),
              "Print Receipt"
            ] })
          }
        )
      ] })
    ] }) }),
    found && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        id: "sale-print-area",
        className: "hidden print:block",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto w-full max-w-[190mm] bg-white text-slate-900", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-b-2 border-slate-800 pb-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "img",
                {
                  src: logo,
                  alt: "Torki Bazar Logo",
                  className: "h-20 w-20 object-contain"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold tracking-tight", children: "Torki Bazar" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 text-sm font-medium", children: "Fast Delivery · Online Grocery Shop" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 text-[11px] leading-5 text-slate-600", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Torki Bandar, Gournadi, Barishal" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "E-mail: contact@torkibazar.com" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Website: torkibazar.com" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500", children: "Sales Receipt" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-lg font-bold", children: found.saleNumber }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-slate-600", children: formatDateTime(found.saleDate) })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-8 border-b border-slate-300 py-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500", children: "Customer" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm font-semibold", children: found.customer?.name ?? "Walk-in Customer" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-slate-600", children: [
                "Mobile: ",
                found.customer?.phone || DASH$3
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-slate-600", children: [
                "WooCommerce Order:",
                " ",
                found.onlineOrderNumber || DASH$3
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500", children: "Payment" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm font-semibold uppercase", children: found.paymentMethod }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-slate-600", children: [
                "Status: ",
                found.paymentStatus
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-slate-600", children: [
                "Sale: ",
                found.status
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full border-collapse text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-y border-slate-300 bg-slate-50", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-3 text-left font-bold uppercase", children: "Item" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-2 py-3 text-left font-bold uppercase", children: "SKU" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-2 py-3 text-center font-bold uppercase", children: "Qty" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-2 py-3 text-right font-bold uppercase", children: "Unit Price" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-2 py-3 text-right font-bold uppercase", children: "Discount" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-3 text-right font-bold uppercase", children: "Subtotal" })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: found.items && found.items.length > 0 ? found.items.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-slate-200", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3 font-medium", children: item.product.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-3 text-slate-600", children: item.product.sku || DASH$3 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-3 text-center", children: Number(item.quantity) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-3 text-right", children: formatBDT(item.unitPrice) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-3 text-right", children: formatBDT(item.discount) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3 text-right font-semibold", children: formatBDT(item.subtotal) })
              ] }, item.id)) : /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 6, className: "px-3 py-6 text-center text-slate-500", children: "No item details available." }) }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-80", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 border-b border-slate-300 pb-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-600", children: "Subtotal" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: found.subtotal ? formatBDT(found.subtotal) : DASH$3 })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-600", children: "Discount" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: found.discount ? formatBDT(found.discount) : DASH$3 })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between pt-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg font-bold", children: "Total" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl font-bold", children: formatBDT(found.totalAmount) })
              ] })
            ] }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 border-t-2 border-slate-800 pt-6 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-base font-bold", children: "Thank you for shopping with Torki Bazar!" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs leading-5 text-slate-600", children: "We appreciate your business and look forward to serving you again." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-3 text-[11px] leading-5 text-slate-500", children: [
              "Torki Bandar, Gournadi, Barishal",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "contact@torkibazar.com · torkibazar.com"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-5 text-[9px] font-medium uppercase tracking-[0.2em] text-slate-400", children: "Computer Generated Sales Receipt" })
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "print:hidden reveal", style: { animationDelay: "120ms" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "!overflow-hidden !p-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-5 py-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ReceiptIcon$1, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700", children: "Ledger" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-black text-slate-900", children: "Recent Sales" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800", children: [
          sales.length,
          " record",
          sales.length === 1 ? "" : "s"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sales-table px-1 py-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        DataTable,
        {
          rows: sales,
          keyFor: (s) => s.id,
          emptyMessage: "Complete a sale from the POS page to see it listed here.",
          columns: [
            {
              header: "Sale #",
              accessor: (s) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs font-bold text-slate-700", children: s.saleNumber })
            },
            {
              header: "Date",
              accessor: (s) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-500", children: formatDateTime(s.saleDate) })
            },
            {
              header: "Customer",
              accessor: (s) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-slate-800", children: s.customer?.name ?? "Walk-in" })
            },
            {
              header: "Mobile",
              accessor: (s) => s.customer?.phone || DASH$3
            },
            {
              header: "Total",
              accessor: (s) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold tabular-nums text-slate-900", children: formatBDT(s.totalAmount) })
            },
            {
              header: "Payment",
              accessor: (s) => /* @__PURE__ */ jsxRuntimeExports.jsx(PaymentBadge, { method: s.paymentMethod })
            },
            {
              header: "Status",
              accessor: (s) => /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: s.paymentStatus })
            },
            {
              header: "",
              accessor: (s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "button",
                  className: "group inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-bold text-emerald-700 transition-all duration-300 hover:gap-1.5 hover:bg-emerald-50",
                  onClick: () => showDetails(s.id),
                  children: [
                    "View",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "transition-transform duration-300 group-hover:translate-x-0.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowIcon$1, {}) })
                  ]
                }
              )
            }
          ]
        }
      ) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
        .preview-header {
          background: linear-gradient(120deg, #032a1d 0%, #054e38 45%, #07704f 100%);
        }
        .total-tile {
          background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
        }
        .reveal {
          animation: slideUp 0.55s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .reveal, .animate-pulse { animation: none !important; }
        }
      ` }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
        @media print {

          @page {
            size: A4;
            margin: 12mm;
          }

          html,
          body {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          body * {
            visibility: hidden;
          }

          #sale-print-area,
          #sale-print-area * {
            visibility: visible;
          }

          #sale-print-area {
            display: block !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          #sale-print-area table {
            page-break-inside: auto;
          }

          #sale-print-area tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }

          #sale-print-area .print-no-break {
            page-break-inside: avoid;
          }

        }
      ` })
  ] });
}
function ReturnsPage() {
  const [saleId, setSaleId] = reactExports.useState("");
  const [sale, setSale] = reactExports.useState(null);
  const [selections, setSelections] = reactExports.useState({});
  const [reason, setReason] = reactExports.useState("");
  const [returnsList, setReturnsList] = reactExports.useState([]);
  const [dateFilter, setDateFilter] = reactExports.useState("all");
  const push = useToastStore((s) => s.push);
  async function fetchReturns() {
    try {
      let result = [];
      try {
        result = await call("returns:list", {});
      } catch {
        try {
          result = await call("return:list", {});
        } catch {
          result = await call("returns:search", {});
        }
      }
      setReturnsList(result ?? []);
    } catch (err) {
      console.error("Failed to fetch returns list:", err);
      push("Could not load return history. Please check backend route registration.", "error");
    }
  }
  reactExports.useEffect(() => {
    fetchReturns();
  }, []);
  async function handleLoad(e) {
    e.preventDefault();
    if (!saleId.trim()) return;
    try {
      const result = await call("sales:get", { id: saleId.trim() });
      setSale(result);
      setSelections({});
      push("Sale loaded successfully", "success");
    } catch (err) {
      push(err instanceof Error ? err.message : "Sale not found", "error");
    }
  }
  async function handleSubmit(e) {
    e.preventDefault();
    if (!sale) return;
    const items = Object.entries(selections).filter(([, v2]) => Number(v2.quantity) > 0).map(([saleItemId, v2]) => ({ saleItemId, quantity: Number(v2.quantity), condition: v2.condition }));
    if (items.length === 0) {
      push("Select at least one item and quantity to return.", "error");
      return;
    }
    try {
      await call("returns:create", { saleId: sale.id, items, reason });
      push("Return recorded and inventory updated.", "success");
      setSale(null);
      setSaleId("");
      setReason("");
      fetchReturns();
    } catch (err) {
      push(err instanceof Error ? err.message : "Failed to create return", "error");
    }
  }
  const filteredReturns = returnsList.filter((r2) => {
    const rDate = new Date(r2.returnDate);
    const now = /* @__PURE__ */ new Date();
    if (dateFilter === "today") {
      return rDate.toDateString() === now.toDateString();
    }
    if (dateFilter === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 864e5);
      return rDate >= weekAgo;
    }
    if (dateFilter === "month") {
      return rDate.getMonth() === now.getMonth() && rDate.getFullYear() === now.getFullYear();
    }
    return true;
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-semibold text-slate-900", children: "Returns Management" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-500", children: "Process returns and view complete return history." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleLoad, className: "flex gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          placeholder: "Sale ID or Number (e.g. TB-SALE-2026-000005)",
          value: saleId,
          onChange: (e) => setSaleId(e.target.value)
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", children: "Load Sale" })
    ] }) }),
    sale && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "mb-3 font-semibold text-slate-800", children: [
        "Sale ",
        sale.saleNumber
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: sale.items.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-4 items-end gap-3 rounded-lg border border-slate-100 p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: item.product.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-slate-400", children: [
              "Sold qty: ",
              item.quantity
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Return qty", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "number",
              min: 0,
              value: selections[item.id]?.quantity ?? "",
              onChange: (e) => setSelections((s) => ({
                ...s,
                [item.id]: { condition: s[item.id]?.condition ?? "RESELLABLE", quantity: e.target.value }
              }))
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Condition", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: selections[item.id]?.condition ?? "RESELLABLE",
              onChange: (e) => setSelections((s) => ({
                ...s,
                [item.id]: { quantity: s[item.id]?.quantity ?? "0", condition: e.target.value }
              })),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "RESELLABLE", children: "Resellable" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "DAMAGED", children: "Damaged" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "EXPIRED", children: "Expired" })
              ]
            }
          ) })
        ] }, item.id)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Reason", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: reason, onChange: (e) => setReason(e.target.value), placeholder: "Reason for return..." }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "w-full", children: "Process Return & Refund" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold text-slate-800", children: "Return History" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2", children: ["today", "week", "month", "all"].map((tab) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => setDateFilter(tab),
            className: `rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${dateFilter === tab ? "bg-emerald-600 text-white shadow" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`,
            children: tab === "week" ? "Last 7 Days" : tab
          },
          tab
        )) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-left text-sm text-slate-600", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "border-b bg-slate-50 text-xs uppercase text-slate-700", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3", children: "Return #" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3", children: "Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3", children: "Sale #" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3", children: "Customer" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3", children: "Items Returned" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3", children: "Refund Amount" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3", children: "Reason" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filteredReturns.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 7, className: "p-4 text-center text-slate-400", children: "No return history found for this period." }) }) : filteredReturns.map((ret) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b hover:bg-slate-50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-3 font-medium text-slate-900", children: ret.returnNumber }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-3", children: new Date(ret.returnDate).toLocaleString() }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-3 font-medium text-slate-800", children: ret.sale?.saleNumber }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-3", children: ret.sale?.customer?.name || "Walk-in" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-3", children: ret.items?.map((i, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs", children: [
            "• ",
            i.product?.name,
            " (Qty: ",
            i.quantity,
            ")"
          ] }, idx)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "p-3 font-semibold text-rose-600", children: [
            "৳",
            Number(ret.totalRefund).toFixed(2)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-3 text-slate-500", children: ret.reason || "N/A" })
        ] }, ret.id)) })
      ] }) })
    ] })
  ] });
}
function EmployeesPage() {
  const [employees, setEmployees] = reactExports.useState([]);
  const [modalOpen, setModalOpen] = reactExports.useState(false);
  const [salaryModalFor, setSalaryModalFor] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({ name: "", phone: "", position: "", baseSalary: "0", address: "" });
  const [salaryForm, setSalaryForm] = reactExports.useState({ salaryMonth: (/* @__PURE__ */ new Date()).toISOString().slice(0, 7), bonus: "0", deduction: "0", paymentMethod: "CASH" });
  const push = useToastStore((s) => s.push);
  async function load() {
    setEmployees(await call("employees:list"));
  }
  reactExports.useEffect(() => {
    load();
  }, []);
  async function handleCreate(e) {
    e.preventDefault();
    try {
      await call("employees:create", { ...form, baseSalary: Number(form.baseSalary) });
      push("Employee added.", "success");
      setModalOpen(false);
      load();
    } catch (err) {
      push(err instanceof Error ? err.message : "Failed to add employee", "error");
    }
  }
  async function handlePaySalary(e) {
    e.preventDefault();
    if (!salaryModalFor) return;
    try {
      await call("salaries:pay", {
        employeeId: salaryModalFor.id,
        salaryMonth: salaryForm.salaryMonth,
        bonus: Number(salaryForm.bonus),
        deduction: Number(salaryForm.deduction),
        paymentMethod: salaryForm.paymentMethod
      });
      push("Salary paid and recorded as an expense.", "success");
      setSalaryModalFor(null);
    } catch (err) {
      push(err instanceof Error ? err.message : "Failed to pay salary", "error");
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-semibold text-slate-900", children: "Employees" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-500", children: "Manage staff and monthly salary payments." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setModalOpen(true), children: "+ New Employee" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      DataTable,
      {
        rows: employees,
        keyFor: (e) => e.id,
        emptyMessage: "No employees yet.",
        columns: [
          { header: "Name", accessor: (e) => e.name },
          { header: "Position", accessor: (e) => e.position },
          { header: "Phone", accessor: (e) => e.phone },
          { header: "Base Salary", accessor: (e) => formatBDT(e.baseSalary) },
          { header: "Status", accessor: (e) => e.status },
          {
            header: "",
            accessor: (e) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "text-sm text-brand-600 hover:underline", onClick: () => setSalaryModalFor(e), children: "Pay Salary" })
          }
        ]
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal, { open: modalOpen, title: "New Employee", onClose: () => setModalOpen(false), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleCreate, className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Name", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { required: true, value: form.name, onChange: (e) => setForm({ ...form, name: e.target.value }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Phone", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { required: true, value: form.phone, onChange: (e) => setForm({ ...form, phone: e.target.value }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Position", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { required: true, value: form.position, onChange: (e) => setForm({ ...form, position: e.target.value }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Base salary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, value: form.baseSalary, onChange: (e) => setForm({ ...form, baseSalary: e.target.value }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "w-full", children: "Save Employee" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal, { open: !!salaryModalFor, title: `Pay Salary — ${salaryModalFor?.name ?? ""}`, onClose: () => setSalaryModalFor(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handlePaySalary, className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Salary month", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "month", value: salaryForm.salaryMonth, onChange: (e) => setSalaryForm({ ...salaryForm, salaryMonth: e.target.value }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Bonus", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, value: salaryForm.bonus, onChange: (e) => setSalaryForm({ ...salaryForm, bonus: e.target.value }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Deduction", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, value: salaryForm.deduction, onChange: (e) => setSalaryForm({ ...salaryForm, deduction: e.target.value }) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Payment method", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: salaryForm.paymentMethod, onChange: (e) => setSalaryForm({ ...salaryForm, paymentMethod: e.target.value }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "CASH", children: "Cash" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "BKASH", children: "bKash" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "BANK", children: "Bank Transfer" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "w-full", children: "Confirm Payment" })
    ] }) })
  ] });
}
const DASH$2 = "—";
function SearchIcon() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "17", height: "17", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "11", cy: "11", r: "7" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "m21 21-4.3-4.3" })
  ] });
}
function PrinterIcon() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M6 9V3h12v6" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "4", y: "9", width: "16", height: "8", rx: "2" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M6 17v4h12v-4" })
  ] });
}
function ReceiptIcon() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M6 2.5h12v19l-3-2-3 2-3-2-3 2v-19Z" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M8.5 8h7" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M8.5 12h7" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M8.5 16h4" })
  ] });
}
function ArrowIcon() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "13", height: "13", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M5 12h14" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "m13 6 6 6-6 6" })
  ] });
}
function PlusIcon() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 5v14" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M5 12h14" })
  ] });
}
function ExpensesPage() {
  const [expenses, setExpenses] = reactExports.useState([]);
  const [categories, setCategories] = reactExports.useState([]);
  const [lookupNumber, setLookupNumber] = reactExports.useState("");
  const [found, setFound] = reactExports.useState(null);
  const [showAddModal, setShowAddModal] = reactExports.useState(false);
  const [categoryId, setCategoryId] = reactExports.useState("");
  const [amount, setAmount] = reactExports.useState("");
  const [description, setDescription] = reactExports.useState("");
  const [paymentMethod, setPaymentMethod] = reactExports.useState("CASH");
  const [reference, setReference] = reactExports.useState("");
  const push = useToastStore((s) => s.push);
  async function load() {
    try {
      const [expData, catData] = await Promise.all([
        call("expenses:list"),
        call("expenses:categories:list")
      ]);
      setExpenses(expData);
      setCategories(catData);
      if (catData.length > 0 && !categoryId) {
        setCategoryId(catData[0].id);
      }
    } catch (err) {
      push(err instanceof Error ? err.message : "Failed to load expenses", "error");
    }
  }
  reactExports.useEffect(() => {
    load();
  }, []);
  async function handleCreateExpense(e) {
    e.preventDefault();
    try {
      const numAmount = parseFloat(amount);
      if (!categoryId) throw new Error("Please select an expense category.");
      if (isNaN(numAmount) || numAmount <= 0) throw new Error("Please enter a valid amount.");
      if (!description.trim()) throw new Error("Please enter a description.");
      await call("expenses:create", {
        categoryId,
        amount: numAmount,
        description: description.trim(),
        paymentMethod,
        reference: reference.trim() || void 0
      });
      push("Expense recorded successfully — cash deducted from management.", "success");
      setShowAddModal(false);
      setAmount("");
      setDescription("");
      setReference("");
      await load();
    } catch (err) {
      push(err instanceof Error ? err.message : "Failed to record expense", "error");
    }
  }
  function handleLookup(e) {
    e.preventDefault();
    const value = lookupNumber.trim().toLowerCase();
    if (!value) {
      push("Please enter an expense number.", "error");
      return;
    }
    const match = expenses.find((exp) => exp.expenseNumber.toLowerCase().includes(value));
    if (match) {
      setFound(match);
      setLookupNumber(match.expenseNumber);
    } else {
      setFound(null);
      push("Expense not found", "error");
    }
  }
  function handlePrint() {
    window.print();
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "expenses-root space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "print:hidden flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between reveal", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700", children: "Financial Ledger" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-1 text-2xl font-black tracking-tight text-slate-900", children: "Expenses" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1.5 max-w-2xl text-sm text-slate-500", children: "Track operating expenses, view vouchers, and print official expense receipts." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setShowAddModal(true), className: "!rounded-2xl !px-5 !shadow-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(PlusIcon, {}),
        "Record Expense"
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "print:hidden reveal", style: { animationDelay: "60ms" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "search-card relative overflow-hidden !border-emerald-100/70 !bg-white/90 !p-5 shadow-[0_10px_30px_-12px_rgba(6,78,59,0.18)] backdrop-blur-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleLookup, className: "relative flex flex-col gap-2.5 sm:flex-row", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SearchIcon, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            className: "w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-3.5 text-sm shadow-sm outline-none transition-all duration-300 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100",
            placeholder: "Search expense number (e.g. TB-EXP-2026-000001)",
            value: lookupNumber,
            onChange: (e) => setLookupNumber(e.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "!rounded-2xl !px-6 !shadow-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SearchIcon, {}),
        "Find Voucher"
      ] }) })
    ] }) }) }),
    found && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "print:hidden animate-[fadeIn_.45s_cubic-bezier(0.16,1,0.3,1)]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "preview-card mx-auto w-full max-w-3xl overflow-hidden !p-0 shadow-[0_25px_60px_-20px_rgba(4,82,59,0.35)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "preview-header relative overflow-hidden px-6 py-6 text-white sm:px-8 bg-gradient-to-br from-[#032a1d] via-[#054e38] to-[#07704f]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl bg-white/95 p-2 shadow-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: logo, alt: "Torki Bazar Logo", className: "h-12 w-12 object-contain" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-black tracking-tight", children: "Torki Bazar" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-emerald-200", children: "Official Expense Record" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:text-right", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-black uppercase tracking-[0.2em] text-emerald-200", children: "Reference #" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 font-mono text-lg font-black", children: found.expenseNumber }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-emerald-100/80", children: formatDateTime(found.expenseDate) })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 px-6 py-6 sm:grid-cols-3 sm:px-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-slate-200 bg-white p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-black uppercase tracking-[0.14em] text-slate-400", children: "Category" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 font-bold text-slate-900", children: found.category.name })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-slate-200 bg-white p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-black uppercase tracking-[0.14em] text-slate-400", children: "Payment Method" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 font-bold uppercase text-slate-900", children: found.paymentMethod })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-emerald-200/70 bg-emerald-50/50 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-black uppercase tracking-[0.14em] text-emerald-700", children: "Amount Paid" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-2xl font-black tabular-nums text-emerald-800", children: formatBDT(found.amount) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-slate-100 px-6 py-5 sm:px-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-slate-400", children: "Description / Note" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm font-bold text-slate-800", children: found.description || DASH$2 }),
        found.reference && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-xs text-slate-500", children: [
          "Reference: ",
          found.reference
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4 sm:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", onClick: handlePrint, className: "!rounded-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(PrinterIcon, {}),
        "Print Expense Document"
      ] }) }) })
    ] }) }),
    found && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { id: "expense-print-area", className: "hidden print:block", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto w-full max-w-[190mm] bg-white text-slate-900 p-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-b-2 border-slate-800 pb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: logo, alt: "Torki Bazar Logo", className: "h-16 w-16 object-contain" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold tracking-tight", children: "Torki Bazar" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 text-xs font-medium text-slate-600", children: "Fast Delivery · Online Grocery Shop" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1.5 text-[10px] leading-4 text-slate-500", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Torki Bandar, Gournadi, Barishal" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "contact@torkibazar.com · torkibazar.com" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-base font-bold", children: found.expenseNumber }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-slate-500", children: formatDateTime(found.expenseDate) })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-8 border-b border-slate-200 py-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400", children: "Expense Particulars" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-sm font-semibold", children: [
            "Category: ",
            found.category.name
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-slate-600", children: [
            "Description: ",
            found.description
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-slate-600", children: [
            "Reference: ",
            found.reference || DASH$2
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400", children: "Transaction Info" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-sm font-semibold uppercase", children: [
            "Method: ",
            found.paymentMethod
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-slate-600", children: [
            "Processed By: ",
            found.createdBy?.name || "Admin"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b border-slate-300 pb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-bold uppercase tracking-wider text-slate-700", children: "Total Disbursement" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl font-bold", children: formatBDT(found.amount) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-16 border-t border-slate-300 pt-6 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-slate-600", children: "Authorized Financial Outflow Record · Torki Bazar Management" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-[10px] text-slate-400", children: "System generated administrative document" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "print:hidden reveal", style: { animationDelay: "120ms" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "!overflow-hidden !p-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-5 py-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ReceiptIcon, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700", children: "Ledger" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-black text-slate-900", children: "Recorded Expenses" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800", children: [
          expenses.length,
          " record",
          expenses.length === 1 ? "" : "s"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "expenses-table px-1 py-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        DataTable,
        {
          rows: expenses,
          keyFor: (e) => e.id,
          emptyMessage: "No operating expenses recorded yet.",
          columns: [
            {
              header: "Expense #",
              accessor: (e) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs font-bold text-slate-700", children: e.expenseNumber })
            },
            {
              header: "Date",
              accessor: (e) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-500", children: formatDateTime(e.expenseDate) })
            },
            {
              header: "Category",
              accessor: (e) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-slate-800", children: e.category.name })
            },
            {
              header: "Description",
              accessor: (e) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-600", children: e.description })
            },
            {
              header: "Amount",
              accessor: (e) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold tabular-nums text-slate-900", children: formatBDT(e.amount) })
            },
            {
              header: "Payment",
              accessor: (e) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "uppercase text-xs font-bold text-slate-700", children: e.paymentMethod })
            },
            {
              header: "",
              accessor: (e) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "button",
                  className: "group inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-bold text-emerald-700 transition-all duration-300 hover:gap-1.5 hover:bg-emerald-50",
                  onClick: () => setFound(e),
                  children: [
                    "View & Print",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "transition-transform duration-300 group-hover:translate-x-0.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowIcon, {}) })
                  ]
                }
              )
            }
          ]
        }
      ) })
    ] }) }),
    showAddModal && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl animate-[fadeIn_.25s_cubic-bezier(0.16,1,0.3,1)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-black text-slate-900", children: "Record Operating Expense" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-slate-500", children: "This will automatically deduct from your Cash Management ledger." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleCreateExpense, className: "mt-4 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold uppercase tracking-wider text-slate-600", children: "Category" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "select",
            {
              className: "mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-emerald-500",
              value: categoryId,
              onChange: (e) => setCategoryId(e.target.value),
              children: categories.map((cat) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: cat.id, children: cat.name }, cat.id))
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold uppercase tracking-wider text-slate-600", children: "Amount (৳)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "number",
              step: "0.01",
              className: "mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-emerald-500",
              placeholder: "0.00",
              value: amount,
              onChange: (e) => setAmount(e.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold uppercase tracking-wider text-slate-600", children: "Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              className: "mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-emerald-500",
              placeholder: "e.g. Electricity bill, Office supplies",
              value: description,
              onChange: (e) => setDescription(e.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold uppercase tracking-wider text-slate-600", children: "Payment Method" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                className: "mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-emerald-500",
                value: paymentMethod,
                onChange: (e) => setPaymentMethod(e.target.value),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "CASH", children: "Cash" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "BANK", children: "Bank" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "BKASH", children: "bKash" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "NAGAD", children: "Nagad" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold uppercase tracking-wider text-slate-600", children: "Reference (Optional)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                className: "mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-emerald-500",
                placeholder: "Invoice # or Ref",
                value: reference,
                onChange: (e) => setReference(e.target.value)
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex justify-end gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", type: "button", onClick: () => setShowAddModal(false), className: "!rounded-xl", children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "!rounded-xl", children: "Save & Deduct Cash" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
        .reveal {
          animation: slideUp 0.55s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
      ` }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
        @media print {
          @page { size: A4; margin: 12mm; }
          html, body { background: #ffffff !important; margin: 0 !important; padding: 0 !important; }
          body * { visibility: hidden; }
          #expense-print-area, #expense-print-area * { visibility: visible; }
          #expense-print-area {
            display: block !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            background: white !important;
          }
        }
      ` })
  ] });
}
function today() {
  return (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
}
function CashManagementPage() {
  const { lang, n: n2 } = useLanguageStore();
  const isBangla = lang === "bn";
  const [balance, setBalance] = reactExports.useState(0);
  const [transactions, setTransactions] = reactExports.useState([]);
  const [addForm, setAddForm] = reactExports.useState({
    amount: "",
    note: "",
    date: today()
  });
  const [withdrawForm, setWithdrawForm] = reactExports.useState({
    amount: "",
    note: "",
    date: today()
  });
  const [loading, setLoading] = reactExports.useState(true);
  const [adding, setAdding] = reactExports.useState(false);
  const [withdrawing, setWithdrawing] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const loadCashData = reactExports.useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [currentBalance, history] = await Promise.all([
        call("cash:balance"),
        call("cash:list")
      ]);
      setBalance(Number(currentBalance) || 0);
      const normalized = (history ?? []).map((item) => ({
        ...item,
        amount: Number(item.amount) || 0
      }));
      setTransactions(normalized);
    } catch (err) {
      console.error("Failed to load cash data:", err);
      setError(
        err instanceof Error ? err.message : isBangla ? "ক্যাশ তথ্য লোড করা যায়নি।" : "Unable to load cash information."
      );
    } finally {
      setLoading(false);
    }
  }, [isBangla]);
  reactExports.useEffect(() => {
    void loadCashData();
  }, [loadCashData]);
  function formatDate2(date) {
    if (!date) return "";
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) {
      return date;
    }
    return parsed.toLocaleDateString(
      isBangla ? "bn-BD" : "en-US",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );
  }
  async function addMoney() {
    const value = Number(addForm.amount);
    if (!Number.isFinite(value) || value <= 0) {
      setError(
        isBangla ? "দয়া করে সঠিক টাকার পরিমাণ লিখুন।" : "Please enter a valid amount."
      );
      return;
    }
    try {
      setAdding(true);
      setError("");
      await call("cash:create", {
        type: "MANUAL_IN",
        amount: value,
        transactionDate: /* @__PURE__ */ new Date(
          `${addForm.date}T00:00:00`
        ),
        note: addForm.note.trim() || void 0
      });
      setAddForm({
        amount: "",
        note: "",
        date: today()
      });
      await loadCashData();
    } catch (err) {
      console.error("Failed to add cash:", err);
      setError(
        err instanceof Error ? err.message : isBangla ? "ক্যাশ যোগ করা যায়নি।" : "Unable to add cash."
      );
    } finally {
      setAdding(false);
    }
  }
  async function withdrawMoney() {
    const value = Number(withdrawForm.amount);
    if (!Number.isFinite(value) || value <= 0) {
      setError(
        isBangla ? "দয়া করে সঠিক টাকার পরিমাণ লিখুন।" : "Please enter a valid amount."
      );
      return;
    }
    if (value > balance) {
      setError(
        isBangla ? "আপনার Available Cash-এর চেয়ে বেশি টাকা উত্তোলন করা যাবে না।" : "You cannot withdraw more than your available cash."
      );
      return;
    }
    try {
      setWithdrawing(true);
      setError("");
      await call("cash:create", {
        type: "MANUAL_OUT",
        amount: value,
        transactionDate: /* @__PURE__ */ new Date(
          `${withdrawForm.date}T00:00:00`
        ),
        note: withdrawForm.note.trim() || void 0
      });
      setWithdrawForm({
        amount: "",
        note: "",
        date: today()
      });
      await loadCashData();
    } catch (err) {
      console.error("Failed to withdraw cash:", err);
      setError(
        err instanceof Error ? err.message : isBangla ? "ক্যাশ উত্তোলন করা যায়নি।" : "Unable to withdraw cash."
      );
    } finally {
      setWithdrawing(false);
    }
  }
  const totalAdded = transactions.filter((item) => item.type === "MANUAL_IN").reduce((sum, item) => sum + Number(item.amount), 0);
  const totalWithdrawn = transactions.filter((item) => item.type === "MANUAL_OUT").reduce((sum, item) => sum + Number(item.amount), 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-full bg-brand-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-7xl space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 p-7 text-white shadow-xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -bottom-24 right-32 h-72 w-72 rounded-full bg-white/5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-brand-100 backdrop-blur", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2 w-2 rounded-full bg-emerald-400" }),
            isBangla ? "ক্যাশ ও ফান্ড ম্যানেজমেন্ট" : "Cash & Fund Management"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold tracking-tight md:text-4xl", children: "Cash Management" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 max-w-2xl text-sm leading-6 text-brand-100", children: isBangla ? "আপনার ব্যবসার হাতে থাকা ক্যাশ, যোগ এবং উত্তোলনের সম্পূর্ণ হিসাব পরিচালনা করুন।" : "Manage your business cash, additions, withdrawals, and transaction history from one place." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-[250px] rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-md", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wider text-brand-200", children: "Available Cash" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/20 text-xl", children: "💰" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-3 text-4xl font-bold tracking-tight", children: [
            "৳",
            n2(balance.toFixed(2))
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-brand-200", children: isBangla ? "বর্তমান ব্যবসায়িক ক্যাশ" : "Current business cash balance" })
        ] })
      ] })
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 shadow-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg", children: "⚠️" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: isBangla ? "লেনদেন করা যায়নি" : "Transaction failed" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5", children: error })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => setError(""),
          className: "ml-auto text-red-400 hover:text-red-700",
          children: "✕"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "grid grid-cols-1 gap-4 md:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-500", children: "Available Cash" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-2xl font-bold text-gray-900", children: [
            "৳",
            n2(balance.toFixed(2))
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-gray-400", children: isBangla ? "বর্তমান ব্যালেন্স" : "Current balance" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-xl", children: "💰" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-500", children: isBangla ? "মোট যোগ" : "Total Added" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-2xl font-bold text-gray-900", children: [
            "৳",
            n2(totalAdded.toFixed(2))
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-gray-400", children: isBangla ? "ক্যাশে মোট যোগ হয়েছে" : "Total cash added" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl", children: "↗" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-500", children: isBangla ? "মোট উত্তোলন" : "Total Withdrawn" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-2xl font-bold text-gray-900", children: [
            "৳",
            n2(totalWithdrawn.toFixed(2))
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-gray-400", children: isBangla ? "ক্যাশ থেকে মোট উত্তোলন" : "Total cash withdrawn" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-xl", children: "↙" })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold text-gray-900", children: "Cash Transactions" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-gray-500", children: isBangla ? "ক্যাশ যোগ অথবা উত্তোলনের মাধ্যমে আপনার ব্যালেন্স আপডেট করুন।" : "Add or withdraw money to update your available cash balance." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-6 lg:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-b border-emerald-100 bg-emerald-50/60 px-6 py-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-xl text-white shadow-sm", children: "+" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-gray-900", children: isBangla ? "ক্যাশ যোগ করুন" : "Add Money" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 text-sm text-gray-500", children: isBangla ? "ব্যাংক বা ব্যবসায়িক ফান্ড থেকে ক্যাশ যোগ করুন" : "Add cash from bank or business funds" })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5 p-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "mb-2 block text-sm font-semibold text-gray-700", children: isBangla ? "টাকার পরিমাণ" : "Amount" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-gray-400", children: "৳" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "number",
                    min: "0",
                    step: "0.01",
                    value: addForm.amount,
                    onChange: (e) => setAddForm((current) => ({
                      ...current,
                      amount: e.target.value
                    })),
                    placeholder: "0.00",
                    disabled: adding,
                    className: "w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-10 pr-4 text-lg font-semibold text-gray-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "mb-2 block text-sm font-semibold text-gray-700", children: isBangla ? "তারিখ" : "Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "date",
                  value: addForm.date,
                  onChange: (e) => setAddForm((current) => ({
                    ...current,
                    date: e.target.value
                  })),
                  disabled: adding,
                  className: "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm font-medium text-gray-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "mb-2 block text-sm font-semibold text-gray-700", children: [
                isBangla ? "নোট" : "Note",
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-1 font-normal text-gray-400", children: [
                  "(",
                  isBangla ? "ঐচ্ছিক" : "Optional",
                  ")"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "text",
                  value: addForm.note,
                  onChange: (e) => setAddForm((current) => ({
                    ...current,
                    note: e.target.value
                  })),
                  placeholder: isBangla ? "যেমন: ব্যবসায়িক ফান্ড" : "e.g. Business fund",
                  disabled: adding,
                  className: "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: addMoney,
                disabled: adding || loading,
                className: "flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 font-bold text-white shadow-sm transition hover:bg-emerald-700 hover:shadow-md active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg", children: "+" }),
                  adding ? isBangla ? "যোগ হচ্ছে..." : "Adding..." : isBangla ? "ক্যাশ যোগ করুন" : "Add Money"
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overflow-hidden rounded-2xl border border-red-100 bg-white shadow-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-b border-red-100 bg-red-50/60 px-6 py-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-12 w-12 items-center justify-center rounded-xl bg-red-600 text-xl text-white shadow-sm", children: "−" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-gray-900", children: isBangla ? "ক্যাশ উত্তোলন করুন" : "Withdraw Money" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 text-sm text-gray-500", children: isBangla ? "ব্যবসা থেকে ক্যাশ উত্তোলন করুন" : "Withdraw cash from the business" })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5 p-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "mb-2 block text-sm font-semibold text-gray-700", children: isBangla ? "টাকার পরিমাণ" : "Amount" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-gray-400", children: "৳" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "number",
                    min: "0",
                    step: "0.01",
                    value: withdrawForm.amount,
                    onChange: (e) => setWithdrawForm((current) => ({
                      ...current,
                      amount: e.target.value
                    })),
                    placeholder: "0.00",
                    disabled: withdrawing,
                    className: "w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-10 pr-4 text-lg font-semibold text-gray-900 outline-none transition focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "mb-2 block text-sm font-semibold text-gray-700", children: isBangla ? "তারিখ" : "Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "date",
                  value: withdrawForm.date,
                  onChange: (e) => setWithdrawForm((current) => ({
                    ...current,
                    date: e.target.value
                  })),
                  disabled: withdrawing,
                  className: "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm font-medium text-gray-800 outline-none transition focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "mb-2 block text-sm font-semibold text-gray-700", children: [
                isBangla ? "নোট" : "Note",
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-1 font-normal text-gray-400", children: [
                  "(",
                  isBangla ? "ঐচ্ছিক" : "Optional",
                  ")"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "text",
                  value: withdrawForm.note,
                  onChange: (e) => setWithdrawForm((current) => ({
                    ...current,
                    note: e.target.value
                  })),
                  placeholder: isBangla ? "যেমন: ব্যক্তিগত উত্তোলন" : "e.g. Personal withdrawal",
                  disabled: withdrawing,
                  className: "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm outline-none transition focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: withdrawMoney,
                disabled: withdrawing || loading,
                className: "flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3.5 font-bold text-white shadow-sm transition hover:bg-red-700 hover:shadow-md active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg", children: "−" }),
                  withdrawing ? isBangla ? "উত্তোলন হচ্ছে..." : "Withdrawing..." : isBangla ? "ক্যাশ উত্তোলন করুন" : "Withdraw Money"
                ]
              }
            )
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3 border-b border-gray-100 px-6 py-5 md:flex-row md:items-center md:justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold text-gray-900", children: "Cash History" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-gray-500", children: isBangla ? "আপনার সকল ক্যাশ যোগ ও উত্তোলনের রেকর্ড" : "Complete history of cash additions and withdrawals" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg bg-gray-50 px-3 py-2 text-xs font-medium text-gray-500", children: loading ? isBangla ? "লোড হচ্ছে..." : "Loading..." : `${n2(transactions.length)} ${isBangla ? "টি লেনদেন" : "transactions"}` })
      ] }),
      loading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-6 py-16 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-brand-600" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-sm text-gray-500", children: isBangla ? "ক্যাশ তথ্য লোড হচ্ছে..." : "Loading cash information..." })
      ] }) : transactions.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-6 py-16 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-3xl", children: "💰" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-4 font-semibold text-gray-800", children: isBangla ? "এখনও কোনো ক্যাশ লেনদেন নেই" : "No cash transactions yet" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500", children: isBangla ? "উপরের Add Money অথবা Withdraw Money ব্যবহার করে আপনার প্রথম ক্যাশ লেনদেন তৈরি করুন।" : "Use Add Money or Withdraw Money above to create your first cash transaction." })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full min-w-[700px] text-left", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-gray-50 text-xs uppercase tracking-wide text-gray-500", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 font-semibold", children: isBangla ? "লেনদেন" : "Transaction" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 font-semibold", children: isBangla ? "তারিখ" : "Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 font-semibold", children: isBangla ? "নোট" : "Note" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-right font-semibold", children: isBangla ? "পরিমাণ" : "Amount" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-gray-100", children: transactions.map((transaction) => {
          const isIncome = transaction.type === "MANUAL_IN";
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "tr",
            {
              className: "transition hover:bg-gray-50/80",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: `flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${isIncome ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`,
                      children: isIncome ? "↗" : "↙"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-gray-900", children: isIncome ? isBangla ? "ম্যানুয়াল ক্যাশ যোগ" : "Manual Add" : isBangla ? "ম্যানুয়াল ক্যাশ উত্তোলন" : "Manual Withdrawal" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "span",
                      {
                        className: `mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${isIncome ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`,
                        children: isIncome ? isBangla ? "ক্যাশ ইন" : "Cash In" : isBangla ? "ক্যাশ আউট" : "Cash Out"
                      }
                    )
                  ] })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-gray-600", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "📅" }),
                  formatDate2(
                    transaction.transactionDate
                  )
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "max-w-xs px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-sm text-gray-500", children: transaction.note || (isBangla ? "কোনো নোট নেই" : "No note") }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "p",
                  {
                    className: `text-sm font-bold ${isIncome ? "text-emerald-600" : "text-red-600"}`,
                    children: [
                      isIncome ? "+" : "-",
                      "৳",
                      n2(
                        Number(
                          transaction.amount
                        ).toFixed(2)
                      )
                    ]
                  }
                ) })
              ]
            },
            transaction.id
          );
        }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2 pb-4 text-xs text-gray-400", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "🔒" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: isBangla ? "ক্যাশ ম্যানেজমেন্ট সিস্টেম" : "Cash Management System" })
    ] })
  ] }) });
}
const DASH$1 = "—";
function BkashManagementPage() {
  const [balance, setBalance] = reactExports.useState(0);
  const [transactions, setTransactions] = reactExports.useState([]);
  const [addAmount, setAddAmount] = reactExports.useState("");
  const [addNote, setAddNote] = reactExports.useState("");
  const [withdrawAmount, setWithdrawAmount] = reactExports.useState("");
  const [withdrawNote, setWithdrawNote] = reactExports.useState("");
  const push = useToastStore((s) => s.push);
  async function loadData() {
    try {
      const [balData, txData] = await Promise.all([
        call("bkash:balance"),
        call("bkash:list")
      ]);
      setBalance(balData);
      setTransactions(txData);
    } catch (err) {
      push(err instanceof Error ? err.message : "Failed to load bKash data", "error");
    }
  }
  reactExports.useEffect(() => {
    loadData();
  }, []);
  async function handleAddMoney(e) {
    e.preventDefault();
    try {
      const amt = parseFloat(addAmount);
      if (isNaN(amt) || amt <= 0) throw new Error("Enter a valid amount.");
      await call("bkash:create", {
        type: "MANUAL_IN",
        amount: amt,
        note: addNote.trim() || "Manual bKash Add"
      });
      push("bKash funds added successfully.", "success");
      setAddAmount("");
      setAddNote("");
      await loadData();
    } catch (err) {
      push(err instanceof Error ? err.message : "Failed to add funds", "error");
    }
  }
  async function handleWithdrawMoney(e) {
    e.preventDefault();
    try {
      const amt = parseFloat(withdrawAmount);
      if (isNaN(amt) || amt <= 0) throw new Error("Enter a valid amount.");
      if (amt > balance) throw new Error("Insufficient bKash balance.");
      await call("bkash:create", {
        type: "MANUAL_OUT",
        amount: amt,
        note: withdrawNote.trim() || "Manual bKash Withdrawal"
      });
      push("bKash funds withdrawn successfully.", "success");
      setWithdrawAmount("");
      setWithdrawNote("");
      await loadData();
    } catch (err) {
      push(err instanceof Error ? err.message : "Failed to withdraw funds", "error");
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-black uppercase tracking-[0.2em] text-pink-700", children: "Digital Fund Management" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-1 text-2xl font-black tracking-tight text-slate-900", children: "bKash Management" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1.5 text-sm text-slate-500", children: "Manage digital bKash funds, additions, withdrawals, and transaction history." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "!bg-gradient-to-br from-pink-900 to-pink-700 !text-white p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold uppercase tracking-wider text-pink-200", children: "Available bKash Balance" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-3xl font-black", children: formatBDT(balance) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-6 md:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-base font-bold text-slate-900", children: "Add bKash Funds" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleAddMoney, className: "mt-4 space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-bold text-slate-600", children: "Amount (৳)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "number",
                step: "0.01",
                className: "mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-pink-500",
                placeholder: "0.00",
                value: addAmount,
                onChange: (e) => setAddAmount(e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-bold text-slate-600", children: "Note (Optional)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                className: "mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-pink-500",
                placeholder: "e.g. Deposit from bank",
                value: addNote,
                onChange: (e) => setAddNote(e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "!rounded-xl !bg-pink-700 hover:!bg-pink-800", children: "Add bKash Funds" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-base font-bold text-slate-900", children: "Withdraw bKash Funds" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleWithdrawMoney, className: "mt-4 space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-bold text-slate-600", children: "Amount (৳)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "number",
                step: "0.01",
                className: "mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-rose-500",
                placeholder: "0.00",
                value: withdrawAmount,
                onChange: (e) => setWithdrawAmount(e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-bold text-slate-600", children: "Note (Optional)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                className: "mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-rose-500",
                placeholder: "e.g. Personal withdrawal",
                value: withdrawNote,
                onChange: (e) => setWithdrawNote(e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "!rounded-xl !bg-rose-600 hover:!bg-rose-700", children: "Withdraw bKash Funds" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "!p-0 overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-b border-slate-100 bg-slate-50 px-5 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-black text-slate-900", children: "bKash Transaction History" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        DataTable,
        {
          rows: transactions,
          keyFor: (t2) => t2.id,
          emptyMessage: "No bKash transactions recorded yet.",
          columns: [
            {
              header: "Type",
              accessor: (t2) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `font-bold text-xs px-2.5 py-1 rounded-full ${t2.type === "MANUAL_IN" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`, children: t2.type === "MANUAL_IN" ? "Cash In" : "Cash Out" })
            },
            {
              header: "Date",
              accessor: (t2) => formatDateTime(t2.transactionDate)
            },
            {
              header: "Note",
              accessor: (t2) => t2.note || DASH$1
            },
            {
              header: "Amount",
              accessor: (t2) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `font-bold ${t2.type === "MANUAL_IN" ? "text-emerald-700" : "text-rose-700"}`, children: [
                t2.type === "MANUAL_IN" ? "+" : "-",
                formatBDT(t2.amount)
              ] })
            },
            {
              header: "Processed By",
              accessor: (t2) => t2.createdBy?.fullName || "Admin"
            }
          ]
        }
      )
    ] })
  ] });
}
function InfoIcon() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "12", r: "9" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 11v5" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 8h.01" })
  ] });
}
function WarningIcon() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M10.3 3.6 2.7 17a1.7 1.7 0 0 0 1.5 2.6h15.6A1.7 1.7 0 0 0 21.3 17L13.7 3.6a1.7 1.7 0 0 0-3.4 0Z" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 9v4" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 16.5h.01" })
  ] });
}
function UrgentIcon() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "12", r: "9" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 7v6" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 16.5h.01" })
  ] });
}
function CriticalIcon() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.3", strokeLinecap: "round", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "12", r: "9" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "m14.5 9.5-5 5" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "m9.5 9.5 5 5" })
  ] });
}
function ClockIcon() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "12", r: "9" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 7v5l3 2" })
  ] });
}
function CheckIcon() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { width: "13", height: "13", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M20 6 9 17l-5-5" }) });
}
function BellIcon() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "22", height: "22", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M13.7 21a2 2 0 0 1-3.4 0" })
  ] });
}
const severityConfig = {
  INFO: {
    bar: "bg-sky-400",
    chip: "bg-sky-100 text-sky-700",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(InfoIcon, {}),
    label: "Info"
  },
  WARNING: {
    bar: "bg-amber-400",
    chip: "bg-amber-100 text-amber-700",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(WarningIcon, {}),
    label: "Warning"
  },
  URGENT: {
    bar: "bg-orange-500",
    chip: "bg-orange-100 text-orange-700",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(UrgentIcon, {}),
    label: "Urgent"
  },
  CRITICAL: {
    bar: "bg-red-500",
    chip: "bg-red-100 text-red-700",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CriticalIcon, {}),
    label: "Critical"
  }
};
const defaultSeverity = {
  bar: "bg-slate-300",
  chip: "bg-slate-100 text-slate-600",
  icon: /* @__PURE__ */ jsxRuntimeExports.jsx(InfoIcon, {}),
  label: "Notice"
};
function NotificationsPage() {
  const [notifications, setNotifications] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  async function load() {
    try {
      await call("notifications:refresh").catch(() => {
      });
      const data = await call("notifications:list");
      setNotifications(data.filter((n2) => !n2.isRead));
    } finally {
      setLoading(false);
    }
  }
  reactExports.useEffect(() => {
    load();
  }, []);
  async function markRead(id2) {
    setNotifications(
      (current) => current.filter((notification) => notification.id !== id2)
    );
    try {
      await call("notifications:markRead", { id: id2 });
    } catch {
      await load();
    }
  }
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "reveal", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700", children: "Alerts Center" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-1 text-2xl font-black tracking-tight text-slate-900", children: "Notifications" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1.5 text-sm text-slate-500", children: "Expiry alerts, low stock, and pending COD collections." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: Array.from({ length: 3 }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "skeleton-shimmer h-24 rounded-2xl" }, i)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
          .skeleton-shimmer {
            position: relative;
            overflow: hidden;
            background: linear-gradient(110deg, #e6efe9 8%, #f4f8f5 18%, #e6efe9 33%);
            background-size: 200% 100%;
            animation: shimmer 1.6s ease-in-out infinite;
          }
          @keyframes shimmer { to { background-position-x: -200%; } }
          .reveal { animation: slideUp 0.5s cubic-bezier(0.16,1,0.3,1) both; }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
          }
        ` })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "notifications-root space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "reveal flex flex-wrap items-end justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700", children: "Alerts Center" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-1 text-2xl font-black tracking-tight text-slate-900", children: "Notifications" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1.5 text-sm text-slate-500", children: "Expiry alerts, low stock, and pending COD collections." })
      ] }),
      notifications.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1.5 text-xs font-black text-rose-700", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" }),
        notifications.length,
        " unread"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      notifications.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "reveal", style: { animationDelay: "60ms" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "!py-10 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BellIcon, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 font-bold text-slate-700", children: "All caught up" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-slate-400", children: "No notifications right now." })
      ] }) }),
      notifications.map((n2, i) => {
        const config = severityConfig[n2.severity] ?? defaultSeverity;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "notification-card reveal group relative flex overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-xl transition-all duration-300 ease-out hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg",
            style: { animationDelay: `${Math.min(i, 8) * 50}ms` },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-1.5 shrink-0 ${config.bar}` }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 p-4 sm:p-5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap items-start justify-between gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${config.chip}`, children: config.icon }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-slate-900", children: n2.title }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `hidden rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide sm:inline-block ${config.chip}`, children: config.label })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mt-0.5 flex items-center gap-1 text-[11px] text-slate-400", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(ClockIcon, {}),
                      formatDateTime(n2.createdAt)
                    ] })
                  ] })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2.5 text-sm leading-relaxed text-slate-600", children: n2.message }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    className: "group/btn mt-3 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 transition-all duration-300 hover:bg-emerald-100 hover:text-emerald-700",
                    onClick: () => markRead(n2.id),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-4 w-4 items-center justify-center rounded-full bg-white text-slate-400 transition-colors duration-300 group-hover/btn:bg-emerald-500 group-hover/btn:text-white", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckIcon, {}) }),
                      "Mark as read"
                    ]
                  }
                )
              ] })
            ]
          },
          n2.id
        );
      })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
        .reveal {
          animation: slideUp 0.5s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .reveal, .notification-card, .animate-pulse { animation: none !important; }
        }
      ` })
  ] });
}
function SettingsBackupPage() {
  const [backups, setBackups] = reactExports.useState([]);
  const [currentPassword, setCurrentPassword] = reactExports.useState("");
  const [newPassword, setNewPassword] = reactExports.useState("");
  const [showResetModal, setShowResetModal] = reactExports.useState(false);
  const [resetPassword, setResetPassword] = reactExports.useState("");
  const [resetConfirm, setResetConfirm] = reactExports.useState("");
  const [resetting, setResetting] = reactExports.useState(false);
  const push = useToastStore((s) => s.push);
  async function load() {
    try {
      const data = await call("backup:list");
      setBackups(data);
    } catch (err) {
      push(
        err instanceof Error ? err.message : "Failed to load backups.",
        "error"
      );
    }
  }
  reactExports.useEffect(() => {
    load();
  }, []);
  async function handleBackup() {
    try {
      const { dbFilePath, backupsDir } = await call("app:paths");
      await call("backup:create", {
        dbFilePath,
        backupsDir
      });
      push("Backup created successfully.", "success");
      await load();
    } catch (err) {
      push(
        err instanceof Error ? err.message : "Backup failed.",
        "error"
      );
    }
  }
  async function handleChangePassword(e) {
    e.preventDefault();
    try {
      await call("auth:changePassword", {
        currentPassword,
        newPassword
      });
      push("Password updated successfully.", "success");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      push(
        err instanceof Error ? err.message : "Failed to change password.",
        "error"
      );
    }
  }
  function openResetModal() {
    setResetPassword("");
    setResetConfirm("");
    setResetting(false);
    setShowResetModal(true);
  }
  function closeResetModal() {
    if (resetting) return;
    setResetPassword("");
    setResetConfirm("");
    setResetting(false);
    setShowResetModal(false);
  }
  async function handleReset() {
    if (!resetPassword.trim()) {
      push(
        "Enter your administrator password.",
        "error"
      );
      return;
    }
    if (resetConfirm.trim().toUpperCase() !== "RESET") {
      push(
        'Type "RESET" to confirm.',
        "error"
      );
      return;
    }
    if (resetting) {
      return;
    }
    try {
      setResetting(true);
      await call("system:reset", {
        password: resetPassword,
        confirmation: resetConfirm.trim().toUpperCase()
      });
      push(
        "Business data has been reset successfully.",
        "success"
      );
      setResetPassword("");
      setResetConfirm("");
      setShowResetModal(false);
      await load();
    } catch (err) {
      push(
        err instanceof Error ? err.message : "Business data reset failed.",
        "error"
      );
    } finally {
      setResetting(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-full space-y-6 bg-slate-50 p-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-green-600 p-6 text-white shadow-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-3xl backdrop-blur", children: "⚙️" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Settings & Backup" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-emerald-50", children: "Manage your account security, database protection and system controls." })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-5 flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-xl", children: "🔐" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold text-slate-900", children: "Account Security" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-500", children: "Change your administrator password." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "form",
        {
          onSubmit: handleChangePassword,
          className: "grid gap-4 md:grid-cols-2",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Current password", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "password",
                required: true,
                value: currentPassword,
                onChange: (e) => setCurrentPassword(e.target.value),
                placeholder: "Enter current password"
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "New password", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "password",
                required: true,
                minLength: 8,
                value: newPassword,
                onChange: (e) => setNewPassword(e.target.value),
                placeholder: "Minimum 8 characters"
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", children: "Update Password" }) })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-5 flex items-center justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-xl", children: "💾" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold text-slate-900", children: "Database Backups" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-500", children: "Protect your Torki Bazar business data." })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleBackup, children: "Create Backup" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        DataTable,
        {
          rows: backups,
          keyFor: (b) => b.id,
          emptyMessage: "No backups yet. Create your first backup to protect your data.",
          columns: [
            {
              header: "Created",
              accessor: (b) => formatDateTime(b.createdAt)
            },
            {
              header: "Size",
              accessor: (b) => `${(b.fileSizeBytes / 1024).toFixed(1)} KB`
            },
            {
              header: "By",
              accessor: (b) => b.createdBy?.fullName ?? "Unknown"
            },
            {
              header: "Path",
              accessor: (b) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "break-all text-xs text-slate-400", children: b.filePath })
            }
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-red-200 bg-red-50 p-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 text-2xl", children: "⚠️" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold text-red-800", children: "Danger Zone" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm leading-6 text-red-700", children: "Reset Torki Bazar business data and start again from a clean system." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 grid gap-2 text-sm text-red-700 md:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "• Sales and sales history" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "• Purchases and supplier payments" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "• Products and inventory" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "• Customers and memberships" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "• Suppliers and returns" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "• Employees and salaries" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "• Expenses and reports" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "• Daily closing records" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5 border-t border-red-200 pt-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-red-800", children: "Reset Business Data" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-red-600", children: "Your application code and system structure will not be changed." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: openResetModal,
              className: "rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 active:scale-[0.98]",
              children: "Reset Business Data"
            }
          )
        ] }) })
      ] })
    ] }) }) }),
    showResetModal && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-red-600 px-6 py-5 text-white", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-2xl", children: "⚠️" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold", children: "Reset Business Data" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-100", children: "This action is permanent." })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5 p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-red-200 bg-red-50 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-red-800", children: "Are you absolutely sure?" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm leading-6 text-red-700", children: "All business records will be removed and Torki Bazar will return to a clean starting state." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-red-600", children: "Your application, code and system permissions will remain unchanged." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Administrator password", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "password",
            autoFocus: true,
            value: resetPassword,
            disabled: resetting,
            onChange: (e) => setResetPassword(e.target.value),
            placeholder: "Enter administrator password"
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: 'Type "RESET" to confirm', children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: resetConfirm,
            disabled: resetting,
            onChange: (e) => setResetConfirm(
              e.target.value.toUpperCase()
            ),
            placeholder: "RESET"
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-3 border-t border-slate-100 pt-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: closeResetModal,
              disabled: resetting,
              className: "rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50",
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: handleReset,
              disabled: resetting || !resetPassword.trim() || resetConfirm.trim().toUpperCase() !== "RESET",
              className: "rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
              children: resetting ? "Resetting..." : "Reset Everything"
            }
          )
        ] })
      ] })
    ] }) })
  ] });
}
const DASH = "—";
function toDate(value) {
  return new Date(value);
}
function quarterOf(d) {
  return Math.floor(d.getMonth() / 3) + 1;
}
function startOfWeek(d) {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  date.setDate(date.getDate() + diff);
  return date;
}
function inRange(d, range, customFrom, customTo) {
  if (range === "all") return true;
  const now = /* @__PURE__ */ new Date();
  if (range === "7days") {
    const cutoff = new Date(now);
    cutoff.setDate(now.getDate() - 6);
    cutoff.setHours(0, 0, 0, 0);
    return d >= cutoff;
  }
  if (range === "month") {
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }
  if (range === "quarter") {
    return d.getFullYear() === now.getFullYear() && quarterOf(d) === quarterOf(now);
  }
  if (range === "year") {
    return d.getFullYear() === now.getFullYear();
  }
  if (range === "custom") {
    if (!customFrom || !customTo) return true;
    const from = new Date(customFrom);
    from.setHours(0, 0, 0, 0);
    const to = new Date(customTo);
    to.setHours(23, 59, 59, 999);
    return d >= from && d <= to;
  }
  return true;
}
function groupKey(d, groupBy) {
  if (groupBy === "daily") return d.toISOString().slice(0, 10);
  if (groupBy === "weekly") return startOfWeek(d).toISOString().slice(0, 10);
  if (groupBy === "monthly")
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  if (groupBy === "quarterly") return `${d.getFullYear()}-Q${quarterOf(d)}`;
  return `${d.getFullYear()}`;
}
function groupLabel(d, groupBy) {
  if (groupBy === "daily") {
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  }
  if (groupBy === "weekly") {
    const start = startOfWeek(d);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const startLabel = start.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short"
    });
    const endLabel = end.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
    return `${startLabel} – ${endLabel}`;
  }
  if (groupBy === "monthly") {
    return d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  }
  if (groupBy === "quarterly") {
    return `Q${quarterOf(d)} ${d.getFullYear()}`;
  }
  return `${d.getFullYear()}`;
}
function shortAxisLabel(d, groupBy) {
  if (groupBy === "daily" || groupBy === "weekly") {
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  }
  if (groupBy === "monthly") {
    return d.toLocaleDateString("en-GB", { month: "short" });
  }
  if (groupBy === "quarterly") {
    return `Q${quarterOf(d)}`;
  }
  return `${d.getFullYear()}`;
}
function TrendIcon() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "21", height: "21", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M3 17l6-6 4 4 8-9" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M15 6h6v6" })
  ] });
}
function WalletIcon() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "21", height: "21", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "3", y: "5", width: "18", height: "15", rx: "3" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M3 9h18" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M16 14h2" })
  ] });
}
function ExpenseIcon() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "21", height: "21", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "3", y: "4", width: "18", height: "16", rx: "3" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M7 9h10" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M7 13h5" })
  ] });
}
function ScaleIcon() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "21", height: "21", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 3v18" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M5 8l-3 6a3.5 3.5 0 0 0 6 0Z" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M19 8l-3 6a3.5 3.5 0 0 0 6 0Z" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M5 8h14" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M9 21h6" })
  ] });
}
function CalendarIcon() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "3", y: "4", width: "18", height: "17", rx: "3" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M16 2v4" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M8 2v4" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M3 10h18" })
  ] });
}
function TrophyIcon() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "21", height: "21", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M8 21h8" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 17v4" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M7 4h10v5a5 5 0 0 1-10 0Z" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M7 5H4a3 3 0 0 0 3 5" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M17 5h3a3 3 0 0 1-3 5" })
  ] });
}
function KpiTile({
  label: label2,
  value,
  sub,
  icon,
  tone,
  delay
}) {
  const tones = {
    green: "bg-emerald-50 text-emerald-600",
    blue: "bg-sky-50 text-sky-600",
    rose: "bg-rose-50 text-rose-600",
    violet: "bg-violet-50 text-violet-600",
    amber: "bg-amber-50 text-amber-600"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "kpi-tile group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
      style: { animationDelay: `${delay}ms` },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full blur-2xl transition-transform duration-500 group-hover:scale-150 ${tones[tone].split(" ")[0]}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-start justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wider text-slate-400", children: label2 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 truncate text-2xl font-bold tracking-tight text-slate-900 tabular-nums", children: value }),
            sub && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-slate-500", children: sub })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 ${tones[tone]}`, children: icon })
        ] })
      ]
    }
  );
}
function ReportsPage() {
  const [closings, setClosings] = reactExports.useState([]);
  const [date, setDate] = reactExports.useState((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
  const push = useToastStore((s) => s.push);
  const [rangeFilter, setRangeFilter] = reactExports.useState("month");
  const [customFrom, setCustomFrom] = reactExports.useState("");
  const [customTo, setCustomTo] = reactExports.useState("");
  const [groupBy, setGroupBy] = reactExports.useState("daily");
  async function load() {
    setClosings(await call("reports:dailyClosing:list"));
  }
  reactExports.useEffect(() => {
    load();
  }, []);
  async function handleGenerate() {
    try {
      await call("reports:dailyClosing:generate", { date });
      push("Daily closing generated successfully.", "success");
      load();
    } catch (err) {
      push(
        err instanceof Error ? err.message : "Failed to generate closing",
        "error"
      );
    }
  }
  const filteredClosings = reactExports.useMemo(() => {
    return closings.filter((c) => inRange(toDate(c.closingDate), rangeFilter, customFrom, customTo)).sort((a, b) => toDate(b.closingDate).getTime() - toDate(a.closingDate).getTime());
  }, [closings, rangeFilter, customFrom, customTo]);
  const summary = reactExports.useMemo(() => {
    const totals = filteredClosings.reduce(
      (acc, c) => {
        acc.sales += Number(c.totalSales || 0);
        acc.cogs += Number(c.cogs || 0);
        acc.grossProfit += Number(c.grossProfit || 0);
        acc.expenses += Number(c.expenses || 0);
        acc.net += Number(c.netOperatingResult || 0);
        return acc;
      },
      { sales: 0, cogs: 0, grossProfit: 0, expenses: 0, net: 0 }
    );
    const days = filteredClosings.length;
    const avgNet = days > 0 ? totals.net / days : 0;
    let bestDay = null;
    for (const c of filteredClosings) {
      if (!bestDay || Number(c.netOperatingResult) > Number(bestDay.netOperatingResult)) {
        bestDay = c;
      }
    }
    return { ...totals, days, avgNet, bestDay };
  }, [filteredClosings]);
  const groupedRows = reactExports.useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    for (const c of filteredClosings) {
      const d = toDate(c.closingDate);
      const key = groupKey(d, groupBy);
      const existing = map.get(key);
      if (existing) {
        existing.sales += Number(c.totalSales || 0);
        existing.cogs += Number(c.cogs || 0);
        existing.grossProfit += Number(c.grossProfit || 0);
        existing.expenses += Number(c.expenses || 0);
        existing.net += Number(c.netOperatingResult || 0);
        existing.days += 1;
      } else {
        map.set(key, {
          key,
          sampleDate: d,
          sales: Number(c.totalSales || 0),
          cogs: Number(c.cogs || 0),
          grossProfit: Number(c.grossProfit || 0),
          expenses: Number(c.expenses || 0),
          net: Number(c.netOperatingResult || 0),
          days: 1
        });
      }
    }
    return Array.from(map.values()).sort(
      (a, b) => b.sampleDate.getTime() - a.sampleDate.getTime()
    );
  }, [filteredClosings, groupBy]);
  const chartRows = reactExports.useMemo(() => {
    return [...groupedRows].sort((a, b) => a.sampleDate.getTime() - b.sampleDate.getTime()).slice(-14);
  }, [groupedRows]);
  const chartMax = Math.max(1, ...chartRows.map((r2) => Math.abs(r2.net)), 1);
  const rangeLabel = rangeFilter === "all" ? "All Time" : rangeFilter === "7days" ? "Last 7 Days" : rangeFilter === "month" ? "This Month" : rangeFilter === "quarter" ? "This Quarter" : rangeFilter === "year" ? "This Year" : "Custom Range";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "reports-root min-h-full bg-slate-50/60 p-4 sm:p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-[1500px] space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hero-panel relative overflow-hidden rounded-3xl p-6 text-white shadow-xl shadow-emerald-900/10 sm:p-7", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hero-mesh pointer-events-none absolute inset-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl animate-[float_9s_ease-in-out_infinite]" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-emerald-300/10 blur-3xl animate-[float_12s_ease-in-out_infinite_reverse]" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "reveal flex items-start gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-2xl shadow-lg backdrop-blur-sm", children: "📊" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "hero-title text-2xl font-bold tracking-tight sm:text-3xl", children: "Reports" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-100 backdrop-blur-sm", children: rangeLabel })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 max-w-2xl text-sm leading-6 text-emerald-50/80", children: "Business performance across daily, weekly, monthly, quarterly and yearly views — built from your closing history." })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: load,
              className: "reveal inline-flex h-10 items-center gap-2 self-start rounded-xl border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/20",
              style: { animationDelay: "80ms" },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-base transition-transform duration-500 group-hover:rotate-180", children: "↻" }),
                "Refresh"
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "reveal", style: { animationDelay: "120ms" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mb-2 flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.14em] text-slate-400", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarIcon, {}),
            "Report Range"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1", children: [
            ["all", "All Time"],
            ["7days", "Last 7 Days"],
            ["month", "This Month"],
            ["quarter", "This Quarter"],
            ["year", "This Year"],
            ["custom", "Custom"]
          ].map(([key, text]) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setRangeFilter(key),
              className: `rounded-lg px-3.5 py-2 text-xs font-bold transition-all duration-200 ${rangeFilter === key ? "bg-white text-emerald-700 shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:bg-white/70 hover:text-slate-800"}`,
              children: text
            },
            key
          )) }),
          rangeFilter === "custom" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 grid grid-cols-2 gap-3 sm:max-w-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "From", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "date",
                value: customFrom,
                onChange: (e) => setCustomFrom(e.target.value)
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "To", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "date",
                value: customTo,
                onChange: (e) => setCustomTo(e.target.value)
              }
            ) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-2 text-[11px] font-black uppercase tracking-[0.14em] text-slate-400", children: "Group By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1", children: [
            ["daily", "Daily"],
            ["weekly", "Weekly"],
            ["monthly", "Monthly"],
            ["quarterly", "Quarterly"],
            ["yearly", "Yearly"]
          ].map(([key, text]) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setGroupBy(key),
              className: `rounded-lg px-3.5 py-2 text-xs font-bold transition-all duration-200 ${groupBy === key ? "bg-white text-emerald-700 shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:bg-white/70 hover:text-slate-800"}`,
              children: text
            },
            key
          )) })
        ] })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          KpiTile,
          {
            label: "Total Sales",
            value: formatBDT(summary.sales),
            sub: `${summary.days} day${summary.days === 1 ? "" : "s"} in range`,
            icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TrendIcon, {}),
            tone: "green",
            delay: 0
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          KpiTile,
          {
            label: "Gross Profit",
            value: formatBDT(summary.grossProfit),
            sub: `COGS: ${formatBDT(summary.cogs)}`,
            icon: /* @__PURE__ */ jsxRuntimeExports.jsx(WalletIcon, {}),
            tone: "blue",
            delay: 40
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          KpiTile,
          {
            label: "Total Expenses",
            value: formatBDT(summary.expenses),
            sub: "Operating costs",
            icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ExpenseIcon, {}),
            tone: "rose",
            delay: 80
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          KpiTile,
          {
            label: "Net Result",
            value: formatBDT(summary.net),
            sub: summary.net >= 0 ? "Profitable period" : "Loss for period",
            icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ScaleIcon, {}),
            tone: summary.net >= 0 ? "green" : "rose",
            delay: 120
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          KpiTile,
          {
            label: "Average Daily Net",
            value: formatBDT(summary.avgNet),
            sub: "Per closing",
            icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TrendIcon, {}),
            tone: "violet",
            delay: 160
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          KpiTile,
          {
            label: "Best Day",
            value: summary.bestDay ? formatBDT(summary.bestDay.netOperatingResult) : DASH,
            sub: summary.bestDay ? formatDate(summary.bestDay.closingDate) : "No data yet",
            icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TrophyIcon, {}),
            tone: "amber",
            delay: 200
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "reveal", style: { animationDelay: "240ms" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-5 flex flex-col gap-2 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-bold text-slate-900", children: "Net Result Trend" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-slate-500", children: [
              groupBy.charAt(0).toUpperCase() + groupBy.slice(1),
              " view ·",
              " ",
              "last ",
              chartRows.length,
              " period",
              chartRows.length === 1 ? "" : "s"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 text-xs font-semibold text-slate-500", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2.5 w-2.5 rounded-sm bg-gradient-to-t from-emerald-600 to-emerald-400" }),
              "Profit"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2.5 w-2.5 rounded-sm bg-gradient-to-t from-rose-600 to-rose-400" }),
              "Loss"
            ] })
          ] })
        ] }),
        chartRows.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-48 items-center justify-center text-sm text-slate-400", children: "Not enough data yet to chart a trend." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-52 items-end gap-2 sm:gap-3", children: chartRows.map((r2, i) => {
          const heightPct = Math.max(4, Math.abs(r2.net) / chartMax * 100);
          const positive = r2.net >= 0;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group/bar flex flex-1 flex-col items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative flex h-40 w-full items-end justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: `chart-bar w-full max-w-[30px] rounded-t-lg transition-opacity duration-300 group-hover/bar:opacity-80 ${positive ? "bg-gradient-to-t from-emerald-600 to-emerald-400" : "bg-gradient-to-t from-rose-600 to-rose-400"}`,
                style: {
                  height: `${heightPct}%`,
                  animationDelay: `${i * 40}ms`
                },
                title: `${groupLabel(r2.sampleDate, groupBy)}: ${formatBDT(r2.net)}`
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-semibold text-slate-400", children: shortAxisLabel(r2.sampleDate, groupBy) })
          ] }, r2.key);
        }) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "reveal", style: { animationDelay: "280ms" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-xl", children: "🧾" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-bold text-slate-900", children: "Generate Daily Closing" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-slate-500", children: "Select a business date and generate its closing summary." })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden rounded-full bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-500 sm:block", children: "End-of-day report" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 sm:flex-row sm:items-end", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full sm:max-w-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Closing date", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "date",
              value: date,
              onChange: (e) => setDate(e.target.value)
            }
          ) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sm:pb-[1px]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              onClick: handleGenerate,
              className: "transition-all duration-300 hover:-translate-y-0.5",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mr-2", children: "✓" }),
                "Generate Closing"
              ]
            }
          ) })
        ] })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "reveal", style: { animationDelay: "320ms" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-5 flex flex-col gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-center lg:justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-xl", children: "📋" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-bold text-slate-900", children: "Closing History" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-slate-500", children: groupBy === "daily" ? "Every generated daily closing in the selected range." : `Rolled up by ${groupBy} period for the selected range.` })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 self-start rounded-full border border-slate-200 bg-slate-50 px-3 py-2 lg:self-auto", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2 w-2 rounded-full bg-emerald-500 animate-pulse" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold text-slate-600", children: groupBy === "daily" ? `${filteredClosings.length} ${filteredClosings.length === 1 ? "closing" : "closings"}` : `${groupedRows.length} ${groupedRows.length === 1 ? "period" : "periods"}` })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: groupBy === "daily" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          DataTable,
          {
            rows: filteredClosings,
            keyFor: (c) => c.id,
            emptyMessage: "No daily closings in this range yet.",
            columns: [
              {
                header: "Date",
                accessor: (c) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-slate-800", children: formatDate(c.closingDate) })
              },
              {
                header: "Total Sales",
                accessor: (c) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold tabular-nums text-slate-900", children: formatBDT(c.totalSales) })
              },
              {
                header: "COGS",
                accessor: (c) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium tabular-nums text-slate-600", children: formatBDT(c.cogs) })
              },
              {
                header: "Gross Profit",
                accessor: (c) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold tabular-nums text-emerald-600", children: formatBDT(c.grossProfit) })
              },
              {
                header: "Expenses",
                accessor: (c) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium tabular-nums text-rose-600", children: formatBDT(c.expenses) })
              },
              {
                header: "Net Result",
                accessor: (c) => {
                  const value = Number(c.netOperatingResult);
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: `font-bold tabular-nums ${value >= 0 ? "text-emerald-600" : "text-rose-600"}`,
                      children: formatBDT(c.netOperatingResult)
                    }
                  );
                }
              }
            ]
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
          DataTable,
          {
            rows: groupedRows,
            keyFor: (r2) => r2.key,
            emptyMessage: "No closings in this range yet.",
            columns: [
              {
                header: "Period",
                accessor: (r2) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-slate-800", children: groupLabel(r2.sampleDate, groupBy) })
              },
              {
                header: "Days",
                accessor: (r2) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tabular-nums text-slate-500", children: r2.days })
              },
              {
                header: "Total Sales",
                accessor: (r2) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold tabular-nums text-slate-900", children: formatBDT(r2.sales) })
              },
              {
                header: "COGS",
                accessor: (r2) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium tabular-nums text-slate-600", children: formatBDT(r2.cogs) })
              },
              {
                header: "Gross Profit",
                accessor: (r2) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold tabular-nums text-emerald-600", children: formatBDT(r2.grossProfit) })
              },
              {
                header: "Expenses",
                accessor: (r2) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium tabular-nums text-rose-600", children: formatBDT(r2.expenses) })
              },
              {
                header: "Net Result",
                accessor: (r2) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: `font-bold tabular-nums ${r2.net >= 0 ? "text-emerald-600" : "text-rose-600"}`,
                    children: formatBDT(r2.net)
                  }
                )
              }
            ]
          }
        ) })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
        .hero-panel {
          background: linear-gradient(120deg, #059669 0%, #047857 45%, #14532d 100%);
        }
        .hero-mesh {
          background-image:
            radial-gradient(circle at 15% 20%, rgba(255,255,255,0.12), transparent 45%),
            radial-gradient(circle at 85% 75%, rgba(16,185,129,0.18), transparent 40%);
          background-size: 200% 200%;
          animation: meshShift 14s ease-in-out infinite;
        }
        .hero-title {
          background: linear-gradient(90deg, #ffffff 0%, #e6fff4 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .reveal, .kpi-tile {
          animation: slideUp 0.55s cubic-bezier(0.16,1,0.3,1) both;
        }
        .chart-bar {
          transform-origin: bottom;
          animation: growBar 0.7s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes growBar {
          from { transform: scaleY(0); opacity: 0; }
          to { transform: scaleY(1); opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-10px, 12px) scale(1.05); }
        }
        @keyframes meshShift {
          0%, 100% { background-position: 0% 0%; }
          50% { background-position: 100% 100%; }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-mesh, .reveal, .kpi-tile, .chart-bar, .animate-pulse {
            animation: none !important;
          }
        }
      ` })
  ] });
}
const variantStyles = {
  success: "bg-brand-600 text-white",
  error: "bg-red-600 text-white",
  info: "bg-slate-800 text-white"
};
function ToastContainer() {
  const { toasts, dismiss } = useToastStore();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed bottom-4 right-4 z-50 flex flex-col gap-2", children: toasts.map((t2) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      role: "alert",
      className: `min-w-[260px] rounded-lg px-4 py-3 text-sm shadow-lg animate-in fade-in slide-in-from-bottom-2 ${variantStyles[t2.variant]}`,
      onClick: () => dismiss(t2.id),
      children: t2.message
    },
    t2.id
  )) });
}
function RequireAuth({ children }) {
  const session = useAuthStore((s) => s.session);
  if (!session) return /* @__PURE__ */ jsxRuntimeExports.jsx(Navigate, { to: "/login", replace: true });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children });
}
function App() {
  const { session, setSession } = useAuthStore();
  const [checked, setChecked] = reactExports.useState(false);
  reactExports.useEffect(() => {
    call("auth:me").then((s) => setSession(s)).catch(() => {
    }).finally(() => setChecked(true));
  }, []);
  if (!checked) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Routes, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Route,
        {
          path: "/login",
          element: session ? /* @__PURE__ */ jsxRuntimeExports.jsx(Navigate, { to: "/", replace: true }) : /* @__PURE__ */ jsxRuntimeExports.jsx(LoginPage, {})
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Route,
        {
          path: "/",
          element: /* @__PURE__ */ jsxRuntimeExports.jsx(RequireAuth, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, {}) }),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { index: true, element: /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardPage, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "pos", element: /* @__PURE__ */ jsxRuntimeExports.jsx(PosPage, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "sales", element: /* @__PURE__ */ jsxRuntimeExports.jsx(SalesPage, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "products", element: /* @__PURE__ */ jsxRuntimeExports.jsx(ProductsPage, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "categories", element: /* @__PURE__ */ jsxRuntimeExports.jsx(CategoriesPage, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "inventory", element: /* @__PURE__ */ jsxRuntimeExports.jsx(InventoryPage, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "suppliers", element: /* @__PURE__ */ jsxRuntimeExports.jsx(SuppliersPage, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "supplier-returns", element: /* @__PURE__ */ jsxRuntimeExports.jsx(SupplierReturnsPage, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "purchases", element: /* @__PURE__ */ jsxRuntimeExports.jsx(PurchasesPage, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "customers", element: /* @__PURE__ */ jsxRuntimeExports.jsx(CustomersPage, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "membership", element: /* @__PURE__ */ jsxRuntimeExports.jsx(MembershipPage, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "returns", element: /* @__PURE__ */ jsxRuntimeExports.jsx(ReturnsPage, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "employees", element: /* @__PURE__ */ jsxRuntimeExports.jsx(EmployeesPage, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "expenses", element: /* @__PURE__ */ jsxRuntimeExports.jsx(ExpensesPage, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Route,
              {
                path: "cash-management",
                element: /* @__PURE__ */ jsxRuntimeExports.jsx(CashManagementPage, {})
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Route,
              {
                path: "bkash-management",
                element: /* @__PURE__ */ jsxRuntimeExports.jsx(BkashManagementPage, {})
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "reports", element: /* @__PURE__ */ jsxRuntimeExports.jsx(ReportsPage, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "notifications", element: /* @__PURE__ */ jsxRuntimeExports.jsx(NotificationsPage, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "settings", element: /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsBackupPage, {}) })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "*", element: /* @__PURE__ */ jsxRuntimeExports.jsx(Navigate, { to: "/", replace: true }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ToastContainer, {})
  ] });
}
client.createRoot(document.getElementById("root")).render(
  /* @__PURE__ */ jsxRuntimeExports.jsx(React$2.StrictMode, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(HashRouter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(App, {}) }) })
);
