import { supabase } from './supabase';

export interface UserProfile {
  id: string;
  email: string;
  portfolios_generated: number;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  return data;
}

export async function incrementPortfolioCount(userId: string): Promise<void> {
  const { error } = await supabase
    .from('user_profiles')
    .update({ 
      portfolios_generated: supabase.rpc('increment_portfolio_count', { user_id: userId }),
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  if (error) {
    console.error('Error incrementing portfolio count:', error);
    throw error;
  }
}

export async function updatePremiumStatus(userId: string, isPremium: boolean): Promise<void> {
  const { error } = await supabase
    .from('user_profiles')
    .update({ 
      is_premium: isPremium,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  if (error) {
    console.error('Error updating premium status:', error);
    throw error;
  }
}
