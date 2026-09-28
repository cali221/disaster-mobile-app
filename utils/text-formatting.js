// function for capitalizing the first letter of a string
export function capitalizeFirstLetter(str){ 
  const firstLetter = str[0]
  const capitalizedStr = firstLetter.toUpperCase() + str.slice(1);
  return capitalizedStr;
}