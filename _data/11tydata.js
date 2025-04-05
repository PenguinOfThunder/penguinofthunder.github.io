let data = {
  date: "Last Modified",
};

if (process.env.NODE_ENV === "production") {
  data.date = "git Last Modified";
}

export default data;
