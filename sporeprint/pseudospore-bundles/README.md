# pseudoSpore Data Braid Bundles

Downloadable sample archives for data braids in the [Data Library](https://primals.eco/data/).

## What's In a Bundle

```
pseudospore-<dataset>/
├── data/                         # Sample data files
│   └── (representative slice)
├── provenance/                   # Full provenance chain
│   ├── provenance.json           # Master metadata (schema v1)
│   ├── blake3_checksums.txt      # BLAKE3 hashes of every data file
│   ├── cas_manifest.json         # nestGate CAS object IDs
│   ├── dag_proof.json            # rhizoCrypt DAG lineage
│   ├── spine_entry.json          # loamSpine ledger entry
│   ├── ed25519_signature.json    # bearDog cryptographic signature
│   └── attribution_braid.json   # sweetGrass W3C PROV-O braid
├── validate.sh                   # Run this to verify everything
└── README.md                     # What this is, where it came from
```

## How to Verify

```bash
tar xzf pseudospore-chembl37-sample.tar.gz
cd pseudospore-chembl37-sample/
./validate.sh
```

## Generating Bundles (westGate operator)

1. Select representative sample files from the full dataset on ZFS
2. Copy `provenance_template.json` to `provenance/provenance.json` and fill fields
3. Generate `blake3_checksums.txt`: `b3sum data/* > provenance/blake3_checksums.txt`
4. Export CAS, DAG, spine, signature, and braid data from NUCLEUS composition
5. Copy `validate.sh` into the bundle root
6. Package: `tar czf pseudospore-<id>-sample.tar.gz pseudospore-<id>/`
7. Upload to depot.primals.eco for download

## Available Bundles

| Bundle | Dataset | Sample Size | Full Size |
|--------|---------|-------------|-----------|
| `pseudospore-pdb-sample` | PDB structures | ~10 structures | 88 GB |
| `pseudospore-chembl37-sample` | ChEMBL 37 | ~1000 compounds | 15 GB |
| `pseudospore-lincs-sample` | LINCS L1000 | metadata + L5 slice | 20 GB |
| `pseudospore-ltee-rel606` | LTEE REL606 | Full (5.8 MB) | 5.8 MB |
| `pseudospore-ame2020` | AME2020 nuclear masses | Full (1.2 MB) | 1.2 MB |

Small datasets (LTEE REL606, AME2020) are bundled in full.
Large datasets include representative samples with the complete provenance chain.
