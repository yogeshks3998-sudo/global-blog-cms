var J = Object.defineProperty;
var Q = (a, s, c) => s in a ? J(a, s, { enumerable: !0, configurable: !0, writable: !0, value: c }) : a[s] = c;
var k = (a, s, c) => Q(a, typeof s != "symbol" ? s + "" : s, c);
import { jsxs as n, jsx as e, Fragment as x } from "react/jsx-runtime";
import { useMemo as V, useState as y, useEffect as Y } from "react";
class I extends Error {
  constructor(c, d, N) {
    super(c);
    k(this, "status");
    k(this, "errors");
    this.name = "BlogApiError", this.status = d, this.errors = N;
  }
}
const _ = (a) => {
  const s = a.replace(/\/+$/, "");
  return s.endsWith("/api") ? s : `${s}/api`;
}, X = (a) => {
  var d, N, t;
  const s = new URLSearchParams();
  a.page && s.set("page", String(a.page)), a.limit && s.set("limit", String(a.limit)), (d = a.search) != null && d.trim() && s.set("search", a.search.trim()), (N = a.category) != null && N.trim() && s.set("category", a.category.trim()), (t = a.tag) != null && t.trim() && s.set("tag", a.tag.trim());
  const c = s.toString();
  return c ? `?${c}` : "";
}, Z = (a, s) => {
  const c = _(a), d = async (t, g = {}) => {
    var u;
    if (!s)
      throw new I("Missing Global Blog CMS API key.", 401);
    const i = new Headers(g.headers);
    i.set("x-api-key", s), !(g.body instanceof FormData) && !i.has("Content-Type") && i.set("Content-Type", "application/json");
    let f;
    try {
      f = await fetch(`${c}${t}`, {
        ...g,
        headers: i
      });
    } catch (r) {
      throw new I(r instanceof Error ? r.message : "CMS API request failed.", 0);
    }
    const o = await f.json().catch(() => null);
    if (!f.ok || !(o != null && o.success)) {
      const r = (u = o == null ? void 0 : o.errors) == null ? void 0 : u.map((m) => m.message).join(", ");
      throw new I(
        r || (o == null ? void 0 : o.message) || "CMS API request failed.",
        f.status,
        o == null ? void 0 : o.errors
      );
    }
    return o;
  };
  return {
    imageUrl: (t) => t ? /^https?:\/\//i.test(t) ? t : `${c.replace(/\/api$/, "")}/${t.replace(/^\/+/, "")}` : "",
    async getBlogs(t = {}) {
      var i;
      const g = await d(`/blogs${X(t)}`);
      return {
        blogs: ((i = g.data) == null ? void 0 : i.blogs) || [],
        meta: g.meta
      };
    },
    async getLatestBlogs(t = 5) {
      var i;
      return ((i = (await d(`/blogs/latest?limit=${t}`)).data) == null ? void 0 : i.blogs) || [];
    },
    async getBlog(t) {
      var i;
      const g = await d(`/blogs/${encodeURIComponent(t)}`);
      if (!((i = g.data) != null && i.blog))
        throw new I("Blog not found.", 404);
      return g.data.blog;
    },
    async submitBlog(t) {
      var f, o, u;
      if (!!t.featuredImage) {
        const r = new FormData();
        r.set("title", t.title), r.set("authorName", t.authorName), r.set("authorEmail", t.authorEmail), r.set("category", t.category), r.set("content", t.content), (f = t.tags) != null && f.length && r.set("tags", t.tags.join(",")), t.featuredImage && r.set("featuredImage", t.featuredImage);
        const m = await d("/blogs/submit", {
          method: "POST",
          body: r
        });
        if (!((o = m.data) != null && o.blog)) throw new I("Blog submission response is missing data.", 500);
        return m.data.blog;
      }
      const i = await d("/blogs/submit", {
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
      if (!((u = i.data) != null && u.blog)) throw new I("Blog submission response is missing data.", 500);
      return i.data.blog;
    }
  };
}, O = (a) => new Intl.DateTimeFormat(void 0, {
  year: "numeric",
  month: "short",
  day: "numeric"
}).format(new Date(a)), K = (a) => a.replace(/\s+/g, " ").trim().slice(0, 180), ee = (a) => a.split(",").map((s) => s.trim()).filter(Boolean);
function re({
  apiUrl: a,
  apiKey: s,
  className: c = "",
  theme: d = "light",
  pageSize: N = 9,
  showSubmitForm: t = !0,
  title: g = "Blogs",
  description: i = "Read the latest published articles or submit your own story for review.",
  emptyMessage: f = "No published blogs are available yet.",
  renderHeader: o
}) {
  const u = V(() => Z(a, s), [a, s]), [r, m] = y({ name: "list", page: 1 }), [A, $] = y([]), [b, P] = y(null), [C, D] = y(1), [L, M] = y(""), [E, T] = y(""), [S, v] = y(!1), [U, B] = y(""), [q, j] = y(""), R = async (l, w) => {
    var h;
    v(!0), B("");
    try {
      const p = await u.getBlogs({
        page: l,
        limit: N,
        search: w
      });
      $(p.blogs), D(((h = p.meta) == null ? void 0 : h.totalPages) || 1);
    } catch (p) {
      B(p instanceof Error ? p.message : "Unable to load blogs."), $([]), D(1);
    } finally {
      v(!1);
    }
  }, W = async (l) => {
    v(!0), B(""), P(null);
    try {
      P(await u.getBlog(l));
    } catch (w) {
      B(w instanceof Error ? w.message : "Unable to load blog.");
    } finally {
      v(!1);
    }
  };
  Y(() => {
    r.name === "list" && R(r.page, E), r.name === "detail" && W(r.slug);
  }, [r, E, N, u]);
  const z = (l) => {
    l.preventDefault(), T(L), m({ name: "list", page: 1 });
  }, G = async (l) => {
    l.preventDefault(), v(!0), B(""), j("");
    const w = l.currentTarget, h = new FormData(w), p = h.get("featuredImage"), H = {
      title: String(h.get("title") || ""),
      authorName: String(h.get("authorName") || ""),
      authorEmail: String(h.get("authorEmail") || ""),
      category: String(h.get("category") || ""),
      content: String(h.get("content") || ""),
      tags: ee(String(h.get("tags") || "")),
      featuredImage: p instanceof File && p.size > 0 ? p : null
    };
    try {
      await u.submitBlog(H), w.reset(), j("Your blog has been submitted for approval.");
    } catch (F) {
      B(F instanceof Error ? F.message : "Unable to submit blog.");
    } finally {
      v(!1);
    }
  };
  return /* @__PURE__ */ n("section", { className: `gbcms-widget gbcms-theme-${d} ${c}`.trim(), children: [
    /* @__PURE__ */ e("header", { className: "gbcms-header", children: o || /* @__PURE__ */ n(x, { children: [
      /* @__PURE__ */ n("div", { children: [
        /* @__PURE__ */ e("h1", { children: g }),
        /* @__PURE__ */ e("p", { children: i })
      ] }),
      t && /* @__PURE__ */ e("button", { className: "gbcms-button gbcms-button-primary", type: "button", onClick: () => m({ name: "write" }), children: "Write Blog" })
    ] }) }),
    U && /* @__PURE__ */ e("div", { className: "gbcms-alert gbcms-alert-error", children: U }),
    q && /* @__PURE__ */ e("div", { className: "gbcms-alert gbcms-alert-success", children: q }),
    r.name === "list" && /* @__PURE__ */ n(x, { children: [
      /* @__PURE__ */ n("form", { className: "gbcms-toolbar", onSubmit: z, children: [
        /* @__PURE__ */ e(
          "input",
          {
            value: L,
            onChange: (l) => M(l.target.value),
            placeholder: "Search blogs",
            "aria-label": "Search blogs"
          }
        ),
        /* @__PURE__ */ e("button", { className: "gbcms-button", type: "submit", children: "Search" }),
        E && /* @__PURE__ */ e(
          "button",
          {
            className: "gbcms-button gbcms-button-muted",
            type: "button",
            onClick: () => {
              M(""), T(""), m({ name: "list", page: 1 });
            },
            children: "Clear"
          }
        )
      ] }),
      S ? /* @__PURE__ */ e("div", { className: "gbcms-state", children: "Loading blogs..." }) : A.length === 0 ? /* @__PURE__ */ e("div", { className: "gbcms-state", children: f }) : /* @__PURE__ */ e("div", { className: "gbcms-grid", children: A.map((l) => /* @__PURE__ */ n("article", { className: "gbcms-card", children: [
        l.featuredImage && /* @__PURE__ */ e("img", { className: "gbcms-card-image", src: u.imageUrl(l.featuredImage), alt: l.title, loading: "lazy" }),
        /* @__PURE__ */ n("div", { className: "gbcms-card-body", children: [
          /* @__PURE__ */ n("div", { className: "gbcms-meta", children: [
            /* @__PURE__ */ e("span", { children: l.category }),
            /* @__PURE__ */ e("span", { children: O(l.createdAt) })
          ] }),
          /* @__PURE__ */ e("h2", { children: l.title }),
          /* @__PURE__ */ e("p", { children: K(l.content) }),
          /* @__PURE__ */ e("button", { className: "gbcms-link-button", type: "button", onClick: () => m({ name: "detail", slug: l.slug }), children: "Read more" })
        ] })
      ] }, l._id)) }),
      C > 1 && /* @__PURE__ */ n("nav", { className: "gbcms-pagination", "aria-label": "Blog pagination", children: [
        /* @__PURE__ */ e(
          "button",
          {
            className: "gbcms-button",
            type: "button",
            disabled: r.page <= 1 || S,
            onClick: () => m({ name: "list", page: Math.max(1, r.page - 1) }),
            children: "Previous"
          }
        ),
        /* @__PURE__ */ n("span", { children: [
          "Page ",
          r.page,
          " of ",
          C
        ] }),
        /* @__PURE__ */ e(
          "button",
          {
            className: "gbcms-button",
            type: "button",
            disabled: r.page >= C || S,
            onClick: () => m({ name: "list", page: Math.min(C, r.page + 1) }),
            children: "Next"
          }
        )
      ] })
    ] }),
    r.name === "detail" && /* @__PURE__ */ n("article", { className: "gbcms-detail", children: [
      /* @__PURE__ */ e("button", { className: "gbcms-link-button", type: "button", onClick: () => m({ name: "list", page: 1 }), children: "Back to blogs" }),
      S ? /* @__PURE__ */ e("div", { className: "gbcms-state", children: "Loading blog..." }) : b ? /* @__PURE__ */ n(x, { children: [
        b.featuredImage && /* @__PURE__ */ e("img", { className: "gbcms-detail-image", src: u.imageUrl(b.featuredImage), alt: b.title }),
        /* @__PURE__ */ n("div", { className: "gbcms-meta", children: [
          /* @__PURE__ */ e("span", { children: b.category }),
          /* @__PURE__ */ e("span", { children: O(b.createdAt) }),
          /* @__PURE__ */ n("span", { children: [
            "By ",
            b.authorName
          ] })
        ] }),
        /* @__PURE__ */ e("h1", { children: b.title }),
        /* @__PURE__ */ e("div", { className: "gbcms-tags", children: b.tags.map((l) => /* @__PURE__ */ e("span", { children: l }, l)) }),
        /* @__PURE__ */ e("div", { className: "gbcms-content", children: b.content })
      ] }) : /* @__PURE__ */ e("div", { className: "gbcms-state", children: "Blog not found." })
    ] }),
    r.name === "write" && t && /* @__PURE__ */ n("form", { className: "gbcms-form", onSubmit: G, children: [
      /* @__PURE__ */ n("div", { className: "gbcms-form-heading", children: [
        /* @__PURE__ */ e("button", { className: "gbcms-link-button", type: "button", onClick: () => m({ name: "list", page: 1 }), children: "Back to blogs" }),
        /* @__PURE__ */ e("h2", { children: "Write a Blog" }),
        /* @__PURE__ */ e("p", { children: "Submitted blogs are sent to the website admin for approval before publishing." })
      ] }),
      /* @__PURE__ */ n("label", { children: [
        "Title",
        /* @__PURE__ */ e("input", { name: "title", required: !0, maxLength: 160 })
      ] }),
      /* @__PURE__ */ n("div", { className: "gbcms-form-row", children: [
        /* @__PURE__ */ n("label", { children: [
          "Author name",
          /* @__PURE__ */ e("input", { name: "authorName", required: !0, maxLength: 100 })
        ] }),
        /* @__PURE__ */ n("label", { children: [
          "Author email",
          /* @__PURE__ */ e("input", { name: "authorEmail", required: !0, type: "email", maxLength: 160 })
        ] })
      ] }),
      /* @__PURE__ */ n("label", { children: [
        "Category",
        /* @__PURE__ */ e("input", { name: "category", required: !0, maxLength: 80 })
      ] }),
      /* @__PURE__ */ n("label", { children: [
        "Tags",
        /* @__PURE__ */ e("input", { name: "tags", placeholder: "SEO, Web Design, Marketing" })
      ] }),
      /* @__PURE__ */ n("label", { children: [
        "Featured image",
        /* @__PURE__ */ e("input", { name: "featuredImage", type: "file", accept: "image/jpeg,image/jpg,image/png,image/webp" })
      ] }),
      /* @__PURE__ */ n("label", { children: [
        "Content",
        /* @__PURE__ */ e("textarea", { name: "content", required: !0, rows: 10, minLength: 50 })
      ] }),
      /* @__PURE__ */ e("button", { className: "gbcms-button gbcms-button-primary", type: "submit", disabled: S, children: S ? "Submitting..." : "Submit for Approval" })
    ] })
  ] });
}
export {
  I as BlogApiError,
  re as GlobalBlogCMS,
  Z as createBlogApi,
  _ as normalizeApiUrl
};
