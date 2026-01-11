
const SUPABASE_URL = 'https://hsocmfwtpfcdqfehlbrr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_fQpHWcs0CA5JTv4LDtC1Eg_5hpXMrEe';

// GANTI NAMA TABEL INI UNTUK SETIAP APPS BARU
const TABLE_NAME = 'user_whitelist_gegevision'; 

const getAuthHeaders = () => {
  return {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json'
  };
};

/**
 * Mengecek apakah email terdaftar di database whitelist apps ini
 */
export const checkWhitelistedEmail = async (email: string): Promise<boolean> => {
  const cleanEmail = email.trim().toLowerCase();
  const queryUrl = `${SUPABASE_URL}/rest/v1/${TABLE_NAME}?email=ilike.${cleanEmail}&select=*`;
  
  try {
    const response = await fetch(queryUrl, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      console.error(`[Auth Debug] Database Error: ${response.status}`);
      return false;
    }

    const data = await response.json();
    return Array.isArray(data) && data.length > 0;
  } catch (error) {
    console.error("[Auth Debug] Gagal terhubung ke database:", error);
    return false;
  }
};

/**
 * Mengambil data whitelist untuk halaman Admin Panel
 */
export const fetchWhitelistFromCloud = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE_NAME}?select=email`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!Array.isArray(data)) return [];
    return data.map((item: any) => item.email);
  } catch (error) {
    console.error("Fetch Error:", error);
    return [];
  }
};
