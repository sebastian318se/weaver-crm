import type { LucideIcon } from "lucide-react";
import "./supportbox.css";

type SupportProps = {
  icon: LucideIcon;
  title: string;
  value?: string;
  emptyMessage: string;
  additionalInfo: string;
};

export default function SupportBox({
  icon: Icon,
  title,
  value,
  emptyMessage,
  additionalInfo,
}: SupportProps) {

  return (
    <div className="supportitem">

      
      <div className="supportitemsection">
      
        <div className="icon">
          <Icon size={35} />
        </div>

        <div className="supportcontent">
          <span className="upline">{title}</span>

          {value ? (
            <div className="downlinecontent">
              <span>{value}</span>
            </div>
          ) : (
            <div className="downline">
              <span>{emptyMessage}</span>
            </div>
          )}

          <div className="downline">
            <span>{additionalInfo}</span>
          </div>
      
        </div>
    
      </div>
    
    </div>
  );
}