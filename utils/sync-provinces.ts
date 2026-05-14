/* eslint-disable no-console */
import "dotenv/config";

import prisma from "@/lib/prisma";
import { syncProvincesFromApi } from "@/services/master/province.service";

async function main() {
  try {
    const result = await syncProvincesFromApi();

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
