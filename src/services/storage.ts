import { supabase } from './supabase';

const BUCKET_NAME = 'project-screenshots';

export async function initializeStorage() {
  try {
    // Check if bucket exists and is properly configured
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();

    if (bucketsError) {
      console.error('Error checking storage buckets:', bucketsError);
      return false;
    }

    const screenshotsBucket = buckets.find(b => b.name === BUCKET_NAME);
    if (!screenshotsBucket) {
      console.warn('Screenshots bucket not found. Please ensure the project-screenshots bucket exists.');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error initializing storage:', error);
    return false;
  }
}

export async function uploadScreenshot(file: File): Promise<string | null> {
  try {
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Authentication required for uploading screenshots');
      return null;
    }

    // Generate path for the screenshot
    const filePath = `${user.id}/${file.name}`;

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading screenshot:', error);
      return null;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading screenshot:', error);
    return null;
  }
}

export async function setupStorage() {
  const initialized = await initializeStorage();
  if (!initialized) {
    console.warn('Failed to initialize storage. Screenshot functionality may be limited.');
  }
  return initialized;
}
