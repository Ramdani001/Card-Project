/* eslint-disable no-console */
import "dotenv/config";

import prisma from "@/lib/prisma";
import { syncCitiesFromApi } from "@/services/master/city.service";

async function main() {
  try {
    const result = await syncCitiesFromApi();

    console.log("SYNC SUCCESS");
    console.log(result);
  } catch (error) {
    console.error("SYNC FAILED");
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
