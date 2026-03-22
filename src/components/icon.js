/**
 * icon.js — Course icon map (WEB)
 * require() → ES module imports (Vite does not support require)
 */

import mathIcon     from "../../assets/math.png";
import economicIcon from "../../assets/economic.png";
import travelIcon   from "../../assets/travel.png";
import readingIcon  from "../../assets/reading.png";
import personIcon   from "../../assets/person.png";
import quillIcon    from "../../assets/quill-pen.png";
import listeningIcon from "../../assets/listening.png";
import bookIcon     from "../../assets/book.png";
import letterIcon   from "../../assets/letter.png";
import scienceIcon  from "../../assets/science.png";
import defaultIcon  from "../assets/iconoEdusupernovaSinFondo.png";

const iconMap = {
  // A Levels / General
  "math.png":     mathIcon,
  "economic.png": economicIcon,
  "travel.png":   travelIcon,

  // TOEFL / IELTS / English
  "reading.png":  readingIcon,
  "person.png":   personIcon,
  "quill-pen.png": quillIcon,
  "listening.png": listeningIcon,
  "book.png":     bookIcon,
  "letter.png":   letterIcon,

  // ACT / Science
  "science.png":  scienceIcon,

  // Default fallback
  "default":      defaultIcon,
  "default.png":  defaultIcon,
};

export default iconMap;