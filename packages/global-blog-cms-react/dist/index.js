var V = Object.defineProperty;
var _ = (a, s, m) => s in a ? V(a, s, { enumerable: !0, configurable: !0, writable: !0, value: m }) : a[s] = m;
var A = (a, s, m) => _(a, typeof s != "symbol" ? s + "" : s, m);
import { jsxs as r, jsx as e, Fragment as W } from "react/jsx-runtime";
import { useMemo as X, useState as u, useEffect as Z } from "react";
class C extends Error {
  constructor(m, g, b) {
    super(m);
    A(this, "status");
    A(this, "errors");
    this.name = "BlogApiError", this.status = g, this.errors = b;
  }
}
const K = (a) => {
  const s = a.replace(/\/+$/, "");
  return s.endsWith("/api") ? s : `${s}/api`;
}, ee = (a) => {
  var g, b, t;
  const s = new URLSearchParams();
  a.page && s.set("page", String(a.page)), a.limit && s.set("limit", String(a.limit)), (g = a.search) != null && g.trim() && s.set("search", a.search.trim()), (b = a.category) != null && b.trim() && s.set("category", a.category.trim()), (t = a.tag) != null && t.trim() && s.set("tag", a.tag.trim());
  const m = s.toString();
  return m ? `?${m}` : "";
}, te = (a, s) => {
  const m = K(a), g = async (t, c = {}) => {
    var d;
    if (!s)
      throw new C("Missing Global Blog CMS API key.", 401);
    const i = new Headers(c.headers);
    i.set("x-api-key", s), !(c.body instanceof FormData) && !i.has("Content-Type") && i.set("Content-Type", "application/json");
    let y;
    try {
      y = await fetch(`${m}${t}`, {
        ...c,
        headers: i
      });
    } catch (l) {
      throw new C(l instanceof Error ? l.message : "CMS API request failed.", 0);
    }
    const o = await y.json().catch(() => null);
    if (!y.ok || !(o != null && o.success)) {
      const l = (d = o == null ? void 0 : o.errors) == null ? void 0 : d.map((h) => h.message).join(", ");
      throw new C(
        l || (o == null ? void 0 : o.message) || "CMS API request failed.",
        y.status,
        o == null ? void 0 : o.errors
      );
    }
    return o;
  };
  return {
    imageUrl: (t) => {
      if (!t) return "";
      if (/^https?:\/\//i.test(t)) return t;
      const c = t.replace(/\\/g, "/").replace(/^\/+/, "");
      return `${m.replace(/\/api$/, "")}/${c}`;
    },
    async getBlogs(t = {}) {
      var i;
      const c = await g(`/blogs${ee(t)}`);
      return {
        blogs: ((i = c.data) == null ? void 0 : i.blogs) || [],
        meta: c.meta
      };
    },
    async getLatestBlogs(t = 5) {
      var i;
      return ((i = (await g(`/blogs/latest?limit=${t}`)).data) == null ? void 0 : i.blogs) || [];
    },
    async getBlog(t) {
      var i;
      const c = await g(`/blogs/${encodeURIComponent(t)}`);
      if (!((i = c.data) != null && i.blog))
        throw new C("Blog not found.", 404);
      return c.data.blog;
    },
    async submitBlog(t) {
      var y, o, d;
      if (!!t.featuredImage) {
        const l = new FormData();
        l.set("title", t.title), l.set("authorName", t.authorName), l.set("authorEmail", t.authorEmail), l.set("category", t.category), l.set("content", t.content), (y = t.tags) != null && y.length && l.set("tags", t.tags.join(",")), t.featuredImage && l.set("featuredImage", t.featuredImage);
        const h = await g("/blogs/submit", {
          method: "POST",
          body: l
        });
        if (!((o = h.data) != null && o.blog)) throw new C("Blog submission response is missing data.", 500);
        return h.data.blog;
      }
      const i = await g("/blogs/submit", {
        method: "POST",
        body: JSON.stringify({
          title: t.title,
          authorName: t.authorName,
          authorEmail: t.authorEmail,
          category: t.category,
          content: t.content,
          tags: t.tags || []
        })
      });
      if (!((d = i.data) != null && d.blog)) throw new C("Blog submission response is missing data.", 500);
      return i.data.blog;
    }
  };
}, R = (a) => new Intl.DateTimeFormat(void 0, {
  year: "numeric",
  month: "short",
  day: "numeric"
}).format(new Date(a)), ae = (a) => a.replace(/\s+/g, " ").trim().slice(0, 180), se = (a) => a.split(",").map((s) => s.trim()).filter(Boolean);
function z({
  src: a,
  alt: s,
  fallback: m,
  className: g,
  placeholderClassName: b
}) {
  const [t, c] = u(!1);
  return !a || t ? /* @__PURE__ */ e("span", { className: b, children: m }) : /* @__PURE__ */ e("img", { className: g, src: a, alt: s, loading: "lazy", onError: () => c(!0) });
}
function ie({
  apiUrl: a,
  apiKey: s,
  className: m = "",
  theme: g = "light",
  pageSize: b = 9,
  showSubmitForm: t = !0,
  title: c = "Blogs",
  description: i = "Read the latest published articles or submit your own story for review.",
  emptyMessage: y = "No published blogs are available yet.",
  renderHeader: o
}) {
  const d = X(() => te(a, s), [a, s]), [l, h] = u({ name: "list", page: 1 }), [$, P] = u([]), [p, U] = u(null), [E, D] = u(1), [F, L] = u(""), [I, M] = u(""), [v, S] = u(!1), [k, T] = u(!1), [q, B] = u(""), [j, x] = u(""), G = async (n, w) => {
    var f;
    S(!0), B("");
    try {
      const N = await d.getBlogs({
        page: n,
        limit: b,
        search: w
      });
      P(N.blogs), D(((f = N.meta) == null ? void 0 : f.totalPages) || 1);
    } catch (N) {
      B(N instanceof Error ? N.message : "Unable to load blogs."), P([]), D(1);
    } finally {
      S(!1);
    }
  }, Y = async (n) => {
    S(!0), B(""), U(null);
    try {
      U(await d.getBlog(n));
    } catch (w) {
      B(w instanceof Error ? w.message : "Unable to load blog.");
    } finally {
      S(!1);
    }
  };
  Z(() => {
    l.name === "list" && G(l.page, I), l.name === "detail" && Y(l.slug);
  }, [l, I, b, d]);
  const H = (n) => {
    n.preventDefault(), M(F), h({ name: "list", page: 1 });
  }, J = async (n) => {
    n.preventDefault(), S(!0), B(""), x("");
    const w = n.currentTarget, f = new FormData(w), N = f.get("featuredImage"), Q = {
      title: String(f.get("title") || ""),
      authorName: String(f.get("authorName") || ""),
      authorEmail: String(f.get("authorEmail") || ""),
      category: String(f.get("category") || ""),
      content: String(f.get("content") || ""),
      tags: se(String(f.get("tags") || "")),
      featuredImage: N instanceof File && N.size > 0 ? N : null
    };
    try {
      await d.submitBlog(Q), w.reset(), x("Your blog has been submitted for approval."), T(!1);
    } catch (O) {
      B(O instanceof Error ? O.message : "Unable to submit blog.");
    } finally {
      S(!1);
    }
  };
  return /* @__PURE__ */ r("section", { className: `gbcms-widget gbcms-theme-${g} ${m}`.trim(), children: [
    /* @__PURE__ */ e("header", { className: "gbcms-header", children: o || /* @__PURE__ */ r("div", { children: [
      /* @__PURE__ */ e("span", { className: "gbcms-eyebrow", children: "Client Blog" }),
      /* @__PURE__ */ e("h1", { children: c }),
      /* @__PURE__ */ e("p", { children: i })
    ] }) }),
    q && /* @__PURE__ */ e("div", { className: "gbcms-alert gbcms-alert-error", children: q }),
    j && /* @__PURE__ */ e("div", { className: "gbcms-alert gbcms-alert-success", children: j }),
    l.name === "list" && /* @__PURE__ */ r(W, { children: [
      /* @__PURE__ */ r("form", { className: "gbcms-toolbar", onSubmit: H, children: [
        /* @__PURE__ */ e(
          "input",
          {
            value: F,
            onChange: (n) => L(n.target.value),
            placeholder: "Search blogs",
            "aria-label": "Search blogs"
          }
        ),
        /* @__PURE__ */ e("button", { className: "gbcms-button", type: "submit", children: "Search" }),
        I && /* @__PURE__ */ e(
          "button",
          {
            className: "gbcms-button gbcms-button-muted",
            type: "button",
            onClick: () => {
              L(""), M(""), h({ name: "list", page: 1 });
            },
            children: "Clear"
          }
        )
      ] }),
      v ? /* @__PURE__ */ e("div", { className: "gbcms-state", children: "Loading blogs..." }) : $.length === 0 ? /* @__PURE__ */ e("div", { className: "gbcms-state", children: y }) : /* @__PURE__ */ e("div", { className: "gbcms-grid", children: $.map((n) => /* @__PURE__ */ r("article", { className: "gbcms-card", children: [
        /* @__PURE__ */ e("button", { className: "gbcms-card-media", type: "button", onClick: () => h({ name: "detail", slug: n.slug }), children: /* @__PURE__ */ e(
          z,
          {
            src: d.imageUrl(n.featuredImage),
            alt: n.title,
            fallback: n.category.slice(0, 2).toUpperCase(),
            className: "gbcms-card-image",
            placeholderClassName: "gbcms-card-placeholder"
          }
        ) }),
        /* @__PURE__ */ r("div", { className: "gbcms-card-body", children: [
          /* @__PURE__ */ r("div", { className: "gbcms-meta", children: [
            /* @__PURE__ */ e("span", { children: n.category }),
            /* @__PURE__ */ e("span", { children: R(n.createdAt) })
          ] }),
          /* @__PURE__ */ e("h2", { children: n.title }),
          /* @__PURE__ */ e("p", { children: ae(n.content) }),
          /* @__PURE__ */ e("button", { className: "gbcms-read-link", type: "button", onClick: () => h({ name: "detail", slug: n.slug }), children: "Read article" })
        ] })
      ] }, n._id)) }),
      E > 1 && /* @__PURE__ */ r("nav", { className: "gbcms-pagination", "aria-label": "Blog pagination", children: [
        /* @__PURE__ */ e(
          "button",
          {
            className: "gbcms-button",
            type: "button",
            disabled: l.page <= 1 || v,
            onClick: () => h({ name: "list", page: Math.max(1, l.page - 1) }),
            children: "Previous"
          }
        ),
        /* @__PURE__ */ r("span", { children: [
          "Page ",
          l.page,
          " of ",
          E
        ] }),
        /* @__PURE__ */ e(
          "button",
          {
            className: "gbcms-button",
            type: "button",
            disabled: l.page >= E || v,
            onClick: () => h({ name: "list", page: Math.min(E, l.page + 1) }),
            children: "Next"
          }
        )
      ] }),
      t && /* @__PURE__ */ r("section", { className: "gbcms-submit-panel", children: [
        /* @__PURE__ */ r("div", { className: "gbcms-submit-intro", children: [
          /* @__PURE__ */ e("span", { className: "gbcms-eyebrow", children: "Write for us" }),
          /* @__PURE__ */ e("h2", { children: "Submit your blog for review" }),
          /* @__PURE__ */ e("p", { children: "Share an article with this website. It will appear publicly after the site admin approves it." })
        ] }),
        /* @__PURE__ */ e(
          "button",
          {
            className: "gbcms-button gbcms-button-primary",
            type: "button",
            onClick: () => {
              T((n) => !n), x("");
            },
            "aria-expanded": k,
            children: k ? "Close Form" : "Write Blog"
          }
        ),
        k && /* @__PURE__ */ r("form", { className: "gbcms-form", onSubmit: J, children: [
          /* @__PURE__ */ r("div", { className: "gbcms-form-heading", children: [
            /* @__PURE__ */ e("h3", { children: "Blog Details" }),
            /* @__PURE__ */ e("p", { children: "Add a featured image so your article card and detail page look complete." })
          ] }),
          /* @__PURE__ */ r("label", { children: [
            "Title",
            /* @__PURE__ */ e("input", { name: "title", required: !0, maxLength: 160, placeholder: "Enter blog title" })
          ] }),
          /* @__PURE__ */ r("div", { className: "gbcms-form-row", children: [
            /* @__PURE__ */ r("label", { children: [
              "Author name",
              /* @__PURE__ */ e("input", { name: "authorName", required: !0, maxLength: 100, placeholder: "Your name" })
            ] }),
            /* @__PURE__ */ r("label", { children: [
              "Author email",
              /* @__PURE__ */ e("input", { name: "authorEmail", required: !0, type: "email", maxLength: 160, placeholder: "you@example.com" })
            ] })
          ] }),
          /* @__PURE__ */ r("label", { children: [
            "Category",
            /* @__PURE__ */ e("input", { name: "category", required: !0, maxLength: 80, placeholder: "Category" })
          ] }),
          /* @__PURE__ */ r("label", { children: [
            "Tags",
            /* @__PURE__ */ e("input", { name: "tags", placeholder: "SEO, Web Design, Marketing" })
          ] }),
          /* @__PURE__ */ r("label", { children: [
            "Featured image",
            /* @__PURE__ */ e("input", { name: "featuredImage", type: "file", accept: "image/jpeg,image/jpg,image/png,image/webp" })
          ] }),
          /* @__PURE__ */ r("label", { children: [
            "Content",
            /* @__PURE__ */ e("textarea", { name: "content", required: !0, rows: 10, minLength: 50, placeholder: "Write your blog content here..." })
          ] }),
          /* @__PURE__ */ e("button", { className: "gbcms-button gbcms-button-primary", type: "submit", disabled: v, children: v ? "Submitting..." : "Submit for Approval" })
        ] })
      ] })
    ] }),
    l.name === "detail" && /* @__PURE__ */ r("article", { className: "gbcms-detail", children: [
      /* @__PURE__ */ e("button", { className: "gbcms-read-link", type: "button", onClick: () => h({ name: "list", page: 1 }), children: "Back to blogs" }),
      v ? /* @__PURE__ */ e("div", { className: "gbcms-state", children: "Loading blog..." }) : p ? /* @__PURE__ */ r(W, { children: [
        /* @__PURE__ */ r("div", { className: "gbcms-detail-hero", children: [
          /* @__PURE__ */ e(
            z,
            {
              src: d.imageUrl(p.featuredImage),
              alt: p.title,
              fallback: p.category.slice(0, 2).toUpperCase(),
              className: "gbcms-detail-image",
              placeholderClassName: "gbcms-detail-placeholder"
            }
          ),
          /* @__PURE__ */ r("div", { className: "gbcms-detail-heading", children: [
            /* @__PURE__ */ r("div", { className: "gbcms-meta", children: [
              /* @__PURE__ */ e("span", { children: p.category }),
              /* @__PURE__ */ e("span", { children: R(p.createdAt) }),
              /* @__PURE__ */ r("span", { children: [
                "By ",
                p.authorName
              ] })
            ] }),
            /* @__PURE__ */ e("h1", { children: p.title })
          ] })
        ] }),
        /* @__PURE__ */ e("div", { className: "gbcms-tags", children: p.tags.map((n) => /* @__PURE__ */ e("span", { children: n }, n)) }),
        /* @__PURE__ */ e("div", { className: "gbcms-content", children: p.content })
      ] }) : /* @__PURE__ */ e("div", { className: "gbcms-state", children: "Blog not found." })
    ] })
  ] });
}
export {
  C as BlogApiError,
  ie as GlobalBlogCMS,
  te as createBlogApi,
  K as normalizeApiUrl
};
