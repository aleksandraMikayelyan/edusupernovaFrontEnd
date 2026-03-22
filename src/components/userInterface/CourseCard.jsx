/**
 * CourseCard.jsx — Subject / course selector card (WEB) — redesigned 2026
 *
 * Dark hover state: card lifts + teal border appears
 * Icon in a soft teal bubble, course name editorial serif
 */

import iconMap from "../icon.js";

const BRAND = "#0a5f6e"; const SERIF = "Newsreader, Georgia, serif";

const CourseCard = ({ course, onPress }) => (
  <button
    onClick={onPress}
    style={{
      width:"100%", textAlign:"left",
      background:"#fff", borderRadius:18,
      padding:"20px 18px", border:"1.5px solid #E2EBF0",
      boxShadow:"0 2px 8px rgba(0,0,0,0.04)",
      cursor:"pointer", display:"flex", flexDirection:"column",
      transition:"all 0.2s ease",
    }}
    onMouseEnter={e => {
      e.currentTarget.style.boxShadow="0 8px 24px rgba(10,95,110,0.12)";
      e.currentTarget.style.borderColor=BRAND;
      e.currentTarget.style.transform="translateY(-3px)";
    }}
    onMouseLeave={e => {
      e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,0.04)";
      e.currentTarget.style.borderColor="#E2EBF0";
      e.currentTarget.style.transform="none";
    }}
  >
    {/* Icon bubble */}
    <div style={{ width:48, height:48, borderRadius:14,
      background:"#e8f7f9", border:"1px solid rgba(28,148,167,0.15)",
      display:"flex", alignItems:"center", justifyContent:"center", marginBottom:14 }}>
      <img
        src={iconMap[course.icon] || iconMap["default"]}
        alt={course.coursename}
        style={{ width:28, height:28, objectFit:"contain" }}
      />
    </div>

    <p style={{ fontFamily:SERIF, fontSize:14, fontWeight:700,
      color:"#0F172A", lineHeight:1.3, margin:0 }}>
      {course.coursename}
    </p>

    {course.unitCount != null && (
      <p style={{ fontFamily:SERIF, fontSize:12, color:"#94A3B8", marginTop:4 }}>
        {course.unitCount} {course.unitCount === 1 ? "unit" : "units"}
      </p>
    )}
  </button>
);

export default CourseCard;