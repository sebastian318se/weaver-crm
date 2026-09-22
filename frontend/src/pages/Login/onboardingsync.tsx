import { useAuth, useUser, useOrganization } from "@clerk/clerk-react";
import { useEffect } from "react";

export default function OnboardingSync() {
    const { getToken, isLoaded, isSignedIn } = useAuth();
    const { user } = useUser();
    const { organization, isLoaded: orgLoaded } = useOrganization();

    useEffect(() => {
        if (!isLoaded || !isSignedIn || !orgLoaded) return;

        async function sync() {
            const token = await getToken();

            try {
                const res = await fetch("/api/onboarding/sync", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        tenantName: organization?.name ?? "",
                        userDisplayName: user?.fullName ?? "",
                        userEmail: user?.primaryEmailAddress?.emailAddress ?? "",
                    }),
                });
                console.log("[OnboardingSync] response status", res.status);
            } catch (err) {
                console.error("[OnboardingSync] fetch threw", err);
            }
        }

        sync();
    }, [isLoaded, isSignedIn, orgLoaded, getToken, user, organization]);

    return (
        <div className="LandingPage">
            Setting up Weaver for first Log In...
        </div>
    );
}