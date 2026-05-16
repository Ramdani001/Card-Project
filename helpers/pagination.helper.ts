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

  const uniqueKeys = Array.from(new Set(searchParams.keys()));

  uniqueKeys.forEach((key) => {
    if (reservedParams.includes(key)) return;

    const values = searchParams.getAll(key).filter(Boolean);
    if (values.length === 0) return;

    const parseValue = (val: string) => {
      const isBoolean = val.toLowerCase() === "true" || val.toLowerCase() === "false";
      const isBooleanLabel = val.toLowerCase() === "yes" || val.toLowerCase() === "no";
      const isNumber = !isNaN(Number(val)) && val.trim() !== "";

      if (isBoolean) return val.toLowerCase() === "true";
      if (isBooleanLabel) return val.toLowerCase() === "yes";
      if (isNumber && key !== "name") return String(val);
      return {
        contains: val,
        mode: "insensitive",
      };
    };

    const buildWhereObject = (dottedKey: string, parsedVal: any) => {
      const keys = dottedKey.split(".");
      const obj: any = {};
      let current = obj;

      keys.forEach((k, index) => {
        if (index === keys.length - 1) {
          current[k] = parsedVal;
        } else {
          current[k] = { is: {} };
          current = current[k].is;
        }
      });
      return obj;
    };

    if (values.length > 1) {
      if (!options.where.AND) {
        options.where.AND = [];
      }

      values.forEach((value) => {
        const parsedValue = parseValue(value);
        const condition = key.includes(".") ? buildWhereObject(key, parsedValue) : { [key]: parsedValue };

        options.where.AND.push(condition);
      });
    } else {
      const parsedValue = parseValue(values[0]);

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
    }
  });

  return { options, page, limit };
};
