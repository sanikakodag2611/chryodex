// src/menu-items/index.js
import chartsMaps from "./charts-maps";
import formComponents from "./forms";
import navigation from "./navigation";
import other from "./other";
import pages from "./pages";
import tableComponents from "./tables";
import uiComponents from "./ui-components";
import userFormMenu from "./userform";
import yearitems from "./years";
import departments from "./departments";
import designations from "./designations";
import reports from "./reports";
import countrystates from "./countrystates";
import company from "./company";
import products from "./products";
import empolyee from "./empolyee";
import excelfiels from "./excelfiels"; 

// Get designationId from sessionStorage
const designationId = sessionStorage.getItem("designation_id");
const isSalesman = designationId === "8";

// Define menu items based on designationId
const menuItems = {
  items: isSalesman
    ? [navigation, pages, excelfiels, empolyee]
    : [
     
        navigation, 
        pages,  
        reports,
        company,
        empolyee,
        products,
        excelfiels,
        yearitems,
        departments,
        designations,
        countrystates,
        
      ],
};

export default menuItems;