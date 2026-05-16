-- =============================================================================
-- Just Ask — Complete Supabase SQL Setup
-- =============================================================================
-- Run this entire script in: Supabase Dashboard → SQL Editor → New query → Run
--
-- Prerequisites:
--   1. Create a Supabase project
--   2. Add to .env.local:
--        NEXT_PUBLIC_SUPABASE_URL=...
--        NEXT_PUBLIC_SUPABASE_ANON_KEY=...
--   3. In Authentication → Providers → Email: enable Email sign-in
--   4. (Optional) Disable "Confirm email" for faster student testing
-- =============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- HELPER FUNCTIONS (roles)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin', FALSE);
$$;

CREATE OR REPLACE FUNCTION public.is_professor()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((auth.jwt() -> 'user_metadata' ->> 'role') = 'professor', FALSE);
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_admin() OR public.is_professor();
$$;

-- =============================================================================
-- TABLES
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT 'Anonymous User',
  email TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  reputation_score INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  image_url TEXT,
  upvotes_count INTEGER NOT NULL DEFAULT 0,
  answers_count INTEGER NOT NULL DEFAULT 0,
  views_count INTEGER NOT NULL DEFAULT 0,
  is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
  upvotes_count INTEGER NOT NULL DEFAULT 0,
  is_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.question_upvotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (question_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.answer_upvotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  answer_id UUID NOT NULL REFERENCES public.answers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (answer_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'general',
  message TEXT NOT NULL,
  link TEXT NOT NULL DEFAULT '/home',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Legacy fallback table (used by older code paths in question detail page)
CREATE TABLE IF NOT EXISTS public.upvotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
  answer_id UUID REFERENCES public.answers(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT upvotes_target_check CHECK (
    (question_id IS NOT NULL AND answer_id IS NULL)
    OR (question_id IS NULL AND answer_id IS NOT NULL)
  ),
  UNIQUE (user_id, question_id),
  UNIQUE (user_id, answer_id)
);

-- =============================================================================
-- MIGRATIONS (safe if tables already existed from older scripts)
-- =============================================================================

ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS is_resolved BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS views_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.answers ADD COLUMN IF NOT EXISTS is_accepted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.answers ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_questions_user_id ON public.questions(user_id);
CREATE INDEX IF NOT EXISTS idx_questions_category_id ON public.questions(category_id);
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON public.questions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_questions_is_resolved ON public.questions(is_resolved);
CREATE INDEX IF NOT EXISTS idx_questions_is_deleted ON public.questions(is_deleted);
CREATE INDEX IF NOT EXISTS idx_answers_question_id ON public.answers(question_id);
CREATE INDEX IF NOT EXISTS idx_answers_user_id ON public.answers(user_id);
CREATE INDEX IF NOT EXISTS idx_question_upvotes_question_id ON public.question_upvotes(question_id);
CREATE INDEX IF NOT EXISTS idx_question_upvotes_user_id ON public.question_upvotes(user_id);
CREATE INDEX IF NOT EXISTS idx_answer_upvotes_answer_id ON public.answer_upvotes(answer_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- =============================================================================
-- SEED CATEGORIES (E-JUST subjects)
-- =============================================================================

INSERT INTO public.categories (name, slug, description, color) VALUES
  ('Mathematics', 'mathematics', 'Calculus, algebra, and applied math', '#8b5cf6'),
  ('Physics', 'physics', 'General and engineering physics', '#06b6d4'),
  ('Mechanics', 'mechanics', 'Statics, dynamics, and strength of materials', '#f59e0b'),
  ('Chemistry', 'chemistry', 'General and engineering chemistry', '#10b981'),
  ('Engineering Drawing', 'engineering-drawing', 'Technical drawing and CAD basics', '#ec4899'),
  ('English', 'english', 'Academic English and communication', '#6366f1'),
  ('Programming', 'programming', 'Software development and algorithms', '#3b82f6'),
  ('Manufacturing', 'manufacturing', 'Production and manufacturing processes', '#14b8a6'),
  ('University Life', 'university-life', 'Campus, admin, and general student life', '#64748b')
ON CONFLICT (slug) DO NOTHING;

-- =============================================================================
-- TRIGGERS — profiles & timestamps
-- =============================================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_set_updated_at ON public.profiles;
CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS questions_set_updated_at ON public.questions;
CREATE TRIGGER questions_set_updated_at
  BEFORE UPDATE ON public.questions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS answers_set_updated_at ON public.answers;
CREATE TRIGGER answers_set_updated_at
  BEFORE UPDATE ON public.answers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'display_name', 'Anonymous User'),
    COALESCE(NEW.email, '')
  )
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- TRIGGERS — upvote counters & reputation
-- =============================================================================

CREATE OR REPLACE FUNCTION public.increment_question_upvotes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.questions
  SET upvotes_count = upvotes_count + 1
  WHERE id = NEW.question_id;

  UPDATE public.profiles
  SET reputation_score = reputation_score + 5
  WHERE id = (SELECT user_id FROM public.questions WHERE id = NEW.question_id);

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.decrement_question_upvotes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.questions
  SET upvotes_count = GREATEST(upvotes_count - 1, 0)
  WHERE id = OLD.question_id;

  UPDATE public.profiles
  SET reputation_score = GREATEST(reputation_score - 5, 0)
  WHERE id = (SELECT user_id FROM public.questions WHERE id = OLD.question_id);

  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS on_question_upvote_insert ON public.question_upvotes;
CREATE TRIGGER on_question_upvote_insert
  AFTER INSERT ON public.question_upvotes
  FOR EACH ROW EXECUTE FUNCTION public.increment_question_upvotes();

DROP TRIGGER IF EXISTS on_question_upvote_delete ON public.question_upvotes;
CREATE TRIGGER on_question_upvote_delete
  AFTER DELETE ON public.question_upvotes
  FOR EACH ROW EXECUTE FUNCTION public.decrement_question_upvotes();

CREATE OR REPLACE FUNCTION public.increment_answer_upvotes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.answers
  SET upvotes_count = upvotes_count + 1
  WHERE id = NEW.answer_id;

  UPDATE public.profiles
  SET reputation_score = reputation_score + 10
  WHERE id = (SELECT user_id FROM public.answers WHERE id = NEW.answer_id);

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.decrement_answer_upvotes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.answers
  SET upvotes_count = GREATEST(upvotes_count - 1, 0)
  WHERE id = OLD.answer_id;

  UPDATE public.profiles
  SET reputation_score = GREATEST(reputation_score - 10, 0)
  WHERE id = (SELECT user_id FROM public.answers WHERE id = OLD.answer_id);

  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS on_answer_upvote_insert ON public.answer_upvotes;
CREATE TRIGGER on_answer_upvote_insert
  AFTER INSERT ON public.answer_upvotes
  FOR EACH ROW EXECUTE FUNCTION public.increment_answer_upvotes();

DROP TRIGGER IF EXISTS on_answer_upvote_delete ON public.answer_upvotes;
CREATE TRIGGER on_answer_upvote_delete
  AFTER DELETE ON public.answer_upvotes
  FOR EACH ROW EXECUTE FUNCTION public.decrement_answer_upvotes();

-- =============================================================================
-- TRIGGERS — answer counts (DB handles counts; app should NOT double-increment)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.update_answer_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.questions
    SET answers_count = answers_count + 1
    WHERE id = NEW.question_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.questions
    SET answers_count = GREATEST(answers_count - 1, 0)
    WHERE id = OLD.question_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS on_answer_insert ON public.answers;
CREATE TRIGGER on_answer_insert
  AFTER INSERT ON public.answers
  FOR EACH ROW EXECUTE FUNCTION public.update_answer_count();

DROP TRIGGER IF EXISTS on_answer_delete ON public.answers;
CREATE TRIGGER on_answer_delete
  AFTER DELETE ON public.answers
  FOR EACH ROW EXECUTE FUNCTION public.update_answer_count();

-- =============================================================================
-- TRIGGERS — notifications
-- =============================================================================

CREATE OR REPLACE FUNCTION public.notify_on_new_answer()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  q RECORD;
BEGIN
  SELECT id, user_id, title INTO q
  FROM public.questions
  WHERE id = NEW.question_id;

  IF q.user_id IS NOT NULL AND q.user_id <> NEW.user_id THEN
    INSERT INTO public.notifications (user_id, type, message, link)
    VALUES (
      q.user_id,
      'new_answer',
      'New answer on: ' || LEFT(q.title, 80),
      '/questions/' || q.id
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_answer_notify_owner ON public.answers;
CREATE TRIGGER on_answer_notify_owner
  AFTER INSERT ON public.answers
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_new_answer();

-- =============================================================================
-- RPC — view counter (any visitor can increment views safely)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.increment_question_views(question_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.questions
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = question_uuid
    AND is_deleted = FALSE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_question_views(UUID) TO anon, authenticated;

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answer_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upvotes ENABLE ROW LEVEL SECURITY;

-- Drop old policies (safe re-run)
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'profiles', 'categories', 'questions', 'answers',
        'question_upvotes', 'answer_upvotes', 'notifications', 'upvotes'
      )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- PROFILES
CREATE POLICY profiles_select_all ON public.profiles
  FOR SELECT USING (TRUE);

CREATE POLICY profiles_insert_own ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR public.is_admin());

CREATE POLICY profiles_delete_admin ON public.profiles
  FOR DELETE USING (public.is_admin());

-- CATEGORIES
CREATE POLICY categories_select_all ON public.categories
  FOR SELECT USING (TRUE);

CREATE POLICY categories_manage_staff ON public.categories
  FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

-- QUESTIONS
CREATE POLICY questions_select_visible ON public.questions
  FOR SELECT USING (is_deleted = FALSE OR public.is_admin());

CREATE POLICY questions_insert_own ON public.questions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY questions_update_own ON public.questions
  FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY questions_delete_own_or_admin ON public.questions
  FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- ANSWERS
CREATE POLICY answers_select_visible ON public.answers
  FOR SELECT USING (is_deleted = FALSE OR public.is_admin());

CREATE POLICY answers_insert_own ON public.answers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY answers_update_own_or_owner ON public.answers
  FOR UPDATE USING (
    auth.uid() = user_id
    OR public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.questions q
      WHERE q.id = answers.question_id
        AND q.user_id = auth.uid()
    )
  );

