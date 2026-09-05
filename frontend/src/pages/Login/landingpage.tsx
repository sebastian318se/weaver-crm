import { useAuth } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import "./landingpage.css";

import {
    ArrowRight,
    BarChart3,
    Lightbulb,
    Package,
    ShoppingCart,
    Sparkles,
    Users,
    Zap
} from "lucide-react";

type FeatureCardProps = {
    icon: React.ReactNode;
    title: string;
    description: string;
};

function FeatureCard({
    icon,
    title,
    description
}: FeatureCardProps) {
    return (
        <div className="featureCard">

            <div className="featureIcon">
                {icon}
            </div>

            <h3 className="featureTitle">
                {title}
            </h3>

            <p className="featureDescription">
                {description}
            </p>

        </div>
    );
}

export default function LandingPage() {

    const {isLoaded, isSignedIn } = useAuth();

    if (!isLoaded) {
        return <div className="landingPage">Loading...</div>
    }

    if (isSignedIn) {
        return <Navigate to="/dashboard" replace/>
    }

    return (

        <main className="landingPage">

            {/* Background Layers */}

            <div className="landingBackground" />
            <div className="landingOverlay" />

            {/* Header */}

            <header className="landingHeader">

                <h2 className="landingLogo">
                    Weaver CRM
                </h2>
                
            </header>

            {/* Hero */}

            <section className="landingHero">

                <div className="landingBadge">

                    <Zap size={16} />

                    <span>
                        Built to elevate tennis shops and stringer services
                    </span>

                </div>

                <h1 className="landingTitle">
                    Your Tennis Business,
                    <br />
                    End-to-End.
                </h1>

                <p className="landingSubtitle">

                    Orders, string jobs, inventory, and finances:
                    one platform that replaces the stack of tools
                    your shop doesn't need. Powered by feedback and
                    tailored to your use.

                </p>

                <nav>
                    <div className="landingHeroButtons">
                        <NavLink 
                            className="landingPrimaryButton"
                            to="/login">
                                <span>Sign Up</span>
                                <ArrowRight size={18} />
                        </NavLink>

                        <NavLink 
                            className="landingSecondaryButton"
                            to="/login">
                                <span>Log In</span>
                        </NavLink>

                    </div> 
                </nav>
                

            </section>

            {/* Trust Statistics 
            Not enough usage for trust statistics yet lol*/}

            {/* <section className="landingStats">

                <div className="landingStat">

                    <span className="landingStatLabel">
                        Businesses Powered:
                    </span>

                    <h2 className="landingStatValue">
                        250+
                    </h2>

                </div>

                <div className="landingDivider" />

                <div className="landingStat">

                    <span className="landingStatLabel">
                        Orders Managed
                    </span>

                    <h2 className="landingStatValue">
                        1.2M+
                    </h2>

                </div>

                <div className="landingDivider" />

                <div className="landingStat">

                    <span className="landingStatLabel">
                        Revenue Tracked
                    </span>

                    <h2 className="landingStatValue">
                        $18M+
                    </h2>

                </div>

            </section> */}

            {/* Features */}

            <section className="landingFeatures">

                <div className="landingSectionHeader">

                    <h2 className="landingSectionTitle">
                        Everything in one place
                    </h2>

                    <p className="landingSectionSubtitle">

                        Stop bouncing between spreadsheets,
                        messaging apps, payment tools and sticky notes.
                        Run your entire tennis business from one platform.

                    </p>

                </div>

                <div className="landingFeaturesGrid">

                    <FeatureCard
                        icon={<Sparkles size={22} />}
                        title="Built Around You"
                        description="Features and improvements shaped by feedback from tennis shops and stringers using the platform every day."
                    />

                    <FeatureCard
                        icon={<Lightbulb size={22} />}
                        title="String Job Management"
                        description="Track every racket, string, tension and due date through a clean workflow."
                    />

                    <FeatureCard
                        icon={<BarChart3 size={22} />}
                        title="Financial Dashboard"
                        description="Monitor revenue, expenses, profit, best-selling products and business insight in real time."
                    />

                    <FeatureCard
                        icon={<Users size={22} />}
                        title="Customer Hub"
                        description="Store customer history, favorite setups and previous string jobs."
                    />

                    <FeatureCard
                        icon={<Package size={22} />}
                        title="Inventory Control"
                        description="Keep track of rackets, strings, grips, apparel and accessories with live inventory updates."
                    />

                    <FeatureCard
                        icon={<ShoppingCart size={22} />}
                        title="Sales & String Jobs"
                        description="Manage in-store sales, string jobs and service requests within a single workflow."
                    />

                </div>

            </section>

        </main>

    );

}