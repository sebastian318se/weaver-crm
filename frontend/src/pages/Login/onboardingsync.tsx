import { useAuth } from "@clerk/clerk-react";
import { useEffect } from "react";

export default function OnboardingSync() {
    const { getToken, isLoaded, isSignedIn } = useAuth();

    useEffect(() => {
        if (!isLoaded || !isSignedIn) return;

        async function sync() {
            const token = await getToken();

            await fetch("/api/onboarding/sync", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        }

        sync();
    }, [isLoaded, isSignedIn, getToken]);

    return (
        <div className="LandingPage">
            Setting up Weaver for first Log In...
        </div>
    );
}