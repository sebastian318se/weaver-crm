import { SignIn } from "@clerk/clerk-react";
import "./loginpage.css";

export default function LoginPage() {

    return (

        <div className="loginPage">
            <div className="loginBackground" />
            <div className="loginOverlay" />

            <div className="loginContainer">
                <div className="loginBrand">
                    <h1>Weaver CRM</h1>
                    <p>Welcome back. Sign in to continue.</p>
                    <p>General public Onboarding available soon!</p>
                </div>

                <SignIn
                    routing="virtual"
                    appearance={{
                        variables: {
                            colorPrimary: "#7c3aed",
                            colorBackground: "rgba(20,16,32,.65)",
                            colorInputBackground: "rgba(255,255,255,.06)",
                            colorInputText: "#ffffff",
                            colorText: "#ffffff",
                            colorTextSecondary: "rgba(255,255,255,.72)",
                            colorNeutral: "rgba(255,255,255,.65)",
                            borderRadius: "12px",
                        },
                        elements: {
                            rootBox: "clerkRoot",
                            card: "clerkCard",
                            headerTitle: "clerkTitle",
                            headerSubtitle: "clerkSubtitle",
                            formFieldInput: "clerkInput",
                            formFieldLabel: "clerkLabel",
                            formButtonPrimary: "clerkButtonPrimary",
                            socialButtonsBlockButton: "clerkButtonSecondary",
                            footerAction: "clerkFooter",
                            footerActionText: "clerkFooterText",
                            footerActionLink: "clerkLink",
                            identityPreviewText: "clerkText",
                            formResendCodeLink: "clerkLink",
                            dividerLine: "clerkDivider",
                            dividerText: "clerkDividerText",
                            footer: "clerkFooter",
                            formFieldHintText: "clerkText",
                            otpCodeFieldInput: "clerkInput",
                        },
                    }}
                />
                
            </div>
        </div>
    );
}