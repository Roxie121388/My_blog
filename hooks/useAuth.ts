
import { createClient } from "@/utils/supabase/client";
import { useUserStore } from "@/store/userStore";
import { useRouter } from "next/navigation";


export function useAuth() {
  const clearUser = useUserStore((state) => state.clearUser);
const router = useRouter()


//登出
const signOut = async () => {  
    const supabase = createClient()
    await supabase.auth.signOut()
    clearUser()
    router.push('/login')
    router.refresh()
  }



  return {
    signOut,
  }
}