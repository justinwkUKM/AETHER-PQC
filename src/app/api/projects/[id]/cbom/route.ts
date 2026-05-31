import { NextRequest, NextResponse } from "next/server";
import { getApiUser } from "@/server/auth/api";
import { prisma } from "@/lib/db";
import type { GraphSnapshot } from "@/types/graph";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getApiUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const project = await prisma.project.findFirst({
    where: { id, userId: user.id }
  });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Extract merged threat graph from project
  const graph = (project.graphSnapshot as unknown as GraphSnapshot) || { nodes: [], edges: [] };

  // Map graph nodes to CycloneDX v1.6 component structures
  const components = graph.nodes.map((node) => {
    const isCrypto = node.label === "CryptoAsset" || (node.attributes && Object.keys(node.attributes).length > 0);
    const type = node.label === "Application" 
      ? "application" 
      : node.label === "DataAsset" 
      ? "data" 
      : node.label === "SoftwareComponent" 
      ? "library" 
      : isCrypto 
      ? "cryptographic-asset" 
      : "application";

    const cryptoDetails: Record<string, any> = {};

    if (isCrypto && node.attributes) {
      cryptoDetails.assetType = node.label === "CryptoAsset" ? "algorithm" : "protocol";
      cryptoDetails.algorithmProperties = {
        name: node.attributes.encryptionStandard || node.attributes.algorithm || "Classical Key Agreement",
        parameterSet: node.attributes.targetMigration || "N/A",
        classicalSecurityStrength: node.vulnerabilityScore >= 8 ? 80 : 128,
        quantumSecurityStrength: node.vulnerabilityScore < 5 ? 128 : 0
      };
    }

    return {
      "bom-ref": node.id,
      type,
      name: node.name,
      version: "1.0.0",
      description: `Risk Level: ${node.vulnerabilityScore.toFixed(1)} | Category: ${node.label}`,
      ...(Object.keys(cryptoDetails).length > 0 ? { cryptographicDetails: cryptoDetails } : {})
    };
  });

  // Map graph edges to CycloneDX dependencies
  const dependencies = graph.nodes.map((node) => {
    const targetEdges = graph.edges.filter((e) => e.source === node.id);
    return {
      ref: node.id,
      ...(targetEdges.length > 0 ? { dependsOn: targetEdges.map((e) => e.target) } : {})
    };
  });

  // Construct CycloneDX v1.6 SBOM
  const cbom = {
    bomFormat: "CycloneDX",
    specVersion: "1.6",
    serialNumber: `urn:uuid:${id}-bom-active`,
    version: 1,
    metadata: {
      timestamp: new Date().toISOString(),
      component: {
        type: "application",
        name: project.name,
        description: project.description || "Quantum Risk Assessment Project"
      },
      tool: {
        components: [
          {
            type: "application",
            name: "Aether PQC Platform",
            version: "1.0.0"
          }
        ]
      }
    },
    components,
    dependencies
  };

  return new Response(JSON.stringify(cbom, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${project.name.toLowerCase().replace(/\s+/g, "-")}-cbom.json"`
    }
  });
}
