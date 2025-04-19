export const onlyNumber = (text:string) => {
  let result = text.replace(/\D/g, '');
  return result
}
