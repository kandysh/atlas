/**
 * Database Seed Script
 * 
 * This script seeds the database with initial data for testing.
 * Run with: tsx scripts/seed.ts
 */

import { db, workspaces, users, tasks, fieldConfigs } from "../src/lib/db";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("🌱 Starting database seed...");

  try {
    // 1. Create a test user
    console.log("Creating test user...");
    const [user] = await db
      .insert(users)
      .values({
        email: "test@example.com",
        name: "Test User",
      })
      .onConflictDoNothing()
      .returning();

    const userId = user?.id || (await db.select().from(users).where(eq(users.email, "test@example.com")).limit(1))[0]?.id;
    
    if (!userId) {
      throw new Error("Failed to create or fetch user");
    }
    
    console.log("✅ User ready:", userId);

    // 2. Create a test workspace
    console.log("Creating test workspace...");
    const [workspace] = await db
      .insert(workspaces)
      .values({
        name: "Personal Projects",
        slug: "personal",
        ownerUserId: userId,
      })
      .onConflictDoNothing()
      .returning();

    const workspaceId = workspace?.id || (await db.select().from(workspaces).where(eq(workspaces.slug, "personal")).limit(1))[0]?.id;
    const workspaceNumericId = workspace?.numericId || (await db.select().from(workspaces).where(eq(workspaces.slug, "personal")).limit(1))[0]?.numericId;
    
    if (!workspaceId) {
      throw new Error("Failed to create or fetch workspace");
    }
    
    console.log("✅ Workspace ready:", workspaceId);

    // 3. Create sample tasks
    console.log("Creating sample tasks...");
    const sampleTasks = [
      {
        workspaceId,
        displayId: `TSK-${String(workspaceNumericId).padStart(3, "0")}-0001`,
        sequenceNumber: 1,
        data: {
          title: "Setup CI/CD Pipeline",
          status: "in-progress",
          priority: "high",
          owner: "Test User",
          problemStatement: "Manual deployments are error-prone",
        },
      },
      {
        workspaceId,
        displayId: `TSK-${String(workspaceNumericId).padStart(3, "0")}-0002`,
        sequenceNumber: 2,
        data: {
          title: "Implement User Authentication",
          status: "todo",
          priority: "high",
          owner: "Test User",
        },
      },
    ];

    for (const task of sampleTasks) {
      await db.insert(tasks).values(task).onConflictDoNothing();
    }

    console.log("✅ Created sample tasks");
    console.log("\n🎉 Database seeding completed!");
    console.log(`Workspace ID: ${workspaceId}`);

  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }

  process.exit(0);
}

seed();
