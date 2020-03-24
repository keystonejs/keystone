<!--[meta]
section: guides
title: Relationship Migration Guide
[meta]-->

In the 7.0.0 (FIXME) release of `@keystonejs/keystone`, `@keystonejs/adapter-knex` and `@keystone/adapter-mongoose` we changed the database schema which Keystone uses to store its relationship data.

This means that if you are upgrading to these new packages you will need to perform a migration on your database in order for it to continue working.

This document will help you understand the changes to the database schema, which will help you understand the migrations you need to perform.

We recommend familiarising yourself with the [relationships](/docs/discussions/relationships.md) documentation to make sure you understand the terminology used in this document.

# One to Many (one-sided)

## List config

```javascript
keystone.createList('User', { fields: { name: { type: Text } } });

keystone.createList('Post', {
  fields: {
    title: { type: Text },
    content: { type: Text },
    author: { type: Relationship, ref: 'User', many: false },
  },
});
```

## Before

### Table schema

```sql
create table "Post"
(
	id serial not null
		constraint "Post_pkey"
			primary key,
	title text,
	content text,
	author integer
		constraint post_author_foreign
			references "User"
);
create index post_author_index
	on "Post" (author);
create table "User"
(
	id serial not null
		constraint "User_pkey"
			primary key,
	name text
);
```

### Table Data

#### Post

| id  | title  | content                       | author |
| :-- | :----- | :---------------------------- | :----- |
| 1   | A Post | Lorem ipsum dolor sit amet... | 1      |

#### User

| id  | name |
| :-- | :--- |
| 1   | John |

## After

No changes.

# Many to Many (one-sided)

## List config

```javascript
keystone.createList('User', { fields: { name: { type: Text } } });

keystone.createList('Post', {
  fields: {
    title: { type: Text },
    content: { type: Text },
    authors: { type: Relationship, ref: 'User', many: true },
  },
});
```

## Before:

### Table schema

```sql
create table "User"
(
	id serial not null
		constraint "User_pkey"
			primary key,
	name text
);
create table "Post"
(
	id serial not null
		constraint "Post_pkey"
			primary key,
	title text,
	content text
);
create table "Post_authors"
(
	"Post_id" integer not null
		constraint post_authors_post_id_foreign
			references "Post"
				on delete cascade,
	"User_id" integer not null
		constraint post_authors_user_id_foreign
			references "User"
				on delete cascade
);
create index post_authors_post_id_index
	on "Post_authors" ("Post_id");
create index post_authors_user_id_index
	on "Post_authors" ("User_id");
```

### Table data

#### User

| id  | name |
| :-- | :--- |
| 1   | John |

#### Post

| id  | title  | content                       |
| :-- | :----- | :---------------------------- |
| 1   | A Post | Lorem ipsum dolor sit amet... |

#### Post_authors

| Post_id | User_id |
| :------ | :------ |
| 1       | 1       |

## After:

### Table schema

```sql
create table "User"
(
	id serial not null
		constraint "User_pkey"
			primary key,
	name text
);
create table "Post"
(
	id serial not null
		constraint "Post_pkey"
			primary key,
	title text,
	content text
);
create table "Post_authors_many"
(
	"Post_left_id" integer not null
		constraint post_authors_many_post_left_id_foreign
			references "Post"
				on delete cascade,
	"User_right_id" integer not null
		constraint post_authors_many_user_right_id_foreign
			references "User"
				on delete cascade
);
create index post_authors_many_post_left_id_index
	on "Post_authors_many" ("Post_left_id");
create index post_authors_many_user_right_id_index
	on "Post_authors_many" ("User_right_id");
```

### Schema diff

```diff
@@ -1,4 +1,3 @@
@@ -13,19 +13,18 @@
 	title text,
 	content text
 );
-create table "Post_authors"
+create table "Post_authors_many"
 (
-	"Post_id" integer not null
-		constraint post_authors_post_id_foreign
+	"Post_left_id" integer not null
+		constraint post_authors_many_post_left_id_foreign
 			references "Post"
 				on delete cascade,
-	"User_id" integer not null
-		constraint post_authors_user_id_foreign
+	"User_right_id" integer not null
+		constraint post_authors_many_user_right_id_foreign
 			references "User"
 				on delete cascade
 );
-create index post_authors_post_id_index
-	on "Post_authors" ("Post_id");
-create index post_authors_user_id_index
-	on "Post_authors" ("User_id");
-
+create index post_authors_many_post_left_id_index
+	on "Post_authors_many" ("Post_left_id");
+create index post_authors_many_user_right_id_index
+	on "Post_authors_many" ("User_right_id");
```

