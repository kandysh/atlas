import { generateTaskDisplayId, parseTaskDisplayId, isValidTaskDisplayId } from "../task-id-generator";

describe("Task ID Generator", () => {
  describe("generateTaskDisplayId", () => {
    it("should generate correct format for single digit workspace", () => {
      expect(generateTaskDisplayId(1, 1)).toBe("TSK-001-0001");
      expect(generateTaskDisplayId(1, 25)).toBe("TSK-001-0025");
      expect(generateTaskDisplayId(1, 9999)).toBe("TSK-001-9999");
    });

    it("should generate correct format for double digit workspace", () => {
      expect(generateTaskDisplayId(42, 1)).toBe("TSK-042-0001");
      expect(generateTaskDisplayId(42, 123)).toBe("TSK-042-0123");
    });

    it("should generate correct format for triple digit workspace", () => {
      expect(generateTaskDisplayId(123, 1)).toBe("TSK-123-0001");
      expect(generateTaskDisplayId(999, 5678)).toBe("TSK-999-5678");
    });

    it("should pad workspace id to 3 digits", () => {
      expect(generateTaskDisplayId(1, 1)).toContain("-001-");
      expect(generateTaskDisplayId(12, 1)).toContain("-012-");
      expect(generateTaskDisplayId(123, 1)).toContain("-123-");
    });

    it("should pad sequence to 4 digits", () => {
      expect(generateTaskDisplayId(1, 1)).toContain("-0001");
      expect(generateTaskDisplayId(1, 12)).toContain("-0012");
      expect(generateTaskDisplayId(1, 123)).toContain("-0123");
      expect(generateTaskDisplayId(1, 1234)).toContain("-1234");
    });
  });

  describe("parseTaskDisplayId", () => {
    it("should parse valid display IDs", () => {
      expect(parseTaskDisplayId("TSK-001-0001")).toEqual({
        workspaceNumericId: 1,
        sequenceNumber: 1,
      });

      expect(parseTaskDisplayId("TSK-042-0123")).toEqual({
        workspaceNumericId: 42,
        sequenceNumber: 123,
      });

      expect(parseTaskDisplayId("TSK-123-9999")).toEqual({
        workspaceNumericId: 123,
        sequenceNumber: 9999,
      });
    });

    it("should return null for invalid formats", () => {
      expect(parseTaskDisplayId("TSK-1-0001")).toBeNull();
      expect(parseTaskDisplayId("TSK-001-1")).toBeNull();
      expect(parseTaskDisplayId("TASK-001-0001")).toBeNull();
      expect(parseTaskDisplayId("001-0001")).toBeNull();
      expect(parseTaskDisplayId("")).toBeNull();
      expect(parseTaskDisplayId("TSK-ABC-0001")).toBeNull();
    });
  });

  describe("isValidTaskDisplayId", () => {
    it("should return true for valid IDs", () => {
      expect(isValidTaskDisplayId("TSK-001-0001")).toBe(true);
      expect(isValidTaskDisplayId("TSK-042-0123")).toBe(true);
      expect(isValidTaskDisplayId("TSK-999-9999")).toBe(true);
    });

    it("should return false for invalid IDs", () => {
      expect(isValidTaskDisplayId("TSK-1-0001")).toBe(false);
      expect(isValidTaskDisplayId("TSK-001-1")).toBe(false);
      expect(isValidTaskDisplayId("invalid")).toBe(false);
      expect(isValidTaskDisplayId("")).toBe(false);
    });
  });

  describe("round trip", () => {
    it("should generate and parse correctly", () => {
      const generated = generateTaskDisplayId(42, 123);
      const parsed = parseTaskDisplayId(generated);
      
      expect(parsed).toEqual({
        workspaceNumericId: 42,
        sequenceNumber: 123,
      });
    });
  });
});
