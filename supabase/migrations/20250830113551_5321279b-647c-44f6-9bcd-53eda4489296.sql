-- Add foreign key constraint between profiles and branches
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_branch_id_fkey 
FOREIGN KEY (branch_id) REFERENCES public.branches(id);