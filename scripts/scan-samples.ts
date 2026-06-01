import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseStructuredJson, parseTextForCrypto } from "../src/lib/parsing/deterministic";
import { mergeGraphSnapshots, calculateRiskScore } from "../src/lib/graph";
import { generateDeterministicRemediations } from "../src/lib/remediation/deterministic";

const SAMPLES_DIR = join(__dirname, "../sample_artifacts");

const SYSTEMS = [
  {
    name: "ApexTransact (Core Financial Clearinghouse)",
    specFile: "scenarios/06-financial-clearing/spec.md",
    jsonFile: "scenarios/06-financial-clearing/inventory.json"
  },
  {
    name: "AeroControl (Autonomous Logistics Drone Telemetry)",
    specFile: "scenarios/07-drone-telemetry/spec.md",
    jsonFile: "scenarios/07-drone-telemetry/inventory.json"
  },
  {
    name: "SecureDesk (Zero-Trust Enterprise Remote Workspace)",
    specFile: "scenarios/08-zerotrust-workspace/spec.md",
    jsonFile: "scenarios/08-zerotrust-workspace/inventory.json"
  },
  {
    name: "GridPower (Smart Grid SCADA & Control Systems)",
    specFile: "scenarios/09-smart-grid-scada/spec.md",
    jsonFile: "scenarios/09-smart-grid-scada/inventory.json"
  },
  {
    name: "HealthSync MD (Multi-Tenant Patient Record Exchange)",
    specFile: "scenarios/10-healthcare-portal/spec.md",
    jsonFile: "scenarios/10-healthcare-portal/inventory.json"
  },
  {
    name: "ApexRTGS Wholesale Settlement & Securities System",
    specFile: "scenarios/11-national-rtgs-settlement/spec.md",
    jsonFile: "scenarios/11-national-rtgs-settlement/inventory.json"
  },
  {
    name: "DuitInstant Retail Real-Time Ingress Engine",
    specFile: "scenarios/12-instant-retail-clearing/spec.md",
    jsonFile: "scenarios/12-instant-retail-clearing/inventory.json"
  },
  {
    name: "DirectPay Web Ingress E-Commerce Gateway",
    specFile: "scenarios/13-direct-bank-gateway/spec.md",
    jsonFile: "scenarios/13-direct-bank-gateway/inventory.json"
  },
  {
    name: "ChequeClear Ingress System (Document Archiving)",
    specFile: "scenarios/14-digital-cheque-exchange/spec.md",
    jsonFile: "scenarios/14-digital-cheque-exchange/inventory.json"
  },
  {
    name: "BillPay B2B Bill Presentment Engine",
    specFile: "scenarios/15-bulk-bill-presentment/spec.md",
    jsonFile: "scenarios/15-bulk-bill-presentment/inventory.json"
  },
  {
    name: "LionEFTPOS Point-of-Sale Acquisition Engine",
    specFile: "scenarios/16-pos-debit-acquisition/spec.md",
    jsonFile: "scenarios/16-pos-debit-acquisition/inventory.json"
  },
  {
    name: "eLionPay Online Gateway E-Commerce",
    specFile: "scenarios/17-online-debit-gateway/spec.md",
    jsonFile: "scenarios/17-online-debit-gateway/inventory.json"
  },
  {
    name: "LionFAST & PayProxy Core Ingress System",
    specFile: "scenarios/18-instant-proxy-clearing/spec.md",
    jsonFile: "scenarios/18-instant-proxy-clearing/inventory.json"
  },
  {
    name: "TransitPay Stored-Value System",
    specFile: "scenarios/19-transit-stored-value/spec.md",
    jsonFile: "scenarios/19-transit-stored-value/inventory.json"
  },
  {
    name: "Automated Clearing House (LionACH Bulk GIRO)",
    specFile: "scenarios/20-bulk-giro-clearing/spec.md",
    jsonFile: "scenarios/20-bulk-giro-clearing/inventory.json"
  }
];

