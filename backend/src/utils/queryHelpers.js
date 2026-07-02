export const getPagination = (query) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

export const getBlogFilters = (query, baseFilter = {}) => {
  const filter = { ...baseFilter };

  if (query.search) {
    const searchRegex = new RegExp(query.search.trim(), 'i');
    filter.$or = [
      { title: searchRegex },
      { content: searchRegex },
      { authorName: searchRegex },
      { category: searchRegex }
    ];
  }

  if (query.category) {
    filter.category = new RegExp(`^${query.category.trim()}$`, 'i');
  }

  if (query.tag) {
    filter.tags = { $in: [new RegExp(`^${query.tag.trim()}$`, 'i')] };
  }

  return filter;
};

export const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { start, end };
};
