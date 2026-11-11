// node --test test/
import test from "node:test";
import assert from "node:assert/strict";
import { sanitizeEvent, publishProblems, cleanMediaName, isMediaName, nextFreeName, slugify } from "../lib/event-validate.mjs";
import { CONTENT_FIELDS } from "../lib/event-fields.mjs";

const fields = (r) => r.errors.map((e) => e.field);

test("a minimal event is valid and gets every content field", () => {
  const r = sanitizeEvent({ title: "  Spring meetup  " });
  assert.deepEqual(r.errors, []);
  assert.deepEqual(Object.keys(r.event).sort(), [...CONTENT_FIELDS].sort());
  assert.equal(r.event.title, "Spring meetup");
  assert.equal(r.event.kind, "next");
  assert.deepEqual(r.event.agenda, []);
  assert.equal(r.event.sort_order, 0);
  assert.equal(r.event.kicker, null);
});

test("unknown fields are rejected, read-only ones ignored", () => {
  const r = sanitizeEvent({ title: "x", is_admin: true, id: "abc", published: { x: 1 }, updated_at: "t", status: "draft" });
  assert.deepEqual(fields(r), ["is_admin"]);
  assert.equal("published" in r.event, false);
});

test("non-object input", () => {
  for (const v of [null, "x", [], 3]) assert.equal(sanitizeEvent(v).errors.length, 1);
});

test("types and formats", () => {
  const r = sanitizeEvent({
    title: 5, slug: "Bad Slug", kind: "soon", event_date: "2026-02-30", sort_order: 1.5,
    agenda: "x", themes: [1], image: "../etc/passwd", video: "clip.jpg", card_image: "a.png",
  });
  assert.deepEqual(fields(r).sort(), ["agenda", "event_date", "image", "kind", "slug", "sort_order", "themes.0", "title", "video"].sort());
});

test("slug is lowercased; valid date passes", () => {
  const r = sanitizeEvent({ title: "x", slug: "Spring-2027", event_date: "2027-04-01" });
  assert.deepEqual(r.errors, []);
  assert.equal(r.event.slug, "spring-2027");
});

test("length limits", () => {
  assert.deepEqual(fields(sanitizeEvent({ title: "x".repeat(201) })), ["title"]);
  assert.deepEqual(fields(sanitizeEvent({ title: "x", overview_md: "x".repeat(50001) })), ["overview_md"]);
  assert.deepEqual(fields(sanitizeEvent({ title: "x", themes: Array(61).fill("t") })), ["themes"]);
});

test("rows: blank rows dropped, unknown row keys rejected, markdown kept verbatim", () => {
  const r = sanitizeEvent({
    title: "x",
    agenda: [{ start: "16:00", end: "", label: "Welcome" }, { start: " ", end: "", label: "" }],
    speakers: [{ name: "A", role: "B", email: "x@y" }],
    themes: ["  one ", "", "two"],
    downloads: [{ label: "Slides", file: "slides.pdf" }, { label: "Notes" }],
    overview_md: "  Para one\r\n\r\n- item\n",
  });
  assert.deepEqual(fields(r), ["speakers.0.email"]);
  assert.deepEqual(r.event.agenda, [{ start: "16:00", end: "", label: "Welcome" }]);
  assert.deepEqual(r.event.themes, ["one", "two"]);
  assert.deepEqual(r.event.downloads, [{ label: "Slides", file: "slides.pdf" }, { label: "Notes" }]);
  assert.equal(r.event.overview_md, "  Para one\n\n- item\n");
});

test("whitespace-only markdown becomes null", () => {
  assert.equal(sanitizeEvent({ title: "x", writeup_md: " \n " }).event.writeup_md, null);
});

test("publish needs title, slug, a date, alt text and complete rows", () => {
  const { event } = sanitizeEvent({
    title: "x", image: "hero.jpg",
    agenda: [{ start: "", end: "", label: "Drinks" }],
    speakers: [{ name: "", role: "Host" }],
    downloads: [{ label: "", file: "a.pdf" }],
    writeup_md: "![](photo.jpg)\n\n![Panel](<panel shot.jpg> \"cap\")\n\n![x](javascript:alert(1))",
  });
  const p = publishProblems(event).map((e) => e.field);
  assert.deepEqual(p, ["slug", "event_date", "image_alt", "agenda.0.start", "speakers.0.name", "downloads.0.label", "writeup_md", "writeup_md"]);
});

test("a complete event has no publish problems; date_label alone is enough", () => {
  const { event } = sanitizeEvent({ title: "x", slug: "x", date_label: "TBC", image: "a.jpg", image_alt: "A room", overview_md: "![Room](<a b.jpg>)" });
  assert.deepEqual(publishProblems(event), []);
});

test("cleanMediaName", () => {
  assert.equal(cleanMediaName("C:\\Users\\me\\Panel Photo (1).JPG"), "Panel Photo (1).jpg");
  assert.equal(cleanMediaName("../../etc/hero.png"), "hero.png");
  assert.equal(cleanMediaName("café <b>&<b> drinks.webp"), "cafe -b-b- drinks.webp");
  assert.equal(cleanMediaName("newco round one_image.jpg"), "newco round one_image.jpg");
  assert.equal(cleanMediaName("...jpg"), "file.jpg");
  assert.equal(cleanMediaName(".png"), "file.png");
  assert.equal(cleanMediaName("script.js"), null);
  assert.equal(cleanMediaName("noext"), null);
  assert.equal(cleanMediaName("x.svg"), null);
  assert.equal(cleanMediaName("☃.pdf"), "file.pdf");
  assert.ok(!/[<>\n/]/.test(cleanMediaName("a<b>\n/c.jpg")));
});

test("isMediaName / nextFreeName / slugify", () => {
  assert.ok(isMediaName("whiteboard-1200.jpg"));
  assert.ok(!isMediaName("https://x.com/a.jpg"));
  assert.ok(!isMediaName("a/b.jpg"));
  assert.equal(nextFreeName("a.jpg", new Set(["a.jpg", "a-2.jpg"])), "a-3.jpg");
  assert.equal(nextFreeName("b.jpg", new Set(["a.jpg"])), "b.jpg");
  assert.equal(slugify("So you think you want a NewCo?"), "so-you-think-you-want-a-newco");
  assert.equal(slugify("R&D — Café night"), "r-and-d-cafe-night");
  assert.equal(slugify("!!!"), "");
});
