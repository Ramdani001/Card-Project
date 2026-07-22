import { NextRequest } from "next/server";

export const getQueryPaginationOptions = (req: NextRequest) => {
  const { searchParams } = new URL(req.url);

  const pageParam = searchParams.get("page");
  const limitParam = searchParams.get("limit");
  const sortBy = searchParams.get("sortBy");
  const sortOrder = searchParams.get("sortOrder")?.toLowerCase() === "asc" ? "asc" : "desc";

  const options: any = {
    where: {},
  };

  if (sortBy) {
    const keys = sortBy.split(".");
    options.orderBy = keys.reduceRight((acc, key) => ({ [key]: acc }), sortOrder as any);
  }

  const page = parseInt(pageParam || "");
  const limit = parseInt(limitParam || "");

  if (!isNaN(page) && !isNaN(limit) && page > 0 && limit > 0) {
    options.skip = (page - 1) * limit;
    options.take = limit;
  }

  const parseValue = (val: string, key: string): any => {
    const lowerVal = val.toLowerCase().trim();

    if (lowerVal === "null") return null;

    if (key === "stock") {
      if (["on", "true", "yes", "1"].includes(lowerVal)) return { gt: 0 };
      if (["off", "false", "no", "0"].includes(lowerVal)) return 0;
    }

    if (lowerVal === "true" || lowerVal === "yes" || lowerVal === "1" || lowerVal === "on") return true;
    if (lowerVal === "false" || lowerVal === "no" || lowerVal === "0" || lowerVal === "off") return false;

    if (key.startsWith("is")) {
      const expectedTrueValue = key.slice(2).toLowerCase();
      if (lowerVal === expectedTrueValue) return true;
      if (lowerVal === `un${expectedTrueValue}` || lowerVal === `in${expectedTrueValue}`) return false;
    }

    const isDateColumn = key.endsWith("At") || key.endsWith("Date") || key === "date";
    const isDatePattern = /^\d{4}-\d{2}-\d{2}/.test(val);

    if (isDateColumn || isDatePattern) {
      const parsedDate = new Date(val);

      if (!isNaN(parsedDate.getTime())) {
        if (val.length <= 12) {
          const startOfDay = new Date(parsedDate);
          startOfDay.setHours(0, 0, 0, 0);

          const endOfDay = new Date(parsedDate);
          endOfDay.setHours(23, 59, 59, 999);

          return {
            gte: startOfDay,
            lte: endOfDay,
          };
        }
        return parsedDate;
      } else if (isDateColumn) {
        return undefined;
      }
    }

    const isNumeric = !isNaN(Number(val)) && val.trim() !== "";
    const isPhoneOrZipCode = val.startsWith("0") && val.length > 1 && !val.includes(".");

    if (isNumeric && !isPhoneOrZipCode) {
      return Number(val);
    }

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

  const reservedParams = ["page", "limit", "sortBy", "sortOrder"];
  const uniqueKeys = Array.from(new Set(searchParams.keys()));

  options.where.AND = [];

  uniqueKeys.forEach((key) => {
    if (reservedParams.includes(key)) return;

    const rawValues = searchParams.getAll(key).filter((v) => v !== "");
    if (rawValues.length === 0) return;

    const values = rawValues.flatMap((v) => v.split(","));

    if (values.length > 1) {
      const parsedValues = values.map((v) => parseValue(v, key)).filter((v) => v !== undefined);
      if (parsedValues.length === 0) return;

      const firstVal = parsedValues[0];
      const isComplexObject = typeof firstVal === "object" && firstVal !== null && !(firstVal instanceof Date);

      const condition = isComplexObject
        ? { OR: parsedValues.map((pv) => (key.includes(".") ? buildWhereObject(key, pv) : { [key]: pv })) }
        : key.includes(".")
          ? buildWhereObject(key, { in: parsedValues })
          : { [key]: { in: parsedValues } };

      options.where.AND.push(condition);
    } else {
      const parsedValue = parseValue(values[0], key);
      if (parsedValue === undefined) return;

      const condition = key.includes(".") ? buildWhereObject(key, parsedValue) : { [key]: parsedValue };

      options.where.AND.push(condition);
    }
  });

  if (options.where.AND.length === 0) {
    delete options.where.AND;
  }

  return { options, page: isNaN(page) ? 1 : page, limit: isNaN(limit) ? 10 : limit };
};
