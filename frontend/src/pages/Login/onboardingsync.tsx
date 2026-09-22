import { useAuth, useUser, useOrganization } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function OnboardingSync() {
    const { getToken, isLoaded, isSignedIn } = useAuth();
    const { user } = useUser();
    const { organization, isLoaded: orgLoaded } = useOrganization();
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!isLoaded || !isSignedIn || !orgLoaded) return;

        let cancelled = false;

        async function sync() {
            try {
                const token = await getToken();

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

                if (!res.ok) {
                    throw new Error(`Sync failed with status ${res.status}`);
                }

                if (!cancelled) {
                    navigate("/dashboard", { replace: true });
                }
            } catch (err) {
                if (!cancelled) setError(err.message);
            }
        }

        sync();

        return () => {
            cancelled = true;
        };
    }, [isLoaded, isSignedIn, orgLoaded, getToken, user, organization, navigate]);

    if (error) {
        return (
            <div className="LandingPage">
                Something went wrong setting up your account: {error}
            </div>
        );
    }

    return (
        <div className="LandingPage">
            Setting up Weaver for first Log In...
        </div>
    );
}