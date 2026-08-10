-- Case-insensitive uniqueness for catalog names (in addition to exact @unique).
CREATE UNIQUE INDEX "categories_name_ci_key" ON "categories" (LOWER("name"));
CREATE UNIQUE INDEX "styles_name_ci_key" ON "styles" (LOWER("name"));
CREATE UNIQUE INDEX "sizes_name_ci_key" ON "sizes" (LOWER("name"));
