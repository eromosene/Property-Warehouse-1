const tabs = document.querySelectorAll(".hm-tabs button");

tabs.forEach(tab => {
  
  tab.addEventListener("click", () => {
    
    tabs.forEach(btn => btn.classList.remove("active"));
    
    tab.classList.add("active");
    
  });
  
});