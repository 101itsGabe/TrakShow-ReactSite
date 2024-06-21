const baseString = "https://api.tvmaze.com/";
const epString = "/episodes";
const showsString = "/search/shows?q=";
const singleShow = "shows/";


//getSearch, getEps

export async function getSearch(s, pageNum) {
  try {
    if(s == ""){
      let response;
      if(pageNum == 0){
        response = await fetch("https://api.tvmaze.com/shows")
      }
      else{
      response = await fetch("https://api.tvmaze.com/shows?page=" + pageNum);
      }
      const result = await response.json();
      return result;
    }
    else{
    const response = await fetch(baseString + showsString + s);
    const result = await response.json();
    return result;
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    return null; // Or handle the error appropriately
  }
}




export async function getShow(s){
  if(s != null){
  const response = await fetch(baseString + singleShow + s);
    const result = await response.json();
    //console.log(result);
    return result;
  }
}



export async function getEps(s){
  try{
  if(s != null){
  const response = await fetch(baseString + "shows/" + s + "/episodes");
  const result = await response.json();
  return result;
  }
  }
  catch(error){
    console.error("Error fetching data:", error);
  }
}
