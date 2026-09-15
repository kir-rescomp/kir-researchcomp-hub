#!/usr/bin/env python3
"""
generate_module_index.py

Reads jsonSoftwarePage output from stdin, emits clean modules.json to stdout.

Usage:
  LMOD_SPIDER_CACHE_DIRS=... $LMOD_DIR/libexec/spider -o jsonSoftwarePage $MODULEPATH \
    | python3 generate_module_index.py > data/modules.json
"""
import json
import re
import sys
from datetime import datetime, timezone


TOOLCHAIN_RE = re.compile(r'/eb/([^/]+)/')


def extract_toolchain_era(path: str) -> str:
    """
    Extract the toolchain era from the module path.
    e.g. /apps/eb/2022b/skylake/... -> '2022b'
         /apps/eb/el8/2023a/...     -> '2023a'
         /apps/eb/skylake/...       -> 'legacy'
    """
    match = TOOLCHAIN_RE.search(path)
    if not match:
        return "unknown"
    segment = match.group(1)
    # If the segment looks like a toolchain year (2022b, 2023a etc.) use it
    if re.fullmatch(r'\d{4}[ab]', segment):
        return segment
    # Otherwise check the next path component for a year
    deeper = re.search(r'/eb/[^/]+/([^/]+)/', path)
    if deeper and re.fullmatch(r'\d{4}[ab]', deeper.group(1)):
        return deeper.group(1)
    return "legacy"


def clean_help(help_text: str) -> str:
    """Strip the boilerplate Lmod wraps around help text, return first sentence."""
    if not help_text:
        return ""
    # Remove the Description/More information sections, keep just the first line of real text
    lines = [l.strip() for l in help_text.splitlines() if l.strip()]
    # Drop lines that are just headers or URLs
    skip = {"Description", "More information", "===========", "================"}
    lines = [l for l in lines if l not in skip and not l.startswith("- Homepage")]
    return lines[0] if lines else ""


def process(raw: list) -> dict:
    modules = []

    for entry in raw:
        package      = entry.get("package", "")
        description  = entry.get("description", "").strip()
        url          = entry.get("url", "").strip()
        default_ver  = entry.get("defaultVersionName", "")
        versions_raw = entry.get("versions", [])

        # Collect all versions, sorted by versionName
        versions = []
        eras = set()
        for v in versions_raw:
            ver_name = v.get("versionName", "")
            path     = v.get("path", "")
            era      = extract_toolchain_era(path)
            eras.add(era)
            versions.append({
                "version":   ver_name,
                "full":      v.get("full", f"{package}/{ver_name}"),
                "default":   v.get("markedDefault", False) or ver_name == default_ver,
                "era":       era,
                "path":      path,
            })

        # Use the description from the most specific version if top-level is empty
        if not description and versions_raw:
            description = versions_raw[0].get("description", "").strip()

        modules.append({
            "name":        package,
            "description": description,
            "url":         url,
            "default":     default_ver,
            "eras":        sorted(eras),           # e.g. ["2022b", "2023a"]
            "versions":    versions,
            "n_versions":  len(versions),
        })

    # Sort alphabetically, case-insensitive
    modules.sort(key=lambda m: m["name"].lower())

    # Build a flat list for simpler frontend consumption
    # (one row per package, all versions as a list)
    all_eras = sorted({era for m in modules for era in m["eras"]})

    return {
        "generated":  datetime.now(timezone.utc).isoformat(),
        "n_packages": len(modules),
        "n_versions": sum(m["n_versions"] for m in modules),
        "eras":       all_eras,
        "modules":    modules,
    }


def main():
    raw = json.load(sys.stdin)
    output = process(raw)
    json.dump(output, sys.stdout, indent=2)
    sys.stdout.write("\n")


if __name__ == "__main__":
    main()
