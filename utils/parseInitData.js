import queryString from "query-string";
export const parseInitData = (initData) => {
  try {
    const parsed = queryString.parse(initData);
    const keys = Object.keys(parsed);
    const init_data = keys.filter((key) => key.length > 50)[0];
    return init_data;
  } catch (error) {
    console.error(error);
    return "";
  }
};