function runScan() {
  console.log("=================================================================================");
  console.log("               AETHER-PQC COMPLIANCE TEST SCANNER (OFFLINE RUNNER)              ");
  console.log("=================================================================================\n");

  for (const system of SYSTEMS) {
    const specPath = join(SAMPLES_DIR, system.specFile);
    const jsonPath = join(SAMPLES_DIR, system.jsonFile);

    let specContent = "";
    let jsonContent = "";

    try {
      specContent = readFileSync(specPath, "utf8");
      jsonContent = readFileSync(jsonPath, "utf8");
    } catch (err: any) {
      console.error(`[-] Error loading files for ${system.name}:`, err.message);
      continue;
    }

    const artifactIdText = `${system.specFile}_artifact`;
    const artifactIdJson = `${system.jsonFile}_artifact`;

    // 1. Parse JSON Inventory
    let jsonSnapshot = parseStructuredJson(jsonContent, artifactIdJson);
    if (!jsonSnapshot) {
      try {
        const parsed = JSON.parse(jsonContent);
        if (parsed && Array.isArray(parsed.nodes)) {
          const nodes = parsed.nodes.map((node: any) => ({
            id: node.id,
            label: node.label || "Application",
            name: node.name,
            vulnerabilityScore: node.vulnerabilityScore ?? 0,
            exposureScore: node.exposureScore ?? 0,
            exposureLevel: node.exposureLevel || "UNKNOWN",
            effectiveRiskScore: node.effectiveRiskScore ?? 0,
            exposureReasons: node.exposureReasons || [],
            confidence: node.confidence ?? 1,
            sourceArtifactIds: [artifactIdJson],
            attributes: node.attributes || {}
          }));
          const edges = (parsed.edges || []).map((edge: any) => ({
            source: edge.source,
            target: edge.target,
            type: edge.type || "DEPENDS_ON",
            confidence: edge.confidence ?? 1,
            sourceArtifactIds: [artifactIdJson]
          }));
          jsonSnapshot = { nodes, edges };
        }
      } catch (err: any) {
        console.error(`[-] Direct fallback parse failed: ${err.message}`);
      }
    }

    // 2. Parse Text Spec
    const textSnapshot = parseTextForCrypto(specContent, artifactIdText);

    if (!jsonSnapshot) {
      console.error(`[-] JSON parsing yielded empty graph for: ${system.name}`);
    }
    if (!textSnapshot) {
      console.error(`[-] Spec text parsing yielded empty graph for: ${system.name}`);
    }

    if (!jsonSnapshot || !textSnapshot) {
      continue;
    }

    // 3. Merge Snapshot Graphs
    const mergedGraph = mergeGraphSnapshots(jsonSnapshot, textSnapshot);

    // 4. Calculate Aggregate Risk Score
    const riskScore = calculateRiskScore(mergedGraph);

    // 5. Generate Remediations
    const remediations = generateDeterministicRemediations(mergedGraph);

    // Render beautiful CLI output
    console.log(`[+] SYSTEM: ${system.name}`);
    console.log(`    Status: SCAN COMPLETED`);
    console.log(`    Aggregate PQC Risk Score: ${riskScore.toFixed(1)} / 10`);

    const cryptoNodes = mergedGraph.nodes.filter(n => n.label === "CryptoAsset");
    console.log(`    Detected Cryptographic Assets: ${cryptoNodes.length}`);
    for (const node of cryptoNodes) {
      const targetString = node.attributes.component ? ` (Component: ${node.attributes.component})` : "";
      console.log(`      - ${node.name}: Vuln ${node.vulnerabilityScore.toFixed(1)}/10, Exposure ${node.exposureScore.toFixed(1)}/10 -> Effective Risk ${node.effectiveRiskScore.toFixed(1)}/10${targetString}`);
    }

    console.log(`    Generated Remediation Plans: ${remediations.length}`);
    for (const rem of remediations) {
      console.log(`      - Priority [${rem.priority}] for Primitive [${rem.vulnerablePrimitive}]`);
      console.log(`        Recommended: ${rem.recommendedMigration}`);
      console.log(`        Residual: ${rem.residualRiskNotes}`);
    }
    console.log("\n---------------------------------------------------------------------------------\n");
  }

  console.log("[*] Scan of all 15 systems successfully complete.");
  console.log("================================================================================");
}

runScan();
