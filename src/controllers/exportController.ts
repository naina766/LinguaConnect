import { Request, Response } from "express";
import { Parser } from "json2csv";

function flattenObject(obj: any, prefix = ""): any {
  let result: any = {};

  for (const key in obj) {
    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, newKey));
    } else {
      result[newKey] = Array.isArray(value) ? value.join("|") : value;
    }
  }

  return result;
}

export const exportCsv = (req: Request, res: Response) => {
  try {
    const data = req.body.data;

    if (!data || !Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ error: "No data provided" });
    }

    // 🔥 Flatten rows manually
    const flattenedData = data.map((row: any) => flattenObject(row));

    const fields = Object.keys(flattenedData[0]);

    const parser = new Parser({ fields }); // ✔ No flatten/unwind here
    const csv = parser.parse(flattenedData);

    res.header("Content-Type", "text/csv");
    res.attachment("export.csv");

    return res.send(csv);
  } catch (err) {
    console.error("CSV Export Error:", err);
    res.status(500).json({ error: "Could not export CSV" });
  }
};
