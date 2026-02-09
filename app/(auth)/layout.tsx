// variable :{variable:dataType}
// a way to declare datatype in ts

// when the user loads register or login route this layout will work and those filw will be inhected here

"use client"
import { useAuthStore } from "@/store/auth"
import { useRouter } from "next/router"
import React from "react"
import { BackgroundBeams } from "@/components/ui/background-beams";

const Layout = ({ children }: { children: React.ReactNode }) => {
    const { session } = useAuthStore()
    const router = useRouter()

    // so the thing login and register page would be there only when user is not logged in
    React.useEffect(() => {
        if (session) {
            // so the thing if the user is session and tries to access the route which come is auth folder it will be redirected to main
            router.push("/")
        }
    }, [session, router])

    // if the user is logged in then return null
    if (session) {
        return null;
    }

    return (
        <div className="">
            {/* this is get the loading screen */}
            <BackgroundBeams />
            <div className="">
                {children}
            </div>
        </div>
    )
}