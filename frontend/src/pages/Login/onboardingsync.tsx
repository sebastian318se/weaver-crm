import { useAuth } from "@clerk/clerk-react";
import { useEffect } from "react";

export default function OnboardingSync() {
    const { getToken, isLoaded, isSignedIn } = useAuth();

    console.log("[OnboardingSync] render", { isLoaded, isSignedIn });

    useEffect(() => {
        console.log("[OnboardingSync] effect fired", { isLoaded, isSignedIn });

        if (!isLoaded || !isSignedIn) {
            console.log("[OnboardingSync] bailing out early");
            return;
        }

        async function sync() {
            console.log("[OnboardingSync] getting token...");
            const token = await getToken();
            console.log("[OnboardingSync] token acquired?", !!token);

            try {
                const res = await fetch("/api/onboarding/sync", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                console.log("[OnboardingSync] response status", res.status);
            } catch (err) {
                console.error("[OnboardingSync] fetch threw", err);
            }
        }

        sync();
    }, [isLoaded, isSignedIn, getToken]);

    return (
        <div className="LandingPage">
            Setting up Weaver for first Log In...
        </div>
    );
}