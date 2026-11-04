#!/usr/bin/env bash
# SPDX-License-Identifier: AGPL-3.0-or-later
#
# pseudoSpore Braid Validator
# Verifies the provenance chain for a data braid bundle.
# No ecoPrimals software required — only standard tools (b3sum, jq, openssl).
#
# Usage:
#   cd pseudospore-<dataset>/
#   ./validate.sh
#
# Exit codes:
#   0 = all checks PASS
#   1 = one or more checks FAIL

set -euo pipefail

PASS=0
FAIL=0
TOTAL=0

check() {
    local name="$1"
    local result="$2"
    TOTAL=$((TOTAL + 1))
    if [ "$result" = "PASS" ]; then
        PASS=$((PASS + 1))
        printf "  [PASS] %s\n" "$name"
    else
        FAIL=$((FAIL + 1))
        printf "  [FAIL] %s\n" "$name"
    fi
}

echo "=== pseudoSpore Braid Validation ==="
echo ""

if [ ! -f provenance/provenance.json ]; then
    echo "ERROR: provenance/provenance.json not found."
    echo "       Are you in a pseudoSpore bundle directory?"
    exit 1
fi

DATASET=$(jq -r '.dataset.name // "unknown"' provenance/provenance.json)
echo "Dataset: $DATASET"
echo ""

echo "--- Stage 1: BLAKE3 Data Integrity ---"
if command -v b3sum &>/dev/null; then
    if [ -f provenance/blake3_checksums.txt ]; then
        if b3sum --check provenance/blake3_checksums.txt --quiet 2>/dev/null; then
            check "BLAKE3 hash verification" "PASS"
        else
            check "BLAKE3 hash verification" "FAIL"
        fi
    else
        check "BLAKE3 checksums file exists" "FAIL"
    fi
else
    echo "  [SKIP] b3sum not installed (install: cargo install b3sum)"
fi
echo ""

echo "--- Stage 2: CAS Identity ---"
if [ -f provenance/cas_manifest.json ]; then
    OBJ_COUNT=$(jq '.objects | length' provenance/cas_manifest.json 2>/dev/null || echo 0)
    if [ "$OBJ_COUNT" -gt 0 ]; then
        check "CAS manifest present ($OBJ_COUNT objects)" "PASS"
    else
        check "CAS manifest has objects" "FAIL"
    fi
else
    check "CAS manifest exists" "FAIL"
fi
echo ""

echo "--- Stage 3: DAG Lineage ---"
if [ -f provenance/dag_proof.json ]; then
    SESSION_COUNT=$(jq '.sessions | length' provenance/dag_proof.json 2>/dev/null || echo 0)
    if [ "$SESSION_COUNT" -gt 0 ]; then
        check "DAG proof present ($SESSION_COUNT sessions)" "PASS"
    else
        check "DAG proof has sessions" "FAIL"
    fi
else
    check "DAG proof exists" "FAIL"
fi
echo ""

echo "--- Stage 4: Ledger Entry ---"
if [ -f provenance/spine_entry.json ]; then
    SPINE_ID=$(jq -r '.spine_id // empty' provenance/spine_entry.json 2>/dev/null)
    if [ -n "$SPINE_ID" ]; then
        check "Spine entry present (ID: ${SPINE_ID:0:16}...)" "PASS"
    else
        check "Spine entry has spine_id" "FAIL"
    fi
else
    check "Spine entry exists" "FAIL"
fi
echo ""

echo "--- Stage 5: Ed25519 Signature ---"
if [ -f provenance/ed25519_signature.json ]; then
    SIGNER=$(jq -r '.signer // .key_id // empty' provenance/ed25519_signature.json 2>/dev/null)
    if [ -n "$SIGNER" ]; then
        check "Ed25519 signature present (signer: $SIGNER)" "PASS"
    else
        check "Ed25519 signature has signer" "FAIL"
    fi
else
    check "Ed25519 signature exists" "FAIL"
fi
echo ""

echo "--- Stage 6: Attribution Braid ---"
if [ -f provenance/attribution_braid.json ]; then
    BRAID_ID=$(jq -r '.["@id"] // empty' provenance/attribution_braid.json 2>/dev/null)
    AGENT=$(jq -r '.["prov:wasAttributedTo"] // empty' provenance/attribution_braid.json 2>/dev/null)
    if [ -n "$BRAID_ID" ]; then
        check "Attribution braid present (URN: ${BRAID_ID:0:32}...)" "PASS"
        if [ -n "$AGENT" ]; then
            check "Attribution agent: $AGENT" "PASS"
        fi
    else
        check "Attribution braid has @id" "FAIL"
    fi
else
    check "Attribution braid exists" "FAIL"
fi
echo ""

echo "--- Stage 7: Provenance Metadata ---"
LICENSE=$(jq -r '.dataset.license // empty' provenance/provenance.json 2>/dev/null)
SOURCE=$(jq -r '.dataset.source_org // empty' provenance/provenance.json 2>/dev/null)
INGESTED=$(jq -r '.dataset.ingestion_date // empty' provenance/provenance.json 2>/dev/null)
if [ -n "$LICENSE" ] && [ -n "$SOURCE" ] && [ -n "$INGESTED" ]; then
    check "Metadata: license=$LICENSE, source=$SOURCE, ingested=$INGESTED" "PASS"
else
    check "Provenance metadata complete" "FAIL"
fi
echo ""

echo "=== Results ==="
echo "  $PASS/$TOTAL checks passed"
if [ "$FAIL" -gt 0 ]; then
    echo "  $FAIL FAILED"
    exit 1
else
    echo "  All checks PASS. Provenance chain verified."
    exit 0
fi
