import "./supportcall.css";

export default function SupportCall() {
  return (
    <div className="cta">
      <h2>Need Immediate Assistance?</h2>

      <p>
        Our support team is ready to help you with any questions or issues you
        may have.
      </p>

      <div className="ctabuttons">
        <button className="ctabutton secondary">
          Email Us
        </button>

        <button className="ctabutton primary">
          Call Now
        </button>
      </div>
    </div>
  );
}