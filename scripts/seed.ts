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
    // 1. Create or get test user using upsert
    console.log("Creating test user...");
    const [user] = await db
      .insert(users)
      .values({
        email: "test@example.com",
        name: "Test User",
      })
      .onConflictDoUpdate({
        target: users.email,
        set: { name: "Test User" },
      })
      .returning();
    
    console.log("✅ User ready:", user.id);

    // 2. Create or get test workspace using upsert
    console.log("Creating test workspace...");
    const [workspace] = await db
      .insert(workspaces)
      .values({
        name: "Personal Projects",
        slug: "personal",
        ownerUserId: user.id,
      })
      .onConflictDoUpdate({
        target: workspaces.slug,
        set: { name: "Personal Projects" },
      })
      .returning();

    // 3. Create sample tasks
    console.log("Creating sample tasks...");
    const sampleTasks = [
      {
        workspaceId: workspace.id,
        displayId: `TSK-${String(workspace.numericId).padStart(3, "0")}-0001`,
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
        workspaceId: workspace.id,
        displayId: `TSK-${String(workspace.numericId).padStart(3, "0")}-0002`,
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
    console.log(`Workspace ID: ${workspace.id}`);

  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }

  process.exit(0);
}

seed();
