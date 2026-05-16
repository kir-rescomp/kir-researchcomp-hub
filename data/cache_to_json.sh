LMOD_SPIDER_CACHE_DIRS=/apps/kir/eb/hpc-utils/lmod_cache \
  $LMOD_DIR/spider -o jsonSoftwarePage $MODULEPATH 2>/dev/null \
  | python3 generate_module_index.py > /tmp/modules.json

# Sanity checks
python3 - <<'EOF'
import json
d = json.load(open("/tmp/modules.json"))
print(f"Packages : {d['n_packages']}")
print(f"Versions : {d['n_versions']}")
print(f"Eras     : {d['eras']}")
print()
# Show first 3 entries summary
for m in d["modules"][:3]:
    vers = [v["version"] for v in m["versions"]]
    print(f"  {m['name']:30s} {m['n_versions']} versions  eras={m['eras']}")
    print(f"    {vers[:4]}{'...' if len(vers)>4 else ''}")
EOF