CREATE POLICY answers_delete_own_or_admin ON public.answers
  FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- UPVOTES
CREATE POLICY question_upvotes_select_all ON public.question_upvotes
  FOR SELECT USING (TRUE);

CREATE POLICY question_upvotes_insert_own ON public.question_upvotes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY question_upvotes_delete_own ON public.question_upvotes
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY answer_upvotes_select_all ON public.answer_upvotes
  FOR SELECT USING (TRUE);

CREATE POLICY answer_upvotes_insert_own ON public.answer_upvotes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY answer_upvotes_delete_own ON public.answer_upvotes
  FOR DELETE USING (auth.uid() = user_id);

-- LEGACY UPVOTES
CREATE POLICY upvotes_select_all ON public.upvotes
  FOR SELECT USING (TRUE);

CREATE POLICY upvotes_insert_own ON public.upvotes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY upvotes_delete_own ON public.upvotes
  FOR DELETE USING (auth.uid() = user_id);

-- NOTIFICATIONS
CREATE POLICY notifications_select_own ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY notifications_update_own ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY notifications_insert_system ON public.notifications
  FOR INSERT WITH CHECK (TRUE);

-- =============================================================================
-- STORAGE — question images bucket
-- =============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'question_images',
  'question_images',
  TRUE,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS question_images_public_read ON storage.objects;
CREATE POLICY question_images_public_read ON storage.objects
  FOR SELECT
  USING (bucket_id = 'question_images');

DROP POLICY IF EXISTS question_images_auth_upload ON storage.objects;
CREATE POLICY question_images_auth_upload ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'question_images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS question_images_owner_update ON storage.objects;
CREATE POLICY question_images_owner_update ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'question_images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS question_images_owner_delete ON storage.objects;
CREATE POLICY question_images_owner_delete ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'question_images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- =============================================================================
-- REALTIME (notifications bell)
-- =============================================================================

ALTER TABLE public.notifications REPLICA IDENTITY FULL;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- =============================================================================
-- GRANTS
-- =============================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- =============================================================================
-- DONE
-- =============================================================================
-- After running:
--   1. Sign up a test student account
--   2. (Optional) Set admin role in SQL:
--        UPDATE auth.users
--        SET raw_user_meta_data = raw_user_meta_data || '{"role":"admin"}'::jsonb
--        WHERE email = 'your.email@ejust.edu.eg';
--   3. Run the app: npm run dev
-- =============================================================================
