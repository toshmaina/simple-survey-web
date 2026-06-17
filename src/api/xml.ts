import { XMLParser } from "fast-xml-parser";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
  isArray: (name) =>
    ["survey", "question", "option", "question_response", "certificate"].includes(name),
});

export function parseXml<T = unknown>(xml: string): T {
  return parser.parse(xml) as T;
}

// Build minimal XML strings for POST/PUT bodies
export function buildSurveyXml(data: { name: string; description: string }): string {
  return `<survey>\n  <name>${esc(data.name)}</name>\n  <description>${esc(data.description)}</description>\n</survey>`;
}

export function buildQuestionXml(q: {
  name: string;
  type: string;
  required: boolean;
  text: string;
  description?: string;
  options?: { multiple: boolean; items: Array<{ value: string; label: string }> };
  fileProperties?: {
    format: string;
    maxFileSize: number;
    maxFileSizeUnit: string;
    multiple: boolean;
  };
}): string {
  const req = q.required ? "yes" : "no";
  let inner = `  <text>${esc(q.text)}</text>\n`;
  if (q.description) inner += `  <description>${esc(q.description)}</description>\n`;

  if (q.options) {
    const multiple = q.options.multiple ? "yes" : "no";
    inner += `  <options multiple="${multiple}">\n`;
    for (const opt of q.options.items) {
      inner += `    <option value="${esc(opt.value)}">${esc(opt.label)}</option>\n`;
    }
    inner += `  </options>\n`;
  }

  if (q.fileProperties) {
    const fp = q.fileProperties;
    inner += `  <file_properties format="${esc(fp.format)}" max_file_size="${fp.maxFileSize}" max_file_size_unit="${esc(fp.maxFileSizeUnit)}" multiple="${fp.multiple ? "yes" : "no"}"/>\n`;
  }

  return `<question name="${esc(q.name)}" type="${esc(q.type)}" required="${req}">\n${inner}</question>`;
}

function esc(s: string | undefined): string {
  if (!s) return "";
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
