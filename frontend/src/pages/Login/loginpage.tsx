import { SignIn } from "@clerk/clerk-react";

export default function LoginPage() {
    return (
        <div>
            <SignIn routing="virtual" />
        </div>
    );
}