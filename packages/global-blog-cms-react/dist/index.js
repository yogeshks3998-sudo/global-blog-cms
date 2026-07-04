var Q = Object.defineProperty;
var V = (a, r, m) => r in a ? Q(a, r, { enumerable: !0, configurable: !0, writable: !0, value: m }) : a[r] = m;
var x = (a, r, m) => V(a, typeof r != "symbol" ? r + "" : r, m);
import { jsx as e, jsxs as l, Fragment as D } from "react/jsx-runtime";
import { useMemo as _, useState as y, useEffect as q } from "react";
class C extends Error {
  constructor(m, g, b) {
    super(m);
    x(this, "status");
    x(this, "errors");
    this.name = "BlogApiError", this.status = g, this.errors = b;
  }
}
const X = (a) => {
  const r = a.replace(/\/+$/, "");
  return r.endsWith("/api") ? r : `${r}/api`;
}, Z = (a) => {
  var g, b, t;
  const r = new URLSearchParams();
  a.page && r.set("page", String(a.page)), a.limit && r.set("limit", String(a.limit)), (g = a.search) != null && g.trim() && r.set("search", a.search.trim()), (b = a.category) != null && b.trim() && r.set("category", a.category.trim()), (t = a.tag) != null && t.trim() && r.set("tag", a.tag.trim());
  const m = r.toString();
  return m ? `?${m}` : "";
}, K = (a, r) => {
  const m = X(a), g = async (t, o = {}) => {
    var u;
    if (!r)
      throw new C("Missing Global Blog CMS API key.", 401);
    const n = new Headers(o.headers);
    n.set("x-api-key", r), !(o.body instanceof FormData) && !n.has("Content-Type") && n.set("Content-Type", "application/json");
    let N;
    try {
      N = await fetch(`${m}${t}`, {
        ...o,
        headers: n
      });
    } catch (i) {
      throw new C(i instanceof Error ? i.message : "CMS API request failed.", 0);
    }
    const c = await N.json().catch(() => null);
    if (!N.ok || !(c != null && c.success)) {
      const i = (u = c == null ? void 0 : c.errors) == null ? void 0 : u.map((p) => p.message).join(", ");
      throw new C(
        i || (c == null ? void 0 : c.message) || "CMS API request failed.",
        N.status,
        c == null ? void 0 : c.errors
      );
    }
    return c;
  };
  return {
    imageUrl: (t) => {
      if (!t) return "";
      if (/^data:image\//i.test(t) || /^https?:\/\//i.test(t)) return t;
      const o = t.replace(/\\/g, "/").replace(/^\/+/, "");
      return `${m.replace(/\/api$/, "")}/${o}`;
    },
    async getBlogs(t = {}) {
      var n;
      const o = await g(`/blogs${Z(t)}`);
      return {
        blogs: ((n = o.data) == null ? void 0 : n.blogs) || [],
        meta: o.meta
      };
    },
    async getLatestBlogs(t = 5) {
      var n;
      return ((n = (await g(`/blogs/latest?limit=${t}`)).data) == null ? void 0 : n.blogs) || [];
    },
    async getBlog(t) {
      var n;
      const o = await g(`/blogs/${encodeURIComponent(t)}`);
      if (!((n = o.data) != null && n.blog))
        throw new C("Blog not found.", 404);
      return o.data.blog;
    },
    async submitBlog(t) {
      var N, c, u;
      if (!!t.featuredImage) {
        const i = new FormData();
        i.set("title", t.title), i.set("authorName", t.authorName), i.set("authorEmail", t.authorEmail), i.set("category", t.category), i.set("content", t.content), (N = t.tags) != null && N.length && i.set("tags", t.tags.join(",")), t.featuredImage && i.set("featuredImage", t.featuredImage);
        const p = await g("/blogs/submit", {
          method: "POST",
          body: i
        });
        if (!((c = p.data) != null && c.blog)) throw new C("Blog submission response is missing data.", 500);
        return p.data.blog;
      }
      const n = await g("/blogs/submit", {
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
      if (!((u = n.data) != null && u.blog)) throw new C("Blog submission response is missing data.", 500);
      return n.data.blog;
    }
  };
}, O = (a) => new Intl.DateTimeFormat(void 0, {
  year: "numeric",
  month: "short",
  day: "numeric"
}).format(new Date(a)), ee = (a) => a.replace(/\s+/g, " ").trim().slice(0, 180), te = (a) => a.split(",").map((r) => r.trim()).filter(Boolean);
function W({
  src: a,
  alt: r,
  fallback: m,
  className: g,
  placeholderClassName: b
}) {
  const [t, o] = y(!1);
  return !a || t ? /* @__PURE__ */ e("span", { className: b, children: m }) : /* @__PURE__ */ e("img", { className: g, src: a, alt: r, loading: "lazy", onError: () => o(!0) });
}
function le({
  apiUrl: a,
  apiKey: r,
  className: m = "",
  theme: g = "light",
  pageSize: b = 9,
  showSubmitForm: t = !0,
  title: o = "Blogs",
  description: n = "Read the latest published articles or submit your own story for review.",
  emptyMessage: N = "No published blogs are available yet.",
  renderHeader: c
}) {
  const u = _(() => K(a, r), [a, r]), [i, p] = y({ name: "list", page: 1 }), [P, A] = y([]), [f, $] = y(null), [I, j] = y(1), [v, B] = y(!1), [k, F] = y(!1), [w, z] = y(""), [M, S] = y(""), [R, E] = y(""), G = async (s) => {
    var h;
    B(!0), S("");
    try {
      const d = await u.getBlogs({
        page: s,
        limit: b
      });
      A(d.blogs), j(((h = d.meta) == null ? void 0 : h.totalPages) || 1);
    } catch (d) {
      S(d instanceof Error ? d.message : "Unable to load blogs."), A([]), j(1);
    } finally {
      B(!1);
    }
  }, H = async (s) => {
    B(!0), S(""), $(null);
    try {
      $(await u.getBlog(s));
    } catch (h) {
      S(h instanceof Error ? h.message : "Unable to load blog.");
    } finally {
      B(!1);
    }
  };
  q(() => {
    i.name === "list" && G(i.page), i.name === "detail" && H(i.slug);
  }, [i, b, u]), q(() => () => {
    w && URL.revokeObjectURL(w);
  }, [w]);
  const U = (s) => {
    w && URL.revokeObjectURL(w), z(s ? URL.createObjectURL(s) : "");
  }, Y = async (s) => {
    s.preventDefault(), B(!0), S(""), E("");
    const h = s.currentTarget, d = new FormData(h), L = d.get("featuredImage"), J = {
      title: String(d.get("title") || ""),
      authorName: String(d.get("authorName") || ""),
      authorEmail: String(d.get("authorEmail") || ""),
      category: String(d.get("category") || ""),
      content: String(d.get("content") || ""),
      tags: te(String(d.get("tags") || "")),
      featuredImage: L instanceof File && L.size > 0 ? L : null
    };
    try {
      await u.submitBlog(J), h.reset(), U(null), E("Your blog has been submitted for approval."), F(!1);
    } catch (T) {
      S(T instanceof Error ? T.message : "Unable to submit blog.");
    } finally {
      B(!1);
    }
  };
  return /* @__PURE__ */ e("section", { className: `gbcms-widget gbcms-theme-${g} ${m}`.trim(), children: /* @__PURE__ */ l("div", { className: "gbcms-shell", children: [
    /* @__PURE__ */ e("header", { className: "gbcms-header", children: c || /* @__PURE__ */ l("div", { children: [
      /* @__PURE__ */ e("h1", { children: o }),
      /* @__PURE__ */ e("p", { children: n })
    ] }) }),
    M && /* @__PURE__ */ e("div", { className: "gbcms-alert gbcms-alert-error", children: M }),
    R && /* @__PURE__ */ e("div", { className: "gbcms-alert gbcms-alert-success", children: R }),
    i.name === "list" && /* @__PURE__ */ l(D, { children: [
      v ? /* @__PURE__ */ e("div", { className: "gbcms-state", children: "Loading blogs..." }) : P.length === 0 ? /* @__PURE__ */ e("div", { className: "gbcms-state", children: N }) : /* @__PURE__ */ e("div", { className: "gbcms-grid", children: P.map((s) => /* @__PURE__ */ l("article", { className: "gbcms-card", children: [
        /* @__PURE__ */ e("button", { className: "gbcms-card-media", type: "button", onClick: () => p({ name: "detail", slug: s.slug }), children: /* @__PURE__ */ e(
          W,
          {
            src: u.imageUrl(s.featuredImage),
            alt: s.title,
            fallback: s.category.slice(0, 2).toUpperCase(),
            className: "gbcms-card-image",
            placeholderClassName: "gbcms-card-placeholder"
          }
        ) }),
        /* @__PURE__ */ l("div", { className: "gbcms-card-body", children: [
          /* @__PURE__ */ l("div", { className: "gbcms-meta", children: [
            /* @__PURE__ */ e("span", { children: s.category }),
            /* @__PURE__ */ e("span", { children: O(s.createdAt) })
          ] }),
          /* @__PURE__ */ e("h2", { children: s.title }),
          /* @__PURE__ */ e("p", { children: ee(s.content) }),
          /* @__PURE__ */ e("button", { className: "gbcms-read-link", type: "button", onClick: () => p({ name: "detail", slug: s.slug }), children: "Read article" })
        ] })
      ] }, s._id)) }),
      I > 1 && /* @__PURE__ */ l("nav", { className: "gbcms-pagination", "aria-label": "Blog pagination", children: [
        /* @__PURE__ */ e(
          "button",
          {
            className: "gbcms-button",
            type: "button",
            disabled: i.page <= 1 || v,
            onClick: () => p({ name: "list", page: Math.max(1, i.page - 1) }),
            children: "Previous"
          }
        ),
        /* @__PURE__ */ l("span", { children: [
          "Page ",
          i.page,
          " of ",
          I
        ] }),
        /* @__PURE__ */ e(
          "button",
          {
            className: "gbcms-button",
            type: "button",
            disabled: i.page >= I || v,
            onClick: () => p({ name: "list", page: Math.min(I, i.page + 1) }),
            children: "Next"
          }
        )
      ] }),
      t && /* @__PURE__ */ l("section", { className: "gbcms-submit-panel", children: [
        /* @__PURE__ */ l("div", { className: "gbcms-submit-intro", children: [
          /* @__PURE__ */ e("span", { className: "gbcms-eyebrow", children: "Start Writing" }),
          /* @__PURE__ */ e("h2", { children: "Create Content That Makes an Impact" }),
          /* @__PURE__ */ e("p", { children: "Help readers learn, solve problems, and stay informed with well-written, original articles reviewed by our editorial team." })
        ] }),
        /* @__PURE__ */ e(
          "button",
          {
            className: "gbcms-button gbcms-button-primary",
            type: "button",
            onClick: () => {
              F((s) => !s), E("");
            },
            "aria-expanded": k,
            children: k ? "Close Form" : "Write Blog"
          }
        ),
        k && /* @__PURE__ */ l("form", { className: "gbcms-form", onSubmit: Y, children: [
          /* @__PURE__ */ l("div", { className: "gbcms-form-heading", children: [
            /* @__PURE__ */ e("h3", { children: "Blog Details" }),
            /* @__PURE__ */ e("p", { children: "Add a featured image so your article card and detail page look complete." })
          ] }),
          /* @__PURE__ */ l("label", { children: [
            "Title",
            /* @__PURE__ */ e("input", { name: "title", required: !0, maxLength: 160, placeholder: "Enter blog title" })
          ] }),
          /* @__PURE__ */ l("div", { className: "gbcms-form-row", children: [
            /* @__PURE__ */ l("label", { children: [
              "Author name",
              /* @__PURE__ */ e("input", { name: "authorName", required: !0, maxLength: 100, placeholder: "Your name" })
            ] }),
            /* @__PURE__ */ l("label", { children: [
              "Author email",
              /* @__PURE__ */ e("input", { name: "authorEmail", required: !0, type: "email", maxLength: 160, placeholder: "you@example.com" })
            ] })
          ] }),
          /* @__PURE__ */ l("label", { children: [
            "Category",
            /* @__PURE__ */ e("input", { name: "category", required: !0, maxLength: 80, placeholder: "Category" })
          ] }),
          /* @__PURE__ */ l("label", { children: [
            "Tags",
            /* @__PURE__ */ e("input", { name: "tags", placeholder: "SEO, Web Design, Marketing" })
          ] }),
          /* @__PURE__ */ l("label", { children: [
            "Featured image",
            /* @__PURE__ */ l("div", { className: "gbcms-upload", children: [
              /* @__PURE__ */ e("div", { className: "gbcms-upload-preview", children: w ? /* @__PURE__ */ e("img", { src: w, alt: "Selected featured image preview" }) : /* @__PURE__ */ e("span", { children: "16:9 image preview" }) }),
              /* @__PURE__ */ l("div", { className: "gbcms-upload-actions", children: [
                /* @__PURE__ */ e("span", { children: "Upload a clear landscape image. It will be cropped to a uniform 16:9 ratio." }),
                /* @__PURE__ */ l("div", { children: [
                  /* @__PURE__ */ e(
                    "input",
                    {
                      id: "gbcms-featured-image",
                      name: "featuredImage",
                      type: "file",
                      accept: "image/jpeg,image/jpg,image/png,image/webp",
                      onChange: (s) => {
                        var h;
                        return U((h = s.target.files) == null ? void 0 : h[0]);
                      }
                    }
                  ),
                  w && /* @__PURE__ */ e(
                    "button",
                    {
                      className: "gbcms-button gbcms-button-muted",
                      type: "button",
                      onClick: () => {
                        const s = document.getElementById("gbcms-featured-image");
                        s && (s.value = ""), U(null);
                      },
                      children: "Remove"
                    }
                  )
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ l("label", { children: [
            "Content",
            /* @__PURE__ */ e("textarea", { name: "content", required: !0, rows: 10, minLength: 50, placeholder: "Write your blog content here..." })
          ] }),
          /* @__PURE__ */ e("button", { className: "gbcms-button gbcms-button-primary", type: "submit", disabled: v, children: v ? "Submitting..." : "Submit for Approval" })
        ] })
      ] })
    ] }),
    i.name === "detail" && /* @__PURE__ */ l("article", { className: "gbcms-detail", children: [
      /* @__PURE__ */ e("button", { className: "gbcms-read-link", type: "button", onClick: () => p({ name: "list", page: 1 }), children: "Back to blogs" }),
      v ? /* @__PURE__ */ e("div", { className: "gbcms-state", children: "Loading blog..." }) : f ? /* @__PURE__ */ l(D, { children: [
        /* @__PURE__ */ l("div", { className: "gbcms-detail-hero", children: [
          /* @__PURE__ */ e(
            W,
            {
              src: u.imageUrl(f.featuredImage),
              alt: f.title,
              fallback: f.category.slice(0, 2).toUpperCase(),
              className: "gbcms-detail-image",
              placeholderClassName: "gbcms-detail-placeholder"
            }
          ),
          /* @__PURE__ */ l("div", { className: "gbcms-detail-heading", children: [
            /* @__PURE__ */ l("div", { className: "gbcms-meta", children: [
              /* @__PURE__ */ e("span", { children: f.category }),
              /* @__PURE__ */ e("span", { children: O(f.createdAt) }),
              /* @__PURE__ */ l("span", { children: [
                "By ",
                f.authorName
              ] })
            ] }),
            /* @__PURE__ */ e("h1", { children: f.title })
          ] })
        ] }),
        /* @__PURE__ */ e("div", { className: "gbcms-tags", children: f.tags.map((s) => /* @__PURE__ */ e("span", { children: s }, s)) }),
        /* @__PURE__ */ e("div", { className: "gbcms-content", children: f.content })
      ] }) : /* @__PURE__ */ e("div", { className: "gbcms-state", children: "Blog not found." })
    ] })
  ] }) });
}
export {
  C as BlogApiError,
  le as GlobalBlogCMS,
  K as createBlogApi,
  X as normalizeApiUrl
};
