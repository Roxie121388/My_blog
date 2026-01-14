import { create } from "zustand"
import { UserState, User, UserProfile } from "@/types/user"
import { createClient } from "@/utils/supabase/client"
import { persist, createJSONStorage } from "zustand/middleware"



interface UserStore extends UserState {
    setUser: (user: User | null) => void
    setProfile: (profile: UserProfile | null) => void
    setLoading: (isLoading: boolean) => void
    initialize: ()=>Promise<void>
    clearUser: () => void
}

export const useUserStore = create<UserStore>()(
    persist(
        (set, get) => ({
        user: null,
        profile: null,
        isLoading: false,
        isAuthenticated: false,

         setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        })
      },

      setProfile: (profile) => {
        set({ profile })
      },

      setLoading: (isLoading) => {
        set({ isLoading })
      },

      clearUser: () => {
        set({
          user: null,
          profile: null,
          isAuthenticated: false,
          isLoading: false,
        })
      },

      initialize: async () => {
        const state=get()
        try{
            const supabase = await createClient()
            const {data: { user },error:userError} = await supabase.auth.getUser()
            if(userError || !user){
                if(state.isAuthenticated){
                    state.clearUser()
              console.error("获取用户失败:", userError?.message || "用户不存在")

                }else{
                    set({
                        isLoading: false,
                    })
                }
              return
            }
            set({
              user,
              isAuthenticated: !!user,
            })
        }
        catch(error){
            console.error("初始化用户失败:", error)
            state.clearUser()
        }finally{
            set({
                isLoading: false,
            })
        }
      },
    }),
    {
        name: "user-storage",
        storage: createJSONStorage(() => {
            if (typeof window !== 'undefined') {
                return localStorage
            }
            return {
                getItem:()=>null,
                setItem:()=>{},
                removeItem:()=>{},
            }
        }),
        partialize:(state)=>{
            const {user,profile,isAuthenticated,isLoading}=state
            return {user,profile,isAuthenticated}
        }
    }
    )
)
    // Selectors - 用于性能优化
export const useUser = () => useUserStore((state) => state.user)
export const useProfile = () => useUserStore((state) => state.profile)
export const useIsAuthenticated = () => useUserStore((state) => state.isAuthenticated)
export const useIsLoading = () => useUserStore((state) => state.isLoading)

   

