import { create } from "zustand"
import { persist } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"


import { AppwriteException, ID, Models } from "appwrite"
import { account } from "@/models/client/config"


export interface UserPrefs {
    reputation: number;
}

export interface AuthStore {
    session: Models.Session | null,
    jwt: string | null,
    user: Models.User<UserPrefs> | null,
    hydrated: boolean

    // function
    setHydrated(): void;
    verifySession(): Promise<void>;
    login(
        email: string,
        password: string
    ): Promise<
        {
            success: boolean,
            error?: AppwriteException | null
        }
    >;
    craeteAccount(
        name: string,
        email: string,
        password: string
    ): Promise<
        {
            success: boolean,
            error?: AppwriteException | null
        }
    >;
    logout(): Promise<void>
}

// function outer() {
// so the thing is main function return a function which exceuted immedietly
//   return function inner() {
//     console.log("Hello");
//   };
// }

// outer()();

// lets understand first what is hydartion and rehydration
/**
 * hydration means adding state and behaviour to the varibales
 * rehydartion means getting the last saved state of the variables
 */

// here the first set of parenthesis will create the store and return the store it not yet live
// then the second set of parenthesis configures the state
export const useAuthStore = create<AuthStore>()(
    persist( //we want persist state
        immer((set) => ( //we want stakable state
            // lets fix the initial state
            {
                session: null,
                jwt: null,
                user: null,
                hydrated: false,

                setHydrated() {
                    set({ hydrated: true }) //set is used to set the data or put the value in the state
                },

                async verifySession() {
                    try {
                        const session = await account.getSession("current")
                        set({ session })
                    } catch (error) {
                        console.log("Error while getting the session", error)
                    }
                },

                async login(email: string, password: string) {
                    try {
                        const session = await account.createEmailPasswordSession(email, password);
                        const [user, { jwt }] = await Promise.all([
                            account.get<UserPrefs>(),
                            account.createJWT()
                        ])

                        // here pref is nothing but the property we got from userPref
                        if (!user.prefs?.reputation) await account.updatePrefs({ reputation: 0 })

                        set({ session, jwt, user })
                        return { success: true }
                    } catch (error) {
                        console.log("Error while login ", error)
                        return {
                            success: false,
                            error: error instanceof AppwriteException ? error : null
                        };

                    }
                },

                async craeteAccount(name: string, email: string, password: string) {
                    try {
                        const session = await account.create(ID.unique(), email, password, name)
                        return { success: true };
                    } catch (error) {
                        console.log("Error while creating account ", error)
                        return {
                            success: false,
                            error: error instanceof AppwriteException ? error : null
                        };
                    }

                },

                async logout() {
                    try {
                        await account.deleteSessions()
                        set({
                            user: null,
                            jwt: null,
                            session: null
                        })
                    } catch (error) {
                        console.log("error while logging out")
                    }
                }
            }
        )),
        {
            name: "auth", //name of the state
            onRehydrateStorage() {
                return (state, error) => {
                    // this is how you should bring the state back 
                    // first no error then just attach the state and behaviour
                    if (!error) state?.setHydrated()
                }
            }
        }
    )
)