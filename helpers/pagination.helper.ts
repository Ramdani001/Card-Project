import { NextRequest } from "next/server";

export const getQueryPaginationOptions = (req: NextRequest) => {
  const { searchParams } = new URL(req.url);

  const pageParam = searchParams.get("page");
  const limitParam = searchParams.get("limit");
  const sortBy = searchParams.get("sortBy");
  const sortOrder = searchParams.get("sortOrder") || "desc";

  const options: any = {
    where: {},
  };

  if (sortBy) {
    options.orderBy = {
      [sortBy]: ["asc", "desc"].includes(sortOrder) ? sortOrder : "desc",
    };
  }

  const page = parseInt(pageParam || "");
  const limit = parseInt(limitParam || "");

  if (!isNaN(page) && !isNaN(limit)) {
    options.skip = (page - 1) * limit;
    options.take = limit;
  }

  const reservedParams = ["page", "limit", "sortBy", "sortOrder"];

  searchParams.forEach((value, key) => {
    if (!reservedParams.includes(key) && value) {
      const isBoolean = value.toLowerCase() === "true" || value.toLowerCase() === "false";
      const isBooleanLabel = value.toLowerCase() === "yes" || value.toLowerCase() === "no";
      const isNumber = !isNaN(Number(value)) && value.trim() !== "";

      if (isBoolean) {
        options.where[key] = value.toLowerCase() === "true";
      } else if (isBooleanLabel) {
        options.where[key] = value.toLowerCase() === "yes";
      } else if (isNumber && key !== "name") {
        options.where[key] = Number(value);
      } else {
        options.where[key] = {
          contains: value,
          mode: "insensitive",
        };
      }
    }
  });

  return { options, page, limit };
};