### Table data

#### User

| id  | name |
| :-- | :--- |
| 1   | John |

#### Post

| id  | title  | content                       |
| :-- | :----- | :---------------------------- |
| 1   | A Post | Lorem ipsum dolor sit amet... |

#### Post_authors

| Post_id | User_id |
| :------ | :------ |
| 1       | 1       |

#### Post_authors_many

| Post_left_id | User_right_id |
| :----------- | :------------ |
| 1            | 1             |

# One to Many (two-sided)

## List config

```javascript
keystone.createList('User', {
  fields: {
    name: { type: Text },
    posts: { type: Relationship, ref: 'Post.author', many: true },
  },
});

keystone.createList('Post', {
  fields: {
    title: { type: Text },
    content: { type: Text },
    author: { type: Relationship, ref: 'User.posts', many: false },
  },
});
```

## Before:

### Table schema

```sql
create table "User"
(
	id serial not null
		constraint "User_pkey"
			primary key,
	name text
);
create table "Post"
(
	id serial not null
		constraint "Post_pkey"
			primary key,
	title text,
	content text,
	author integer
		constraint post_author_foreign
			references "User"
);
create index post_author_index
	on "Post" (author);
create table "User_posts"
(
	"User_id" integer not null
		constraint user_posts_user_id_foreign
			references "User"
				on delete cascade,
	"Post_id" integer not null
		constraint user_posts_post_id_foreign
			references "Post"
				on delete cascade
);
create index user_posts_user_id_index
	on "User_posts" ("User_id");
create index user_posts_post_id_index
	on "User_posts" ("Post_id");
```

### Table data

#### User

| id  | name |
| :-- | :--- |
| 1   | John |

#### Post

| id  | title  | content                       | author |
| :-- | :----- | :---------------------------- | :----- |
| 1   | A Post | Lorem ipsum dolor sit amet... | 1      |

#### User_posts

| User_id | Post_id |
| :------ | :------ |
| 1       | 1       |

## After:

### Table schema

```sql
create table "User"
(
	id serial not null
		constraint "User_pkey"
			primary key,
	name text
);
create table "Post"
(
	id serial not null
		constraint "Post_pkey"
			primary key,
	title text,
	content text,
	author integer
		constraint post_author_foreign
			references "User"
);
create index post_author_index
	on "Post" (author);
```

#### Schema Diff

```diff
@@ -18,18 +18,3 @@
 );
 create index post_author_index
 	on "Post" (author);
-create table "User_posts"
-(
-	"User_id" integer not null
-		constraint user_posts_user_id_foreign
-			references "User"
-				on delete cascade,
-	"Post_id" integer not null
-		constraint user_posts_post_id_foreign
-			references "Post"
-				on delete cascade
-);
-create index user_posts_user_id_index
-	on "User_posts" ("User_id");
-create index user_posts_post_id_index
-	on "User_posts" ("Post_id");
```

### Table data

#### Post

| id  | title  | content                       | author |
| :-- | :----- | :---------------------------- | :----- |
| 1   | A Post | Lorem ipsum dolor sit amet... | 1      |

#### User

| id  | name |
| :-- | :--- |
| 1   | John |

# Many to Many (two-sided)

## List config

```javascript
keystone.createList('User', {
  fields: {
    name: { type: Text },
    posts: { type: Relationship, ref: 'Post.authors', many: true },
  },
});

keystone.createList('Post', {
  fields: {
    title: { type: Text },
    content: { type: Text },
    authors: { type: Relationship, ref: 'User.posts', many: true },
  },
});
```

## Before:

### Table schema

