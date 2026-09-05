CREATE TABLE "account" (
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE "food_profile" (
	"userId" text PRIMARY KEY NOT NULL,
	"dietaryPreferences" text[] DEFAULT '{}' NOT NULL,
	"dislikes" text[] DEFAULT '{}' NOT NULL,
	"favoriteIngredients" text[] DEFAULT '{}' NOT NULL,
	"goals" text[] DEFAULT '{}' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "household_member" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"name" text NOT NULL,
	"likes" text[] DEFAULT '{}' NOT NULL,
	"dislikes" text[] DEFAULT '{}' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meal_history" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"date" text NOT NULL,
	"notes" text,
	"guests" text[],
	"occasion" text,
	"feedback" text
);
--> statement-breakpoint
CREATE TABLE "meal_history_recipe" (
	"mealHistoryId" text NOT NULL,
	"recipeId" text NOT NULL,
	CONSTRAINT "meal_history_recipe_mealHistoryId_recipeId_pk" PRIMARY KEY("mealHistoryId","recipeId")
);
--> statement-breakpoint
CREATE TABLE "personal_access_token" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"tokenHash" text NOT NULL,
	"label" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"lastUsedAt" timestamp,
	CONSTRAINT "personal_access_token_tokenHash_unique" UNIQUE("tokenHash")
);
--> statement-breakpoint
CREATE TABLE "recipe" (
	"id" text PRIMARY KEY NOT NULL,
	"ownerId" text,
	"title" jsonb NOT NULL,
	"description" jsonb NOT NULL,
	"emoji" text NOT NULL,
	"imageUrl" text,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"servings" integer NOT NULL,
	"prepMinutes" integer DEFAULT 0 NOT NULL,
	"cookMinutes" integer DEFAULT 0 NOT NULL,
	"ingredients" jsonb NOT NULL,
	"steps" jsonb NOT NULL,
	"notes" text,
	"source" jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_recipe_state" (
	"userId" text NOT NULL,
	"recipeId" text NOT NULL,
	"favorite" boolean DEFAULT false NOT NULL,
	"lastCookedAt" timestamp,
	"stepNotes" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"ingredientNotes" jsonb DEFAULT '{}'::jsonb NOT NULL,
	CONSTRAINT "user_recipe_state_userId_recipeId_pk" PRIMARY KEY("userId","recipeId")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"emailVerified" timestamp,
	"image" text,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verificationToken_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "food_profile" ADD CONSTRAINT "food_profile_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "household_member" ADD CONSTRAINT "household_member_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_history" ADD CONSTRAINT "meal_history_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_history_recipe" ADD CONSTRAINT "meal_history_recipe_mealHistoryId_meal_history_id_fk" FOREIGN KEY ("mealHistoryId") REFERENCES "public"."meal_history"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_history_recipe" ADD CONSTRAINT "meal_history_recipe_recipeId_recipe_id_fk" FOREIGN KEY ("recipeId") REFERENCES "public"."recipe"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personal_access_token" ADD CONSTRAINT "personal_access_token_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe" ADD CONSTRAINT "recipe_ownerId_user_id_fk" FOREIGN KEY ("ownerId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_recipe_state" ADD CONSTRAINT "user_recipe_state_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_recipe_state" ADD CONSTRAINT "user_recipe_state_recipeId_recipe_id_fk" FOREIGN KEY ("recipeId") REFERENCES "public"."recipe"("id") ON DELETE cascade ON UPDATE no action;