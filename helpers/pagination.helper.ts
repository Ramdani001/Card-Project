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
    if (sortBy.includes(".")) {
      const [relation, field] = sortBy.split(".");

      options.orderBy = {
        [relation]: {
          [field]: ["asc", "desc"].includes(sortOrder) ? sortOrder : "desc",
        },
      };
    } else {
      options.orderBy = {
        [sortBy]: ["asc", "desc"].includes(sortOrder) ? sortOrder : "desc",
      };
    }
  }

  const page = parseInt(pageParam || "");
  const limit = parseInt(limitParam || "");

  if (!isNaN(page) && !isNaN(limit)) {
    options.skip = (page - 1) * limit;
    options.take = limit;
  }

  const reservedParams = ["page", "limit", "sortBy", "sortOrder"];

  searchParams.forEach((value, key) => {
    if (reservedParams.includes(key) || !value) return;

    const isBoolean = value.toLowerCase() === "true" || value.toLowerCase() === "false";

    const isBooleanLabel = value.toLowerCase() === "yes" || value.toLowerCase() === "no";

    const isNumber = !isNaN(Number(value)) && value.trim() !== "";

    let parsedValue: any;

    if (isBoolean) {
      parsedValue = value.toLowerCase() === "true";
    } else if (isBooleanLabel) {
      parsedValue = value.toLowerCase() === "yes";
    } else if (isNumber && key !== "name") {
      parsedValue = Number(value);
    } else {
      parsedValue = {
        contains: value,
        mode: "insensitive",
      };
    }

    if (key.includes(".")) {
      const keys = key.split(".");

      let current = options.where;

      keys.forEach((k, index) => {
        const isLast = index === keys.length - 1;

        if (isLast) {
          current[k] = parsedValue;
        } else {
          current[k] = current[k] || { is: {} };
          current = current[k].is;
        }
      });
    } else {
      options.where[key] = parsedValue;
    }
  });

  return { options, page, limit };
};
