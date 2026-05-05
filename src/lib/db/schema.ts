import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  json,
} from "drizzle-orm/pg-core";

// ─── Better Auth tables ────────────────────────────────────────────────────

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
  // Custom fields
  role: text("role", {
    enum: ["admin", "supervisor", "employee", "readonly"],
  })
    .notNull()
    .default("employee"),
  courtId: text("court_id"),
  position: text("position"),
  birthdate: timestamp("birthdate", { mode: "date" }),
  photoUrl: text("photo_url"),
  tasks: text("tasks"),
  isActive: boolean("is_active").notNull().default(true),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── Application tables ────────────────────────────────────────────────────

export const courts = pgTable("courts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  number: integer("number").notNull(),
  name: text("name").notNull(),
  color: text("color", { enum: ["orange", "red", "blue", "green"] }).notNull(),
});

export const announcements = pgTable("announcements", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  content: json("content"),
  type: text("type", {
    enum: ["news", "authority", "event", "birthday"],
  }).notNull(),
  authorId: text("author_id").references(() => user.id),
  publishedAt: timestamp("published_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  pinned: boolean("pinned").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const rooms = pgTable("rooms", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  courtId: text("court_id").references(() => courts.id),
  capacity: integer("capacity"),
  description: text("description"),
});

export const reservations = pgTable("reservations", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  roomId: text("room_id")
    .notNull()
    .references(() => rooms.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  courtId: text("court_id").references(() => courts.id),
  title: text("title").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const hearings = pgTable("hearings", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  weekStart: timestamp("week_start", { mode: "date" }).notNull(),
  dayOfWeek: text("day_of_week", {
    enum: ["lunes", "martes", "miércoles", "jueves", "viernes"],
  }).notNull(),
  time: text("time").notNull(),
  modality: text("modality", {
    enum: ["Presencial", "Virtual", "Mixta"],
  }).notNull(),
  type: text("type").notNull(),
  caseNumber: text("case_number").notNull(),
  audiencista: text("audiencista").notNull(),
  funcionario: text("funcionario").notNull(),
  juez: text("juez").notNull(),
  courtId: text("court_id").references(() => courts.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const hearingExtractions = pgTable("hearing_extractions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  imageUrl: text("image_url").notNull(),
  status: text("status", {
    enum: ["pending", "processing", "completed", "failed"],
  })
    .notNull()
    .default("pending"),
  extractedData: json("extracted_data"),
  hearingId: text("hearing_id").references(() => hearings.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orgNodes = pgTable("org_nodes", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  parentId: text("parent_id"), // self-ref, no FK constraint to avoid circular dep
  positionOrder: integer("position_order").notNull().default(0),
});

export const lawCategories = pgTable("law_categories", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  processType: text("process_type"),
  subjectMatter: text("subject_matter"),
  parentId: text("parent_id"), // self-ref
});

export const lawArticles = pgTable("law_articles", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  categoryId: text("category_id").references(() => lawCategories.id),
  title: text("title").notNull(),
  content: json("content"),
  tags: text("tags").array(),
  authorId: text("author_id").references(() => user.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});

export const lawAttachments = pgTable("law_attachments", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  articleId: text("article_id")
    .notNull()
    .references(() => lawArticles.id, { onDelete: "cascade" }),
  type: text("type", {
    enum: ["pdf", "video", "image", "fallo", "paper"],
  }).notNull(),
  url: text("url").notNull(),
  title: text("title"),
  displayOnly: boolean("display_only").notNull().default(true),
  order: integer("order").notNull().default(0),
});

export const procedureGuides = pgTable("procedure_guides", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  content: json("content"),
  category: text("category"),
  shortcutType: text("shortcut_type", {
    enum: ["windows", "chrome", "none"],
  })
    .notNull()
    .default("none"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const guideAttachments = pgTable("guide_attachments", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  guideId: text("guide_id")
    .notNull()
    .references(() => procedureGuides.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  url: text("url").notNull(),
  title: text("title"),
  order: integer("order").notNull().default(0),
});

export const quizzes = pgTable("quizzes", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  guideId: text("guide_id").references(() => procedureGuides.id),
  question: text("question").notNull(),
  options: json("options").$type<string[]>().notNull(),
  correctAnswer: integer("correct_answer").notNull(),
  explanation: text("explanation"),
});

export const notifications = pgTable("notifications", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  message: text("message").notNull(),
  read: boolean("read").notNull().default(false),
  relatedId: text("related_id"),
  relatedType: text("related_type"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Type exports ──────────────────────────────────────────────────────────

export type User = typeof user.$inferSelect;
export type Court = typeof courts.$inferSelect;
export type Announcement = typeof announcements.$inferSelect;
export type Room = typeof rooms.$inferSelect;
export type Reservation = typeof reservations.$inferSelect;
export type Hearing = typeof hearings.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
