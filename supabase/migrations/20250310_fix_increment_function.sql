-- Drop the old function if it exists
drop function if exists public.increment_portfolio_count;

-- Create the updated function
create or replace function public.increment_portfolio_count(user_id uuid)
returns integer
language plpgsql
security definer
as $$
declare
  new_count integer;
begin
  update public.user_profiles
  set 
    portfolios_generated = portfolios_generated + 1,
    updated_at = timezone('utc'::text, now())
  where id = user_id
  returning portfolios_generated into new_count;
  
  return new_count;
end;
$$;
