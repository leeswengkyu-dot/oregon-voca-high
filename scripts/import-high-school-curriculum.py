from __future__ import annotations

import csv
import json
import re
import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

NS = {
    "m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
}


def column_number(cell_ref: str) -> int:
    result = 0
    for char in re.match(r"[A-Z]+", cell_ref).group(0):
        result = result * 26 + ord(char) - 64
    return result


def read_xlsx(path: Path) -> dict[str, list[tuple[str, str]]]:
    with zipfile.ZipFile(path) as archive:
        shared: list[str] = []
        if "xl/sharedStrings.xml" in archive.namelist():
            root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
            shared = ["".join(t.text or "" for t in item.findall(".//m:t", NS)) for item in root.findall("m:si", NS)]
        workbook = ET.fromstring(archive.read("xl/workbook.xml"))
        relationships = ET.fromstring(archive.read("xl/_rels/workbook.xml.rels"))
        targets = {item.attrib["Id"]: item.attrib["Target"] for item in relationships}

        def value(cell: ET.Element):
            kind = cell.attrib.get("t")
            if kind == "inlineStr":
                return "".join(t.text or "" for t in cell.findall(".//m:t", NS))
            raw = cell.find("m:v", NS)
            if raw is None:
                return None
            return shared[int(raw.text)] if kind == "s" else raw.text

        result: dict[str, list[tuple[str, str]]] = {}
        for sheet in workbook.find("m:sheets", NS):
            name = sheet.attrib["name"]
            match = re.fullmatch(r"고([123])_300개", name)
            if not match:
                continue
            target = targets[sheet.attrib[f"{{{NS['r']}}}id"]].lstrip("/")
            target = target if target.startswith("xl/") else f"xl/{target}"
            root = ET.fromstring(archive.read(target))
            rows: list[tuple[str, str]] = []
            for xml_row in root.findall(".//m:sheetData/m:row", NS)[1:]:
                cells = {column_number(cell.attrib["r"]): value(cell) for cell in xml_row.findall("m:c", NS)}
                word = str(cells.get(2) or "").strip()
                meaning = str(cells.get(3) or "").strip()
                if word and meaning:
                    rows.append((word, meaning))
            if len(rows) != 300:
                raise ValueError(f"{name}: expected 300 words, got {len(rows)}")
            result[f"grade{match.group(1)}"] = rows
        return result


def read_prep(path: Path) -> list[tuple[str, str]]:
    with path.open(encoding="utf-8", newline="") as handle:
        rows = [(row["word"].strip(), row["meaning"].strip()) for row in csv.DictReader(handle, delimiter="\t")]
    if len(rows) != 200:
        raise ValueError(f"prep: expected 200 words, got {len(rows)}")
    return rows


def unitize(stage: str, rows: list[tuple[str, str]]) -> list[dict]:
    units = []
    for offset in range(0, len(rows), 20):
        number = offset // 20 + 1
        units.append(
            {
                "id": f"{stage}-{number:02d}",
                "stage": stage,
                "name": f"{number:02d}단원",
                "en": f"Unit {number:02d}",
                "icon": "📘" if stage == "prep" else "📗",
                "rows": rows[offset : offset + 20],
            }
        )
    return units


def main() -> None:
    if len(sys.argv) != 4:
        raise SystemExit("usage: import-high-school-curriculum.py PREP_TSV WORKBOOK OUTPUT_JS")
    prep_path, workbook_path, output_path = map(Path, sys.argv[1:])
    grades = read_xlsx(workbook_path)
    data = unitize("prep", read_prep(prep_path))
    for stage in ("grade1", "grade2", "grade3"):
        data.extend(unitize(stage, grades[stage]))
    words = [word.lower() for unit in data for word, _ in unit["rows"]]
    if len(data) != 55 or len(words) != 1100:
        raise ValueError("curriculum totals do not match 55 units / 1100 entries")
    for stage in ("prep", "grade1", "grade2", "grade3"):
        stage_words = [word.lower() for unit in data if unit["stage"] == stage for word, _ in unit["rows"]]
        if len(stage_words) != len(set(stage_words)):
            raise ValueError(f"duplicate word inside {stage}")
    encoded = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    output_path.write_text(
        "// Generated from the approved prep-high1 list and the 2024-2026 mock-exam workbook.\n"
        f"export const CURRICULUM = {encoded};\n",
        encoding="utf-8",
    )
    print(f"wrote {output_path}: {len(data)} units, {len(words)} entries, {len(set(words))} distinct spellings")


if __name__ == "__main__":
    main()
