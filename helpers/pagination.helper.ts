import { NextRequest } from "next/server";

export const getQueryPaginationOptions = (req: NextRequest) => {
  const { searchParams } = new URL(req.url);

  const pageParam = searchParams.get("page");
  const limitParam = searchParams.get("limit");
  const sortBy = searchParams.get("sortBy");
  const sortOrder = searchParams.get("sortOrder") || "desc";

  const options: any = {};

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

  return { options, page, limit };
};
