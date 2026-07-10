// ======================== Start of code I did not write myself ============================
// Source:
// Title: supabase.ts

// Author: the code is found in a repository by Supabase (https://github.com/supabase), the commit is authored by the following accounts on GitHub:
// - ChrisChinchilla (https://github.com/ChrisChinchilla)
// - Copilot
// - coderabbitai[bot]
// - fadymak (https://github.com/fadymak)

// Date: May 4, 2026

// Code version: Commit d8bd6b0

// Availability: https://github.com/supabase/supabase/blob/master/examples/auth/quickstarts/react-native/lib/supabase.ts

// The code is found on a file in the Supabase GitHub repository (https://github.com/supabase/supabase)
// by Supabase (https://github.com/supabase). The repository is licensed under Apache-2.0. 
// A copy of the license is provided in the THIRD-PARTY-LICENSES-MANUAL-ADDITION.MD file in the root directory of this project under the section "Supabase (https://github.com/supabase/supabase)".
// Copyright 2024 Supabase
// Modified by me. The modificiations are as folows: 
// - On this file, I only use code in one file of the repository. The file can be found at https://github.com/supabase/supabase/blob/master/examples/auth/quickstarts/react-native/lib/supabase.ts
// - This file is a .js file, the orginal file is a .ts file
// - I reworded comment
// - I added semicolons for consistency with the rest of the codebase
// - I removed ! from lines defining the variables supabaseUrl and supabasePublishableKey
import { AppState, Platform } from 'react-native';
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, processLock } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    ...(Platform.OS !== 'web' ? { storage: AsyncStorage } : {}),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    lock: processLock,
  },
})

/* Register an event listener to refresh session automatically 
 * when the app is in the foreground. Only register this once.
 * Causes 'TOKEN_REFRESHED' or 'SIGNED_OUT' (if session is terminated) 
 * events for onAuthStateChange. 
 */
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } 
    else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
// =============== End of code I did not write myself =================================