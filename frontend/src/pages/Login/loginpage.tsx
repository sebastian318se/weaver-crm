import "./loginpage.css";

export default function LoginPage() {
    return (
        <main className="loginPage">

            {/* Background */}

            <div className="loginBackground" />
            <div className="loginOverlay" />

            <section className="loginContainer">

                {/* Left Side */}

                <div className="loginInfo">

                    <span className="loginBadge">
                        Weaver CRM
                    </span>

                    <h1 className="loginTitle">
                        Welcome back.
                    </h1>

                    <p className="loginSubtitle">
                        Sign in to manage orders, string jobs,
                        inventory and everything else from one place.
                    </p>

                </div>

                {/* Right Side */}

                <div className="loginFormWrapper">

                    <h2>
                        Sign In
                    </h2>

                    <p>
                        Continue to your dashboard.
                    </p>

                    <form className="loginForm">

                        <div className="loginField">

                            <label>Email</label>

                            <input
                                type="email"
                                placeholder="you@example.com"
                            />

                        </div>

                        <div className="loginField">

                            <label>Password</label>

                            <input
                                type="password"
                                placeholder="••••••••"
                            />

                        </div>

                        <button className="loginButton">
                            Sign In
                        </button>

                    </form>

                </div>

            </section>

        </main>
    );
}