```sql
create table "User"
(
	id serial not null
		constraint "User_pkey"
			primary key,
	name text
);
create table "Post"
(
	id serial not null
		constraint "Post_pkey"
			primary key,
	title text,
	content text
);
create table "User_posts"
(
	"User_id" integer not null
		constraint user_posts_user_id_foreign
			references "User"
				on delete cascade,
	"Post_id" integer not null
		constraint user_posts_post_id_foreign
			references "Post"
				on delete cascade
);
create index user_posts_user_id_index
	on "User_posts" ("User_id");
create index user_posts_post_id_index
	on "User_posts" ("Post_id");
create table "Post_authors"
(
	"Post_id" integer not null
		constraint post_authors_post_id_foreign
			references "Post"
				on delete cascade,
	"User_id" integer not null
		constraint post_authors_user_id_foreign
			references "User"
				on delete cascade
);
create index post_authors_post_id_index
	on "Post_authors" ("Post_id");
create index post_authors_user_id_index
	on "Post_authors" ("User_id");
```

### Table data

#### Post

| id  | title  | content                       |
| :-- | :----- | :---------------------------- |
| 1   | A Post | Lorem ipsum dolor sit amet... |

#### Post_authors

| Post_id | User_id |
| :------ | :------ |
| 1       | 1       |

#### User

| id  | name |
| :-- | :--- |
| 1   | John |

#### User_posts

| User_id | Post_id |
| :------ | :------ |
| 1       | 1       |

## After:

### Table schema

```sql
create table "User"
(
	id serial not null
		constraint "User_pkey"
			primary key,
	name text
);
create table "Post"
(
	id serial not null
		constraint "Post_pkey"
			primary key,
	title text,
	content text
);
create table "User_posts_Post_authors"
(
	"User_left_id" integer not null
		constraint user_posts_post_authors_user_left_id_foreign
			references "User"
				on delete cascade,
	"Post_right_id" integer not null
		constraint user_posts_post_authors_post_right_id_foreign
			references "Post"
				on delete cascade
);
create index user_posts_post_authors_user_left_id_index
	on "User_posts_Post_authors" ("User_left_id");
create index user_posts_post_authors_post_right_id_index
	on "User_posts_Post_authors" ("Post_right_id");
```

### Table data

#### Post

| id  | title  | content                       |
| :-- | :----- | :---------------------------- |
| 1   | A Post | Lorem ipsum dolor sit amet... |

#### User

| id  | name |
| :-- | :--- |
| 1   | John |

#### Post_authors

| User_left_id | Post_right_id |
| :----------- | :------------ |
| 1            | 1             |

# One to One (two-sided)

## List config

```javascript
keystone.createList('User', {
  fields: {
    name: { type: Text },
    post: { type: Relationship, ref: 'Post.author', many: false },
  },
});

keystone.createList('Post', {
  fields: {
    title: { type: Text },
    content: { type: Text },
    author: { type: Relationship, ref: 'User.post', many: false },
  },
});
```

## Before:

### Table schema

```sql
create table "User"
(
	id serial not null
		constraint "User_pkey"
			primary key,
	name text,
	post integer
);
create index user_post_index
	on "User" (post);
create table "Post"
(
	id serial not null
		constraint "Post_pkey"
			primary key,
	title text,
	content text,
	author integer
		constraint post_author_foreign
			references "User"
);
alter table "User"
	add constraint user_post_foreign
		foreign key (post) references "Post";
create index post_author_index
	on "Post" (author);
```

### Table data

#### Post

| id  | title  | content                       | author |
| :-- | :----- | :---------------------------- | :----- |
| 1   | A Post | Lorem ipsum dolor sit amet... | 1      |

#### User

| id  | name | post |
| :-- | :--- | :--- |
| 1   | John | 1    |

## After:

### Table schema

```sql
create table "Post"
(
	id serial not null
		constraint "Post_pkey"
			primary key,
	title text,
	content text
);
create table "User"
(
	id serial not null
		constraint "User_pkey"
			primary key,
	name text,
	post integer
		constraint user_post_foreign
			references "Post"
);
create index user_post_index
	on "User" (post);
```

### Table data

#### Post

| id  | title  | content                       |
| :-- | :----- | :---------------------------- |
| 1   | A Post | Lorem ipsum dolor sit amet... |

#### User

| id  | name | post |
| :-- | :--- | :--- |
| 1   | John | 1    |
