import { describe, expect, it } from "vitest";
import { saintsSeed } from "./1962/saintsSeed";
import { buildNovusOrdoTable } from "./novusOrdo/table";
import { findPatronage, PATRONAGES } from "./patronage";

describe("PATRONAGES", () => {
  it("only lists names that one of the calendars actually produces", () => {
    // Matching is exact, so a typo here would silently never show a footnote.
    // Several years so that memorials displaced by a Sunday in one year still appear.
    const knownNames = new Set([
      ...saintsSeed.map((entry) => entry.celebration.name),
      ...Object.values(buildNovusOrdoTable(2024, 2030)).map((day) => day.name),
    ]);
    const unknown = PATRONAGES.flatMap((entry) => entry.names).filter((name) => !knownNames.has(name));
    expect(unknown).toEqual([]);
  });
});

describe("findPatronage", () => {
  it("finds patronage for a 1962-style exact name", () => {
    expect(findPatronage("St. Anthony of Padua")).toBe("Lost articles and things");
  });

  it("finds patronage for a Novus-Ordo-style exact name", () => {
    expect(findPatronage("Saint Anthony of Padua, Priest and Doctor")).toBe("Lost articles and things");
  });

  it("returns undefined for a name with no curated patronage", () => {
    expect(findPatronage("St. Prisca")).toBeUndefined();
  });

  it("does not match on partial/prefix overlap (St. Lawrence vs St. Lawrence Justinian)", () => {
    expect(findPatronage("St. Lawrence Justinian")).toBeUndefined();
    expect(findPatronage("St. Lawrence")).toBe("Cooks and comedians");
  });

  it("does not match the ambiguous 1962 St. Boniface (two different people share the name)", () => {
    expect(findPatronage("St. Boniface")).toBeUndefined();
  });

  it("does match the unambiguous Novus Ordo St. Boniface", () => {
    expect(findPatronage("Saint Boniface, Bishop and Martyr")).toBe("Germany");
  });

  it("names which saint is the patron when a celebration combines two saints", () => {
    expect(findPatronage("St. George")).toBe("England and soldiers");
    expect(findPatronage("Saint George, Martyr/Saint Adalbert, Bishop and Martyr")).toBe("England and soldiers (St. George)");
    expect(findPatronage("Sts. Simon & Jude")).toBe("Desperate and lost causes (St. Jude)");
  });

  it("does not cross-match different Nicholases", () => {
    expect(findPatronage("St. Nicholas")).toBe("Children and sailors");
    expect(findPatronage("St. Nicholas of Tolentino")).toBeUndefined();
  });
});
