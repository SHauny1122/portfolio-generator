-- Function to safely increment portfolio count
create or replace function public.increment_portfolio_count(user_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.user_profiles
  set 
    portfolios_generated = portfolios_generated + 1,
    updated_at = timezone('utc'::text, now())
  where id = user_id;
end;
$$;
